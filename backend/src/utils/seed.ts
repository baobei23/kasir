import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database...");

  // Hapus data existing (opsional, hati-hati di production)
  await prisma.debtPayment.deleteMany();
  await prisma.debtRecord.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.productUnit.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  // await prisma.dailySales.deleteMany();

  // 1. Buat Kategori
  console.log("📂 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Semen",
        description: "Semen berbagai merk dan ukuran",
      },
    }),
    prisma.category.create({
      data: {
        name: "Besi",
        description: "Besi beton, besi hollow, dan besi lainnya",
      },
    }),
    prisma.category.create({
      data: {
        name: "Cat",
        description: "Cat tembok, cat kayu, dan cat besi",
      },
    }),
    prisma.category.create({
      data: {
        name: "Hardware",
        description: "Paku, sekrup, dan peralatan kecil lainnya",
      },
    }),
    prisma.category.create({
      data: {
        name: "Kawat",
        description: "Kawat berbagai ukuran dan jenis",
      },
    }),
    prisma.category.create({
      data: {
        name: "Peralatan",
        description: "Peralatan konstruksi dan tools",
      },
    }),
  ]);

  // 2. Buat Supplier
  console.log("🏢 Creating suppliers...");
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: "PT Semen Indonesia",
        contact: "021-123456789",
        address: "Jakarta Pusat",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "CV Logam Jaya",
        contact: "021-987654321",
        address: "Bekasi",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "UD Besi Kuat",
        contact: "021-555666777",
        address: "Tangerang",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Toko Cat Indah",
        contact: "021-444333222",
        address: "Depok",
      },
    }),
  ]);

  // 3. Buat Produk dengan Units
  console.log("📦 Creating products with units...");

  // Semen Tiga Roda
  const semenProduct = await prisma.product.create({
    data: {
      name: "Semen Tiga Roda 40kg",
      sku: "SMN-TR-40",
      categoryId: categories[0].id, // Semen
      cost: 58000,
      stock: 25,
      minStock: 10,
      baseUnit: "sak",
      supplierId: suppliers[0].id,
      description: "Semen berkualitas tinggi untuk konstruksi",
      units: {
        create: [
          {
            name: "sak",
            price: 65000,
            conversionRate: 1,
            isBaseUnit: true,
          },
          {
            name: "kg",
            price: 1625,
            conversionRate: 0.025,
          },
        ],
      },
    },
  });

  // Besi Beton
  const besiProduct = await prisma.product.create({
    data: {
      name: "Besi Beton 10mm 12m",
      sku: "BSI-BT-10",
      categoryId: categories[1].id, // Besi
      cost: 75000,
      stock: 15,
      minStock: 5,
      baseUnit: "batang",
      supplierId: suppliers[1].id,
      description: "Besi beton ulir diameter 10mm panjang 12 meter",
      units: {
        create: [
          {
            name: "batang",
            price: 85000,
            conversionRate: 1,
            isBaseUnit: true,
          },
        ],
      },
    },
  });

  // Cat Tembok
  await prisma.product.create({
    data: {
      name: "Cat Tembok Dulux 5kg",
      sku: "CAT-DLX-5",
      categoryId: categories[2].id, // Cat
      cost: 165000,
      stock: 8,
      minStock: 3,
      baseUnit: "kaleng",
      supplierId: suppliers[3].id,
      description: "Cat tembok berkualitas tinggi tahan lama",
      units: {
        create: [
          {
            name: "kaleng",
            price: 185000,
            conversionRate: 1,
            isBaseUnit: true,
          },
        ],
      },
    },
  });

  // Paku
  await prisma.product.create({
    data: {
      name: "Paku 5cm",
      sku: "PAK-5CM",
      categoryId: categories[3].id, // Hardware
      cost: 20000,
      stock: 12,
      minStock: 3,
      baseUnit: "kg",
      supplierId: suppliers[2].id,
      description: "Paku besi galvanis panjang 5cm",
      units: {
        create: [
          {
            name: "kg",
            price: 25000,
            conversionRate: 1,
            isBaseUnit: true,
          },
          {
            name: "1/4 kg",
            price: 6500,
            conversionRate: 0.25,
          },
          {
            name: "1/2 kg",
            price: 13000,
            conversionRate: 0.5,
          },
        ],
      },
    },
  });

  // Kawat BWG
  await prisma.product.create({
    data: {
      name: "Kawat BWG 16",
      sku: "KWT-BWG16",
      categoryId: categories[4].id, // Kawat
      cost: 32000,
      stock: 20,
      minStock: 5,
      baseUnit: "kg",
      supplierId: suppliers[2].id,
      description: "Kawat besi galvanis BWG 16",
      units: {
        create: [
          {
            name: "kg",
            price: 35000,
            conversionRate: 1,
            isBaseUnit: true,
          },
        ],
      },
    },
  });

  // Kuas Cat
  const kuasProduct = await prisma.product.create({
    data: {
      name: "Kuas Cat 3 inch",
      sku: "KUS-3IN",
      categoryId: categories[5].id, // Peralatan
      cost: 12000,
      stock: 30,
      minStock: 10,
      baseUnit: "buah",
      supplierId: suppliers[3].id,
      description: "Kuas cat berkualitas bulu halus",
      units: {
        create: [
          {
            name: "buah",
            price: 15000,
            conversionRate: 1,
            isBaseUnit: true,
          },
        ],
      },
    },
  });

  // 4. Buat Transaksi Sample
  console.log("🧾 Creating sample transactions...");

  const transaction1 = await prisma.transaction.create({
    data: {
      receiptNumber: "TXN-20241225-001",
      customerName: "Pak Budi",
      customerAddress: "Jl. Merdeka No. 123",
      totalAmount: 150000,
      paymentAmount: 150000,
      changeAmount: 0,
      isPaid: true,
      items: {
        create: [
          {
            productId: semenProduct.id,
            unitId: (await prisma.productUnit.findFirst({
              where: { productId: semenProduct.id, isBaseUnit: true },
            }))!.id,
            quantity: 2,
            unitPrice: 65000,
            totalPrice: 130000,
          },
          {
            productId: kuasProduct.id,
            unitId: (await prisma.productUnit.findFirst({
              where: { productId: kuasProduct.id, isBaseUnit: true },
            }))!.id,
            quantity: 1,
            unitPrice: 15000,
            totalPrice: 15000,
          },
        ],
      },
    },
  });

  // Transaksi dengan utang
  const transaction2 = await prisma.transaction.create({
    data: {
      receiptNumber: "TXN-20241225-002",
      customerName: "Ibu Sari",
      customerAddress: "Jl. Sudirman No. 45",
      totalAmount: 270000,
      paymentAmount: 100000,
      changeAmount: 0,
      isPaid: false,
      items: {
        create: [
          {
            productId: besiProduct.id,
            unitId: (await prisma.productUnit.findFirst({
              where: { productId: besiProduct.id, isBaseUnit: true },
            }))!.id,
            quantity: 3,
            unitPrice: 85000,
            totalPrice: 255000,
          },
          {
            productId: kuasProduct.id,
            unitId: (await prisma.productUnit.findFirst({
              where: { productId: kuasProduct.id, isBaseUnit: true },
            }))!.id,
            quantity: 1,
            unitPrice: 15000,
            totalPrice: 15000,
          },
        ],
      },
    },
  });

  // 5. Buat Debt Record untuk transaksi belum lunas
  await prisma.debtRecord.create({
    data: {
      transactionId: transaction2.id,
      customerName: "Ibu Sari",
      totalDebt: 270000,
      paidAmount: 100000,
      remainingDebt: 170000,
      status: "PARTIAL",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari dari sekarang
    },
  });

  // 6. Buat Stock Movements
  console.log("📊 Creating stock movements...");

  // Stock keluar dari transaksi
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: semenProduct.id,
        type: "OUT",
        quantity: -2,
        referenceId: transaction1.id,
        notes: "Penjualan kepada Pak Budi",
      },
      {
        productId: kuasProduct.id,
        type: "OUT",
        quantity: -1,
        referenceId: transaction1.id,
        notes: "Penjualan kepada Pak Budi",
      },
      {
        productId: besiProduct.id,
        type: "OUT",
        quantity: -3,
        referenceId: transaction2.id,
        notes: "Penjualan kepada Ibu Sari",
      },
      {
        productId: kuasProduct.id,
        type: "OUT",
        quantity: -1,
        referenceId: transaction2.id,
        notes: "Penjualan kepada Ibu Sari",
      },
    ],
  });

  // Update stok produk berdasarkan penjualan
  await prisma.product.update({
    where: { id: semenProduct.id },
    data: { stock: { decrement: 2 } },
  });

  await prisma.product.update({
    where: { id: besiProduct.id },
    data: { stock: { decrement: 3 } },
  });

  await prisma.product.update({
    where: { id: kuasProduct.id },
    data: { stock: { decrement: 2 } },
  });

  // 7. Buat Daily Sales Record (Skip for now until we generate client)
  console.log("📈 Creating daily sales...");
  // Will be enabled after Prisma client generation

  console.log("✅ Seeding completed successfully!");
  console.log(`📊 Created:`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${suppliers.length} suppliers`);
  console.log(`   - 6 products with multiple units`);
  console.log(`   - 2 sample transactions`);
  console.log(`   - 1 debt record`);
  console.log(`   - Stock movements`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
