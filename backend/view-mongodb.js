const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

async function viewMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    console.log('📊 Database: skillswap');
    console.log('');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available Collections (Tables):');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    console.log('');

    // Show data from each collection
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`📈 ${collection.name.toUpperCase()} - ${count} documents`);
      
      if (count > 0) {
        const sample = await mongoose.connection.db.collection(collection.name).find().limit(3).toArray();
        console.log('   Sample data:');
        sample.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${JSON.stringify(doc, null, 2)}`);
        });
      }
      console.log('');
    }

    // Show specific queries
    console.log('🔍 Specific Queries:');
    console.log('');

    // Users
    const users = await mongoose.connection.db.collection('users').find().limit(5).toArray();
    console.log('👥 USERS (first 5):');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Admin: ${user.is_admin}, Banned: ${user.is_banned}`);
    });
    console.log('');

    // Skills
    const skills = await mongoose.connection.db.collection('skills').find().limit(10).toArray();
    console.log('🎯 SKILLS (first 10):');
    skills.forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.name} (${skill.category})`);
    });
    console.log('');

    // Swap Requests
    const swaps = await mongoose.connection.db.collection('swaprequests').find().limit(5).toArray();
    console.log('🔄 SWAP REQUESTS (first 5):');
    swaps.forEach((swap, index) => {
      console.log(`${index + 1}. Status: ${swap.status}, Created: ${swap.created_at}`);
    });
    console.log('');

    // Admin Messages
    const messages = await mongoose.connection.db.collection('adminmessages').find().limit(5).toArray();
    console.log('📢 ADMIN MESSAGES (first 5):');
    messages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.title} (${msg.type}) - Active: ${msg.is_active}`);
    });
    console.log('');

    console.log('💡 To view more data, you can:');
    console.log('1. Use MongoDB Compass (GUI tool)');
    console.log('2. Use MongoDB shell: mongo skillswap');
    console.log('3. Run specific queries in this script');
    console.log('');
    console.log('📝 Common MongoDB Commands:');
    console.log('- db.users.find() - View all users');
    console.log('- db.skills.find() - View all skills');
    console.log('- db.swaprequests.find() - View all swap requests');
    console.log('- db.adminmessages.find() - View all admin messages');
    console.log('- db.users.countDocuments() - Count users');
    console.log('- db.users.findOne({email: "admin@skillswap.com"}) - Find specific user');

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Install MongoDB: https://docs.mongodb.com/manual/installation/');
    console.log('3. Start MongoDB service');
    console.log('4. Check if MongoDB is running on localhost:27017');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
viewMongoDB(); 