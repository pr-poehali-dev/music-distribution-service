import json
import os
from datetime import datetime
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления релизами - получение списка, создание, обновление статуса
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP ответ с данными релизов или результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            user_id = query_params.get('user_id', '1')
            status_filter = query_params.get('status')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if status_filter:
                    cur.execute(
                        "SELECT r.*, COUNT(t.id) as track_count FROM releases r "
                        "LEFT JOIN tracks t ON r.id = t.release_id "
                        "WHERE r.user_id = %s AND r.status = %s "
                        "GROUP BY r.id ORDER BY r.created_at DESC",
                        (user_id, status_filter)
                    )
                else:
                    cur.execute(
                        "SELECT r.*, COUNT(t.id) as track_count FROM releases r "
                        "LEFT JOIN tracks t ON r.id = t.release_id "
                        "WHERE r.user_id = %s "
                        "GROUP BY r.id ORDER BY r.created_at DESC",
                        (user_id,)
                    )
                
                releases = cur.fetchall()
                
                result = []
                for release in releases:
                    result.append({
                        'id': release['id'],
                        'title': release['title'],
                        'artist_name': release['artist_name'],
                        'release_type': release['release_type'],
                        'status': release['status'],
                        'release_date': release['release_date'].isoformat() if release['release_date'] else None,
                        'genre': release['genre'],
                        'track_count': release['track_count'],
                        'cover_url': release['cover_url'],
                        'upc': release['upc']
                    })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'releases': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id', 1)
            
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO releases (user_id, title, artist_name, release_type, genre, release_date, status) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                    (
                        user_id,
                        body_data['title'],
                        body_data['artist_name'],
                        body_data['release_type'],
                        body_data.get('genre', 'Pop'),
                        body_data.get('release_date'),
                        'draft'
                    )
                )
                release_id = cur.fetchone()[0]
                conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': release_id, 'status': 'created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            release_id = body_data.get('id')
            
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE releases SET status = %s WHERE id = %s",
                    (body_data['status'], release_id)
                )
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'status': 'updated'}),
                'isBase64Encoded': False
            }
    
    finally:
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
