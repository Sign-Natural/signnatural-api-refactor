// src/middlewares/validate.js
export default function validate(schema) {
  return (req, res, next) => {
    const data = req.method === 'GET' ? req.query : req.body;
    const { error, value } = schema.validate(data, { abortEarly: false, allowUnknown: true });

    if (error) {
      res.status(400);
      const message = error.details.map((d) => d.message).join(', ');
      return next(new Error(message));
    }

    // replace body/query with validated value (optional)
    if (req.method === 'GET') req.query = value;
    else req.body = value;

    next();
  };
}
