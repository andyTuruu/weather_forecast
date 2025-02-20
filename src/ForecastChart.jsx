import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ForecastChart({ data, tempUnit }) {
  return (
    <div className="chartContainer">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 50, right: 20, left: 10, bottom: 0 }}
        >
          <XAxis dataKey="date" stroke="#1d3557" tickMargin={8} />
          <YAxis
            label={{
              value: `Temp (${tempUnit})`,
              angle: -90,
              position: "insideLeft",
              fill: "#1d3557",
              fontSize: 18,
              dy: 35,
            }}
            tickCount={8}
            stroke="#1d3557"
            tickMargin={8}
          />
          <Tooltip />
          <Legend wrapperStyle={{ pointerEvents: "none" }} />
          <Line
            type="monotone"
            dataKey="high"
            stroke="#e74c3c"
            name="High"
            strokeWidth={1.25}
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="#457b9d"
            name="Low"
            strokeWidth={1.25}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
