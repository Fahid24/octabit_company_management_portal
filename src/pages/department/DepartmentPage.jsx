import { useMemo, useState, useRef, useEffect } from "react";
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/redux/features/department/departmentApiSlice";
import Table from "@/component/Table";
import Pagination from "@/component/Pagination";
import Button from "@/component/Button";
import { Plus, FileEdit, Trash2, X, CircleAlert } from "lucide-react";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import SelectInput from "@/component/select/SelectInput";
import Loader from "@/component/Loader";
import Tooltip from "@/component/Tooltip";
import ConfirmDialog from "@/component/ConfirmDialog";
import { toast } from "@/component/Toast";
import useIsMobile from "@/hook/useIsMobile";
import Tooltips from "@/component/Tooltip2";

const DepartmentPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentHead, setDepartmentHead] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const nameInputRef = useRef(null);
  const createNameInputRef = useRef(null);
  const [kpiCriteria, setKpiCriteria] = useState([]);

  const [kpiTouched, setKpiTouched] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const isMobile = useIsMobile();
  const modalRef = useRef(null);

  const { data, error, isLoading, isFetching, refetch } =
    useGetDepartmentsQuery({
      page: currentPage,
      limit,
      populate: true,
    });

  const { data: employeesData, isLoading: isEmployeesDataLoading } =
    useGetEmployeesQuery({
      page: 1,
      limit: 9000000000,
    });

  // console.log(employeesData);

  const [createDepartment, { isLoading: isCreating }] =
    useCreateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDepartmentMutation();

  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    }

    if (kpiCriteria.length === 0) {
      errors.kpi = "At least one KPI criteria is required";
    }

    // if (!departmentHead?.value?.trim()) {
    //   errors.departmentHead = "Department head is required";
    // }

    // if (!selectedManagers || selectedManagers.length === 0) {
    //   errors.selectedManagers = "Please select at least one manager";
    // }

    if (kpiCriteria.length === 0) {
      errors.kpiCriteria = "At least one KPI criteria is required";
    }

    if (kpiTouched) {
      const kpiErrors = [];

      kpiCriteria.forEach((kpi, index) => {
        const kpiRowError = {};
        if (!kpi.criteria.trim()) {
          kpiRowError.criteria = "Criteria name is required";
        }
        const value = Number(kpi.value);
        if (kpi.value === "" || isNaN(value) || value < 0 || value > 100) {
          kpiRowError.value = "Value must be between 0 and 100";
        }
        if (Object.keys(kpiRowError).length > 0) {
          kpiErrors[index] = kpiRowError;
        }
      });

      if (kpiErrors.length > 0) {
        errors.kpiCriteria = kpiErrors;
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      // errorAlert({
      //   title: "Validation Error",
      //   text: "Please provide all required information before submitting the form.",
      // });
      toast.error(
        "Validation Error",
        "Please fill all required fields correctly."
      );
      return;
    }

    try {
      await createDepartment({
        name,
        description,
        departmentHeads:
          Array.isArray(departmentHead) && departmentHead.length
            ? departmentHead.map((h) => h.value)
            : [],
        projectManagers: selectedManagers.map((manager) => manager.value),
        kpiCriteria: kpiCriteria.length ? kpiCriteria : undefined,
      }).unwrap();
      setIsModalOpen(false);
      setName("");
      setDescription("");
      setDepartmentHead([]);
      setSelectedManagers([]);
      setKpiCriteria([]);
      setKpiTouched(false);
      setFormErrors({});
      setCurrentPage(1);
      toast.success("Success", "Department created successfully!");
      await refetch();
    } catch (err) {
      // console.log(err);
      toast.error("Error", err?.data?.error || "Failed to create department");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error(
        "Validation Error",
        "Please fill all required fields correctly."
      );
      return;
    }

    try {
      await updateDepartment({
        id: editingDepartment.id,
        data: {
          name,
          description,
          departmentHeads:
            Array.isArray(departmentHead) && departmentHead.length
              ? departmentHead.map((h) => h.value)
              : [],
          projectManagers:
            selectedManagers.map((manager) => manager.value)?.length == 0
              ? []
              : selectedManagers.map((manager) => manager.value),
          kpiCriteria: kpiCriteria.length ? kpiCriteria : undefined,
        },
      }).unwrap();
      setIsEditModalOpen(false);
      setName("");
      setDescription("");
      setEditingDepartment(null);
      toast.success("Success", "Department updated successfully!");
      refetch();
    } catch (err) {
      toast.error("Error", err?.data?.message || "Failed to update department");
    }
  };

  const handleEdit = (department) => {
    // console.log(department);
    setEditingDepartment(department);
    setName(department.name);
    setDescription(department.description);
    setDepartmentHead(
      Array.isArray(department?.departmentHeads)
        ? department.departmentHeads.map((head) => ({
            label: `${head?.firstName || ""} ${head?.lastName || ""}`,
            value: head?._id,
          }))
        : []
    );
    setSelectedManagers(
      department?.projectManagers?.map((manager) => ({
        label: `${manager?.firstName} ${manager?.lastName}`,
        value: manager?._id,
      })) || []
    );
    setKpiCriteria(
      department?.kpiCriteria?.map((kpi) => ({
        criteria: kpi?.kpi?.criteria || "",
        value: kpi.value || "",
      })) || []
    );
    setIsEditModalOpen(true);
  };

  const handleAddKpi = () => {
    setFormErrors((prev) => ({
      ...prev,
      kpi: "",
    }));
    const hasEmptyFields = kpiCriteria.some(
      (item) => !item.criteria.trim() || String(item.value).trim() === ""
    );

    if (hasEmptyFields) {
      // Optionally, update formErrors to show messages
      setFormErrors((prev) => {
        const updatedErrors = {
          ...prev,
          kpiCriteria: [...(prev.kpiCriteria || [])],
        };

        kpiCriteria.forEach((item, index) => {
          updatedErrors.kpiCriteria[index] = {
            criteria: !item.criteria.trim() ? "Criteria is required" : "",
            value: String(item.value).trim() === "" ? "Value is required" : "",
          };
        });

        return updatedErrors;
      });

      return; // Block adding a new row
    }

    // All fields are filled; allow adding a new row
    setKpiCriteria([...kpiCriteria, { criteria: "", value: "" }]);
    setKpiTouched(true);
  };

  const handleRemoveKpi = (index) => {
    const updated = [...kpiCriteria];
    updated.splice(index, 1);
    setKpiCriteria(updated);
  };

  const handleKpiChange = (index, field, value) => {
    const updated = [...kpiCriteria];

    // Convert "value" field to number if not empty
    if (field === "value") {
      updated[index][field] = value === "" ? "" : Number(value);
    } else {
      updated[index][field] = value;
    }

    setKpiCriteria(updated);

    // Clear specific KPI field error if it exists
    setFormErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors.kpiCriteria?.[index]?.[field]) {
        // Clone kpiCriteria errors array
        const kpiErrors = [...(updatedErrors.kpiCriteria || [])];
        const rowErrors = { ...kpiErrors[index] };

        delete rowErrors[field];

        // If rowErrors still has other errors, keep it
        if (Object.keys(rowErrors).length > 0) {
          kpiErrors[index] = rowErrors;
        } else {
          kpiErrors[index] = undefined;
        }

        // If no errors remain in any row, remove kpiCriteria entirely
        const hasAnyError = kpiErrors.some((row) => row !== undefined);
        if (hasAnyError) {
          updatedErrors.kpiCriteria = kpiErrors;
        } else {
          delete updatedErrors.kpiCriteria;
        }
      }

      return updatedErrors;
    });
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id); // store the item to delete
    setIsDialogOpen(true); // open the confirmation modal
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDepartment(itemToDelete).unwrap();
      toast.success("Success", "Department deleted successfully!");

      await refetch();

      // cleanup
      setIsDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to delete department."
      );
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setItemToDelete(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEditModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsEditModalOpen(false);
      setName("");
      setDescription("");
      setDepartmentHead([]);
      setSelectedManagers([]);
      setKpiCriteria([]);
      setKpiTouched(false);
      setFormErrors({});
    }
  };

  const tableData = useMemo(() => {
    return (
      data?.data?.map((department) => ({
        "Department Name": department.name,
        Description:
          department.description?.length > 30
            ? department.description?.slice(0, 30) + "..."
            : department.description,
        "Department Head": (
          <div className="max-w-[250px] whitespace-normal break-words">
            {Array.isArray(department?.departmentHeads) &&
            department.departmentHeads.length > 0
              ? department.departmentHeads
                  .map((head) =>
                    `${head?.firstName || ""} ${head?.lastName || ""}`.trim()
                  )
                  .join(", ")
              : "N/A"}
          </div>
        ),
        "Employee Count":
          department.employees?.filter((emp) => emp.role !== "Admin").length ||
          "0",
        Actions: (
          <div className="flex gap-2">
            <Tooltip text="Edit Department" position="left">
              <button
                className="p-2 text-primary hover:bg-blue-50 rounded-full transition-colors border border-primary"
                onClick={() => handleEdit(department)}
                title="Edit Department"
              >
                <FileEdit size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Delete Department" position="left">
              <button
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-red-500"
                onClick={() => handleDeleteClick(department.id)}
                title="Delete Department"
              >
                <Trash2 size={18} />
              </button>
            </Tooltip>
          </div>
        ),
      })) || []
    );
  }, [data]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isModalOpen || isEditModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, isEditModalOpen]);

  // Allow scrolling the modal even when wheel happens on overlay
  const handleOverlayScroll = (e) => {
    if (!modalRef.current) return;
    e.preventDefault();
    modalRef.current.scrollTop += e.deltaY;
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading departments: {error.message}
      </div>
    );
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              Departments
            </h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="You can view department names, descriptions, department heads, and employee counts. Use the action buttons to edit or delete departments, or click “Add Department” to create a new one and keep your structure up to date."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage Your Department&apos;s and Their Details.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="bg-primary hover:bg-primary/90"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add Department</span>
          </div>
        </Button>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8"
          onWheel={handleOverlayScroll}
        >
          <div
            className="bg-white p-8 rounded-lg w-full max-w-md relative max-h-[85vh] overflow-y-auto"
            ref={modalRef}
          >
            <button
              className="absolute top-4 right-4 text-red-500 "
              onClick={() => {
                setIsModalOpen(false);
                setName("");
                setDescription("");
                setDepartmentHead([]);
                setSelectedManagers([]);
                setKpiCriteria([]);
                setKpiTouched(false);
                setFormErrors({});
              }}
            >
              <X size={18} strokeWidth={4} />
            </button>
            <h2 className="text-2xl font-semibold mb-6">Add New Department</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FloatingInput
                label="Department Name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value),
                    setFormErrors((prev) => ({
                      ...prev,
                      name: "",
                    }));
                }}
                required
                ref={createNameInputRef}
                error={formErrors.name}
              />

              <FloatingTextarea
                id="create-dept-description"
                label="Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setFormErrors((prev) => ({ ...prev, description: "" }));
                }}
                rows={4}
                error={formErrors.description}
              />

              <SelectInput
                className={"z-30"}
                label="Department Heads"
                isMulti={true}
                value={departmentHead}
                onChange={(e) => {
                  setDepartmentHead(e);
                  setFormErrors((prev) => ({
                    ...prev,
                    departmentHead: "",
                  }));
                }}
                options={
                  employeesData?.data
                    ?.filter(
                      (employee) =>
                        employee?.role === "DepartmentHead" ||
                        employee?.role === "Employee"
                    )
                    ?.sort((a, b) => {
                      const nameA = `${a?.firstName ?? ""} ${
                        a?.lastName ?? ""
                      }`.toLowerCase();
                      const nameB = `${b?.firstName ?? ""} ${
                        b?.lastName ?? ""
                      }`.toLowerCase();
                      return nameA.localeCompare(nameB);
                    })
                    ?.map((employee) => ({
                      label: `${employee?.firstName} ${employee?.lastName}`,
                      value: employee._id,
                      email: employee?.email,
                      department: employee?.department?.name,
                      role: employee?.designation || "Not Specified",
                    })) || []
                }
                error={formErrors.departmentHead}
              />
              <SelectInput
                label="Select Managers"
                isMulti={true}
                value={selectedManagers}
                onChange={(e) => {
                  setSelectedManagers(e);
                  setFormErrors((prev) => ({
                    ...prev,
                    selectedManagers: "",
                  }));
                }}
                options={
                  employeesData?.data
                    ?.filter(
                      (employee) =>
                        employee?.role === "Manager" ||
                        employee?.role === "Employee"
                    )
                    ?.sort((a, b) => {
                      const nameA = `${a?.firstName ?? ""} ${
                        a?.lastName ?? ""
                      }`.toLowerCase();
                      const nameB = `${b?.firstName ?? ""} ${
                        b?.lastName ?? ""
                      }`.toLowerCase();
                      return nameA.localeCompare(nameB);
                    })
                    ?.map((employee) => ({
                      label: `${employee?.firstName} ${employee?.lastName}`,
                      value: employee._id,
                      email: employee?.email,
                      department: employee?.department?.name,
                      role: employee?.designation || "Not Specified",
                    })) || []
                }
                error={formErrors.selectedManagers}
              />

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">KPI Criteria</h3>
                {formErrors.kpi && (
                  <div className="text-red-500 text-sm -mt-2">
                    At least one KPI criteria is required
                  </div>
                )}
                {kpiCriteria.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 mb-2">
                    <div className="col-span-3">
                      <FloatingInput
                        label="Criteria Name"
                        type="text"
                        value={item.criteria}
                        onChange={(e) =>
                          handleKpiChange(index, "criteria", e.target.value)
                        }
                        className="w-full"
                        error={formErrors.kpiCriteria?.[index]?.criteria}
                      />
                    </div>

                    <div className="col-span-2">
                      <FloatingInput
                        label="Value (%)"
                        type="number"
                        value={item.value}
                        onChange={(e) =>
                          handleKpiChange(index, "value", e.target.value)
                        }
                        className=""
                        error={formErrors.kpiCriteria?.[index]?.value}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveKpi(index)}
                      className="text-red-500 font-bold text-xl col-span-1 "
                    >
                      &times;
                    </button>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={handleAddKpi}
                  className="mt-2 text-sm focus:outline-none"
                  variant="outline"
                  size="sm"
                >
                  + Add KPI Criteria
                </Button>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setName("");
                    setDescription("");
                    setDepartmentHead([]);
                    setSelectedManagers([]);
                    setKpiCriteria([]);
                    setKpiTouched(false);
                    setFormErrors({});
                  }}
                  className="bg-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isCreating}
                  onClick={handleSubmit}
                  className=""
                  size="sm"
                >
                  {isCreating ? "Creating..." : "Create Department"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8"
          onClick={handleEditModalBackdropClick}
          onWheel={handleOverlayScroll}
        >
          <div
            className="bg-white p-8 rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto"
            ref={modalRef}
          >
            <button
              className="absolute top-4 right-4 text-red-500 "
              onClick={() => {
                setIsEditModalOpen(false);
                setName("");
                setDescription("");
                setDepartmentHead([]);
                setSelectedManagers([]);
                setKpiCriteria([]);
                setKpiTouched(false);
                setFormErrors({});
              }}
            >
              <X size={18} strokeWidth={4} />
            </button>
            <h2 className="text-2xl font-semibold mb-6">Edit Department</h2>
            <form onSubmit={handleUpdate}>
              <FloatingInput
                label="Department Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                ref={nameInputRef}
              />

              <FloatingTextarea
                id="edit-dept-description"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />

              <SelectInput
                className={"z-30"}
                label="Department Head"
                isMulti={true}
                value={departmentHead}
                onChange={(e) => {
                  setDepartmentHead(e);
                  setFormErrors((prev) => ({
                    ...prev,
                    departmentHead: "",
                  }));
                }}
                options={
                  employeesData?.data
                    ?.filter(
                      (employee) =>
                        employee?.role === "DepartmentHead" ||
                        employee?.role === "Employee"
                    )
                    ?.sort((a, b) => {
                      const nameA = `${a?.firstName ?? ""} ${
                        a?.lastName ?? ""
                      }`.toLowerCase();
                      const nameB = `${b?.firstName ?? ""} ${
                        b?.lastName ?? ""
                      }`.toLowerCase();
                      return nameA.localeCompare(nameB);
                    })
                    ?.map((employee) => ({
                      label: `${employee?.firstName} ${employee?.lastName}`,
                      value: employee._id,
                      email: employee?.email,
                      department: employee?.department?.name,
                      role: employee?.designation || "Not Specified",
                    })) || []
                }
                error={formErrors.departmentHead}
              />
              <SelectInput
                label="Select Managers"
                isMulti={true}
                value={selectedManagers}
                onChange={(e) => {
                  setSelectedManagers(e);
                  setFormErrors((prev) => ({
                    ...prev,
                    selectedManagers: "",
                  }));
                }}
                options={
                  employeesData?.data
                    ?.filter(
                      (employee) =>
                        employee?.role === "Manager" ||
                        employee?.role === "Employee"
                    )
                    ?.sort((a, b) => {
                      const nameA = `${a?.firstName ?? ""} ${
                        a?.lastName ?? ""
                      }`.toLowerCase();
                      const nameB = `${b?.firstName ?? ""} ${
                        b?.lastName ?? ""
                      }`.toLowerCase();
                      return nameA.localeCompare(nameB);
                    })
                    ?.map((employee) => ({
                      label: `${employee?.firstName} ${employee?.lastName}`,
                      value: employee._id,
                      email: employee?.email,
                      department: employee?.department?.name,
                      role: employee?.designation || "Not Specified",
                    })) || []
                }
                error={formErrors.selectedManagers}
              />

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">KPI Criteria</h3>
                {kpiCriteria.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 mb-2">
                    <div className="col-span-3">
                      <FloatingInput
                        // disabled={true}
                        label="Criteria Name"
                        type="text"
                        value={item.criteria}
                        onChange={(e) =>
                          handleKpiChange(index, "criteria", e.target.value)
                        }
                        className="w-full"
                        error={formErrors.kpiCriteria?.[index]?.criteria}
                      />
                    </div>

                    <div className="col-span-2">
                      <FloatingInput
                        // disabled={true}
                        label="Value (%)"
                        type="number"
                        value={item.value}
                        onChange={(e) =>
                          handleKpiChange(index, "value", e.target.value)
                        }
                        className=""
                        error={formErrors.kpiCriteria?.[index]?.value}
                      />
                    </div>

                    {/* <button
                      type="button"
                      onClick={() => handleRemoveKpi(index)}
                      className="text-red-500 font-bold text-xl col-span-1 "
                    >
                      &times;
                    </button> */}
                  </div>
                ))}

                {/* <Button
                  type="button"
                  onClick={handleAddKpi}
                  className="mt-2 text-sm focus:outline-none"
                  variant="outline"
                  size="sm"
                >
                  + Add KPI Criteria
                </Button> */}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setName("");
                    setDescription("");
                    setEditingDepartment(null);
                  }}
                  className="bg-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  onClick={handleUpdate}
                  className=""
                >
                  {isUpdating ? "Updating..." : "Update Department"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading || isFetching ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      ) : (
        <>
          <div className="">
            <Table
              isLoading={isLoading || isFetching}
              data={tableData}
              columns={[
                "Department Name",
                "Description",
                "Department Head",
                "Employee Count",
                "Actions",
              ]}
            />
          </div>
          {tableData && (
            <div className=" mt-6 px-4 sm:px-0 ">
              <Pagination
                currentCount={tableData.length}
                totalCount={data?.pagination.totalDocs}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                limit={limit}
                setLimit={setLimit}
              />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this department? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onBackdropClick={handleBackdropClick}
      />
    </div>
  );
};

export default DepartmentPage;
