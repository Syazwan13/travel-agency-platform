const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    if (!options.email) {
        throw new Error("No recipient defined");
    }

    console.log(`Attempting to send email to: ${options.email}`);
    console.log(`SMTP Config - Host: ${process.env.SMTP_HOST}, Port: ${process.env.SMTP_PORT}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000, // 5 seconds
        socketTimeout: 10000 // 10 seconds
      });

      const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
      };

      try {
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP connection verified successfully');
        
        console.log('Sending email...');
        const info = await transporter.sendMail(message);
        console.log('Email sent successfully:', info.messageId);
        return info;
      } catch (error) {
        console.error('Email sending failed:', error.message);
        throw new Error(`Failed to send email: ${error.message}`);
      }
};

module.exports = sendEmail;



// const nodemailer = require("nodemailer");

// const sendEmail = async (options) => {
//     if (!options.email) {
//         throw new Error("No recipient defined");
//     }

//     // Create transporter
//     const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: process.env.SMTP_PORT,
//         auth: {
//             user: process.env.SMTP_EMAIL,
//             pass: process.env.SMTP_PASS
//         }
//     });

//     // Define email options
//     const mailOptions = {
//         from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//         html: options.html
//     };

//     // Send email
//     const info = await transporter.sendMail(mailOptions);
//     return info;
// };

// module.exports = sendEmail;