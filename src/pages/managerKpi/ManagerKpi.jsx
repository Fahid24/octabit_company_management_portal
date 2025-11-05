import { useState } from "react";
import { useParams } from "react-router-dom";
import { format, subMonths } from "date-fns";
import { useGetManagerKpiStatsQuery } from "../../redux/features/statsManager/statsManagerApiSlice";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import DateRangeSelector from "@/component/DateRangeSelector";
import Error from "@/component/Error";
import Loader from "@/component/Loader";
import KpiSummaryCards from "./components/KpiSummaryCards";
import ProjectBarChart from "./components/ProjectBarChart";
import CompletionPieChart from "./components/CompletionPieChart";
import ProjectRadarChart from "./components/ProjectRadarChart";
import AverageCompletionDoughnut from "./components/AverageCompletionDoughnut";
import ProjectLineChart from "./components/ProjectLineChart";
import ProjectDetailsTable from "./components/ProjectDetailsTable";
import PerformanceInsights from "./components/PerformanceInsights";
import { useSelector } from "react-redux";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const ManagerKpi = () => {
  const loginUser = useSelector((state) => state.userSlice.user);
  const { managerId } = useParams();
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  // Fetch manager KPI stats
  const { data, isLoading, isError, error } = useGetManagerKpiStatsQuery({
    managerId: managerId || loginUser?.user?._id,
    from: dateRange.startDate,
    to: dateRange.endDate,
  });

  const handleDateRangeChange = (newRange) => {
    setDateRange({
      startDate: format(newRange.startDate, "yyyy-MM-dd"),
      endDate: format(newRange.endDate, "yyyy-MM-dd"),
    });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[100vh]">
        <Loader />
      </div>
    );
  if (error) return <p> No KPI data found </p>;

  const { stats } = data;

  // Data for project breakdown bar chart
  const projectBarData = stats.projectBreakdown.map((project) => ({
    name: project.projectName,
    assigned: project.assigned,
    completed: project.completed,
    completionRate: project.completionRate,
  }));

  // Data for the completion rate pie chart
  const completionPieData = [
    { name: "Completed", value: stats.completedTasks, color: "#10B981" },
    {
      name: "Pending",
      value: stats.totalTasks - stats.completedTasks,
      color: "#F59E0B",
    },
  ];

  // Data for the project completion radar chart
  const radarData = stats.projectBreakdown.map((project) => ({
    subject: project.projectName,
    avgCompletion: project.avgCompletion,
    completionRate: project.completionRate,
  }));

  // Data for the average completion doughnut chart
  const doughnutData = {
    labels: ["Average Completion", "Remaining"],
    datasets: [
      {
        data: [stats.avgCompletion, 100 - stats.avgCompletion],
        backgroundColor: ["#3B82F6", "#E5E7EB"],
        borderColor: ["#2563EB", "#D1D5DB"],
        borderWidth: 1,
      },
    ],
  };

  // Data for project specific line chart
  const lineData = {
    labels: stats.projectBreakdown.map((project) => project.projectName),
    datasets: [
      {
        label: "Assignment Rate",
        data: stats.projectBreakdown.map((project) => project.assigned),
        borderColor: "#EC4899",
        backgroundColor: "rgba(236, 72, 153, 0.5)",
        tension: 0.4,
      },
      {
        label: "Completion Rate",
        data: stats.projectBreakdown.map((project) => project.completionRate),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.5)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Manager KPI Dashboard
        </h1>
        <p className="text-gray-600">
          Performance metrics and project insights
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
        </div>
      </div>

      <KpiSummaryCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProjectBarChart data={projectBarData} />
        <CompletionPieChart data={completionPieData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProjectRadarChart data={radarData} />
        <AverageCompletionDoughnut
          data={doughnutData}
          avgCompletion={stats.avgCompletion}
        />
      </div>

      <ProjectLineChart data={lineData} />
      <ProjectDetailsTable projectBreakdown={stats.projectBreakdown} />
      <PerformanceInsights stats={stats} />
    </div>
  );
};

export default ManagerKpi;
