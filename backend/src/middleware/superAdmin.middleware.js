const ApiError = require('../utils/ApiError');

/**
 * Super Admin middleware.
 * Bypasses clinic restrictions entirely but is placed on a completely separate auth path/role.
 */
const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Access denied. Super Admin privileges required.');
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireSuperAdmin;
