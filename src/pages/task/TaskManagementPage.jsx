import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import Pagination from "@/component/Pagination";
import Table from "@/component/Table";
import { toast } from "@/component/Toast";
import {
  useDeleteTaskMutation,
  useGetAllTasksQuery,
} from "@/redux/features/task/taskApiSlice";
// import { useDeleteTaskMutation, useGetAllTasksQuery } from "@/redux/features/admin/task/taskApiSlice";
import { errorAlert, successAlert, warningAlert } from "@/utils/allertFunction";
import { Calendar, FileEdit, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TaskManagementPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: [],
    
  });
  const navigate = useNavigate();

  const {
    data: taskData,
    isLoading: taskLoading,
    refetch,
  } = useGetAllTasksQuery({
    page: currentPage,
    limit: limit,
  });
  // console.log(taskData);

  const [deleteTask] = useDeleteTaskMutation();

  const handleDelete = async (id) => {
    try {
      const result = await warningAlert({
        title: "Are you sure you want to delete this task?",
        text: "This action cannot be undone.",
        preConfirm: async () => {
          await deleteTask(id).unwrap();
          return true;
        },
      });

      if (result.isConfirmed) {
        // successAlert({
        //   title: "Success",
        //   text: "Task deleted successfully!",
        // });
        toast.success("Success", "Task deleted successfully!");
        await refetch();
      }
    } catch (err) {
      // errorAlert({
      //   title: "Error",
      //   text: err?.data?.message || "Failed to delete task",
      // });
      toast.error(
        "Error",
        err?.data?.message || "Failed to delete task. Please try again."
      );
    }
  };

  const tableData = taskData?.tasks?.map((task) => ({
    Title: task?.title,
    Project: task?.project?.name,
    "task Type": task?.taskType,
    "Start Date": new Date(task?.startDate)?.toLocaleDateString(),
    "Due Date": new Date(task?.dueDate)?.toLocaleDateString(),
    Priority: task?.priority,
    Status: task?.status,
    Actions: (
      <div className="flex gap-2">
        <button
          className="p-2 text-primary hover:bg-blue-50 rounded-full transition-colors border border-primary"
          onClick={() => navigate(`/update-task/${task?._id}`)}
          title="Edit Department"
        >
          <FileEdit size={18} />
        </button>
        <button
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-red-500"
          onClick={() => handleDelete(task?.id)}
          title="Delete Task"
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  }));
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto mt-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Task Management
          </h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm border ${stat?.borderColor} p-6 transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat?.title}
                  </p>
                  <p className="text-3xl font-bold mt-2">{stat?.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat?.color}`}>
                  {stat?.icon}
                </div>
              </div>
            </div>
          ))} */}
        </div>

        <div className="flex justify-end mx-10 mb-4">
          <div className="mt-4 lg:w-1/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingInput
              label="Start Date"
              type="date"
              // name="startDate"
              // value={dateFilter.startDate}
              // onChange={handleDateFilterChange}
              icon={<Calendar className="h-5 w-5" />}
              min={new Date().toISOString().split("T")[0]}
            />

            <FloatingInput
              label="End Date"
              type="date"
              name="endDate"
              // value={dateFilter.endDate}
              // onChange={handleDateFilterChange}
              icon={<Calendar className="h-5 w-5" />}
              // min={
              //   dateFilter.startDate || new Date().toISOString().split("T")[0]
              // }
            />
          </div>
          <div className=" ">
            <Button
              type="button"
              className="w-1/7 uppercase rounded-md mt-8 mx-2"
              // onClick={() => setDateFilter({ startDate: "", endDate: "" })}
              iconPosition="left"
              size="md"
            >
              Reset
            </Button>
          </div>
        </div>

        {taskLoading ? (
          <div className="flex justify-center items-center h-64">
            <h1 className="text-gray-500">Loading...</h1>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <Table
                isLoading={taskLoading}
                data={tableData}
                columns={[
                  "Title",
                  "Project",
                  "Assigned To",
                  "Department",
                  "Start Date",
                  "Due Date",
                  "Priority",
                  "Status",
                  "Actions",
                ]}
              />
            </div>

            {tableData.length > 0 && (
              <div className="mt-6 px-4 sm:px-0">
                <Pagination
                  currentCount={tableData.length}
                  totalCount={taskData?.pagination?.totalDocs}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  limit={limit}
                  setLimit={setLimit}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskManagementPage;
