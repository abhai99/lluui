import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface Page {
  id: string;
  title: string;
  isActive: boolean;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'pages' | 'subscriptions' | 'settings'>('pages');
  const [pages, setPages] = useState<Page[]>([
    { id: '1', title: 'Today\'s Predictions', isActive: true },
    { id: '2', title: 'VIP Insights', isActive: true },
    { id: '3', title: 'Historical Data', isActive: true },
  ]);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'pages', label: 'Manage Pages', icon: Settings },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'settings', label: 'Analytics', icon: BarChart3 },
  ];

  const handleAddPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: 'New Page',
      isActive: true
    };
    setPages([...pages, newPage]);
    setEditingPage(newPage.id);
    setEditTitle('New Page');
    toast.success('Page added! Click to edit the title.');
  };

  const handleSavePage = (id: string) => {
    setPages(pages.map(p => p.id === id ? { ...p, title: editTitle } : p));
    setEditingPage(null);
    toast.success('Page updated successfully!');
  };

  const handleDeletePage = (id: string) => {
    setPages(pages.filter(p => p.id !== id));
    toast.success('Page deleted!');
  };

  const handleTogglePage = (id: string) => {
    setPages(pages.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  // Mock data for users
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', subscribed: true, plan: 'monthly' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', subscribed: false, plan: null },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', subscribed: true, plan: 'weekly' },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your application, users, and subscriptions.</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'gradient-primary text-primary-foreground shadow-soft'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-card rounded-2xl border border-border shadow-soft p-6 animate-slide-up">
            {activeTab === 'pages' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">Page Management</h2>
                  <Button onClick={handleAddPage}>
                    <Plus className="w-4 h-4" />
                    Add Page
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {pages.map((page) => (
                    <div 
                      key={page.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
                    >
                      {editingPage === page.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${page.isActive ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                          <span className="font-medium text-foreground">{page.title}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {editingPage === page.id ? (
                          <Button size="sm" onClick={() => handleSavePage(page.id)}>
                            <Save className="w-4 h-4" />
                            Save
                          </Button>
                        ) : (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleTogglePage(page.id)}
                              title={page.isActive ? 'Hide' : 'Show'}
                            >
                              <Eye className={`w-4 h-4 ${page.isActive ? 'text-green-500' : 'text-muted-foreground'}`} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditingPage(page.id);
                                setEditTitle(page.title);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeletePage(page.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">User Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border/50">
                          <td className="py-4 px-4 text-foreground">{user.name}</td>
                          <td className="py-4 px-4 text-muted-foreground">{user.email}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.subscribed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {user.subscribed ? 'Active' : 'Free'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-foreground capitalize">{user.plan || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">Subscription Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Revenue', value: '₹45,000', change: '+12%' },
                    { label: 'Active Subscriptions', value: '156', change: '+8%' },
                    { label: 'New This Month', value: '24', change: '+15%' },
                  ].map((stat, index) => (
                    <div key={index} className="p-6 rounded-xl bg-secondary/50 border border-border">
                      <p className="text-muted-foreground mb-1">{stat.label}</p>
                      <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change} vs last month</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Page Views (Today)', value: '1,234' },
                    { label: 'Unique Visitors', value: '456' },
                    { label: 'Avg. Session Duration', value: '4m 32s' },
                    { label: 'Bounce Rate', value: '32%' },
                  ].map((stat, index) => (
                    <div key={index} className="p-6 rounded-xl bg-secondary/50 border border-border">
                      <p className="text-muted-foreground mb-1">{stat.label}</p>
                      <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
