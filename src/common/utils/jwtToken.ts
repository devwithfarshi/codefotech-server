import { IUser } from '@/modules/user/types/user.types';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

export const generateAccessToken = (user: IUser): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET as Secret;
  const expiresIn: jwt.SignOptions['expiresIn'] = (process.env.ACCESS_TOKEN_LIFE ||
    '7d') as jwt.SignOptions['expiresIn'];

  if (!secret) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }

  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign({ _id: user._id, email: user.email }, secret, options);
};

export const verifyAccessToken = (token: string): Pick<IUser, '_id' | 'email'> => {
  const secret = process.env.ACCESS_TOKEN_SECRET as Secret;

  if (!secret) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }

  return jwt.verify(token, secret) as Pick<IUser, '_id' | 'email'>;
};
