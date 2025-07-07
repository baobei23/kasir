
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Minus, Trash2, Calculator, CreditCard, Banknote, User, MapPin, FileText } from 'lucide-react';

interface ProductUnit {
  id: string;
  name: string;
  price: number;
  conversionRate: number;
  isBaseUnit: boolean;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  selectedUnit: ProductUnit;
  quantity: number;
  category: string;
}

interface CustomerInfo {
  name: string;
  address: string;
}

const CashierInterface = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    address: ''
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);

  // Mock products data with units
  const products = [
    {
      id: '1',
      name: 'Semen Tiga Roda 40kg',
      category: 'Semen',
      stock: 25,
      baseUnit: 'sak',
      units: [
        { id: '1a', name: 'sak', price: 65000, conversionRate: 1, isBaseUnit: true },
        { id: '1b', name: 'kg', price: 1625, conversionRate: 0.025, isBaseUnit: false }
      ]
    },
    {
      id: '2',
      name: 'Besi Beton 10mm 12m',
      category: 'Besi',
      stock: 15,
      baseUnit: 'batang',
      units: [
        { id: '2a', name: 'batang', price: 85000, conversionRate: 1, isBaseUnit: true }
      ]
    },
    {
      id: '3',
      name: 'Cat Tembok Dulux 5kg',
      category: 'Cat',
      stock: 8,
      baseUnit: 'kaleng',
      units: [
        { id: '3a', name: 'kaleng', price: 185000, conversionRate: 1, isBaseUnit: true }
      ]
    },
    {
      id: '4',
      name: 'Paku 5cm',
      category: 'Hardware',
      stock: 12,
      baseUnit: 'kg',
      units: [
        { id: '4a', name: 'kg', price: 25000, conversionRate: 1, isBaseUnit: true },
        { id: '4b', name: '1/4 kg', price: 6500, conversionRate: 0.25, isBaseUnit: false },
        { id: '4c', name: '1/2 kg', price: 13000, conversionRate: 0.5, isBaseUnit: false }
      ]
    },
    {
      id: '5',
      name: 'Kawat BWG 16',
      category: 'Kawat',
      stock: 20,
      baseUnit: 'kg',
      units: [
        { id: '5a', name: 'kg', price: 35000, conversionRate: 1, isBaseUnit: true }
      ]
    },
    {
      id: '6',
      name: 'Kuas Cat 3 inch',
      category: 'Peralatan',
      stock: 30,
      baseUnit: 'buah',
      units: [
        { id: '6a', name: 'buah', price: 15000, conversionRate: 1, isBaseUnit: true }
      ]
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openUnitDialog = (product: any) => {
    setSelectedProduct(product);
    setIsUnitDialogOpen(true);
  };

  const addToCart = (product: any, selectedUnit: ProductUnit, quantity: number = 1) => {
    const cartItemId = `${product.id}_${selectedUnit.id}`;
    const existingItem = cart.find(item => item.id === cartItemId);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === cartItemId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        name: product.name,
        selectedUnit,
        quantity,
        category: product.category
      };
      setCart([...cart, newItem]);
    }
    
    setIsUnitDialogOpen(false);
    setSelectedProduct(null);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.selectedUnit.price * item.quantity), 0);
  };

  const calculateChange = () => {
    const paid = parseFloat(paymentAmount) || 0;
    const total = calculateTotal();
    return paid - total;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const generateReceiptNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.getTime().toString().slice(-4);
    return `TXN-${dateStr}-${timeStr}`;
  };

  const printReceipt = (isPaid: boolean) => {
    const receiptData = {
      receiptNumber: generateReceiptNumber(),
      timestamp: new Date(),
      customer: customerInfo,
      items: cart,
      total: calculateTotal(),
      payment: parseFloat(paymentAmount) || 0,
      change: calculateChange(),
      isPaid,
      receiptType: isPaid ? 'NOTA PUTIH - LUNAS' : 'NOTA KUNING - BELUM LUNAS'
    };

    console.log('Mencetak nota:', receiptData);
    alert(`${receiptData.receiptType} berhasil dicetak!\nNo: ${receiptData.receiptNumber}\nPelanggan: ${customerInfo.name}`);
  };

  const handleCheckout = (isPaid: boolean = true) => {
    if (cart.length === 0) return;
    
    const transactionData = {
      receiptNumber: generateReceiptNumber(),
      customer: customerInfo,
      items: cart,
      total: calculateTotal(),
      payment: parseFloat(paymentAmount) || 0,
      change: calculateChange(),
      isPaid,
      timestamp: new Date()
    };
    
    console.log('Processing transaction:', transactionData);
    printReceipt(isPaid);
    
    // Clear form after transaction
    setCart([]);
    setPaymentAmount('');
    setCustomerInfo({ name: '', address: '' });
  };

  const canProcessPaidTransaction = () => {
    return cart.length > 0 && paymentAmount && parseFloat(paymentAmount) >= calculateTotal() && customerInfo.name.trim();
  };

  const canProcessUnpaidTransaction = () => {
    return cart.length > 0 && customerInfo.name.trim();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Search & Grid */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari produk atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openUnitDialog(product)}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                  <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
                  
                  {/* Show available units and prices */}
                  <div className="space-y-1">
                    {product.units.map((unit) => (
                      <div key={unit.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">{unit.name}</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(unit.price)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Stok: {product.stock} {product.baseUnit}</span>
                    <Button size="sm" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Unit Selection Dialog */}
      <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Satuan - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Pilih satuan yang ingin ditambahkan ke keranjang:</p>
            <div className="space-y-2">
              {selectedProduct?.units.map((unit: ProductUnit) => (
                <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{unit.name}</span>
                      {unit.isBaseUnit && <Badge variant="secondary" className="text-xs">Dasar</Badge>}
                    </div>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(unit.price)}</span>
                  </div>
                  <Button onClick={() => addToCart(selectedProduct, unit)} size="sm">
                    Tambah
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shopping Cart & Checkout */}
      <div className="space-y-4">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Data Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium">
                Nama Pelanggan *
              </Label>
              <Input
                id="customerName"
                placeholder="Masukkan nama pelanggan"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress" className="text-sm font-medium">
                <MapPin className="h-4 w-4 inline mr-1" />
                Alamat
              </Label>
              <Input
                id="customerAddress"
                placeholder="Masukkan alamat pelanggan"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shopping Cart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Keranjang Belanja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Keranjang kosong</p>
            ) : (
              <>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">
                          {formatCurrency(item.selectedUnit.price)}/{item.selectedUnit.name}
                          {!item.selectedUnit.isBaseUnit && (
                            <Badge variant="outline" className="ml-2 text-xs">Eceran</Badge>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 p-0 ml-2"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Uang Dibayar</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="text-right"
                    />
                  </div>
                  
                  {paymentAmount && parseFloat(paymentAmount) >= calculateTotal() && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Kembalian:</span>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(calculateChange())}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Receipt Buttons */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        disabled={cart.length === 0}
                        onClick={() => {
                          setCart([]);
                          setPaymentAmount('');
                          setCustomerInfo({ name: '', address: '' });
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!canProcessPaidTransaction()}
                        onClick={() => handleCheckout(true)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Nota Putih
                      </Button>
                    </div>
                    
                    <Button
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                      disabled={!canProcessUnpaidTransaction()}
                      onClick={() => handleCheckout(false)}
                    >
                      <Banknote className="h-4 w-4 mr-2" />
                      Nota Kuning (Belum Bayar)
                    </Button>
                  </div>

                  {/* Info Messages */}
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white border-2 border-green-500 rounded"></div>
                      <span>Nota Putih: Transaksi lunas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                      <span>Nota Kuning: Belum lunas (hutang)</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashierInterface;
