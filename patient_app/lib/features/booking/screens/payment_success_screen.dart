import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class PaymentSuccessScreen extends StatefulWidget {
  final String? appointmentUuid;
  final String? doctorName;
  final String? date;
  final String? time;
  final String? clinicName;
  final String? paymentMethod;

  const PaymentSuccessScreen({
    Key? key,
    this.appointmentUuid,
    this.doctorName,
    this.date,
    this.time,
    this.clinicName,
    this.paymentMethod,
  }) : super(key: key);

  @override
  State<PaymentSuccessScreen> createState() => _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends State<PaymentSuccessScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.94, end: 1.06).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final doctor = widget.doctorName ?? 'Dr. Sarah Jenkins';
    final appointmentDate = widget.date ?? 'Oct 24, 2023';
    final appointmentTime = widget.time ?? '10:30 AM';
    final targetAppointmentUuid = widget.appointmentUuid ?? 'sample-apt-uuid';

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Container(
                padding: const EdgeInsets.all(28.0),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x1A1E293B),
                      blurRadius: 20,
                      offset: Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Animated Pulsing Success Icon
                    AnimatedBuilder(
                      animation: _pulseAnimation,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _pulseAnimation.value,
                          child: Container(
                            width: 90,
                            height: 90,
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceContainerLow,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppTheme.primaryContainer.withOpacity(0.3),
                                width: 3,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryFixedDim.withOpacity(0.3),
                                  blurRadius: 18,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.check_circle_rounded,
                                size: 54,
                                color: AppTheme.primary,
                              ),
                            ),
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 22),

                    // Headline & Message
                    const Text(
                      'Success!',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.onSurface,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Your appointment has been confirmed.',
                      style: TextStyle(
                        fontSize: 15,
                        color: AppTheme.secondary,
                        fontWeight: FontWeight.w400,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: 24),

                    // Booking Details Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.6)),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x0D1E293B),
                            blurRadius: 4,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Booking Details',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.onSurfaceVariant,
                              letterSpacing: 0.1,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Divider(
                            height: 1,
                            color: AppTheme.outlineVariant.withOpacity(0.5),
                          ),
                          const SizedBox(height: 14),

                          // Doctor
                          _buildDetailRow(
                            icon: Icons.person_outline_rounded,
                            label: 'Doctor',
                            value: doctor,
                          ),

                          const SizedBox(height: 14),

                          // Date
                          _buildDetailRow(
                            icon: Icons.calendar_today_outlined,
                            label: 'Date',
                            value: appointmentDate,
                          ),

                          const SizedBox(height: 14),

                          // Time
                          _buildDetailRow(
                            icon: Icons.schedule_rounded,
                            label: 'Time',
                            value: appointmentTime,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 26),

                    // Primary Action: Add to Calendar
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Appointment saved to your device calendar!'),
                              backgroundColor: AppTheme.primary,
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: AppTheme.onPrimary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(25),
                          ),
                          elevation: 1,
                        ),
                        child: const Text(
                          'Add to Calendar',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Secondary Action: View Live Queue / Appointment
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: OutlinedButton(
                        onPressed: () {
                          context.go('/queue/$targetAppointmentUuid');
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.secondary,
                          side: const BorderSide(color: AppTheme.secondary, width: 1.2),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(25),
                          ),
                        ),
                        child: const Text(
                          'View Live Queue',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Return Home Text Button
                    TextButton(
                      onPressed: () => context.go('/'),
                      child: const Text(
                        'Return to Home',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: AppTheme.surfaceContainerLowest,
            shape: BoxShape.circle,
            border: Border.all(color: AppTheme.primary.withOpacity(0.15)),
          ),
          child: Icon(
            icon,
            size: 18,
            color: AppTheme.primary,
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.secondary,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppTheme.onSurface,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
