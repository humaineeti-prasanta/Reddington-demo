import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Canonical purpose catalog (design doc §3.7 / business spec §3).
const PURPOSES = [
  {
    purposeId: 'privacy_policy',
    name: 'Privacy Policy & Terms',
    description:
      'Core account data (email, password) required to create and secure your Reddington account.',
    mandatory: true,
    dataCategories: ['account_email', 'account_password'],
    displayOrder: 1,
  },
  {
    purposeId: 'order_processing',
    name: 'Order Processing & Delivery',
    description:
      'Your name, phone number and shipping address, used to process orders and deliver them to you.',
    mandatory: true,
    dataCategories: ['name', 'phone', 'address'],
    displayOrder: 2,
  },
  {
    purposeId: 'personalized_recommendations',
    name: 'Personalized Recommendations',
    description:
      'Your browsing and product view history, used to build a "For You" feed tailored to your taste.',
    mandatory: false,
    dataCategories: ['browsing_history', 'view_history'],
    displayOrder: 3,
  },
  {
    purposeId: 'promotional_notifications',
    name: 'Promotional Notifications',
    description:
      'Your in-app activity, used to send promotional offers and deals through the notification bell.',
    mandatory: false,
    dataCategories: ['in_app_activity'],
    displayOrder: 4,
  },
  {
    purposeId: 'marketing_emails',
    name: 'Marketing Emails',
    description:
      'Your email address, used to send marketing newsletters and sale announcements.',
    mandatory: false,
    dataCategories: ['email_address'],
    displayOrder: 5,
  },
  {
    purposeId: 'device_analytics',
    name: 'Device Analytics',
    description:
      'Device information (user agent, platform, language, screen size), used to understand usage and improve the app.',
    mandatory: false,
    dataCategories: ['device_info', 'user_agent', 'screen_size'],
    displayOrder: 6,
  },
  {
    purposeId: 'location_offers',
    name: 'Location Based Offers',
    description:
      'Your GPS coordinates, used only to show offers and stores relevant to your current location.',
    mandatory: false,
    dataCategories: ['gps_location'],
    displayOrder: 7,
  },
];

const NOTICE_V1 = {
  version: 1,
  title: 'Reddington Privacy Notice',
  content: `Reddington collects and processes your personal data for specific, stated purposes only.

We process account data (email, password) to run your account, and your name, phone and address to fulfil orders — these are required to use Reddington.

Optionally, and only with your consent, we may use your browsing history for personalized recommendations, your in-app activity for promotional notifications, your email address for marketing emails, your device information for analytics, and your GPS location for nearby offers.

You can grant, reject or withdraw any optional consent at any time from Consent Management. Withdrawal is as easy as granting.`,
  active: true,
};

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const img = (title, n) =>
  `https://picsum.photos/seed/${slug(title)}-${n}/600/800`;

const APPAREL = ['S', 'M', 'L', 'XL'];
const KIDS = ['2-3Y', '4-5Y', '6-7Y', '8-9Y'];
const SHOES = ['6', '7', '8', '9', '10', '11'];

