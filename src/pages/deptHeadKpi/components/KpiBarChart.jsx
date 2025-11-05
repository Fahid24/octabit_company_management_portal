import PropTypes from "prop-types";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

/**
 * KpiBarChart - Reusable Bar Chart for KPI Performance
 * @param {Array} data - Chart data array
 * @param {string} xKey - Key for X axis
 * @param {Array} bars - Array of bar configs: { dataKey, name, fill }
 * @param {object} [margin] - Chart margin
 * @param {number|string} [height] - Chart height (px or CSS)
 */
const KpiBarChart = ({ data, xKey = "name", bars = [], margin = { top: 5, right: 5, left: 5, bottom: 5 }, height = 260 }) => (
  <div style={{ width: "100%", height }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tick={false} />
        <YAxis />
        <Tooltip />
        <Legend />
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.fill} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
);

KpiBarChart.propTypes = {
  data: PropTypes.array.isRequired,
  xKey: PropTypes.string,
  bars: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      fill: PropTypes.string,
    })
  ),
  margin: PropTypes.object,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default KpiBarChart;
