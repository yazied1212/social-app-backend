import { model, Schema, Types } from "mongoose";
import {
  defaultPfp,
  gender,
  hashSync,
  pfpId,
  pfpUrl,
  provider,
  roles,
} from "../../utils/index.js";
//schema
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: [true, "email already exists"],
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === provider.system ? true : false;
      },
    },
    userName: {
      type: String,
      required: true,
      unique: [true, "name already exists"],
      minlength: 2,
      maxlength: 25,
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.provider === provider.system ? true : false;
      },
      unique: [true, "phone already exists"],
    },
    gender: { type: String, enum: gender },
    // isConfirmed:{type:Boolean,default:false},
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    profilePicture: { type: String, default: defaultPfp },
    profilePictureCloud: {
      secure_url: { type: String, default: pfpUrl },
      public_id: { type: String, default: pfpId },
    },
    coverPic: [String],
    provider: {
      type: String,
      enum: [provider.google, provider.system],
      default: provider.system,
    },
    role: { type: String, enum: Object.values(roles), default: roles.user },
    updatedBy: { type: Types.ObjectId },
    lastPassUpdate: { type: Date },
    twoStepVerification: { type: Boolean, default: false },
    friendRequests: [{ type: Types.ObjectId, ref: "User" }],
    friends: [{ type: Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, versionKey: false },
);

//index
userSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });

//middleware
userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hashSync(this.password);
  }

  return next();
});

userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.password) {
    update.password = hashSync(update.password);
    update.lastPassUpdate = Date.now();
  }

  return next();
});

//model
export const User = model("User", userSchema);
