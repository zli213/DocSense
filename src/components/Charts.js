import React from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis as RechartXAxis,
  YAxis as RechartYAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  '#9E8A78', // Camel
  '#B0A090', // Taupe
  '#9B9B7A', // Warm Gray
  '#8E9B90', // Sage Green
  '#7B8E8E', // Steel Teal
  '#A0AEC0', // Slate Blue
  '#A28F9D', // Mauve
];

// const CustomXAxis = ({ dataKey = "name", ...props }) => (
//   <XAxis dataKey={dataKey} {...props} />
// );

// const CustomYAxis = ({ dataKey = "value", ...props }) => (
//   <YAxis dataKey={dataKey} {...props} />
// );



export const LineChartComponent = ({ data, XAxis, YAxis, title }) => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <RechartXAxis dataKey={XAxis} tick={{ fill: '#626770' }}/> 
      <RechartYAxis tick={{ fill: '#626770' }}/>
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
);

// export const PieChartComponent = ({ data }) => (
//   <ResponsiveContainer width="100%" height={400}>
//     <PieChart>
//       <Pie
//         data={data}
//         cx="50%"
//         cy="50%"
//         outerRadius={80}
//         fill="#8884d8"
//         dataKey="value"
//       >
//         {data.map((entry, index) => (
//           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//         ))}
//       </Pie>
//       <Tooltip />
//       <Legend />
//     </PieChart>
//   </ResponsiveContainer>
// );

export const BarChartComponent = ({ data, XAxis, YAxis, title }) => {
  
  // Check if data exists
  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <h2 className="text-center text-lg font-semibold pt-3" style={{ color: '#626770' }}>
          {title}
        </h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <RechartXAxis dataKey={XAxis} tick={{ fill: '#626770' }} />
              <RechartYAxis tick={{ fill: '#626770' }} />
              <Tooltip />
              <Bar dataKey={YAxis} fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
}

  
