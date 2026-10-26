package com.meotto.api.global.infrastructure.notification;

public interface Notifier {
	void notify(NotificationType type, ErrorNotificationData data);
}
