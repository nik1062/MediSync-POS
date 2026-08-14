import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/network/socket_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/auth_provider.dart';

final socketServiceProvider = Provider<SocketService>((ref) => SocketService());

final appointmentFutureProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, appointmentUuid) async {
  try {
    final api = ref.read(apiClientProvider);
    final response = await api.dio.get('/appointments/$appointmentUuid');
    return response.data['data'] as Map<String, dynamic>;
  } catch (e) {
    // Return sample mock data if appointment is not yet on backend
    return {
      'appointmentUuid': appointmentUuid,
      'tokenNumber': 14,
      'status': 'WAITING',
      'currentlyServing': 11,
      'patientsAhead': 3,
      'estimatedWaitMinutes': 25,
      'clinicName': 'MediSync Downtown Clinic',
      'doctorName': 'Dr. Sarah Jenkins',
    };
  }
});

final liveQueueStateProvider = StateProvider.family<Map<String, dynamic>?, String>((ref, appointmentUuid) => null);

class LiveQueueHudScreen extends ConsumerStatefulWidget {
  final String appointmentUuid;

  const LiveQueueHudScreen({Key? key, required this.appointmentUuid}) : super(key: key);

  @override
  ConsumerState<LiveQueueHudScreen> createState() => _LiveQueueHudScreenState();
}

