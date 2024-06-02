import { ObjectId } from 'mongodb';
import type { Response, NextFunction } from 'express';
import appErrorService from './appErrorService';
import handleSuccess from './handleSuccess';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import OauthAccessTokenModel from '../models/oauthAccessToken';
import { UserModel } from '../models/users';
import type UserRequest from '../types/UserRequest';
//checkUserExist
//create oauthAccessToken
export const createToken = async (userId: ObjectId, day: number) => {
  const accessToken = await OauthAccessTokenModel.create({
    user: userId,
    name: 'PersonalAccessToken',
    expiresAt: new Date(Date.now() + day * 24 * 3600 * 1000),
  });
  return accessToken;
};
//generateJwtSend
export const generateJwtSend = async (userId: ObjectId, res: Response) => {
  const secret = process.env.JWT_SECRET!;
  const expiresDay = process.env.JWT_EXPIRES_DAY!;

  const dayNum = extractDays(expiresDay);
  const oauthToken = await createToken(userId, dayNum);

  const jwtData = {
    id: userId,
    oauthTokenId: oauthToken.id,
  };
  const token = jwt.sign(jwtData, secret, {
    expiresIn: expiresDay,
  });
  const data = {
    token,
  };
  handleSuccess(res, 200, '', data);
};

const extractDays = (expiresIn: string) => {
  const match = expiresIn.match(/(\d+)d/);
  return match ? parseInt(match[1], 10) : 7;
};
//isAuth
export const isAuth = async (req: UserRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return appErrorService(401, 'unauthenticated', next);
  }

  try {
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as JwtPayload;
    const currentUser = await UserModel.findById(decoded.id);
    const oauthToken = await OauthAccessTokenModel.findOne({
      _id: decoded.oauthTokenId,
      user: decoded.id,
      isRevoked: false,
    });
    if (currentUser && oauthToken) {
      const { id, isCoach, approvalStatus, isAdmin } = currentUser;
      req.user = { id, isCoach, approvalStatus, isAdmin };
      return next();
    } else {
      return appErrorService(401, 'unauthenticated', next);
    }
  } catch (err) {
    return appErrorService(400, (err as Error).message, next);
  }
};
//revoked access token
export const revokeToken = async(userId: string)=>{
  await OauthAccessTokenModel.updateMany({
    user:userId,
    isRevoked:false
  },{
    isRevoked:true
  });
}
//isCoach
export const isCoach = (req: UserRequest, res: Response, next: NextFunction)=>{
  if(req.user){
    const { isCoach,approvalStatus} = req.user;
    if(isCoach && approvalStatus == 'success'){
      return next();
    }
  }
  return appErrorService(403, 'you are not a success coach', next);
};
