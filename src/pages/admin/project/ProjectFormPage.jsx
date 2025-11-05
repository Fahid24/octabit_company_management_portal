import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from "@/redux/features/admin/project/projectApiSlice";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import {
  Plus,
  X,
  Building,
  Tag,
  UserCog,
  CalendarCheck,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/component/card";
import { FloatingInput } from "@/component/FloatiingInput";
import Button from "@/component/Button";
import { Badge } from "@/component/badge";
import { TitleDivider } from "@/component/TitleDevider";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import KPICriteriaManager from "./component/KPICriteriaManager";

export default function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: apiData } = useGetProjectsQuery({});
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();

  // Fetch employees and departments
  const { data: employeesApiData = [], isLoading: employeesLoading } =
    useGetEmployeesQuery();
  const { data: departmentsApiData = [], isLoading: departmentsLoading } =
    useGetDepartmentsQuery({ isPopulate: true });

  // Ensure employeesData and departmentsData are arrays
  const employeesData = Array.isArray(employeesApiData)
    ? employeesApiData
    : Array.isArray(employeesApiData?.data)
    ? employeesApiData.data
    : [];
  const departmentsData = Array.isArray(departmentsApiData)
    ? departmentsApiData
    : Array.isArray(departmentsApiData?.data)
    ? departmentsApiData.data
    : [];

  // Only "Manager" for managers
  const managers = employeesData.filter((emp) => emp.role === "Manager");

  // Only departments with departmentHead and not deleted
  const validDepartments = departmentsData.filter(
    (dept) => !!dept.departmentHead && !dept.isDeleted
  );

  // State for form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    managers: [],
    departments: [],
    startDate: "",
    dueDate: "",
    endDate: "",
    remarks: [],
  });
  const [newKpiCriteria, setNewKpiCriteria] = useState({});
  const [kpiError, setKpiError] = useState({});
  const [editingKpi, setEditingKpi] = useState({});

  useEffect(() => {
    if (id && apiData?.projects) {
      const project = apiData.projects.find((p) => p._id === id);
      if (project) setInitialData(project);
    }
  }, [id, apiData]);

  useEffect(() => {
    if (initialData && typeof initialData === "object") {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        managers: Array.isArray(initialData.managers)
          ? initialData.managers
          : [],
        departments: Array.isArray(initialData.departments)
          ? initialData.departments.map((dept) => ({
              department: dept.department,
              departmentHead: dept.departmentHead,
              kpiCriteria: Array.isArray(dept.kpiCriteria)
                ? dept.kpiCriteria
                : [],
            }))
          : [],
        startDate: initialData.startDate || "",
        dueDate: initialData.dueDate || "",
        endDate: initialData.endDate || "",
        remarks: Array.isArray(initialData.remarks) ? initialData.remarks : [],
      });
    }
  }, [initialData]);

  // Add/Remove managers
  const addManager = (managerId) => {
    if (
      managerId &&
      formData.managers &&
      Array.isArray(formData.managers) &&
      !formData.managers.includes(managerId)
    ) {
      setFormData({
        ...formData,
        managers: [...formData.managers, managerId],
      });
    }
  };
  const removeManager = (managerId) => {
    setFormData((prev) => ({
      ...prev,
      managers: (prev.managers || []).filter((id) => id !== managerId),
    }));
  };

  // Add/Remove departments
  const addDepartment = (departmentId) => {
    if (
      departmentId &&
      formData.departments &&
      Array.isArray(formData.departments) &&
      !formData.departments.some((dept) => dept.department === departmentId)
    ) {
      const deptObj = validDepartments.find((d) => d.id === departmentId);
      setFormData({
        ...formData,
        departments: [
          ...formData.departments,
          {
            department: departmentId,
            departmentHead: deptObj ? deptObj.departmentHead : "",
            kpiCriteria:
              deptObj && Array.isArray(deptObj.kpiCriteria)
                ? deptObj.kpiCriteria
                : [],
          },
        ],
      });
    }
  };
  const removeDepartment = (departmentId) => {
    setFormData((prev) => ({
      ...prev,
      departments: (prev.departments || []).filter(
        (d) => d.department !== departmentId
      ),
    }));
  };

  // KPI logic for departments
  const [deptKpiInput, setDeptKpiInput] = useState({});
  const [deptKpiError, setDeptKpiError] = useState({});
  const [deptEditingKpi, setDeptEditingKpi] = useState({});

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all department KPIs sum to 100
    for (const dept of formData.departments) {
      const total = (dept.kpiCriteria || []).reduce(
        (sum, k) => sum + (Number(k.value) || 0),
        0
      );
      if (total !== 100) {
        setDeptKpiError((prev) => ({
          ...prev,
          [dept.department]: "Total KPI weight must be 100%.",
        }));
        return;
      }
    }
    setDeptKpiError({});
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        managers: Array.isArray(formData.managers) ? formData.managers : [],
        departments: Array.isArray(formData.departments)
          ? formData.departments.map((dept) => ({
              department: dept.department,
              departmentHead: dept.departmentHead,
              kpiCriteria: Array.isArray(dept.kpiCriteria)
                ? dept.kpiCriteria
                : [],
            }))
          : [],
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null,
        endDate: formData.endDate || null,
        remarks: Array.isArray(formData.remarks) ? formData.remarks : [],
      };
      if (id) {
        await updateProject({ id, ...payload }).unwrap();
      } else {
        await createProject(payload).unwrap();
      }
      navigate("/project-list");
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 ">
      {/* Project Basics */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-primary">
          <CardTitle className="text-white text-center mb-1">
            {id ? "Edit Project" : "Create New Project"}
          </CardTitle>
          <CardDescription className="text-white text-center">
            <TitleDivider
              color="white"
              className={"-mt-0"}
              size="sm"
              fontWeight="normal"
              title="Define your project structure, assign teams, and set performance criteria"
            />
          </CardDescription>
        </CardHeader>
        <CardHeader className="flex flex-row items-center gap-3 mb-2 bg-primary/10 ">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Tag className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Basic details about your project</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <FloatingInput
              id="name"
              label="Project Name"
              icon={<Tag size={16} />}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <FloatingTextarea
              id="description"
              label="Project Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>
        </CardContent>
        {/* Team Management */}
        <CardHeader className="flex flex-row items-center gap-3 mb-2 bg-primary/10">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <UserCog className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle>Team Assignment</CardTitle>
            <CardDescription>
              Assign managers and departments to this project
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <FloatingInput
            id="managers"
            label="Add Project Manager"
            icon={<Users size={16} />}
            type="select"
            value={""}
            onChange={(e) => addManager(e.target.value)}
            disabled={employeesLoading}
            options={managers
              .filter((manager) => !formData.managers.includes(manager._id))
              .map((manager) => ({
                value: manager._id,
                label: `${manager.firstName} ${manager.lastName}`,
              }))}
          />
          {formData.managers.length > 0 && (
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 mt-6">
              <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                Assigned Managers
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.managers.map((managerId) => {
                  const manager = managers.find((m) => m._id === managerId);
                  if (!manager) return null;
                  return (
                    <Badge
                      key={managerId}
                      variant="green"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {manager.firstName} {manager.lastName}
                      <X
                        className="h-4 w-4 cursor-pointer hover:bg-black/10 rounded-full p-0.5 transition-colors"
                        onClick={() => removeManager(managerId)}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
        {/* Departments & KPI */}
        <CardHeader className="flex flex-row items-center gap-3 mb-2 bg-primary/10">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle>Departments & KPI Criteria</CardTitle>
            <CardDescription>
              Add departments and define their performance metrics
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <FloatingInput
            id="departments"
            label="Add Department"
            icon={<Building size={16} />}
            type="select"
            value={""}
            onChange={(e) => addDepartment(e.target.value)}
            disabled={departmentsLoading}
            options={validDepartments
              .filter(
                (dept) =>
                  !formData.departments.some((d) => d.department === dept.id)
              )
              .map((dept) => ({
                value: dept.id,
                label: dept.name,
              }))}
          />
          {formData.departments.map((dept, index) => {
            const deptInfo = validDepartments.find(
              (d) => d.id === dept.department
            );
            const headInfo = managers.find(
              (m) => m._id === dept.departmentHead
            );
            // console.log("deptInfo", headInfo);
            return (
              <Card key={dept.department} className="mt-4 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-primary/10 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {deptInfo?.name}
                      </CardTitle>
                      <CardDescription>
                        Head:{" "}
                        {headInfo
                          ? `${deptInfo.departmentHead[0].firstName} ${deptInfo.departmentHead[0].lastName}`
                          : "N/A"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="text-white bg-red-500 hover:bg-red-600"
                    onClick={() => removeDepartment(dept.department)}
                  >
                    Remove
                  </Button>
                </CardHeader>
                <div>
                  <KPICriteriaManager
                    department={dept.department}
                    criteria={dept.kpiCriteria}
                    onChange={(newCriteria) =>
                      setFormData((prev) => ({
                        ...prev,
                        departments: prev.departments.map((d, i) =>
                          i === index ? { ...d, kpiCriteria: newCriteria } : d
                        ),
                      }))
                    }
                    onError={(error) =>
                      setKpiError((prev) => ({
                        ...prev,
                        [dept.department]: error,
                      }))
                    }
                  />
                  {kpiError[dept.department] && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                      <AlertCircle size={16} />
                      {kpiError[dept.department]}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </CardContent>
        {/* Timeline */}
        <CardHeader className="flex flex-row items-center gap-3 mb-2 bg-primary/10">
          <div className="p-3 bg-orange-100 rounded-xl">
            <CalendarCheck className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>
              Set important dates for your project
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FloatingInput
              type="date"
              label="Start Date"
              icon={<CalendarCheck size={16} />}
              value={formData.startDate ? formData.startDate.slice(0, 10) : ""}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
            <FloatingInput
              type="date"
              label="Due Date"
              icon={<CalendarCheck size={16} />}
              value={formData.dueDate ? formData.dueDate.slice(0, 10) : ""}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
            <FloatingInput
              type="date"
              label="End Date"
              icon={<CalendarCheck size={16} />}
              value={formData.endDate ? formData.endDate.slice(0, 10) : ""}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </CardContent>
        {/* Action Buttons */}
        <CardFooter className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate("/project-list")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={async (e) => {
              e.preventDefault();
              // Validate KPI totals
              for (let i = 0; i < formData.departments.length; i++) {
                const dept = formData.departments[i];
                const total = dept.kpiCriteria.reduce(
                  (sum, k) => sum + (Number(k.value) || 0),
                  0
                );
                if (total !== 100) {
                  setKpiError((prev) => ({
                    ...prev,
                    [dept.department]: `KPI weights must total 100% (currently ${total}%)`,
                  }));
                  return;
                }
              }
              setKpiError({});
              setLoading(true);
              try {
                const payload = {
                  name: formData.name,
                  description: formData.description,
                  managers: Array.isArray(formData.managers)
                    ? formData.managers
                    : [],
                  departments: Array.isArray(formData.departments)
                    ? formData.departments.map((dept) => ({
                        department: dept.department,
                        departmentHead: dept.departmentHead,
                        kpiCriteria: Array.isArray(dept.kpiCriteria)
                          ? dept.kpiCriteria
                          : [],
                      }))
                    : [],
                  startDate: formData.startDate || null,
                  dueDate: formData.dueDate || null,
                  endDate: formData.endDate || null,
                  remarks: Array.isArray(formData.remarks)
                    ? formData.remarks
                    : [],
                };
                if (id) {
                  await updateProject({ id, ...payload }).unwrap();
                } else {
                  await createProject(payload).unwrap();
                }
                navigate("/project-list");
              } catch (error) {
                // handle error
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? "Saving..." : id ? "Update Project" : "Create Project"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
