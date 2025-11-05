import Button from "@/component/Button";
import Modal from "@/component/Modal";
import SelectInput from "@/component/select/SelectInput";
import { toast } from "@/component/Toast";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import { useAssignProductMutation } from "@/redux/features/product/productApiSlice";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";


const AssignProductModal = ({ open, onClose, product, refetch }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const loginUser = useSelector((state) => state.userSlice.user);

  const [assignProduct, { isLoading: isAssigning }] = useAssignProductMutation();

  const { data: employeesData, isLoading: isLoadingEmployees } = useGetAllEmployeesQuery({
    page: 1,
    limit: 1000000,
  });

  // Transform employees data for select options
  const employeeOptions = useMemo(() => {
    return (
      employeesData?.data?.map((employee) => ({
        value: employee._id,
        label: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        role: employee.role,
        department: employee.department?.name,
      })) || []
    );
  }, [employeesData]);

  // Handle form submission
  const handleAssign = async () => {
    // Validate form
    const errors = {};
    if (!selectedEmployee) {
      errors.employee = "Please select an employee to assign the product";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const assignData = {
        employeeId: selectedEmployee.value,
        handOverBy: loginUser?.user?._id,
      };

      await assignProduct({
        productId: product._id,
        body: assignData,
      }).unwrap();

    //   toast.success(`Product "${product.name}" assigned successfully to ${selectedEmployee.label}!`);
      handleClose();
      refetch();
    } catch (error) {
      console.error("Error assigning product:", error);
      toast.error(error?.data?.error || "Failed to assign product. Please try again.");
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedEmployee(null);
    setFormErrors({});
    onClose();
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      AVAILABLE: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
      },
      ASSIGNED: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      UNUSABLE: {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
      },
      MAINTENANCE: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-200",
      },
    };

    const config = statusConfig[status] || statusConfig.AVAILABLE;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text} border ${config.border}`}
      >
        {status?.replace("_", " ") || "Available"}
      </span>
    );
  };

  return (
    <Modal open={open} onClose={handleClose} className="max-w-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Assign Product</h2>
          <p className="text-sm text-gray-500 mt-1">
            Assign this product to an employee
          </p>
        </div>

        {/* Product Details Header */}
        {product && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {product.type?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span> {getStatusBadge(product.status)}
                  </p>
                </div>
                {product.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Description:</span> {product.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Employee Selection */}
        <div className="space-y-6">
          <SelectInput
            label="Select Employee"
            options={employeeOptions}
            value={selectedEmployee}
            onChange={(selectedOption) => {
              setSelectedEmployee(selectedOption);
              // Clear error when user selects an employee
              if (formErrors.employee) {
                setFormErrors((prev) => ({
                  ...prev,
                  employee: "",
                }));
              }
            }}
            error={formErrors.employee}
            required
            disabled={isLoadingEmployees}
          />

          {isLoadingEmployees && (
            <div className="text-center py-4">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading employees...
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={isAssigning || isLoadingEmployees}
          >
            {isAssigning ? "Assigning..." : "Assign Product"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignProductModal;
