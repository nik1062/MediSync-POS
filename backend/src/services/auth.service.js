const bcrypt = require('bcrypt');
const { User, DoctorProfile } = require('../models');
const { signToken } = require('../utils/token');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;

async function register(args) {
  const { name, email, password, role, specialization, yearsOfExperience } = args;
  
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({ name, email, password: hashedPassword, role });

  if (role === 'DOCTOR') {
    let clinicId = null;
    
    // B2B SaaS Onboarding: Create a new Clinic Tenant if provided
    if (args.clinicName) {
      const { Clinic, License } = require('../models');
      const clinic = await Clinic.create({
        name: args.clinicName,
        address: args.clinicAddress || 'Pending Address',
        latitude: args.clinicLatitude || 0,
        longitude: args.clinicLongitude || 0,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      clinicId = clinic.id;
      user.clinicId = clinicId;
      await user.save();
      
      // Also create the required License for the clinic
      let planType = 'PRO';
      if (args.plan && ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'].includes(args.plan.toUpperCase())) {
        planType = args.plan.toUpperCase();
      }
      await License.create({
        clinicId: clinicId,
        plan: planType,
        status: 'ACTIVE',
        trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    await DoctorProfile.create({
      userId: user.id,
      specialization,
      yearsOfExperience,
    });
  }

  const token = signToken({ id: user.id, role: user.role });

  return { token, user: sanitizeUser(user) };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ id: user.id, role: user.role });

  return { token, user: sanitizeUser(user) };
}

async function getProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [{ model: DoctorProfile, as: 'doctorProfile' }],
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
}

function sanitizeUser(user) {
  const plain = user.toJSON ? user.toJSON() : user;
  delete plain.password;
  return plain;
}

module.exports = { register, login, getProfile };
