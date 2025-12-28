import fs from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import getEmailQueue from '@/Queues/emailServices/emailQueue';
import transporter from '@/config/email';

const sendEmail = async (
  to: string,
  subject: string,
  templateName: string | null,
  context: Record<string, string | number> | null,
  text?: string
) => {
  let html = undefined;
  if (templateName && context) {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    html = template(context);
  }
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html: html || text,
    // text,
  };

  try {
    let info;
    if (process.env.REDIS_URL) {
      const queue = getEmailQueue();
      info = await queue.add(
        'email',
        { mailOptions },
        {
          // Override default options if needed for this specific job
          priority: 1, // Higher priority emails
          delay: 0, // Send immediately
          attempts: 5, // More attempts for critical emails
          jobId: `email-${to}-${Date.now()}`, // Custom job ID for tracking
        }
      );
      console.log('Email service using Redis');
      return info;
    } else {
      info = await transporter.sendMail(mailOptions);
      console.log('Email service using Nodemailer');
      return info;
    }
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

export default sendEmail;
