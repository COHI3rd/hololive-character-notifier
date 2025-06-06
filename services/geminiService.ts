import { Character, TimeOfDay } from '../types';

export const generateMessage = async (
  character: Character,
  currentWeather: string | null,
  timeOfDay: TimeOfDay,
  specialDayName: string | null
): Promise<string> => {
  try {
    const response = await fetch('/api/generateMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        character,
        currentWeather,
        timeOfDay,
        specialDayName,
      }),
    });

    if (!response.ok) {
      console.error('API error:', response.status, await response.text());
      return character.fallbackMessage;
    }

    const data = await response.json();
    return data.message || character.fallbackMessage;
  } catch (error) {
    console.error('Failed to fetch message from backend API:', error);
    return character.fallbackMessage;
  }
};
