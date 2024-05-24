import appErrorService from './appErrorService';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import handleSuccess from './handleSuccess';
import OauthAccessToken from '../models/oauthAccessToken';
import type { ObjectId } from 'mongodb';
//checkUserExist
//create oauthAccessToken
export const createToken = async (userId: ObjectId, day: number) => {
  const accessToken = await OauthAccessToken.create({
    user: userId,
    name: 'PersonalAccessToken',
    expiresAt: new Date(Date.now() + 3600 * day * 1000),
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
export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
};
