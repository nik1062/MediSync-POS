import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/auth_provider.dart';

final doctorsFutureProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  try {
    final api = ref.read(apiClientProvider);
    final response = await api.dio.get('/doctors');
    if (response.data != null && response.data['data'] is List) {
      return List<Map<String, dynamic>>.from(response.data['data']);
    }
  } catch (_) {
    // Fallback to default high-fidelity mock data if API server is not reached
  }
  return [
    {
      'id': 'dr-marcus-vance',
      'name': 'Dr. Marcus Vance',
      'specialty': 'Cardiologist',
      'rating': '4.9',
      'fee': '\$40',
      'avatar': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrUer5srqz5PifnaRm0QE7xTWwxDuqJ7pfYzWI7R3O0n20A5L523m4_Ql5uHvV7pJ-sv1XnyUOa_Hy42i46dbYdxl0mB4FOO7rRa3q_OsUIJPbGgrtvuEaR5Aff_kSPqn7t9UDBZMcFmS-qclbAOUGikhxeLGkl3vn0hXPgF_QGVRMLiVXjtkLnBLSNVa0kTSy83fNNgFv41AtjZrMFnHn15e3lud-0Cq2yWEY_ulML2mswgC-a_Ai',
      'clinicName': 'Northside Cardiology',
      'clinicId': 'northside-cardiology',
    },
    {
      'id': 'dr-sarah-jenkins',
      'name': 'Dr. Sarah Jenkins',
      'specialty': 'Pediatrician',
      'rating': '4.8',
      'fee': '\$35',
      'avatar': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe8Ms4UzEWo2RRUe9PyANwlmxxice7p2YKS_7xHO15IVqdmV1GcBlUFX8tLEA94xLGcLSmIqeAyzb2qfJ-3ZF4uBOiGEZoJnWofQ2weBOFn7AtizxIb-FEDbAg5C6yPjW89wjgR1-po6DhoyL82MDqGAItLsRKOkOcd26BmHEWcQoluMpedYzsZYYIws-nMTbEcpIdvA-5MVYJwGZreFSa9UzMblZEOi7dKyZtWCHp8SEYfuIO9wjE',
      'clinicName': 'Northside Pediatric Center',
      'clinicId': 'northside-cardiology',
    },
    {
      'id': 'dr-elias-thorne',
      'name': 'Dr. Elias Thorne',
      'specialty': 'Neurologist',
      'rating': '4.9',
      'fee': '\$60',
      'avatar': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAr1gQ8nXOp42H6JXfvhEblmAceDbt2j1YxSqqmnAZYD6WUziucOjP8JalCsmDlc9exPMkP7uWOWPL7sdLFck42PzUpe9IXpUZEc62G8PnlXm-VQCh47tbl6rzwpYy8PWPDfCjrRBj7XGJIiDAM8YJ7cZGfu0NO8PRTzFOxIJ03FKipP4FVI8FKBZD6_EnJu1DXIVpGUemsGOwXPmztOXYZeryAMPz_D9gvg_UuTO4luh85P0eQyNCp',
      'clinicName': 'City Neurology Center',
      'clinicId': 'northside-cardiology',
    },
  ];
});

class HomeDiscoveryScreen extends ConsumerStatefulWidget {
  const HomeDiscoveryScreen({super.key});

  @override
  ConsumerState<HomeDiscoveryScreen> createState() => _HomeDiscoveryScreenState();
}

