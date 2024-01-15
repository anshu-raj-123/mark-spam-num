const sequelize = require('./db');
const User = require('./models/User');
const Contact = require('./models/Contact');

async function populateDatabase() {
  try {
    await sequelize.sync({ force: true });

    const user1 = await User.create({
      name: 'Anshu',
      phoneNumber: '1234567890',
      email: 'anshu@gmail.com',
      password: 'password1',
    });

    const user2 = await User.create({
      name: 'Sumit kr',
      phoneNumber: '9876543210',
      email: 'sumit@google.com',
      password: 'password2',
    });

    await Contact.create({ name: 'Anshu', phoneNumber: '1231231231', spam: false });
    await Contact.create({ name: 'Rahul kr1', phoneNumber: '2323232323', spam: false });
    await Contact.create({ name: 'Sumit kr', phoneNumber: '9424753922', spam: true });

    console.log('Database populated');
  } catch (error) {
    console.error('Error in database:', error);
  } finally {
    await sequelize.close();
  }
}

populateDatabase();
