import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
import { 
  useUpdateFoodItemMutation,
  useGetFoodItemByIdQuery
} from "@/redux/features/food/foodApiSlice";
import { toast } from "@/component/Toast";
import { FloatingInput } from "@/component/FloatiingInput";
import SelectInput from "@/component/select/SelectInput";
import Tooltip from "@/component/Tooltip";
import Pagination from "@/component/Pagination";
import Button from "@/component/Button";
import Loader from "@/component/Loader";

const UpdateFoodRecord = ({ open = false, onSuccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Fetch the existing food record with refetch option
  const { data: foodItemData, isLoading: isFetchingFoodItem, refetch } = useGetFoodItemByIdQuery(id);
  const recordToEdit = foodItemData || null;

  // Form state
  const [formData, setFormData] = useState({
    date: "",
    mealRate: "",
    mealType: "",
  });

  // Employees and guests from API
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [guests, setGuests] = useState([]);
  const [newGuestName, setNewGuestName] = useState("");
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

  const [updateFoodItem] = useUpdateFoodItemMutation();

  const mealTypeOptions = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "evening_snacks", label: "Snacks" },
    { value: "dinner", label: "Dinner" },
    { value: "midnight_snacks", label: "Midnight Snacks" },
  ];

  // Load API data directly when record is available
  useEffect(() => {
    if (recordToEdit) {
      const mealTypeValue = mealTypeOptions.find(option => option.value === recordToEdit.mealType) || "";
      
      setFormData({
        date: recordToEdit.date
          ? new Date(recordToEdit.date).toISOString().split("T")[0]
          : "",
        mealRate: recordToEdit.mealRate?.toString() || "",
        mealType: mealTypeValue,
      });

      // Set employees exactly as they come from API
      const apiEmployees = recordToEdit.entries.map(entry => ({
        ...entry.employeeId, // Spread employee details
        _id: entry.employeeId?._id || entry._id,
        employeeId: entry.employeeId?._id || entry._id, // Add employeeId for consistency
        foodStatus: entry.foodStatus,
        firstName: entry.firstName || entry.employeeId?.firstName,
        lastName: entry.lastName || entry.employeeId?.lastName,
        email: entry.email || entry.employeeId?.email,
        photoUrl: entry.photoUrl || entry.employeeId?.photoUrl // Ensure photoUrl is preserved
      }));

      setEmployees(apiEmployees);
      setFilteredEmployees(apiEmployees);

      // Set guests exactly as they come from API
      setGuests(recordToEdit.guests || []);
      
      // Calculate initial total cost
      const totalUtilizedAndWasted = 
        recordToEdit.entries.filter(e => e.foodStatus === "utilized").length +
        recordToEdit.entries.filter(e => e.foodStatus === "wasted").length +
        (recordToEdit.guests?.length || 0);
      
      setTotalCost(totalUtilizedAndWasted * (recordToEdit.mealRate || 0));
    }
  }, [recordToEdit]);

  // Filter employees based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (emp) =>
          emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
    setCurrentPage(parseInt(searchParams.get('page')) || 1);
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

  // Auto-calculate cost when status changes
  useEffect(() => {
    if (formData.mealRate) {
      const totalUtilizedAndWasted =
        employees.filter((emp) => emp.foodStatus === "utilized").length +
        employees.filter((emp) => emp.foodStatus === "wasted").length +
        guests.length;

      const cost = totalUtilizedAndWasted * parseFloat(formData.mealRate);
      setTotalCost(cost);
      setFormData(prev => ({ ...prev, cost: cost.toString() }));
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
    if (name === "mealRate" && value && isNaN(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleEmployeeStatusChange = (employeeId, newStatus) => {
    // Update employee status (don't remove from array)
    setEmployees(prev =>
      prev.map(emp =>
        (emp.employeeId || emp._id) === employeeId 
          ? { ...emp, foodStatus: newStatus } 
          : emp
      )
    );
    setFilteredEmployees(prev =>
      prev.map(emp =>
        (emp.employeeId || emp._id) === employeeId 
          ? { ...emp, foodStatus: newStatus } 
          : emp
      )
    );
    setOpenMenuId(null);
    setMenuType(null);
  };

  // Bulk status change handler
  const handleBulkStatusChange = (newStatus) => {
    // Update status for selected employees
    setEmployees(prev =>
      prev.map(emp =>
        selectedEmployees.includes(emp.employeeId || emp._id)
          ? { ...emp, foodStatus: newStatus }
          : emp
      )
    );
    setFilteredEmployees(prev =>
      prev.map(emp =>
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
      setGuests(prev => [
        ...prev,
        {
          _id: Date.now().toString() + Math.random(), // More unique temporary ID
          name: newGuestName.trim(),
          foodStatus: "utilized",
        }
      ]);
      setNewGuestName("");
    }
  };

  const removeGuest = (guestId) => {
    setGuests(prev => prev.filter(guest => guest._id !== guestId));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.mealRate || parseFloat(formData.mealRate) <= 0)
      newErrors.mealRate = "Valid meal rate is required";
    if (!formData.mealType?.value)
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
      const finalData = {
        date: formData.date,
        totalFood: employees.filter(e => e.foodStatus !== "not_need").length + guests.length,
        mealRate: parseFloat(formData.mealRate),
        cost: parseFloat(formData.cost || 0),
        mealType: formData.mealType.value,
        entries: employees.map(emp => ({
            employeeId: emp.employeeId || emp._id,
            foodStatus: emp.foodStatus,
            firstName: emp.firstName,
            lastName: emp.lastName,
            photoUrl: emp.photoUrl,
            email: emp.email
          })),
        guests: guests,
      };

      await updateFoodItem({ id, data: finalData }).unwrap();
      toast.success("Food record updated successfully!");
      
      // Refetch the data to ensure we have the latest version
      refetch();
      
      navigate("/food-management", { state: { refetch: true } });
      onSuccess?.();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.data?.message || "Failed to update record");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/food-management");
    onSuccess?.();
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

  const totalUtilized = employees.filter(emp => emp.foodStatus === "utilized").length + guests.length;
  const totalWasted = employees.filter(emp => emp.foodStatus === "wasted").length;
  const totalNotNeeded = employees.filter(emp => emp.foodStatus === "not_need").length;
  const totalEntries = employees.filter(emp => emp.foodStatus !== "not_need").length + guests.length;

  if (isFetchingFoodItem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className={`${open ? "" : "p-4 md:pl-24 pb-20 md:pb-4"}`}>
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-visible transition-all duration-300">
        <div className="relative rounded-t-2xl h-42 bg-form-header-gradient p-6">
          <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/30"></div>
          <div className="absolute bottom-5 left-8 h-8 w-8 rounded-full bg-white/20"></div>

          <div>
            <div className="flex items-center justify-center gap-3 mb-2">
              <ChefHat className="h-8 w-8 text-gray-600" />
              <h1 className="text-xl md:text-3xl font-semibold text-gray-600 text-center">
                Update Food Record
              </h1>
            </div>
            <div className="h-1 w-24 bg-white/50 mx-auto rounded-full mb-3"></div>
            <p className="text-sm sm:text-base font-medium text-gray-600 text-center">
              Manage daily food consumption and track meal utilization 🍽️
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <div className="space-y-8">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700 text-sm">
                Updating record for:{" "}
                <span className="font-semibold">
                  {recordToEdit?.date ? new Date(recordToEdit.date).toLocaleDateString() : ""}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <FloatingInput
                  label=""
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  error={errors.date}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meal Type <span className="text-red-500">*</span>
                </label>
                <SelectInput
                  label=''
                  options={mealTypeOptions}
                  value={formData?.mealType}
                  onChange={(selected) => 
                    setFormData(prev => ({ ...prev, mealType: selected }))
                  }
                  error={errors.mealType}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meal Rate (BDT) <span className="text-red-500">*</span>
                </label>
                <FloatingInput
                  name="mealRate"
                  label=""
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData?.mealRate}
                  onChange={handleInputChange}
                  error={errors.mealRate}
                  icon={<DollarSign className="h-4 w-4 text-gray-400" />}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Total Cost
                </label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-bold text-lg">BDT {totalCost.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Updated Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">Utilized</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-2">{totalUtilized}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-700">Wasted</span>
                </div>
                <p className="text-2xl font-bold text-red-900 mt-2">{totalWasted}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Not Needed</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{totalNotNeeded}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-700">Total Entries</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-2">{totalEntries}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Food Status
                </h3>
                <div className="relative w-64">
                  <FloatingInput
                    label="Search employees"
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
                        {/* Checkbox column */}
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
                      {paginatedEmployees?.map((employee) => (
                        <tr key={employee._id} className="hover:bg-gray-50">
                          {/* Checkbox cell */}
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
                              <div className="relative ml-2">
                                <Tooltip text={`Change status (current: ${employee.foodStatus})`}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleMenu(employee.employeeId || employee._id, "status");
                                    }}
                                    className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                  >
                                    <MoreVertical size={14} className="mt-1" />
                                  </button>
                                </Tooltip>
                                {openMenuId === (employee.employeeId || employee._id) && menuType === "status" && (
                                  <div className="absolute right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEmployeeStatusChange(employee.employeeId || employee._id, "utilized");
                                        }}
                                        className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                                      >
                                        Utilized
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEmployeeStatusChange(employee.employeeId || employee._id, "wasted");
                                        }}
                                        className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                                      >
                                        Wasted
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEmployeeStatusChange(employee.employeeId || employee._id, "not_need");
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

              {/* Fixed pagination display */}
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Extra Meal Management
              </h3>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex gap-3 lg:w-[80%]">
                  <FloatingInput
                    type="text"
                    label= "Enter Extra Meal (if any)"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addGuest()}
                  />
                  <Button
                    type="button"
                    onClick={addGuest}
                    className="gap-2 rounded-md h-[45px] w-[250px] my-3"
                  >
                    <Plus className="h-4 w-4" />
                    ADD EXTRA MEAL
                  </Button>
                </div>
              </div>

              {guests.length > 0 && (
                <div className="space-y-2">
                  {guests.map((guest) => (
                    <div
                      key={guest._id}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {guest.name}
                          </div>
                          <div className="text-xs text-gray-500">Extra Meal</div>
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
                {isLoading ? "Saving..." : "Update Record"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateFoodRecord;