import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';

class SocketService {
  IO.Socket? _socket;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final String serverUrl = 'http://localhost:3000'; // Backend URL

  Function(Map<String, dynamic>)? onStatusChanged;
  Function(Map<String, dynamic>)? onQueueUpdated;

  Future<void> initSocket(String patientUuid) async {
    if (_socket != null && _socket!.connected) return;

    final token = await _storage.read(key: 'jwt_token');

    _socket = IO.io(
      serverUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      debugPrint('Socket connected: ${_socket!.id}');
      _socket!.emit('join_patient_room', {'patientId': patientUuid});
    });

    _socket!.onDisconnect((_) => debugPrint('Socket disconnected'));

    _socket!.on('appointment:status_changed', (data) {
      if (onStatusChanged != null) onStatusChanged!(data);
    });

    _socket!.on('queue:update', (data) {
      if (onQueueUpdated != null) onQueueUpdated!(data);
    });
  }

  void dispose() {
    _socket?.off('appointment:status_changed');
    _socket?.off('queue:update');
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }
}
