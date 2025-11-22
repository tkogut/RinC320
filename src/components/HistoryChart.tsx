import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Reading = {
  ts: number;
  weight: number | null;
};

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString();
};

const HistoryChart: React.FC<{ readings: Reading[] }> = ({ readings }) => {
  const data = readings.map((r) => ({
    ...r,
    time: formatTime(r.ts),
    weight: r.weight ?? null,
  }));

  return (
    <div className="w-full h-56 bg-white rounded border p-2">
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm text-gray-500">
          Brak danych historycznych
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HistoryChart;