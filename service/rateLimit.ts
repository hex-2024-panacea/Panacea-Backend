import { rateLimit } from 'express-rate-limit';
import appErrorService from './appErrorService';
import type { Response, NextFunction } from 'express';
import UserRequest from '../types/UserRequest';

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  keyGenerator: (req: UserRequest, res: Response): any => {
    return (req.user && req.user.id) || req.ip;
  },
  handler: (req: UserRequest, res: Response, next: NextFunction) => {
    return appErrorService(429, 'too many attempts', next);
  },
});

export default apiLimiter;
