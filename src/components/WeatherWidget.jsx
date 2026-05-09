import { useWeather } from '../hooks/useWeather';

export default function WeatherWidget() {
  const { weather, loading, error } = useWeather();

  if (loading) return (
    <div className="weather-widget loading">
      <div className="weather-skeleton" />
    </div>
  );

  if (error || !weather) return (
    <div className="weather-widget error">
      <span className="weather-error-icon">📍</span>
      <span className="weather-error-text">Enable location for weather</span>
    </div>
  );

  const uvLevel = weather.uvIndex >= 8 ? 'Very High' : weather.uvIndex >= 6 ? 'High' : weather.uvIndex >= 3 ? 'Moderate' : 'Low';

  return (
    <div className="weather-widget">
      <div className="weather-top">
        <div className="weather-location">
          <span className="location-pin">📍</span>
          <span>{weather.city}, {weather.country}</span>
        </div>
        <span className="weather-main-icon">{weather.icon}</span>
      </div>
      <div className="weather-temp-row">
        <span className="weather-big-temp">{weather.temp}°C</span>
        <span className="weather-condition">{weather.label}</span>
      </div>
      <div className="weather-feels">Feels like {weather.feelsLike}°C</div>
      <div className="weather-details-row">
        <span className="weather-detail">💨 {weather.windSpeed} km/h</span>
        <span className="weather-detail">💧 {weather.humidity}%</span>
        <span className="weather-detail">UV {weather.uvIndex} ({uvLevel})</span>
      </div>
    </div>
  );
}
