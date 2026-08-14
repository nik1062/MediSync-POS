import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/auth_provider.dart';

class AppointmentsListScreen extends ConsumerStatefulWidget {
  const AppointmentsListScreen({super.key});

  @override
  ConsumerState<AppointmentsListScreen> createState() => _AppointmentsListScreenState();
}

class _AppointmentsListScreenState extends ConsumerState<AppointmentsListScreen> {
  int _selectedTabIndex = 0; // 0: Upcoming, 1: Past

  final List<Map<String, dynamic>> _upcomingAppointments = [
    {
      'id': 'apt-101',
      'doctorUuid': 'dr-sarah-jenkins',
      'doctorName': 'Dr. Sarah Jenkins',
      'clinicName': 'Northside Cardiology Clinic',
      'dateTime': 'Mon, Oct 24 • 10:30 AM',
      'status': 'BOOKED',
      'avatarUrl': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXxbhcJR1cikk-NHV4RKVRJcEsJ5bYBzB2aMTsdTiR-RhsInRfLmZBgNIFefIeBaeqK_oF5_EQ9Zz4xxGQFWnPplz47ZkXSi6r9l3IDuZx34HqAsqiprPCcXo7rf8isFDM5_kARpMHpfknvfnbSikONBXZVne82ECt05gJvdWdpvD8jI4pTZoQ1FLs-xVBanDDbOGpD7hveehyQfWv_iD4TKRQLVkn4Wyzrn2Q2-o6tbR0wrQw-2Jw',
    },
    {
      'id': 'apt-102',
      'doctorUuid': 'dr-marcus-reynolds',
      'doctorName': 'Dr. Marcus Reynolds',
      'clinicName': 'City General Hospital',
      'dateTime': 'Wed, Nov 02 • 2:00 PM',
      'status': 'BOOKED',
      'initials': 'MR',
    },
  ];

