const request = require('supertest');
const app = require('../src/app');
const http = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');
const { sequelize, User, Clinic, Appointment, License, FeatureFlag } = require('../src/models');
const { signToken } = require('../src/utils/token');
const socketConfig = require('../src/socket');

let server;
let serverPort;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  server = http.createServer(app);
  socketConfig.init(server);
  await new Promise((resolve) => {
    server.listen(0, () => {
      serverPort = server.address().port;
      resolve();
    });
  });
});

afterAll(async () => {
  await sequelize.close();
  server.close();
});

describe('Phase 1 Tests', () => {
  
  test('1. Cross-tenant leakage test', async () => {
    // Setup
    const clinicA = await Clinic.create({ name: 'Clinic A', address: 'A', latitude: 12.34, longitude: 56.78, subscriptionExpiresAt: new Date() });
    const clinicB = await Clinic.create({ name: 'Clinic B', address: 'B', latitude: 12.35, longitude: 56.79, subscriptionExpiresAt: new Date() });

    const docA = await User.create({ name: 'Dr. Smith', email: 'a@a.com', password: '123', role: 'DOCTOR', clinicId: clinicA.id });
    const docB = await User.create({ name: 'Dr. Smith', email: 'b@b.com', password: '123', role: 'DOCTOR', clinicId: clinicB.id });

    const apptA = await Appointment.create({ clinicId: clinicA.id, patientId: docA.id, doctorId: docA.id, scheduledAt: new Date() });
    const apptB = await Appointment.create({ clinicId: clinicB.id, patientId: docB.id, doctorId: docB.id, scheduledAt: new Date() });

    const tokenA = signToken({ id: docA.id, role: 'DOCTOR', authorizedClinicIds: [clinicA.id], currentClinicId: clinicA.id });
    
    // Action: query as Clinic A receptionist/doctor
    const response = await request(app)
      .get('/appointments')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-current-clinic-id', clinicA.id);

    // Assert
    expect(response.status).toBe(200);
    const body = JSON.stringify(response.body);
    expect(body).toContain(apptA.id);
    expect(body).not.toContain(apptB.id); // Must not leak B's data
  });

  test('2. Feature-gate test', async () => {
    // Setup
    const clinicFree = await Clinic.create({ name: 'Free Clinic', address: 'Free', latitude: 12.34, longitude: 56.78, subscriptionExpiresAt: new Date() });
    const docFree = await User.create({ name: 'Dr. Free', email: 'free@a.com', password: '123', role: 'DOCTOR', clinicId: clinicFree.id });
    const tokenFree = signToken({ id: docFree.id, role: 'DOCTOR', authorizedClinicIds: [clinicFree.id], currentClinicId: clinicFree.id });

    await License.create({ clinicId: clinicFree.id, plan: 'FREE', status: 'ACTIVE' });

    // Action
    const response = await request(app)
      .get('/api/pos/pharmacy-gated')
      .set('Authorization', `Bearer ${tokenFree}`)
      .set('x-current-clinic-id', clinicFree.id);

    // Assert
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'feature_locked');
  });

  test('3. Payment status integrity test', async () => {
    // Setup
    const clinic = await Clinic.create({ name: 'Pay Clinic', address: 'Pay', latitude: 12.34, longitude: 56.78, subscriptionExpiresAt: new Date() });
    const patient = await User.create({ name: 'Pat', email: 'pat@p.com', password: '123', role: 'PATIENT' });
    const appt = await Appointment.create({ clinicId: clinic.id, patientId: patient.id, doctorId: patient.id, scheduledAt: new Date() });
    
    const tokenPat = signToken({ id: patient.id, role: 'PATIENT', authorizedClinicIds: [], currentClinicId: null });

    // Try to spoof via direct API PUT
    const putRes = await request(app)
      .put(`/appointments/${appt.id}`)
      .set('Authorization', `Bearer ${tokenPat}`)
      .send({ paymentStatus: 'PAID_ONLINE' });
    
    expect(putRes.status).toBe(403); // or similar error

    // Try valid webhook
    const whRes = await request(app)
      .post(`/api/webhooks/razorpay`)
      .set('x-razorpay-signature', 'valid-signature')
      .send({ appointmentId: appt.id, status: 'captured' });
    
    expect(whRes.status).toBe(200);
    const updated = await Appointment.findByPk(appt.id);
    expect(updated.paymentStatus).toBe('PAID_ONLINE');

    // Try invalid webhook
    const whResBad = await request(app)
      .post(`/api/webhooks/razorpay`)
      .set('x-razorpay-signature', 'invalid-signature')
      .send({ appointmentId: appt.id, status: 'captured' });
    expect(whResBad.status).toBe(403);
  });

  test('4. Socket room isolation test & 5. Spoofing test', (done) => {
    // Setup 2 clients
    const clinicA = '11111111-1111-1111-1111-111111111111';
    const clinicB = '22222222-2222-2222-2222-222222222222';
    
    const tokenA = signToken({ id: 'uuid-a', role: 'DOCTOR', authorizedClinicIds: [clinicA], currentClinicId: clinicA });
    const tokenB = signToken({ id: 'uuid-b', role: 'DOCTOR', authorizedClinicIds: [clinicB], currentClinicId: clinicB });

    const clientA = new Client(`http://localhost:${serverPort}`, { auth: { token: tokenA } });
    const clientB = new Client(`http://localhost:${serverPort}`, { auth: { token: tokenB } });

    clientA.on('connect', () => {
      clientA.emit('join_clinic_room', { clinicId: clinicA });
    });

    clientB.on('connect', () => {
      // Test 5: Spoofing attempt
      clientB.emit('join_clinic_room', { clinicId: clinicA }); // B tries to join A
      clientB.emit('join_clinic_room', { clinicId: clinicB }); // B joins B
    });

    let bReceived = false;
    clientB.on('appointment_created', () => {
      bReceived = true;
    });

    clientA.on('appointment_created', (data) => {
      expect(data.msg).toBe('hello A');
      expect(bReceived).toBe(false); // B should not receive A's event
      
      clientA.disconnect();
      clientB.disconnect();
      done();
    });

    // Wait a bit for joins to complete then emit from server side
    setTimeout(() => {
      socketConfig.getIO().to(`clinic_${clinicA}`).emit('appointment_created', { msg: 'hello A' });
    }, 500);
  });
});
