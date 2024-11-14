const mongoose = require("mongoose");

const userVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "userId is required to create a verification"],
    },
    otp: {
      type: String,
      required: [true, "otp is required to create a verification"],
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 300000),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserVerification", userVerificationSchema);
