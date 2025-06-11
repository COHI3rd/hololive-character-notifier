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
                <View style={styles.characterImagePlaceholder}>
                    <Text style={styles.placeholderText}>友人A</Text>
                </View>
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
        paddingTop: 40, // ステータスバー対応
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
    characterImagePlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 24,
        color: '#666',
        fontWeight: 'bold',
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