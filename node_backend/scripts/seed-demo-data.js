import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

const categories = [
  { name: 'Spices', description: "Handpicked aromatic spices from India's finest farms", image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80', icon: '🌶️' },
  { name: 'Teas', description: 'Premium herbal blends & first-flush teas', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', icon: '🍵' },
  { name: 'Ghee & Oils', description: 'Cold-pressed oils & traditionally churned A2 ghee', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80', icon: '🫙' },
  { name: 'Sweeteners', description: 'Natural jaggery, raw honey & unrefined sugars', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', icon: '🍯' },
];

const products = [
  { name: 'Kashmiri Saffron', category: 'Spices', price: 899, weight: '2g', image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=80', description: 'Pure A++ grade Kashmiri saffron — deeply aromatic with a rich golden hue.', featured: true, variants: [{ size: '1g', price: 499 }, { size: '2g', price: 899 }, { size: '5g', price: 2099 }] },
  { name: 'Darjeeling Green Tea', category: 'Teas', price: 349, weight: '100g', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', description: 'First flush green tea from the misty slopes of Darjeeling.', featured: true, variants: [{ size: '50g', price: 199 }, { size: '100g', price: 349 }, { size: '250g', price: 799 }] },
  { name: 'A2 Cow Ghee', category: 'Ghee & Oils', price: 799, weight: '500ml', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80', description: 'Traditionally bilona-churned from grass-fed A2 cow milk.', featured: true, variants: [{ size: '250ml', price: 449 }, { size: '500ml', price: 799 }, { size: '1L', price: 1499 }] },
  { name: 'Raw Forest Honey', category: 'Sweeteners', price: 449, weight: '300g', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80', description: 'Unheated, unfiltered wild honey from Himalayan forests.', featured: true, variants: [{ size: '150g', price: 249 }, { size: '300g', price: 449 }, { size: '500g', price: 699 }] },
  { name: 'Organic Turmeric', category: 'Spices', price: 199, weight: '200g', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80', description: 'High-curcumin Lakadong turmeric — lab-tested for purity.', featured: false, variants: [{ size: '100g', price: 119 }, { size: '200g', price: 199 }, { size: '500g', price: 449 }] },
  { name: 'Ashwagandha Chai', category: 'Teas', price: 299, weight: '50g', image: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=400&q=80', description: 'Adaptogenic blend with ashwagandha, ginger & cardamom.', featured: false, variants: [{ size: '50g', price: 299 }, { size: '100g', price: 549 }] },
  { name: 'Cold-Press Coconut Oil', category: 'Ghee & Oils', price: 399, weight: '500ml', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80', description: 'Wood-pressed virgin coconut oil, unrefined & full of flavour.', featured: false, variants: [{ size: '250ml', price: 229 }, { size: '500ml', price: 399 }, { size: '1L', price: 749 }] },
  { name: 'Organic Jaggery', category: 'Sweeteners', price: 249, weight: '500g', image: 'https://images.unsplash.com/photo-1604413191066-4dd20bedf486?w=400&q=80', description: 'Sun-dried sugarcane jaggery — no chemicals, no bleach.', featured: false, variants: [{ size: '250g', price: 139 }, { size: '500g', price: 249 }, { size: '1kg', price: 449 }] },
];

async function main() {
  await mongoose.connect(mongoUri);

  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { name: cat.name },
      cat,
      { upsert: true, new: true }
    );
  }

  for (const pr of products) {
    const firstVariant = pr.variants?.[0] || { size: pr.weight || '', price: pr.price };
    await Product.findOneAndUpdate(
      { name: pr.name },
      {
        ...pr,
        price: Number(firstVariant.price),
        weight: firstVariant.size,
        variants: pr.variants || [],
      },
      { upsert: true, new: true }
    );
  }

  const catCount = await Category.countDocuments();
  const prodCount = await Product.countDocuments();

  console.log(`Seed complete: ${catCount} categories, ${prodCount} products`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
