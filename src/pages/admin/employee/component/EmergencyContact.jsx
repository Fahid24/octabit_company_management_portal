import { FloatingInput } from "@/component/FloatiingInput";
import { TitleDivider } from "@/component/TitleDevider";
import {
  FileText,
  HashIcon,
  HeartIcon,
  Loader2,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheck,
  ShieldOff,
  UserIcon,
} from "lucide-react";
import { occupations } from "./const";
import FileUploadInput from "@/component/FileUploadInput";
import { getNestedValue, setNestedValue } from "@/utils/getAndSetNestedValues";
import ConfirmDialog from "@/component/ConfirmDialog";
import { useState } from "react";
import { useUpdateEmployeeMutation } from "@/redux/features/admin/employee/employeeApiSlice";
import { toast } from "@/component/Toast";
import Tooltip from "@/component/Tooltip";
import LazyImage from "@/utils/LazyImage";
import verified from "@/assets/verified.png";
import notVerified from "@/assets/notverified.png";
import SelectInput from "@/component/select/SelectInput";

const EmergencyContact = ({
  formData,
  setFormData,
  errors,
  handleChange,
  setErrors,
  employeeData,
  refetchEmployee,
  isEditMode,
  isAdmin,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const validateForm = () => {
    const newErrors = {};
    // Emergency Contact validation
    if (!formData.emergencyContact.name)
      newErrors["emergencyContact.name"] = "Name is required";
    if (!formData.emergencyContact.relationship)
      newErrors["emergencyContact.relationship"] = "Relationship is required";
    if (!formData.emergencyContact.phonePrimary)
      newErrors["emergencyContact.phonePrimary"] = "Primary Phone is required";
    if (!formData.emergencyContact.address)
      newErrors["emergencyContact.address"] = "Address is required";
    if (!formData.emergencyContact.nid)
      newErrors["emergencyContact.nid"] = "NID is required";
    if (!formData.emergencyContact.nidPhotoUrl)
      newErrors["emergencyContact.nidPhotoUrl"] = "NID Photo is required";

    if (!formData.emergencyContact.nidPhotoUrl) {
      setNestedValue(
        newErrors,
        "emergencyContact.nidPhotoUrl",
        "NID Photo or PDF is required"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateClick = () => {
    if (!validateForm()) {
      toast.error(
        "Validation Error",
        "Please fill all required fields before verifying."
      );
      return;
    }

    setIsDialogOpen(true); // open the confirmation modal
  };

  const handleConfirmUpdate = async () => {
    try {
      await updateEmployee({
        id: employeeData?._id,
        isEmergencyContactVerified: true,
        emergencyContact: {
          name: formData.emergencyContact.name || "",
          relationship: formData.emergencyContact.relationship || "",
          email: formData.emergencyContact.email || "",
          phonePrimary: formData.emergencyContact.phonePrimary || "",
          phoneAlternate: formData.emergencyContact.phoneAlternate || "",
          address: formData.emergencyContact.address || "",
          nid: formData.emergencyContact.nid || "",
          nidPhotoUrl: formData.emergencyContact.nidPhotoUrl || "",
          businessName: formData.emergencyContact.businessName || "",
          occupation: formData.emergencyContact.occupation || "",
        },
      }).unwrap();
      toast.success(
        "Success",
        "Employee emergency contact verified successfully!"
      );

      await refetchEmployee();

      // cleanup
      setIsDialogOpen(false);
      //   setItemToUpdate(null);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to verify employee emergency contact."
      );
    }
  };

  const handleCancelUpdate = () => {
    setIsDialogOpen(false);
    // setItemToUpdate(null);
  };
  return (
    <div>
      <div className="relative">
        <TitleDivider
          color="primary"
          className={"text-gray-900"}
          title="Emergency Contact"
        />
        {isEditMode && isAdmin && (
          <div className="absolute top-10 right-0 inline">
            {employeeData?.isEmergencyContactVerified ? (
              <Tooltip text={"Emergency Contact Verified."} position="left">
                <LazyImage src={verified} alt="Logo" imgClass={"h-8 w-8"} />
              </Tooltip>
            ) : (
              <Tooltip text={"Verify This Emergency Contact"} position="left">
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
          label="Name"
          name="emergencyContact.name"
          value={formData.emergencyContact.name}
          onChange={handleChange}
          error={errors["emergencyContact.name"]}
          icon={<UserIcon className="h-5 w-5" />}
          required={!isAdmin}
        />
        <FloatingInput
          label="Relationship"
          name="emergencyContact.relationship"
          value={formData.emergencyContact.relationship}
          onChange={handleChange}
          error={errors["emergencyContact.relationship"]}
          icon={<HeartIcon className="h-5 w-5" />}
          required={!isAdmin}
        />
        <FloatingInput
          label="Primary Phone"
          name="emergencyContact.phonePrimary"
          type="tel"
          value={formData.emergencyContact.phonePrimary}
          onChange={handleChange}
          error={errors["emergencyContact.phonePrimary"]}
          icon={<PhoneIcon className="h-5 w-5" />}
          required={!isAdmin}
        />
        <FloatingInput
          label="Alternate Phone"
          name="emergencyContact.phoneAlternate"
          type="tel"
          value={formData.emergencyContact.phoneAlternate}
          onChange={handleChange}
          error={errors["emergencyContact.phoneAlternate"]}
          icon={<PhoneIcon className="h-5 w-5" />}
        />
        <FloatingInput
          label="Email"
          name="emergencyContact.email"
          type="email"
          value={formData.emergencyContact.email}
          onChange={handleChange}
          error={errors["emergencyContact.email"]}
          icon={<MailIcon className="h-5 w-5" />}
        />
        <FloatingInput
          label="Address"
          name="emergencyContact.address"
          value={formData.emergencyContact.address}
          onChange={handleChange}
          error={errors["emergencyContact.address"]}
          icon={<MapPinIcon className="h-5 w-5" />}
          required={!isAdmin}
        />
        <SelectInput
          label="Occupation"
          isMulti={false}
          value={
            occupations.find(
              (opt) => opt.value === formData.emergencyContact.occupation
            ) || null
          }
          onChange={(selected) =>
            setFormData({
              ...formData,
              emergencyContact: {
                ...formData.emergencyContact,
                occupation: selected?.value || "",
              },
            })
          }
          options={occupations}
          error={errors["emergencyContact.occupation"]}
          className="z-10"
        />
        <FloatingInput
          label="Business / Organization Name"
          name="emergencyContact.businessName"
          value={formData.emergencyContact.businessName}
          onChange={handleChange}
          error={errors["emergencyContact.businessName"]}
          icon={<MapPinIcon className="h-5 w-5" />}
        />
        <FloatingInput
          label="NID"
          name="emergencyContact.nid"
          value={formData.emergencyContact.nid}
          onChange={handleChange}
          error={errors["emergencyContact.nid"]}
          icon={<HashIcon className="h-5 w-5" />}
          required={!isAdmin}
        />
        <FileUploadInput
          label="Upload NID"
          targetPath="emergencyContact.nidPhotoUrl"
          icon={<FileText className="h-5 w-5" />}
          setFormData={setFormData}
          setErrors={setErrors}
          formData={formData}
          accept="image/*,.pdf"
          multiple={false}
          disabled={employeeData?.isEmergencyContactVerified && !isAdmin}
          error={getNestedValue(errors, "emergencyContact.nidPhotoUrl")}
          required={!isAdmin}
        />
      </div>
      <ConfirmDialog
        open={isDialogOpen}
        title="Verify Emergency Contact"
        message={`Are you sure you want to verify this emergency contact? This action cannot be undone.`}
        confirmText="Verify"
        cancelText="Cancel"
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
      />
    </div>
  );
};

export default EmergencyContact;
