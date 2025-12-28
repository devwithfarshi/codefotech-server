import nodemailer from 'nodemailer';
const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: true,
  maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS!, 10),
  maxMessages: parseInt(process.env.SMTP_MAX_MESSAGES!, 10),
};

const transporter = nodemailer.createTransport(emailConfig);

// Function to test SMTP connection
export const testEmailConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    await transporter.verify();
    return {
      success: true,
      message: 'SMTP connection verified successfully',
    };
  } catch (error) {
    console.log('SMTP connection failed: ', { error });
    return {
      success: false,
      message: `SMTP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

// Function to send a test email
export const sendTestEmail = async (to: string): Promise<{ success: boolean; message: string }> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Test Email - SMTP Configuration',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<p>This is a test email to verify SMTP configuration.</p>',
    });

    return {
      success: true,
      message: `Test email sent successfully. Message ID: ${info.messageId}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

export default transporter;
