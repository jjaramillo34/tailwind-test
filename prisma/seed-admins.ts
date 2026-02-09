import mongoose, { Schema, Model } from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import bcrypt from 'bcrypt';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI or DATABASE_URL environment variable inside .env.local');
}

// User Schema
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (same as in User model)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

const User: Model<any> = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Default password for initial setup (users should change this)
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const admins = [
      {
        email: 'jjaramillo7@schools.nyc.gov',
        role: 'admin',
      },
      {
        email: 'NGreene4@schools.nyc.gov',
        role: 'admin',
      },
    ];

    console.log('Creating admin users...');
    
    for (const admin of admins) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: admin.email });
      
      if (existingUser) {
        console.log(`Admin ${admin.email} already exists.`);
        // Check if password needs updating (compare with plain password)
        const passwordMatch = await bcrypt.compare(defaultPassword, existingUser.password);
        if (!passwordMatch) {
          console.log(`Updating password for ${admin.email}...`);
          // Set plain password - pre-save hook will hash it
          existingUser.password = defaultPassword;
          await existingUser.save();
          console.log(`Password updated for ${admin.email}`);
        } else {
          console.log(`Password for ${admin.email} is already set correctly.`);
        }
      } else {
        // Create new user - password will be hashed by pre-save hook
        const newAdmin = new User({
          email: admin.email,
          password: defaultPassword, // Will be hashed by pre-save hook
          role: 'admin',
        });
        await newAdmin.save();
        console.log(`Created admin user: ${admin.email}`);
      }
    }

    console.log('Admin users seeded successfully!');
    console.log(`Default password: ${defaultPassword}`);
    console.log('Please change the password after first login.');
    
  } catch (error) {
    console.error('Error seeding admin users:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
