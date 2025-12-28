import { IUser } from '../modules/user/types/user.types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
    interface User extends IUser {}
  }
}
