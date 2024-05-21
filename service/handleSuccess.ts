import type { Response } from 'express';
type responseDataType = {
  code: number;
  message?: string;
  data?: object | [] | null;
};
const handleSuccess = (res: Response, statusCode: number, message: string, data: object | [] | null = null) => {
  const responseData: responseDataType = {
    code: statusCode,
  };
  if (message) {
    responseData.message = message;
  }
  if (data) {
    responseData.data = data;
  }
  res.status(statusCode).json(responseData);
};
export default handleSuccess;
