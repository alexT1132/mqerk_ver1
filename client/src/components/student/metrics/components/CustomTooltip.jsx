import React from 'react';

/**
 * Custom Tooltip for PieChart
 * Displays detailed information about a pie chart segment when hovered.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.active - Whether the tooltip is active
 * @param {Array} props.payload - Data payload for the tooltip
 * @returns {JSX.Element|null} Tooltip component or null if not active
 */
export const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-600 relative z-[9999] backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full shadow-lg"
            style={{ backgroundColor: data.color }}
          ></div>
          <div>
            <p className="font-bold text-sm text-gray-100">{data.name}</p>
            <p className="text-xl font-black" style={{ color: data.color }}>
              {data.originalPercent}%
            </p>
          </div>
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    );
  }
  return null;
};

/**
 * Custom Tooltip for Bar Charts
 * Displays detailed information about bar chart data points when hovered.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.active - Whether the tooltip is active
 * @param {Array} props.payload - Data payload for the tooltip
 * @param {string} props.label - Label for the data point
 * @returns {JSX.Element|null} Tooltip component or null if not active
 */
export const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-4 rounded-xl shadow-2xl border border-blue-400 relative z-[9999] backdrop-blur-sm">
        <p className="font-bold text-blue-200 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm font-medium text-gray-200">{entry.dataKey}:</span>
            <span className="font-bold text-lg" style={{ color: entry.color }}>
              {entry.value}%
            </span>
          </div>
        ))}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-800"></div>
      </div>
    );
  }
  return null;
};

/**
 * Custom Label for PieChart
 * Renders abbreviated labels inside pie chart segments.
 * 
 * @param {Object} props - Label props from Recharts
 * @param {number} props.cx - X coordinate of pie center
 * @param {number} props.cy - Y coordinate of pie center
 * @param {number} props.midAngle - Mid angle of the segment
 * @param {number} props.innerRadius - Inner radius of the pie
 * @param {number} props.outerRadius - Outer radius of the pie
 * @param {number} props.percent - Percentage of the segment
 * @param {number} props.index - Index of the segment
 * @param {Array} props.pieChartData - Data array for the pie chart
 * @returns {JSX.Element} SVG text element
 */
export const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  index,
  pieChartData
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="8px"
      fontWeight="bold"
    >
      {pieChartData && pieChartData[index] ? pieChartData[index].code : ''}
    </text>
  );
};

/**
 * Main CustomTooltip component that exports all tooltip utilities
 * This component provides reusable tooltip components for charts.
 */
const CustomTooltip = {
  Pie: CustomPieTooltip,
  Bar: CustomBarTooltip,
  Label: renderCustomizedLabel,
};

export default CustomTooltip;