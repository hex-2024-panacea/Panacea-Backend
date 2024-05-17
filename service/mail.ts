import nodemailer from 'nodemailer';
import {google} from 'googleapis';
const OAuth2 = google.auth.OAuth2;

export const sendMail = async (to:string,subject:string,text:string)=>{
  const GOOGLE_AUTH_CLIENTID = process.env.GOOGLE_AUTH_CLIENTID;
  const GOOGLE_AUTH_CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_SECRET;
  const GOOGLE_AUTH_REFRESH_TOKEN = process.env.GOOGLE_AUTH_REFRESH_TOKEN;

  const oauth2Client = new OAuth2(
    GOOGLE_AUTH_CLIENTID, 
    GOOGLE_AUTH_CLIENT_SECRET, 
    "https://developers.google.com/oauthplayground" 
  );

  oauth2Client.setCredentials({
    refresh_token :GOOGLE_AUTH_REFRESH_TOKEN
  });

  const accessToken = oauth2Client.getAccessToken();
  const mailSender = process.env.MAIL_SENDER;

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

  const mailOptions = {
    from:mailSender,
    to,
    subject,
    text
  };

  await transporter.sendMail(mailOptions);
}

export const registerMail = (email:string,userId:string)=>{

}