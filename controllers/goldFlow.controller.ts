import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
const { createCipheriv, createHash } = require('node:crypto');
const { MERCHANT_ID, NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV, VERSION } = process.env;
type genDataChainType = {
  MerchantOrderNo: string;
  TimeStamp: string;
  Amt: number;
  ItemDesc: string;
  Email: string;
};
// 建立訂單
export const createOrder = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  const { amt, itemDesc } = req.body;
  const timeStamp: number = Math.round(new Date().getTime() / 1000);
  const order: { [key: number]: genDataChainType } = {
    [timeStamp]: {
      Amt: 1000,
      ItemDesc: '這是一門課程',
      TimeStamp: timeStamp.toString(),
      MerchantOrderNo: timeStamp.toString(),
      Email: 'pp840405@gmail.com',
    },
  };
  const TradeInfo: string = createMpgAesEncrypt(order[timeStamp]);
  const TradeSha: string = createMpgShaEncrypt(TradeInfo);
  console.log('testAes', TradeInfo);
  console.log('testSha', TradeSha);
  // 檢查資料
  //   if (!amount || !currency || !paymentMethodId || !courseId) {
  //     return appErrorService(400, 'missing required fields', next);
  //   }

  return handleSuccess(res, 200, 'GET', {
    MerchantID: MERCHANT_ID,
    TradeSha,
    ...order,
    TradeInfo,
    timeStamp,
  });
});

function genDataChain(data: genDataChainType) {
  const { MerchantOrderNo, TimeStamp, Amt, ItemDesc, Email } = data;
  console.log(
    `MerchantID=${MERCHANT_ID}&RespondType=JSON&MerchantOrderNo=${MerchantOrderNo}&TimeStamp=${TimeStamp}&Version=${VERSION}&Amt=${Amt}&ItemDesc=${encodeURIComponent(ItemDesc)}&Email=${encodeURIComponent(Email)}`
  );
  return `MerchantID=${MERCHANT_ID}&RespondType=JSON&MerchantOrderNo=${MerchantOrderNo}&TimeStamp=${TimeStamp}&Version=${VERSION}&Amt=${Amt}&ItemDesc=${encodeURIComponent(ItemDesc)}&Email=${encodeURIComponent(Email)}`;
}

function createMpgAesEncrypt(TradeInfo: genDataChainType) {
  const encrypt = createCipheriv('aes256', NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV);
  const enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex');
  return enc + encrypt.final('hex');
}

function createMpgShaEncrypt(aesEncrypt: string) {
  const sha = createHash('sha256');
  const plainText = `HashKey=${NEWEBPAY_HASH_KEY}&${aesEncrypt}&HashIV=${NEWEBPAY_HASH_IV}`;
  return sha.update(plainText).digest('hex').toUpperCase();
}
