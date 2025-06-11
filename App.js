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