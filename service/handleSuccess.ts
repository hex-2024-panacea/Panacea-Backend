import type { Response } from 'express';
type responseDataType = {
  code: number;
  message?: string;
  data?: object | [] | null;
  meta?: object | null;
};
const handleSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data: object | [] | null = null,
  meta: object | null = null,
) => {
  const responseData: responseDataType = {
    code: statusCode,
  };
  if (message) {
    responseData.message = message;
  }
  if (data) {
    responseData.data = data;
  }
  if (meta) {
    responseData.meta = meta;
  }
  res.status(statusCode).json(responseData);
};
export default handleSuccess;
