require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE !== 'false',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

(async () => {
  try {
    await transporter.verify();

    console.log('SMTP AUTHENTICATION SUCCESS');

    const result = await transporter.sendMail({
      from: {
        name: 'Auronix Commerce LLC',
        address: process.env.SMTP_USER,
      },
      to: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
      subject: 'Auronix SMTP Test',
      text: 'SMTP is working correctly.',
      replyTo: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    });

    console.log('EMAIL SENT');
    console.log(result.messageId);
  } catch (error) {
    console.error('SMTP TEST FAILED');
    console.error(error);
    process.exit(1);
  }
})();
