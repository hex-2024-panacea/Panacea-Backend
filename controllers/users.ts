import handleErrorAsync from "../service/handleErrorAsync";
import bcrypt from 'bcryptjs';

export const register = handleErrorAsync(async (req, res, next) => {
  //test
  let { email, password, name } = req.body
  password = await bcrypt.hash(req.body.password, 12)
  console.log(password);

  //確認 email、password、name
  //確認 email 是否已被註冊過
  //加密密碼
  //建立使用者
  //發送帳號驗證信
});

export const signIn = handleErrorAsync(async (req, res, next) => {
  //test
  let { email, password, name } = req.body
  password = await bcrypt.hash(req.body.password, 12)
  console.log(password);
  //確認 email,password
  //產生 token
});