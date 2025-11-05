import Tooltips from "@/component/Tooltip2"
import { CircleAlert } from "lucide-react"
import { useState, useEffect } from "react"
import useIsMobile from "@/hook/useIsMobile"

export default function Header({ onRefresh, loading }) {
  const [lastUpdated, setLastUpdated] = useState("")
  const isMobile = useIsMobile()

  useEffect(() => {
    updateLastUpdated()
  }, [])

  const updateLastUpdated = () => {
    const now = new Date()
    setLastUpdated(now.toLocaleTimeString())
  }

  const handleRefresh = () => {
    onRefresh()
    updateLastUpdated()
  }

  return (
    <header className="">
      <div className="">
        <div className="flex justify-between items-center pb-4">
          <div className="flex items-center">
            <i className="fas fa-chart-line text-blue-600 text-2xl mr-3"></i>
            <h1 className="text-2xl font-semibold text-gray-900">
              KPI Dashboard
            </h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="This dashboard is used to monitor and evaluate overall performance within an organization. It helps track how well departments and employees are meeting their goals through visual KPIs like task completion, attendance, and efficiency scores."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-500">
              Last Updated: <span>{lastUpdated}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
