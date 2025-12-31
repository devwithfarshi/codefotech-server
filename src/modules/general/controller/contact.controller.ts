import ApiResponse from '@/common/utils/apiResponse';
import asyncHandler from '@/common/utils/asyncHandler';
import sendEmail from '@/common/utils/sendEmail';
import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

const contactController: any = {
  contact: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, message, company, subject } = req.body;
    await sendEmail(
      'info@codefotech.com',
      `${name} wants to contact with CodeFoTech`,
      null,
      null,
      `<p>Name: ${name}</p>
<p>Email: ${email}</p>
<p>Phone: ${phone || 'N/A'}</p>
<p>Company: ${company || 'N/A'}</p>
<p>Subject: ${subject || 'N/A'}</p>
<p>Message: ${message.replace(/\n/g, '<br/>')}</p>`
    );
    const response = new ApiResponse(status.OK, null, 'Message sent successfully');
    res.status(response.statusCode).json(response);
  }),
};

export default contactController;
