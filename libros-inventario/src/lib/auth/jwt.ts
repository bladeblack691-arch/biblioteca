import jwt from 'jsonwebtoken';

export type JwtPayload = {
  sub: number;
  role: string;
  name: string;
  login: string;
};

export function signJwt(payload: JwtPayload, expiresIn: string = '8h') {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}