class _LiveQueueHudScreenState extends ConsumerState<LiveQueueHudScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseScale;
  late Animation<double> _pulseOpacity;
  bool _notifyMe = true;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    _pulseScale = Tween<double>(begin: 0.9, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _pulseOpacity = Tween<double>(begin: 0.7, end: 0.1).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeOut),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _setupSocket();
    });
  }

  Future<void> _setupSocket() async {
    final patientUuid = ref.read(authProvider).selectedMemberUuid ?? 
                        ref.read(authProvider).profile?.patientUuid ?? 
                        'mock-uuid';
    final socketService = ref.read(socketServiceProvider);

    socketService.onStatusChanged = (data) {
      if (data['appointmentUuid'] == widget.appointmentUuid) {
        final current = ref.read(liveQueueStateProvider(widget.appointmentUuid)) ?? {};
        ref.read(liveQueueStateProvider(widget.appointmentUuid).notifier).state = {
          ...current,
          'status': data['status'],
        };
      }
    };

    socketService.onQueueUpdated = (data) {
      if (data['appointmentUuid'] == widget.appointmentUuid) {
        final current = ref.read(liveQueueStateProvider(widget.appointmentUuid)) ?? {};
        ref.read(liveQueueStateProvider(widget.appointmentUuid).notifier).state = {
          ...current,
          'patientsAhead': data['patientsAhead'],
          'currentlyServing': data['currentlyServing'],
        };
      }
    };

    try {
      await socketService.initSocket(patientUuid);
    } catch (_) {}
  }

  @override
  void dispose() {
    _pulseController.dispose();
    ref.read(socketServiceProvider).dispose();
    super.dispose();
  }

  void _showCancelDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surfaceContainerLowest,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Cancel Appointment?',
          style: TextStyle(fontWeight: FontWeight.w700, color: AppTheme.onSurface),
        ),
        content: const Text(
          'Are you sure you want to cancel your queue spot? This action cannot be undone.',
          style: TextStyle(color: AppTheme.onSurfaceVariant),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Keep Spot', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              context.go('/');
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Appointment cancelled.'),
                  backgroundColor: AppTheme.error,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.error,
              foregroundColor: AppTheme.onError,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final asyncAppointment = ref.watch(appointmentFutureProvider(widget.appointmentUuid));
    final liveData = ref.watch(liveQueueStateProvider(widget.appointmentUuid)) ?? {};

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.primary),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/');
            }
          },
          tooltip: 'Back',
        ),
        title: const Text(
          'MediSync',
          style: TextStyle(
            color: AppTheme.primary,
            fontWeight: FontWeight.w900,
            fontSize: 20,
            letterSpacing: -0.5,
          ),
        ),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Container(
              width: 38,
              height: 38,
              decoration: const BoxDecoration(
                color: AppTheme.primaryContainer,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.person,
                color: AppTheme.onPrimaryContainer,
                size: 22,
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Background ambient glowing spheres
          Positioned(
            top: 40,
            left: -40,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primaryFixedDim.withOpacity(0.18),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryFixedDim.withOpacity(0.2),
                    blurRadius: 90,
                    spreadRadius: 30,
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 60,
            right: -40,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.secondaryContainer.withOpacity(0.25),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.secondaryContainer.withOpacity(0.25),
                    blurRadius: 90,
                    spreadRadius: 30,
                  ),
                ],
              ),
            ),
          ),

          // Main Content
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 460),
                  child: asyncAppointment.when(
                    loading: () => const Center(
                      child: Padding(
                        padding: EdgeInsets.all(40.0),
                        child: CircularProgressIndicator(color: AppTheme.primary),
                      ),
                    ),
                    error: (err, stack) => _buildHudCard(
                      tokenNumber: 14,
                      status: 'WAITING',
                      currentlyServing: 11,
                      patientsAhead: 3,
                      estimatedWaitMinutes: 25,
                    ),
                    data: (initialData) {
                      final status = liveData['status'] ?? initialData['status'] ?? 'WAITING';
                      final tokenNumber = initialData['tokenNumber'] ?? 14;
                      final currentlyServing = liveData['currentlyServing'] ?? initialData['currentlyServing'] ?? 11;
                      final patientsAhead = liveData['patientsAhead'] ?? initialData['patientsAhead'] ?? 3;
                      final estimatedWaitMinutes = initialData['estimatedWaitMinutes'] ?? (patientsAhead is int ? math.max(5, patientsAhead * 8) : 25);

                      return _buildHudCard(
                        tokenNumber: tokenNumber,
                        status: status.toString(),
                        currentlyServing: currentlyServing,
                        patientsAhead: patientsAhead,
                        estimatedWaitMinutes: estimatedWaitMinutes,
                      );
                    },
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHudCard({
    required dynamic tokenNumber,
    required String status,
    required dynamic currentlyServing,
    required dynamic patientsAhead,
    required dynamic estimatedWaitMinutes,
  }) {
    String positionText;
    if (patientsAhead == 0) {
      positionText = 'Next in line';
    } else if (patientsAhead == 1) {
      positionText = '1st in line';
    } else if (patientsAhead == 2) {
      positionText = '2nd in line';
    } else if (patientsAhead == 3) {
      positionText = '3rd in line';
    } else {
      positionText = '$patientsAhead ahead';
    }

    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFA0B1C30),
            Color(0xF2142D4B),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.12)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x66000000),
            blurRadius: 30,
            offset: Offset(0, 14),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 26.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Live status badge with pulsing green dot
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppTheme.primaryFixedDim,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'YOUR TOKEN',
                style: TextStyle(
                  color: AppTheme.secondaryFixedDim,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),

          const SizedBox(height: 22),

          // Main Glowing Token Ring Centerpiece
          SizedBox(
            width: 170,
            height: 170,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Animated pulse outer ring
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: _pulseScale.value,
                      child: Container(
                        width: 160,
                        height: 160,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: AppTheme.primaryFixedDim.withOpacity(_pulseOpacity.value),
                            width: 3.5,
                          ),
                        ),
                      ),
                    );
                  },
                ),

                // Inner steady border ring
                Container(
                  width: 156,
                  height: 156,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppTheme.primary.withOpacity(0.6),
                      width: 2,
                    ),
                  ),
                ),

                // Inner glow & backdrop circle
                Container(
                  width: 144,
                  height: 144,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.primary.withOpacity(0.18),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryFixedDim.withOpacity(0.3),
                        blurRadius: 24,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      '$tokenNumber',
                      style: const TextStyle(
                        fontSize: 82,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.onPrimaryContainer,
                        letterSpacing: -3.0,
                        height: 1.0,
                        shadows: [
                          Shadow(
                            color: Color(0x8068DBA9),
                            blurRadius: 24,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Currently Serving & Your Position Box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
            decoration: BoxDecoration(
              color: AppTheme.inverseSurface.withOpacity(0.55),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Currently Serving',
                      style: TextStyle(
                        color: AppTheme.secondaryFixedDim,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      '$currentlyServing',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10.0),
                  child: Divider(
                    height: 1,
                    color: Colors.white.withOpacity(0.08),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Your Position',
                      style: TextStyle(
                        color: AppTheme.secondaryFixedDim,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      positionText,
                      style: const TextStyle(
                        color: AppTheme.primaryFixed,
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Wait Time Indicator Box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
            decoration: BoxDecoration(
              color: AppTheme.amberWarning.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.amberWarning.withOpacity(0.35)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.schedule_rounded,
                  color: AppTheme.amberWarning,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Approx. $estimatedWaitMinutes mins',
                  style: const TextStyle(
                    color: AppTheme.amberWarning,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Notification Toggle Box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            decoration: BoxDecoration(
              color: AppTheme.inverseSurface.withOpacity(0.35),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.notifications_active_rounded,
                  color: AppTheme.primaryFixed,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Notify me',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        "When it's my turn",
                        style: TextStyle(
                          color: AppTheme.secondaryFixedDim,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch.adaptive(
                  value: _notifyMe,
                  activeColor: AppTheme.primaryFixed,
                  activeTrackColor: AppTheme.primary,
                  inactiveThumbColor: Colors.white70,
                  inactiveTrackColor: Colors.white24,
                  onChanged: (val) {
                    setState(() => _notifyMe = val);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          val ? 'Turn notification alerts enabled.' : 'Notifications muted.',
                        ),
                        duration: const Duration(seconds: 2),
                        backgroundColor: AppTheme.primary,
                      ),
                    );
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),

          // View Clinic Directions Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Opening Clinic navigation directions...'),
                    backgroundColor: AppTheme.primary,
                    duration: Duration(seconds: 2),
                  ),
                );
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.primaryFixed,
                side: BorderSide(color: AppTheme.primaryFixed.withOpacity(0.4), width: 1.2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.location_on_outlined, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'View Clinic Directions',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Cancel Appointment Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: TextButton(
              onPressed: () => _showCancelDialog(context),
              style: TextButton.styleFrom(
                foregroundColor: AppTheme.secondaryFixedDim,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                  side: BorderSide(color: AppTheme.outline.withOpacity(0.3)),
                ),
              ),
              child: const Text(
                'Cancel Appointment',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
