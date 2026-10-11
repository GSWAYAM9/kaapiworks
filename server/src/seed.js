import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js';
import Review from './models/Review.js';
import { initialCategories, initialProducts } from './utils/seedData.js';

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is required to run the seed script.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas.');

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
    ]);

    // 1. Seed Categories
    console.log('🌱 Seeding 5 Categories...');
    const createdCategories = await Category.insertMany(initialCategories);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // 2. Seed Users from Environment Variables (cost 12 bcrypt)
    console.log('🌱 Seeding Admin and Customer accounts with bcrypt (cost 12)...');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@kaapiworks.in').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'KaapiAdmin@2026';
    const adminName = process.env.ADMIN_NAME || 'Kaapi Master Roaster (Admin)';

    const customerEmail = (process.env.CUSTOMER_EMAIL || 'customer@kaapiworks.in').toLowerCase().trim();
    const customerPassword = process.env.CUSTOMER_PASSWORD || 'KaapiCustomer@2026';
    const customerName = process.env.CUSTOMER_NAME || 'Aarav Sharma';

    const saltRounds = 12;
    const adminHash = await bcrypt.hash(adminPassword, saltRounds);
    const customerHash = await bcrypt.hash(customerPassword, saltRounds);

    const [adminUser, customerUser] = await User.insertMany([
      {
        name: adminName,
        email: adminEmail,
        passwordHash: adminHash,
        role: 'admin',
      },
      {
        name: customerName,
        email: customerEmail,
        passwordHash: customerHash,
        role: 'customer',
      },
    ]);
    console.log(`✅ Admin account created: ${adminEmail}`);
    console.log(`✅ Customer account created: ${customerEmail}`);

    // 3. Seed 26 Products
    console.log('🌱 Seeding 26 Products with coffee roast profiles, tasting notes, and stock levels...');
    const formattedProducts = initialProducts.map((p) => {
      const categoryId = categoryMap[p.categorySlug] || createdCategories[0]._id;
      return {
        name: p.name,
        description: p.description,
        price: p.price,
        category: categoryId,
        images: p.images,
        stock: p.stock,
        roastLevel: p.roastLevel || undefined,
        tastingNotes: p.tastingNotes || [],
        estate: p.estate || '',
        altitude: p.altitude || '',
        process: p.process || '',
        isFeatured: Boolean(p.isFeatured),
        isNewArrival: Boolean(p.isNewArrival),
        isRoastOfTheMonth: Boolean(p.isRoastOfTheMonth),
      };
    });

    const createdProducts = await Product.insertMany(formattedProducts);
    console.log(`✅ Successfully seeded ${createdProducts.length} products.`);

    // 4. Seed initial customer cart
    console.log('🌱 Seeding starter cart for customer...');
    await Cart.create({
      user: customerUser._id,
      items: [
        { product: createdProducts[0]._id, quantity: 2 },
        { product: createdProducts[1]._id, quantity: 1 },
      ],
    });

    // 5. Seed sample orders
    console.log('🌱 Seeding sample customer orders...');
    await Order.insertMany([
      {
        user: customerUser._id,
        orderNumber: 'KW-98214',
        items: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            price: createdProducts[0].price,
            quantity: 2,
            image: createdProducts[0].images[0]?.url,
            roastLevel: createdProducts[0].roastLevel,
          },
          {
            product: createdProducts[9]._id,
            name: createdProducts[9].name,
            price: createdProducts[9].price,
            quantity: 1,
            image: createdProducts[9].images[0]?.url,
            roastLevel: null,
          },
        ],
        subtotal: 2330,
        shipping: 0,
        total: 2330,
        status: 'delivered',
        shippingAddress: {
          street: 'Flat 402, Nilgiri Heights, 4th Cross',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560008',
          country: 'India',
        },
        paymentMethod: 'UPI (Google Pay)',
        paymentStatus: 'paid',
      },
      {
        user: customerUser._id,
        orderNumber: 'KW-74102',
        items: [
          {
            product: createdProducts[1]._id,
            name: createdProducts[1].name,
            price: createdProducts[1].price,
            quantity: 1,
            image: createdProducts[1].images[0]?.url,
            roastLevel: createdProducts[1].roastLevel,
          },
        ],
        subtotal: 680,
        shipping: 99,
        total: 779,
        status: 'roasted',
        shippingAddress: {
          street: 'Flat 402, Nilgiri Heights, 4th Cross',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560008',
          country: 'India',
        },
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
      },
    ]);

    // 6. Seed reviews and calculate average ratings
    console.log('🌱 Seeding sample product reviews...');
    await Review.insertMany([
      {
        product: createdProducts[0]._id,
        user: customerUser._id,
        userName: customerName,
        rating: 5,
        comment: 'Remarkable cup clarity! The almond and chocolate notes come through beautifully in a traditional South Indian filter. Best Chikmagalur beans I have had this year.',
        verifiedPurchase: true,
      },
      {
        product: createdProducts[1]._id,
        user: customerUser._id,
        userName: customerName,
        rating: 5,
        comment: 'Intense berry aromatics right out of the grinder! The honey process gives it a winey sweetness that shines through V60 pour-over.',
        verifiedPurchase: true,
      },
      {
        product: createdProducts[9]._id,
        user: customerUser._id,
        userName: customerName,
        rating: 5,
        comment: 'Superb virgin brass craftsmanship from Kumbakonam. The micro-perforations produce a crystal-clear, syrupy decoction.',
        verifiedPurchase: true,
      },
    ]);

    await Product.findByIdAndUpdate(createdProducts[0]._id, { averageRating: 5.0, reviewCount: 1 });
    await Product.findByIdAndUpdate(createdProducts[1]._id, { averageRating: 5.0, reviewCount: 1 });
    await Product.findByIdAndUpdate(createdProducts[9]._id, { averageRating: 5.0, reviewCount: 1 });

    console.log('✅ Seed complete! You can now launch the application.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
