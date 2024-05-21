const throttle = require('express-throttle');
import type { Request, Response, NextFunction } from 'express';
import appErrorService from './appErrorService';

interface Bucket {
  tokens: number;
}

const options = {
  burst: 5,
  period: '180s',
  on_throttled: function (req: Request, res: Response, next: NextFunction, bucket: Bucket) {
    return appErrorService(429, 'too many attempts', next);
  },
};

export default throttle(options);
