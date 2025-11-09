import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для получения аналитики прослушиваний и финансовых данных
    Args: event - dict с httpMethod, queryStringParameters
          context - объект с атрибутами request_id
    Returns: HTTP ответ с аналитическими данными
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        user_id = query_params.get('user_id', '1')
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT a.date, a.platform, a.country, SUM(a.streams) as streams "
                "FROM analytics a "
                "JOIN releases r ON a.release_id = r.id "
                "WHERE r.user_id = %s "
                "GROUP BY a.date, a.platform, a.country "
                "ORDER BY a.date DESC",
                (user_id,)
            )
            analytics_data = cur.fetchall()
            
            cur.execute(
                "SELECT f.*, r.title as release_title "
                "FROM financials f "
                "JOIN releases r ON f.release_id = r.id "
                "WHERE f.user_id = %s "
                "ORDER BY f.period_end DESC",
                (user_id,)
            )
            financials_data = cur.fetchall()
            
            cur.execute(
                "SELECT SUM(a.streams) as total_streams "
                "FROM analytics a "
                "JOIN releases r ON a.release_id = r.id "
                "WHERE r.user_id = %s",
                (user_id,)
            )
            total_streams = cur.fetchone()
            
            cur.execute(
                "SELECT SUM(f.amount) as total_balance "
                "FROM financials f "
                "WHERE f.user_id = %s AND f.status = %s",
                (user_id, 'processing')
            )
            balance = cur.fetchone()
            
            cur.execute(
                "SELECT SUM(f.amount) as total_paid "
                "FROM financials f "
                "WHERE f.user_id = %s AND f.status = %s",
                (user_id, 'paid')
            )
            paid = cur.fetchone()
        
        analytics_list = []
        for item in analytics_data:
            analytics_list.append({
                'date': item['date'].isoformat(),
                'platform': item['platform'],
                'country': item['country'],
                'streams': item['streams']
            })
        
        financials_list = []
        for item in financials_data:
            financials_list.append({
                'id': item['id'],
                'amount': float(item['amount']),
                'platform': item['platform'],
                'period_start': item['period_start'].isoformat(),
                'period_end': item['period_end'].isoformat(),
                'status': item['status'],
                'release_title': item['release_title']
            })
        
        result = {
            'analytics': analytics_list,
            'financials': financials_list,
            'summary': {
                'total_streams': total_streams['total_streams'] or 0,
                'balance': float(balance['total_balance'] or 0),
                'total_paid': float(paid['total_paid'] or 0)
            }
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()
