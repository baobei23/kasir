
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, ShoppingCart, Target, Brain, Lightbulb } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Mock analytics data
  const salesData = [
    { name: 'Sen', value: 850000, transactions: 12 },
    { name: 'Sel', value: 1200000, transactions: 18 },
    { name: 'Rab', value: 950000, transactions: 14 },
    { name: 'Kam', value: 1450000, transactions: 22 },
    { name: 'Jum', value: 1800000, transactions: 28 },
    { name: 'Sab', value: 2100000, transactions: 32 },
    { name: 'Min', value: 1650000, transactions: 25 }
  ];

  const categoryData = [
    { name: 'Semen', value: 35, sales: 4200000, color: '#3B82F6' },
    { name: 'Cat', value: 25, sales: 3000000, color: '#10B981' },
    { name: 'Besi', value: 20, sales: 2400000, color: '#F59E0B' },
    { name: 'Hardware', value: 12, sales: 1440000, color: '#EF4444' },
    { name: 'Lainnya', value: 8, sales: 960000, color: '#8B5CF6' }
  ];

  const topProducts = [
    { name: 'Semen Tiga Roda 40kg', sold: 125, revenue: 8125000, growth: 15.2 },
    { name: 'Cat Tembok Dulux 5kg', sold: 45, revenue: 8325000, growth: 8.7 },
    { name: 'Besi Beton 10mm 12m', sold: 32, revenue: 2720000, growth: -3.2 },
    { name: 'Paku 5cm', sold: 28, revenue: 700000, growth: 22.1 },
    { name: 'Kawat BWG 16', sold: 24, revenue: 840000, growth: 5.8 }
  ];

  // AI Insights - Simple market basket analysis simulation
  const aiInsights = [
    {
      type: 'association',
      title: 'Produk yang Sering Dibeli Bersamaan',
      insight: 'Pelanggan yang membeli Cat Tembok memiliki 68% kemungkinan juga membeli Kuas Cat',
      confidence: 68,
      icon: <ShoppingCart className="h-5 w-5 text-blue-600" />
    },
    {
      type: 'prediction',
      title: 'Prediksi Permintaan Minggu Depan',
      insight: 'Berdasarkan tren historis, penjualan Semen diperkirakan naik 12% minggu depan',
      confidence: 82,
      icon: <TrendingUp className="h-5 w-5 text-green-600" />
    },
    {
      type: 'recommendation',
      title: 'Rekomendasi Stocking',
      insight: 'Produk fast-moving: fokus pada Semen dan Cat. Slow-moving: kurangi stok Hardware lama',
      confidence: 75,
      icon: <Target className="h-5 w-5 text-purple-600" />
    },
    {
      type: 'trend',
      title: 'Analisis Musiman',
      insight: 'Penjualan Cat cenderung meningkat 25% di akhir tahun (musim renovasi)',
      confidence: 89,
      icon: <Lightbulb className="h-5 w-5 text-yellow-600" />
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotalRevenue = () => {
    return salesData.reduce((sum, day) => sum + day.value, 0);
  };

  const calculateAverageTransaction = () => {
    const totalRevenue = calculateTotalRevenue();
    const totalTransactions = salesData.reduce((sum, day) => sum + day.transactions, 0);
    return totalRevenue / totalTransactions;
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Analitik & AI Insights</h2>
          <p className="text-gray-600">Dashboard analisis penjualan dengan bantuan AI</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Hari Terakhir</SelectItem>
            <SelectItem value="30d">30 Hari Terakhir</SelectItem>
            <SelectItem value="90d">3 Bulan Terakhir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Penjualan</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotalRevenue())}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Transaksi</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateAverageTransaction())}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produk Terlaris</p>
                <p className="text-2xl font-bold text-purple-600">{topProducts[0]?.sold || 0}</p>
                <p className="text-xs text-gray-500">{topProducts[0]?.name}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Confidence</p>
                <p className="text-2xl font-bold text-indigo-600">84%</p>
                <p className="text-xs text-gray-500">Akurasi Prediksi</p>
              </div>
              <Brain className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Penjualan Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value/1000}K`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Penjualan']}
                  labelFormatter={(label) => `Hari: ${label}`}
                />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kategori Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({name, value}) => `${name} ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, 'Persentase']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Insights & Rekomendasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  {insight.icon}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{insight.insight}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Confidence: {insight.confidence}%
                      </Badge>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.sold} unit terjual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                  <div className="flex items-center gap-1">
                    {product.growth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.growth > 0 ? '+' : ''}{product.growth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
