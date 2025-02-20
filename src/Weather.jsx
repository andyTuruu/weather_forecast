import ForecastChart from "./ForecastChart";
import Day from "./Day";
import { formatDay, convertFtoC } from "./utils";

export default function Weather({ weather, location, tempUnit }) {
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
        <h2>Weather in {location}</h2>
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
