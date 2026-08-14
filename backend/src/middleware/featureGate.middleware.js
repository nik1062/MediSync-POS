const { License, FeatureFlag } = require('../models');

/**
 * Feature gate middleware factory.
 * Independent of clinic-scoping: checks the clinic's active license plan against the route's feature flag.
 *
 * @param {string} featureKey - The feature key to check (e.g., 'billing_pos', 'pharmacy_module')
 * @param {string} minimumPlanFallback - Optional fallback name to display in the requiredPlan if the feature flag is missing.
 */
const requireFeature = (featureKey, minimumPlanFallback = 'PRO') => async (req, res, next) => {
  try {
    const clinicId = req.user && req.user.currentClinicId;
    if (!clinicId) {
      return res.status(403).json({ error: "feature_locked", requiredPlan: minimumPlanFallback, reason: "No clinic context available" });
    }

    const license = await License.findOne({ where: { clinicId } });
    if (!license || license.status === 'EXPIRED' || license.status === 'SUSPENDED') {
      return res.status(403).json({ error: "feature_locked", requiredPlan: minimumPlanFallback, reason: "No active subscription" });
    }

    const flag = await FeatureFlag.findOne({
      where: {
        plan: license.plan,
        featureKey: featureKey,
        enabled: true,
      },
    });

    if (!flag) {
      return res.status(403).json({ 
        error: "feature_locked", 
        requiredPlan: minimumPlanFallback // Frontend expects this exact structure to prompt "Upgrade to unlock"
      });
    }

    req.license = license;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireFeature;
