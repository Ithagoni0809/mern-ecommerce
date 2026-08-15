/**
 * @file server/seed_clean.js
 * Database Reset & High-Quality Real-World Indian Data Seeder
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');
const Payment = require('./models/Payment');

async function seedCleanDatabase() {
  console.log('===============================================================');
  console.log('🧹 RESETTING DATABASE & SEEDING REAL-WORLD INDIAN DATA');
  console.log('===============================================================\n');

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is missing in .env');

    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB Atlas');

    // 1. CLEAR ALL PREVIOUS CLUTTER DATA
    console.log('\n🗑️ Clearing old collections and test clutter...');
    await Order.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Payment.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await User.deleteMany({});
    console.log('✓ All previous orders, products, carts, and users wiped clean.');

    // 2. SEED CLEAN REAL-WORLD USER ACCOUNTS
    console.log('\n👥 Seeding clean, authentic Indian accounts...');
    const usersToCreate = [
      // 1. Platform Admin
      {
        name: 'Rajesh Sharma',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        phone: '+91 98765 00001',
        isEmailVerified: true,
        addresses: [{
          label: 'Platform HQ',
          fullName: 'Rajesh Sharma',
          phone: '+91 98765 00001',
          houseNo: 'Plot 10',
          street: 'HITEC City Road',
          villageOrLocality: 'Madhapur',
          mandalOrTehsil: 'Serilingampally Mandal',
          district: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          landmark: 'Near Cyber Towers',
          country: 'India',
          isDefault: true,
        }],
      },

      // 2. Regional Merchant Sellers
      {
        name: 'Suresh Reddy',
        storeName: 'Apex Electronics & Tech Hub',
        email: 'seller@example.com',
        password: 'password123',
        role: 'seller',
        phone: '+91 98765 11112',
        isEmailVerified: true,
        addresses: [{
          label: 'Hyderabad Warehouse Outlet',
          fullName: 'Apex Electronics & Tech Hub',
          phone: '+91 98765 11112',
          houseNo: 'Plot 12, Phase II',
          street: 'Industrial Corridor Road',
          villageOrLocality: 'Cherlapally Industrial Area',
          mandalOrTehsil: 'Ghatkesar Mandal',
          district: 'Medchal-Malkajgiri',
          state: 'Telangana',
          pincode: '501301',
          landmark: 'Opp. Industrial Phase II Gate',
          country: 'India',
          isDefault: true,
        }],
      },
      {
        name: 'Vikram Rao',
        storeName: 'Silicon Lifestyle & Footwear',
        email: 'seller.sf@example.com',
        password: 'password123',
        role: 'seller',
        phone: '+91 98765 22223',
        isEmailVerified: true,
        addresses: [{
          label: 'Bengaluru Warehouse Outlet',
          fullName: 'Silicon Lifestyle & Footwear',
          phone: '+91 98765 22223',
          houseNo: 'Building 45',
          street: '100 Feet Road',
          villageOrLocality: 'Indiranagar',
          mandalOrTehsil: 'Bengaluru East',
          district: 'Bengaluru Urban',
          state: 'Karnataka',
          pincode: '560038',
          landmark: 'Near Indiranagar Metro Station',
          country: 'India',
          isDefault: true,
        }],
      },
      {
        name: 'Amit Deshmukh',
        storeName: 'Royal Audio & Acoustics',
        email: 'seller.texas@example.com',
        password: 'password123',
        role: 'seller',
        phone: '+91 98765 33334',
        isEmailVerified: true,
        addresses: [{
          label: 'Mumbai Warehouse Outlet',
          fullName: 'Royal Audio & Acoustics',
          phone: '+91 98765 33334',
          houseNo: 'Gala 10',
          street: 'MIDC Central Road',
          villageOrLocality: 'Andheri East',
          mandalOrTehsil: 'Andheri Taluk',
          district: 'Mumbai Suburban',
          state: 'Maharashtra',
          pincode: '400069',
          landmark: 'Opp. Seepz Main Gate',
          country: 'India',
          isDefault: true,
        }],
      },

      // 3. Courier Delivery Partner
      {
        name: 'Kiran Kumar',
        email: 'delivery@example.com',
        password: 'password123',
        role: 'delivery',
        phone: '+91 98765 44445',
        isEmailVerified: true,
        addresses: [{
          label: 'Hyderabad Regional Hub',
          fullName: 'Swift Courier Station',
          phone: '+91 98765 44445',
          houseNo: 'Hub 3',
          street: 'Outer Ring Road',
          villageOrLocality: 'Gachibowli Hub',
          mandalOrTehsil: 'Serilingampally',
          district: 'Hyderabad',
          state: 'Telangana',
          pincode: '500032',
          landmark: 'Near ORR Junction',
          country: 'India',
          isDefault: true,
        }],
      },

      // 4. Sample Customers
      {
        name: 'Ramesh Kumar',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
        phone: '+91 98765 99999',
        isEmailVerified: true,
        addresses: [{
          label: 'Home (Native Village)',
          fullName: 'Ramesh Kumar',
          phone: '+91 98765 99999',
          houseNo: 'H.No. 3-84/A',
          street: 'Gram Panchayat Main Road',
          villageOrLocality: 'Rampur Village',
          mandalOrTehsil: 'Ghatkesar Mandal',
          district: 'Medchal-Malkajgiri',
          state: 'Telangana',
          pincode: '501301',
          landmark: 'Near Gram Panchayat Office & Hanuman Temple',
          country: 'India',
          isDefault: true,
        }],
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'password123',
        role: 'user',
        phone: '+91 98765 88888',
        isEmailVerified: true,
        addresses: [{
          label: 'Apartment Doorstep',
          fullName: 'Priya Sharma',
          phone: '+91 98765 88888',
          houseNo: 'Flat 402, Oakwood Block',
          street: 'Green Glen Layout',
          villageOrLocality: 'Bellandur Locality',
          mandalOrTehsil: 'Bengaluru South',
          district: 'Bengaluru Urban',
          state: 'Karnataka',
          pincode: '560103',
          landmark: 'Near Bellandur Central Mall',
          country: 'India',
          isDefault: true,
        }],
      },
    ];

    const createdUsers = {};
    for (const u of usersToCreate) {
      const created = await User.create(u);
      createdUsers[u.email] = created._id;
      console.log(`  ✓ Created [${u.role.toUpperCase()}]: ${u.name} (${u.email})`);
    }

    // 3. SEED CATEGORIES
    console.log('\n🏷️ Seeding product categories...');
    const catLaptops = await Category.create({
      name: 'Laptops & Computers',
      slug: 'laptops-computers',
      description: 'Ultra-fast laptops, performance workstations, and computing gear.',
    });
    const catAudio = await Category.create({
      name: 'Audio & Headphones',
      slug: 'audio-headphones',
      description: 'Studio-grade acoustics, noise-canceling headphones, and wireless earbuds.',
    });
    const catFootwear = await Category.create({
      name: 'Footwear & Sneakers',
      slug: 'footwear-sneakers',
      description: 'Marathon racing shoes, lifestyle sneakers, and athletic footwear.',
    });
    const catWearables = await Category.create({
      name: 'Smart Wearables & Watches',
      slug: 'smart-wearables',
      description: 'GPS fitness smartwatches, cellular tracking, and luxury wearables.',
    });
    console.log('  ✓ Categories created: Laptops, Audio, Footwear, Wearables');

    // 4. SEED BRANDS
    console.log('\n🏷️ Seeding brands...');
    const brandApple = await Brand.create({ name: 'Apple', slug: 'apple', description: 'Apple Silicon & Hardware' });
    const brandSony = await Brand.create({ name: 'Sony', slug: 'sony', description: 'Acoustic Mastery & Imaging' });
    const brandNike = await Brand.create({ name: 'Nike', slug: 'nike', description: 'World-Class Athletic Footwear' });
    const brandBose = await Brand.create({ name: 'Bose', slug: 'bose', description: 'Legendary Acoustic Engineering' });
    console.log('  ✓ Brands created: Apple, Sony, Nike, Bose');

    // 5. SEED MEANINGFUL, HIGH-QUALITY PRODUCTS
    console.log('\n📦 Seeding real-world luxury products with HD imagery...');
    const productsData = [
      {
        name: 'Apple MacBook Pro 16" (M3 Max)',
        description: 'Apple M3 Max 16-Core CPU, 40-Core GPU, 36GB Unified Memory, 1TB Superfast SSD Storage, Liquid Retina XDR 120Hz display with 22-hour battery life.',
        price: 2499.00,
        discountPrice: 2299.00,
        category: catLaptops._id,
        brand: brandApple._id,
        seller: createdUsers['seller@example.com'], // Apex Tech Hyderabad
        warehouseState: 'Telangana',
        warehouseCity: 'Hyderabad',
        stock: 25,
        rating: 4.9,
        numReviews: 38,
        images: [{ public_id: 'macbook_16', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' }],
        isApproved: true,
        approvalStatus: 'approved',
        isFeatured: true,
      },
      {
        name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        description: 'Two processors and 8 microphones for unparalleled noise canceling, Auto NC Optimizer, 30-hour battery life, and crystal clear hands-free calling with Speak-to-Chat.',
        price: 399.99,
        discountPrice: 349.99,
        category: catAudio._id,
        brand: brandSony._id,
        seller: createdUsers['seller.texas@example.com'], // Royal Audio Mumbai
        warehouseState: 'Maharashtra',
        warehouseCity: 'Mumbai',
        stock: 50,
        rating: 4.8,
        numReviews: 54,
        images: [{ public_id: 'sony_xm5', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' }],
        isApproved: true,
        approvalStatus: 'approved',
        isFeatured: true,
      },
      {
        name: 'Nike Air Zoom Alphafly Next% 3 (Marathon Edition)',
        description: 'Tuned for marathon racing speed with dual Zoom Air pods in the forefoot, full-length carbon fiber Flyplate, and ultralight responsive ZoomX foam.',
        price: 285.00,
        discountPrice: 260.00,
        category: catFootwear._id,
        brand: brandNike._id,
        seller: createdUsers['seller.sf@example.com'], // Silicon Lifestyle Bengaluru
        warehouseState: 'Karnataka',
        warehouseCity: 'Bengaluru',
        stock: 30,
        rating: 4.9,
        numReviews: 29,
        images: [{ public_id: 'nike_alphafly', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' }],
        isApproved: true,
        approvalStatus: 'approved',
        isFeatured: true,
      },
      {
        name: 'Apple Watch Ultra 2 (Titanium GPS + Cellular)',
        description: 'Rugged 49mm titanium case, precision dual-frequency GPS, up to 36 hours of battery life, customizable Action button, and 100m water resistance.',
        price: 799.00,
        discountPrice: 749.00,
        category: catWearables._id,
        brand: brandApple._id,
        seller: createdUsers['seller@example.com'], // Apex Tech Hyderabad
        warehouseState: 'Telangana',
        warehouseCity: 'Hyderabad',
        stock: 20,
        rating: 4.9,
        numReviews: 21,
        images: [{ public_id: 'apple_watch_ultra', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' }],
        isApproved: true,
        approvalStatus: 'approved',
        isFeatured: true,
      },
      {
        name: 'Bose QuietComfort Ultra Wireless Earbuds',
        description: 'Breakthrough spatialized audio with Bose Immersive Audio, custom calibrated noise cancellation, and up to 24 hours of total listening time with USB-C wireless case.',
        price: 299.00,
        discountPrice: 249.00,
        category: catAudio._id,
        brand: brandBose._id,
        seller: createdUsers['seller.texas@example.com'], // Royal Audio Mumbai
        warehouseState: 'Maharashtra',
        warehouseCity: 'Mumbai',
        stock: 40,
        rating: 4.7,
        numReviews: 18,
        images: [{ public_id: 'bose_earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80' }],
        isApproved: true,
        approvalStatus: 'approved',
        isFeatured: true,
      },
      {
        name: 'Nike Air Jordan 1 Retro High OG (Chicago Edition)',
        description: 'Iconic high-top silhouette in premium full-grain leather, encapsulated Air-Sole cushioning in the heel, and timeless red, white, and black colorway.',
        price: 210.00,
        discountPrice: 190.00,
        category: catFootwear._id,
        brand: brandNike._id,
        seller: createdUsers['seller.sf@example.com'], // Silicon Lifestyle Bengaluru
        warehouseState: 'Karnataka',
        warehouseCity: 'Bengaluru',
        stock: 35,
        rating: 4.9,
        numReviews: 64,
        images: [{ public_id: 'air_jordan_1', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80' }],
        isApproved: true,
        approvalStatus: 'approved',
        isFeatured: true,
      },
    ];

    for (const p of productsData) {
      await Product.create(p);
      console.log(`  ✓ Product seeded: ${p.name} ($${p.discountPrice}) [Warehouse: ${p.warehouseCity}, ${p.warehouseState}]`);
    }

    console.log('\n===============================================================');
    console.log('🎉 DATABASE REFRESH COMPLETE: 100% CLEAN & READY FOR REAL TESTING!');
    console.log('===============================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
}

seedCleanDatabase();
