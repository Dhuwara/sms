import { ZodError } from 'zod';

/**
 * Express middleware factory — validates req.body against a Zod schema.
 * Usage:  router.post('/foo', validate(mySchema), controller);
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return res.status(400).json({ success: false, message: messages });
    }
    next(err);
  }
};

export default validate;
