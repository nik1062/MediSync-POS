const { Server } = require('socket.io');
const { verifyToken } = require('./utils/token');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: '*', // Should be restricted in production
      },
    });

    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        if (!token) {
          return next(new Error('Authentication error'));
        }
        
        const decoded = verifyToken(token);
        socket.user = {
          id: decoded.id,
          role: decoded.role,
          authorizedClinicIds: decoded.authorizedClinicIds || [],
        };
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // 1. Clinic-wide room for Doctor App & Clinic Portal
      socket.on('join_clinic_room', ({ clinicId }) => {
        if (!clinicId) return;
        
        // Prevent spoofing: verify the clinicId is in the user's authorized list
        if (socket.user.role !== 'SUPER_ADMIN' && !socket.user.authorizedClinicIds.includes(clinicId)) {
          console.warn(`Socket ${socket.id} attempted to join unauthorized clinic ${clinicId}`);
          return; // silently ignore or emit an error
        }
        
        socket.join(`clinic_${clinicId}`);
        console.log(`Socket ${socket.id} joined clinic room: clinic_${clinicId}`);
      });

      // 2. Patient-specific room for tracking a single appointment
      socket.on('join_appointment_room', ({ appointmentId }) => {
        if (appointmentId) {
          socket.join(`appointment_${appointmentId}`);
          console.log(`Socket ${socket.id} joined appointment room: appointment_${appointmentId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};
