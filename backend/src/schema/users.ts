import zod from 'zod';

export const signUpSchema = zod.object({
  body: zod.object({
    email: zod.string().email(),
    name: zod.string().min(2).max(100),
    password: zod.string().min(6)
  })
});