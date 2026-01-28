// Check Users in Database
// Run this file with: node checkUsers.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Define User schema
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            phone: String,
            isAdmin: Boolean,
            role: String
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        // Get all users
        const users = await User.find({}).select('name email isAdmin role createdAt');

        console.log('═══════════════════════════════════════════════════════════');
        console.log(`  FOUND ${users.length} USER(S) IN DATABASE`);
        console.log('═══════════════════════════════════════════════════════════\n');

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   isAdmin: ${user.isAdmin}`);
            console.log(`   role: ${user.role}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════');
        console.log('  ADMIN USERS:');
        console.log('═══════════════════════════════════════════════════════════\n');

        const adminUsers = users.filter(u => u.isAdmin === true || u.role === 'admin');

        if (adminUsers.length === 0) {
            console.log('⚠️  NO ADMIN USERS FOUND!');
            console.log('\nTo create an admin user, run:');
            console.log('   node createAdminUser.js\n');
        } else {
            adminUsers.forEach((admin, index) => {
                console.log(`${index + 1}. ${admin.name}`);
                console.log(`   Email: ${admin.email}`);
                console.log('');
            });
        }

        console.log('═══════════════════════════════════════════════════════════\n');

        await mongoose.connection.close();
        console.log('✅ Database connection closed\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

checkUsers();
