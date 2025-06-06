/**
 * Fetches current weather information from our backend API based on latitude and longitude.
 * @param latitude The latitude of the location.
 * @param longitude The longitude of the location.
 * @returns A promise that resolves to the Japanese weather condition string (e.g., "晴れ") or "不明" if fetching fails.
 */
export const fetchWeather = async (latitude: number, longitude: number): Promise<string> => {
  const url = `/api/weather?lat=${latitude}&lon=${longitude}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API error: ${response.status} - ${errorData}`);
      return "不明";
    }
    const data = await response.json();
    return data.weather || "不明";
  } catch (error) {
    console.error("Failed to fetch weather from backend API:", error);
    return "不明";
  }
};
