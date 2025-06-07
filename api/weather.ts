import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

/**
 * Converts OpenWeatherMap main weather condition to a simplified Japanese term.
 * @param weatherMain The main weather condition string from OpenWeatherMap (e.g., "Clear", "Clouds").
 * @returns Japanese weather term (e.g., "晴れ", "曇り") or "不明".
 */
function convertWeatherToJp(weatherMain: string): string {
  switch (weatherMain) {
    case 'Clear':
      return '晴れ';
    case 'Clouds':
      return '曇り';
    case 'Rain':
      return '雨';
    case 'Drizzle':
      return '霧雨';
    case 'Thunderstorm':
      return '雷雨';
    case 'Snow':
      return '雪';
    case 'Mist':
    case 'Smoke':
    case 'Haze':
    case 'Dust':
    case 'Fog':
    case 'Sand':
    case 'Ash':
    case 'Squall':
    case 'Tornado':
      return '霧'; // Grouping various atmospheric conditions for simplicity
    default:
      console.warn(`Unknown weather condition from OpenWeatherMap: ${weatherMain}`);
      return '不明';
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const { lat, lon } = req.query;

  if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY === 'YOUR_API_KEY_HERE') {
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  if (!lat || !lon) {
    res.status(400).json({ error: 'Latitude and longitude are required' });
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`OpenWeatherMap API error: ${response.status} - ${errorData}`);
        res.status(response.status).json({ error: `Weather API error: ${errorData}` });
        return;
    }
    const data = await response.json();
    if (data.weather && data.weather.length > 0) {
        const mainWeather = data.weather[0].main;
        const weatherJp = convertWeatherToJp(mainWeather);
        res.status(200).json({ weather: weatherJp });
    } else {
        console.warn('OpenWeatherMap API response did not contain weather data:', data);
        res.status(200).json({ weather: '不明' });
    }
  } catch (error) {
    console.error('Failed to fetch weather from OpenWeatherMap:', error);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
} 