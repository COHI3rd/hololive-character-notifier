
import React, { useState, useEffect } from 'react';
import { AppSettings, NotificationTimeSlot } from '../types';
import { NOTIFICATION_TIMES_CONFIG } from '../constants';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
  onForceNotification?: () => void; // Optional: For testing
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, onForceNotification }) => {
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof AppSettings, value?: any) => {
    setCurrentSettings(prev => ({ ...prev, [key]: value !== undefined ? value : !prev[key] }));
  };

  const handleTimeSlotToggle = (slot: NotificationTimeSlot) => {
    setCurrentSettings(prev => ({
      ...prev,
      notificationTimes: {
        ...prev.notificationTimes,
        [slot]: !prev.notificationTimes[slot],
      },
    }));
  };

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
     if (/^((0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))?$/.test(val) || val === "") {
        setCurrentSettings(prev => ({ ...prev, userBirthday: val === "" ? null : val }));
    }
  };
  
  const handleSave = () => {
    onSettingsChange(currentSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-holo-blue">設定</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={24} className="text-holo-secondary-text" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-md font-semibold mb-2 text-holo-secondary-text">全体通知</label>
            <label htmlFor="globalNotificationsOn" className="flex items-center cursor-pointer bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition-colors">
              <input
                type="checkbox"
                id="globalNotificationsOn"
                checked={currentSettings.globalNotificationsOn}
                onChange={() => handleToggle('globalNotificationsOn')}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-holo-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-holo-blue"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">アプリ全体の通知を {currentSettings.globalNotificationsOn ? 'ON' : 'OFF'}</span>
            </label>
            {currentSettings.globalNotificationsOn && Notification.permission !== 'granted' && (
                 <p className="text-sm text-yellow-600 mt-2">ブラウザの通知許可が必要です。許可されていない場合、通知は表示されません。</p>
            )}
          </div>

          <div>
            <label className="block text-md font-semibold mb-2 text-holo-secondary-text">通知時間帯</label>
            <div className="space-y-2">
              {Object.values(NotificationTimeSlot).map(slot => (
                <label key={slot} htmlFor={slot} className="flex items-center cursor-pointer bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    id={slot}
                    checked={currentSettings.notificationTimes[slot]}
                    onChange={() => handleTimeSlotToggle(slot)}
                    className="sr-only peer"
                    disabled={!currentSettings.globalNotificationsOn}
                  />
                  <div className={`relative w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${currentSettings.globalNotificationsOn ? 'bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-holo-blue peer-checked:bg-holo-blue' : 'bg-gray-200 cursor-not-allowed'}`}></div>
                  <span className={`ms-3 text-sm font-medium ${currentSettings.globalNotificationsOn ? 'text-gray-900' : 'text-gray-400'}`}>{NOTIFICATION_TIMES_CONFIG[slot].label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-md font-semibold mb-2 text-holo-secondary-text">天気情報の利用</label>
            <label htmlFor="useLocationForWeather" className="flex items-center cursor-pointer bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition-colors">
              <input
                type="checkbox"
                id="useLocationForWeather"
                checked={currentSettings.useLocationForWeather}
                onChange={() => handleToggle('useLocationForWeather')}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-holo-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-holo-blue"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">位置情報に基づいて天気を取得する</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 px-1">
              有効にすると、現在地の天気情報をメッセージに反映します。ブラウザの位置情報の許可が必要です。
              無効または取得失敗時は天気情報は含まれません。
            </p>
          </div>


          <div>
            <label htmlFor="userBirthday" className="block text-md font-semibold mb-2 text-holo-secondary-text">誕生日 (MM-DD形式)</label>
            <input
              type="text"
              id="userBirthday"
              placeholder="例: 03-15"
              value={currentSettings.userBirthday || ''}
              onChange={handleBirthdayChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-holo-blue focus:border-holo-blue"
            />
             <p className="text-xs text-gray-500 mt-1">誕生日に特別なお祝いメッセージが届きます。</p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
             <h3 className="text-md font-semibold mb-2 text-holo-secondary-text">免責事項</h3>
             <p className="text-sm text-gray-600">
                本アプリケーションは、カバー株式会社およびホロライブプロダクション公式とは一切関係ありません。ファンによる二次創作物です。
                使用しているキャラクター名、設定などは公式のものを参考にしていますが、本アプリの内容は非公式なものです。
             </p>
          </div>

          {onForceNotification && process.env.NODE_ENV === 'development' && (
            <button
              onClick={onForceNotification}
              className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              テスト通知 (開発用)
            </button>
          )}
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-holo-secondary-text hover:bg-gray-100 transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-holo-blue hover:bg-blue-600 text-white font-semibold rounded-md transition"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
