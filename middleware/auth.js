const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authorization = req.get('Authorization') || '';
  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({
      message: 'A Bearer token is required'
    });
  }

  try {
    const decoded = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    if (
      typeof decoded !== 'object' ||
      typeof decoded.userId !== 'string' ||
      !/^[a-fA-F0-9]{24}$/.test(decoded.userId)
    ) {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }

    req.userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }

  next();
}

module.exports = auth;