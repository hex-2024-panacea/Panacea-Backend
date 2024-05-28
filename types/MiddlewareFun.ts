import type { Response, NextFunction } from 'express';
import type UserRequest from '../types/UserRequest';
export type MiddlewareFun = (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
