const { sequelize, Category } = require('./models');

async function seedCategories() {
  try {
    await sequelize.sync();

    const initialCategories = [
      { name: 'BerryCo 🍒' },
      { name: 'BeeHive 🐝' },
      { name: 'SillyStuff 🎪' }
    ];

    for (const cat of initialCategories) {
      const [category, created] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
      if (created) {
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    console.log('Category seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
}

seedCategories();