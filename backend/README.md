# Kasir Toko Bangunan - Backend API

Backend API untuk sistem kasir toko bangunan yang dibangun dengan Node.js, Express, TypeScript, dan PostgreSQL.

## 🚀 Features

- **RESTful API** dengan Express.js dan TypeScript
- **Database** PostgreSQL dengan Prisma ORM
- **Manajemen Produk** dengan multiple units dan kategori
- **Sistem Transaksi** dengan update stok otomatis
- **Manajemen Utang** customer dengan tracking pembayaran
- **Analytics Dashboard** dengan laporan penjualan
- **Error Handling** yang konsisten
- **Request Validation** dengan Zod
- **Rate Limiting** dan Security headers

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm atau yarn

## 🛠️ Installation

1. **Clone dan masuk ke folder backend**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` dan sesuaikan dengan konfigurasi Anda:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/kasir_db"
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Setup database**

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Products

- `GET /api/products` - Ambil semua produk dengan filter
- `GET /api/products/:id` - Detail produk
- `POST /api/products` - Tambah produk baru
- `PUT /api/products/:id` - Update produk
- `DELETE /api/products/:id` - Hapus produk

### Transactions

- `GET /api/transactions` - Riwayat transaksi
- `GET /api/transactions/:id` - Detail transaksi
- `POST /api/transactions` - Buat transaksi baru
- `POST /api/transactions/:id/receipt` - Generate receipt PDF

### Stock Management

- `GET /api/stock` - Laporan stok
- `GET /api/stock/low-stock` - Produk stok menipis
- `POST /api/stock/adjustment` - Penyesuaian stok
- `GET /api/stock/movements` - Riwayat pergerakan stok

### Debt Management

- `GET /api/debt` - Daftar utang customer
- `GET /api/debt/customer/:name` - Utang per customer
- `POST /api/debt/payment` - Pembayaran utang
- `GET /api/debt/summary` - Ringkasan total utang

### Analytics

- `GET /api/analytics/dashboard` - Data dashboard
- `GET /api/analytics/sales` - Laporan penjualan
- `GET /api/analytics/products` - Analitik produk
- `GET /api/analytics/revenue` - Analitik pendapatan

## 🧪 Development Scripts

```bash
npm run dev          # Start development server dengan hot reload
npm run build        # Build untuk production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema ke database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database dengan data awal
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🏗️ Project Structure

```
src/
├── middleware/         # Express middlewares
│   ├── errorHandler.ts # Error handling
│   └── requestLogger.ts # Request logging
├── routes/            # API route handlers
│   ├── products.ts    # Products endpoints
│   ├── transactions.ts # Transactions endpoints
│   ├── stock.ts       # Stock management endpoints
│   ├── debt.ts        # Debt management endpoints
│   ├── analytics.ts   # Analytics endpoints
│   └── index.ts       # Routes index
├── services/          # Business logic services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── server.ts          # Express server setup
```

## 🛡️ Security Features

- **Helmet.js** untuk security headers
- **Rate limiting** untuk mencegah abuse
- **CORS** dikonfigurasi untuk frontend
- **Input validation** dengan Zod
- **Error handling** yang tidak expose sensitive data

## 📊 Database Schema

- **products** - Data produk dengan stok
- **product_units** - Multiple units per produk
- **categories** - Kategori produk
- **suppliers** - Data supplier
- **transactions** - Data transaksi penjualan
- **transaction_items** - Item dalam transaksi
- **debt_records** - Catatan utang customer
- **stock_movements** - Riwayat pergerakan stok

## 🚀 Deployment

1. **Build aplikasi**

   ```bash
   npm run build
   ```

2. **Setup environment production**

   ```bash
   NODE_ENV=production
   DATABASE_URL="postgresql://..."
   ```

3. **Run migrations**

   ```bash
   npm run db:migrate
   ```

4. **Start server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📝 License

This project is licensed under the MIT License.
