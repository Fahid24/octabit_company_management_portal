import { useState } from "react";
import { CalendarCheck, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import {
  useGetAllDailyTasksQuery,
  useCreateDailyTaskMutation,
  useGetAllDailyTasksByEmployeeIdQuery,
} from "@/redux/features/dailyTask/dailyTaskApiSlice";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import { toast } from "@/component/Toast";
import { useNavigate } from "react-router-dom";
import CreateTaskModal from "../../dailyTask/components/CreateTaskModal";
import TaskSkeleton from "./TaskSkeleton";

const DailyTasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loggedInUser = useSelector((state) => state.userSlice.user);
  const [createDailyTask] = useCreateDailyTaskMutation();
  const navigate = useNavigate();

  // const {
  //   data: taskData,
  //   isLoading: isDailyTasksLoading,
  //   refetch,
  // } = useGetAllDailyTasksQuery({ page: 1, limit: 10 });

  const {
    data: taskData,
    isLoading: isDailyTasksLoading,
    refetch,
  } = useGetAllDailyTasksByEmployeeIdQuery({
    employeeId: loggedInUser?.user?._id,
  });

  // console.log(taskData);

  const { data: employeesData } = useGetEmployeesQuery({
    page: 1,
    limit: 9000000000,
  });

  const handleCreateTask = async (taskPayload) => {
    try {
      await createDailyTask(taskPayload).unwrap();
      toast.success("Success", "Task created successfully!");
      refetch();
      navigate("/daily-task");
      return true;
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error(
        "Error",
        error?.data?.message || "Failed to create task. Please try again."
      );
      throw error;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="px-6 py-5 rounded-t-3xl border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-primary/10 to-white">
        <h2 className="text-xl font-bold text-gray-800">Daily Tasks</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full border border-primary text-primary hover:bg-primary hover:text-white"
        >
          <Plus />
        </button>
      </div>

      <div
        className={`p-5 h-[515px] overflow-auto ${
          !isDailyTasksLoading && taskData?.data?.dailyTasks?.length === 0
            ? "flex justify-center items-center"
            : ""
        }`}
      >
        {isDailyTasksLoading ? (
          <ul className="space-y-3">
            {/* Show 5 skeleton items while loading */}
            {Array.from({ length: 5 }).map((_, index) => (
              <TaskSkeleton key={index} />
            ))}
          </ul>
        ) : taskData?.data?.dailyTasks?.length > 0 ? (
          <ul className="space-y-3">
            {taskData?.data?.dailyTasks?.map((task) => (
              <li
                key={task?._id}
                onClick={() => navigate(`/daily-task`)}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 border-primary/30 shadow-md cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-gray-800 ${
                        task.completed ? "line-through text-gray-400" : ""
                      }`}
                    >
                      <p className="text-sm font-semibold">{task?.title}</p>
                      <p className="text-xs">{task?.details}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 first-letter:uppercase rounded-full font-semibold ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center -mt-10">
            <div className="w-20 h-20 mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <CalendarCheck className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-1">
              No Daily Tasks Found!
            </h3>
            <p className="text-gray-500">
              You can add a new daily task using the + button.
            </p>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeesData={employeesData}
        loggedInUser={loggedInUser}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
};

export default DailyTasks;
