import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(recepient: string, text: string) {
  // let testAccount = await nodemailer.createTestAccount();
  // console.log("test acc : ", testAccount);

  let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "ab714df0f7d6d3",
      pass: "ccc25cd00e7c64",
    },
    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    // auth: {
    //   user: "mq2vqbmtdhu54w5c@ethereal.email",
    //   pass: "6YATmFdRj8tEnyrn9v",
    // },
  });

  const mailOptions = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: recepient,
    subject: "Hello ✔", // Subject line
    text: text,
    html: text,
  };

  // let info = await transporter.sendMail();
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });

  // console.log("Message sent: %s", info.messageId);
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
