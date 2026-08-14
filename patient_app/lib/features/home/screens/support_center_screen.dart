import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class SupportCenterScreen extends ConsumerStatefulWidget {
  const SupportCenterScreen({super.key});

  @override
  ConsumerState<SupportCenterScreen> createState() => _SupportCenterScreenState();
}

class _SupportCenterScreenState extends ConsumerState<SupportCenterScreen> {
  final TextEditingController _searchController = TextEditingController();
  int? _expandedFaqIndex;
  String _selectedCategory = 'All';

  final List<Map<String, dynamic>> _faqItems = [
    {
      'question': 'How do I reschedule an appointment?',
      'answer':
          'You can reschedule directly from the Queue or Appointments tab. Select your scheduled visit, click "Reschedule", and choose any open slot. Rescheduling is complimentary up to 2 hours before the start time.',
      'category': 'Appointments',
    },
    {
      'question': 'Where can I view my test results?',
      'answer':
          'All diagnostic reports and lab results are securely saved under the Records tab in "Lab Results". You can view comprehensive trend charts, doctor analysis notes, and download official PDF summaries.',
      'category': 'Prescriptions',
    },
    {
      'question': 'How do I update my insurance information?',
      'answer':
          'Navigate to Settings > Account Settings > Personal Information. Under Health Insurance & ABHA, you can scan or update your insurance card policy details and verification documents.',
      'category': 'Billing',
    },
    {
      'question': 'How does the Live Queue HUD work?',
      'answer':
          'Once your appointment is confirmed, the Live Queue HUD tracks your estimated turn in real-time, displays current patient number being attended to, and alerts you when to proceed to the consultation room.',
      'category': 'Tech Support',
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchController.text.trim().toLowerCase();
    final filteredFaqs = _faqItems.where((item) {
      final matchesQuery = query.isEmpty ||
          item['question'].toLowerCase().contains(query) ||
          item['answer'].toLowerCase().contains(query);
      final matchesCategory = _selectedCategory == 'All' || item['category'] == _selectedCategory;
      return matchesQuery && matchesCategory;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: _buildAppBar(context),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 800),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeaderSection(),
                const SizedBox(height: 20),
                _buildSearchBar(),
                const SizedBox(height: 28),
                _buildCategoriesGrid(),
                const SizedBox(height: 28),
                _buildFaqSection(filteredFaqs),
                const SizedBox(height: 32),
                _buildContactSupportCard(context),
                const SizedBox(height: 48),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openLiveChatModal(context),
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.onPrimary,
        elevation: 4,
        shape: const CircleBorder(),
        child: const Icon(Icons.chat_bubble_rounded),
      ),
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

  Widget _buildHeaderSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        Text(
          'Support Center',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w900,
            color: AppTheme.onBackground,
            letterSpacing: -0.5,
          ),
        ),
        SizedBox(height: 4),
        Text(
          'How can we help you today?',
          style: TextStyle(
            fontSize: 15,
            color: AppTheme.secondary,
            fontWeight: FontWeight.w400,
          ),
        ),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E293B).withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (_) => setState(() {}),
        style: const TextStyle(fontSize: 15, color: AppTheme.onBackground),
        decoration: InputDecoration(
          hintText: 'Search for articles, guides, or FAQs...',
          hintStyle: const TextStyle(color: AppTheme.secondary, fontSize: 14),
          prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.outline),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, size: 18, color: AppTheme.secondary),
                  onPressed: () {
                    _searchController.clear();
                    setState(() {});
                  },
                )
              : null,
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }

  Widget _buildCategoriesGrid() {
    final categories = [
      {'title': 'Appointments', 'icon': Icons.calendar_month_rounded},
      {'title': 'Billing', 'icon': Icons.receipt_long_rounded},
      {'title': 'Prescriptions', 'icon': Icons.medical_services_rounded},
      {'title': 'Tech Support', 'icon': Icons.devices_rounded},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Popular Categories',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppTheme.onBackground,
              ),
            ),
            if (_selectedCategory != 'All')
              GestureDetector(
                onTap: () => setState(() => _selectedCategory = 'All'),
                child: const Text(
                  'Show All',
                  style: TextStyle(fontSize: 13, color: AppTheme.primary, fontWeight: FontWeight.w600),
                ),
              ),
          ],
        ),
        const SizedBox(height: 14),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.4,
          ),
          itemCount: categories.length,
          itemBuilder: (context, index) {
            final cat = categories[index];
            final isSelected = _selectedCategory == cat['title'];
            return InkWell(
              onTap: () {
                setState(() {
                  _selectedCategory = isSelected ? 'All' : cat['title'] as String;
                });
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.primary.withOpacity(0.08) : AppTheme.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? AppTheme.primary : AppTheme.outlineVariant.withOpacity(0.3),
                    width: isSelected ? 1.5 : 1.0,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1E293B).withOpacity(0.04),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(cat['icon'] as IconData, color: AppTheme.primary, size: 22),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      cat['title'] as String,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isSelected ? AppTheme.primary : AppTheme.onBackground,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildFaqSection(List<Map<String, dynamic>> faqs) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Frequently Asked Questions',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppTheme.onBackground,
          ),
        ),
        const SizedBox(height: 14),
        if (faqs.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.3)),
            ),
            child: const Center(
              child: Text(
                'No matching questions found.',
                style: TextStyle(color: AppTheme.secondary, fontSize: 14),
              ),
            ),
          )
        else
          Container(
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
              children: faqs.asMap().entries.map((entry) {
                final index = entry.key;
                final faq = entry.value;
                final isExpanded = _expandedFaqIndex == index;
                final isLast = index == faqs.length - 1;

                return Column(
                  children: [
                    InkWell(
                      onTap: () {
                        setState(() {
                          _expandedFaqIndex = isExpanded ? null : index;
                        });
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                faq['question'],
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.onBackground,
                                ),
                              ),
                            ),
                            AnimatedRotation(
                              turns: isExpanded ? 0.5 : 0.0,
                              duration: const Duration(milliseconds: 200),
                              child: const Icon(Icons.expand_more, color: AppTheme.outline),
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (isExpanded)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: Text(
                          faq['answer'],
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppTheme.onSurfaceVariant,
                            height: 1.5,
                          ),
                        ),
                      ),
                    if (!isLast) const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  ],
                );
              }).toList(),
            ),
          ),
        const SizedBox(height: 12),
        InkWell(
          onTap: () {
            setState(() {
              _selectedCategory = 'All';
              _searchController.clear();
            });
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Displaying all 18 knowledge base articles')),
            );
          },
          borderRadius: BorderRadius.circular(4),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Text(
                  'View all FAQs',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                  ),
                ),
                SizedBox(width: 4),
                Icon(Icons.arrow_forward_rounded, size: 16, color: AppTheme.primary),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildContactSupportCard(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.primaryContainer,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withOpacity(0.2),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Still need help?',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppTheme.onPrimaryContainer,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Our support agents are available 24/7 to assist you with any inquiries.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.onPrimaryContainer,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _openLiveChatModal(context),
              icon: const Icon(Icons.chat_outlined, size: 18, color: AppTheme.primary),
              label: const Text(
                'Start Live Chat',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primary,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.surfaceContainerLowest,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _openLiveChatModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceContainerLowest,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.outlineVariant,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      color: AppTheme.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.support_agent_rounded, color: AppTheme.onPrimary, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'MediSync Live Care',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                      ),
                      Text(
                        'Average response time: 2 mins',
                        style: TextStyle(fontSize: 12, color: AppTheme.secondary),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),
              TextField(
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Describe how our clinical team can help you...',
                  filled: true,
                  fillColor: AppTheme.surfaceContainerLow,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(ctx).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Chat session initiated with Support Agent')),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: AppTheme.onPrimary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                  ),
                  child: const Text('Connect with Agent', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
