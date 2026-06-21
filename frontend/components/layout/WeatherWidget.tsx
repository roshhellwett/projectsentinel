'use client';

import { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudDrizzle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface WeatherData {
  temp: number;
  city: string;
  code: number;
}

function getWeatherIcon(code: number): LucideIcon {
  if (code === 0) return Sun;
  if ([1, 2, 3].includes(code)) return Cloud;
  if ([45, 48].includes(code)) return CloudFog;
  if ([51, 53, 55, 56, 57].includes(code)) return CloudDrizzle;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return CloudRain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
  if ([95, 96, 99].includes(code)) return CloudLightning;
  return Sun;
}

export function WeatherWidget({ className = '' }: { className?: string }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (!ipRes.ok) throw new Error('IP API failed');
        const ipData = await ipRes.json();
        
        if (!ipData.latitude || !ipData.longitude) throw new Error('No location');

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${ipData.latitude}&longitude=${ipData.longitude}&current_weather=true`
        );
        if (!weatherRes.ok) throw new Error('Weather API failed');
        const weatherData = await weatherRes.json();

        setData({
          temp: Math.round(weatherData.current_weather.temperature),
          code: weatherData.current_weather.weathercode,
          city: ipData.city || 'Local',
        });
      } catch (err) {
        // Silent catch to fallback gracefully
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading || !data) {
    return (
      <div className={`flex flex-col items-end px-5 py-4 border-l border-b border-rule-strong bg-paper shadow-paper-lift opacity-0 ${className}`} />
    );
  }

  const Icon = getWeatherIcon(data.code);

  return (
    <div className={cn('relative inline-flex flex-col items-start md:items-end gap-1 border border-rule bg-paper px-5 py-3', className)}>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
          {data.city} Weather
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted" strokeWidth={2.5} />
        <div className="text-[26px] font-bold tabular-nums leading-none text-ink font-mono">
          {data.temp}°
        </div>
      </div>
    </div>
  );
}
