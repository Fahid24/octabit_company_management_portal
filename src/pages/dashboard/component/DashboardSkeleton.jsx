import { Users, FolderOpen, Clock, Calendar, Award, UserCheck, UserX, AlertCircle, Filter } from "lucide-react"
import LeaveIcon from "@/assets/Leave.png"

const DashboardSkeleton = () => {
  const StatCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gray-200 w-12 h-12"></div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-5 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )

  const ProgressBarSkeleton = () => (
    <div className="space-y-2 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="h-2 bg-gray-300 rounded-full w-3/4"></div>
      </div>
    </div>
  )

  const CircularProgressSkeleton = ({ size = 120 }) => (
    <div className="relative inline-flex items-center justify-center animate-pulse">
      <div className="rounded-full bg-gray-200" style={{ width: size, height: size }}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 bg-gray-300 rounded w-12"></div>
      </div>
    </div>
  )

  const EmployeeItemSkeleton = () => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )

  const RoleItemSkeleton = () => (
    <div className="flex items-center justify-between animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-4 h-4 rounded-full bg-gray-300"></div>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-6 bg-gray-300 rounded w-6"></div>
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div className="h-2 bg-gray-300 rounded-full w-3/4"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className=" text-gray-900 space-y-3">
      <div className="space-y-8">
        {/* Header */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          <div className="p-6">
            <div className="flex justify-between items-center w-full mb-6">
              <div className="flex items-center space-x-2 animate-pulse">
                <Filter className="w-5 h-5 text-gray-300" />
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-10 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end col-span-12 lg:col-span-8">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project & Task Overview */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center mb-6 animate-pulse">
                <FolderOpen className="w-6 h-6 mr-3 text-gray-300" />
                <div className="h-7 bg-gray-200 rounded w-48"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Project Status */}
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-28 animate-pulse"></div>
                  <div className="space-y-3">
                    <ProgressBarSkeleton />
                    <ProgressBarSkeleton />
                    <ProgressBarSkeleton />
                  </div>
                </div>

                {/* Task Status */}
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="space-y-3">
                    <ProgressBarSkeleton />
                    <ProgressBarSkeleton />
                    <ProgressBarSkeleton />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Analytics */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center mb-6 animate-pulse">
                <Calendar className="w-6 h-6 mr-3 text-gray-300" />
                <div className="h-7 bg-gray-200 rounded w-40"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-xl animate-pulse">
                  <UserCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl animate-pulse">
                  <UserX className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl animate-pulse">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl animate-pulse">
                  <img src={LeaveIcon} alt="Leave" className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-9 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <CircularProgressSkeleton />
                </div>
              </div>
            </div>

            {/* Completion Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
                <div className="flex items-center justify-center">
                  <CircularProgressSkeleton size={150} />
                </div>
                <div className="text-center mt-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-36 mb-6 animate-pulse"></div>
                <div className="flex items-center justify-center">
                  <CircularProgressSkeleton size={150} />
                </div>
                <div className="text-center mt-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-44 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Top Performers */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center mb-6 animate-pulse">
                <Award className="w-5 h-5 mr-2 text-gray-300" />
                <div className="h-6 bg-gray-200 rounded w-28"></div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                  <div className="space-y-3">
                    <EmployeeItemSkeleton />
                    <EmployeeItemSkeleton />
                    <EmployeeItemSkeleton />
                  </div>
                </div>

                <div>
                  <div className="h-4 bg-gray-200 rounded w-28 mb-3 animate-pulse"></div>
                  <div className="space-y-3">
                    <EmployeeItemSkeleton />
                    <EmployeeItemSkeleton />
                  </div>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center mb-6 animate-pulse">
                <Users className="w-5 h-5 mr-2 text-gray-300" />
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>

              <div className="space-y-4">
                <RoleItemSkeleton />
                <RoleItemSkeleton />
                <RoleItemSkeleton />
                <RoleItemSkeleton />
              </div>
            </div>

            {/* Leave Management */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center mb-6 animate-pulse">
                <AlertCircle className="w-5 h-5 mr-2 text-gray-300" />
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSkeleton