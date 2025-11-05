import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import Modal from "@/component/Modal";
import SelectInput from "@/component/select/SelectInput";
import { useCreateBulkProductsMutation } from "@/redux/features/product/productApiSlice";
import { useValidateRequisitionByIdQuery } from "@/redux/features/requisition/requisitionApiSlice";
import { useGetTypesQuery } from "@/redux/features/type/typeApiSlice";
import { useMemo, useState } from "react";
import BulkProductFileUpload from "./BulkProductFileUpload";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "@/component/Toast";
import { useAddConsumableProductMutation } from "@/redux/features/inventory/inventoryApiSlice";

const BulkProductCreateModal = ({ open, onClose, refetch }) => {
  const [step, setStep] = useState(1); // 1 = Initial form, 2 = Product details form
  const [formData, setFormData] = useState({
    type: null,
    quantity: "",
    requisitionId: "",
  });
  console.log(formData);
  const [products, setProducts] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [productErrors, setProductErrors] = useState({});
  const [isValidatingRequisition, setIsValidatingRequisition] = useState(false);
  const [shouldValidateRequisition, setShouldValidateRequisition] =
    useState(true);
  const [isAddProductByRequisition, setIsAddProductByRequisition] =
    useState(false);
  const [verifiedRequisitionData, setVerifiedRequisitionData] = useState(null);
  const [addSameInfoToAll, setAddSameInfoToAll] = useState(false);

  const loginUser = useSelector((state) => state.userSlice.user);

  const [createBulkProducts, { isLoading: isCreating }] =
    useCreateBulkProductsMutation();
  const [createConsumableProducts, { isLoading: isCreatingConsumableProduct }] =
    useAddConsumableProductMutation();

  // Only query requisition when user clicks Next button and requisition ID exists
  const { data: requisitionData, refetch: refetchRequisition } =
    useValidateRequisitionByIdQuery(formData.requisitionId?.trim() || "", {
      skip: shouldValidateRequisition, // Skip initial fetch, we'll manually trigger it
    });

  const { data: typesData } = useGetTypesQuery({
    page: 1,
    limit: 1000000,
    status: "Active",
  });

  const typeOptions = useMemo(() => {
    const requisitionTypes =
      verifiedRequisitionData?.items?.map((item) => ({
        value: item?.type?._id,
        label: `${item?.type?.name} (Max: ${
          item?.quantityApproved - item?.addedToInventory
        })`,
        trackingMode: item?.type?.trackingMode,
        maxQuantity: item?.quantityApproved - item?.addedToInventory,
      })) || [];

    const allTypes =
      typesData?.data?.map((type) => ({
        value: type._id,
        label: type.name,
        trackingMode: type.trackingMode,
      })) || [];

    return verifiedRequisitionData ? requisitionTypes : allTypes;
  }, [typesData, verifiedRequisitionData]);

  // Initialize products array when quantity changes
  const initializeProducts = (quantity) => {
    const count = parseInt(quantity) || 0;
    const newProducts = Array.from({ length: count }, () => ({
      name: "",
      description: "",
      documents: [],
    }));
    setProducts(newProducts);
    setProductErrors({});
    setAddSameInfoToAll(false); // Reset checkbox when reinitializing
  };

  // Handle initial form changes
  const handleFormChange = (field, value) => {
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

    // Initialize products when quantity changes
    if (field === "quantity" && value) {
      initializeProducts(value);
    }
  };

  // Handle product field changes
  const handleProductChange = (index, field, value) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });

    // Clear product error when user starts typing
    if (productErrors[index]?.[field]) {
      setProductErrors((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          [field]: "",
        },
      }));
    }

    // If "add same info to all" is checked and this is the first product, update all other products
    if (addSameInfoToAll && index === 0) {
      setProducts((prev) => {
        const updated = [...prev];
        for (let i = 1; i < updated.length; i++) {
          updated[i] = {
            ...updated[i],
            [field]: value,
          };
        }
        return updated;
      });
    }
  };

  // Handle checkbox change for "add same info to all"
  const handleAddSameInfoToAllChange = (checked) => {
    setAddSameInfoToAll(checked);

    if (checked && products.length > 0) {
      // Copy first product's data to all other products
      const firstProduct = products[0];
      setProducts((prev) => {
        const updated = [...prev];
        for (let i = 1; i < updated.length; i++) {
          updated[i] = {
            ...updated[i],
            name: firstProduct.name,
            description: firstProduct.description,
            price: firstProduct.price,
            documents: [...(firstProduct.documents || [])],
          };
        }
        return updated;
      });
    } else if (!checked && products.length > 0) {
      // Clear data from all products except the first one
      setProducts((prev) => {
        const updated = [...prev];
        for (let i = 1; i < updated.length; i++) {
          updated[i] = {
            name: "",
            description: "",
            price: "",
            documents: [],
          };
        }
        return updated;
      });

      // Clear errors for all products except the first one
      setProductErrors((prev) => {
        const updated = { ...prev };
        for (let i = 1; i < products.length; i++) {
          delete updated[i];
        }
        return updated;
      });
    }
  };

  const validateRequisition = async () => {
    const errors = {};

    if (!formData.requisitionId?.trim()) {
      errors.requisitionId = "Requisition ID is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVerifyRequisition = async () => {
    const isValid = await validateRequisition();
    if (!isValid) {
      return;
    }

    try {
      setIsValidatingRequisition(true);
      await setShouldValidateRequisition(false);
      const result = await refetchRequisition();
      console.log(result);
      setVerifiedRequisitionData(result?.data?.data);
      if (!result.data?.success) {
        toast.error(
          "Failed",
          result?.error?.data?.message ||
            "Invalid requisition ID. Please check and try again."
        );
      } else if (result.data?.data?.status !== "Approved") {
        toast.info("Not Approved", "Requisition is pending approval.");
      } else {
        setStep(step + 1);
        setFormData((prev) => ({
          ...prev,
          type: null,
          quantity: "",
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsValidatingRequisition(false);
      setShouldValidateRequisition(true);
    }
  };

  // Validate initial form
  const validateInitialForm = async () => {
    const errors = {};

    if (!formData.type) {
      errors.type = "Type is required";
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      errors.quantity = "Quantity must be greater than 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate products form
  const validateProductsForm = () => {
    const errors = {};

    products.forEach((product, index) => {
      if (!product.name?.trim()) {
        errors[index] = {
          ...errors[index],
          name: "Product name is required",
        };
      }
      if (!product.price?.trim()) {
        errors[index] = {
          ...errors[index],
          price: "Product price is required",
        };
      }

      if (!product.description?.trim()) {
        errors[index] = {
          ...errors[index],
          description: "Product description is required",
        };
      }
    });

    setProductErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNext = async () => {
    const isValid = await validateInitialForm();
    if (isValid) {
      if (formData?.type?.trackingMode === "CONSUMABLE") {
        handleCreateConsumableProducts();
      } else {
        initializeProducts(formData.quantity);
        setStep(step + 1);
      }
    }
  };

  // Handle back step
  const handleBack = () => {
    setStep(step - 1);
    setProductErrors({});
  };

  // Process documents for submission
  const processDocuments = (documents) => {
    if (!documents || documents.length === 0) return [];

    return documents.map((doc) => {
      if (typeof doc === "string") {
        return doc; // Already a URL
      }
      return doc.url || doc; // Extract URL if it's an object
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateProductsForm()) {
      return;
    }

    try {
      const bulkData = {
        type: formData.type.value,
        quantity: parseInt(formData.quantity),
        requisitionId: formData.requisitionId.trim(),
        products: products.map((product) => ({
          name: product.name.trim(),
          price: product.price?.trim() || 0,
          description: product.description?.trim() || "",
          documents: processDocuments(product.documents),
        })),
        actionBy: loginUser?.user?._id,
      };
      console.log(bulkData);

      await createBulkProducts(bulkData).unwrap();
      toast.success("Bulk products created successfully!");

      // Reset form and close modal
      handleClose();
      refetch();
    } catch (error) {
      console.error("Error creating bulk products:", error);
      // Handle API errors
      if (error.data?.message) {
        setFormErrors({ submit: error.data.message });
      }
    }
  };

  const handleCreateConsumableProducts = async () => {
    try {
      const consumableData = {
        quantity: parseInt(formData.quantity),
        userId: loginUser?.user?._id,
        requisitionId: formData.requisitionId.trim(),
      };
      await createConsumableProducts({
        typeId: formData?.type?.value,
        body: consumableData,
      }).unwrap();
      toast.success("Consumable products created successfully!");

      // Reset form and close modal
      handleClose();
      // refetch();
    } catch (error) {
      console.error("Error creating consumable products:", error);
      // Handle API errors
      if (error.data?.message) {
        setFormErrors({ submit: error.data.message });
      }
    }
  };

  // Handle modal close
  const handleClose = () => {
    setStep(1);
    setFormData({
      type: null,
      quantity: "",
      requisitionId: "",
    });
    setProducts([]);
    setFormErrors({});
    setProductErrors({});
    setIsValidatingRequisition(false);
    setShouldValidateRequisition(true);
    setIsAddProductByRequisition(false);
    setAddSameInfoToAll(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className={`${step === 3 ? "max-w-4xl" : "max-w-xl"} `}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {formData?.type?.trackingMode === "CONSUMABLE"
            ? "Add Product to Inventory"
            : "Create Bulk Products"}
        </h2>

        {step === 1 && (
          <>
            {/* Initial Form */}
            <div className="space-y-6">
              <h1 className="font-semibold text-center ">
                Would you like to add this product using a requisition ID, or
                add it directly without one?
              </h1>

              {isAddProductByRequisition && (
                <>
                  <FloatingInput
                    label="Requisition ID"
                    value={formData.requisitionId}
                    onChange={(e) =>
                      handleFormChange("requisitionId", e.target.value)
                    }
                    error={formErrors.requisitionId}
                    required
                  />

                  <div className="flex gap-3 w-full justify-end">
                    <Button
                      onClick={() => setIsAddProductByRequisition(false)}
                      size="md"
                      className=""
                      variant="outline"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleVerifyRequisition}
                      size="md"
                      className=""
                    >
                      Verify Requisition ID
                    </Button>
                  </div>
                </>
              )}

              {!isAddProductByRequisition && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setIsAddProductByRequisition(true)}
                    size="md"
                    className=""
                  >
                    With Requisition ID
                  </Button>
                  <Button
                    onClick={() => setStep(step + 1)}
                    size="md"
                    variant="outline"
                    className=""
                  >
                    Without Requisition ID
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Initial Form */}
            <div className="space-y-6">
              <SelectInput
                label="Type"
                options={typeOptions || []}
                value={formData.type}
                onChange={(selectedOption) => {
                  handleFormChange("type", selectedOption);
                  console.log(selectedOption);
                  if (selectedOption?.maxQuantity) {
                    setFormData((prev) => ({
                      ...prev,
                      quantity: selectedOption?.maxQuantity,
                    }));
                  }

                  if (selectedOption?.maxQuantity === 0) {
                    setFormErrors((prev) => ({
                      ...prev,
                      quantity: "You have already added all approved products.",
                    }));
                  }
                }}
                error={formErrors.type}
                required
              />

              <FloatingInput
                disabled={!formData?.type}
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => {
                  if (
                    (formData?.type?.maxQuantity ||
                      formData?.type?.maxQuantity === 0) &&
                    (e.target.value > formData?.type?.maxQuantity ||
                      e.target.value < 0)
                  ) {
                    return;
                  }
                  handleFormChange("quantity", e.target.value);
                }}
                error={formErrors.quantity}
                required
              />

              {/* Submit Error */}
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{formErrors.submit}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft />
                  Back
                </Button>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isValidatingRequisition}
                  >
                    {formData?.type?.trackingMode === "CONSUMABLE" ? (
                      <>
                        {isCreatingConsumableProduct ? "Creating..." : "Create"}
                      </>
                    ) : (
                      <>{isValidatingRequisition ? "Validating..." : "Next"}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Products Form */}
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
                <p className="text-sm text-blue-700">
                  Creating <strong>{formData.quantity}</strong> products of type{" "}
                  <strong>{formData.type?.label}</strong>
                  {formData?.requisitionId ? (
                    <>
                      {" "}
                      for requisition <strong>{formData.requisitionId}.</strong>
                    </>
                  ) : (
                    "."
                  )}
                </p>
              </div>

              {/* Add same info to all checkbox */}
              {products.length > 1 && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="addSameInfoToAll"
                      checked={addSameInfoToAll}
                      onChange={(e) =>
                        handleAddSameInfoToAllChange(e.target.checked)
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label
                      htmlFor="addSameInfoToAll"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Add same info to all items
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-7">
                    {addSameInfoToAll
                      ? "Data from the first product will be automatically copied to all other products."
                      : "Check this to automatically copy the first product's information to all other products."}
                  </p>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Product {index + 1}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FloatingInput
                          label="Product Name"
                          value={product.name}
                          onChange={(e) =>
                            handleProductChange(index, "name", e.target.value)
                          }
                          error={productErrors[index]?.name}
                          required
                        />

                        <FloatingTextarea
                          className="mt-2"
                          label="Specification"
                          value={product.description}
                          onChange={(e) =>
                            handleProductChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          error={productErrors[index]?.description}
                          rows={2}
                        />
                      </div>

                      <div>
                        <FloatingInput
                          label="Product Price"
                          type="number"
                          value={product.price}
                          onChange={(e) =>
                            handleProductChange(index, "price", e.target.value)
                          }
                          error={productErrors[index]?.price}
                          required
                        />

                        <div className="mt-5">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Documents (Optional)
                          </label>
                          <BulkProductFileUpload
                            value={product.documents}
                            onChange={(files) =>
                              handleProductChange(index, "documents", files)
                            }
                            productIndex={index}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Error */}
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{formErrors.submit}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 border border-primary rounded-full p-2 px-3 hover:text-white hover:bg-primary transition-colors"
                >
                  <ArrowLeft />
                  Back
                </button>
                <div className=" flex items-center gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Products"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default BulkProductCreateModal;
