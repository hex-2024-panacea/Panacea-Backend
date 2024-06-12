const { createCipheriv, createHash } = require('node:crypto');
const { MERCHANT_ID, NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV, VERSION } = process.env;

export type genDataChainType = {
  MerchantOrderNo: string;
  TimeStamp: string;
  Amt: string;
  ItemDesc: string;
  Email?: string;
};
function genDataChain(data: genDataChainType) {
  const { MerchantOrderNo, TimeStamp, Amt, ItemDesc, Email } = data;
  return `MerchantID=${MERCHANT_ID}&RespondType=JSON&MerchantOrderNo=${MerchantOrderNo}&TimeStamp=${TimeStamp}&Version=${VERSION}&Amt=${Amt}&ItemDesc=${encodeURIComponent(ItemDesc)}&Email=${encodeURIComponent(Email as string)}`;
}

export const createMpgAesEncrypt = (TradeInfo: genDataChainType) => {
  const encrypt = createCipheriv('aes256', NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV);
  const enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex');
  return enc + encrypt.final('hex');
};
export const createMpgShaEncrypt = (aesEncrypt: string) => {
  const sha = createHash('sha256');
  const plainText = `HashKey=${NEWEBPAY_HASH_KEY}&${aesEncrypt}&HashIV=${NEWEBPAY_HASH_IV}`;
  return sha.update(plainText).digest('hex').toUpperCase();
};
