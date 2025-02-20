import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
// Register the locale
countries.registerLocale(enLocale);

// Direct mapping of weather codes to icons
const weatherIconMap = {
  0: "☀️",
  1: "🌤",
  2: "⛅️",
  3: "☁️",
  45: "🌫",
  48: "🌫",
  51: "🌦",
  56: "🌦",
  61: "🌦",
  66: "🌦",
  80: "🌦",
  53: "🌧",
  55: "🌧",
  63: "🌧",
  65: "🌧",
  57: "🌧",
  67: "🌧",
  81: "🌧",
  82: "🌧",
  71: "🌨",
  73: "🌨",
  75: "🌨",
  77: "🌨",
  85: "🌨",
  86: "🌨",
  95: "🌩",
  96: "⛈",
  99: "⛈",
};

export function getWeatherIcon(wmoCode) {
  return weatherIconMap[wmoCode] || "NOT FOUND";
}

export function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

export function formatDay(dateStr, isWeekdayIncluded = true) {
  const options = {
    month: "numeric",
    day: "numeric",
  };

  if (isWeekdayIncluded) {
    options.weekday = "short";
  }

  return new Intl.DateTimeFormat("en", options).format(
    new Date(dateStr + "T00:00:00")
  );
}

// Helper: Convert Fahrenheit to Celsius
export function convertFtoC(f) {
  return Math.round(((f - 32) * 5) / 9);
}

export function convertAlpha3ToAlpha2(alpha3) {
  return countries.alpha3ToAlpha2(alpha3);
}
