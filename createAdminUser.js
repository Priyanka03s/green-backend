// Create Admin User Script
// Run this file with: node createAdminUser.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Define User schema directly to avoid pre-save hook issues
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            phone: String,
            isAdmin: Boolean,
            role: String
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        // Admin user details
        const adminEmail = 'admin@greeninovics.com';
        const adminPassword = 'admin123456';
        const adminName = 'Admin User';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('\n⚠️  Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('isAdmin:', existingAdmin.isAdmin);
            console.log('role:', existingAdmin.role);

            // Update to ensure admin privileges
            await User.updateOne(
                { email: adminEmail },
                { $set: { isAdmin: true, role: 'admin' } }
            );
            console.log('\n✅ Updated existing user to have admin privileges');

        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await User.collection.insertOne({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                phone: '1234567890',
                isAdmin: true,
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log('\n✅ Admin user created successfully!');
            console.log('Name:', adminName);
            console.log('Email:', adminEmail);
            console.log('Password:', adminPassword);
        }

        console.log('\n📧 ═══════════════════════════════════');
        console.log('     LOGIN CREDENTIALS');
        console.log('   ═══════════════════════════════════');
        console.log('   Email:', adminEmail);
        console.log('   Password:', adminPassword);
        console.log('   ═══════════════════════════════════\n');
        console.log('🌐 Login at: http://localhost:5173/login');
        console.log('🔍 Verify at: http://localhost:5173/admin/diagnostics\n');

        await mongoose.connection.close();
        console.log('✅ Database connection closed\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

createAdminUser();
