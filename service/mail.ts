import nodemailer from 'nodemailer';
import path from 'path';
import handleSuccess from './handleSuccess';
import { Response } from 'express';
import { temporarySignature } from './signature';
import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;
// const exphbs = require('express-handlebars');
const nodemailerHandlebars = require('nodemailer-express-handlebars');

const mailSender = process.env.MAIL_SENDER;

export const sendMail = async (options: object, res: Response) => {
  const GOOGLE_AUTH_CLIENTID = process.env.GOOGLE_AUTH_CLIENTID;
  const GOOGLE_AUTH_CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_SECRET;
  const GOOGLE_AUTH_REFRESH_TOKEN = process.env.GOOGLE_AUTH_REFRESH_TOKEN;

  const oauth2Client = new OAuth2(
    GOOGLE_AUTH_CLIENTID,
    GOOGLE_AUTH_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: GOOGLE_AUTH_REFRESH_TOKEN,
  });

  const accessToken = oauth2Client.getAccessToken();

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: mailSender,
      clientId: GOOGLE_AUTH_CLIENTID,
      clientSecret: GOOGLE_AUTH_CLIENT_SECRET,
      refreshToken: GOOGLE_AUTH_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  } as nodemailer.TransportOptions);

  const handlebarsOptions = {
    viewEngine: {
      extName: '.handlebars',
      partialsDir: path.join(__dirname, '..', 'templates'),
      layoutsDir: path.join(__dirname, '..', 'templates'),
      defaultLayout: 'emailTemplate.handlebars',
    },
    viewPath: path.join(__dirname, '..', 'templates'),
    extName: '.handlebars',
  };

  transporter.use('compile', nodemailerHandlebars(handlebarsOptions));

  await transporter.sendMail(options);

  handleSuccess(res, 200, 'email is sent');
};

export const registerMailSend = async (email: string, userId: string, res: Response) => {
  //webUrl 改成前端的 pageUrl 加上 temporaryUrl 的 expires,signature,userId
  const verifyUrl = `/api/auth/email-link/${userId}`;
  const signatureOb = temporarySignature(verifyUrl, 60, { userId: userId });

  const { expires, signature } = signatureOb;
  const webUrl = `${process.env.FRONTEND_URL}/login/${userId}?expires=${expires}&signature=${signature}`;

  let mailOptions = {
    from: mailSender,
    to: email,
    subject: '[Panacea] 驗證信箱',
    template: 'emailTemplate',
    context: {
      title: 'title',
      header: '親愛的使用者您好，感謝您註冊 Panacea！請點擊以下按鈕來驗證您的電子郵件地址，以完成您的註冊：',
      content: '如果您未註冊 Panacea，請忽略此郵件。此連結將在1小時後過期。',
      buttonLink: webUrl,
      buttonText: '驗證信箱',
    },
  };

  await sendMail(mailOptions, res);
};

export const forgetPasswordSend = async (email: string, userId: string, res: Response) => {
  //url 改成前端的 pageUrl 加上 temporaryUrl 的 expires,signature,userId
  const url = `/api/auth/reset-password/${userId}`;
  const signatureOb = temporarySignature(url, 60, { userId: userId });

  const { expires, signature } = signatureOb;
  const webUrl = `${process.env.FRONTEND_URL}/reset-password/${userId}?expires=${expires}&signature=${signature}`;

  let mailOptions = {
    from: mailSender,
    to: email,
    subject: '[Panacea] 重設密碼',
    template: 'emailTemplate',
    context: {
      title: 'title',
      header: '親愛的使用者您好，我們收到您的密碼重置請求。請點擊以下按鈕來重置您的密碼：',
      content: '如果您未請求重置密碼，請忽略此郵件。此按鈕將在1小時後過期。',
      buttonLink: webUrl,
      buttonText: '重設密碼',
    },
  };

  await sendMail(mailOptions, res);
};
