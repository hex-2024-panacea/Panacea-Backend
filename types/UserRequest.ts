import type { Request } from 'express';

interface User {
  id: string;
}

interface UserRequest extends Request {
  user?: User;
}

export default UserRequest;