// ~42 products across the 6 categories.
const RAW_PRODUCTS = [
  // men
  ['Slim Fit Cotton Casual Shirt', 'Roadster', 'men', 1299, 2199, APPAREL, 4.2, ['shirt', 'casual']],
  ['Classic Crew Neck T-Shirt', 'HRX', 'men', 599, 999, APPAREL, 4.0, ['tshirt', 'basics']],
  ['Tapered Fit Chino Trousers', 'HIGHLANDER', 'men', 1499, 2999, APPAREL, 4.3, ['trousers', 'chinos']],
  ['Hooded Zip Sweatshirt', 'Puma', 'men', 1899, 3499, APPAREL, 4.4, ['sweatshirt', 'winter']],
  ['Denim Slim Fit Jeans', "Levi's", 'men', 2499, 3999, APPAREL, 4.5, ['jeans', 'denim']],
  ['Formal Checked Blazer', 'Louis Philippe', 'men', 4499, 6999, APPAREL, 4.1, ['blazer', 'formal']],
  ['Printed Half Sleeve Shirt', 'Mast & Harbour', 'men', 999, 1799, APPAREL, 3.9, ['shirt', 'summer']],

  // women
  ['Floral Print A-Line Dress', 'Sassafras', 'women', 1599, 2999, APPAREL, 4.3, ['dress', 'floral']],
  ['High Waist Skinny Jeans', 'Kraus Jeans', 'women', 1799, 3299, APPAREL, 4.2, ['jeans', 'denim']],
  ['Solid Ribbed Crop Top', 'ONLY', 'women', 799, 1499, APPAREL, 4.0, ['top', 'casual']],
  ['Anarkali Kurta with Dupatta', 'Libas', 'women', 2299, 4499, APPAREL, 4.5, ['kurta', 'ethnic']],
  ['Oversized Fleece Sweatshirt', 'H&M', 'women', 1499, 2499, APPAREL, 4.1, ['sweatshirt', 'winter']],
  ['Pleated Midi Skirt', 'Vero Moda', 'women', 1699, 2999, APPAREL, 4.2, ['skirt', 'midi']],
  ['Georgette Wrap Top', 'AJIO Own', 'women', 899, 1699, APPAREL, 3.8, ['top', 'party']],

  // kids
  ['Boys Dinosaur Print T-Shirt', 'YK', 'kids', 499, 899, KIDS, 4.4, ['tshirt', 'boys']],
  ['Girls Unicorn Party Frock', 'Cutecumber', 'kids', 1299, 2299, KIDS, 4.5, ['frock', 'girls']],
  ['Kids Cotton Jogger Pants', 'HERE&NOW', 'kids', 699, 1199, KIDS, 4.1, ['joggers', 'casual']],
  ['Boys Hooded Sweatshirt', 'Gini and Jony', 'kids', 999, 1799, KIDS, 4.2, ['sweatshirt', 'winter']],
  ['Girls Denim Dungaree', 'Nauti Nati', 'kids', 1499, 2599, KIDS, 4.3, ['dungaree', 'denim']],
  ['Kids Striped Polo T-Shirt', 'US Polo Kids', 'kids', 799, 1399, KIDS, 4.0, ['polo', 'boys']],

  // footwear
  ['Men Running Sports Shoes', 'Nike', 'footwear', 3499, 5999, SHOES, 4.6, ['shoes', 'sports']],
  ['Women White Sneakers', 'Adidas', 'footwear', 2999, 4999, SHOES, 4.4, ['sneakers', 'casual']],
  ['Men Leather Formal Shoes', 'Bata', 'footwear', 1999, 3499, SHOES, 4.1, ['formal', 'leather']],
  ['Women Block Heel Sandals', 'Metro', 'footwear', 1599, 2799, SHOES, 4.0, ['heels', 'party']],
  ['Kids Velcro Sport Shoes', 'Campus', 'footwear', 999, 1799, SHOES, 4.2, ['shoes', 'kids']],
  ['Men Casual Slip-On Loafers', 'Red Tape', 'footwear', 2299, 3999, SHOES, 4.3, ['loafers', 'casual']],
  ['Women Flat Ballerinas', 'Mochi', 'footwear', 1199, 1999, SHOES, 3.9, ['flats', 'daily']],

  // accessories (no sizes)
  ['Leather Analog Wrist Watch', 'Fossil', 'accessories', 4999, 8999, [], 4.5, ['watch', 'leather']],
  ['Classic Aviator Sunglasses', 'Ray-Ban', 'accessories', 3499, 5499, [], 4.6, ['sunglasses', 'unisex']],
  ['Genuine Leather Wallet', 'Wildhorn', 'accessories', 899, 1999, [], 4.2, ['wallet', 'men']],
  ['Quilted Sling Handbag', 'Lino Perros', 'accessories', 1799, 3499, [], 4.1, ['handbag', 'women']],
  ['Woven Fabric Belt', 'Tommy Hilfiger', 'accessories', 1299, 2299, [], 4.0, ['belt', 'men']],
  ['Beaded Layered Necklace', 'Accessorize', 'accessories', 699, 1299, [], 3.9, ['jewellery', 'women']],
  ['Canvas Backpack 25L', 'Wildcraft', 'accessories', 1599, 2799, [], 4.3, ['backpack', 'travel']],

  // beauty (no sizes)
  ['Matte Liquid Lipstick', 'Maybelline', 'beauty', 599, 899, [], 4.3, ['lipstick', 'makeup']],
  ['Vitamin C Face Serum', 'Minimalist', 'beauty', 699, 999, [], 4.5, ['skincare', 'serum']],
  ['Long Lasting Kajal', 'Lakme', 'beauty', 349, 549, [], 4.2, ['kajal', 'eyes']],
  ['Aloe Vera Moisturizer', 'Mamaearth', 'beauty', 399, 599, [], 4.1, ['skincare', 'moisturizer']],
  ['Eau de Parfum Spray', 'Skinn by Titan', 'beauty', 1499, 2499, [], 4.4, ['perfume', 'fragrance']],
  ['Nourishing Hair Oil', 'WOW Skin', 'beauty', 449, 799, [], 4.0, ['haircare', 'oil']],
  ['Compact Face Powder', 'Sugar Cosmetics', 'beauty', 799, 1199, [], 4.2, ['makeup', 'compact']],
];

const products = RAW_PRODUCTS.map(([title, brand, category, price, mrp, sizes, rating, tags]) => ({
  title,
  brand,
  category,
  price,
  mrp,
  sizes,
  rating,
  tags,
  description: `${title} by ${brand}. Crafted for everyday style and comfort — a Reddington catalog favourite in ${category}.`,
  images: [img(title, 1), img(title, 2), img(title, 3)],
}));

async function main() {
  for (const p of PURPOSES) {
    await prisma.consentPurpose.upsert({
      where: { purposeId: p.purposeId },
      update: p,
      create: p,
    });
  }

  await prisma.notice.upsert({
    where: { version: NOTICE_V1.version },
    update: { title: NOTICE_V1.title, content: NOTICE_V1.content, active: NOTICE_V1.active },
    create: NOTICE_V1,
  });

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { title: p.title } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: p });
    } else {
      await prisma.product.create({ data: p });
    }
  }

  const counts = {
    purposes: await prisma.consentPurpose.count(),
    notices: await prisma.notice.count(),
    products: await prisma.product.count(),
  };
  console.log('Seed complete:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
