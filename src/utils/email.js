const nodemailer = require("nodemailer");
const catchAsysnc = require("../middleware/catchAsync");
const sendEmail = async (options) => {
  // 1) create transporter.
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   pass: process.env.EMAIL_PASSWORD,
    // },

    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "38962c41f9b986",
      pass: "19db4d17d5bbfd",
    },
  });
  // 2) define the email options.
  const mailOptions = {
    from: "Express shopping.PLC<hello@express.info/>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) actually send the email.
  await transporter.sendMail(mailOptions);
};
exports.sendEmail = catchAsysnc(async (req, res, next) => {
  const { email, subject, message } = req.body;
  await sendEmail({ email, subject, message });
  res.status(200).json({
    status: "success",
    message: "email sent successfully",
  });
});
