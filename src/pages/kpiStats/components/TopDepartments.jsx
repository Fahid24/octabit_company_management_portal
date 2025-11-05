export default function TopDepartments({ departments }) {
  const topDepartments = departments?.filter((dept) => dept?.finalKpiScore > 0)?.sort((a, b) => b?.finalKpiScore - a?.finalKpiScore)?.slice(0, 5)

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return { icon: "fa-trophy", color: "text-yellow-600" }
      case 1:
        return { icon: "fa-medal", color: "text-gray-500" }
      case 2:
        return { icon: "fa-award", color: "text-orange-600" }
      default:
        return { icon: "fa-star", color: "text-gray-400" }
    }
  }

  return (
    <div className="space-y-4">
      {topDepartments?.map((dept, index) => {
        const { icon, color } = getRankIcon(index)

        return (
          <div key={dept.departmentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <i className={`fas ${icon} ${color} mr-3`}></i>
              <div>
                <p className="font-medium text-gray-900">{dept?.departmentName}</p>
                <p className="text-sm text-gray-500">{dept?.stats?.totalEmployees} employees</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">{dept?.finalKpiScore?.toFixed(1)}</p>
              <p className="text-sm text-gray-500">KPI Score</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
