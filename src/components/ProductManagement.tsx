
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Edit, Trash2, Package, X } from 'lucide-react';

interface ProductUnit {
  id: string;
  name: string;
  price: number;
  conversionRate: number; // How many of this unit equals 1 base unit
  isBaseUnit: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  cost: number;
  stock: number;
  minStock: number;
  baseUnit: string;
  units: ProductUnit[];
  supplier: string;
  description: string;
}

const ProductManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProductUnits, setNewProductUnits] = useState<Omit<ProductUnit, 'id'>[]>([
    { name: '', price: 0, conversionRate: 1, isBaseUnit: true }
  ]);
  
  // Mock products data with units
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Semen Tiga Roda 40kg',
      sku: 'SMN-TR-40',
      category: 'Semen',
      cost: 58000,
      stock: 25,
      minStock: 10,
      baseUnit: 'sak',
      units: [
        { id: '1a', name: 'sak', price: 65000, conversionRate: 1, isBaseUnit: true },
        { id: '1b', name: 'kg', price: 1625, conversionRate: 0.025, isBaseUnit: false } // 1 kg = 0.025 sak
      ],
      supplier: 'PT Semen Indonesia',
      description: 'Semen berkualitas tinggi untuk konstruksi'
    },
    {
      id: '2',
      name: 'Besi Beton 10mm 12m',
      sku: 'BSI-BT-10',
      category: 'Besi',
      cost: 75000,
      stock: 15,
      minStock: 5,
      baseUnit: 'batang',
      units: [
        { id: '2a', name: 'batang', price: 85000, conversionRate: 1, isBaseUnit: true }
      ],
      supplier: 'CV Logam Jaya',
      description: 'Besi beton ulir diameter 10mm panjang 12 meter'
    },
    {
      id: '3',
      name: 'Paku 5cm',
      sku: 'PAK-5CM',
      category: 'Hardware',
      cost: 20000,
      stock: 12,
      minStock: 3,
      baseUnit: 'kg',
      units: [
        { id: '3a', name: 'kg', price: 25000, conversionRate: 1, isBaseUnit: true },
        { id: '3b', name: '1/4 kg', price: 6500, conversionRate: 0.25, isBaseUnit: false },
        { id: '3c', name: '1/2 kg', price: 13000, conversionRate: 0.5, isBaseUnit: false }
      ],
      supplier: 'UD Besi Kuat',
      description: 'Paku besi galvanis panjang 5cm'
    }
  ]);

  const categories = ['all', 'Semen', 'Besi', 'Cat', 'Hardware', 'Kawat', 'Peralatan'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return 'danger';
    if (stock <= minStock * 2) return 'warning';
    return 'normal';
  };

  const getStockBadge = (stock: number, minStock: number) => {
    const status = getStockStatus(stock, minStock);
    if (status === 'danger') return <Badge variant="destructive">Stok Habis</Badge>;
    if (status === 'warning') return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Stok Menipis</Badge>;
    return <Badge variant="default" className="bg-green-100 text-green-800">Stok Aman</Badge>;
  };

  const addNewUnit = () => {
    setNewProductUnits([...newProductUnits, { name: '', price: 0, conversionRate: 1, isBaseUnit: false }]);
  };

  const removeUnit = (index: number) => {
    if (newProductUnits.length > 1) {
      setNewProductUnits(newProductUnits.filter((_, i) => i !== index));
    }
  };

  const updateUnit = (index: number, field: keyof Omit<ProductUnit, 'id'>, value: any) => {
    const updatedUnits = [...newProductUnits];
    updatedUnits[index] = { ...updatedUnits[index], [field]: value };
    setNewProductUnits(updatedUnits);
  };

  const resetForm = () => {
    setNewProductUnits([{ name: '', price: 0, conversionRate: 1, isBaseUnit: true }]);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari nama produk atau SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'Semua Kategori' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input id="name" placeholder="Masukkan nama produk" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="Kode produk unik" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Harga Beli</Label>
                  <Input id="cost" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok Awal</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stok</Label>
                  <Input id="minStock" type="number" placeholder="0" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input id="supplier" placeholder="Nama supplier" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" placeholder="Deskripsi produk..." />
                </div>
              </div>

              {/* Units Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Satuan & Harga</Label>
                  <Button type="button" onClick={addNewUnit} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Satuan
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {newProductUnits.map((unit, index) => (
                    <div key={index} className="grid grid-cols-4 gap-3 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label className="text-sm">Nama Satuan</Label>
                        <Input
                          placeholder="kg, sak, meter, dll"
                          value={unit.name}
                          onChange={(e) => updateUnit(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Harga Jual</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={unit.price}
                          onChange={(e) => updateUnit(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Konversi ke Satuan Dasar</Label>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="1"
                          value={unit.conversionRate}
                          onChange={(e) => updateUnit(index, 'conversionRate', parseFloat(e.target.value) || 1)}
                          disabled={unit.isBaseUnit}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={unit.isBaseUnit}
                            onChange={(e) => updateUnit(index, 'isBaseUnit', e.target.checked)}
                            className="rounded"
                          />
                          <Label className="text-sm">Satuan Dasar</Label>
                        </div>
                        {!unit.isBaseUnit && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeUnit(index)}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                  <strong>Contoh:</strong> Untuk semen yang dijual per sak (40kg) dan eceran per kg:
                  <br />- Satuan Dasar: "sak" dengan konversi 1 (stok dihitung dalam sak)
                  <br />- Satuan Eceran: "kg" dengan konversi 0.025 (1 kg = 0.025 sak)
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Batal
              </Button>
              <Button onClick={resetForm}>
                Simpan Produk
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                </div>
                <Badge variant="outline">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Units & Prices */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Satuan & Harga:</p>
                <div className="space-y-1">
                  {product.units.map((unit) => (
                    <div key={unit.id} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        {unit.name}
                        {unit.isBaseUnit && <Badge variant="secondary" className="text-xs">Dasar</Badge>}
                      </span>
                      <span className="font-semibold text-blue-600">{formatCurrency(unit.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Harga Beli</p>
                  <p className="font-semibold">{formatCurrency(product.cost)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Stok</p>
                  <p className="font-semibold">{product.stock} {product.baseUnit}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {getStockBadge(product.stock, product.minStock)}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <p><strong>Supplier:</strong> {product.supplier}</p>
                <p className="mt-1">{product.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak ada produk ditemukan</h3>
          <p className="text-gray-500">Coba ubah kata kunci pencarian atau tambah produk baru</p>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
