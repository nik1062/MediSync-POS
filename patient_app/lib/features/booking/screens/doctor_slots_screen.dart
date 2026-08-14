import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/auth_provider.dart';

class DoctorSlotsScreen extends ConsumerStatefulWidget {
  final String doctorUuid;
  const DoctorSlotsScreen({super.key, required this.doctorUuid});

  @override
  ConsumerState<DoctorSlotsScreen> createState() => _DoctorSlotsScreenState();
}

class _DoctorSlotsScreenState extends ConsumerState<DoctorSlotsScreen> {
  int _selectedDateIndex = 1; // Default to Mon 12
  String? _selectedSlot = '10:00 AM';
  final String clinicUuid = 'northside-cardiology';

  final List<Map<String, dynamic>> _dates = [
    {'day': 'Sun', 'date': '11', 'full': '2026-08-11'},
    {'day': 'Mon', 'date': '12', 'full': '2026-08-12'},
    {'day': 'Tue', 'date': '13', 'full': '2026-08-13'},
    {'day': 'Wed', 'date': '14', 'full': '2026-08-14'},
    {'day': 'Thu', 'date': '15', 'full': '2026-08-15'},
    {'day': 'Fri', 'date': '16', 'full': '2026-08-16'},
    {'day': 'Sat', 'date': '17', 'full': '2026-08-17'},
  ];

  final List<Map<String, dynamic>> _morningSlots = [
    {'time': '09:00 AM', 'available': true},
    {'time': '09:30 AM', 'available': false},
    {'time': '10:00 AM', 'available': true},
    {'time': '10:30 AM', 'available': true},
    {'time': '11:00 AM', 'available': true},
  ];

  final List<Map<String, dynamic>> _eveningSlots = [
    {'time': '02:00 PM', 'available': true},
    {'time': '02:30 PM', 'available': true},
    {'time': '03:00 PM', 'available': false},
    {'time': '03:30 PM', 'available': true},
    {'time': '04:00 PM', 'available': true},
    {'time': '04:30 PM', 'available': true},
  ];

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final familyMembers = authState.profile?.familyMembers ?? [];

