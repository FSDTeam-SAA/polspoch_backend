import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";
import config from "../../config";
import { IUser, userModel } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    street: {
      type: String,
    },
    gender: {
      type: String,
    },
    location: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    companyName: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    resetPasswordOtp: { type: String, default: null },
    resetPasswordOtpExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        // extra safety layer
        delete ret.password;
        delete ret.otp;
        delete ret.otpExpires;
        delete ret.resetPasswordOtp;
        delete ret.resetPasswordOtpExpires;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (this: any, next: (err?: Error) => void) {
  // 🔹 password change না হলে hash করো না
  if (!this.isModified("password")) {
    return next();
  }

  // 🔹 password না থাকলে stop
  if (!this.password) {
    return next(new Error("Password is required"));
  }

  const saltRounds = Number(config.bcryptSaltRounds);

  // 🔹 saltRounds valid কিনা check
  if (!saltRounds) {
    return next(new Error("Bcrypt salt rounds not configured"));
  }

  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

userSchema.post("save", function (doc: any, next: (err?: Error) => void) {
  doc.password = "";
  next();
});

userSchema.statics.isPasswordMatch = async function (
  password: string,
  hashedPassword: string
) {
  return await bcrypt.compare(password, hashedPassword);
};

userSchema.statics.isUserExistByEmail = async function (
  email: string
): Promise<IUser | null> {
  return await User.findOne({ email });
};

userSchema.statics.isUserExistById = async function (
  _id: string
): Promise<IUser | null> {
  return await User.findOne({ _id });
};

export const User = model<IUser, userModel>("User", userSchema);
