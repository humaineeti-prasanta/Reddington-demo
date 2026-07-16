import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  err.publicMessage = message;
  return err;
};

export const sanitize = (user) => {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
};

export const register = async ({ name, email, phone, password }) => {
  if (!name || !email || !phone || !password) {
    throw httpError(400, 'missing_fields');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash },
    });
    return sanitize(user);
  } catch (e) {
    if (e.code === 'P2002') throw httpError(409, 'email_taken');
    throw e;
  }
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw httpError(401, 'invalid_credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw httpError(401, 'invalid_credentials');
  return sanitize(user);
};
