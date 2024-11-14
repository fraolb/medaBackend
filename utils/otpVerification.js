const nodemailer = require("nodemailer");

const sendEmailVerification = async (otp, email) => {
  console.log(email, otp);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "Addis.Couture@gmail.com",
      pass: process.env.MAIL_ID,
    },
  });

  const mailOptions = {
    from: "Addis.Couture@gmail.com",
    to: email,
    subject: "OTP Verification",
    text: `This is otp sent from Addis Couture, ${otp}`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("email send successfully ", info);
    }
  });
};

module.exports = sendEmailVerification;
