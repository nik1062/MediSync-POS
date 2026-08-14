import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/patient_model.dart';
import '../core/network/api_client.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});

class AuthState {
  final bool isAuthenticated;
  final PatientProfile? profile;
  final String? selectedMemberUuid;

  AuthState({this.isAuthenticated = false, this.profile, this.selectedMemberUuid});

  AuthState copyWith({bool? isAuthenticated, PatientProfile? profile, String? selectedMemberUuid}) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      profile: profile ?? this.profile,
      selectedMemberUuid: selectedMemberUuid ?? this.selectedMemberUuid,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref ref;
  final _storage = const FlutterSecureStorage();

  AuthNotifier(this.ref) : super(AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final token = await _storage.read(key: 'jwt_token');
    if (token != null) {
      await fetchProfile();
    }
  }

  Future<void> loginWithOTP(String phone, String otp) async {
    final api = ref.read(apiClientProvider);
    final response = await api.dio.post('/auth/verify-otp', data: {'phone': phone, 'otp': otp});
    
    final token = response.data['token'];
    await _storage.write(key: 'jwt_token', value: token);
    await fetchProfile();
  }

  Future<void> fetchProfile() async {
    try {
      final api = ref.read(apiClientProvider);
      final response = await api.dio.get('/profile');
      final profile = PatientProfile.fromJson(response.data['data']);
      state = state.copyWith(
        isAuthenticated: true, 
        profile: profile, 
        selectedMemberUuid: profile.patientUuid
      );
    } catch (e) {
      await logout();
    }
  }

  void selectFamilyMember(String memberUuid) {
    state = state.copyWith(selectedMemberUuid: memberUuid);
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    state = AuthState();
  }
}
