const { sequelize, Item, Category } = require('./models');

async function seedProducts() {
  try {
    await sequelize.sync();

    const berryCo = await Category.findOne({ where: { name: 'BerryCo 🍒' } });
    const beeHive = await Category.findOne({ where: { name: 'BeeHive 🐝' } });
    const sillyStuff = await Category.findOne({ where: { name: 'SillyStuff 🎪' } });

    if (!berryCo || !beeHive || !sillyStuff) {
      console.log('Please run seedCategories.js first!');
      process.exit(1);
    }

    const initialItems = [
      { name: "Berry Tote Bag", price: 799, stock: 3, categoryId: berryCo.id, image: "BerryTotebag.webp" },
      { name: "Sparky Notebook", price: 499, stock: 20, categoryId: beeHive.id, image: "SparkyNotebook.webp" },
      { name: "Turbo Wash 5000", price: 56900, stock: 2, categoryId: sillyStuff.id, image: "TurboWash.avif" },
      { name: "Bees Glass Necklace", price: 569, stock: 15, categoryId: berryCo.id, image: "BeesGlassNecklace.webp" },
      { name: "Mug", price: 499, stock: 2, categoryId: sillyStuff.id, image: "BeesMug.jpeg" },
      { name: "RosyHair Clips", price: 640, stock: 50, categoryId: berryCo.id, image: "RosyHairClip.jpg" },
      { name: "Cute Sticker Pack", price: 339, stock: 100, categoryId: beeHive.id, image: "StickerPack.webp" },
      { name: "Fluffy Pen", price: 99, stock: 4, categoryId: sillyStuff.id, image: "FluffySillyPen.jpg" }
    ];

    for (const item of initialItems) {
      await Item.create(item);
    }

    console.log('Initial products seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
}

seedProducts();