class _HomeDiscoveryScreenState extends ConsumerState<HomeDiscoveryScreen> {
  String _searchQuery = '';
  String _selectedSpecialty = '';
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> _specialties = [
    {
      'name': 'Cardiology',
      'icon': Icons.monitor_heart,
    },
    {
      'name': 'Pediatrics',
      'icon': Icons.child_care,
    },
    {
      'name': 'Neurology',
      'icon': Icons.psychology,
    },
    {
      'name': 'Dentistry',
      'icon': Icons.health_and_safety_outlined,
    },
    {
      'name': 'General',
      'icon': Icons.medical_services_outlined,
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final doctorsAsync = ref.watch(doctorsFutureProvider);

    String userInitials = 'US';
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
                // Sticky Header
                Container(
                  padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 12),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceContainerLowest.withValues(alpha: 0.95),
                    border: const Border(
                      bottom: BorderSide(color: AppTheme.surfaceContainerLow, width: 1),
                    ),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x051E293B),
                        blurRadius: 4,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Find your doctor',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.onSurface,
                              letterSpacing: -0.5,
                              fontFamily: 'Inter',
                            ),
                          ),
                          GestureDetector(
                            onTap: () => context.push('/profile-setup'),
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: const BoxDecoration(
                                color: AppTheme.primaryContainer,
                                shape: BoxShape.circle,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                userInitials,
                                style: const TextStyle(
                                  color: AppTheme.onPrimaryContainer,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      // Search Bar
                      Container(
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.search,
                              color: AppTheme.primary,
                              size: 22,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextField(
                                controller: _searchController,
                                onChanged: (val) {
                                  setState(() {
                                    _searchQuery = val.trim().toLowerCase();
                                  });
                                },
                                decoration: const InputDecoration(
                                  hintText: 'Search doctors, specialties...',
                                  hintStyle: TextStyle(
                                    color: AppTheme.onSurfaceVariant,
                                    fontSize: 15,
                                    fontFamily: 'Inter',
                                  ),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: InputBorder.none,
                                  fillColor: Colors.transparent,
                                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                                ),
                                style: const TextStyle(
                                  color: AppTheme.onSurface,
                                  fontSize: 15,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ),
                            if (_searchQuery.isNotEmpty)
                              GestureDetector(
                                onTap: () {
                                  _searchController.clear();
                                  setState(() {
                                    _searchQuery = '';
                                  });
                                },
                                child: const Icon(
                                  Icons.close,
                                  color: AppTheme.onSurfaceVariant,
                                  size: 18,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Main Scrollable Area
                Expanded(
                  child: ListView(
                    padding: EdgeInsets.zero,
                    physics: const BouncingScrollPhysics(),
                    children: [
                      // Specialties Section
                      Padding(
                        padding: const EdgeInsets.only(left: 16, right: 16, top: 20, bottom: 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Specialties',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.onSurface,
                                letterSpacing: -0.3,
                                fontFamily: 'Inter',
                              ),
                            ),
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedSpecialty = '';
                                });
                              },
                              child: const Text(
                                'See all',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.primary,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Horizontal Specialties List
                      SizedBox(
                        height: 104,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          physics: const BouncingScrollPhysics(),
                          itemCount: _specialties.length,
                          separatorBuilder: (context, index) => const SizedBox(width: 14),
                          itemBuilder: (context, index) {
                            final item = _specialties[index];
                            final isSelected = _selectedSpecialty.toLowerCase() == item['name'].toString().toLowerCase();

                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  if (isSelected) {
                                    _selectedSpecialty = '';
                                  } else {
                                    _selectedSpecialty = item['name'];
                                  }
                                });
                              },
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    width: 64,
                                    height: 64,
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? AppTheme.primaryContainer
                                          : AppTheme.surfaceContainerHighest,
                                      shape: BoxShape.circle,
                                      boxShadow: isSelected
                                          ? [
                                              BoxShadow(
                                                color: AppTheme.primary.withValues(alpha: 0.25),
                                                blurRadius: 8,
                                                offset: const Offset(0, 4),
                                              ),
                                            ]
                                          : const [
                                              BoxShadow(
                                                color: Color(0x0A000000),
                                                blurRadius: 2,
                                                offset: Offset(0, 1),
                                              ),
                                            ],
                                    ),
                                    child: Icon(
                                      item['icon'] as IconData,
                                      color: isSelected
                                          ? AppTheme.onPrimaryContainer
                                          : AppTheme.primary,
                                      size: 28,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    item['name'],
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                      color: isSelected ? AppTheme.primary : AppTheme.onSurfaceVariant,
                                      fontFamily: 'Inter',
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),

                      // Top Doctors Near You Section
                      Padding(
                        padding: const EdgeInsets.only(left: 16, right: 16, top: 20, bottom: 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: const [
                            Text(
                              'Top Doctors Near You',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.onSurface,
                                letterSpacing: -0.3,
                                fontFamily: 'Inter',
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Doctors List
                      doctorsAsync.when(
                        loading: () => const Padding(
                          padding: EdgeInsets.all(32.0),
                          child: Center(
                            child: CircularProgressIndicator(color: AppTheme.primary),
                          ),
                        ),
                        error: (err, stack) => Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Center(
                            child: Column(
                              children: [
                                const Icon(Icons.error_outline, color: AppTheme.error, size: 36),
                                const SizedBox(height: 8),
                                Text(
                                  'Unable to load doctors: $err',
                                  style: const TextStyle(color: AppTheme.error),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        ),
                        data: (doctors) {
                          var filtered = doctors.where((doc) {
                            final name = (doc['name'] ?? '').toString().toLowerCase();
                            final spec = (doc['specialty'] ?? '').toString().toLowerCase();
                            final queryMatch = _searchQuery.isEmpty ||
                                name.contains(_searchQuery) ||
                                spec.contains(_searchQuery);
                            final specMatch = _selectedSpecialty.isEmpty ||
                                spec.contains(_selectedSpecialty.toLowerCase());
                            return queryMatch && specMatch;
                          }).toList();

                          if (filtered.isEmpty) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                              child: Center(
                                child: Column(
                                  children: [
                                    Icon(Icons.search_off, size: 48, color: AppTheme.onSurfaceVariant.withValues(alpha: 0.5)),
                                    const SizedBox(height: 12),
                                    const Text(
                                      'No doctors found matching your criteria.',
                                      style: TextStyle(
                                        color: AppTheme.onSurfaceVariant,
                                        fontSize: 15,
                                        fontFamily: 'Inter',
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }

                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Column(
                              children: filtered.map((doc) {
                                final docId = doc['id'] ?? doc['doctorUuid'] ?? 'dr-marcus-vance';
                                return _buildDoctorCard(context, doc, docId.toString());
                              }).toList(),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(context, currentIndex: 0),
    );
  }

  Widget _buildDoctorCard(BuildContext context, Map<String, dynamic> doc, String docId) {
    final avatarUrl = doc['avatar'] as String?;
    final name = doc['name'] ?? 'Doctor';
    final specialty = doc['specialty'] ?? 'Specialist';
    final rating = doc['rating'] ?? '4.9';
    final fee = doc['fee'] ?? '\$40';

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.surfaceContainerHighest, width: 1),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D1E293B),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            context.push('/doctor/$docId');
          },
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                // Doctor Avatar
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.surface, width: 2),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x0A000000),
                        blurRadius: 4,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: avatarUrl != null && avatarUrl.isNotEmpty
                        ? Image.network(
                            avatarUrl,
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
                          )
                        : Container(
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
                const SizedBox(width: 14),
                // Doctor Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  style: const TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.w700,
                                    color: AppTheme.onSurface,
                                    letterSpacing: -0.2,
                                    fontFamily: 'Inter',
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  specialty,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                    color: AppTheme.onSurfaceVariant,
                                    fontFamily: 'Inter',
                                  ),
                                ),
                              ],
                            ),
                          ),
                          PopupMenuButton<String>(
                            icon: const Icon(
                              Icons.more_vert,
                              color: AppTheme.outlineVariant,
                              size: 20,
                            ),
                            padding: EdgeInsets.zero,
                            onSelected: (val) {
                              if (val == 'clinic') {
                                context.push('/clinic/northside-cardiology');
                              } else if (val == 'book') {
                                context.push('/doctor/$docId');
                              }
                            },
                            itemBuilder: (context) => [
                              const PopupMenuItem(
                                value: 'book',
                                child: Text('Book Appointment'),
                              ),
                              const PopupMenuItem(
                                value: 'clinic',
                                child: Text('View Clinic Profile'),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.star,
                                color: AppTheme.primaryContainer,
                                size: 16,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                rating,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.onSurface,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: 3,
                            height: 3,
                            decoration: const BoxDecoration(
                              color: AppTheme.secondaryFixedDim,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Row(
                            children: [
                              const Icon(
                                Icons.payments_outlined,
                                color: AppTheme.onSurfaceVariant,
                                size: 16,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                fee,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: AppTheme.onSurfaceVariant,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
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
              // Home Tab (Active)
              _buildNavItem(
                icon: Icons.home,
                label: 'Home',
                isActive: currentIndex == 0,
                onTap: () {},
              ),
              // Records Tab
              _buildNavItem(
                icon: Icons.folder_shared_outlined,
                label: 'Records',
                isActive: currentIndex == 1,
                onTap: () {
                  context.push('/records/lab');
                },
              ),
              // Pills Tab
              _buildNavItem(
                icon: Icons.medication_outlined,
                label: 'Pills',
                isActive: currentIndex == 2,
                onTap: () {
                  context.push('/pills');
                },
              ),
              // Appointments / Queue Tab
              _buildNavItem(
                icon: Icons.timer_outlined,
                label: 'Appointments',
                isActive: currentIndex == 3,
                onTap: () {
                  context.push('/appointments');
                },
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
