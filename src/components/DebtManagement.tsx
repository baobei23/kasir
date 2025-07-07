
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, User, CreditCard, Calendar, CheckCircle } from 'lucide-react';

interface DebtTransaction {
  id: string;
  date: string;
  items: string;
  amount: number;
  isPaid: boolean;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalDebt: number;
  transactions: DebtTransaction[];
}

const DebtManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Mock data for customers with debt
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Budi Santoso',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 123',
      totalDebt: 750000,
      transactions: [
        {
          id: 'T001',
          date: '2024-06-28',
          items: 'Semen 5 Sak, Cat Tembok 2 Kaleng',
          amount: 500000,
          isPaid: false
        },
        {
          id: 'T002',
          date: '2024-06-25',
          items: 'Paku 1 Dus, Kuas 3 Buah',
          amount: 250000,
          isPaid: false
        }
      ]
    },
    {
      id: '2',
      name: 'Sari Dewi',
      phone: '081987654321',
      address: 'Jl. Sudirman No. 45',
      totalDebt: 350000,
      transactions: [
        {
          id: 'T003',
          date: '2024-06-27',
          items: 'Genteng 50 Buah',
          amount: 350000,
          isPaid: false
        }
      ]
    },
    {
      id: '3',
      name: 'Ahmad Rahman',
      phone: '081555666777',
      address: 'Jl. Pahlawan No. 78',
      totalDebt: 150000,
      transactions: [
        {
          id: 'T004',
          date: '2024-06-26',
          items: 'Besi Beton 10mm - 5 Batang',
          amount: 150000,
          isPaid: false
        }
      ]
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const totalDebt = customers.reduce((sum, customer) => sum + customer.totalDebt, 0);

  const handlePayment = (customerId: string, transactionId: string, amount: number) => {
    setCustomers(prevCustomers => 
      prevCustomers.map(customer => {
        if (customer.id === customerId) {
          const updatedTransactions = customer.transactions.map(transaction => {
            if (transaction.id === transactionId) {
              return { ...transaction, isPaid: true };
            }
            return transaction;
          });
          
          const newTotalDebt = customer.totalDebt - amount;
          
          return {
            ...customer,
            transactions: updatedTransactions,
            totalDebt: newTotalDebt
          };
        }
        return customer;
      })
    );
    
    setSelectedCustomer(null);
    setPaymentAmount('');
  };

  const handlePartialPayment = (customerId: string, amount: number) => {
    const paymentValue = parseInt(paymentAmount);
    if (paymentValue > 0 && paymentValue <= amount) {
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => {
          if (customer.id === customerId) {
            return {
              ...customer,
              totalDebt: customer.totalDebt - paymentValue
            };
          }
          return customer;
        })
      );
      
      setSelectedCustomer(null);
      setPaymentAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Utang</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pelanggan Berutang</p>
                <p className="text-2xl font-bold text-orange-600">{customers.length}</p>
              </div>
              <User className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Utang</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(customers.length > 0 ? totalDebt / customers.length : 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Manajemen Utang Pelanggan
          </CardTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari pelanggan berdasarkan nama atau nomor telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Total Utang</TableHead>
                <TableHead>Jumlah Transaksi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="font-semibold">
                      {formatCurrency(customer.totalDebt)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {customer.transactions.filter(t => !t.isPaid).length} belum lunas
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          Detail Utang
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detail Utang - {customer.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Nama Pelanggan</Label>
                              <p className="font-medium">{customer.name}</p>
                            </div>
                            <div>
                              <Label>Nomor Telepon</Label>
                              <p className="font-medium">{customer.phone}</p>
                            </div>
                            <div className="col-span-2">
                              <Label>Alamat</Label>
                              <p className="font-medium">{customer.address}</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-lg font-semibold">Riwayat Transaksi Belum Lunas</Label>
                            <div className="mt-2 space-y-2">
                              {customer.transactions.filter(t => !t.isPaid).map((transaction) => (
                                <div key={transaction.id} className="border rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">#{transaction.id}</Badge>
                                        <span className="text-sm text-gray-500">
                                          {formatDate(transaction.date)}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm">{transaction.items}</p>
                                      <p className="mt-1 font-semibold text-red-600">
                                        {formatCurrency(transaction.amount)}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handlePayment(customer.id, transaction.id, transaction.amount)}
                                      className="ml-2"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Lunasi
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <Label>Pembayaran Sebagian</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                type="number"
                                placeholder="Jumlah pembayaran"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                              />
                              <Button
                                onClick={() => handlePartialPayment(customer.id, customer.totalDebt)}
                                disabled={!paymentAmount || parseInt(paymentAmount) <= 0}
                              >
                                Bayar Sebagian
                              </Button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Total utang: {formatCurrency(customer.totalDebt)}
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada pelanggan yang ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtManagement;
