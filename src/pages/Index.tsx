
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Package, BarChart3, AlertTriangle, TrendingUp, Users, Calculator, CreditCard } from 'lucide-react';
import CashierInterface from '@/components/CashierInterface';
import ProductManagement from '@/components/ProductManagement';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import StockManagement from '@/components/StockManagement';
import DebtManagement from '@/components/DebtManagement';

const Index = () => {
  const [activeTab, setActiveTab] = useState('cashier');

  // Mock data for the overview cards
  const todayStats = {
    totalSales: 2450000,
    transactions: 18,
    averageTransaction: 136111,
    lowStockItems: 5,
    totalDebt: 1250000 // Added debt tracking
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Toko Bangunan - POS System</h1>
            <p className="text-gray-600">Sistem Kasir & Manajemen Stok Terintegrasi</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-700 border-green-300">
              Status: Online
            </Badge>
            <div className="text-right">
              <p className="text-sm text-gray-600">Hari ini</p>
              <p className="text-xl font-semibold text-blue-600">{formatCurrency(todayStats.totalSales)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Overview */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Penjualan Hari Ini</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(todayStats.totalSales)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transaksi</p>
                  <p className="text-2xl font-bold text-green-600">{todayStats.transactions}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rata-rata Transaksi</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(todayStats.averageTransaction)}</p>
                </div>
                <Calculator className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stok Menipis</p>
                  <p className="text-2xl font-bold text-red-600">{todayStats.lowStockItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Utang</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(todayStats.totalDebt)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="cashier" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Kasir
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produk
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Stok
            </TabsTrigger>
            <TabsTrigger value="debt" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Utang
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analitik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cashier">
            <CashierInterface />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="stock">
            <StockManagement />
          </TabsContent>

          <TabsContent value="debt">
            <DebtManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
