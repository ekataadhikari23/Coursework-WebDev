const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize SQLite database via Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

// 1. User Entity for Admin Authentication
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// 2. First Business Entity (e.g., Supplier / Author / Category)
const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// 3. Second Business Entity with Foreign Key (e.g., Product / Book)
const Item = sequelize.define('Item', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Define Relationships (Foreign Keys)
Category.hasMany(Item, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Item.belongsTo(Category, { foreignKey: 'categoryId' });

// Export models and connection
module.exports = { sequelize, User, Category, Item };