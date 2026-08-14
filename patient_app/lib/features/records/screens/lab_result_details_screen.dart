import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class LabResultDetailsScreen extends ConsumerStatefulWidget {
  final String? resultUuid;

  const LabResultDetailsScreen({super.key, this.resultUuid});

  @override
  ConsumerState<LabResultDetailsScreen> createState() => _LabResultDetailsScreenState();
}

class _LabResultDetailsScreenState extends ConsumerState<LabResultDetailsScreen> {
  int _selectedTabIndex = 1; // 0: Home, 1: Records, 2: Pills, 3: Queue

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: _buildAppBar(context),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 96),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1000),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeaderSection(context),
                const SizedBox(height: 20),
                _buildTrendChartCard(context),
                const SizedBox(height: 20),
                _buildDetailedResultsTable(context),
                const SizedBox(height: 20),
                _buildDoctorNoteCard(context),
                const SizedBox(height: 20),
                _buildAboutTestCard(context),
                const SizedBox(height: 20),
                _buildScheduleFollowUpCard(context),
              ],
            ),
          ),
        ),
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
        IconButton(
          icon: const Icon(Icons.notifications_none_outlined, color: AppTheme.secondary),
          tooltip: 'Notifications',
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('No new notifications')),
            );
          },
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildHeaderSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Complete Blood Count (CBC)',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: AppTheme.onBackground,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Ordered by Dr. Sarah Jenkins • Oct 24, 2023',
          style: TextStyle(
            fontSize: 14,
            color: AppTheme.secondary,
            fontWeight: FontWeight.w400,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Downloading Lab Report PDF...')),
                );
              },
              icon: const Icon(Icons.download_rounded, size: 18),
              label: const Text('Download PDF'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: AppTheme.onPrimary,
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                elevation: 0,
              ),
            ),
            const SizedBox(width: 10),
            OutlinedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Sharing Lab Report link...')),
                );
              },
              icon: const Icon(Icons.share_outlined, size: 18, color: AppTheme.primary),
              label: const Text('Share', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w600)),
              style: OutlinedButton.styleFrom(
                backgroundColor: AppTheme.surfaceContainerLowest,
                side: const BorderSide(color: AppTheme.outlineVariant),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTrendChartCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E293B).withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Hemoglobin Trend',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.onBackground,
                      letterSpacing: -0.3,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Last 6 months',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppTheme.secondary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.trending_up, size: 16, color: AppTheme.primary),
                    SizedBox(width: 4),
                    Text(
                      'Stable',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 200,
            width: double.infinity,
            child: CustomPaint(
              painter: _HemoglobinChartPainter(
                months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                values: [13.2, 12.8, 12.5, 12.1, 12.0, 11.8],
                minY: 10.0,
                maxY: 16.0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailedResultsTable(BuildContext context) {
    final markers = [
      _LabMarker('White Blood Cells (WBC)', '6.8', 'x10^9/L', '4.5 - 11.0', 'Normal', false),
      _LabMarker('Red Blood Cells (RBC)', '4.5', 'x10^12/L', '4.2 - 5.4', 'Normal', false),
      _LabMarker('Hemoglobin (Hb)', '11.8', 'g/dL', '12.0 - 15.5', 'Low', true),
      _LabMarker('Hematocrit (Hct)', '38', '%', '37 - 48', 'Normal', false),
      _LabMarker('Platelets', '250', 'x10^9/L', '150 - 450', 'Normal', false),
    ];

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E293B).withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: const BoxDecoration(
              color: AppTheme.surfaceContainerLow,
              border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
            ),
            child: const Text(
              'All Markers',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppTheme.onBackground,
              ),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: ConstrainedBox(
              constraints: const BoxConstraints(minWidth: 500),
              child: DataTable(
                headingRowColor: WidgetStateProperty.all(AppTheme.surfaceContainerLow.withOpacity(0.5)),
                horizontalMargin: 20,
                columnSpacing: 24,
                headingTextStyle: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.secondary,
                  letterSpacing: 0.2,
                ),
                columns: const [
                  DataColumn(label: Text('MARKER')),
                  DataColumn(label: Text('VALUE')),
                  DataColumn(label: Text('REFERENCE RANGE')),
                  DataColumn(label: Text('STATUS')),
                ],
                rows: markers.map((m) {
                  return DataRow(
                    color: m.isWarning
                        ? WidgetStateProperty.all(AppTheme.error.withOpacity(0.05))
                        : null,
                    cells: [
                      DataCell(
                        Text(
                          m.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: AppTheme.onBackground,
                          ),
                        ),
                      ),
                      DataCell(
                        RichText(
                          text: TextSpan(
                            text: m.value,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: m.isWarning ? FontWeight.w700 : FontWeight.w500,
                              color: m.isWarning ? AppTheme.error : AppTheme.onBackground,
                            ),
                            children: [
                              TextSpan(
                                text: ' ${m.unit}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.normal,
                                  color: AppTheme.secondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      DataCell(
                        Text(
                          m.referenceRange,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppTheme.secondary,
                          ),
                        ),
                      ),
                      DataCell(
                        m.isWarning
                            ? Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFDAD6),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: const [
                                    Icon(Icons.warning_amber_rounded, size: 13, color: Color(0xFF93000A)),
                                    SizedBox(width: 3),
                                    Text(
                                      'Low',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF93000A),
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppTheme.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'Normal',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: AppTheme.primary,
                                  ),
                                ),
                              ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDoctorNoteCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E293B).withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Doctor's Note",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppTheme.onBackground,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person, color: AppTheme.primary, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      '"Your overall results are looking good. Hemoglobin is slightly low, but nothing to be overly concerned about. Ensure you are getting enough iron in your diet. We will check again in 6 months."',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.onSurfaceVariant,
                        height: 1.5,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      '- Dr. Sarah Jenkins',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.secondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAboutTestCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E293B).withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'About this Test',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppTheme.onBackground,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'A complete blood count (CBC) is a blood test used to evaluate your overall health and detect a wide range of disorders, including anemia, infection and leukemia.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.secondary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          InkWell(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Opening medical encyclopedia...')),
              );
            },
            borderRadius: BorderRadius.circular(4),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Text(
                    'Learn more',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primary,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(Icons.arrow_forward, size: 16, color: AppTheme.primary),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleFollowUpCard(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E293B).withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.calendar_month_rounded, color: AppTheme.primary, size: 24),
          ),
          const SizedBox(height: 12),
          const Text(
            'Schedule Follow-up',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppTheme.onBackground,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Dr. Jenkins recommended a follow-up test in 6 months.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.secondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                context.push('/doctor/doc-123');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: AppTheme.onPrimary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Book Appointment',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    return NavigationBar(
      selectedIndex: _selectedTabIndex,
      backgroundColor: AppTheme.surfaceContainerLowest,
      surfaceTintColor: Colors.transparent,
      elevation: 4,
      onDestinationSelected: (index) {
        setState(() => _selectedTabIndex = index);
        if (index == 0) {
          context.go('/');
        } else if (index == 2) {
          context.go('/pills');
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

class _LabMarker {
  final String name;
  final String value;
  final String unit;
  final String referenceRange;
  final String status;
  final bool isWarning;

  _LabMarker(this.name, this.value, this.unit, this.referenceRange, this.status, this.isWarning);
}

class _HemoglobinChartPainter extends CustomPainter {
  final List<String> months;
  final List<double> values;
  final double minY;
  final double maxY;

  _HemoglobinChartPainter({
    required this.months,
    required this.values,
    required this.minY,
    required this.maxY,
  });

  @override
  void paint(Canvas canvas, Size size) {
    const double leftPadding = 32.0;
    const double bottomPadding = 24.0;
    const double topPadding = 12.0;
    const double rightPadding = 16.0;

    final double chartWidth = size.width - leftPadding - rightPadding;
    final double chartHeight = size.height - topPadding - bottomPadding;

    final gridPaint = Paint()
      ..color = const Color(0xFFBCCAC0).withOpacity(0.35)
      ..strokeWidth = 1.0;

    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    // Draw horizontal grid lines & Y-axis labels
    const int yDivisions = 3;
    for (int i = 0; i <= yDivisions; i++) {
      final double yVal = minY + (maxY - minY) * (i / yDivisions);
      final double yPos = topPadding + chartHeight * (1.0 - (yVal - minY) / (maxY - minY));

      canvas.drawLine(
        Offset(leftPadding, yPos),
        Offset(size.width - rightPadding, yPos),
        gridPaint,
      );

      textPainter.text = TextSpan(
        text: yVal.toInt().toString(),
        style: const TextStyle(
          color: AppTheme.secondary,
          fontSize: 11,
          fontFamily: 'Inter',
        ),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(leftPadding - textPainter.width - 8, yPos - 6));
    }

    if (values.isEmpty) return;

    final double stepX = chartWidth / (values.length - 1);
    final List<Offset> points = [];

    for (int i = 0; i < values.length; i++) {
      final double x = leftPadding + i * stepX;
      final double normalizedY = (values[i] - minY) / (maxY - minY);
      final double y = topPadding + chartHeight * (1.0 - normalizedY);
      points.add(Offset(x, y));

      // Draw X-axis month label
      textPainter.text = TextSpan(
        text: months[i],
        style: const TextStyle(
          color: AppTheme.secondary,
          fontSize: 11,
          fontFamily: 'Inter',
        ),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(x - (textPainter.width / 2), size.height - bottomPadding + 6));
    }

    // Build curved path
    final path = Path();
    path.moveTo(points.first.dx, points.first.dy);

    for (int i = 0; i < points.length - 1; i++) {
      final p0 = points[i];
      final p1 = points[i + 1];
      final controlPoint1 = Offset(p0.dx + (p1.dx - p0.dx) / 2, p0.dy);
      final controlPoint2 = Offset(p0.dx + (p1.dx - p0.dx) / 2, p1.dy);
      path.cubicTo(controlPoint1.dx, controlPoint1.dy, controlPoint2.dx, controlPoint2.dy, p1.dx, p1.dy);
    }

    // Build filled area gradient path
    final fillPath = Path.from(path);
    fillPath.lineTo(points.last.dx, topPadding + chartHeight);
    fillPath.lineTo(points.first.dx, topPadding + chartHeight);
    fillPath.close();

    final fillPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0x33006948),
          Color(0x00006948),
        ],
      ).createShader(Rect.fromLTWH(leftPadding, topPadding, chartWidth, chartHeight));

    canvas.drawPath(fillPath, fillPaint);

    // Draw line
    final linePaint = Paint()
      ..color = AppTheme.primary
      ..strokeWidth = 3.0
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(path, linePaint);

    // Draw points
    final pointFillPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final pointStrokePaint = Paint()
      ..color = AppTheme.primary
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    for (final p in points) {
      canvas.drawCircle(p, 4.5, pointFillPaint);
      canvas.drawCircle(p, 4.5, pointStrokePaint);
    }
  }

  @override
  bool shouldRepaint(covariant _HemoglobinChartPainter oldDelegate) {
    return oldDelegate.values != values;
  }
}
