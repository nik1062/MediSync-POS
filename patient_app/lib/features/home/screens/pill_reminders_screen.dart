import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class PillRemindersScreen extends ConsumerStatefulWidget {
  const PillRemindersScreen({super.key});

  @override
  ConsumerState<PillRemindersScreen> createState() => _PillRemindersScreenState();
}

class _PillRemindersScreenState extends ConsumerState<PillRemindersScreen> {
  int _selectedDayIndex = 1; // Mon 15
  int _selectedNavIndex = 2; // Pills tab

  final List<Map<String, String>> _days = [
    {'day': 'SUN', 'date': '14'},
    {'day': 'MON', 'date': '15'},
    {'day': 'TUE', 'date': '16'},
    {'day': 'WED', 'date': '17'},
    {'day': 'THU', 'date': '18'},
    {'day': 'FRI', 'date': '19'},
    {'day': 'SAT', 'date': '20'},
  ];

  // Pill statuses
  bool _lisinoprilTaken = true;
  bool _metforminTaken = false;
  bool _amoxicillinTaken = false;
  bool _amoxicillinSkipped = false;
  bool _atorvastatinTaken = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: _buildAppBar(context),
      body: Column(
        children: [
          _buildDateSelector(),
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 96),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 700),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildMorningSection(),
                      const SizedBox(height: 24),
                      _buildAfternoonSection(),
                      const SizedBox(height: 24),
                      _buildNightSection(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: AppTheme.surfaceContainerLowest,
      surfaceTintColor: Colors.transparent,
      elevation: 0.5,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: AppTheme.onSurfaceVariant),
        tooltip: 'Back',
        onPressed: () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/');
          }
        },
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
      centerTitle: false,
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 16),
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerHighest,
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
            ),
            alignment: Alignment.center,
            child: const Text(
              'US',
              style: TextStyle(
                color: AppTheme.onSurfaceVariant,
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDateSelector() {
    return Container(
      color: AppTheme.surfaceContainerLowest,
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: SizedBox(
        height: 76,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: _days.length,
          separatorBuilder: (context, index) => const SizedBox(width: 8),
          itemBuilder: (context, index) {
            final isSelected = index == _selectedDayIndex;
            final day = _days[index];
            return GestureDetector(
              onTap: () {
                setState(() => _selectedDayIndex = index);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 56,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.primary : AppTheme.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected
                        ? AppTheme.primary
                        : AppTheme.outlineVariant.withOpacity(0.3),
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppTheme.primary.withOpacity(0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ]
                      : null,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      day['day']!,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isSelected ? AppTheme.onPrimary : AppTheme.onSurfaceVariant,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      day['date']!,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: isSelected ? AppTheme.onPrimary : AppTheme.onBackground,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildMorningSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.wb_sunny_rounded, color: AppTheme.primary, size: 24),
            const SizedBox(width: 8),
            const Text(
              'Morning',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppTheme.onBackground,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                '08:00 AM',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.onSurfaceVariant,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Taken Card (Lisinopril)
        _lisinoprilTaken
            ? Opacity(
                opacity: 0.7,
                child: Container(
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceContainerLowest,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF1E293B).withOpacity(0.04),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.medication_rounded, color: AppTheme.primary, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Lisinopril 10mg',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.onBackground,
                                decoration: TextDecoration.lineThrough,
                                decorationColor: AppTheme.outline,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Take with food',
                              style: TextStyle(
                                fontSize: 13,
                                color: AppTheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          setState(() => _lisinoprilTaken = false);
                        },
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: const BoxDecoration(
                            color: AppTheme.primary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check, color: AppTheme.onPrimary, size: 18),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            : _buildPendingCard(
                name: 'Lisinopril 10mg',
                instructions: 'Take with food',
                onMarkTaken: () {
                  setState(() => _lisinoprilTaken = true);
                },
              ),
        const SizedBox(height: 12),
        // Pending Card (Metformin)
        _metforminTaken
            ? Opacity(
                opacity: 0.7,
                child: Container(
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceContainerLowest,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.medication_rounded, color: AppTheme.primary, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Metformin 500mg',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.onBackground,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text('2 pills • After breakfast', style: TextStyle(fontSize: 13, color: AppTheme.onSurfaceVariant)),
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          setState(() => _metforminTaken = false);
                        },
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: const BoxDecoration(
                            color: AppTheme.primary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check, color: AppTheme.onPrimary, size: 18),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            : _buildPendingCard(
                name: 'Metformin 500mg',
                instructions: '2 pills • After breakfast',
                onMarkTaken: () {
                  setState(() => _metforminTaken = true);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Marked Metformin as taken!')),
                  );
                },
              ),
      ],
    );
  }

  Widget _buildPendingCard({
    required String name,
    required String instructions,
    required VoidCallback onMarkTaken,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E293B).withOpacity(0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: IntrinsicHeight(
        child: Row(
          children: [
            Container(
              width: 4,
              color: AppTheme.primary,
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerLow,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.medication_outlined, color: AppTheme.primary, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.onBackground,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            instructions,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppTheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: onMarkTaken,
                      icon: const Icon(Icons.done, size: 16),
                      label: const Text('Mark as taken'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: AppTheme.onPrimary,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                        elevation: 0,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAfternoonSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.wb_cloudy_rounded, color: AppTheme.secondary, size: 24),
            const SizedBox(width: 8),
            const Text(
              'Afternoon',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppTheme.onBackground,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                '02:00 PM',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.onSurfaceVariant,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Missed Card (Amoxicillin)
        if (_amoxicillinTaken)
          Opacity(
            opacity: 0.7,
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
              ),
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.medication_rounded, color: AppTheme.primary, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Amoxicillin 250mg',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.onBackground,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text('Taken late', style: TextStyle(fontSize: 13, color: AppTheme.onSurfaceVariant)),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      setState(() => _amoxicillinTaken = false);
                    },
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: const BoxDecoration(
                        color: AppTheme.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check, color: AppTheme.onPrimary, size: 18),
                    ),
                  ),
                ],
              ),
            ),
          )
        else if (_amoxicillinSkipped)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Amoxicillin 250mg (Skipped)',
                  style: TextStyle(color: AppTheme.secondary, fontWeight: FontWeight.w600),
                ),
                TextButton(
                  onPressed: () {
                    setState(() => _amoxicillinSkipped = false);
                  },
                  child: const Text('Undo'),
                ),
              ],
            ),
          )
        else
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFFFDAD6).withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.error.withOpacity(0.3)),
            ),
            clipBehavior: Clip.antiAlias,
            child: IntrinsicHeight(
              child: Row(
                children: [
                  Container(
                    width: 4,
                    color: AppTheme.error,
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFDAD6),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.vaccines_rounded, color: AppTheme.error, size: 22),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Amoxicillin 250mg',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: AppTheme.onBackground,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: const [
                                        Icon(Icons.warning_amber_rounded, size: 14, color: AppTheme.error),
                                        SizedBox(width: 4),
                                        Text(
                                          'Missed Dose',
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                            color: AppTheme.error,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              OutlinedButton(
                                onPressed: () {
                                  setState(() => _amoxicillinSkipped = true);
                                },
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: AppTheme.outlineVariant),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                ),
                                child: const Text(
                                  'Skip',
                                  style: TextStyle(color: AppTheme.onSurfaceVariant, fontWeight: FontWeight.w600),
                                ),
                              ),
                              const SizedBox(width: 10),
                              ElevatedButton(
                                onPressed: () {
                                  setState(() => _amoxicillinTaken = true);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Recorded missed dose as taken now!')),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.error,
                                  foregroundColor: AppTheme.onError,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                                  elevation: 0,
                                ),
                                child: const Text(
                                  'Take Now',
                                  style: TextStyle(fontWeight: FontWeight.w700),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildNightSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.bedtime_rounded, color: Color(0xFF213145), size: 24),
            const SizedBox(width: 8),
            const Text(
              'Night',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppTheme.onBackground,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                '09:00 PM',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.onSurfaceVariant,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Future Card (Atorvastatin)
        Container(
          decoration: BoxDecoration(
            color: AppTheme.surfaceContainerLowest,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF1E293B).withOpacity(0.04),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLow,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.medical_information_outlined, color: AppTheme.secondary, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Atorvastatin 20mg',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: _atorvastatinTaken ? FontWeight.w500 : FontWeight.w700,
                        color: AppTheme.onBackground,
                        decoration: _atorvastatinTaken ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      '1 pill • Before bed',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppTheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              OutlinedButton(
                onPressed: () {
                  setState(() => _atorvastatinTaken = !_atorvastatinTaken);
                },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(
                    color: _atorvastatinTaken ? AppTheme.primary : AppTheme.outlineVariant,
                  ),
                  backgroundColor: _atorvastatinTaken ? AppTheme.primary.withOpacity(0.1) : null,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
                child: Text(
                  _atorvastatinTaken ? 'Taken' : 'Mark as taken',
                  style: TextStyle(
                    color: _atorvastatinTaken ? AppTheme.primary : AppTheme.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    return NavigationBar(
      selectedIndex: _selectedNavIndex,
      backgroundColor: AppTheme.surfaceContainerLowest,
      surfaceTintColor: Colors.transparent,
      elevation: 4,
      onDestinationSelected: (index) {
        setState(() => _selectedNavIndex = index);
        if (index == 0) {
          context.go('/');
        } else if (index == 1) {
          context.push('/records/sample-consultation-uuid');
        } else if (index == 3) {
          context.push('/queue/sample-appointment-uuid');
        }
      },
      destinations: const [
        NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
        NavigationDestination(icon: Icon(Icons.folder_shared_outlined), selectedIcon: Icon(Icons.folder_shared), label: 'Records'),
        NavigationDestination(icon: Icon(Icons.medical_services_outlined), selectedIcon: Icon(Icons.medical_services), label: 'Pills'),
        NavigationDestination(icon: Icon(Icons.hourglass_empty_outlined), selectedIcon: Icon(Icons.hourglass_empty), label: 'Queue'),
      ],
    );
  }
}
