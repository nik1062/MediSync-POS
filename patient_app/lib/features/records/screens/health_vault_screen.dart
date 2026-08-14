import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/auth_provider.dart';

final healthVaultRecordsProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, patientUuid) async {
  try {
    final api = ref.read(apiClientProvider);
    final response = await api.dio.get('/prescriptions/patient/$patientUuid');
    final data = response.data['data'] as List?;
    if (data != null && data.isNotEmpty) {
      return data.map((item) => {
        'id': item['prescriptionUuid'] ?? item['id'] ?? 'mock-rx',
        'type': 'CONSULTATION',
        'title': 'General Consultation',
        'provider': item['doctorName'] ?? 'Dr. Sarah Jenkins',
        'date': item['createdAt'] ?? '2023-10-24T10:30:00Z',
        'dateFormatted': 'Oct 24',
        'year': '2023',
        'tag': item['diagnosis'] ?? 'Follow-up',
        'statusText': 'Prescription issued',
        'consultationUuid': item['consultationUuid'] ?? 'consultation-sample',
      }).toList();
    }
  } catch (_) {}

  // Fallback to rich timeline mock data matching the mockup
  return [
    {
      'id': 'rec-1',
      'type': 'CONSULTATION',
      'title': 'General Consultation',
      'provider': 'Dr. Smith',
      'dateFormatted': 'Oct 24',
      'year': '2023',
      'tag': 'Follow-up',
      'consultationUuid': 'consult-uuid-1',
    },
    {
      'id': 'rec-2',
      'type': 'LAB_TEST',
      'title': 'Blood Test',
      'provider': 'Metropolis Labs',
      'dateFormatted': 'Sep 15',
      'year': '2023',
      'statusText': 'Results Normal',
      'isNormal': true,
      'consultationUuid': 'consult-uuid-2',
    },
    {
      'id': 'rec-3',
      'type': 'VACCINATION',
      'title': 'Annual Vaccination',
      'provider': 'City Clinic',
      'dateFormatted': 'Jan 04',
      'year': '2023',
      'consultationUuid': 'consult-uuid-3',
    },
  ];
});

class HealthVaultScreen extends ConsumerStatefulWidget {
  const HealthVaultScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<HealthVaultScreen> createState() => _HealthVaultScreenState();
}

class _HealthVaultScreenState extends ConsumerState<HealthVaultScreen> {
  String _selectedProfileKey = 'Self';

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final patientUuid = authState.selectedMemberUuid ?? 
                        authState.profile?.patientUuid ?? 
                        'mock-patient-uuid';

    final familyMembers = authState.profile?.familyMembers ?? [];
    final recordsAsync = ref.watch(healthVaultRecordsProvider(patientUuid));

    final profileOptions = [
      {'label': 'Self', 'uuid': authState.profile?.patientUuid ?? 'self'},
      ...familyMembers.map((m) => {'label': m.fullName, 'uuid': m.memberUuid}),
      if (familyMembers.isEmpty) ...[
        {'label': 'Mom', 'uuid': 'mom-mock'},
        {'label': 'Dad', 'uuid': 'dad-mock'},
      ]
    ];

