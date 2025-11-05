import Button from "@/component/Button";
import { FileUpload } from "@/component/FileUpload";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import Modal from "@/component/Modal";
import SelectInput from "@/component/select/SelectInput";
import {
  useCreateRequisitionMutation,
  useUpdateRequisitionMutation,
} from "@/redux/features/requisition/requisitionApiSlice";
import { useGetTypesQuery } from "@/redux/features/type/typeApiSlice";
import { useGetVendorsQuery } from "@/redux/features/vendor/vendorApiSlice";
import processDocuments from "@/utils/processDocuments";
import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const RequisitionCreateAndUpdateModal = ({
  open,
  onClose,
  isEditMode,
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  setIsModalOpen,
  selectedRequisition,
  refetch,
  resetForm,
  getEmptyItem,
}) => {
  const loginUser = useSelector((state) => state.userSlice.user);
  console.log(selectedRequisition);

  const [createRequisition, { isLoading: isCreating }] =
    useCreateRequisitionMutation();
  const [updateRequisition, { isLoading: isUpdating }] =
    useUpdateRequisitionMutation();

  const { data: vendorsData } = useGetVendorsQuery({
    page: 1,
    limit: 1000000,
    status: "Active",
  });

  const { data: typesData } = useGetTypesQuery({
    page: 1,
    limit: 1000000,
    status: "Active",
  });
  // console.log(typesData);

  const vendorOptions = useMemo(() => {
    return (
      vendorsData?.data?.map((vendor) => ({
        value: vendor._id,
        label: vendor.name,
      })) || []
    );
  }, [vendorsData]);

  const typeOptions = useMemo(() => {
    return (
      typesData?.data?.map((type) => ({
        value: type._id,
        label: type.name,
      })) || []
    );
  }, [typesData]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    clearFieldError(field);
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    clearFieldError(field, index);
  };

  // Add new item
  const addItem = () => {
    // Check if the last item is complete before adding a new one
    const lastItem = formData.items[formData.items.length - 1];
    if (
      lastItem &&
      (!lastItem.quantityRequested || !lastItem.vendor || !lastItem.type)
    ) {
      // Trigger validation to show errors
      validateForm();
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, getEmptyItem()],
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));

      // Clear errors for removed item
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors.itemErrors) {
          delete newErrors.itemErrors[index];
          // Reindex remaining errors
          const reindexedErrors = {};
          Object.keys(newErrors.itemErrors).forEach((key) => {
            const keyIndex = Number.parseInt(key);
            if (keyIndex > index) {
              reindexedErrors[keyIndex - 1] = newErrors.itemErrors[key];
            } else if (keyIndex < index) {
              reindexedErrors[keyIndex] = newErrors.itemErrors[key];
            }
          });
          newErrors.itemErrors = reindexedErrors;
          if (Object.keys(newErrors.itemErrors).length === 0) {
            delete newErrors.itemErrors;
          }
        }
        return newErrors;
      });
    }
  };

  // Clear specific field error
  const clearFieldError = (fieldName, itemIndex = null) => {
    setFormErrors((prev) => {
      const newErrors = { ...prev };

      if (itemIndex !== null) {
        if (newErrors.itemErrors && newErrors.itemErrors[itemIndex]) {
          delete newErrors.itemErrors[itemIndex][fieldName];
          if (Object.keys(newErrors.itemErrors[itemIndex]).length === 0) {
            delete newErrors.itemErrors[itemIndex];
          }
          if (Object.keys(newErrors.itemErrors).length === 0) {
            delete newErrors.itemErrors;
          }
        }
      } else {
        delete newErrors[fieldName];
      }

      return newErrors;
    });
  };

  const validateForm = () => {
    const errors = {};

    // Validate main form
    if (!formData.requisitionTitle.trim()) {
      errors.requisitionTitle = "Requisition title is required";
    }

    // Validate items
    if (!formData.items || formData.items.length === 0) {
      errors.items = "At least one item is required";
    } else {
      const itemErrors = {};
      let hasValidItem = false;

      formData.items.forEach((item, index) => {
        const itemError = {};

        // if (!item.title.trim()) {
        //   itemError.title = "Item title is required";
        // }
        if (!item.quantityRequested || item.quantityRequested <= 0) {
          itemError.quantityRequested = "Quantity must be greater than 0";
        }

        if(!item?.quantityApproved && selectedRequisition?.status === "Approved") {
          itemError.quantityApproved = "This field is required.";
        }

        if(!item?.approvedCost && selectedRequisition?.status === "Approved") {
          itemError.approvedCost = "This field is required.";
        }

        if(!item?.approvedVendor && selectedRequisition?.status === "Approved") {
          itemError.approvedVendor = "This field is required.";
        }
        // if (!item.estimatedCost || item.estimatedCost <= 0) {
        //   itemError.estimatedCost = "Estimated cost must be greater than 0";
        // }
        if (!item.vendor) {
          itemError.vendor = "Vendor is required";
        }
        // if (!item.category) {
        //   itemError.category = "Category is required";
        // }
        if (!item.type) {
          itemError.type = "Type is required";
        }

        if (Object.keys(itemError).length > 0) {
          itemErrors[index] = itemError;
        } else {
          hasValidItem = true;
        }
      });

      if (Object.keys(itemErrors).length > 0) {
        errors.itemErrors = itemErrors;
      }

      if (!hasValidItem) {
        errors.items = "At least one complete item is required";
      }
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
      const submitData = {
        ...formData,
        documents: processDocuments(formData.documents),
        requestedBy: loginUser?.user?._id, // Manually added as specified
        items: formData.items.map((item) => ({
          ...item,
          quantityApproved: Number.parseInt(item.quantityApproved),
          approvedCost: Number.parseInt(item.approvedCost),
          vendor: item.vendor?.value,
          approvedVendor: item.approvedVendor?.value,
          //   category: item.category?.value,
          type: item.type?.value,
          quantityRequested: Number.parseInt(item.quantityRequested),
          estimatedCost: Number.parseFloat(item.estimatedCost),
          documents: processDocuments(item.documents),
        })),
      };

      if (isEditMode && selectedRequisition) {
        await updateRequisition({
          id: selectedRequisition._id,
          data: submitData,
        }).unwrap();
      } else {
        await createRequisition(submitData).unwrap();
      }

      setIsModalOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  return (
    <Modal open={open} onClose={onClose} className="max-w-3xl">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {isEditMode ? "Edit Requisition" : "Create New Requisition"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}

          <FloatingInput
            label="Requisition Title"
            value={formData.requisitionTitle}
            onChange={(e) =>
              handleInputChange("requisitionTitle", e.target.value)
            }
            error={formErrors.requisitionTitle}
            required
          />

          <FloatingTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={2}
          />

          {/* Items Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>

            {formErrors.items && (
              <p className="text-sm text-red-600">{formErrors.items}</p>
            )}

            {formData.items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Item {index + 1}{" "}
                    {item?.type ? (
                      <span className="text-gray-500">({item.type.label})</span>
                    ) : null}
                  </h4>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className={`grid grid-cols-1 ${isEditMode ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
                  {/* <FloatingInput
                      label="Item Title"
                      value={item.title}
                      onChange={(e) =>
                        handleItemChange(index, "title", e.target.value)
                      }
                      error={formErrors.itemErrors?.[index]?.title}
                      required
                    /> */}

                  {!isEditMode && (
                    <SelectInput
                      label="Type"
                      options={typeOptions || []}
                      value={item.type}
                      onChange={(selectedOption) =>
                        handleItemChange(index, "type", selectedOption)
                      }
                      error={formErrors.itemErrors?.[index]?.type}
                      className={`${isEditMode ? "cursor-not-allowed" : ""}`}
                      disabled={
                        isEditMode && selectedRequisition?.status === "Approved"
                      }
                    />
                  )}

                  <SelectInput
                    label="Vendor"
                    options={vendorOptions || []}
                    value={item.vendor}
                    onChange={(selectedOption) =>
                      handleItemChange(index, "vendor", selectedOption)
                    }
                    error={formErrors.itemErrors?.[index]?.vendor}
                  />
                  {/* <SelectInput
                      label="Category"
                      options={categoryOptions}
                      value={item.category}
                      onChange={(selectedOption) =>
                        handleItemChange(index, "category", selectedOption)
                      }
                      error={formErrors.itemErrors?.[index]?.category}
                    /> */}

                  <FloatingInput
                    label="Quantity Requested"
                    type="number"
                    value={item.quantityRequested}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantityRequested",
                        e.target.value
                      )
                    }
                    error={formErrors.itemErrors?.[index]?.quantityRequested}
                    required
                  />
                  <FloatingInput
                    label="Estimated Cost"
                    type="number"
                    value={item.estimatedCost}
                    onChange={(e) =>
                      handleItemChange(index, "estimatedCost", e.target.value)
                    }
                    error={formErrors.itemErrors?.[index]?.estimatedCost}
                    //   required
                  />
                </div>

                {selectedRequisition?.status === "Approved" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1 md:col-span-3 flex items-center gap-2 py-3">
                      <div className="border-b border-blue-500 w-full"></div>
                      <div className="text-xs font-semibold text-blue-500 min-w-32 text-center">
                        Approvement Details
                      </div>
                      <div className="border-b border-blue-500 w-full"></div>
                    </div>

                    <SelectInput
                      className="mt-[-2px]"
                      label="Approved Vendor"
                      options={vendorOptions || []}
                      value={item.approvedVendor}
                      onChange={(selectedOption) =>
                        handleItemChange(
                          index,
                          "approvedVendor",
                          selectedOption
                        )
                      }
                      required
                      error={formErrors.itemErrors?.[index]?.approvedVendor}
                    />

                    <FloatingInput
                      label="Quantity Approved"
                      type="number"
                      value={item.quantityApproved}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantityApproved",
                          e.target.value
                        )
                      }
                      error={formErrors.itemErrors?.[index]?.quantityApproved}
                      required
                    />

                    <FloatingInput
                      label="Approved Cost"
                      type="number"
                      value={item.approvedCost}
                      onChange={(e) =>
                        handleItemChange(index, "approvedCost", e.target.value)
                      }
                      error={formErrors.itemErrors?.[index]?.approvedCost}
                      required
                    />

                    
                  </div>
                )}

                <FileUpload
                  label="Item Documents"
                  value={item.documents}
                  onChange={(files) =>
                    handleItemChange(index, "documents", files)
                  }
                  isMultiFile={true}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onFileClick={(file) => {
                    if (file?.fileUrl) {
                      window.open(file.fileUrl, "_blank");
                    } else {
                      console.warn("No file URL available.");
                    }
                  }}
                />
              </div>
            ))}
            {!isEditMode && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Plus size={16} />
                  Add Item
                </Button>
              </div>
            )}
          </div>

          {/* Documents */}
          <p className="mt-4 text-sm font-semibold text-center text-gray-600">
            Upload any relevant documents for the requisition (e.g. quotes,
            specifications).
          </p>
          <FileUpload
            label="Requisition Documents"
            value={formData.documents}
            onChange={(files) => handleInputChange("documents", files)}
            isMultiFile={true}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onFileClick={(file) => {
              if (file?.fileUrl) {
                window.open(file.fileUrl, "_blank");
              } else {
                console.warn("No file URL available.");
              }
            }}
          />

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? "Saving..."
                : isEditMode
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RequisitionCreateAndUpdateModal;