    return Scaffold(
      backgroundColor: AppTheme.surfaceContainerLowest,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Stack(
              children: [
                Column(
                  children: [
                    // Header
                    Container(
                      height: 64,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: const BoxDecoration(
                        color: AppTheme.surface,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
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
                              const SizedBox(width: 4),
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
                            ],
                          ),
                          Container(
                            width: 34,
                            height: 34,
                            decoration: const BoxDecoration(
                              color: AppTheme.primary,
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: const Icon(
                              Icons.person,
                              color: AppTheme.onPrimary,
                              size: 20,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Scrollable Area
                    Expanded(
                      child: SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.only(bottom: 110),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Doctor Info Banner
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: const BoxDecoration(
                                border: Border(
                                  bottom: BorderSide(
                                    color: AppTheme.surfaceContainerLow,
                                    width: 1,
                                  ),
                                ),
                              ),
                              child: Row(
                                children: [
                                  // Doctor Avatar with online indicator
                                  Stack(
                                    children: [
                                      Container(
                                        width: 64,
                                        height: 64,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: AppTheme.surfaceContainerLow,
                                            width: 1,
                                          ),
                                          boxShadow: const [
                                            BoxShadow(
                                              color: Color(0x0A000000),
                                              blurRadius: 4,
                                              offset: Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: ClipOval(
                                          child: Image.network(
                                            'https://lh3.googleusercontent.com/aida-public/AB6AXuAWyoMSP3Kp2AIJurr2pJ_CJoM3mmPZrvd2hZwPElGWQBe6JzdDpawZMwDJ_5AZvZoEUGWWuVz5S71xk9G5iMBo4hu8MifKI4iwv8Uw8KuiJY1XN8rqUVUjtIAjDfnapDgR2-kU7h37tjeK6BNRX5GqdJwc2m15S073Iv1uSuX-3BId7F7kiqWbs2YhBt1UreVYfTuUfrYbJF6gA5sXJLcFe2cjhLYBC-ZqFP-04DQ5dVjTP2Mw-nHI',
                                            fit: BoxFit.cover,
                                            errorBuilder: (context, error, stackTrace) => Container(
                                              color: AppTheme.surfaceContainerHighest,
                                              alignment: Alignment.center,
                                              child: const Icon(
                                                Icons.person,
                                                color: AppTheme.primary,
                                                size: 36,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                      Positioned(
                                        bottom: 0,
                                        right: 0,
                                        child: Container(
                                          width: 14,
                                          height: 14,
                                          decoration: BoxDecoration(
                                            color: AppTheme.primaryFixedDim,
                                            shape: BoxShape.circle,
                                            border: Border.all(
                                              color: AppTheme.surfaceContainerLowest,
                                              width: 2,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Dr. Sarah Jenkins',
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.w700,
                                            color: AppTheme.onSurface,
                                            fontFamily: 'Inter',
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        const Text(
                                          'Senior Cardiologist',
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: AppTheme.onSurfaceVariant,
                                            fontFamily: 'Inter',
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: AppTheme.surfaceContainerLow,
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: const [
                                              Icon(
                                                Icons.payments_outlined,
                                                color: AppTheme.primary,
                                                size: 15,
                                              ),
                                              SizedBox(width: 5),
                                              Text(
                                                '\$150 Consultation Fee',
                                                style: TextStyle(
                                                  color: AppTheme.primary,
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w600,
                                                  fontFamily: 'Inter',
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Booking For Selector
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Booking for',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.onSurfaceVariant,
                                      fontFamily: 'Inter',
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12),
                                    decoration: BoxDecoration(
                                      color: AppTheme.surfaceContainerLow,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: AppTheme.outlineVariant.withValues(alpha: 0.3),
                                      ),
                                    ),
                                    child: DropdownButtonHideUnderline(
                                      child: DropdownButton<String>(
                                        value: authState.selectedMemberUuid ?? authState.profile?.patientUuid,
                                        isExpanded: true,
                                        icon: const Icon(Icons.keyboard_arrow_down, color: AppTheme.onSurfaceVariant),
                                        items: [
                                          DropdownMenuItem(
                                            value: authState.profile?.patientUuid ?? 'self',
                                            child: const Text(
                                              'Self (Primary Patient)',
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w500,
                                                color: AppTheme.onSurface,
                                                fontFamily: 'Inter',
                                              ),
                                            ),
                                          ),
                                          ...familyMembers.map(
                                            (m) => DropdownMenuItem(
                                              value: m.memberUuid,
                                              child: Text(
                                                m.fullName,
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w500,
                                                  color: AppTheme.onSurface,
                                                  fontFamily: 'Inter',
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                        onChanged: (val) {
                                          if (val != null) {
                                            ref.read(authProvider.notifier).selectFamilyMember(val);
                                          }
                                        },
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Select Date Section
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
                              child: const Text(
                                'Select Date',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.onSurfaceVariant,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ),
                            SizedBox(
                              height: 96,
                              child: ListView.separated(
                                scrollDirection: Axis.horizontal,
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                physics: const BouncingScrollPhysics(),
                                itemCount: _dates.length,
                                separatorBuilder: (context, index) => const SizedBox(width: 10),
                                itemBuilder: (context, index) {
                                  final item = _dates[index];
                                  final isSelected = _selectedDateIndex == index;

                                  return GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _selectedDateIndex = index;
                                      });
                                    },
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 180),
                                      width: 64,
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? AppTheme.primary
                                            : AppTheme.surfaceContainerLowest,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: isSelected
                                              ? AppTheme.primary
                                              : AppTheme.outlineVariant,
                                          width: 1,
                                        ),
                                        boxShadow: isSelected
                                            ? [
                                                BoxShadow(
                                                  color: AppTheme.primary.withValues(alpha: 0.3),
                                                  blurRadius: 8,
                                                  offset: const Offset(0, 4),
                                                ),
                                              ]
                                            : null,
                                      ),
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            item['day']!.toUpperCase(),
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                              letterSpacing: 0.5,
                                              color: isSelected
                                                  ? AppTheme.primaryFixed
                                                  : AppTheme.onSurfaceVariant,
                                              fontFamily: 'Inter',
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            item['date']!,
                                            style: TextStyle(
                                              fontSize: 20,
                                              fontWeight: FontWeight.w700,
                                              color: isSelected
                                                  ? AppTheme.onPrimary
                                                  : AppTheme.onSurface,
                                              fontFamily: 'Inter',
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(height: 16),

                            const Divider(height: 1, color: AppTheme.surfaceContainerLow),

                            // Morning Slots
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
                              child: Row(
                                children: const [
                                  Icon(
                                    Icons.wb_sunny,
                                    color: AppTheme.primary,
                                    size: 18,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Morning Slots',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.onSurface,
                                      fontFamily: 'Inter',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Wrap(
                                spacing: 10,
                                runSpacing: 10,
                                children: _morningSlots.map((slot) => _buildSlotChip(slot)).toList(),
                              ),
                            ),

                            // Evening Slots
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
                              child: Row(
                                children: const [
                                  Icon(
                                    Icons.nightlight_round,
                                    color: AppTheme.tertiary,
                                    size: 18,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Evening Slots',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.onSurface,
                                      fontFamily: 'Inter',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Wrap(
                                spacing: 10,
                                runSpacing: 10,
                                children: _eveningSlots.map((slot) => _buildSlotChip(slot)).toList(),
                              ),
                            ),
                            const SizedBox(height: 24),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                // Sticky Bottom Action Bar
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceContainerLowest,
                      border: const Border(
                        top: BorderSide(
                          color: AppTheme.surfaceContainerLow,
                          width: 1,
                        ),
                      ),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x0F1E293B),
                          blurRadius: 12,
                          offset: Offset(0, -4),
                        ),
                      ],
                    ),
                    child: SafeArea(
                      top: false,
                      child: ElevatedButton(
                        onPressed: _selectedSlot == null
                            ? null
                            : () {
                                final selectedDate = _dates[_selectedDateIndex]['full'];
                                final formattedSlot = '$selectedDate ${_selectedSlot!}';
                                context.push('/checkout', extra: {
                                  'doctorUuid': widget.doctorUuid,
                                  'clinicUuid': clinicUuid,
                                  'slotStartTime': formattedSlot,
                                });
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          disabledBackgroundColor: AppTheme.primary.withValues(alpha: 0.4),
                          foregroundColor: AppTheme.onPrimary,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Text(
                              'Proceed to Booking',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                fontFamily: 'Inter',
                              ),
                            ),
                            SizedBox(width: 8),
                            Icon(
                              Icons.arrow_forward,
                              size: 18,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSlotChip(Map<String, dynamic> slot) {
    final time = slot['time'] as String;
    final isAvailable = slot['available'] as bool;
    final isSelected = _selectedSlot == time;

    if (!isAvailable) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          color: AppTheme.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: AppTheme.outlineVariant.withValues(alpha: 0.4),
            width: 1,
          ),
        ),
        child: Text(
          time,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: AppTheme.onSurface.withValues(alpha: 0.4),
            fontFamily: 'Inter',
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedSlot = time;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary : AppTheme.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppTheme.primary : AppTheme.outlineVariant,
            width: 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.2),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          time,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? AppTheme.onPrimary : AppTheme.onSurface,
            fontFamily: 'Inter',
          ),
        ),
      ),
    );
  }
}
