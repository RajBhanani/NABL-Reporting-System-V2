import bcrypt from 'bcrypt';
import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  refreshToken?: string;
  comparePassword(inputPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      validate: {
        validator: (value: string) => {
          return /^[a-zA-Z0-9._%+-]+@sumichem\.co\.in$/.test(value);
        },
      },
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ['user', 'admin', 'superadmin'],
        message: '{VALUE} is not a valid role',
      },
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (inputPassword: string) {
  return await bcrypt.compare(inputPassword, this.password);
};

const User = model<IUser>('user', userSchema);

export default User;
