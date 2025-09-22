import validator from 'validator';

export const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return validator.escape(str.trim());
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

export const validateEmail = (email) => {
  return validator.isEmail(email) && email.length <= 254;
};

export const validatePassword = (password) => {
  return password && 
         password.length >= 8 && 
         password.length <= 128 &&
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
};

export const validatePhone = (phone) => {
  return validator.isMobilePhone(phone, 'any');
};