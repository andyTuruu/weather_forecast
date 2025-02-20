import { useState, useEffect, useMemo } from "react";
import Input from "./Input";
import Results from "./Results";
import Weather from "./Weather";
import { convertToFlag, convertAlpha3ToAlpha2 } from "./utils";

export default function App() {
  const [location, setLocation] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [tempUnit, setTempUnit] = useState("F");
  const [position, setPosition] = useState({});
  const [error, setError] = useState(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [isReverseGeocodeLoading, setIsReverseGeocodeLoading] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const isAnyLoading =
    isSearchLoading ||
    isWeatherLoading ||
    isReverseGeocodeLoading ||
    isGeoLoading;

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
      setIsSearchLoading(true);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=20&language=en`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsSearchLoading(false);
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
      setIsWeatherLoading(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${tz}&temperature_unit=fahrenheit&current=temperature_2m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=14`
        );
        const data = await response.json();
        setWeather([data.daily, data.current]);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setIsWeatherLoading(false);
      }
    }
    fetchWeather();
  }, [selectedLocation]);

  useEffect(() => {
    async function fetchReverseGeocode() {
      const API_KEY = "lb-3yEOGYgSOS1g486jIg6i_X8wqAUZOiJGldRPuXjA";
      if (position.lat && position.lng) {
        setIsReverseGeocodeLoading(true);
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
          setIsReverseGeocodeLoading(false);
        }
      } else {
        setIsReverseGeocodeLoading(false);
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
      setIsGeoLoading(true);
      const pos = await getCurrentPositionAsync();
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsGeoLoading(false);
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
      {!selectedLocation && !isAnyLoading && (
        <button className="button" onClick={handleCurrent}>
          Use current location
        </button>
      )}
      {isAnyLoading && <p className="loader">Loading...</p>}
      {location.length > 1 && !selectedLocation && (
        <Results locations={searchResults} handleSelection={handleSelection} />
      )}
      {!isAnyLoading && weather && selectedLocation && (
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
