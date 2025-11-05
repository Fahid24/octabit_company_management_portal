export default function OverviewCards({ data }) {
  const cards = [
    {
      title: "Total Departments",
      value: data?.totalDepartments,
      icon: "fa-building",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Employees",
      value: data?.totalEmployees,
      icon: "fa-users",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Task Completion Rate",
      value: `${data?.completionRate.toFixed(2)}%`,
      icon: "fa-tasks",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Average Completion",
      value: `${data?.avgCompletion.toFixed(2)}%`,
      icon: "fa-chart-bar",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card?.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card?.value}</p>
            </div>
            <div className={`${card?.bgColor} p-3 rounded-full`}>
              <i className={`fas ${card?.icon} ${card?.iconColor} text-xl`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
