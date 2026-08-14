import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../models/prescription_model.dart';

final pillReminderServiceProvider = Provider<PillReminderService>((ref) {
  return PillReminderService();
});

class PillReminderService {
  final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();

  PillReminderService() {
    _init();
  }

  Future<void> _init() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings();
    const initSettings = InitializationSettings(android: androidSettings, iOS: iosSettings);
    await _notificationsPlugin.initialize(settings: initSettings);
  }

  Future<void> scheduleRemindersFromPrescription(Prescription rx) async {
    int idCounter = 0;
    for (var med in rx.medications) {
      if (med.frequency == "1-0-1") {
        await _scheduleNotification(idCounter++, med.medicineName, "Morning Dose (${med.timing})", 9);
        await _scheduleNotification(idCounter++, med.medicineName, "Night Dose (${med.timing})", 21);
      } else if (med.frequency == "1-1-1") {
        await _scheduleNotification(idCounter++, med.medicineName, "Morning Dose (${med.timing})", 9);
        await _scheduleNotification(idCounter++, med.medicineName, "Afternoon Dose (${med.timing})", 14);
        await _scheduleNotification(idCounter++, med.medicineName, "Night Dose (${med.timing})", 21);
      }
    }
  }

  Future<void> _scheduleNotification(int id, String title, String body, int hour) async {
    const androidDetails = AndroidNotificationDetails('pill_channel', 'Pill Reminders', importance: Importance.max);
    const notificationDetails = NotificationDetails(android: androidDetails);
    
    await _notificationsPlugin.show(
      id: id,
      title: title,
      body: body,
      notificationDetails: notificationDetails,
    );
  }
}
