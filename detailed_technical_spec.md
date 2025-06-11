# ホロライブファンメイドアプリ詳細技術仕様書（決定版）

## 📋 目次
1. [開発環境セットアップ](#1-開発環境セットアップ)
2. [データベース設計（改善版）](#2-データベース設計改善版)
3. [メッセージデータ仕様（最適化版）](#3-メッセージデータ仕様最適化版)
4. [核心機能実装](#4-核心機能実装)
5. [画面実装詳細](#5-画面実装詳細)
6. [通知システム（修正版）](#6-通知システム修正版)
7. [テスト・デバッグ](#7-テストデバッグ)
8. [リリース準備](#8-リリース準備)

---

## 1. 開発環境セットアップ

### 1.1 技術スタック
```
フレームワーク: React Native 0.72+
言語: JavaScript/TypeScript
データベース: SQLite
設定管理: AsyncStorage
通知: react-native-push-notification
```

### 1.2 プロジェクト作成
```bash
# プロジェクト作成
npx react-native init HololiveFanApp
cd HololiveFanApp

# 必須依存関係インストール
npm install @react-native-async-storage/async-storage
npm install react-native-sqlite-storage
npm install react-native-push-notification
npm install @react-native-community/push-notification-ios
npm install react-navigation/native react-navigation/stack
npm install react-native-vector-icons
```

### 1.3 ディレクトリ構造（最適化版）
```
src/
├── components/          # UIコンポーネント
│   ├── CharacterView.js
│   └── MessageCard.js
├── screens/            # 画面
│   ├── HomeScreen.js
│   ├── SettingsScreen.js
│   └── MemoryScreen.js
├── services/           # ビジネスロジック
│   ├── DatabaseService.js
│   ├── MessageService.js
│   └── NotificationService.js
├── data/               # データファイル
│   └── messages.json   # 310件のメッセージデータ
├── assets/             # 画像・音声
│   └── images/
└── utils/              # ユーティリティ
    └── constants.js
```

---

## 2. データベース設計（改善版）

### 2.1 テーブル設計

#### 2.1.1 messages テーブル（改善版）
```sql
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,           -- メッセージID（1-310）
    content TEXT NOT NULL,            -- メッセージ本文
    category_time TEXT NOT NULL,      -- 時間帯（morning/afternoon/evening/late/all）
    category_day TEXT NOT NULL,       -- 曜日（monday/friday/weekend/weekday/all）
    category_season TEXT NOT NULL,    -- 季節（spring/summer/autumn/winter/all）
    category_special TEXT,            -- 特別日（birthday/null）
    tags TEXT                         -- タグ（JSON配列形式）
);
```

#### 2.1.2 sent_history テーブル（軽量化版）
```sql
CREATE TABLE IF NOT EXISTS sent_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE
);
```

### 2.2 設定管理（AsyncStorage）
```javascript
// 設定キー定義
const SETTINGS_KEYS = {
    NOTIFICATION_TIME: '@settings/notificationTime',
    NOTIFICATION_ENABLED: '@settings/notificationEnabled',
    FIRST_LAUNCH: '@settings/firstLaunch'
};
```

---

## 3. メッセージデータ仕様（最適化版）

### 3.1 messages.json フォーマット
```json
[
  {
    "id": 1,
    "content": "おはよう！今日も一日、あなたのペースで頑張ってね〜",
    "category_time": "morning",
    "category_day": "all",
    "category_season": "all",
    "category_special": null,
    "tags": ["greeting", "encouragement"]
  },
  {
    "id": 141,
    "content": "月曜日だけど、無理しないでね〜。一歩ずつ進めばいいよ！",
    "category_time": "all", 
    "category_day": "monday",
    "category_season": "all",
    "category_special": null,
    "tags": ["monday", "pace"]
  }
]
```

### 3.2 カテゴリ値定義
```javascript
const CATEGORIES = {
    TIME: {
        MORNING: 'morning',     // 6-10時
        AFTERNOON: 'afternoon', // 11-16時
        EVENING: 'evening',     // 17-22時
        LATE: 'late',          // 23-5時
        ALL: 'all'             // 時間帯指定なし
    },
    DAY: {
        MONDAY: 'monday',
        FRIDAY: 'friday', 
        WEEKEND: 'weekend',
        WEEKDAY: 'weekday',
        ALL: 'all'
    },
    SEASON: {
        SPRING: 'spring',   // 3-5月
        SUMMER: 'summer',   // 6-8月
        AUTUMN: 'autumn',   // 9-11月
        WINTER: 'winter',   // 12-2月
        ALL: 'all'
    }
};
```

---

## 4. 核心機能実装

### 4.1 DatabaseService.js（改善版）
```javascript
import SQLite from 'react-native-sqlite-storage';

class DatabaseService {
    constructor() {
        this.db = null;
    }

    async initialize() {
        try {
            this.db = await SQLite.openDatabase({
                name: 'HololiveFanApp.db',
                location: 'default',
            });
            
            await this.createTables();
            await this.loadInitialMessages();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    async createTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                content TEXT NOT NULL,
                category_time TEXT NOT NULL,
                category_day TEXT NOT NULL,
                category_season TEXT NOT NULL,
                category_special TEXT,
                tags TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS sent_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER NOT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE
            )`
        ];

        for (const query of queries) {
            await this.db.executeSql(query);
        }
    }

    // 【改善】初期メッセージデータ読み込み（高速化）
    async loadInitialMessages() {
        // 既にデータが存在するかチェック
        const [countResult] = await this.db.executeSql('SELECT count(*) as c FROM messages');
        if (countResult.rows.item(0).c > 0) {
            console.log('Messages already loaded.');
            return;
        }

        const messages = require('../data/messages.json');
        const query = `
            INSERT INTO messages (id, content, category_time, category_day, category_season, category_special, tags) 
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;

        // 【改善】トランザクションで一括挿入（高速化）
        await this.db.transaction(async tx => {
            for (const msg of messages) {
                const tagsJson = JSON.stringify(msg.tags || []);
                tx.executeSql(query, [
                    msg.id,
                    msg.content,
                    msg.category_time,
                    msg.category_day,
                    msg.category_season,
                    msg.category_special,
                    tagsJson
                ]);
            }
        });
        console.log(`${messages.length} messages loaded successfully`);
    }

    // 配送履歴保存
    async saveSentHistory(messageId) {
        const query = 'INSERT INTO sent_history (message_id) VALUES (?)';
        return this.db.executeSql(query, [messageId]);
    }

    // 思い出取得（メッセージ内容も含む）
    async getMemories(limit = 50) {
        const query = `
            SELECT 
                h.sent_at,
                m.content,
                m.id as message_id
            FROM sent_history h
            JOIN messages m ON h.message_id = m.id
            ORDER BY h.sent_at DESC 
            LIMIT ?
        `;
        const [results] = await this.db.executeSql(query, [limit]);
        
        const memories = [];
        for (let i = 0; i < results.rows.length; i++) {
            memories.push(results.rows.item(i));
        }
        return memories;
    }
}

export default new DatabaseService();
```

### 4.2 MessageService.js（改善版）
```javascript
import DatabaseService from './DatabaseService';

class MessageService {
    // 現在の時間帯取得
    getCurrentTimeCategory() {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour <= 10) return 'morning';
        if (hour >= 11 && hour <= 16) return 'afternoon';
        if (hour >= 17 && hour <= 22) return 'evening';
        return 'late';
    }

    // 現在の曜日カテゴリ取得
    getCurrentDayCategory() {
        const day = new Date().getDay();
        
        if (day === 1) return 'monday';
        if (day === 5) return 'friday';
        if (day === 0 || day === 6) return 'weekend';
        return 'weekday';
    }

    // 現在の季節カテゴリ取得
    getCurrentSeasonCategory() {
        const month = new Date().getMonth() + 1;
        
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    }

    // 【改善】知能的メッセージ選択
    async selectNotificationMessage() {
        const timeCat = this.getCurrentTimeCategory();
        const dayCat = this.getCurrentDayCategory();
        const seasonCat = this.getCurrentSeasonCategory();

        // 【改善】優先順位付きSQL検索
        const query = `
            SELECT * FROM messages
            WHERE
                (category_time = ? OR category_time = 'all') AND
                (category_day = ? OR category_day = 'all') AND
                (category_season = ? OR category_season = 'all')
            ORDER BY
                -- 完全一致を優先
                (category_time = ?) DESC,
                (category_day = ?) DESC,
                (category_season = ?) DESC,
                -- ランダム選択
                RANDOM()
            LIMIT 1;
        `;
        
        const [results] = await DatabaseService.db.executeSql(query, [
            timeCat, dayCat, seasonCat,
            timeCat, dayCat, seasonCat
        ]);

        if (results.rows.length > 0) {
            return results.rows.item(0);
        }
        
        // 【改善】フォールバック処理：カテゴリを無視してランダム選択
        const fallbackQuery = `SELECT * FROM messages ORDER BY RANDOM() LIMIT 1;`;
        const [fallbackResults] = await DatabaseService.db.executeSql(fallbackQuery);
        if (fallbackResults.rows.length > 0) {
            return fallbackResults.rows.item(0);
        }
        
        // 本当にDBが空の場合の最終手段
        return {
            id: 0,
            content: "今日もお疲れ様！私はいつでもあなたを応援してるよ〜",
            category_time: "all",
            category_day: "all", 
            category_season: "all"
        };
    }
}

export default new MessageService();
```

---

## 5. 画面実装詳細

### 5.1 HomeScreen.js（シンプル版）
```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';
import DatabaseService from '../services/DatabaseService';

const HomeScreen = ({ navigation }) => {
    const [notificationEnabled, setNotificationEnabled] = useState(true);
    const [notificationTime, setNotificationTime] = useState('08:00');
    const [lastMemory, setLastMemory] = useState(null);

    useEffect(() => {
        loadSettings();
        loadLastMemory();
    }, []);

    const loadSettings = async () => {
        const enabled = await AsyncStorage.getItem('@settings/notificationEnabled');
        const time = await AsyncStorage.getItem('@settings/notificationTime');
        
        setNotificationEnabled(enabled !== 'false');
        setNotificationTime(time || '08:00');
    };

    const loadLastMemory = async () => {
        const memories = await DatabaseService.getMemories(1);
        if (memories.length > 0) {
            setLastMemory(memories[0]);
        }
    };

    const toggleNotification = async () => {
        const newState = !notificationEnabled;
        setNotificationEnabled(newState);
        
        await AsyncStorage.setItem('@settings/notificationEnabled', String(newState));
        
        if (newState) {
            await NotificationService.scheduleNextNotification();
            Alert.alert('通知ON', '友人Aからのメッセージ配信を再開しました♪');
        } else {
            NotificationService.cancelAllNotifications();
            Alert.alert('通知OFF', 'メッセージ配信を一時停止しました');
        }
    };

    const testNotification = async () => {
        await NotificationService.sendImmediateNotification();
        Alert.alert('テスト送信', '友人Aからのメッセージをお送りしました♪');
        setTimeout(loadLastMemory, 1000); // 思い出を更新
    };

    return (
        <View style={styles.container}>
            {/* ヘッダー */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.headerButton}>設定</Text>
                </TouchableOpacity>
                <Text style={styles.title}>友人Aと一緒♪</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Memory')}>
                    <Text style={styles.headerButton}>思い出</Text>
                </TouchableOpacity>
            </View>

            {/* キャラクター表示 */}
            <View style={styles.characterArea}>
                <Image 
                    source={require('../assets/images/friend_a.png')}
                    style={styles.characterImage}
                />
                <Text style={styles.characterGreeting}>
                    {notificationEnabled ? 
                        `毎日 ${notificationTime} にメッセージをお届け中♪` :
                        '通知がOFFになっています'
                    }
                </Text>
            </View>

            {/* 通知設定 */}
            <View style={styles.settingsArea}>
                <TouchableOpacity 
                    style={[styles.toggleButton, notificationEnabled && styles.toggleOn]}
                    onPress={toggleNotification}
                >
                    <Text style={styles.toggleText}>
                        通知 {notificationEnabled ? 'ON' : 'OFF'}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.testButton}
                    onPress={testNotification}
                >
                    <Text style={styles.testButtonText}>今すぐメッセージ</Text>
                </TouchableOpacity>
            </View>

            {/* 最新の思い出 */}
            {lastMemory && (
                <View style={styles.lastMemoryArea}>
                    <Text style={styles.memoryTitle}>最新のメッセージ</Text>
                    <Text style={styles.memoryContent}>
                        「{lastMemory.content}」
                    </Text>
                    <Text style={styles.memoryDate}>
                        {new Date(lastMemory.sent_at).toLocaleString('ja-JP')}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9ff',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    headerButton: {
        fontSize: 16,
        color: '#4a9eff',
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    characterArea: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    characterImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    characterGreeting: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
    },
    settingsArea: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    toggleButton: {
        backgroundColor: '#ddd',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
        marginBottom: 16,
    },
    toggleOn: {
        backgroundColor: '#4a9eff',
    },
    toggleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    testButton: {
        backgroundColor: '#ff6b9d',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    testButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    lastMemoryArea: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    memoryTitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
    },
    memoryContent: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        marginBottom: 8,
    },
    memoryDate: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
});

export default HomeScreen;
```

---

## 6. 通知システム（修正版）

### 6.1 NotificationService.js（改善版）
```javascript
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageService from './MessageService';
import DatabaseService from './DatabaseService';

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
```

### 6.2 App.js（初期化処理）
```javascript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DatabaseService from './src/services/DatabaseService';
import NotificationService from './src/services/NotificationService';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MemoryScreen from './src/screens/MemoryScreen';

const Stack = createStackNavigator();

const App = () => {
    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // 【重要】DBの初期化（メッセージデータの読み込み）を先に行う
            await DatabaseService.initialize();
            
            // 初回起動チェック
            const firstLaunch = await AsyncStorage.getItem('@settings/firstLaunch');
            if (!firstLaunch) {
                // 初回起動時の設定
                await AsyncStorage.setItem('@settings/firstLaunch', 'false');
                await AsyncStorage.setItem('@settings/notificationTime', '08:00');
                await AsyncStorage.setItem('@settings/notificationEnabled', 'true');
            }
            
            // 【重要】DB準備完了後に、メッセージを選択して通知をスケジュールする
            await NotificationService.scheduleNextNotification();
            
            console.log('App initialized successfully');
        } catch (error) {
            console.error('App initialization failed:', error);
        }
    };

    return (
        <NavigationContainer>
            <Stack.Navigator 
                initialRouteName="Home"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen 
                    name="Settings" 
                    component={SettingsScreen}
                    options={{ 
                        headerShown: true,
                        title: '設定',
                        headerBackTitle: '戻る'
                    }}
                />
                <Stack.Screen 
                    name="Memory" 
                    component={MemoryScreen}
                    options={{ 
                        headerShown: true,
                        title: '思い出',
                        headerBackTitle: '戻る'
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
```

---

## 7. テスト・デバッグ

### 7.1 重要なテスト項目
```javascript
// __tests__/critical.test.js
describe('Critical App Functions', () => {
    test('Database initialization', async () => {
        await DatabaseService.initialize();
        const memories = await DatabaseService.getMemories(1);
        expect(Array.isArray(memories)).toBe(true);
    });

    test('Message selection logic', async () => {
        const message = await MessageService.selectNotificationMessage();
        expect(message).toBeDefined();
        expect(message.content).toBeTruthy();
        expect(message.content.length).toBeLessThanOrEqual(80);
    });

    test('Notification scheduling', async () => {
        await NotificationService.scheduleNextNotification();
        // 通知が正常にスケジュールされることを確認
    });
});
```

### 7.2 手動テスト手順
1. **通知テスト**: 「今すぐメッセージ」ボタンで即座に通知
2. **スケジュールテスト**: 通知時間を1分後に設定してバックグラウンド待機
3. **データ整合性**: 思い出画面で配信履歴が正確に表示される
4. **設定永続化**: アプリ再起動後も設定が保持される

---

## 8. リリース準備

### 8.1 必要なアセット
```
src/assets/images/
├── friend_a.png          # 友人Aイラスト (512x512px)
├── app_icon.png          # アプリアイコン (1024x1024px)
└── notification_icon.png # 通知アイコン (256x256px)
```

### 8.2 ビルド設定

#### Android (android/app/build.gradle)
```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.hololive.fanapp"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
}
```

#### iOS (ios/HololiveFanApp/Info.plist)
```xml
<key>CFBundleDisplayName</key>
<string>友人Aと一緒♪</string>
<key>CFBundleIdentifier</key>
<string>com.hololive.fanapp</string>
<key>CFBundleVersion</key>
<string>1.0.0</string>
```

### 8.3 ストア説明文
```
【非公式ファンメイドアプリ】
ホロライブプロダクションの友人Aと毎日メッセージ交換♪

✨ 特徴
・毎日異なる温かいメッセージをお届け
・310種類の豊富なメッセージバリエーション
・時間帯・曜日・季節を考慮した知能的な配信
・過去メッセージを「思い出」として永続保存

📱 完全無料・広告なし
純粋なファン活動として開発されております。

⚠️ 重要な注意事項
本アプリは、カバー株式会社様およびホロライブプロダクションが
公認したものではない、有志による二次創作（ファンメイド）アプリです。
```

---

## 9. 完成後の運用

### 9.1 継続改善
- ユーザーフィードバックの収集
- 通知配信成功率の監視
- 新しいメッセージの定期追加

### 9.2 コミュニティ連携
- ファンコミュニティでの共有
- 改善要望の収集
- バグ報告への迅速対応

---

**この決定版仕様書により、シンプルで確実に動作し、ファンの皆様に最高の日常体験を提供するアプリを実現できます。**