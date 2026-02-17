const API_KEY = process.env.OPENWEATHER_API_KEY!;

export async function getWeather(lat: number, lon: number) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Weather service failed");
  }

  const data = await res.json();

  return {
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    wind: data.wind.speed,
    description: data.weather[0].description,
    raw: data,
  };
}
export async function getForecast5Day(lat: number, lon: number) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forecast service failed");
  return res.json();
}
