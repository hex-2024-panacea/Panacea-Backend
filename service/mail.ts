import nodemailer from 'nodemailer';
import path from 'path';
import handleSuccess from './handleSuccess';
import { Response } from 'express';
import { temporaraySignature } from './signature';
import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;
const exphbs = require('express-handlebars');
const nodemailerHandlebars = require('nodemailer-express-handlebars');

const mailSender = process.env.MAIL_SENDER;

export const sendMail = async (options:object, res:Response)=>{
  const GOOGLE_AUTH_CLIENTID = process.env.GOOGLE_AUTH_CLIENTID;
  const GOOGLE_AUTH_CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_SECRET;
  const GOOGLE_AUTH_REFRESH_TOKEN = process.env.GOOGLE_AUTH_REFRESH_TOKEN;

  const oauth2Client = new OAuth2(
    GOOGLE_AUTH_CLIENTID, 
    GOOGLE_AUTH_CLIENT_SECRET, 
    'https://developers.google.com/oauthplayground' 
  );

  oauth2Client.setCredentials({
    refresh_token :GOOGLE_AUTH_REFRESH_TOKEN
  });

  const accessToken = oauth2Client.getAccessToken();

  let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
      type:'OAuth2',
      user:mailSender,
      clientId: GOOGLE_AUTH_CLIENTID,
      clientSecret: GOOGLE_AUTH_CLIENT_SECRET,
      refreshToken: GOOGLE_AUTH_REFRESH_TOKEN,
      accessToken: accessToken
    }
  } as nodemailer.TransportOptions);

  const handlebarsOptions = {
    viewEngine: {
      extName: '.handlebars',
      partialsDir: path.join(__dirname, '..', 'templates'), 
      layoutsDir: path.join(__dirname, '..', 'templates'), 
      defaultLayout: 'emailTemplate.handlebars' 
    },
    viewPath: path.join(__dirname, '..', 'templates'), 
    extName: '.handlebars'
  };

  transporter.use('compile', nodemailerHandlebars(handlebarsOptions));

  await transporter.sendMail(options);

  handleSuccess(res,200,'email is sent');
}

export const registerMailSend = async (email:string,userId:string,res:Response)=>{

  const verifyUrl = `/api/auth/verify/email/${userId}`;
  const temporarayUrl = temporaraySignature(verifyUrl,60,{userId:userId});
  
  let mailOptions = {
    from: mailSender,
    to: email,
    subject: '這是郵件標題',
    template:'emailTemplate',
    context:{
      title:'title',
      header:'header',
      content:'content',
      buttonLink:temporarayUrl,
      buttonText:'button'
    },
  };

  await sendMail(mailOptions,res);
}