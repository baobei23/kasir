
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingDown, TrendingUp, RefreshCw, Package } from 'lucide-react';

interface StockAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  unit: string;
  category: string;
  supplier: string;
  lastReorder: string;
  reorderPoint: number;
  status: 'critical' | 'low' | 'reorder';
}

const StockManagement = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockAlert | null>(null);

  // Mock stock alerts data
  const stockAlerts: StockAlert[] = [
    {
      id: '1',
      productName: 'Semen Tiga Roda 40kg',
      currentStock: 3,
      minStock: 10,
      unit: 'sak',
      category: 'Semen',
      supplier: 'PT Semen Indonesia',
      lastReorder: '2024-01-15',
      reorderPoint: 15,
      status: 'critical'
    },
    {
      id: '2',
      productName: 'Cat Tembok Dulux 5kg',
      currentStock: 5,
      minStock: 5,
      unit: 'kaleng',
      category: 'Cat',
      supplier: 'PT Dulux Indonesia',
      lastReorder: '2024-01-20',
      reorderPoint: 8,
      status: 'reorder'
    },
    {
      id: '3',
      productName: 'Besi Beton 10mm 12m',
      currentStock: 7,
      minStock: 5,
      unit: 'batang',
      category: 'Besi',
      supplier: 'CV Logam Jaya',
      lastReorder: '2024-01-18',
      reorderPoint: 10,
      status: 'low'
    },
    {
      id: '4',
      productName: 'Paku 5cm',
      currentStock: 2,
      minStock: 3,
      unit: 'kg',
      category: 'Hardware',
      supplier: 'UD Besi Kuat',
      lastReorder: '2024-01-12',
      reorderPoint: 5,
      status: 'critical'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Kritis</Badge>;
      case 'low':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Rendah</Badge>;
      case 'reorder':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Perlu Pesan</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'low':
        return <TrendingDown className="h-4 w-4 text-yellow-500" />;
      case 'reorder':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
  };

  const filteredAlerts = stockAlerts.filter(alert => {
    if (selectedFilter === 'all') return true;
    return alert.status === selectedFilter;
  });

  const criticalCount = stockAlerts.filter(alert => alert.status === 'critical').length;
  const lowCount = stockAlerts.filter(alert => alert.status === 'low').length;
  const reorderCount = stockAlerts.filter(alert => alert.status === 'reorder').length;

  const handleRestock = (product: StockAlert) => {
    setSelectedProduct(product);
    setIsRestockDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stok Kritis</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stok Rendah</p>
                <p className="text-2xl font-bold text-yellow-600">{lowCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Perlu Pesan</p>
                <p className="text-2xl font-bold text-blue-600">{reorderCount}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alert</p>
                <p className="text-2xl font-bold text-gray-900">{stockAlerts.length}</p>
              </div>
              <Package className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Peringatan Stok</CardTitle>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="critical">Stok Kritis</SelectItem>
                <SelectItem value="low">Stok Rendah</SelectItem>
                <SelectItem value="reorder">Perlu Pesan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Stok Saat Ini</TableHead>
                <TableHead>Min. Stok</TableHead>
                <TableHead>Re-order Point</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(alert.status)}
                      <div>
                        <p className="font-medium">{alert.productName}</p>
                        <p className="text-sm text-gray-600">Terakhir pesan: {alert.lastReorder}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{alert.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${
                      alert.status === 'critical' ? 'text-red-600' : 
                      alert.status === 'low' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {alert.currentStock} {alert.unit}
                    </span>
                  </TableCell>
                  <TableCell>{alert.minStock} {alert.unit}</TableCell>
                  <TableCell>{alert.reorderPoint} {alert.unit}</TableCell>
                  <TableCell>{getStatusBadge(alert.status)}</TableCell>
                  <TableCell>{alert.supplier}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleRestock(alert)}
                    >
                      Restok
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak ada peringatan stok</h3>
              <p className="text-gray-500">Semua produk memiliki stok yang memadai</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restok Produk</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Produk</Label>
                <p className="font-medium">{selectedProduct.productName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stok Saat Ini</Label>
                  <p className="text-red-600 font-semibold">{selectedProduct.currentStock} {selectedProduct.unit}</p>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Stok</Label>
                  <p className="font-medium">{selectedProduct.minStock} {selectedProduct.unit}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restock-qty">Jumlah Restok</Label>
                <Input 
                  id="restock-qty" 
                  type="number" 
                  placeholder="0"
                  defaultValue={selectedProduct.reorderPoint}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input 
                  id="supplier" 
                  defaultValue={selectedProduct.supplier}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Input 
                  id="notes" 
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
                  Batal
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    // Here you would update the stock in the database
                    console.log('Restocking product:', selectedProduct.id);
                    setIsRestockDialogOpen(false);
                    setSelectedProduct(null);
                  }}
                >
                  Konfirmasi Restok
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManagement;
