import { useState, useEffect } from 'react';

const WMO_CODES = {
  0: { label: 'Clear', icon: '☀' },
  1: { label: 'Mostly Clear', icon: '🌤' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁' },
  45: { label: 'Foggy', icon: '🌫' },
  48: { label: 'Icy Fog', icon: '🌫' },
  51: { label: 'Light Drizzle', icon: '🌦' },
  53: { label: 'Drizzle', icon: '🌦' },
  55: { label: 'Heavy Drizzle', icon: '🌧' },
  61: { label: 'Light Rain', icon: '🌧' },
  63: { label: 'Rain', icon: '🌧' },
  65: { label: 'Heavy Rain', icon: '🌧' },
  71: { label: 'Light Snow', icon: '🌨' },
  73: { label: 'Snow', icon: '❄' },
  75: { label: 'Heavy Snow', icon: '❄' },
  80: { label: 'Showers', icon: '🌦' },
  85: { label: 'Snow Showers', icon: '🌨' },
  95: { label: 'Thunderstorm', icon: '⛈' },
  99: { label: 'Hailstorm', icon: '⛈' },
};

function getWeatherInfo(code) {
  return WMO_CODES[code] || { label: 'Unknown', icon: '🌡' };
}

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });

        try {
          // Reverse geocode
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geoData = await geoRes.json();
          const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Your Location';
          const country = geoData.address?.country_code?.toUpperCase() || '';

          // Fetch weather
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,uv_index,apparent_temperature&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto&forecast_days=14`
          );
          const weatherData = await weatherRes.json();

          const current = weatherData.current;
          const info = getWeatherInfo(current.weathercode);

          setWeather({
            temp: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            code: current.weathercode,
            label: info.label,
            icon: info.icon,
            windSpeed: Math.round(current.windspeed_10m),
            humidity: current.relativehumidity_2m,
            uvIndex: current.uv_index,
            city,
            country
          });

          // Build 14-day forecast
          const daily = weatherData.daily;
          const forecastDays = daily.time.map((date, i) => ({
            date,
            code: daily.weathercode[i],
            icon: getWeatherInfo(daily.weathercode[i]).icon,
            label: getWeatherInfo(daily.weathercode[i]).label,
            maxTemp: Math.round(daily.temperature_2m_max[i]),
            minTemp: Math.round(daily.temperature_2m_min[i]),
            rainProb: daily.precipitation_probability_max[i],
            uvMax: daily.uv_index_max[i],
          }));
          setForecast(forecastDays);
        } catch (e) {
          setError('Failed to fetch weather');
        }
        setLoading(false);
      },
      (err) => {
        setError('Location access denied');
        setLoading(false);
      }
    );
  }, []);

  const getWeatherForDate = (dateStr) => {
    return forecast.find(f => f.date === dateStr) || null;
  };

  return { weather, forecast, location, error, loading, getWeatherForDate };
}
