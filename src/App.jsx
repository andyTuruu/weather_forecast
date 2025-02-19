import { useState, useEffect, useMemo } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

function ForecastChart({ data, tempUnit }) {
  return (
    <div className="chartContainer">
      <ResponsiveContainer width="100%" height={420}>
        <LineChart
          data={data}
          margin={{ top: 50, right: 30, left: 0, bottom: 0 }}
        >
          <XAxis dataKey="date" />
          <YAxis
            label={{
              value: `Temp (${tempUnit})`,
              angle: -90,
              position: "insideLeft",
            }}
            tickCount={8}
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="high" stroke="#e74c3c" name="High" />
          <Line type="monotone" dataKey="low" stroke="#3498db" name="Low" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function getWeatherIcon(wmoCode) {
  return weatherIconMap[wmoCode] || "NOT FOUND";
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr, isWeekdayIncluded = true) {
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
function convertFtoC(f) {
  return Math.round(((f - 32) * 5) / 9);
}

function convertAlpha3ToAlpha2(alpha3) {
  return countries.alpha3ToAlpha2(alpha3);
}

function Input({ location, onChangeLocation }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Search for a location..."
        value={location}
        onChange={onChangeLocation}
      />
    </div>
  );
}

function Results({ locations, handleSelection }) {
  return (
    <div>
      {locations.length > 0 && <h2>Choose Your Location</h2>}
      <ul>
        {locations.map((loc) => (
          <Result
            key={loc.id}
            location={loc}
            onClick={() => handleSelection(loc)}
          />
        ))}
      </ul>
    </div>
  );
}

function Result({ location, onClick }) {
  // Always include name and country, and conditionally include admin levels
  const parts = [location.name];
  if (location.admin3) parts.push(location.admin3);
  if (location.admin2) parts.push(location.admin2);
  if (location.admin1) parts.push(location.admin1);
  parts.push(location.country);

  return (
    <li onClick={onClick} style={{ cursor: "pointer" }}>
      {parts.join(", ")}
    </li>
  );
}

function Weather({ weather, location, tempUnit }) {
  const {
    temperature_2m_max: max,
    temperature_2m_min: min,
    time: dates,
    weather_code: codes,
  } = weather[0];
  const { apparent_temperature: feel, temperature_2m: now } = weather[1];

  // Convert current temperature if necessary
  const currentTemp = tempUnit === "F" ? Math.round(now) : convertFtoC(now);
  const currentFeel = tempUnit === "F" ? Math.round(feel) : convertFtoC(feel);

  //   Create an array of objects for the chart
  const chartData = dates.map((date, i) => ({
    date: formatDay(date, false),
    high: tempUnit === "F" ? Math.round(max[i]) : convertFtoC(max[i]),
    low: tempUnit === "F" ? Math.round(min[i]) : convertFtoC(min[i]),
  }));

  return (
    <>
      <div className="weatherHeader">
        <h2>Weather {location}</h2>
        <h3>
          The air temperature is {currentTemp}&deg;{tempUnit}. It feels like{" "}
          {currentFeel}&deg;{tempUnit}.
        </h3>
      </div>
      <ul className="weather">
        {dates.map((date, i) => (
          <Day
            key={date}
            date={date}
            max={tempUnit === "F" ? Math.round(max[i]) : convertFtoC(max[i])}
            min={tempUnit === "F" ? Math.round(min[i]) : convertFtoC(min[i])}
            code={codes[i]}
            isToday={i === 0}
            tempUnit={tempUnit}
          />
        ))}
      </ul>
      <ForecastChart data={chartData} tempUnit={tempUnit} />
    </>
  );
}

function Day({ date, max, min, code, isToday, tempUnit }) {
  return (
    <li className="day">
      <span>{getWeatherIcon(code)}</span>
      <p>{isToday ? "Today" : formatDay(date, true)}</p>
      <p>
        H: {max}&deg;{tempUnit}
        <br />
        L: {min}&deg;{tempUnit}
      </p>
    </li>
  );
}

export default function App() {
  const [location, setLocation] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tempUnit, setTempUnit] = useState("F");
  const [position, setPosition] = useState({});
  const [error, setError] = useState(null);

  // On mount, load any stored location from localStorage
  useEffect(() => {
    const storedLocation = localStorage.getItem("location");
    if (storedLocation) {
      setLocation(storedLocation);
    }
  }, []);

  // Fetch geocoding results as the user types
  useEffect(() => {
    async function fetchLocations() {
      if (location.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLocations();
  }, [location]);

  useEffect(() => {
    async function fetchWeather() {
      if (!selectedLocation) return;
      const { latitude, longitude, timezone } = selectedLocation;
      // Default to "auto" if timezone is missing
      const tz = timezone || "auto";
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${tz}&temperature_unit=fahrenheit&current=temperature_2m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=14`
        );
        const data = await response.json();
        setWeather([data.daily, data.current]);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWeather();
  }, [selectedLocation]);

  useEffect(() => {
    async function fetchReverseGeocode() {
      const API_KEY = "lb-3yEOGYgSOS1g486jIg6i_X8wqAUZOiJGldRPuXjA";
      setIsLoading(true);
      if (position.lat && position.lng) {
        try {
          const response = await fetch(
            `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${position.lat},${position.lng}&lang=en-US&apiKey=${API_KEY}`
          );

          const data = await response.json();

          if (data) {
            const fetchedLoc = data.items[0].address;

            // Optionally, you could trigger the weather fetch here
            const locationData = {
              latitude: position.lat,
              longitude: position.lng,
              name: fetchedLoc.city,
              admin1: fetchedLoc.state,
              country_code: fetchedLoc.countryCode,
            };
            setSelectedLocation(locationData);
          } else {
            console.error("No location results found.");
          }
        } catch (error) {
          console.error("Error fetching reverse geocode:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchReverseGeocode();
  }, [position]);

  // Handle selection from search results
  function handleSelection(locationObj) {
    setSelectedLocation(locationObj);
    setLocation(locationObj.name); // Update input with selected name
    localStorage.setItem("location", locationObj.name);
    setSearchResults([]); // Clear search results
  }

  const displayLocation = useMemo(() => {
    if (!selectedLocation) return "";
    const { name, admin1, country_code } = selectedLocation;
    const twoLetterCode =
      country_code && country_code.length === 3
        ? convertAlpha3ToAlpha2(country_code)
        : country_code;
    // Only include admin1 if it exists
    return `${name}${admin1 ? `, ${admin1}` : ""} ${convertToFlag(
      twoLetterCode
    )}`;
  }, [selectedLocation]);

  // Toggle temperature unit
  function toggleTempUnit() {
    setTempUnit((prev) => (prev === "F" ? "C" : "F"));
  }

  function getCurrentPositionAsync() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Your browser does not support geolocation"));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async function handleCurrent() {
    try {
      const pos = await getCurrentPositionAsync();
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="app">
      <h1>Fortnight Weather Forecast</h1>
      {error && <div className="errorMessage">{error}</div>}
      <Input
        location={location}
        onChangeLocation={(e) => {
          setLocation(e.target.value);
          setSelectedLocation(null); // Reset selection when user types
        }}
      />
      {!selectedLocation && !isLoading && (
        <button className="button" onClick={handleCurrent}>
          Use current location
        </button>
      )}
      {isLoading && <p className="loader">Loading...</p>}
      {location.length > 1 && !selectedLocation && (
        <Results locations={searchResults} handleSelection={handleSelection} />
      )}
      {!isLoading && weather && selectedLocation && (
        <>
          <button className="button" onClick={toggleTempUnit}>
            Switch to {tempUnit === "F" ? "Celsius" : "Fahrenheit"}
          </button>
          <Weather
            weather={weather}
            location={displayLocation}
            tempUnit={tempUnit}
          />
        </>
      )}
    </div>
  );
}
