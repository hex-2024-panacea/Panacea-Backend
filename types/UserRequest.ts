import type { Request } from 'express';

interface User {
  id: string;
  isCoach?: boolean;
}

interface UserRequest extends Request {
  user?: User;
}

export default UserRequest;
