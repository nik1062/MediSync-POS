const ApiError = require('../utils/ApiError');

/**
 * Tenant scoping middleware.
 * Enforces that currentClinicId is set and is within the user's authorized clinicIds.
 * Must be placed AFTER authenticate middleware.
 */
const attachTenant = async (req, res, next) => {
  try {
    const currentClinicId = req.user.currentClinicId;
    const authorizedClinicIds = req.user.authorizedClinicIds || [];

    if (!currentClinicId) {
      throw new ApiError(400, 'currentClinicId is missing from the session/request');
    }

    if (!authorizedClinicIds.includes(currentClinicId)) {
      throw new ApiError(403, 'User is not authorized for this clinic');
    }

    // Attach to request for downstream handlers
    req.clinicId = currentClinicId;
    
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = attachTenant;
