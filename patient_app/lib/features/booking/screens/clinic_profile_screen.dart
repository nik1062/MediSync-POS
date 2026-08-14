import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class ClinicProfileScreen extends ConsumerWidget {
  final String clinicUuid;
  const ClinicProfileScreen({super.key, required this.clinicUuid});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final doctors = [
      {
        'id': 'dr-marcus-vance',
        'name': 'Dr. A. Vance',
        'role': 'Lead Cardiologist',
        'avatar': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA69zYnjcMAe35QcyDh2v772sVQI7QFMvotiFK3CodZrZ9udQb5F2zqeraUYhFJsIMq1tJ1IDejxw0hZtkF72W-SXuH3CEO5_XWepS8n4zcmlH4HJTATJaQWHV2z_7WNdN9AZ1CKGqALrA-RCKwZi3fh3NrvXIYzxJOJS6f06wi7UMmMRxdoOoVAgvlCmqhjlAwj18CcSrJmOO6SqE8kwbGWrqCoF3bf5wgXtcXINuDLlpGkzHx4y2A',
      },
      {
        'id': 'dr-sarah-jenkins',
        'name': 'Dr. S. Chen',
        'role': 'Cardiac Surgeon',
        'avatar': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6OSzSBzQmO8VGg_vUfWop9meofZLVj54Uue3UjBXk9J6lzkHoJ9Oq-hB0h8UrZ1acOL-sorle4HUvHO8Q3LRIMKpSIKDBg9E2IYJaClnUCFooZDgaKPCVreDWLHf58b7WJzKw7ARe9LwBcr-LxZL1dzxaDieReT5ExDdv5elmclqJWpq2IbpdFS8e-XhspLf_wQSqahK_0HYud0SIdlVsdT_zk06xYKK64ye9f5dU8lzMWiSU4U3R',
      },
      {
        'id': 'dr-rivera',
        'name': 'Dr. M. Rivera',
        'role': 'Electrophysiologist',
        'initials': 'MR',
      },
      {
        'id': 'dr-elias-thorne',
        'name': 'Dr. J. Kim',
        'role': 'Consultant',
        'avatar': 'https://lh3.googleusercontent.com/aida-public/AB6AXuABFaJSZ-TZFeRmxqJmtfDIfLvAbrc4U4tE1Aes3Zi8DB92NJmOujlAy8dN4mFvaItt8MiIwTvWgYzCT8AmYCbI_KusUF8OUGuw_9PwaCoJil74rE_ovvtJ_17UcuPt2B6SnKa5kzlQNK6OCZT7LbVyVvSIepJZEzQADlX9dA2DnHMfpX_EpGqB4SktJKhXfcM-O6FURa79aIjko3byj_Ki5YcMHyw0_feIpCJVzfNeeTnY7wJGwHN8',
      },
    ];

    return Scaffold(
      backgroundColor: AppTheme.surface,
      body: SafeArea(
        top: false,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Stack(
              children: [
                // Scrollable Content
                SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.only(bottom: 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Hero Image Section
                      Stack(
                        children: [
                          Container(
                            height: 260,
                            width: double.infinity,
                            decoration: const BoxDecoration(
                              color: AppTheme.surfaceContainerHighest,
                            ),
                            child: Image.network(
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuDQSLhLIof96i71FuBktPPhDcVIPiJxeMjIlFEda9-0rdkUW48yc-vW_Of3ixvo3FRo2u4rFcTzM8U9NPTt6plC-xYYMxPrVhKsFiHHK8MVQIiTxLcoB_qWHl7Ku_lWj95sHXnKYeDBPlIC6AjW8EwHj3hv0wlI569581aVRL5GgXqer2o3qJZtcPrm1_MLrmNLLh-Ed9S19r7TY_et7GePL-CHNzsgIGS2R8mX0yahoMZWT0ag5lWr',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => Container(
                                color: AppTheme.surfaceContainerHigh,
                                alignment: Alignment.center,
                                child: const Icon(
                                  Icons.local_hospital,
                                  size: 64,
                                  color: AppTheme.primary,
                                ),
                              ),
                            ),
                          ),
                          // Floating Back Button
                          Positioned(
                            top: MediaQuery.of(context).padding.top + 12,
                            left: 16,
                            child: GestureDetector(
                              onTap: () {
                                if (context.canPop()) {
                                  context.pop();
                                } else {
                                  context.go('/');
                                }
                              },
                              child: Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: AppTheme.surfaceContainerLowest.withValues(alpha: 0.92),
                                  shape: BoxShape.circle,
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Color(0x1F000000),
                                      blurRadius: 6,
                                      offset: Offset(0, 2),
                                    ),
                                  ],
                                ),
                                alignment: Alignment.center,
                                child: const Icon(
                                  Icons.arrow_back,
                                  color: AppTheme.onSurface,
                                  size: 20,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Overlapping Clinic Identity Card
                      Transform.translate(
                        offset: const Offset(0, -32),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceContainerLowest,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: AppTheme.outlineVariant.withValues(alpha: 0.2),
                                width: 1,
                              ),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x0D1E293B),
                                  blurRadius: 8,
                                  offset: Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Northside Cardiology',
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w800,
                                    color: AppTheme.onSurface,
                                    letterSpacing: -0.4,
                                    fontFamily: 'Inter',
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.star,
                                      color: AppTheme.primary,
                                      size: 18,
                                    ),
                                    const SizedBox(width: 4),
                                    const Text(
                                      '4.9',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: AppTheme.onSurface,
                                        fontFamily: 'Inter',
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    const Text(
                                      '·',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: AppTheme.secondary,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    const Text(
                                      '128 reviews',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: AppTheme.secondary,
                                        fontFamily: 'Inter',
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(
                                      Icons.location_on,
                                      color: AppTheme.secondary,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text(
                                            '4820 Medical Center Dr.\nSuite 200, Northside',
                                            style: TextStyle(
                                              fontSize: 14,
                                              height: 1.4,
                                              color: AppTheme.onSurfaceVariant,
                                              fontFamily: 'Inter',
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          InkWell(
                                            onTap: () {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                const SnackBar(content: Text('Opening Maps directions...')),
                                              );
                                            },
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: const [
                                                Text(
                                                  'Get Directions',
                                                  style: TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w600,
                                                    color: AppTheme.primary,
                                                    fontFamily: 'Inter',
                                                  ),
                                                ),
                                                SizedBox(width: 4),
                                                Icon(
                                                  Icons.arrow_forward,
                                                  color: AppTheme.primary,
                                                  size: 16,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      // Facilities Section
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Facilities',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.onSurface,
                                letterSpacing: -0.3,
                                fontFamily: 'Inter',
                              ),
                            ),
                            const SizedBox(height: 14),
                            Row(
                              children: [
                                Expanded(child: _buildFacilityCard(Icons.local_parking, 'Parking')),
                                const SizedBox(width: 8),
                                Expanded(child: _buildFacilityCard(Icons.local_pharmacy, 'Pharmacy')),
                                const SizedBox(width: 8),
                                Expanded(child: _buildFacilityCard(Icons.medical_services_outlined, 'X-Ray')),
                                const SizedBox(width: 8),
                                Expanded(child: _buildFacilityCard(Icons.science_outlined, 'Lab')),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Operating Hours Section
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Operating Hours',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.onSurface,
                                letterSpacing: -0.3,
                                fontFamily: 'Inter',
                              ),
                            ),
                            const SizedBox(height: 14),
                            Container(
                              decoration: BoxDecoration(
                                color: AppTheme.surfaceContainerLowest,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: AppTheme.outlineVariant.withValues(alpha: 0.3),
                                  width: 1,
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
                                children: [
                                  // Mon-Fri
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: const [
                                        Text(
                                          'Monday - Friday',
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: AppTheme.onSurface,
                                            fontFamily: 'Inter',
                                          ),
                                        ),
                                        Text(
                                          '8:00 AM - 6:00 PM',
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
                                  const Divider(height: 1, color: AppTheme.surfaceContainerHigh),
                                  // Saturday (Today)
                                  Container(
                                    color: AppTheme.primary.withValues(alpha: 0.06),
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: const [
                                        Text(
                                          'Saturday (Today)',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color: AppTheme.primary,
                                            fontFamily: 'Inter',
                                          ),
                                        ),
                                        Text(
                                          '9:00 AM - 2:00 PM',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color: AppTheme.primary,
                                            fontFamily: 'Inter',
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Divider(height: 1, color: AppTheme.surfaceContainerHigh),
                                  // Sunday
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: const [
                                        Text(
                                          'Sunday',
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: AppTheme.onSurfaceVariant,
                                            fontFamily: 'Inter',
                                          ),
                                        ),
                                        Text(
                                          'Closed',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: AppTheme.secondary,
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
                      const SizedBox(height: 28),

                      // Doctors at this Clinic Section
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text(
                              'Doctors at this Clinic',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.onSurface,
                                letterSpacing: -0.3,
                                fontFamily: 'Inter',
                              ),
                            ),
                            GestureDetector(
                              onTap: () {},
                              child: const Text(
                                'View All',
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
                      const SizedBox(height: 14),

                      // Horizontal Doctors List
                      SizedBox(
                        height: 164,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          physics: const BouncingScrollPhysics(),
                          itemCount: doctors.length,
                          separatorBuilder: (context, index) => const SizedBox(width: 12),
                          itemBuilder: (context, index) {
                            final doc = doctors[index];
                            return _buildDoctorCard(context, doc);
                          },
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),

                // Sticky Bottom Action Bar
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceContainerLowest,
                      border: Border(
                        top: BorderSide(
                          color: AppTheme.outlineVariant.withValues(alpha: 0.2),
                          width: 1,
                        ),
                      ),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x0F000000),
                          blurRadius: 10,
                          offset: Offset(0, -4),
                        ),
                      ],
                    ),
                    child: SafeArea(
                      top: false,
                      child: ElevatedButton(
                        onPressed: () {
                          context.push('/doctor/dr-marcus-vance');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: AppTheme.onPrimary,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: const Text(
                          'Book Appointment',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            fontFamily: 'Inter',
                          ),
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

  Widget _buildFacilityCard(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainer,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppTheme.outlineVariant.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: AppTheme.primary,
            size: 28,
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppTheme.onSurfaceVariant,
              fontFamily: 'Inter',
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildDoctorCard(BuildContext context, Map<String, dynamic> doc) {
    final avatarUrl = doc['avatar'] as String?;
    final initials = doc['initials'] as String?;
    final name = doc['name'] as String;
    final role = doc['role'] as String;
    final docId = doc['id'] as String;

    return GestureDetector(
      onTap: () {
        context.push('/doctor/$docId');
      },
      child: Container(
        width: 140,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: AppTheme.outlineVariant.withValues(alpha: 0.2),
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
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.surfaceContainerHigh, width: 1),
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
                            name.substring(0, 2).toUpperCase(),
                            style: const TextStyle(
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      )
                    : Container(
                        color: AppTheme.primary,
                        alignment: Alignment.center,
                        child: Text(
                          initials ?? 'DR',
                          style: const TextStyle(
                            color: AppTheme.onPrimary,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              name,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppTheme.onSurface,
                fontFamily: 'Inter',
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 2),
            Text(
              role,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.secondary,
                fontFamily: 'Inter',
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
