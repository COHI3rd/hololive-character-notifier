import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageService from './MessageService';
import DatabaseService from './DatabaseService';
import { Platform } from 'react-native';

class NotificationService {
    constructor() {
        this.configure();
    }

    configure() {
        PushNotification.configure({
            // 【改善】通知受信時の処理
            onNotification: async (notification) => {
                console.log('Notification received:', notification);
                
                // 通知がタップされた場合の処理
                if (notification.userInteraction) {
                    console.log('User tapped notification');
                }
                
                // 【重要】通知実行後に次回通知を自動スケジュール
                if (notification.userInfo && notification.userInfo.messageId) {
                    await DatabaseService.saveSentHistory(notification.userInfo.messageId);
                    await this.scheduleNextNotification();
                }
            },
            
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        });

        // Android通知チャンネル作成
        PushNotification.createChannel({
            channelId: "default-channel-id",
            channelName: "友人Aからのメッセージ",
            channelDescription: "友人Aからの毎日のメッセージ通知",
            soundName: "default",
            importance: 4,
            vibrate: true,
        });
    }

    // 【改善】次回通知スケジュール（毎日違うメッセージを保証）
    async scheduleNextNotification() {
        const enabled = await AsyncStorage.getItem('@settings/notificationEnabled');
        if (enabled === 'false') {
            this.cancelAllNotifications();
            return;
        }

        const time = await AsyncStorage.getItem('@settings/notificationTime') || '08:00';
        const [hours, minutes] = time.split(':').map(Number);

        // 次の通知時刻を計算
        let notificationDate = new Date();
        notificationDate.setHours(hours, minutes, 0, 0);

        // 現在時刻より過去なら明日に設定
        if (notificationDate <= new Date()) {
            notificationDate.setDate(notificationDate.getDate() + 1);
        }

        // 【重要】メッセージを事前に選択
        const message = await MessageService.selectNotificationMessage();
        if (!message) return;

        // 既存通知をクリア
        this.cancelAllNotifications();

        // 【改善】ワンタイム通知をスケジュール
        PushNotification.localNotificationSchedule({
            channelId: "default-channel-id",
            title: "友人Aからのメッセージ♪",
            message: message.content,
            date: notificationDate,
            allowWhileIdle: true,
            userInfo: { 
                messageId: message.id,
                content: message.content 
            }
        });
        
        console.log(`Next notification scheduled for ${notificationDate.toLocaleString()}`);
        console.log(`Message: ${message.content}`);
    }

    // 即座に通知送信（テスト用）
    async sendImmediateNotification() {
        const message = await MessageService.selectNotificationMessage();
        if (!message) return null;

        PushNotification.localNotification({
            channelId: "default-channel-id",
            title: "友人Aからのメッセージ♪",
            message: message.content,
            userInfo: { 
                messageId: message.id,
                content: message.content 
            }
        });

        // 履歴に保存
        await DatabaseService.saveSentHistory(message.id);
        
        return message;
    }

    // 通知キャンセル
    cancelAllNotifications() {
        PushNotification.cancelAllLocalNotifications();
        console.log('All notifications cancelled');
    }

    // 通知許可確認
    checkPermissions() {
        return new Promise((resolve) => {
            PushNotification.checkPermissions((permissions) => {
                resolve(permissions);
            });
        });
    }
}

export default new NotificationService(); 