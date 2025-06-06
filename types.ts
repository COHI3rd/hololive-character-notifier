
export enum CharacterId {
  FriendA = 'friend_a',
  HarusakinoDoka = 'harusakino_doka',
}

export interface Character {
  id: CharacterId;
  name: string;
  iconUrl: string;
  personalityPrompt: string;
  fallbackMessage: string; // For offline/error scenarios
}

export enum NotificationTimeSlot {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening',
}

// WeatherType enum is removed as we will use location-based weather.
// export enum WeatherType {
//   Sunny = 'sunny',
//   Rainy = 'rainy',
//   Cloudy = 'cloudy',
//   None = 'none',
// }

export interface AppSettings {
  selectedCharacterId: CharacterId;
  notificationTimes: {
    [NotificationTimeSlot.Morning]: boolean;
    [NotificationTimeSlot.Afternoon]: boolean;
    [NotificationTimeSlot.Evening]: boolean;
  };
  globalNotificationsOn: boolean;
  userBirthday: string | null; // Store as 'MM-DD' (e.g., "12-25")
  useLocationForWeather: boolean; // New setting to toggle location-based weather
}

export interface ActiveMessage {
  id: string; // Unique ID for the message, e.g., timestamp
  text: string;
  characterId: CharacterId;
  timestamp: number;
}

export interface ReactionCounts {
  [key: string]: number; // CharacterId as key
}

export interface SpecialDay {
  month: number; // 1-12
  day: number; // 1-31
  name: string;
}

export type TimeOfDay = '朝' | '昼' | '夜';
