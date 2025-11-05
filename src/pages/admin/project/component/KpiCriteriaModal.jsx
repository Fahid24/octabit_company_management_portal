import { useState, useEffect } from "react";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";
import { FloatingInput } from "@/component/FloatiingInput";
import Button from "@/component/Button";

export default function KpiCriteriaModal({
  isOpen,
  onClose,
  departments,
  projectId,
  onSubmitData,
  handleNext,
}) {
  const [showEditMode, setShowEditMode] = useState(false);
  const [editableDepartments, setEditableDepartments] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && departments) {
      // Initialize editable departments with the original data
      const initialData = departments?.map((dept) => ({
        department: dept.value,
        departmentName: dept.label,
        kpiCriteria: dept.kpiCriteria.map((kpi) => ({
          criteria: kpi.kpi.criteria,
          value: kpi.value.toString(), // Convert to string to handle properly
        })),
      }));
      setEditableDepartments(initialData);
    }
  }, [isOpen, departments]);

  const validateDepartmentKpis = (deptIndex) => {
    const dept = editableDepartments[deptIndex];

    // Check for zero values first
    const hasZeroValues = dept.kpiCriteria.some((kpi) => {
      const numValue = Number(kpi.value);
      return numValue === 0 && kpi.value !== ""; // Only flag as zero if it's actually 0, not empty
    });

    if (hasZeroValues) {
      setErrors((prev) => ({
        ...prev,
        [`dept-${deptIndex}`]:
          "KPI values cannot be 0. Please enter a value greater than 0.",
      }));
      return false;
    }

    const total = dept.kpiCriteria.reduce((sum, kpi) => {
      const value = kpi.value === "" ? 0 : Number(kpi.value) || 0;
      return sum + value;
    }, 0);

    if (total !== 100) {
      setErrors((prev) => ({
        ...prev,
        [`dept-${deptIndex}`]: `KPI values must sum to exactly 100. Current total: ${total}`,
      }));
      return false;
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`dept-${deptIndex}`];
        return newErrors;
      });
      return true;
    }
  };

  const validateAllDepartments = () => {
    let isValid = true;
    editableDepartments.forEach((_, index) => {
      if (!validateDepartmentKpis(index)) {
        isValid = false;
      }
    });
    return isValid;
  };

  const handleKpiChange = (deptIndex, kpiIndex, field, value) => {
    const updatedDepartments = [...editableDepartments];

    if (field === "value") {
      // Keep the value as string to allow proper editing
      updatedDepartments[deptIndex].kpiCriteria[kpiIndex][field] = value;
    } else {
      updatedDepartments[deptIndex].kpiCriteria[kpiIndex][field] = value;
    }

    setEditableDepartments(updatedDepartments);

    // Validate after change
    setTimeout(() => validateDepartmentKpis(deptIndex), 100);
  };

  const addKpiCriteria = (deptIndex) => {
    const dept = editableDepartments[deptIndex];
    const hasEmptyFields = dept.kpiCriteria.some(
      (kpi) => !kpi.criteria.trim() || kpi.value === "" || !kpi.value
    );
    const hasZeroValues = dept.kpiCriteria.some((kpi) => {
      const numValue = Number(kpi.value);
      return numValue === 0 && kpi.value !== "";
    });

    if (hasEmptyFields) {
      setErrors((prev) => ({
        ...prev,
        [`dept-${deptIndex}-add`]:
          "Please fill all existing KPI fields before adding new ones",
      }));
      return;
    }

    if (hasZeroValues) {
      setErrors((prev) => ({
        ...prev,
        [`dept-${deptIndex}-add`]:
          "KPI values cannot be 0. Please enter values greater than 0 for all existing KPIs.",
      }));
      return;
    }

    const updatedDepartments = [...editableDepartments];
    updatedDepartments[deptIndex].kpiCriteria.push({
      criteria: "",
      value: "",
    });
    setEditableDepartments(updatedDepartments);

    // Clear add error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`dept-${deptIndex}-add`];
      return newErrors;
    });
  };

  const removeKpiCriteria = (deptIndex, kpiIndex) => {
    const updatedDepartments = [...editableDepartments];
    updatedDepartments[deptIndex].kpiCriteria.splice(kpiIndex, 1);
    setEditableDepartments(updatedDepartments);

    // Validate after removal
    setTimeout(() => validateDepartmentKpis(deptIndex), 100);
  };

  const handleSubmitData = () => {
    if (!validateAllDepartments()) {
      return;
    }

    const formattedData = {
      projectId,
      departmentKpi: editableDepartments.map((dept) => ({
        department: dept.department,
        kpiCriteria: dept.kpiCriteria
          .filter((kpi) => kpi.criteria.trim() && Number(kpi.value) > 0)
          .map((kpi) => ({
            ...kpi,
            value: Number(kpi.value), // ensure value is a number
          })),
      })),
    };

    // console.log("KPI Data:", formattedData);
    onSubmitData(formattedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-form-header-gradient text-gray-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Department KPI Criteria</h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-gray-200 text-2xl font-bold"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {!showEditMode ? (
            // Display Mode
            <div className="p-6">
              <div className="space-y-6">
                {departments?.map((department) => (
                  <div
                    key={department.value}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {department.label}
                    </h3>
                    <div className="space-y-3">
                      {department.kpiCriteria.map((kpi, kpiIndex) => (
                        <div
                          key={kpiIndex}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded"
                        >
                          <span className="font-medium text-gray-700">
                            {kpi.kpi.criteria}
                          </span>
                          <span className="text-primary font-semibold">
                            {kpi.value}%
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total:</span>
                          <span
                            className={`font-semibold ${
                              department.kpiCriteria.reduce((sum, kpi) => {
                                const value =
                                  kpi.value === "" ? 0 : Number(kpi.value) || 0;
                                return sum + value;
                              }, 0) === 100
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {department.kpiCriteria.reduce((sum, kpi) => {
                              const value =
                                kpi.value === "" ? 0 : Number(kpi.value) || 0;
                              return sum + value;
                            }, 0)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-2">
                  Would you like to make changes to the KPI criteria?
                </p>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowEditMode(true)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-[#7A5A3A] transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => {
                      handleNext();
                      onClose();
                    }}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="p-6">
              <div className="space-y-8">
                {editableDepartments.map((department, deptIndex) => (
                  <div
                    key={department.department}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {department.departmentName}
                    </h3>

                    <div className="space-y-4">
                      {department.kpiCriteria.map((kpi, kpiIndex) => (
                        <div
                          key={kpiIndex}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
                        >
                          <div className="md:col-span-2">
                            <FloatingInput
                              label="KPI Criteria"
                              value={kpi.criteria}
                              onChange={(e) =>
                                handleKpiChange(
                                  deptIndex,
                                  kpiIndex,
                                  "criteria",
                                  e.target.value
                                )
                              }
                              className="w-full"
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <FloatingInput
                              label="Value (%)"
                              type="number"
                              value={kpi.value}
                              onChange={(e) =>
                                handleKpiChange(
                                  deptIndex,
                                  kpiIndex,
                                  "value",
                                  e.target.value
                                )
                              }
                              min="1"
                              max="100"
                              className="flex-1"
                            />
                            <button
                              onClick={() =>
                                removeKpiCriteria(deptIndex, kpiIndex)
                              }
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              disabled={department.kpiCriteria.length === 1}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {errors[`dept-${deptIndex}-add`] && (
                      <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors[`dept-${deptIndex}-add`]}
                      </div>
                    )}

                    <button
                      onClick={() => addKpiCriteria(deptIndex)}
                      className="mt-4 flex items-center gap-2 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg border border-primary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add More KPI
                    </button>

                    {/* Department Total and Validation */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total:</span>
                        <span
                          className={`font-semibold ${
                            department.kpiCriteria.reduce((sum, kpi) => {
                              const value =
                                kpi.value === "" ? 0 : Number(kpi.value) || 0;
                              return sum + value;
                            }, 0) === 100
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {department.kpiCriteria.reduce((sum, kpi) => {
                            const value =
                              kpi.value === "" ? 0 : Number(kpi.value) || 0;
                            return sum + value;
                          }, 0)}
                          %
                        </span>
                      </div>
                      {errors[`dept-${deptIndex}`] && (
                        <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors[`dept-${deptIndex}`]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {showEditMode && (
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-4">
            <Button
              onClick={() => setShowEditMode(false)}
              variant="outline"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-md"
            >
              Back to View
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmitData();
              }}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-[#7A5A3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={Object.keys(errors).length > 0}
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
