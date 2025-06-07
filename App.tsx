import React, { useState, useEffect, useCallback, useRef } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { AppSettings, CharacterId, ActiveMessage, ReactionCounts, NotificationTimeSlot, TimeOfDay } from './types';
import { CHARACTERS_DATA, NOTIFICATION_TIMES_CONFIG, SPECIAL_DAYS_LIST, DEFAULT_SETTINGS } from './constants';
import { generateMessage } from './services/geminiService';
import { fetchWeather } from './services/weatherService'; // Import new weather service
import { requestNotificationPermission, showNotification } from './services/notificationService';

import Header from './components/Header';
import CharacterSelector from './components/CharacterSelector';
import MessageDisplay from './components/MessageDisplay';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('holonotifier-settings', DEFAULT_SETTINGS);
  const [activeMessages, setActiveMessages] = useLocalStorage<Record<CharacterId, ActiveMessage | null>>('holonotifier-active-messages', {
    [CharacterId.FriendA]: null,
    [CharacterId.HarusakinoDoka]: null,
  });
  const [reactionCounts, setReactionCounts] = useLocalStorage<ReactionCounts>('holonotifier-reaction-counts', {
    [CharacterId.FriendA]: 0,
    [CharacterId.HarusakinoDoka]: 0,
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const notificationTimers = useRef<number[]>([]);

  const selectedCharData = CHARACTERS_DATA[settings.selectedCharacterId];
  const currentActiveMessage = activeMessages[settings.selectedCharacterId];

  const getSpecialDayName = useCallback((): string | null => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    if (settings.userBirthday) {
      const [birthMonth, birthDay] = settings.userBirthday.split('-').map(Number);
      if (month === birthMonth && day === birthDay) {
        return 'お誕生日';
      }
    }

    for (const specialDay of SPECIAL_DAYS_LIST) {
      if (month === specialDay.month && day === specialDay.day) {
        return specialDay.name;
      }
    }
    return null;
  }, [settings.userBirthday]);

  const getLocation = useCallback((): Promise<{ latitude: number, longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError('ご使用のブラウザは位置情報取得に対応していません。');
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationError(null);
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          resolve(coords);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('位置情報の取得が許可されていません。');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('現在位置を取得できませんでした。');
              break;
            case error.TIMEOUT:
              setLocationError('位置情報の取得がタイムアウトしました。');
              break;
            default:
              setLocationError('位置情報の取得中に不明なエラーが発生しました。');
              break;
          }
          resolve(null);
        },
        { timeout: 10000, enableHighAccuracy: false } // Lower accuracy might be faster and enough for weather
      );
    });
  }, []);


  const triggerNotificationAndMessage = useCallback(async (slotTimeOfDay: TimeOfDay) => {
    if (Notification.permission !== 'granted' && settings.globalNotificationsOn) {
      console.warn("Notification permission not granted. Skipping notification.");
      return;
    }
    
    setIsLoadingMessage(true);
    const characterToNotify = CHARACTERS_DATA[settings.selectedCharacterId];
    const specialDayName = getSpecialDayName();
    let weatherCondition: string | null = "不明";

    if (settings.useLocationForWeather) {
      const location = await getLocation();
      if (location) {
        weatherCondition = await fetchWeather(location.latitude, location.longitude);
      } else {
        // locationError is set by getLocation, no need to set "不明" here explicitly if fetchWeather returns it
        console.warn("Location could not be obtained for weather. Using '不明'.");
      }
    } else {
        weatherCondition = null; // Signal to geminiService that weather is not to be used.
    }

    try {
      const messageText = await generateMessage(
        characterToNotify,
        weatherCondition,
        slotTimeOfDay,
        specialDayName
      );

      if (settings.globalNotificationsOn) {
         showNotification(characterToNotify, messageText);
      }

      const newMessage: ActiveMessage = {
        id: Date.now().toString(),
        characterId: characterToNotify.id,
        text: messageText,
        timestamp: Date.now(),
      };
      setActiveMessages((prev: Record<CharacterId, ActiveMessage | null>) => ({ ...prev, [characterToNotify.id]: newMessage }));

    } catch (error) {
      console.error("Error in triggerNotificationAndMessage:", error);
       const fallbackMessage: ActiveMessage = {
        id: Date.now().toString(),
        characterId: characterToNotify.id,
        text: characterToNotify.fallbackMessage,
        timestamp: Date.now(),
      };
      setActiveMessages((prev: Record<CharacterId, ActiveMessage | null>) => ({ ...prev, [characterToNotify.id]: fallbackMessage }));
      if (settings.globalNotificationsOn) {
        showNotification(characterToNotify, characterToNotify.fallbackMessage);
      }
    } finally {
      setIsLoadingMessage(false);
    }
  }, [settings, getSpecialDayName, setActiveMessages, getLocation]);


  const scheduleNotifications = useCallback(() => {
    notificationTimers.current.forEach((timerId: number) => window.clearTimeout(timerId));
    notificationTimers.current = [];

    if (!settings.globalNotificationsOn) return;

    Object.values(NotificationTimeSlot).forEach(slotKey => {
      if (settings.notificationTimes[slotKey]) {
        const slotConfig = NOTIFICATION_TIMES_CONFIG[slotKey];
        const [hours, minutes] = slotConfig.time.split(':').map(Number);
        
        const now = new Date();
        let notificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

        if (notificationTime.getTime() <= now.getTime()) {
          notificationTime.setDate(notificationTime.getDate() + 1);
        }
        
        const timeoutDuration = notificationTime.getTime() - now.getTime();

        if (timeoutDuration > 0) {
          const timerId = window.setTimeout(() => {
            triggerNotificationAndMessage(slotConfig.timeOfDay);
            scheduleNotifications(); 
          }, timeoutDuration);
          notificationTimers.current.push(timerId);
        }
      }
    });
  }, [settings.globalNotificationsOn, settings.notificationTimes, triggerNotificationAndMessage]);

  useEffect(() => {
    if (settings.globalNotificationsOn && Notification.permission !== 'granted') {
      requestNotificationPermission().then(permission => {
        if (permission === 'granted') {
          scheduleNotifications();
        }
      });
    } else {
       scheduleNotifications();
    }
  }, [settings.globalNotificationsOn, settings.notificationTimes, scheduleNotifications]);

   useEffect(() => {
    if (settings.globalNotificationsOn && Notification.permission === 'default') {
      requestNotificationPermission();
    }
    // Attempt to get location if setting is enabled when app loads or setting changes
    if (settings.useLocationForWeather) {
      getLocation(); 
    }
  }, [settings.globalNotificationsOn, settings.useLocationForWeather, getLocation]);


  const handleCharacterSelect = (id: CharacterId) => {
    setSettings((prev: AppSettings) => ({ ...prev, selectedCharacterId: id }));
  };

  const handleReaction = () => {
    if (currentActiveMessage) {
      setReactionCounts((prev: ReactionCounts) => ({
        ...prev,
        [settings.selectedCharacterId]: (prev[settings.selectedCharacterId] || 0) + 1,
      }));
      setActiveMessages((prev: Record<CharacterId, ActiveMessage | null>) => ({ ...prev, [settings.selectedCharacterId]: null }));
    }
  };

  const handleSettingsSave = (newSettings: AppSettings) => {
    const oldGlobalOn = settings.globalNotificationsOn;
    const oldUseLocation = settings.useLocationForWeather;
    setSettings(newSettings);

    if (newSettings.globalNotificationsOn && !oldGlobalOn && Notification.permission !== 'granted') {
        requestNotificationPermission().then(permission => {
            if (permission === 'granted') {
                scheduleNotifications();
            }
        });
    } else {
        scheduleNotifications();
    }
    if (newSettings.useLocationForWeather && !oldUseLocation) {
      getLocation(); // Attempt to get location if toggled on
    }
  };

  const forceTestNotification = () => {
    console.log("Forcing test notification...");
    console.log("Notification permission:", Notification.permission);
    console.log("Settings:", settings.globalNotificationsOn);
    triggerNotificationAndMessage(NOTIFICATION_TIMES_CONFIG[NotificationTimeSlot.Morning].timeOfDay);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onSettingsClick={() => setIsSettingsModalOpen(true)} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <CharacterSelector
          selectedCharacterId={settings.selectedCharacterId}
          onSelectCharacter={handleCharacterSelect}
        />
        {locationError && settings.useLocationForWeather && (
          <div className="my-2 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md text-sm text-center max-w-md mx-auto">
            {locationError} 天気情報は「不明」として扱われます。
          </div>
        )}
        <MessageDisplay
          character={selectedCharData}
          activeMessage={currentActiveMessage}
          reactionCount={reactionCounts[settings.selectedCharacterId] || 0}
          onReact={handleReaction}
          isLoading={isLoadingMessage}
        />
      </main>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsSave}
        onForceNotification={process.env.NODE_ENV === 'development' ? forceTestNotification : undefined}
      />
       <footer className="text-center py-4 text-sm text-gray-500 bg-slate-100 border-t">
          Hololive Character Notifier - Fan Project
      </footer>
    </div>
  );
};

export default App;
