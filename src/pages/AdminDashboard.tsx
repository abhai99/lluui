import { useState } from 'react';
import { Users, DollarSign, TrendingUp, Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export const AdminDashboard = () => {
    const [prices, setPrices] = useState({
        weekly: 99,
        monthly: 299,
    });

    const [isLoading, setIsLoading] = useState(false);

    const handlePriceChange = (plan: 'weekly' | 'monthly', value: string) => {
        const numValue = parseInt(value) || 0;
        setPrices((prev) => ({ ...prev, [plan]: numValue }));
    };

    const savePrices = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
        toast.success('Prices updated successfully');
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gradient-primary">
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your subscription plans and view performance.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.open('/', '_blank')}>
                        View Live Site
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 space-y-2 border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-2 text-primary">
                            <Users className="w-5 h-5" />
                            <span className="font-semibold">Total Subscribers</span>
                        </div>
                        <p className="text-4xl font-bold">1,248</p>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </Card>

                    <Card className="p-6 space-y-2 border-accent/20 bg-accent/5">
                        <div className="flex items-center gap-2 text-accent-foreground">
                            <DollarSign className="w-5 h-5" />
                            <span className="font-semibold">Total Revenue</span>
                        </div>
                        <p className="text-4xl font-bold">₹4.2L</p>
                        <p className="text-xs text-muted-foreground">+8% from last month</p>
                    </Card>

                    <Card className="p-6 space-y-2 border-purple-500/20 bg-purple-500/5">
                        <div className="flex items-center gap-2 text-purple-500">
                            <TrendingUp className="w-5 h-5" />
                            <span className="font-semibold">Conversion Rate</span>
                        </div>
                        <p className="text-4xl font-bold">3.2%</p>
                        <p className="text-xs text-muted-foreground">+0.4% from last month</p>
                    </Card>
                </div>

                {/* Plan Management */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-8">
                        <div className="flex items-center gap-2 mb-6 text-foreground">
                            <Settings className="w-5 h-5" />
                            <h2 className="text-xl font-bold">Plan Configuration</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Weekly Plan Price (₹)</label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="number"
                                        value={prices.weekly}
                                        onChange={(e) => handlePriceChange('weekly', e.target.value)}
                                        className="max-w-[200px]"
                                    />
                                    <span className="text-sm text-muted-foreground">Current: ₹99</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Monthly Plan Price (₹)</label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="number"
                                        value={prices.monthly}
                                        onChange={(e) => handlePriceChange('monthly', e.target.value)}
                                        className="max-w-[200px]"
                                    />
                                    <span className="text-sm text-muted-foreground">Current: ₹299</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button onClick={savePrices} disabled={isLoading} className="w-full md:w-auto">
                                    {isLoading ? 'Saving...' : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Recent Orders Preview */}
                    <Card className="p-8">
                        <h2 className="text-xl font-bold mb-6">Recent Transactions</h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div>
                                        <p className="font-medium">User #{1000 + i}</p>
                                        <p className="text-xs text-muted-foreground">Weekly Plan</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-500">+₹99</p>
                                        <p className="text-xs text-muted-foreground">Just now</p>
                                    </div>
                                </div>
                            ))}
                            <div className="text-center pt-2">
                                <Button variant="link" className="text-muted-foreground">View All Transactions</Button>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};
