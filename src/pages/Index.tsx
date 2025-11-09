import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReleaseForm from '@/components/ReleaseForm';

type UserRole = 'artist' | 'label' | 'admin';

interface User {
  name: string;
  role: UserRole;
  avatar: string;
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user] = useState<User>({
    name: 'Андрей Волков',
    role: 'artist',
    avatar: 'АВ'
  });
  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [releases, setReleases] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReleases = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/ecf92456-8cb7-4e96-95df-8d2cb1169b51?user_id=1');
      const data = await response.json();
      setReleases(data.releases || []);
    } catch (error) {
      console.error('Error fetching releases:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/923d3404-15f4-4387-a81b-97a203f1dfb9?user_id=1');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
    fetchAnalytics();
  }, []);

  const getStreamsByRelease = (releaseId: number) => {
    if (!analytics?.analytics) return 0;
    return analytics.analytics
      .filter((a: any) => a.release_id === releaseId)
      .reduce((sum: number, a: any) => sum + a.streams, 0);
  };

  const roleLabels = {
    artist: 'Артист',
    label: 'Лейбл',
    admin: 'Администратор'
  };

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
    { id: 'releases', label: 'Релизы', icon: 'Music' },
    { id: 'analytics', label: 'Аналитика', icon: 'TrendingUp' },
    { id: 'catalog', label: 'Каталог', icon: 'Library' },
    { id: 'finance', label: 'Финансы', icon: 'Wallet' },
    { id: 'profile', label: 'Профиль', icon: 'User' },
    ...(user.role === 'admin' ? [{ id: 'admin', label: 'Админка', icon: 'Settings' }] : []),
    { id: 'support', label: 'Поддержка', icon: 'MessageCircle' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Добро пожаловать, {user.name}!</h1>
          <p className="text-muted-foreground mt-1">Вот статистика ваших релизов за последние 7 дней</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowReleaseForm(true)}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Новый релиз
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Прослушиваний</CardTitle>
            <Icon name="Headphones" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : (analytics?.summary?.total_streams || 0).toLocaleString()}</div>
            <p className="text-xs text-secondary flex items-center mt-1">
              <Icon name="TrendingUp" className="mr-1 h-3 w-3" />
              +12.5% за неделю
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Доход</CardTitle>
            <Icon name="DollarSign" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : `$${(analytics?.summary?.balance || 0).toFixed(2)}`}</div>
            <p className="text-xs text-secondary flex items-center mt-1">
              <Icon name="TrendingUp" className="mr-1 h-3 w-3" />
              +8.3% за неделю
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Релизов</CardTitle>
            <Icon name="Disc3" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{releases.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {releases.filter(r => r.status === 'published').length} опубликовано, 
              {releases.filter(r => r.status === 'pending').length} на модерации
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Платформы</CardTitle>
            <Icon name="Radio" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Spotify, Apple Music, Yandex...</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle>Прослушивания по дням</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: '3 ноя', streams: 22100, percent: 100 },
                { date: '2 ноя', streams: 18650, percent: 84 },
                { date: '1 ноя', streams: 15420, percent: 70 },
                { date: '31 окт', streams: 14200, percent: 64 },
                { date: '30 окт', streams: 13800, percent: 62 }
              ].map((day, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{day.date}</span>
                    <span className="text-muted-foreground">{day.streams.toLocaleString()}</span>
                  </div>
                  <Progress value={day.percent} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle>Топ платформы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { platform: 'Spotify', streams: 22100, share: 39, color: 'bg-green-500' },
                { platform: 'Apple Music', streams: 18200, share: 32, color: 'bg-red-500' },
                { platform: 'Yandex Music', streams: 12400, share: 22, color: 'bg-yellow-500' },
                { platform: 'YouTube Music', streams: 3470, share: 7, color: 'bg-accent' }
              ].map((platform, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{platform.platform}</span>
                      <span className="text-muted-foreground">{platform.streams.toLocaleString()}</span>
                    </div>
                    <Progress value={platform.share} className="h-1.5" />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{platform.share}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReleases = () => {
    const getFilteredReleases = (status?: string) => {
      if (!status || status === 'all') return releases;
      return releases.filter(r => r.status === status);
    };

    const ReleaseList = ({ status }: { status?: string }) => {
      const filtered = getFilteredReleases(status);
      
      if (filtered.length === 0) {
        return (
          <div className="text-center py-12">
            <Icon name="Music" className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Релизов пока нет</p>
          </div>
        );
      }

      return filtered.map((release, i) => {
        const releaseDate = release.release_date ? new Date(release.release_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Не указано';
        const typeLabel = release.release_type === 'single' ? 'Сингл' : release.release_type === 'album' ? 'Альбом' : 'EP';
        const statusLabel = release.status === 'published' ? 'Опубликован' : release.status === 'pending' ? 'На модерации' : 'Черновик';
        
        return (
          <Card key={release.id} className="hover-scale cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="Music" className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{release.title}</h3>
                  <Badge variant={release.status === 'published' ? 'default' : release.status === 'pending' ? 'secondary' : 'outline'}>
                    {statusLabel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{release.artist_name} • {typeLabel} • {release.genre}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="Calendar" className="h-3 w-3" />
                    {releaseDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Disc3" className="h-3 w-3" />
                    {release.track_count} треков
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Icon name="MoreVertical" className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        );
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Релизы</h1>
            <p className="text-muted-foreground mt-1">Управляйте своими треками и альбомами</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowReleaseForm(true)}>
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Загрузить релиз
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Все релизы ({releases.length})</TabsTrigger>
            <TabsTrigger value="published">Опубликованные ({releases.filter(r => r.status === 'published').length})</TabsTrigger>
            <TabsTrigger value="pending">На модерации ({releases.filter(r => r.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="draft">Черновики ({releases.filter(r => r.status === 'draft').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <ReleaseList />
          </TabsContent>
          
          <TabsContent value="published" className="space-y-4 mt-6">
            <ReleaseList status="published" />
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4 mt-6">
            <ReleaseList status="pending" />
          </TabsContent>
          
          <TabsContent value="draft" className="space-y-4 mt-6">
            <ReleaseList status="draft" />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Аналитика</h1>
        <p className="text-muted-foreground mt-1">Детальная статистика прослушиваний</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Всего прослушиваний</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">70,270</div>
            <p className="text-xs text-secondary flex items-center mt-1">
              <Icon name="TrendingUp" className="mr-1 h-3 w-3" />
              +12.5% за месяц
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Уникальные слушатели</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18,420</div>
            <p className="text-xs text-secondary flex items-center mt-1">
              <Icon name="TrendingUp" className="mr-1 h-3 w-3" />
              +8.7% за месяц
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground mt-1">На основе 1,240 оценок</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>География прослушиваний</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { country: '🇷🇺 Россия', streams: 42180, percent: 60 },
              { country: '🇺🇸 США', streams: 10541, percent: 15 },
              { country: '🇺🇦 Украина', streams: 7027, percent: 10 },
              { country: '🇰🇿 Казахстан', streams: 4920, percent: 7 },
              { country: '🇧🇾 Беларусь', streams: 3514, percent: 5 },
              { country: '🌍 Другие', streams: 2088, percent: 3 }
            ].map((country, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{country.country}</span>
                  <span className="text-muted-foreground">{country.streams.toLocaleString()} ({country.percent}%)</span>
                </div>
                <Progress value={country.percent} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinance = () => {
    const financials = analytics?.financials || [];
    const pending = financials.filter((f: any) => f.status === 'pending');
    const pendingAmount = pending.reduce((sum: number, f: any) => sum + f.amount, 0);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Финансы</h1>
          <p className="text-muted-foreground mt-1">Отслеживайте доходы и выплаты</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Баланс</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${(analytics?.summary?.balance || 0).toFixed(2)}</div>
              <Button size="sm" className="mt-3 w-full">Вывести средства</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Выплачено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(analytics?.summary?.total_paid || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">За все время</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ожидается</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">${pendingAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">В ожидании</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>История транзакций</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Транзакций пока нет
                </div>
              ) : (
                financials.map((transaction: any, i: number) => {
                  const startDate = new Date(transaction.period_start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
                  const endDate = new Date(transaction.period_end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
                  const statusLabel = transaction.status === 'paid' ? 'Выплачено' : transaction.status === 'processing' ? 'В обработке' : 'Ожидается';
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="DollarSign" className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.platform}</p>
                          <p className="text-sm text-muted-foreground">{startDate} - {endDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                        <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'} className="mt-1">
                          {statusLabel}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
          </div>
        </CardContent>
      </Card>
    </div>
    );
  };

  const renderAdmin = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Администрирование</h1>
        <p className="text-muted-foreground mt-1">Управление пользователями и контентом</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12,453</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Артистов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">10,234</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Лейблов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2,180</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">На модерации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">39</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние релизы на модерации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: 'Первый альбом', artist: 'Андрей Волков', date: '1 фев 2025', type: 'album' },
              { title: 'Night Dreams', artist: 'DJ Alex', date: '5 ноя 2025', type: 'single' },
              { title: 'Summer Collection', artist: 'Various Artists', date: '10 ноя 2025', type: 'ep' }
            ].map((release, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded flex items-center justify-center">
                    <Icon name="Music" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{release.title}</p>
                    <p className="text-sm text-muted-foreground">{release.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="default">Одобрить</Button>
                  <Button size="sm" variant="outline">Отклонить</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'releases':
        return renderReleases();
      case 'analytics':
        return renderAnalytics();
      case 'finance':
        return renderFinance();
      case 'admin':
        return renderAdmin();
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon name="Construction" className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Раздел в разработке</h2>
              <p className="text-muted-foreground">Этот раздел скоро будет доступен</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r bg-sidebar flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Music" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">MusicFlow</h2>
              <p className="text-xs text-sidebar-foreground/60">Distribution</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon name={item.icon as any} className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors">
            <Avatar>
              <AvatarFallback className="bg-primary text-white">{user.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleLabels[user.role]}</p>
            </div>
            <Icon name="ChevronRight" className="h-4 w-4 text-sidebar-foreground/40" />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <ReleaseForm 
        open={showReleaseForm} 
        onOpenChange={setShowReleaseForm}
        onSuccess={() => {
          fetchReleases();
          fetchAnalytics();
        }}
      />
    </div>
  );
};

export default Index;