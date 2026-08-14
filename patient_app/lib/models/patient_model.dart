class FamilyMember {
  final String memberUuid;
  final String fullName;
  final String relationship;
  final int age;
  final String gender;

  FamilyMember({
    required this.memberUuid,
    required this.fullName,
    required this.relationship,
    required this.age,
    required this.gender,
  });

  factory FamilyMember.fromJson(Map<String, dynamic> json) {
    return FamilyMember(
      memberUuid: json['memberUuid'],
      fullName: json['fullName'],
      relationship: json['relationship'],
      age: json['age'],
      gender: json['gender'],
    );
  }

  Map<String, dynamic> toJson() => {
        'memberUuid': memberUuid,
        'fullName': fullName,
        'relationship': relationship,
        'age': age,
        'gender': gender,
      };
}

class PatientProfile {
  final String patientUuid;
  final String fullName;
  final String phone;
  final String? abhaId;
  final List<FamilyMember> familyMembers;

  PatientProfile({
    required this.patientUuid,
    required this.fullName,
    required this.phone,
    this.abhaId,
    required this.familyMembers,
  });

  factory PatientProfile.fromJson(Map<String, dynamic> json) {
    var membersList = json['familyMembers'] as List? ?? [];
    return PatientProfile(
      patientUuid: json['patientUuid'],
      fullName: json['fullName'],
      phone: json['phone'],
      abhaId: json['abhaId'],
      familyMembers: membersList.map((i) => FamilyMember.fromJson(i)).toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'patientUuid': patientUuid,
        'fullName': fullName,
        'phone': phone,
        'abhaId': abhaId,
        'familyMembers': familyMembers.map((e) => e.toJson()).toList(),
      };
}
