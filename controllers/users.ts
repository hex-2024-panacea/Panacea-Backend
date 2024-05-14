import handleErrorAsync from "../service/handleErrorAsync";
import bcrypt from 'bcryptjs';

export const signup = handleErrorAsync(async (req, res, next) => {
  //test
  let { email, password, name } = req.body
  password = await bcrypt.hash(req.body.password, 12)
  console.log(password);
});