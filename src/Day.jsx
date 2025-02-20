import { getWeatherIcon, formatDay } from "./utils";

export default function Day({ date, max, min, code, isToday, tempUnit }) {
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
