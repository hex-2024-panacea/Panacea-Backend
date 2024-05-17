import { Response } from 'express';

const handleSuccess = (res:Response,statusCode:number,message:string,data: object|[]|null = null)=>{
  const responseData:{
    code:number,
    message?:string
    data?:object|[]|null
  } = {
    code:statusCode,
  };
  if(message){
    responseData.message = message;
  }
  if(data){
    responseData.data = data;
  }
  res.status(statusCode).json(responseData);
};
export default handleSuccess;