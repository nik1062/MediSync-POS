class MedicationItem {
  final String medicineName;
  final String dosage;
  final String frequency; // e.g. "1-0-1"
  final String timing; // "BEFORE_FOOD" | "AFTER_FOOD"
  final int durationDays;

  MedicationItem({
    required this.medicineName,
    required this.dosage,
    required this.frequency,
    required this.timing,
    required this.durationDays,
  });

  factory MedicationItem.fromJson(Map<String, dynamic> json) {
    return MedicationItem(
      medicineName: json['medicineName'],
      dosage: json['dosage'],
      frequency: json['frequency'],
      timing: json['timing'],
      durationDays: json['durationDays'],
    );
  }

  Map<String, dynamic> toJson() => {
        'medicineName': medicineName,
        'dosage': dosage,
        'frequency': frequency,
        'timing': timing,
        'durationDays': durationDays,
      };
}

class Prescription {
  final String prescriptionUuid;
  final String consultationUuid;
  final String doctorUuid;
  final String clinicUuid;
  final String diagnosis;
  final String advice;
  final List<MedicationItem> medications;
  final DateTime createdAt;

  Prescription({
    required this.prescriptionUuid,
    required this.consultationUuid,
    required this.doctorUuid,
    required this.clinicUuid,
    required this.diagnosis,
    required this.advice,
    required this.medications,
    required this.createdAt,
  });

  factory Prescription.fromJson(Map<String, dynamic> json) {
    var medList = json['medications'] as List? ?? [];
    return Prescription(
      prescriptionUuid: json['prescriptionUuid'],
      consultationUuid: json['consultationUuid'],
      doctorUuid: json['doctorUuid'],
      clinicUuid: json['clinicUuid'],
      diagnosis: json['diagnosis'] ?? '',
      advice: json['advice'] ?? '',
      medications: medList.map((i) => MedicationItem.fromJson(i)).toList(),
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() => {
        'prescriptionUuid': prescriptionUuid,
        'consultationUuid': consultationUuid,
        'doctorUuid': doctorUuid,
        'clinicUuid': clinicUuid,
        'diagnosis': diagnosis,
        'advice': advice,
        'medications': medications.map((e) => e.toJson()).toList(),
        'createdAt': createdAt.toIso8601String(),
      };
}
