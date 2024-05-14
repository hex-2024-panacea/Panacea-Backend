import { Request, Response, NextFunction } from 'express';

export type MiddlewareFun = (req: Request, res: Response, next: NextFunction) => Promise<void>;