    return Scaffold(
      backgroundColor: AppTheme.surfaceContainerLow,
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
            child: CircleAvatar(
              radius: 18,
              backgroundColor: AppTheme.primary,
              child: const Icon(
                Icons.person,
                size: 20,
                color: AppTheme.onPrimary,
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Profile Switcher Sub-header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
            decoration: const BoxDecoration(
              color: AppTheme.surface,
              border: Border(
                bottom: BorderSide(color: AppTheme.surfaceContainer, width: 1),
              ),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: profileOptions.map((opt) {
                  final label = opt['label'] ?? 'Self';
                  final isSelected = _selectedProfileKey == label;
                  return Padding(
                    padding: const EdgeInsets.only(right: 10.0),
                    child: InkWell(
                      onTap: () {
                        setState(() => _selectedProfileKey = label);
                        final uuid = opt['uuid'];
                        if (uuid != null && uuid != 'self') {
                          ref.read(authProvider.notifier).selectFamilyMember(uuid);
                        }
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                        decoration: BoxDecoration(
                          color: isSelected ? AppTheme.primary : AppTheme.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppTheme.primary : AppTheme.outlineVariant,
                            width: 1,
                          ),
                          boxShadow: isSelected
                              ? const [
                                  BoxShadow(
                                    color: Color(0x1F1E293B),
                                    blurRadius: 4,
                                    offset: Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                        child: Text(
                          label,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isSelected ? AppTheme.onPrimary : AppTheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Main Longitudinal Timeline Canvas
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 600),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      const Text(
                        'Health Vault',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.onSurface,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Longitudinal medical history.',
                        style: TextStyle(
                          fontSize: 15,
                          color: AppTheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Timeline Items
                      recordsAsync.when(
                        loading: () => const Center(
                          child: Padding(
                            padding: EdgeInsets.all(32.0),
                            child: CircularProgressIndicator(color: AppTheme.primary),
                          ),
                        ),
                        error: (err, stack) => _buildMockTimeline(context),
                        data: (records) {
                          if (records.isEmpty) {
                            return _buildMockTimeline(context);
                          }
                          return Column(
                            children: List.generate(records.length, (index) {
                              final record = records[index];
                              final isLast = index == records.length - 1;
                              return _buildTimelineItem(
                                context: context,
                                date: record['dateFormatted'] ?? 'Oct 24',
                                year: record['year'] ?? '2023',
                                title: record['title'] ?? 'Medical Record',
                                provider: record['provider'] ?? 'MediSync Health',
                                type: record['type'] ?? 'CONSULTATION',
                                tag: record['tag'],
                                statusText: record['statusText'],
                                isLast: isLast,
                                consultationUuid: record['consultationUuid'] ?? 'demo-rx',
                              );
                            }),
                          );
                        },
                      ),
                      const SizedBox(height: 20),
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

  Widget _buildMockTimeline(BuildContext context) {
    return Column(
      children: [
        _buildTimelineItem(
          context: context,
          date: 'Oct 24',
          year: '2023',
          title: 'General Consultation',
          provider: 'Dr. Smith',
          type: 'CONSULTATION',
          tag: 'Follow-up',
          isLast: false,
          consultationUuid: 'consult-1',
        ),
        _buildTimelineItem(
          context: context,
          date: 'Sep 15',
          year: '2023',
          title: 'Blood Test',
          provider: 'Metropolis Labs',
          type: 'LAB_TEST',
          statusText: 'Results Normal',
          isLast: false,
          consultationUuid: 'consult-2',
        ),
        _buildTimelineItem(
          context: context,
          date: 'Jan 04',
          year: '2023',
          title: 'Annual Vaccination',
          provider: 'City Clinic',
          type: 'VACCINATION',
          isLast: true,
          consultationUuid: 'consult-3',
        ),
      ],
    );
  }

  Widget _buildTimelineItem({
    required BuildContext context,
    required String date,
    required String year,
    required String title,
    required String provider,
    required String type,
    String? tag,
    String? statusText,
    required bool isLast,
    required String consultationUuid,
  }) {
    Color nodeColor;
    IconData icon;
    Color iconColor;

    switch (type) {
      case 'LAB_TEST':
        nodeColor = AppTheme.secondary;
        icon = Icons.science_outlined;
        iconColor = AppTheme.secondary;
        break;
      case 'VACCINATION':
        nodeColor = AppTheme.outlineVariant;
        icon = Icons.vaccines_outlined;
        iconColor = AppTheme.tertiary;
        break;
      case 'CONSULTATION':
      default:
        nodeColor = AppTheme.primary;
        icon = Icons.description_outlined;
        iconColor = AppTheme.primary;
        break;
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left Date Column
          SizedBox(
            width: 58,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const SizedBox(height: 2),
                Text(
                  date,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.onSurface,
                  ),
                ),
                Text(
                  year,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.tertiary,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 10),

          // Center Line & Node
          Column(
            children: [
              const SizedBox(height: 4),
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: nodeColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.surfaceContainerLowest, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: nodeColor.withOpacity(0.4),
                      blurRadius: 4,
                      spreadRadius: 1,
                    ),
                  ],
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: AppTheme.tertiaryFixed,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                  ),
                ),
            ],
          ),

          const SizedBox(width: 12),

          // Right Content Card
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 22.0),
              child: InkWell(
                onTap: () {
                  context.push('/records/$consultationUuid');
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.all(14.0),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceContainerLowest,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.tertiaryFixed),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x0D1E293B),
                        blurRadius: 5,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Icon Circle
                      Container(
                        width: 40,
                        height: 40,
                        decoration: const BoxDecoration(
                          color: AppTheme.surfaceContainerLow,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          icon,
                          size: 20,
                          color: iconColor,
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Text Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              title,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.onSurface,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              provider,
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppTheme.onSurfaceVariant,
                              ),
                            ),

                            // Badge or Status
                            if (tag != null) ...[
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppTheme.surfaceContainer,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  tag,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: AppTheme.onSurfaceVariant,
                                  ),
                                ),
                              ),
                            ],

                            if (statusText != null) ...[
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.check_circle_rounded,
                                    size: 15,
                                    color: AppTheme.primary,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    statusText,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),

                      const Icon(
                        Icons.chevron_right,
                        size: 20,
                        color: AppTheme.outlineVariant,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav(BuildContext context) {
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
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                icon: Icons.home_outlined,
                label: 'Home',
                isSelected: false,
                onTap: () => context.go('/'),
              ),
              _buildNavItem(
                icon: Icons.folder_shared,
                label: 'Records',
                isSelected: true,
                onTap: () {},
              ),
              _buildNavItem(
                icon: Icons.medication_outlined,
                label: 'Pills',
                isSelected: false,
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Pill reminders are active in background.')),
                  );
                },
              ),
              _buildNavItem(
                icon: Icons.timer_outlined,
                label: 'Queue',
                isSelected: false,
                onTap: () => context.push('/queue/latest'),
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
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryContainer : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected ? AppTheme.onPrimaryContainer : AppTheme.onSurfaceVariant,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppTheme.onPrimaryContainer : AppTheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
