/* eslint-disable react/prop-types */
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import SelectInput from "@/component/select/SelectInput";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { CalendarCheck, ListTodo, Tag } from "lucide-react";
import { useMemo } from "react";

const CreateProjectStep = ({
  formData,
  setFormData,
  handleChange,
  errors,
  setErrors,
  isAllDepartments,
  setIsAllDepartments,
  departments = [],
}) => {
  // console.log(formData);

  const departmentManagers =
    formData?.departments?.flatMap((dept) => {
      const department = departments?.data?.find((d) => d._id === dept.value);
      return (
        department?.projectManagers?.map((manager) => ({
          label: `${manager?.firstName} ${manager?.lastName}`,
          value: manager?._id,
        })) || []
      );
    }) || [];

  // Combine with currently selected managers to ensure they remain available
  const allManagers = [...departmentManagers].reduce((acc, curr) => {
    if (!acc.find((m) => m.value === curr.value)) {
      acc.push(curr);
    }
    return acc;
  }, []);

  // const totalDepartments = departments?.data?.length || 0;

  // Departments options
const departmentOptions = useMemo(() => {
  const deptOptions = departments?.data?.map((department) => ({
    label: department?.name,
    value: department._id,
    managers: department?.projectManagers?.map((manager) => ({
      label: `${manager?.firstName} ${manager?.lastName}`,
      value: manager?._id,
    })),
    kpiCriteria: department?.kpiCriteria
  })) || [];

  return departments?.data?.length > 0
    ? [{ label: "All", value: "", isAll: true }, ...deptOptions]
    : deptOptions;
}, [departments]);

const selectValue = isAllDepartments
  ? [{ label: "All", value: "", isAll: true }]
  : formData.departments;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <FloatingInput
          name="name"
          id="name"
          label="Project Name"
          icon={<Tag size={16} />}
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
        <div className="mt-6">
          <FloatingTextarea
            name="description"
            id="description"
            label="Project Description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            icon={<ListTodo size={16} />}
            error={errors.description}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <FloatingInput
            name="startDate"
            type="date"
            label="Start Date"
            icon={<CalendarCheck size={16} />}
            value={formData.startDate ? formData.startDate.slice(0, 10) : ""}
            onChange={handleChange}
            error={errors.startDate}
          />
          <FloatingInput
            name="dueDate"
            type="date"
            label="Due Date"
            icon={<CalendarCheck size={16} />}
            value={formData.dueDate ? formData.dueDate.slice(0, 10) : ""}
            onChange={handleChange}
            error={errors.dueDate}
          />
        </div>

        <SelectInput
          className={"z-30"}
          label="Select Departments"
          isMulti={true}
          value={selectValue} // Use computed selectValue
          onChange={(selected) => {
  const lastSelected = selected[selected.length - 1];
  const selectedAll = lastSelected?.isAll;
  const selectedRegular = lastSelected && !lastSelected.isAll;

  // Case 1: "All" selected
  if (selectedAll) {
    // Get all departments except "All" option
    const allDepartments = departmentOptions
      .filter(opt => !opt.isAll)
      .map(opt => ({ 
        value: opt.value, 
        label: opt.label,
        ...(opt.managers && { managers: opt.managers }),
        ...(opt.kpiCriteria && { kpiCriteria: opt.kpiCriteria })
      }));

    setFormData(prev => ({
      ...prev,
      departments: allDepartments,
      managers: [], // Clear managers since all departments selected
    }));
    setIsAllDepartments(true);
    return;
  }

  // Case 2: Regular department selected while "All" is active
  if (isAllDepartments && selectedRegular) {
    // Switch to regular selection mode with only this department
    const selectedDepartment = departmentOptions.find(
      opt => opt.value === lastSelected.value
    );
    
    setFormData(prev => ({
      ...prev,
      departments: [{
        value: selectedDepartment.value,
        label: selectedDepartment.label,
        ...(selectedDepartment.managers && { managers: selectedDepartment.managers }),
        ...(selectedDepartment.kpiCriteria && { kpiCriteria: selectedDepartment.kpiCriteria })
      }],
      managers: [], // Reset managers
    }));
    setIsAllDepartments(false);
    return;
  }

  // Case 3: Regular selection change
  const newDepartments = selected
    .filter(opt => !opt.isAll)
    .map(opt => ({
      value: opt.value,
      label: opt.label,
      ...(opt.managers && { managers: opt.managers }),
      ...(opt.kpiCriteria && { kpiCriteria: opt.kpiCriteria })
    }));

  const selectedDeptIds = newDepartments.map(d => d.value);

  // Calculate valid managers
  const validManagers = departments?.data
    ?.filter(d => selectedDeptIds.includes(d._id))
    ?.flatMap(dept => 
      dept.projectManagers?.map(manager => ({
        label: `${manager?.firstName} ${manager?.lastName}`,
        value: manager?._id,
      }))) || [];

  // Filter current managers
  const filteredManagers = formData.managers.filter(m =>
    validManagers.some(vm => vm.value === m.value)
  );

  setFormData(prev => ({
    ...prev,
    departments: newDepartments,
    managers: filteredManagers,
  }));
  setIsAllDepartments(false);
}}
          options={departmentOptions}
          error={errors.departments}
        />
        <SelectInput
          label="Select Managers"
          isMulti={true}
          value={formData?.managers}
          onChange={(e) => {
            setFormData({
              ...formData,
              managers: e,
            });
            setErrors({
              ...errors,
              managers: "",
            });
          }}
          options={allManagers || []}
          error={errors.managers}
        />
      </div>
    </div>
  );
};

export default CreateProjectStep;
