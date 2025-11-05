import { useState } from "react"
import Header from "./Header"
import OverviewCards from "./OverviewCards"
import ChartsGrid from "./ChartsGrid"
import DepartmentAnalysis from "./DepartmentAnalysis"

export default function DashboardKpi({ data, onRefresh, loading }) {
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <Header onRefresh={onRefresh} loading={loading} />

      <main className="">
        <OverviewCards data={data?.organization} />

        <ChartsGrid data={data?.organization} />

        <DepartmentAnalysis
          departments={data?.organization?.departmentBreakdown}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
        />
      </main>
    </div>
  )
}