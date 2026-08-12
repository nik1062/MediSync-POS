const { Clinic, User, DoctorAvailability, Consultation } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const env = require('../config/env'); // to get configurable radius if needed

// Helper to calculate Haversine distance in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

const searchClinics = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 10; // Default 10km radius

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude query parameters are required.' });
    }

    // Swiggy/Zomato rule boundary calculation (1 degree lat ≈ 111km)
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos(lat * Math.PI / 180));

    const clinics = await Clinic.findAll({
      where: {
        subscriptionStatus: 'ACTIVE',
        latitude: { [Op.between]: [lat - latDelta, lat + latDelta] },
        longitude: { [Op.between]: [lng - lngDelta, lng + lngDelta] }
      },
      include: [{
        model: User,
        as: 'doctors',
        where: { role: 'DOCTOR' },
        required: false,
        include: [{
          model: DoctorAvailability,
          as: 'availabilities'
        }]
      }]
    });

    // Hard radius filtering (Haversine)
    const clinicsWithinRadius = clinics.map(c => {
      const distance = getDistanceFromLatLonInKm(lat, lng, c.latitude, c.longitude);
      return { ...c.toJSON(), distance };
    }).filter(c => c.distance <= radius);

    // Sort by distance
    clinicsWithinRadius.sort((a, b) => a.distance - b.distance);

    // Generate live available slots for each doctor found
    const clinicsWithSlots = await Promise.all(clinicsWithinRadius.map(async (clinic) => {
      const doctorsWithSlots = await Promise.all((clinic.doctors || []).map(async (doctor) => {
        const todayStr = moment().format('YYYY-MM-DD');
        const dayOfWeek = moment().day();
        const rule = (doctor.availabilities || []).find(a => a.dayOfWeek === dayOfWeek);
        
        let availableSlots = [];
        if (rule) {
          // Find booked sessions
          const startOfDay = moment.utc(todayStr).startOf('day').toDate();
          const endOfDay = moment.utc(todayStr).endOf('day').toDate();
          const booked = await Consultation.findAll({
            where: {
              doctorId: doctor.id,
              status: { [Op.notIn]: ['COMPLETED', 'CANCELLED'] },
              scheduledAt: { [Op.between]: [startOfDay, endOfDay] }
            }
          });
          const bookedTimes = booked.map(c => moment.utc(c.scheduledAt).format('HH:mm'));

          let current = moment.utc(`${todayStr} ${rule.startTime}`, 'YYYY-MM-DD HH:mm');
          const shiftEnd = moment.utc(`${todayStr} ${rule.endTime}`, 'YYYY-MM-DD HH:mm');
          const step = rule.slotDuration + (rule.bufferTime || 0);

          while (current.isBefore(shiftEnd)) {
            const slotEnd = moment(current).add(rule.slotDuration, 'minutes');
            if (slotEnd.isAfter(shiftEnd)) break;

            const timeStr = current.format('HH:mm');
            if (!bookedTimes.includes(timeStr)) {
              availableSlots.push({
                time: timeStr,
                datetime: current.toISOString()
              });
            }
            current.add(step, 'minutes');
          }
        }

        return {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          availableSlots
        };
      }));

      return {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        distance: clinic.distance,
        doctors: doctorsWithSlots
      };
    }));

    res.status(200).json({ success: true, data: clinicsWithSlots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { searchClinics };
