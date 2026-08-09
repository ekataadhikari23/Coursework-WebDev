const { sequelize, User } = require('./models');
const { hashPassword } = require('./auth');

async function seedAdmin() {
  try {
    await sequelize.sync();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create hashed password for admin
    const hashedPassword = await hashPassword('admin123');

    await User.create({
      username: 'admin',
      password: hashedPassword
    });

    console.log('Default admin user created successfully! (Username: admin, Password: admin123)');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err);
    process.exit(1);
  }
}

seedAdmin();