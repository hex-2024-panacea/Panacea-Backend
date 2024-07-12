import { v4 as uuidv4 } from 'uuid';
import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';

const firebaseAdmin = require('firebase-admin');
const config = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_X509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(config),
  storageBucket: process.env.FIREBASE_URL,
});
const bucket = firebaseAdmin.storage().bucket();

// 上傳圖片
export const upload = handleErrorAsync(async (req: any, res: any, next: any) => {
  if (!req.file) {
    return appErrorService(400, 'No file uploaded.', next);
  }
  const originalExt = req.file.originalname.split('.').pop();
  const allowedExtensions = ['jpg', 'png', 'jpeg', 'gif', 'svg', 'webp']; // 圖片副檔名列表
  const allowedFileSize = 10 * 1024 * 1024; // 10MB

  if (!allowedExtensions.includes(originalExt.toLowerCase())) {
    return appErrorService(400, '請上傳圖片相關檔案', next);
  }

  if (req.file.size > allowedFileSize) {
    return appErrorService(400, '最大上傳 10 MB', next);
  }
  const filename = `${uuidv4()}.${originalExt}`;
  try {
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });
    blobStream.on('error', (err: any) => {
      return appErrorService(400, err, next);
    });
    blobStream.on('finish', async () => {
      // 構建公開 URL，供訪問
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      // 確保文件為公開訪問（如果需要）
      await blob.makePublic();
      // 返回文件的 URL
      return handleSuccess(res, 200, '圖片已成功上傳', { imageUrl: publicUrl });
    });
    blobStream.end(req.file.buffer);
  } catch (error: any) {
    return appErrorService(400, error.message, next);
  }
});
