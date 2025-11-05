import Button from "@/component/Button";
import { FileUpload } from "@/component/FileUpload";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import Modal from "@/component/Modal";
import SelectInput from "@/component/select/SelectInput";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/redux/features/product/productApiSlice";
import { useGetTypesQuery } from "@/redux/features/type/typeApiSlice";
import processDocuments from "@/utils/processDocuments";
import { set } from "date-fns";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

const statusOptions = [
  { value: "AVAILABLE", label: "AVAILABLE" },
  { value: "ASSIGNED", label: "ASSIGNED" },
  { value: "UNUSABLE", label: "UNUSABLE" },
  { value: "MAINTENANCE", label: "MAINTENANCE" },
];

const ProductCreateAndUpdateModal = ({
  open,
  onClose,
  isEditMode,
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  setIsModalOpen,
  selectedProduct,
  refetch,
  resetForm,
}) => {
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const loginUser = useSelector((state) => state.userSlice.user);
  console.log(selectedProduct);

  const { data: typesData } = useGetTypesQuery({
    page: 1,
    limit: 1000000,
    status: "Active",
  });

  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetAllEmployeesQuery({
      page: 1,
      limit: 1000000,
    });

  const typeOptions = useMemo(() => {
    return (
      typesData?.data?.map((type) => ({
        value: type._id,
        label: type.name,
      })) || []
    );
  }, [typesData]);

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

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Process documents/images for submission

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = "Product name is required";
    }

    if (!formData.price) {
      errors.price = "Product price is required";
    }

    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.type) {
      errors.type = "Type is required";
    }

    if (!formData.status) {
      errors.status = "Status is required";
    }

    if (formData.currentOwner.label === "ASSIGNED") {
      errors.currentOwner = "Current Owner is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        description: formData.description.trim(),
        type: formData.type.value,
        status: formData.status.value,
        documents: processDocuments(formData.images),
        actionBy: loginUser?.user?._id,
        currentOwner: formData?.currentOwner
          ? formData.currentOwner?.value
          : null,
      };

      console.log(productData);

      if (isEditMode && selectedProduct) {
        await updateProduct({
          id: selectedProduct._id,
          data: productData,
        }).unwrap();
      } else {
        await createProduct(productData).unwrap();
      }

      resetForm();
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Error saving product:", error);
      // Handle API errors
      if (error.data?.message) {
        setFormErrors({ submit: error.data.message });
      }
    }
  };

  // Reset errors when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFormErrors({});
    }
  }, [open, setFormErrors]);

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {isEditMode ? "Edit Product" : "Create New Product"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <FloatingInput
            label="Product Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={formErrors.name}
            required={true}
          />
          <FloatingInput
            label="Product Price"
            value={formData.price}
            onChange={(e) => handleInputChange("price", Number(e.target.value))}
            error={formErrors.price}
            required={true}
          />

          <div className="md:col-span-2 mt-2">
            {/* Description */}
            <FloatingTextarea
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              error={formErrors.description}
              rows={2}
              // required={true}
            />
          </div>

          {/* Type Selection */}
          <SelectInput
            label="Type"
            options={typeOptions || []}
            value={formData.type}
            onChange={(selectedOption) =>
              handleInputChange("type", selectedOption)
            }
            error={formErrors.type}
            // required
          />

          {/* Status Selection */}
          <SelectInput
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(selectedOption) => {
              handleInputChange("status", selectedOption);
              if (selectedOption?.value !== "ASSIGNED") {
                setFormData((prev) => ({
                  ...prev,
                  currentOwner: null,
                }));
              }
            }}
            error={formErrors.status}
            required
          />

          {formData?.status?.label === "ASSIGNED" && (
            <div className="md:col-span-2">
              <SelectInput
                label="Select Employee"
                options={employeeOptions}
                value={formData.currentOwner}
                onChange={(selectedOption) => {
                  setFormData((prev) => ({
                    ...prev,
                    currentOwner: selectedOption,
                  }));
                  if (formErrors.currentOwner) {
                    setFormErrors((prev) => ({
                      ...prev,
                      currentOwner: "",
                    }));
                  }
                }}
                error={formErrors.currentOwner}
                required
                disabled={isLoadingEmployees}
              />
            </div>
          )}

          {/* Product Images */}
          <div className="md:col-span-2 mt-2">
            <FileUpload
              label="Product Images"
              value={formData.images}
              onChange={(images) => handleInputChange("images", images)}
              isMultiFile={true}
              accept=".jpg,.jpeg,.png,.gif,.webp"
              error={formErrors.images}
              onFileClick={(file) => {
                if (file?.fileUrl) {
                  window.open(file.fileUrl, "_blank");
                } else {
                  console.warn("No file URL available.");
                }
              }}
            />
          </div>
        </div>

        {/* Submit Error */}
        {formErrors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{formErrors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsModalOpen(false)}
            disabled={isCreating || isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
            onClick={handleSubmit}
          >
            {isCreating || isUpdating
              ? "Saving..."
              : isEditMode
              ? "Update Product"
              : "Create Product"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductCreateAndUpdateModal;
