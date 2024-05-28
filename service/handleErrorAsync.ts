import type { Response, NextFunction } from 'express';
import { MiddlewareFun } from '../types/MiddlewareFun';
import type UserRequest from '../types/UserRequest';

const handleErrorAsync = (fun: MiddlewareFun) => {
  return function (req: UserRequest, res: Response, next: NextFunction) {
    return fun(req, res, next).catch((err: Error) => next(err));
  };
};

export default handleErrorAsync;
