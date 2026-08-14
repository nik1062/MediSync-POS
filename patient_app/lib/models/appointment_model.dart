class Appointment {
  final String appointmentUuid;
  final String clinicUuid;
  final String doctorUuid;
  final String patientUuid;
  final String memberUuid;
  final DateTime slotStartTime;
  final int tokenNumber;
  final String status;
  final String paymentStatus;
  final String consultationMode;

  Appointment({
    required this.appointmentUuid,
    required this.clinicUuid,
    required this.doctorUuid,
    required this.patientUuid,
    required this.memberUuid,
    required this.slotStartTime,
    required this.tokenNumber,
    required this.status,
    required this.paymentStatus,
    required this.consultationMode,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      appointmentUuid: json['appointmentUuid'],
      clinicUuid: json['clinicUuid'],
      doctorUuid: json['doctorUuid'],
      patientUuid: json['patientUuid'],
      memberUuid: json['memberUuid'],
      slotStartTime: DateTime.parse(json['slotStartTime']),
      tokenNumber: json['tokenNumber'],
      status: json['status'],
      paymentStatus: json['paymentStatus'],
      consultationMode: json['consultationMode'],
    );
  }

  Map<String, dynamic> toJson() => {
        'appointmentUuid': appointmentUuid,
        'clinicUuid': clinicUuid,
        'doctorUuid': doctorUuid,
        'patientUuid': patientUuid,
        'memberUuid': memberUuid,
        'slotStartTime': slotStartTime.toIso8601String(),
        'tokenNumber': tokenNumber,
        'status': status,
        'paymentStatus': paymentStatus,
        'consultationMode': consultationMode,
      };
}
