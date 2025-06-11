import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

const SettingsScreen = ({ navigation }) => {
    const [notificationEnabled, setNotificationEnabled] = useState(true);
    const [notificationTime, setNotificationTime] = useState('08:00');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const enabled = await AsyncStorage.getItem('@settings/notificationEnabled');
        const time = await AsyncStorage.getItem('@settings/notificationTime');
        
        setNotificationEnabled(enabled !== 'false');
        setNotificationTime(time || '08:00');
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

    const showTimePicker = () => {
        const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
        const minutes = ['00', '15', '30', '45'];
        
        Alert.alert(
            '通知時間設定',
            '通知を受け取りたい時間を選択してください',
            [
                ...hours.map(hour => ({
                    text: `${hour}:00`,
                    onPress: () => updateTime(`${hour}:00`)
                })),
                { text: 'キャンセル', style: 'cancel' }
            ]
        );
    };

    const updateTime = async (newTime) => {
        setNotificationTime(newTime);
        await AsyncStorage.setItem('@settings/notificationTime', newTime);
        
        if (notificationEnabled) {
            await NotificationService.scheduleNextNotification();
            Alert.alert('設定完了', `通知時間を ${newTime} に変更しました`);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>通知設定</Text>
                
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>メッセージ通知</Text>
                    <TouchableOpacity 
                        style={[styles.toggle, notificationEnabled && styles.toggleActive]}
                        onPress={toggleNotification}
                    >
                        <Text style={styles.toggleText}>
                            {notificationEnabled ? 'ON' : 'OFF'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>通知時間</Text>
                    <TouchableOpacity 
                        style={styles.timeButton}
                        onPress={showTimePicker}
                        disabled={!notificationEnabled}
                    >
                        <Text style={[
                            styles.timeText,
                            !notificationEnabled && styles.disabledText
                        ]}>
                            {notificationTime}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>アプリについて</Text>
                
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>アプリ名</Text>
                    <Text style={styles.infoValue}>友人Aと一緒♪</Text>
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>バージョン</Text>
                    <Text style={styles.infoValue}>1.0.0</Text>
                </View>

                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerText}>
                        本アプリは、カバー株式会社様およびホロライブプロダクションが公認したものではない、有志による二次創作（ファンメイド）アプリです。
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9ff',
    },
    section: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
    },
    toggle: {
        backgroundColor: '#ddd',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        minWidth: 60,
        alignItems: 'center',
    },
    toggleActive: {
        backgroundColor: '#4a9eff',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    timeButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    timeText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    disabledText: {
        color: '#999',
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 16,
        color: '#333',
    },
    infoValue: {
        fontSize: 16,
        color: '#666',
    },
    disclaimer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#fff9e6',
        borderRadius: 8,
    },
    disclaimerText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
        textAlign: 'center',
    },
});

export default SettingsScreen; 