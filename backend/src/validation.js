import { AppError } from './errors.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export const roles = ['ADMIN', 'USER', 'OWNER'];

export function assertName(name) {
  if (typeof name !== 'string' || name.trim().length < 20 || name.trim().length > 60) {
    throw new AppError(400, 'Name must be between 20 and 60 characters.');
  }
}

export function assertEmail(email) {
  if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
    throw new AppError(400, 'Email must be valid.');
  }
}

export function assertPassword(password) {
  if (typeof password !== 'string' || !passwordPattern.test(password)) {
    throw new AppError(
      400,
      'Password must be 8-16 characters and include one uppercase letter and one special character.'
    );
  }
}

export function assertAddress(address) {
  if (typeof address !== 'string' || address.trim().length === 0 || address.length > 400) {
    throw new AppError(400, 'Address is required and must be 400 characters or fewer.');
  }
}

export function assertRole(role) {
  if (!roles.includes(role)) {
    throw new AppError(400, 'Role must be ADMIN, USER, or OWNER.');
  }
}

export function assertRating(rating) {
  const value = Number(rating);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new AppError(400, 'Rating must be an integer from 1 to 5.');
  }
  return value;
}

export function validateUserInput({ name, email, password, address, role }, options = {}) {
  assertName(name);
  assertEmail(email);
  assertAddress(address);
  if (!options.skipPassword) assertPassword(password);
  if (role) assertRole(role);
}
