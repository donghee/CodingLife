const nodeMailer = require("nodemailer");

exports.sendMail = async function(to, subject, body) {
  // let transporter = nodeMailer.createTransport({
  //     host: 'smtp.gmail.com',
  //     port: 465,
  //     secure: true,
  //     auth: {
  //         // should be replaced with real sender's account
  //         user: 'hello@gmail.com',
  //         pass: 'test'
  //     }
  // });
  
  let transporter = nodeMailer.createTransport({
    port: 25,
    host: 'localhost',
    tls: {
      rejectUnauthorized: false
    },
  });

  let mailOptions = {
      // should be replaced with real recipient's account
      from: 'dongheepark@cron.baribarilab.com',
      to: to,
      subject: subject,
      text: body
  };

  let info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
};
