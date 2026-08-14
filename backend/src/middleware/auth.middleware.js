const { verifyToken } = require('../utils/token');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token missing');
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    // Attach clinic scope data. The token payload should contain the list of authorized clinics.
    user.authorizedClinicIds = decoded.authorizedClinicIds || [];
    
    // The current clinic can be passed via a custom header or fallback to what's in the token
    user.currentClinicId = req.headers['x-current-clinic-id'] || decoded.currentClinicId || null;

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    next(err);
  }
};

module.exports = authenticate;
