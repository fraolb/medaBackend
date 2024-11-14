const User = require("../models/User");
const UserVerification = require("../models/UserVerification");
const sendEmailVerification = require("../utils/otpVerification");
const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError, BadRequestError } = require("../errors");
const nodemailer = require("nodemailer");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({ ...req.body });
  const userV = {
    userId: user._id,
    otp: Math.floor(1000 + Math.random() * 9000), // Generate a random 4-digit OTP
  };
  const userVerification = await UserVerification.create(userV);
  // console.log(userVerification)
  await sendEmailVerification(userVerification.otp, user.email);
  const token = user.createJwt();
  res.status(StatusCodes.CREATED).json({
    token,
    user: {
      name: user.name,
      userotp: userVerification.otp,
      message: "OTP sent to your email address.",
    },
  });
};

const verifyUser = async (req, res) => {
  const { userId, name } = req.user;
  const { otp } = req.body;
  console.log(req.user);
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new UnauthenticatedError("Invalid User");
  }
  const verifyUser = await UserVerification.findOne({ userId });
  console.log(verifyUser);
  if (!verifyUser) {
    throw new UnauthenticatedError("Invalid User");
  }
  if (verifyUser.otp !== otp) {
    throw new UnauthenticatedError("Wrong OTP, check your email again");
  }
  if (verifyUser.expiresAt < Date.now()) {
    await User.findByIdAndDelete(verifyUser.userId);
    await UserVerification.findByIdAndDelete(verifyUser._id);
    throw new UnauthenticatedError(
      "Time for verification expired. Register again"
    );
  }

  await UserVerification.findOneAndRemove({ userId });
  const updateUser = await User.findByIdAndUpdate(
    userId,
    { verified: true },
    {
      new: true,
      runValidators: true,
    }
  );
  console.log(updateUser);
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: "User verified successfully!" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  //   console.log(email, password)
  if (!email || !password) {
    throw new BadRequestError("Please provide Email and Password!");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Email!");
  }
  if (user.verified == false) {
    const findUserVerfication = await UserVerification.findOne({
      userId: user._id,
    });
    if (!findUserVerfication) {
      throw new UnauthenticatedError("Invalid User");
    }
    if (findUserVerfication.expiresAt < Date.now()) {
      await User.findByIdAndDelete(user._id);
      await UserVerification.findByIdAndDelete(findUserVerfication._id);
      throw new UnauthenticatedError(
        "Your Email was not verified, Please Register again"
      );
    }
    throw new UnauthenticatedError("Your account is not verified");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  //   console.log("the password is ", isPasswordCorrect)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid password!");
  }
  const token = user.createJwt();
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
};

module.exports = { register, login, verifyUser };
