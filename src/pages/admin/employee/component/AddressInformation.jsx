import ConfirmDialog from "@/component/ConfirmDialog";
import { FloatingInput } from "@/component/FloatiingInput";
import { TitleDivider } from "@/component/TitleDevider";
import { toast } from "@/component/Toast";
import Tooltip from "@/component/Tooltip";
import { useUpdateEmployeeMutation } from "@/redux/features/admin/employee/employeeApiSlice";
import LazyImage from "@/utils/LazyImage";
import verified from "@/assets/verified.png";
import notVerified from "@/assets/notverified.png";
import {
  FileText,
  HashIcon,
  Loader2,
  MapPinIcon,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useState } from "react";
import { proofTypeOptions } from "./const";
import FileUploadInput from "@/component/FileUploadInput";
import { getNestedValue, setNestedValue } from "@/utils/getAndSetNestedValues";
import SelectInput from "@/component/select/SelectInput";

const AddressInformation = ({
  formData,
  handleChange,
  errors,
  setErrors,
  employeeData,
  refetchEmployee,
  isEditMode,
  isAdmin,
  setFormData,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    // Address validation
    if (!formData.address.currentAddress)
      newErrors["address.currentAddress"] = "Current Address is required";
    if (!formData.address.district)
      newErrors["address.district"] = "District is required";
    if (!formData.address.subDistrict)
      newErrors["address.subDistrict"] = "Sub District is required";
    if (!formData.address.policeStation)
      newErrors["address.policeStation"] = "Police Station is required";
    if (!formData.address.proofType)
      newErrors["address.proofType"] = "Utility Proof Type is required";

    if (!formData.address.utilityProofUrl) {
      setNestedValue(
        newErrors,
        "address.utilityProofUrl",
        "Utility Proof Document is required"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const handleUpdateClick = () => {
    if (!validateForm()) {
      toast.error(
        "Validation Error",
        "Please fill all required fields before verifying."
      );
      return;
    }
    setIsDialogOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      await updateEmployee({
        id: employeeData?._id,
        isAddressVerified: true,
        flatNo: formData.address.flatNo || "",
        houseNo: formData.address.houseNo || "",
        roadNo: formData.address.roadNo || "",
        village: formData.address.village || "",
        union: formData.address.union || "",
        postOffice: formData.address.postOffice || "",
        policeStation: formData.address.policeStation || "",
        subDistrict: formData.address.subDistrict || "",
        district: formData.address.district || "",
        currentAddress: formData.address.currentAddress || "",
        zip: formData.address.zip || "",
        proofType: formData.address.proofType || "",
        utilityProofUrl: formData.address.utilityProofUrl || "",
      }).unwrap();
      toast.success("Success", "Employee address verified successfully!");

      await refetchEmployee();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to verify employee address."
      );
    }
  };

  const handleCancelUpdate = () => {
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="relative">
        <TitleDivider
          color="primary"
          className={"text-gray-900"}
          title="Address Information"
        />
        {isEditMode && isAdmin && (
          <div className="absolute top-10 right-0 inline">
            {employeeData?.isAddressVerified ? (
              <Tooltip text={"Address Verified"} position="left">
                <LazyImage src={verified} alt="Logo" imgClass={"h-8 w-8"} />
              </Tooltip>
            ) : (
              <Tooltip text={"Verify This Address"} position="left">
                <button type="button" onClick={handleUpdateClick} className="">
                  {isUpdating ? (
                    <Loader2 size={18} className="animate-spin text-primary" />
                  ) : (
                    <LazyImage
                      src={notVerified}
                      alt="Logo"
                      imgClass={"h-8 w-8"}
                    />
                  )}
                </button>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-black">
        <FloatingInput
          label="Flat No"
          name="address.flatNo"
          value={formData.address.flatNo}
          onChange={handleChange}
          error={errors["address.flatNo"]}
          icon={<MapPinIcon className="h-5 w-5" />}
        />
        <FloatingInput
          label="House No"
          name="address.houseNo"
          value={formData.address.houseNo}
          onChange={handleChange}
          error={errors["address.houseNo"]}
          icon={<MapPinIcon className="h-5 w-5" />}
        />
        <FloatingInput
          label="Road No"
          name="address.roadNo"
          value={formData.address.roadNo}
          onChange={handleChange}
          error={errors["address.roadNo"]}
          icon={<MapPinIcon className="h-5 w-5" />}
        />
        <FloatingInput
          label="Village"
          name="address.village"
          value={formData.address.village}
          onChange={handleChange}
          error={errors["address.village"]}
          icon={<MapPinIcon className="h-5 w-5" />}
        />
        <FloatingInput
          label="Union"
          name="address.union"
          value={formData.address.union}
          onChange={handleChange}
          error={errors["address.union"]}
          icon={<MapPinIcon className="h-5 w-5" />}
        />
        <FloatingInput
          label="Post Office"
          name="address.postOffice"
          value={formData.address.postOffice}
          onChange={handleChange}
          error={errors["address.postOffice"]}
          icon={<MapPinIcon className="h-5 w-5" />}
        />
        <FloatingInput
          label="Police Station"
          name="address.policeStation"
          value={formData.address.policeStation}
          onChange={handleChange}
          error={errors["address.policeStation"]}
          icon={<MapPinIcon className="h-5 w-5" />}
          required={!isAdmin}
        />

        <FloatingInput
          label="Sub District"
          name="address.subDistrict"
          value={formData.address.subDistrict}
          onChange={handleChange}
          error={errors["address.subDistrict"]}
          icon={<MapPinIcon className="h-5 w-5" />}
          required={!isAdmin}
        />
        <FloatingInput
          label="District"
          name="address.district"
          value={formData.address.district}
          onChange={handleChange}
          error={errors["address.district"]}
          icon={<MapPinIcon className="h-5 w-5" />}
          required={!isAdmin}
        />

        <FloatingInput
          label="ZIP Code"
          name="address.zip"
          value={formData.address.zip}
          onChange={handleChange}
          error={errors["address.zip"]}
          icon={<HashIcon className="h-5 w-5" />}
        />

        <div className="col-span-1 md:col-span-2">
          <FloatingInput
            label="Current Address (House No, Road No, Area, etc.)"
            name="address.currentAddress"
            value={formData.address.currentAddress}
            onChange={handleChange}
            error={errors["address.currentAddress"]}
            icon={<MapPinIcon className="h-5 w-5" />}
            required={!isAdmin}
          />
        </div>
        {/* <div className="col-span-1 md:col-span-2 border-t border-gray-300 " /> */}

        {/* Proof of Address Type: use SelectInput */}
        <SelectInput
          label="Proof of Address Type"
          name="address.proofType"
          value={
            proofTypeOptions.find(
              (opt) => opt.value === formData.address.proofType
            ) || null
          }
          onChange={(option) => {
            handleChange({
              target: { name: "address.proofType", value: option?.value || "" },
            });
          }}
          error={errors["address.proofType"]}
          options={proofTypeOptions}
          icon={<FileText className="h-5 w-5" />}
        />

        <FileUploadInput
          label="Utility Proof (Upload)"
          targetPath="address.utilityProofUrl"
          icon={<FileText className="h-5 w-5" />}
          setFormData={setFormData}
          setErrors={setErrors}
          formData={formData}
          accept="image/*,.pdf"
          multiple={false}
          disabled={employeeData?.isAddressVerified && !isAdmin}
          error={getNestedValue(errors, "address.utilityProofUrl")}
          required={!isAdmin}
        />
      </div>
      <ConfirmDialog
        open={isDialogOpen}
        title="Verify Address"
        message={`Are you sure you want to verify this address? This action cannot be undone.`}
        confirmText="Verify"
        cancelText="Cancel"
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
      />
    </div>
  );
};

export default AddressInformation;
