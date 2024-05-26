import { ObjectId } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import appErrorService from './appErrorService';
import handleSuccess from './handleSuccess';
import jwt, { JwtPayload } from 'jsonwebtoken';
import OauthAccessToken from '../models/oauthAccessToken';
import User from '../models/users';
import UserRequest from '../types/UserRequest';
//checkUserExist
//create oauthAccessToken
export const createToken = async (userId: ObjectId, day: number) => {
  const accessToken = await OauthAccessToken.create({
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
export const isAuth = async (req: UserRequest,res: Response,next: NextFunction) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return appErrorService(401, 'unauthenticated', next);
  }
  
  try {
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as JwtPayload;
    const currentUser = await User.findById(decoded.id);
    const oauthToken = await OauthAccessToken.findOne({
      _id: decoded.oauthTokenId,
      user: decoded.id,
      isRevoked: false,
    });
    if (currentUser && oauthToken) {
      req.user = { id: currentUser.id };
      next();
    } else {
      return appErrorService(401, 'unauthenticated', next);
    }
  } catch (err) {
    return appErrorService(400, (err as Error).message, next);
  }
};
