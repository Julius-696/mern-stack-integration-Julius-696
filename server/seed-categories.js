const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const defaultCategories = [
  { name: 'Technology', description: 'Posts about software, hardware, and tech trends' },
  { name: 'Travel', description: 'Travel experiences and tips' },
  { name: 'Food', description: 'Recipes, restaurant reviews, and culinary adventures' },
  { name: 'Lifestyle', description: 'Daily life, health, and wellness' },
  { name: 'Programming', description: 'Coding tutorials and development tips' }
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create categories
    for (const category of defaultCategories) {
      const existing = await Category.findOne({ name: category.name });
      if (!existing) {
        await Category.create(category);
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }

    console.log('Categories seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();