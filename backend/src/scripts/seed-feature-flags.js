const sequelize = require('../config/database');
const { FeatureFlag } = require('../models');

const plans = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];

const featureMap = {
  // FREE plan
  'patient_registration': ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'],
  'appointments': ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'],
  'consultations': ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'],

  // STARTER plan
  'billing_module': ['STARTER', 'PRO', 'ENTERPRISE'],
  'prescription_module': ['STARTER', 'PRO', 'ENTERPRISE'],

  // PRO plan
  'pharmacy_module': ['PRO', 'ENTERPRISE'],
  'advanced_reports': ['PRO', 'ENTERPRISE'],
};

async function seedFeatureFlags() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Make sure tables exist
    await sequelize.sync();

    console.log('Seeding Feature Flags...');

    for (const plan of plans) {
      for (const [featureKey, allowedPlans] of Object.entries(featureMap)) {
        if (allowedPlans.includes(plan)) {
          await FeatureFlag.upsert({
            id: require('crypto').randomUUID(),
            plan,
            featureKey,
            enabled: true,
          });
        }
      }
    }

    console.log('Feature Flags seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Feature Flags:', error);
    process.exit(1);
  }
}

seedFeatureFlags();
