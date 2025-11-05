import { useState, useEffect } from "react";
import {
  X,
  Save,
  AlertTriangle,
  Clock,
  Calendar,
  BarChart3,
  Settings,
  Database,
  SunMoon,
  Users,
  Plus,
  UserPlus,
  Trash2,
} from "lucide-react";
import { FloatingInput } from "@/component/FloatiingInput";
import SelectInput from "@/component/select/SelectInput";

import {
  useAdminConfigSetupMutation,
  useExistsWorkingDaysQuery,
  useGetAdminConfigStatusQuery,
  useGetAdminConfigQuery,
  useUpdateAdminConfigMutation,
} from "@/redux/features/admin/adminControl/adminControlApiSlice";
import { toast } from "@/component/Toast";

const SystemConfigPage = () => {
  const [formData, setFormData] = useState({
    leaveLimitPerPeriod: "20",
    casualLeaveLimit: {
      unit: "yearly",
      value: "",
    },
    annualLeaveLimit: {
      unit: "yearly",
      value: "",
    },
    medicalLeaveLimit: {
      unit: "yearly",
      value: "",
    },
    workingHours: {
      start: "09:00",
      grace: "09:15",
      end: "17:00",
    },
    nightShiftWorkingHours: {
      start: "21:00",
      grace: "21:15",
      end: "06:00",
    },
    weekends: ["Saturday"],
    kpiWeights: {
      projectTask: "",
      dailyTask: "",
      attendance: "",
      workHours: "",
      leaveTaken: "",
    },
    maxStorage: {
      value: "",
      unit: "MB",
    },
    mealRates: {
      breakfast: "",
      lunch: "",
      dinner: "",
      evening_snacks: "",
      midnight_snacks: "",
    },
    guest: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options for period selection
  const periodOptions = [
    { value: "yearly", label: "Yearly" },
    { value: "monthly", label: "Monthly" },
  ];

  // Options for weekend selection
  const weekdayOptions = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
  ];

  // api slice hooks
  const {
    data: configData,
    isLoading: isConfigLoading,
    refetch,
  } = useGetAdminConfigQuery();
  const [updateAdminConfig, { isLoading: isUpdating }] =
    useUpdateAdminConfigMutation();

  useEffect(() => {
    if (configData) {
      setFormData({
        leaveLimitPerPeriod: configData.leaveLimitPerPeriod?.toString() || "",
        casualLeaveLimit: {
          unit: configData.casualLeaveLimit?.unit || "yearly",
          value: configData.casualLeaveLimit?.value || "",
        },
        annualLeaveLimit: {
          unit: configData.annualLeaveLimit?.unit || "yearly",
          value: configData.annualLeaveLimit?.value || "",
        },
        medicalLeaveLimit: {
          unit: configData.medicalLeaveLimit?.unit || "yearly",
          value: configData.medicalLeaveLimit?.value || "",
        },
        workingHours: {
          start: configData.workingHours?.start || "09:00",
          grace: configData.workingHours?.grace || "09:15",
          end: configData.workingHours?.end || "17:00",
        },
        nightShiftWorkingHours: {
          start: configData.nightShiftWorkingHours?.start || "21:00",
          grace: configData.nightShiftWorkingHours?.grace || "21:15",
          end: configData.nightShiftWorkingHours?.end || "06:00",
        },
        weekends: configData.weekends || ["Saturday"],
        kpiWeights: {
          projectTask: configData.kpiWeights?.projectTask || "",
          dailyTask: configData.kpiWeights?.dailyTask || "",
          attendance: configData.kpiWeights?.attendance || "",
          workHours: configData.kpiWeights?.workHours || "",
          leaveTaken: configData.kpiWeights?.leaveTaken || "",
        },
        maxStorage: {
          value: configData.maxStorage?.value || "",
          unit: configData.maxStorage?.unit || "MB",
        },
        mealRates: {
          breakfast: configData.mealRates?.breakfast || "",
          lunch: configData.mealRates?.lunch || "",
          dinner: configData.mealRates?.dinner || "",
          evening_snacks: configData.mealRates?.evening_snacks || "",
          midnight_snacks: configData.mealRates?.midnight_snacks || "",
        },
        guest: configData.guest || [],
      });
      setErrors({}); // Reset errors when config data is loaded
    }
  }, [configData]);

  // Reset form when modal opens
  //   useEffect(() => {
  //     if (isOpen) {
  //       setFormData({
  //         leaveLimitPerPeriod: "",
  //         workingHours: {
  //           start: "09:00",
  //           end: "17:00",
  //         },
  //         kpiWeights: {
  //           projectTask: "",
  //           dailyTask: "",
  //           attendance: "",
  //           workHours: "",
  //           leaveTaken: "",
  //         },
  //       });
  //       setErrors({});
  //     }
  //   }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Validate leave limit
    if (!formData.leaveLimitPerPeriod) {
      newErrors.leaveLimitPerPeriod = "Leave limit is required";
    } else if (Number.parseInt(formData.leaveLimitPerPeriod) < 1) {
      newErrors.leaveLimitPerPeriod = "Leave limit must be at least 1";
    }

    // Validate new leave limits
    const leaveTypes = [
      "casualLeaveLimit",
      "annualLeaveLimit",
      "medicalLeaveLimit",
    ];
    leaveTypes.forEach((leaveType) => {
      if (!formData[leaveType].value) {
        newErrors[leaveType] = {
          ...newErrors[leaveType],
          value: `${leaveType
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} value is required`,
        };
      } else if (Number.parseInt(formData[leaveType].value) < 0) {
        newErrors[leaveType] = {
          ...newErrors[leaveType],
          value: `${leaveType
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} value must be 0 or greater`,
        };
      }
    });

    // Validate working hours
    if (!formData.workingHours.start) {
      newErrors.workingHours = {
        ...newErrors.workingHours,
        start: "Start time is required",
      };
    }
    if (!formData.workingHours.grace) {
      newErrors.workingHours = {
        ...newErrors.workingHours,
        grace: "Grace time is required",
      };
    }
    if (!formData.workingHours.end) {
      newErrors.workingHours = {
        ...newErrors.workingHours,
        end: "End time is required",
      };
    }

    // Validate that grace time is after start time
    if (formData.workingHours.start && formData.workingHours.grace) {
      const startTime = new Date(
        `2000-01-01T${formData.workingHours.start}:00`
      );
      const graceTime = new Date(
        `2000-01-01T${formData.workingHours.grace}:00`
      );
      if (graceTime < startTime) {
        newErrors.workingHours = {
          ...newErrors.workingHours,
          grace: "Grace time must be after start time",
        };
      }
    }

    // Validate that end time is after grace time
    if (formData.workingHours.grace && formData.workingHours.end) {
      const graceTime = new Date(
        `2000-01-01T${formData.workingHours.grace}:00`
      );
      const endTime = new Date(`2000-01-01T${formData.workingHours.end}:00`);
      if (endTime <= graceTime) {
        newErrors.workingHours = {
          ...newErrors.workingHours,
          end: "End time must be after grace time",
        };
      }
    }

    // Validate night shift working hours
    if (!formData.nightShiftWorkingHours.start) {
      newErrors.nightShiftWorkingHours = {
        ...newErrors.nightShiftWorkingHours,
        start: "Night shift start time is required",
      };
    }
    if (!formData.nightShiftWorkingHours.grace) {
      newErrors.nightShiftWorkingHours = {
        ...newErrors.nightShiftWorkingHours,
        grace: "Night shift grace time is required",
      };
    }
    if (!formData.nightShiftWorkingHours.end) {
      newErrors.nightShiftWorkingHours = {
        ...newErrors.nightShiftWorkingHours,
        end: "Night shift end time is required",
      };
    }

    // Validate that night shift grace time is after start time
    if (
      formData.nightShiftWorkingHours.start &&
      formData.nightShiftWorkingHours.grace
    ) {
      const startTime = new Date(
        `2000-01-01T${formData.nightShiftWorkingHours.start}:00`
      );
      const graceTime = new Date(
        `2000-01-01T${formData.nightShiftWorkingHours.grace}:00`
      );
      if (graceTime < startTime) {
        newErrors.nightShiftWorkingHours = {
          ...newErrors.nightShiftWorkingHours,
          grace: "Grace time must be after start time",
        };
      }
    }

    // Validate that night shift end time is after grace time (considering overnight shift)
    if (
      formData.nightShiftWorkingHours.grace &&
      formData.nightShiftWorkingHours.end
    ) {
      const graceTime = new Date(
        `2000-01-01T${formData.nightShiftWorkingHours.grace}:00`
      );
      let endTime = new Date(
        `2000-01-01T${formData.nightShiftWorkingHours.end}:00`
      );

      // For night shifts, end time might be next day (like 21:00 to 06:00)
      if (endTime < graceTime) {
        endTime = new Date(
          `2000-01-02T${formData.nightShiftWorkingHours.end}:00`
        );
      }

      if (endTime <= graceTime) {
        newErrors.nightShiftWorkingHours = {
          ...newErrors.nightShiftWorkingHours,
          end: "End time must be after grace time",
        };
      }
    }

    // Validate weekends
    if (!formData.weekends || formData.weekends.length === 0) {
      newErrors.weekends = "At least one weekend day must be selected";
    }

    // Validate KPI weights
    const kpiFields = [
      "projectTask",
      "dailyTask",
      "attendance",
      "workHours",
      "leaveTaken",
    ];
    let totalWeight = 0;

    kpiFields.forEach((field) => {
      if (!formData.kpiWeights[field]) {
        newErrors.kpiWeights = {
          ...newErrors.kpiWeights,
          [field]: `${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} weight is required`,
        };
      } else {
        const weight = Number.parseInt(formData.kpiWeights[field]);
        if (weight < 0 || weight > 100) {
          newErrors.kpiWeights = {
            ...newErrors.kpiWeights,
            [field]: "Weight must be between 0 and 100",
          };
        } else {
          totalWeight += weight;
        }
      }
    });

    // Validate maxStorage
    if (!formData.maxStorage.value) {
      newErrors.maxStorage = {
        ...newErrors.maxStorage,
        value: "Storage value is required",
      };
    } else if (parseInt(formData.maxStorage.value) <= 0) {
      newErrors.maxStorage = {
        ...newErrors.maxStorage,
        value: "Storage must be greater than 0",
      };
    }

    // Validate mealRates
    const mealTypes = [
      "breakfast",
      "lunch",
      "dinner",
      "evening_snacks",
      "midnight_snacks",
    ];
    mealTypes.forEach((mealType) => {
      if (!formData.mealRates[mealType]) {
        newErrors.mealRates = {
          ...newErrors.mealRates,
          [mealType]: `${mealType.replace("_", " ")} rate is required`,
        };
      } else if (parseFloat(formData.mealRates[mealType]) < 0) {
        newErrors.mealRates = {
          ...newErrors.mealRates,
          [mealType]: `${mealType.replace("_", " ")} rate must be 0 or greater`,
        };
      }
    });

    // Validate guest names (optional, but if provided should not be empty)
    if (formData.guest && formData.guest.length > 0) {
      formData.guest.forEach((guest, index) => {
        if (!guest.name || guest.name.trim() === "") {
          newErrors.guest = {
            ...newErrors.guest,
            [index]: "Guest name cannot be empty",
          };
        }
      });
    }

    // Check if total weights equal 100
    if (
      totalWeight !== 100 &&
      Object.keys(newErrors.kpiWeights || {}).length === 0
    ) {
      const errorMessage = "Total KPI weights must equal 100%";
      kpiFields.forEach((field) => {
        newErrors.kpiWeights = {
          ...newErrors.kpiWeights,
          [field]: errorMessage,
        };
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert form data to the expected format
      const submitData = {
        leaveLimitPerPeriod: Number.parseInt(formData.leaveLimitPerPeriod),
        casualLeaveLimit: {
          unit: formData.casualLeaveLimit.unit,
          value: Number.parseInt(formData.casualLeaveLimit.value),
        },
        annualLeaveLimit: {
          unit: formData.annualLeaveLimit.unit,
          value: Number.parseInt(formData.annualLeaveLimit.value),
        },
        medicalLeaveLimit: {
          unit: formData.medicalLeaveLimit.unit,
          value: Number.parseInt(formData.medicalLeaveLimit.value),
        },
        workingHours: {
          start: formData.workingHours.start,
          grace: formData.workingHours.grace,
          end: formData.workingHours.end,
        },
        nightShiftWorkingHours: {
          start: formData.nightShiftWorkingHours.start,
          grace: formData.nightShiftWorkingHours.grace,
          end: formData.nightShiftWorkingHours.end,
        },
        weekends: formData.weekends,
        kpiWeights: {
          projectTask: Number.parseInt(formData.kpiWeights.projectTask),
          dailyTask: Number.parseInt(formData.kpiWeights.dailyTask),
          attendance: Number.parseInt(formData.kpiWeights.attendance),
          workHours: Number.parseInt(formData.kpiWeights.workHours),
          leaveTaken: Number.parseInt(formData.kpiWeights.leaveTaken),
        },
        maxStorage: {
          value: parseInt(formData.maxStorage.value),
          unit: formData.maxStorage.unit,
        },
        mealRates: {
          breakfast: parseFloat(formData.mealRates.breakfast),
          lunch: parseFloat(formData.mealRates.lunch),
          dinner: parseFloat(formData.mealRates.dinner),
          evening_snacks: parseFloat(formData.mealRates.evening_snacks),
          midnight_snacks: parseFloat(formData.mealRates.midnight_snacks),
        },
        guest: formData.guest,

        // createdBy: "683841e0595d6d0b86c51b65", // This would typically come from user context
      };

      await updateAdminConfig(submitData).unwrap();
      refetch();
      toast.success("Success", "System configuration updated successfully!");
    } catch (error) {
      console.error("Error saving KPI settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));

      // Clear nested field errors
      if (errors[parent] && errors[parent][child]) {
        setErrors((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: undefined,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear direct field errors
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    }

    // Special handling for KPI weights - clear all KPI errors when any KPI field changes
    if (field.startsWith("kpiWeights.")) {
      if (errors.kpiWeights) {
        const kpiField = field.split(".")[1];
        setErrors((prev) => ({
          ...prev,
          kpiWeights: {
            ...prev.kpiWeights,
            [kpiField]: undefined,
          },
        }));
      }
    }

    // Special handling for weekends field
    if (field === "weekends") {
      if (errors.weekends) {
        setErrors((prev) => ({
          ...prev,
          weekends: undefined,
        }));
      }
    }
  };

  const getTotalWeight = () => {
    const weights = Object.values(formData.kpiWeights);
    return weights.reduce(
      (sum, weight) => sum + (Number.parseInt(weight) || 0),
      0
    );
  };

  const addGuest = () => {
    // Check if there are any empty guest fields
    const hasEmptyGuest = formData.guest.some(
      (guest) => !guest.name || guest.name.trim() === ""
    );

    if (hasEmptyGuest) {
      // Focus on the first empty guest field or show an error
      return;
    }

    setFormData((prev) => ({
      ...prev,
      guest: [...prev.guest, { name: "" }],
    }));
  };

  const hasEmptyGuestFields = () => {
    return formData.guest.some(
      (guest) => !guest.name || guest.name.trim() === ""
    );
  };

  const removeGuest = (index) => {
    setFormData((prev) => ({
      ...prev,
      guest: prev.guest.filter((_, i) => i !== index),
    }));

    // Clear errors for removed guest
    if (errors.guest && errors.guest[index]) {
      setErrors((prev) => ({
        ...prev,
        guest: {
          ...prev.guest,
          [index]: undefined,
        },
      }));
    }
  };

  const updateGuestName = (index, name) => {
    setFormData((prev) => ({
      ...prev,
      guest: prev.guest.map((guest, i) =>
        i === index ? { ...guest, name } : guest
      ),
    }));

    // Clear error for this guest
    if (errors.guest && errors.guest[index]) {
      setErrors((prev) => ({
        ...prev,
        guest: {
          ...prev.guest,
          [index]: undefined,
        },
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 bg-gradient-to-br min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg ">
        <div className="relative rounded-t-lg bg-form-header-gradient p-4 text-gray-800">
          <div>
            <div className="flex items-center justify-center space-x-2 mb-2 text-red-500">
              <Settings size={28} />
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 text-center">
                System Configuration Overview
              </h2>
            </div>

            <p className="text-gray-600 mt-1 text-center text-sm">
              Review the core administrative settings that govern leave
              policies, working hours, and KPI evaluation weights. This
              configuration ensures consistent and transparent performance
              tracking across all employees. Each update is logged with
              timestamps and admin identities for full auditability and
              compliance.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-10">
            {/* Leave Management Section */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Leave Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure leave limits and policies
                  </p>
                </div>
              </div>

              <div>
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Annual Leave
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <FloatingInput
                        label="Days"
                        type="number"
                        value={formData.annualLeaveLimit.value}
                        onChange={(e) =>
                          handleInputChange(
                            `annualLeaveLimit.value`,
                            e.target.value
                          )
                        }
                        error={errors.annualLeaveLimit?.value}
                      />
                      <SelectInput
                        label="Period"
                        options={periodOptions}
                        value={{
                          value: formData.annualLeaveLimit.unit,
                          label: periodOptions.find(
                            (option) =>
                              option.value === formData.annualLeaveLimit.unit
                          )?.label,
                        }}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            annualLeaveLimit: {
                              ...prev.annualLeaveLimit,
                              unit: e.value,
                            },
                          }))
                        }
                        error={errors.annualLeaveLimit?.unit}
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Casual Leave
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <FloatingInput
                        label="Days"
                        type="number"
                        value={formData.casualLeaveLimit.value}
                        onChange={(e) =>
                          handleInputChange(
                            `casualLeaveLimit.value`,
                            e.target.value
                          )
                        }
                        error={errors.casualLeaveLimit?.value}
                      />
                      <SelectInput
                        label="Period"
                        options={periodOptions}
                        value={{
                          value: formData.casualLeaveLimit.unit,
                          label: periodOptions.find(
                            (option) =>
                              option.value === formData.casualLeaveLimit.unit
                          )?.label,
                        }}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            casualLeaveLimit: {
                              ...prev.casualLeaveLimit,
                              unit: e.value,
                            },
                          }))
                        }
                        error={errors.casualLeaveLimit?.unit}
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Medical Leave
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <FloatingInput
                        label="Days"
                        type="number"
                        value={formData.medicalLeaveLimit.value}
                        onChange={(e) =>
                          handleInputChange(
                            `medicalLeaveLimit.value`,
                            e.target.value
                          )
                        }
                        error={errors.medicalLeaveLimit?.value}
                      />
                      <SelectInput
                        label="Period"
                        options={periodOptions}
                        value={{
                          value: formData.medicalLeaveLimit.unit,
                          label: periodOptions.find(
                            (option) =>
                              option.value === formData.medicalLeaveLimit.unit
                          )?.label,
                        }}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            medicalLeaveLimit: {
                              ...prev.medicalLeaveLimit,
                              unit: e.value,
                            },
                          }))
                        }
                        error={errors.medicalLeaveLimit?.unit}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours Section */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Working Hours
                  </h3>
                  <p className="text-sm text-gray-600">
                    Set daily working time schedule
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid md:grid-cols-3 gap-8">
                  <FloatingInput
                    label="Start Time"
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) =>
                      handleInputChange("workingHours.start", e.target.value)
                    }
                    error={errors.workingHours?.start}
                  />
                  <FloatingInput
                    label="Grace Time"
                    type="time"
                    value={formData.workingHours.grace}
                    onChange={(e) =>
                      handleInputChange("workingHours.grace", e.target.value)
                    }
                    error={errors.workingHours?.grace}
                  />
                  <FloatingInput
                    label="End Time"
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) =>
                      handleInputChange("workingHours.end", e.target.value)
                    }
                    error={errors.workingHours?.end}
                  />
                </div>
              </div>
            </div>

            {/* Night Shift Working Hours Section */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <SunMoon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Night Shift Working Hours
                  </h3>
                  <p className="text-sm text-gray-600">
                    Set night shift working time schedule
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid md:grid-cols-3 gap-8">
                  <FloatingInput
                    label="Start Time"
                    type="time"
                    value={formData.nightShiftWorkingHours.start}
                    onChange={(e) =>
                      handleInputChange(
                        "nightShiftWorkingHours.start",
                        e.target.value
                      )
                    }
                    error={errors.nightShiftWorkingHours?.start}
                  />
                  <FloatingInput
                    label="Grace Time"
                    type="time"
                    value={formData.nightShiftWorkingHours.grace}
                    onChange={(e) =>
                      handleInputChange(
                        "nightShiftWorkingHours.grace",
                        e.target.value
                      )
                    }
                    error={errors.nightShiftWorkingHours?.grace}
                  />
                  <FloatingInput
                    label="End Time"
                    type="time"
                    value={formData.nightShiftWorkingHours.end}
                    onChange={(e) =>
                      handleInputChange(
                        "nightShiftWorkingHours.end",
                        e.target.value
                      )
                    }
                    error={errors.nightShiftWorkingHours?.end}
                  />
                </div>
              </div>
            </div>

            {/* Weekend Configuration Section */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Weekend Configuration
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select which days are considered weekends
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Weekend Days
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {weekdayOptions.map((day) => (
                      <label
                        key={day.value}
                        className="relative flex items-center justify-center"
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.weekends.includes(day.value)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const newWeekends = isChecked
                              ? [...formData.weekends, day.value]
                              : formData.weekends.filter(
                                  (w) => w !== day.value
                                );
                            handleInputChange("weekends", newWeekends);
                          }}
                        />
                        <div
                          className={`w-full px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all cursor-pointer text-center ${
                            formData.weekends.includes(day.value)
                              ? "bg-primary border-primary text-white"
                              : "bg-white border-gray-300 text-gray-700 hover:border-primary hover:bg-gray-50"
                          }`}
                        >
                          {day.label}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.weekends && (
                    <p className="text-red-600 text-sm mt-2">
                      {errors.weekends}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* KPI Weights Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      KPI Weights
                    </h3>
                    <p className="text-sm text-gray-600">
                      Configure performance metric weights (must total 100%)
                    </p>
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    getTotalWeight() === 100
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  Total: {getTotalWeight()}%
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <FloatingInput
                      label="Project Task Weight (%)"
                      type="number"
                      value={formData.kpiWeights.projectTask}
                      onChange={(e) =>
                        handleInputChange(
                          "kpiWeights.projectTask",
                          e.target.value
                        )
                      }
                      error={errors.kpiWeights?.projectTask}
                      min="0"
                      max="100"
                    />
                    <FloatingInput
                      label="Daily Task Weight (%)"
                      type="number"
                      value={formData.kpiWeights.dailyTask}
                      onChange={(e) =>
                        handleInputChange(
                          "kpiWeights.dailyTask",
                          e.target.value
                        )
                      }
                      error={errors.kpiWeights?.dailyTask}
                      min="0"
                      max="100"
                    />
                    <FloatingInput
                      label="Attendance Weight (%)"
                      type="number"
                      value={formData.kpiWeights.attendance}
                      onChange={(e) =>
                        handleInputChange(
                          "kpiWeights.attendance",
                          e.target.value
                        )
                      }
                      error={errors.kpiWeights?.attendance}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-6">
                    <FloatingInput
                      label="Work Hours Weight (%)"
                      type="number"
                      value={formData.kpiWeights.workHours}
                      onChange={(e) =>
                        handleInputChange(
                          "kpiWeights.workHours",
                          e.target.value
                        )
                      }
                      error={errors.kpiWeights?.workHours}
                      min="0"
                      max="100"
                    />
                    <FloatingInput
                      label="Leave Taken Weight (%)"
                      type="number"
                      value={formData.kpiWeights.leaveTaken}
                      onChange={(e) =>
                        handleInputChange(
                          "kpiWeights.leaveTaken",
                          e.target.value
                        )
                      }
                      error={errors.kpiWeights?.leaveTaken}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {getTotalWeight() !== 100 && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-medium">
                        Invalid Weight Distribution
                      </p>
                      <p className="text-red-700 text-sm mt-1">
                        KPI weights must total exactly 100%. Current total:{" "}
                        {getTotalWeight()}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Storage Limit Section */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    File Storage Limit
                  </h3>
                  <p className="text-sm text-gray-600">
                    Define the maximum upload capacity available per employee
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FloatingInput
                    label="Max Storage Value"
                    type="number"
                    value={formData.maxStorage.value}
                    onChange={(e) =>
                      handleInputChange("maxStorage.value", e.target.value)
                    }
                    error={errors.maxStorage?.value}
                    placeholder="e.g., 800"
                    min="1"
                  />
                  <SelectInput
                    label="Storage Unit"
                    options={[
                      { value: "KB", label: "KB" },
                      { value: "MB", label: "MB" },
                      { value: "GB", label: "GB" },
                    ]}
                    value={{
                      value: formData.maxStorage.unit,
                      label: formData.maxStorage.unit,
                    }}
                    onChange={(e) =>
                      handleInputChange("maxStorage.unit", e.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Meal Rates Section */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Meal Rates Configuration
                  </h3>
                  <p className="text-sm text-gray-600">
                    Set rates for different meal types
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FloatingInput
                    label="Breakfast Rate"
                    type="number"
                    value={formData.mealRates.breakfast}
                    onChange={(e) =>
                      handleInputChange("mealRates.breakfast", e.target.value)
                    }
                    error={errors.mealRates?.breakfast}
                    placeholder="e.g., 50"
                    min="0"
                    step="0.01"
                  />
                  <FloatingInput
                    label="Lunch Rate"
                    type="number"
                    value={formData.mealRates.lunch}
                    onChange={(e) =>
                      handleInputChange("mealRates.lunch", e.target.value)
                    }
                    error={errors.mealRates?.lunch}
                    placeholder="e.g., 130"
                    min="0"
                    step="0.01"
                  />
                  <FloatingInput
                    label="Dinner Rate"
                    type="number"
                    value={formData.mealRates.dinner}
                    onChange={(e) =>
                      handleInputChange("mealRates.dinner", e.target.value)
                    }
                    error={errors.mealRates?.dinner}
                    placeholder="e.g., 100"
                    min="0"
                    step="0.01"
                  />
                  <FloatingInput
                    label="Evening Snacks Rate"
                    type="number"
                    value={formData.mealRates.evening_snacks}
                    onChange={(e) =>
                      handleInputChange(
                        "mealRates.evening_snacks",
                        e.target.value
                      )
                    }
                    error={errors.mealRates?.evening_snacks}
                    placeholder="e.g., 5"
                    min="0"
                    step="0.01"
                  />
                  <FloatingInput
                    label="Midnight Snacks Rate"
                    type="number"
                    value={formData.mealRates.midnight_snacks}
                    onChange={(e) =>
                      handleInputChange(
                        "mealRates.midnight_snacks",
                        e.target.value
                      )
                    }
                    error={errors.mealRates?.midnight_snacks}
                    placeholder="e.g., 50"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Guest Management Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Default Guest List
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage default guest entries for the system
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {formData.guest.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {formData.guest.length} Guest
                      {formData.guest.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                {formData.guest.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <UserPlus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No guests added yet
                    </h4>
                    <p className="text-gray-500 mb-6">
                      Add default guests that will be available system-wide
                    </p>
                    <button
                      type="button"
                      onClick={addGuest}
                      className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-[#7a5a3a] transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Guest
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.guest.map((guest, index) => (
                        <div
                          key={index}
                          className="group bg-white p-4 rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <FloatingInput
                                label="Guest Name"
                                type="text"
                                value={guest.name}
                                onChange={(e) =>
                                  updateGuestName(index, e.target.value)
                                }
                                error={errors.guest?.[index]}
                                className="text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeGuest(index)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"
                              aria-label="Remove guest"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.guest.length > 0 && (
                      <div className="pt-4 border-t border-gray-200 mt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>
                              Total: {formData.guest.length} guest
                              {formData.guest.length !== 1 ? "s" : ""}{" "}
                              configured
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={addGuest}
                            disabled={hasEmptyGuestFields()}
                            className={`inline-flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              hasEmptyGuestFields()
                                ? "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
                                : "bg-white border border-primary text-primary hover:bg-primary hover:text-white"
                            }`}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Another
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 pt-8 mt-8 border-t border-gray-200">
            {/* <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button> */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-[#7a5a3a] 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center
                         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemConfigPage;
