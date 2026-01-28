// Reset User Password
// Run this file with: node resetPassword.js EMAIL NEW_PASSWORD

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const resetPassword = async () => {
    try {
        const email = process.argv[2];
        const newPassword = process.argv[3];

        if (!email || !newPassword) {
            console.log('\n❌ Usage: node resetPassword.js EMAIL NEW_PASSWORD');
            console.log('\nExamples:');
            console.log('   node resetPassword.js admin@greeninovics.com admin123');
            console.log('   node resetPassword.js sarathi@gmail.com newpassword123\n');
            process.exit(1);
        }

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

        // Find user
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            console.log(`\n❌ User not found with email: ${email}`);
            console.log('\nAvailable users:');
            const allUsers = await User.find({}).select('email');
            allUsers.forEach(u => console.log(`   - ${u.email}`));
            console.log('');
            process.exit(1);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await User.updateOne(
            { email: email.toLowerCase().trim() },
            { $set: { password: hashedPassword } }
        );

        console.log('═══════════════════════════════════════════════════════════');
        console.log('  ✅ PASSWORD RESET SUCCESSFUL!');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log(`User: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`New Password: ${newPassword}`);
        console.log(`isAdmin: ${user.isAdmin}`);
        console.log(`role: ${user.role}`);
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('  NOW YOU CAN LOGIN WITH:');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`\n📧 Email: ${user.email}`);
        console.log(`🔑 Password: ${newPassword}\n`);
        console.log('🌐 Login at: http://localhost:5173/login\n');

        await mongoose.connection.close();
        console.log('✅ Database connection closed\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

resetPassword();
