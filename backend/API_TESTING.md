# API Testing Guide - Kasir Toko Bangunan

## Setup dan Menjalankan Server

1. **Pastikan database PostgreSQL berjalan** dan tabel sudah dibuat:

   ```bash
   npm run db:push
   npm run db:seed
   ```

2. **Jalankan server development**:
   ```bash
   npm run dev
   ```
   Server akan berjalan di `http://localhost:3001`

## API Endpoints yang Sudah Implementasi

### 🏥 Health Check

```bash
curl http://localhost:3001/api/health
```

### 📦 Products API

#### 1. Get All Products (dengan pagination, search, filter)

```bash
# Basic - ambil semua produk
curl "http://localhost:3001/api/products"

# Dengan pagination
curl "http://localhost:3001/api/products?page=1&limit=5"

# Search produk
curl "http://localhost:3001/api/products?search=semen"

# Filter by category
curl "http://localhost:3001/api/products?categoryId=<category_id>"

# Filter produk stok menipis
curl "http://localhost:3001/api/products?lowStock=true"

# Sorting
curl "http://localhost:3001/api/products?sortBy=name&sortOrder=desc"
```

#### 2. Get Product by ID

```bash
curl "http://localhost:3001/api/products/<product_id>"
```

#### 3. Get Product Statistics

```bash
curl "http://localhost:3001/api/products/stats"
```

#### 4. Get Low Stock Products

```bash
curl "http://localhost:3001/api/products/low-stock"
```

#### 5. Create New Product

```bash
curl -X POST "http://localhost:3001/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Semen Portland 50kg",
    "sku": "SMN-PRT-50",
    "categoryId": "<category_id>",
    "cost": 65000,
    "stock": 100,
    "minStock": 10,
    "baseUnit": "sak",
    "description": "Semen portland berkualitas tinggi",
    "units": [
      {
        "name": "sak",
        "price": 70000,
        "conversionRate": 1,
        "isBaseUnit": true
      },
      {
        "name": "kg",
        "price": 1400,
        "conversionRate": 0.02,
        "isBaseUnit": false
      }
    ]
  }'
```

#### 6. Update Product

```bash
curl -X PUT "http://localhost:3001/api/products/<product_id>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "stock": 150
  }'
```

#### 7. Delete Product

```bash
curl -X DELETE "http://localhost:3001/api/products/<product_id>"
```

#### 8. Adjust Stock

```bash
curl -X POST "http://localhost:3001/api/products/stock/adjust" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<product_id>",
    "quantity": 50,
    "type": "IN",
    "notes": "Stock masuk dari supplier"
  }'
```

### 🏷️ Categories API

#### 1. Get All Categories

```bash
curl "http://localhost:3001/api/categories"
```

#### 2. Get Category by ID

```bash
curl "http://localhost:3001/api/categories/<category_id>"
```

#### 3. Create New Category

```bash
curl -X POST "http://localhost:3001/api/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kategori Baru",
    "description": "Deskripsi kategori"
  }'
```

#### 4. Update Category

```bash
curl -X PUT "http://localhost:3001/api/categories/<category_id>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nama Kategori Updated"
  }'
```

#### 5. Delete Category

```bash
curl -X DELETE "http://localhost:3001/api/categories/<category_id>"
```

## Sample Data yang Sudah Ada

Setelah menjalankan `npm run db:seed`, database akan memiliki:

### Categories:

- Semen
- Besi & Baja
- Cat & Finishing
- Hardware & Fittings
- Kawat & Mesh
- Peralatan & Tools

### Products:

- Semen Gresik 50kg (dengan unit: sak, kg)
- Besi Beton Ulir 12mm (dengan unit: batang, kg)
- Cat Tembok Dulux 5kg (dengan unit: kaleng, liter)
- Paku 5cm (dengan unit: kg, pcs)
- Kawat BWG 16 (dengan unit: roll, meter)
- Gergaji Kayu (dengan unit: pcs)

## Response Format

Semua API response menggunakan format yang konsisten:

### Success Response:

```json
{
  "success": true,
  "message": "Deskripsi operasi",
  "data": {...},
  "pagination": {...}, // jika ada
  "timestamp": "2025-01-07T10:30:00.000Z"
}
```

### Error Response:

```json
{
  "success": false,
  "message": "Error message",
  "details": "Detail error",
  "timestamp": "2025-01-07T10:30:00.000Z"
}
```

## Tips Testing

1. **Install jq** untuk format JSON yang rapi:

   ```bash
   # macOS
   brew install jq

   # Kemudian gunakan:
   curl "http://localhost:3001/api/products" | jq
   ```

2. **Gunakan Postman atau Thunder Client** untuk testing yang lebih mudah

3. **Cek logs server** untuk melihat request yang masuk

4. **Database Explorer**: Gunakan `npm run db:studio` untuk melihat data di browser

## Troubleshooting

- **Port conflict**: Ganti PORT di `.env` jika 3001 sudah digunakan
- **Database error**: Pastikan PostgreSQL berjalan dan connection string benar
- **CORS error**: Frontend harus berjalan di port yang dikonfigurasi di CORS settings

## Next Steps

API Products sudah lengkap. Selanjutnya akan implementasi:

- API Transactions (kasir interface)
- API Stock Management
- API Debt Management
- API Analytics Dashboard
