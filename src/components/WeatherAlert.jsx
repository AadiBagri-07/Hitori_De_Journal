import { useState, useEffect } from 'react';
import { useWeather } from '../hooks/useWeather';

// Derive alerts from weather data. Returns array of { icon, title, message, severity }
function getAlerts(weather) {
  if (!weather) return [];
  const alerts = [];
  const { temp, feelsLike, code, uvIndex, rainProb, windSpeed, humidity } = weather;

  // Heat
  if (temp >= 40) {
    alerts.push({ icon: '🌡️', title: 'Extreme Heat', message: `It's ${temp}°C out — stay indoors during peak hours, keep hydrated, and avoid direct sun.`, severity: 'danger' });
  } else if (temp >= 35 || feelsLike >= 38) {
    alerts.push({ icon: '☀️', title: 'Hot day ahead', message: `It feels like ${feelsLike}°C. Apply sunscreen before heading out and carry water.`, severity: 'warn' });
  } else if (temp >= 30) {
    alerts.push({ icon: '🌤', title: 'Warm today', message: `${temp}°C today — light clothing recommended. Stay in the shade if possible.`, severity: 'info' });
  }

  // Cold
  if (temp <= 5) {
    alerts.push({ icon: '🧥', title: 'Very cold outside', message: `Only ${temp}°C. Dress in warm layers and consider a thermos if you\'re heading out.`, severity: 'info' });
  }

  // UV
  if (uvIndex >= 8) {
    alerts.push({ icon: '🕶️', title: 'Dangerous UV levels', message: `UV index is ${uvIndex} — wear SPF 50+, sunglasses, and a hat. Avoid midday sun.`, severity: 'danger' });
  } else if (uvIndex >= 6) {
    alerts.push({ icon: '🧴', title: 'High UV today', message: `UV index ${uvIndex} — sunscreen is a must, even on cloudy days.`, severity: 'warn' });
  }

  // Rain / storm
  if ([95, 99].includes(code)) {
    alerts.push({ icon: '⛈️', title: 'Thunderstorm warning', message: 'Heavy storm expected. Avoid open areas and reschedule any outdoor plans.', severity: 'danger' });
  } else if ([61, 63, 65, 80].includes(code) || rainProb >= 70) {
    alerts.push({ icon: '☔', title: 'High chance of rain', message: `${rainProb}% rain probability — grab your umbrella before you leave.`, severity: 'warn' });
  } else if (rainProb >= 40) {
    alerts.push({ icon: '🌂', title: 'Rain possible', message: `${rainProb}% chance of rain. Consider keeping an umbrella handy.`, severity: 'info' });
  }

  // Snow
  if ([71, 73, 75, 85].includes(code)) {
    alerts.push({ icon: '❄️', title: 'Snow expected', message: 'Snowfall today — wear appropriate footwear and allow extra travel time.', severity: 'warn' });
  }

  // Wind
  if (windSpeed >= 60) {
    alerts.push({ icon: '💨', title: 'Strong winds', message: `Wind at ${windSpeed} km/h. Secure loose objects and be cautious driving.`, severity: 'warn' });
  }

  // Fog
  if ([45, 48].includes(code)) {
    alerts.push({ icon: '🌫️', title: 'Foggy conditions', message: 'Low visibility expected. Drive carefully and use headlights.', severity: 'info' });
  }

  // Humidity
  if (humidity >= 85 && temp >= 28) {
    alerts.push({ icon: '💦', title: 'High humidity', message: `${humidity}% humidity at ${temp}°C — feels oppressive. Reduce outdoor exertion.`, severity: 'info' });
  }

  return alerts;
}

const SEVERITY_STYLES = {
  danger: { border: '#ff4455', bg: '#ff445512', icon_bg: '#ff445522', label: '#ff4455' },
  warn:   { border: '#ffd93d', bg: '#ffd93d0e', icon_bg: '#ffd93d1a', label: '#ffd93d' },
  info:   { border: '#00d4ff', bg: '#00d4ff0a', icon_bg: '#00d4ff18', label: '#00d4ff' },
};

export default function WeatherAlert() {
  const { weather, loading } = useWeather();
  const [dismissed, setDismissed] = useState([]);
  const [shown, setShown] = useState(false);

  const alerts = getAlerts(weather).filter((_, i) => !dismissed.includes(i));

  // Delay show so it doesn't flash on load
  useEffect(() => {
    if (!loading && weather) {
      const t = setTimeout(() => setShown(true), 1200);
      return () => clearTimeout(t);
    }
  }, [loading, weather]);

  if (!shown || alerts.length === 0) return null;

  return (
    <div className="weather-alerts">
      {alerts.map((alert, i) => {
        const s = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
        return (
          <div
            key={i}
            className="weather-alert-card"
            style={{ borderColor: s.border, background: s.bg }}
          >
            <div className="wa-icon-wrap" style={{ background: s.icon_bg }}>
              <span className="wa-icon">{alert.icon}</span>
            </div>
            <div className="wa-body">
              <span className="wa-title" style={{ color: s.label }}>{alert.title}</span>
              <span className="wa-msg">{alert.message}</span>
            </div>
            <button
              className="wa-dismiss"
              onClick={() => setDismissed(prev => [...prev, i])}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
