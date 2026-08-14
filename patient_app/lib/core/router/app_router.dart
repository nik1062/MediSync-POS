import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/home/screens/home_discovery_screen.dart';
import '../../features/home/screens/appointments_list_screen.dart';
import '../../features/home/screens/pill_reminders_screen.dart';
import '../../features/home/screens/settings_screen.dart';
import '../../features/home/screens/support_center_screen.dart';
import '../../features/booking/screens/clinic_profile_screen.dart';
import '../../features/booking/screens/doctor_slots_screen.dart';
import '../../features/booking/screens/checkout_screen.dart';
import '../../features/booking/screens/payment_success_screen.dart';
import '../../features/queue/screens/live_queue_hud_screen.dart';
import '../../features/records/screens/health_vault_screen.dart';
import '../../features/records/screens/prescription_viewer_screen.dart';
import '../../features/records/screens/lab_result_details_screen.dart';
import '../../features/auth/screens/phone_login_screen.dart';
import '../../features/auth/screens/profile_setup_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const PhoneLoginScreen(),
      ),
      GoRoute(
        path: '/profile-setup',
        builder: (context, state) => const ProfileSetupScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeDiscoveryScreen(),
      ),
      GoRoute(
        path: '/appointments',
        builder: (context, state) => const AppointmentsListScreen(),
      ),
      GoRoute(
        path: '/clinic/:clinicUuid',
        builder: (context, state) {
          final clinicUuid = state.pathParameters['clinicUuid'] ?? 'northside-cardiology';
          return ClinicProfileScreen(clinicUuid: clinicUuid);
        },
      ),
      GoRoute(
        path: '/pills',
        builder: (context, state) => const PillRemindersScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/support',
        builder: (context, state) => const SupportCenterScreen(),
      ),
      GoRoute(
        path: '/doctor/:doctorUuid',
        builder: (context, state) {
          final doctorUuid = state.pathParameters['doctorUuid']!;
          return DoctorSlotsScreen(doctorUuid: doctorUuid);
        },
      ),
      GoRoute(
        path: '/checkout',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return CheckoutScreen(
            doctorUuid: extra['doctorUuid'] ?? 'mock-doc-uuid',
            clinicUuid: extra['clinicUuid'] ?? 'mock-clinic-uuid',
            slotStartTime: extra['slotStartTime'] ?? '2026-08-15T10:30:00Z',
            doctorName: extra['doctorName'],
            specialty: extra['specialty'],
            clinicName: extra['clinicName'],
            fee: extra['fee'] != null ? (extra['fee'] as num).toDouble() : null,
          );
        },
      ),
      GoRoute(
        path: '/payment-success',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return PaymentSuccessScreen(
            appointmentUuid: extra['appointmentUuid'],
            doctorName: extra['doctorName'],
            date: extra['date'],
            time: extra['time'],
            clinicName: extra['clinicName'],
            paymentMethod: extra['paymentMethod'],
          );
        },
      ),
      GoRoute(
        path: '/queue/:appointmentUuid',
        builder: (context, state) {
          final appointmentUuid = state.pathParameters['appointmentUuid'] ?? 'sample-apt-uuid';
          return LiveQueueHudScreen(appointmentUuid: appointmentUuid);
        },
      ),
      GoRoute(
        path: '/records',
        builder: (context, state) => const HealthVaultScreen(),
      ),
      GoRoute(
        path: '/health-vault',
        builder: (context, state) => const HealthVaultScreen(),
      ),
      GoRoute(
        path: '/records/lab/:resultUuid',
        builder: (context, state) {
          final resultUuid = state.pathParameters['resultUuid'];
          return LabResultDetailsScreen(resultUuid: resultUuid);
        },
      ),
      GoRoute(
        path: '/records/lab',
        builder: (context, state) => const LabResultDetailsScreen(),
      ),
      GoRoute(
        path: '/records/:consultationUuid',
        builder: (context, state) {
          final consultationUuid = state.pathParameters['consultationUuid']!;
          return PrescriptionViewerScreen(consultationUuid: consultationUuid);
        },
      ),
    ],
  );
});