  final List<Map<String, dynamic>> _pastAppointments = [
    {
      'id': 'apt-099',
      'doctorUuid': 'dr-emily-chen',
      'doctorName': 'Dr. Emily Chen',
      'clinicName': 'Westside Family Practice',
      'dateTime': 'Fri, Sep 15 • 9:00 AM',
      'status': 'COMPLETED',
      'avatarUrl': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmq0F0DHD1BY3rDL27foJWem7hVo0T5Bzhuvo3TRC5kfFqTNIcnZLCg0YrDTVpa97AAkXI2gnUvapbdwNF8Ycuu3tMM1mYQzsPbcvu_sIctM2gtJ_Bo9BoZJuoauX0XEig-1u2bkNiY8Amktu574EbRQrJXSAPaw2fkgSKZfZzfml7FmKWHunhcDDIpIPf-jl1oMZ08XEQkIfnfWNBga231zVJ9Fqx1F03n5mOj07j3hVRbgjfSgb3',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    String userInitials = 'UP';
    if (authState.profile?.fullName != null && authState.profile!.fullName.isNotEmpty) {
      final names = authState.profile!.fullName.trim().split(' ');
      if (names.length >= 2) {
        userInitials = '${names[0][0]}${names[1][0]}'.toUpperCase();
      } else if (names.isNotEmpty && names[0].isNotEmpty) {
        userInitials = names[0].substring(0, names[0].length >= 2 ? 2 : 1).toUpperCase();
      }
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              children: [
                // TopAppBar
                Container(
                  height: 64,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: const BoxDecoration(
                    color: AppTheme.surface,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        onPressed: () {
                          if (context.canPop()) {
                            context.pop();
                          } else {
                            context.go('/');
                          }
                        },
                        icon: const Icon(Icons.arrow_back, color: AppTheme.primary),
                        tooltip: 'Back',
                        splashRadius: 24,
                      ),
                      const Text(
                        'MediSync',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.primary,
                          letterSpacing: -0.5,
                          fontFamily: 'Inter',
                        ),
                      ),
                      GestureDetector(
                        onTap: () => context.push('/profile-setup'),
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceContainerHighest,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.tertiaryFixed, width: 1),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            userInitials,
                            style: const TextStyle(
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              fontFamily: 'Inter',
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Main Content
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                    physics: const BouncingScrollPhysics(),
                    children: [
                      // Header title
                      const Text(
                        'Appointments',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.onSurface,
                          letterSpacing: -0.5,
                          fontFamily: 'Inter',
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Manage your clinical visits.',
                        style: TextStyle(
                          fontSize: 15,
                          color: AppTheme.onSurfaceVariant,
                          fontFamily: 'Inter',
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Segmented Tab Bar
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceContainer,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppTheme.tertiaryFixed.withValues(alpha: 0.5),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _selectedTabIndex = 0),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: _selectedTabIndex == 0
                                        ? AppTheme.surfaceContainerLowest
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(8),
                                    boxShadow: _selectedTabIndex == 0
                                        ? const [
                                            BoxShadow(
                                              color: Color(0x0A1E293B),
                                              blurRadius: 4,
                                              offset: Offset(0, 2),
                                            ),
                                          ]
                                        : [],
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    'Upcoming',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: _selectedTabIndex == 0
                                          ? FontWeight.w700
                                          : FontWeight.w500,
                                      color: _selectedTabIndex == 0
                                          ? AppTheme.onSurface
                                          : AppTheme.onSurfaceVariant,
                                      fontFamily: 'Inter',
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _selectedTabIndex = 1),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: _selectedTabIndex == 1
                                        ? AppTheme.surfaceContainerLowest
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(8),
                                    boxShadow: _selectedTabIndex == 1
                                        ? const [
                                            BoxShadow(
                                              color: Color(0x0A1E293B),
                                              blurRadius: 4,
                                              offset: Offset(0, 2),
                                            ),
                                          ]
                                        : [],
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    'Past',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: _selectedTabIndex == 1
                                          ? FontWeight.w700
                                          : FontWeight.w500,
                                      color: _selectedTabIndex == 1
                                          ? AppTheme.onSurface
                                          : AppTheme.onSurfaceVariant,
                                      fontFamily: 'Inter',
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // List of Cards
                      if (_selectedTabIndex == 0) ...[
                        ..._upcomingAppointments.map((apt) => _buildAppointmentCard(context, apt, isPast: false)),
                      ] else ...[
                        ..._pastAppointments.map((apt) => _buildAppointmentCard(context, apt, isPast: true)),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(context, currentIndex: 3),
    );
  }

  Widget _buildAppointmentCard(BuildContext context, Map<String, dynamic> apt, {required bool isPast}) {
    final avatarUrl = apt['avatarUrl'] as String?;
    final initials = apt['initials'] as String?;
    final doctorName = apt['doctorName'] ?? 'Doctor';
    final clinicName = apt['clinicName'] ?? 'Clinic';
    final dateTime = apt['dateTime'] ?? '';
    final status = apt['status'] ?? 'BOOKED';
    final aptId = apt['id'] ?? 'apt-1';
    final doctorUuid = apt['doctorUuid'] ?? 'dr-sarah-jenkins';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppTheme.outlineVariant.withValues(alpha: 0.3),
          width: 1,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D1E293B),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Date & Status Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.calendar_today_outlined,
                      color: AppTheme.tertiaryContainer,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      dateTime,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.onSurfaceVariant,
                        fontFamily: 'Inter',
                      ),
                    ),
                  ],
                ),
                // Status Badge
                if (isPast)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.tertiaryFixed,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      status,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.onSurfaceVariant,
                        letterSpacing: 0.5,
                        fontFamily: 'Inter',
                      ),
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceContainerLowest,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppTheme.primary, width: 1),
                    ),
                    child: Text(
                      status,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary,
                        letterSpacing: 0.5,
                        fontFamily: 'Inter',
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 14),

            // Doctor Profile Row
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.surfaceVariant, width: 1),
                  ),
                  child: ClipOval(
                    child: avatarUrl != null
                        ? Image.network(
                            avatarUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              color: AppTheme.surfaceContainer,
                              alignment: Alignment.center,
                              child: Text(
                                initials ?? doctorName.substring(0, 2).toUpperCase(),
                                style: const TextStyle(
                                  color: AppTheme.primary,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          )
                        : Container(
                            color: AppTheme.surfaceContainer,
                            alignment: Alignment.center,
                            child: Text(
                              initials ?? 'DR',
                              style: const TextStyle(
                                color: AppTheme.primary,
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        doctorName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.onSurface,
                          fontFamily: 'Inter',
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(
                            Icons.domain,
                            color: AppTheme.onSurfaceVariant,
                            size: 15,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              clinicName,
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppTheme.onSurfaceVariant,
                                fontFamily: 'Inter',
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),

            if (!isPast) ...[
              const SizedBox(height: 16),
              Container(
                height: 1,
                color: AppTheme.tertiaryFixed,
              ),
              const SizedBox(height: 12),
              // Action Buttons Row
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        context.push('/doctor/$doctorUuid');
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.secondary,
                        side: const BorderSide(color: AppTheme.secondary, width: 1),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      child: const Text(
                        'Reschedule',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'Inter',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        context.push('/queue/$aptId');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: AppTheme.onPrimary,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      child: const Text(
                        'View Details',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'Inter',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ] else ...[
              const SizedBox(height: 12),
              Container(
                height: 1,
                color: AppTheme.tertiaryFixed,
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    context.push('/records/consultation-past-1');
                  },
                  icon: const Icon(Icons.description_outlined, size: 16),
                  label: const Text(
                    'View Consultation Records',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Inter',
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primary,
                    side: const BorderSide(color: AppTheme.primary, width: 1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNav(BuildContext context, {required int currentIndex}) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        boxShadow: [
          BoxShadow(
            color: Color(0x0D1E293B),
            blurRadius: 8,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Container(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                icon: Icons.home_outlined,
                label: 'Home',
                isActive: currentIndex == 0,
                onTap: () {
                  context.go('/');
                },
              ),
              _buildNavItem(
                icon: Icons.folder_shared_outlined,
                label: 'Records',
                isActive: currentIndex == 1,
                onTap: () {
                  context.push('/records/lab');
                },
              ),
              _buildNavItem(
                icon: Icons.medication_outlined,
                label: 'Pills',
                isActive: currentIndex == 2,
                onTap: () {
                  context.push('/pills');
                },
              ),
              _buildNavItem(
                icon: Icons.timer,
                label: 'Queue',
                isActive: currentIndex == 3,
                onTap: () {},
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    if (isActive) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            color: AppTheme.primaryContainer,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                color: AppTheme.onPrimaryContainer,
                size: 20,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  color: AppTheme.onPrimaryContainer,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                  fontFamily: 'Inter',
                ),
              ),
            ],
          ),
        ),
      );
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: AppTheme.onSurfaceVariant,
              size: 22,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                color: AppTheme.onSurfaceVariant,
                fontSize: 11,
                fontWeight: FontWeight.w500,
                fontFamily: 'Inter',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
