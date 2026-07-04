import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { Banner } from '../models/Banner.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Brand.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Banner.deleteMany({}),
  ]);

  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@nexshop.com',
    password: 'Admin123!',
    role: 'admin',
    isEmailVerified: true,
  });

  const customer = await User.create({
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer@nexshop.com',
    password: 'Customer123!',
    role: 'customer',
    isEmailVerified: true,
    loyaltyPoints: 250,
  });

  const categories = await Category.insertMany([
    { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and devices', order: 1, image: 'https://images.unsplash.com/photo-1498049794561-7780f723e1f3?w=800' },
    { name: 'Fashion', slug: 'fashion', description: 'Trendy clothing and accessories', order: 2, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800' },
    { name: 'Home & Living', slug: 'home-living', description: 'Furniture and decor', order: 3, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800' },
    { name: 'Sports', slug: 'sports', description: 'Sports equipment and gear', order: 4, image: 'https://images.unsplash.com/photo-1461896836934-ffe776d45b69?w=800' },
    { name: 'Beauty', slug: 'beauty', description: 'Skincare and cosmetics', order: 5, image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800' },
  ]);

  const brands = await Brand.insertMany([
    { name: 'Apple', slug: 'apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Nike', slug: 'nike' },
    { name: 'Sony', slug: 'sony' },
    { name: 'Dyson', slug: 'dyson' },
  ]);

  const products = [
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system.',
      shortDescription: 'Titanium. A17 Pro. Action button.',
      price: 1199,
      compareAtPrice: 1299,
      sku: 'APL-IP15PM-256',
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      ],
      category: categories[0]._id,
      brand: brands[0]._id,
      tags: ['smartphone', 'apple', '5g'],
      specifications: { Storage: '256GB', Color: 'Natural Titanium', Display: '6.7" Super Retina XDR' },
      stock: 50,
      isFeatured: true,
      isFlashSale: true,
      flashSaleEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      averageRating: 4.8,
      reviewCount: 128,
      soldCount: 450,
    },
    {
      name: 'MacBook Air M3',
      slug: 'macbook-air-m3',
      description: 'Remarkably thin and light laptop with the M3 chip for incredible performance and battery life.',
      shortDescription: 'Supercharged by M3 chip.',
      price: 1099,
      compareAtPrice: 1199,
      sku: 'APL-MBA-M3-512',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
      category: categories[0]._id,
      brand: brands[0]._id,
      tags: ['laptop', 'apple', 'm3'],
      specifications: { Chip: 'Apple M3', RAM: '16GB', Storage: '512GB SSD' },
      stock: 30,
      isFeatured: true,
      averageRating: 4.9,
      reviewCount: 89,
      soldCount: 320,
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Galaxy AI is here. The ultimate smartphone experience with S Pen and 200MP camera.',
      shortDescription: 'Galaxy AI powered smartphone.',
      price: 1299,
      sku: 'SAM-S24U-512',
      images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'],
      category: categories[0]._id,
      brand: brands[1]._id,
      tags: ['smartphone', 'samsung', 'ai'],
      stock: 40,
      isFeatured: true,
      averageRating: 4.7,
      reviewCount: 95,
      soldCount: 280,
    },
    {
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      description: 'Industry-leading noise cancellation with exceptional sound quality and all-day comfort.',
      shortDescription: 'Premium noise cancelling headphones.',
      price: 349,
      compareAtPrice: 399,
      sku: 'SNY-WH1000XM5',
      images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800'],
      category: categories[0]._id,
      brand: brands[3]._id,
      tags: ['headphones', 'audio', 'wireless'],
      stock: 75,
      averageRating: 4.8,
      reviewCount: 210,
      soldCount: 890,
    },
    {
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description: 'Nike\'s biggest heel Air unit yet delivers unrivaled, all-day comfort.',
      shortDescription: 'Iconic Air Max comfort.',
      price: 150,
      sku: 'NKE-AM270-BLK',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
      category: categories[1]._id,
      brand: brands[2]._id,
      tags: ['shoes', 'sneakers', 'nike'],
      stock: 100,
      isFeatured: true,
      averageRating: 4.6,
      reviewCount: 340,
      soldCount: 1200,
    },
    {
      name: 'Premium Leather Jacket',
      slug: 'premium-leather-jacket',
      description: 'Handcrafted genuine leather jacket with modern slim fit design.',
      shortDescription: 'Genuine leather, timeless style.',
      price: 299,
      compareAtPrice: 449,
      sku: 'FSH-LJ-BRN-M',
      images: ['https://images.unsplash.com/photo-1551028718-e22bce701aef?w=800'],
      category: categories[1]._id,
      tags: ['jacket', 'leather', 'fashion'],
      stock: 25,
      averageRating: 4.5,
      reviewCount: 67,
      soldCount: 180,
    },
    {
      name: 'Dyson V15 Detect',
      slug: 'dyson-v15-detect',
      description: 'Most powerful, intelligent cordless vacuum with laser dust detection.',
      shortDescription: 'Laser reveals hidden dust.',
      price: 749,
      sku: 'DYS-V15-DET',
      images: ['https://images.unsplash.com/photo-1558317374-8c0c075a751a?w=800'],
      category: categories[2]._id,
      brand: brands[4]._id,
      tags: ['vacuum', 'home', 'cleaning'],
      stock: 20,
      isFeatured: true,
      averageRating: 4.7,
      reviewCount: 156,
      soldCount: 420,
    },
    {
      name: 'Modern Sectional Sofa',
      slug: 'modern-sectional-sofa',
      description: 'Contemporary L-shaped sectional with premium fabric upholstery.',
      shortDescription: 'Comfort meets modern design.',
      price: 1899,
      compareAtPrice: 2499,
      sku: 'HM-SOF-SEC-GRY',
      images: ['https://images.unsplash.com/photo-1555041469-a586c36ea9bc?w=800'],
      category: categories[2]._id,
      tags: ['furniture', 'sofa', 'living-room'],
      stock: 8,
      averageRating: 4.4,
      reviewCount: 45,
      soldCount: 95,
    },
    {
      name: 'Yoga Mat Pro',
      slug: 'yoga-mat-pro',
      description: 'Extra thick eco-friendly yoga mat with superior grip and cushioning.',
      shortDescription: 'Eco-friendly, non-slip surface.',
      price: 49,
      sku: 'SPT-YMP-PRO',
      images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'],
      category: categories[3]._id,
      tags: ['yoga', 'fitness', 'mat'],
      stock: 200,
      averageRating: 4.3,
      reviewCount: 890,
      soldCount: 3500,
    },
    {
      name: 'Skincare Essentials Set',
      slug: 'skincare-essentials-set',
      description: 'Complete 5-piece skincare routine for radiant, healthy skin.',
      shortDescription: 'Complete daily skincare routine.',
      price: 89,
      compareAtPrice: 129,
      sku: 'BTY-SKE-SET',
      images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800'],
      category: categories[4]._id,
      tags: ['skincare', 'beauty', 'set'],
      stock: 150,
      isFlashSale: true,
      flashSaleEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      averageRating: 4.6,
      reviewCount: 520,
      soldCount: 2100,
    },
  ];

  await Product.insertMany(products);

  await Coupon.insertMany([
    {
      code: 'WELCOME10',
      description: '10% off your first order',
      type: 'percentage',
      value: 10,
      minOrderAmount: 50,
      maxDiscount: 100,
      usageLimit: 1000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'SAVE25',
      description: '$25 off orders over $200',
      type: 'fixed',
      value: 25,
      minOrderAmount: 200,
      usageLimit: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping on any order',
      type: 'free_shipping',
      value: 0,
      usageLimit: 2000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  ]);

  await Banner.insertMany([
    {
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on selected items',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600',
      link: '/shop?sale=true',
      buttonText: 'Shop Now',
      position: 'hero',
      order: 1,
    },
    {
      title: 'New Arrivals',
      subtitle: 'Discover the latest tech gadgets',
      image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600',
      link: '/shop?category=electronics',
      buttonText: 'Explore',
      position: 'hero',
      order: 2,
    },
  ]);

  logger.info('Database seeded successfully!');
  logger.info(`Admin: admin@nexshop.com / Admin123!`);
  logger.info(`Customer: customer@nexshop.com / Customer123!`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  logger.error(err);
  process.exit(1);
});
