import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams  } from "react-router-dom";
import {
  DollarSign,
  Users,
  Utensils,
  Plus,
  Trash2,
  UserPlus,
  ChefHat,
  Save,
  X,
  MoreVertical,
} from "lucide-react";
import { useGetEmployeesForFoodQuery, useAddFoodItemMutation } from "@/redux/features/food/foodApiSlice";
import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";
import { toast } from "@/component/Toast";
import { FloatingInput } from "@/component/FloatiingInput";
import SelectInput from "@/component/select/SelectInput";
import Tooltip from "@/component/Tooltip";
import Pagination from "@/component/Pagination";
import Button from "@/component/Button";
import Loader from "@/component/Loader";

const CreateFoodRecord = () => {
  // Form state
  const user = useSelector((state) => state.userSlice.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    totalFood: "",
    mealRate: "",
    cost: "",
    mealType: null,
  });

  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [guests, setGuests] = useState([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [previousMealType, setPreviousMealType] = useState(null);
  const [defaultGuestsLoaded, setDefaultGuestsLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuType, setMenuType] = useState(null);
  const [totalCost, setTotalCost] = useState(0);

  // Bulk selection state
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all employees
  const { data: employeeData, isLoading: isFetchingEmployees } = useGetEmployeesForFoodQuery();
  const { data: adminConfig, isLoading: isFetchingAdminConfig } = useGetAdminConfigQuery();
  const [addFoodItem] = useAddFoodItemMutation();

  const mealTypeOptions = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "evening_snacks", label: "Snacks" },
    { value: "dinner", label: "Dinner" },
    { value: "midnight_snacks", label: "Midnight Snacks" },
  ];

  // Initialize employees data
  useEffect(() => {
    if (employeeData) {
      const initialEmployees = employeeData.map(emp => ({
        ...emp,
        foodStatus: "utilized"
      }));
      setEmployees(initialEmployees);
      setFilteredEmployees(initialEmployees);
    }
  }, [employeeData]);

  // Auto-populate default guests from admin config (only once on initial load)
  useEffect(() => {
    if (adminConfig?.guest && adminConfig.guest.length > 0 && !defaultGuestsLoaded) {
      const defaultGuests = adminConfig.guest.map((guest, index) => ({
        _id: `default_${Date.now()}_${index}`,
        name: guest.name,
        foodStatus: "utilized",
      }));
      setGuests(defaultGuests);
      setDefaultGuestsLoaded(true);
    }
  }, [adminConfig, defaultGuestsLoaded]);

  // Auto-populate meal rate when meal type is selected
  useEffect(() => {
    if (formData.mealType && adminConfig?.mealRates) {
      const selectedMealType = formData.mealType.value;
      
      // Only auto-populate if meal type has changed (not initial load)
      if (previousMealType !== selectedMealType) {
        const mealRate = adminConfig.mealRates[selectedMealType];
        
        if (mealRate) {
          setFormData((prev) => ({
            ...prev,
            mealRate: mealRate.toString()
          }));
        }
        
        setPreviousMealType(selectedMealType);
      }
    }
  }, [formData.mealType, adminConfig, previousMealType]);

  // Filter employees based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
      setCurrentPage(parseInt(searchParams.get('page')) || 1); 
    } else {
      const filtered = employees.filter(
        (emp) =>
          emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, employees]);

  // Reset selection when page changes
  useEffect(() => {
    // Only reset selectAll state, not the actual selections
    setSelectAll(false);
  }, [currentPage]);

  // Calculate pagination
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  // Auto-calculate cost when utilized/wasted count or mealRate changes
  useEffect(() => {
    if (formData.mealRate && employees.length > 0) {
      const totalUtilizedAndWasted =
        employees.filter((emp) => emp.foodStatus === "utilized").length +
        employees.filter((emp) => emp.foodStatus === "wasted").length +
        guests.length;

      const cost = totalUtilizedAndWasted * parseFloat(formData.mealRate);
      setTotalCost(cost);
      setFormData((prev) => ({ ...prev, cost: cost.toString() }));
    }
  }, [employees, guests, formData.mealRate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setMenuType(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Toggle menu for status change
  const toggleMenu = (id, type) => {
    if (openMenuId === id && menuType === type) {
      setOpenMenuId(null);
      setMenuType(null);
    } else {
      setOpenMenuId(id);
      setMenuType(type);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchParams({ page });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate numeric fields
    if (name === "totalFood" || name === "mealRate") {
      if (value && isNaN(value)) return; // Only allow numbers
      if (value && parseFloat(value) < 0) return; // No negative numbers
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleEmployeeStatusChange = (employeeId, newStatus) => {
    // Update employee status (don't remove from array)
    setEmployees((prev) =>
      prev.map((emp) =>
        (emp.employeeId || emp._id) === employeeId
          ? { ...emp, foodStatus: newStatus }
          : emp
      )
    );
    setFilteredEmployees((prev) =>
      prev.map((emp) =>
        (emp.employeeId || emp._id) === employeeId
          ? { ...emp, foodStatus: newStatus }
          : emp
      )
    );
    setOpenMenuId(null);
    setMenuType(null);
  };

  const handleBulkStatusChange = (newStatus) => {
    // Update status for selected employees
    setEmployees((prev) =>
      prev.map((emp) =>
        selectedEmployees.includes(emp.employeeId || emp._id)
          ? { ...emp, foodStatus: newStatus }
          : emp
      )
    );
    setFilteredEmployees((prev) =>
      prev.map((emp) =>
        selectedEmployees.includes(emp.employeeId || emp._id)
          ? { ...emp, foodStatus: newStatus }
          : emp
      )
    );
    
    // Clear selection
    setSelectedEmployees([]);
    setSelectAll(false);
  };

  const addGuest = () => {
    if (newGuestName.trim()) {
      const newGuest = {
        _id: Date.now().toString() + Math.random(), // More unique temporary ID
        name: newGuestName.trim(),
        foodStatus: "utilized",
      };
      setGuests((prev) => [...prev, newGuest]);
      setNewGuestName("");
    }
  };

  // Helper function to check if any guest has empty name
  const hasEmptyGuestFields = () => {
    return guests.some(guest => !guest.name.trim());
  };

  // Function to add new guest with validation
  const addNewGuest = () => {
    // Prevent adding new guest if there are empty fields
    if (hasEmptyGuestFields()) {
      return;
    }
    
    if (newGuestName.trim()) {
      const newGuest = {
        _id: Date.now().toString() + Math.random(),
        name: newGuestName.trim(),
        foodStatus: "utilized",
      };
      setGuests((prev) => [...prev, newGuest]);
      setNewGuestName("");
    }
  };

  const removeGuest = (guestId) => {
    setGuests((prev) => prev.filter((guest) => guest._id !== guestId));
  };

  // Function to update guest name
  const updateGuestName = (guestId, newName) => {
    setGuests((prev) =>
      prev.map((guest) =>
        guest._id === guestId ? { ...guest, name: newName } : guest
      )
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.mealRate || parseFloat(formData.mealRate) <= 0)
      newErrors.mealRate = "Meal rate must be greater than 0";
    if (!formData.mealType || !formData.mealType.value)
      newErrors.mealType = "Meal type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare final data structure
      const finalData = {
        date: formData.date,
        totalFood: employees.filter((e) => e.foodStatus !== "not_need").length + guests.length,
        mealRate: parseFloat(formData.mealRate),
        cost: parseFloat(formData.cost),
        mealType: formData.mealType.value,
        entries: employees.filter((e) => e.foodStatus !== "not_need"), // Exclude not_needed
        guests: guests,
        createdBy: user?.user?._id,
      };

      // Create new record
      await addFoodItem(finalData).unwrap();
      
      toast.success("Food record created successfully!");

      // Navigate back to food management
      navigate("/food-management");
      

    } catch (error) {
      console.error("Error saving food record:", error);
      toast.error(
        error?.data?.message || "Failed to save food record. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/food-management');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      utilized: { color: "bg-green-100 text-green-800", label: "Utilized" },
      wasted: { color: "bg-red-100 text-red-800", label: "Wasted" },
      not_need: { color: "bg-gray-100 text-gray-800", label: "Not Needed" },
    };
    const statusInfo = statusMap[status] || statusMap.utilized;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const totalUtilized = employees.filter((emp) => emp.foodStatus === "utilized").length + guests.length;
  const totalWasted = employees.filter((emp) => emp.foodStatus === "wasted").length;
  const totalEntries = employees.filter((emp) => emp.foodStatus !== "not_need").length + guests.length;
  const totalNotNeeded = employees.filter((emp) => emp.foodStatus === "not_need").length;

  if (isFetchingEmployees || isFetchingAdminConfig) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-visible transition-all duration-300">
        {/* Header */}
        <div className="relative rounded-t-2xl h-42 bg-form-header-gradient p-6">
          <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/30"></div>
          <div className="absolute bottom-5 left-8 h-8 w-8 rounded-full bg-white/20"></div>

          <div>
            <div className="flex items-center justify-center gap-3 mb-2">
              <ChefHat className="h-8 w-8 text-gray-600" />
              <h1 className="text-xl md:text-3xl font-semibold text-gray-600 text-center">
                Create Food Record
              </h1>
            </div>
            <div className="h-1 w-24 bg-white/50 mx-auto rounded-full mb-3"></div>
            <p className="text-sm sm:text-base font-medium text-gray-600 text-center">
              Manage daily food consumption and track meal utilization 🍽️
            </p>
            <p className="text-xs sm:text-sm text-gray-600 text-center mt-2">
              Record meal information, track employee food status, and manage guest entries
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FloatingInput
                    name="date"
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full"
                    error={errors.date}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meal Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <SelectInput
                    label="Meal Type"
                    name="mealType"
                    isMulti={false}
                    icon={<Utensils className="h-4 w-4 text-gray-400" />}
                    value={formData.mealType}
                    onChange={(selected) => {
                      setFormData((prev) => ({ ...prev, mealType: selected }));
                      if (errors.mealType) {
                        setErrors((prev) => ({ ...prev, mealType: null }));
                      }
                    }}
                    options={mealTypeOptions}
                    error={errors.mealType}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meal Rate (BDT) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FloatingInput
                    label="Meal Rate"
                    type="number"
                    name="mealRate"
                    icon={<DollarSign className="h-4 w-4 text-gray-400" />}
                    min="0"
                    step="0.01"
                    value={formData.mealRate}
                    onChange={handleInputChange}
                    error={errors?.mealRate}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Total Cost
                </label>
                <div className="relative">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-bold text-lg">
                      BDT {totalCost.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    Utilized
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {totalUtilized}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-700">
                    Wasted
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-900 mt-2">
                  {totalWasted}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Not Needed
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalNotNeeded}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-700">
                    Total Entries
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {totalEntries}
                </p>
              </div>
            </div>

            {/* Employees Table */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Food Status
                </h3>

                <div className="relative w-64">
                  <FloatingInput
                    label="Search Employees"
                    className=""
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedEmployees.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="text-sm text-blue-800">
                    {selectedEmployees.length} employee(s) selected across all pages
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        if (newStatus) {
                          handleBulkStatusChange(newStatus);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Update status to...</option>
                      <option value="utilized">Utilized</option>
                      <option value="wasted">Wasted</option>
                      <option value="not_need">Not Needed</option>
                    </select>
                    <Button
                      onClick={() => {
                        setSelectedEmployees([]);
                        setSelectAll(false);
                      }}
                      className="text-sm text-gray-600 rounded-md px-3 py-1 hover:text-gray-800"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <div className="inline-block min-w-full shadow-sm rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                          <input
                            type="checkbox"
                            checked={paginatedEmployees.length > 0 && paginatedEmployees.every(emp => 
                              selectedEmployees.includes(emp.employeeId || emp._id)
                            )}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              if (isChecked) {
                                // Add current page employees to selection
                                const currentPageIds = paginatedEmployees.map(emp => emp.employeeId || emp._id);
                                const newSelections = [...new Set([...selectedEmployees, ...currentPageIds])];
                                setSelectedEmployees(newSelections);
                                setSelectAll(true);
                              } else {
                                // Remove current page employees from selection
                                const currentPageIds = paginatedEmployees.map(emp => emp.employeeId || emp._id);
                                const newSelections = selectedEmployees.filter(id => !currentPageIds.includes(id));
                                setSelectedEmployees(newSelections);
                                setSelectAll(false);
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedEmployees.map((employee) => (
                        <tr
                          key={employee.employeeId || employee._id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap w-10">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(employee.employeeId || employee._id)}
                              onChange={(e) => {
                                const employeeId = employee.employeeId || employee._id;
                                if (e.target.checked) {
                                  setSelectedEmployees([...selectedEmployees, employeeId]);
                                } else {
                                  setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
                                  setSelectAll(false);
                                }
                              }}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                {employee.photoUrl ? (
                                  <img
                                    className="w-8 h-8 rounded-full object-cover"
                                    src={employee.photoUrl}
                                    alt=""
                                  />
                                ) : (
                                  <span className="text-orange-600 font-medium text-sm">
                                    {employee.firstName?.charAt(0)}
                                    {employee.lastName?.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.firstName} {employee.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {employee.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="relative ml-2 dropdown-menu">
                                <Tooltip
                                  text={`Change status (current: ${employee.foodStatus})`}
                                  position="left"
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleMenu(employee.employeeId || employee._id, "status");
                                    }}
                                    className={`flex items-center text-gray-400 hover:text-gray-600 focus:outline-none`}
                                  >
                                    <MoreVertical size={14} className="mt-1" />
                                  </button>
                                </Tooltip>
                                {openMenuId === (employee.employeeId || employee._id) &&
                                  menuType === "status" && (
                                    <div className="absolute right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                      <div className="py-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEmployeeStatusChange(
                                              employee.employeeId || employee._id,
                                              "utilized"
                                            );
                                          }}
                                          className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                                        >
                                          Utilized
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEmployeeStatusChange(
                                              employee.employeeId || employee._id,
                                              "wasted"
                                            );
                                          }}
                                          className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                                        >
                                          Wasted
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEmployeeStatusChange(
                                              employee.employeeId || employee._id,
                                              "not_need"
                                            );
                                          }}
                                          className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                                        >
                                          Not Needed
                                        </button>
                                      </div>
                                    </div>
                                  )}
                              </div>
                              {getStatusBadge(employee.foodStatus)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {filteredEmployees.length > 0 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    totalCount={filteredEmployees.length}
                    limit={itemsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={handlePageChange}
                    setLimit={(newLimit) => {
                      setItemsPerPage(newLimit);
                      setCurrentPage(1);
                      setSearchParams({ page: 1 });
                    }}
                    className="w-full justify-center"
                  />
                </div>
              )}
            </div>

            {/* Guests Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Extra Meal Management
              </h3>

              {/* Add Guest */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex gap-3 lg:w-[80%]">
                  <FloatingInput
                    label = "Enter Extra Meal (if any)"
                    type="text"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    className="w-full"
                    onKeyPress={(e) => e.key === "Enter" && addNewGuest()}
                  />
                  <div className="relative">
                    <Button
                      type="button"
                      onClick={addNewGuest}
                      disabled={hasEmptyGuestFields()}
                      className={`gap-2 rounded-md h-[45px] w-[250px] my-3 ${
                        hasEmptyGuestFields()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                          : ''
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      ADD EXTRA MEAL
                    </Button>
                    {hasEmptyGuestFields() && (
                      <div className="absolute -bottom-6 left-0 text-xs text-red-500">
                        Please fill all guest names before adding new ones
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Guests List */}
              {guests.length > 0 && (
                <div className="space-y-2">
                  {guests.map((guest) => (
                    <div
                      key={guest._id}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          {editingGuestId === guest._id ? (
                            <input
                              type="text"
                              value={guest.name}
                              onChange={(e) => updateGuestName(guest._id, e.target.value)}
                              onBlur={() => setEditingGuestId(null)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  setEditingGuestId(null);
                                }
                              }}
                              className="text-sm font-medium text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 w-full"
                              autoFocus
                            />
                          ) : (
                            <div
                              onClick={() => setEditingGuestId(guest._id)}
                              className="cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {guest.name || "Click to edit"}
                              </div>
                              <div className="text-xs text-gray-500">Extra Meal (Click to edit)</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge("utilized")}
                        <button
                          type="button"
                          onClick={() => removeGuest(guest._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end pt-6 space-x-3 border-t border-gray-200">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 flex items-center gap-2 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 gap-3 rounded-md"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Create Record"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFoodRecord;