import { FloatingInput } from "@/component/FloatiingInput";
import { TitleDivider } from "@/component/TitleDevider";
import verified from "@/assets/verified.png";
import notVerified from "@/assets/notverified.png";
import {
  CalendarIcon,
  FileText,
  HashIcon,
  HeartPulse,
  KeyIcon,
  Loader2,
  MailIcon,
  PhoneIcon,
  ShieldCheck,
  ShieldOff,
  UserCircleIcon,
  UserIcon,
} from "lucide-react";
import { bloodGroupOptions, genderOptions, religionOptions } from "./const";
import Tooltip from "@/component/Tooltip";
import { toast } from "@/component/Toast";
import {
  useSendOtpMutation,
  useVerifyEmailOtpMutation,
} from "@/redux/features/auth/authApiSlice";
import SubmitOtpModal from "./SubmitOtpModal";
import { useState } from "react";
import { useUpdateEmployeeMutation } from "@/redux/features/admin/employee/employeeApiSlice";
import ConfirmDialog from "@/component/ConfirmDialog";
import FileUploadInput from "@/component/FileUploadInput";
import { getNestedValue } from "@/utils/getAndSetNestedValues";
import LazyImage from "@/utils/LazyImage";
import SelectInput from "@/component/select/SelectInput";

const PersonalInformation = ({
  formData,
  handleChange,
  errors,
  employeeData,
  isEditMode,
  refetchEmployee,
  isAdmin,
  setErrors,
  setFormData,
}) => {
  const [openVerifyModal, setOpenVerifyModal] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNidDialogOpen, setIsNidDialogOpen] = useState(false);

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] =
    useVerifyEmailOtpMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const handleOpenVerifyModal = async () => {
    try {
      const response = await sendOtp({
        email: employeeData?.email,
      }).unwrap();
      // console.log(response);

      toast.success(
        "OTP Sent",
        response?.data?.message || "OTP sent successfully",
        3000
      );
      setOpenVerifyModal(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Error", "Failed to send OTP. Please try again later.", 3000);
      // console.log(error);
      return;
    }
  };

  const validatePhone = () => {
    const newErrors = {};
    // Address validation
    if (!formData.phone)
      newErrors["phone"] = "Phone number is required for verification";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNid = () => {
    const newErrors = {};
    // Address validation
    if (!formData.nidPhotoUrl)
      newErrors["nidPhotoUrl"] = "NID Photo is required for verification";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verification functionalities

  const handleUpdateClick = () => {
    if (!validatePhone()) {
      // toast.error("Validation Error", "Please add the phone number before verifying.");
      return false;
    }
    setIsDialogOpen(true);
  };

  const handleUpdateNidClick = () => {
    if (!validateNid()) {
      // toast.error("Validation Error", "Please add the phone number before verifying.");
      return false;
    }
    setIsNidDialogOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      const response = await updateEmployee({
        id: employeeData?._id,
        isPhoneVerified: true,
        phone: formData.phone, // Ensure the phone number is included in the update
      }).unwrap();
      toast.success(
        "Success",
        response?.data?.message || "Phone verified successfully!"
      );

      await refetchEmployee();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to verify employee phone number."
      );
    }
  };

  const handleNidConfirmUpdate = async () => {
    try {
      const response = await updateEmployee({
        id: employeeData?._id,
        isNidVerified: true,
        nid: formData.nid, // Ensure the NID is included in the update
        nidPhotoUrl: formData.nidPhotoUrl, // Ensure the NID photo URL
      }).unwrap();
      toast.success(
        "Success",
        response?.data?.message ||
          response?.message ||
          "NID verified successfully!"
      );
      // console.log(response);

      await refetchEmployee();
      setIsNidDialogOpen(false);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to verify employee national ID."
      );
    }
  };

  const handleCancelUpdate = () => {
    setIsDialogOpen(false);
  };

  const handleNidCancelUpdate = () => {
    setIsNidDialogOpen(false);
  };

  return (
    <div>
      <TitleDivider
        color="primary"
        className={"text-gray-900"}
        title="Personal Information"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-black">
        <FloatingInput
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          icon={<UserIcon className="h-5 w-5" />}
          required={true}
        />
        <FloatingInput
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          icon={<UserCircleIcon className="h-5 w-5" />}
          required={true}
        />
        <FloatingInput
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          error={errors.dateOfBirth}
          icon={<CalendarIcon className="h-5 w-5" />}
          required={!isAdmin}
        />
        {/* Gender: use SelectInput */}
        <SelectInput
          label="Gender"
          name="gender"
          value={
            genderOptions.find((opt) => opt.value === formData.gender) || null
          }
          onChange={(option) => {
            handleChange({
              target: { name: "gender", value: option?.value || "" },
            });
          }}
          error={errors.gender}
          options={genderOptions}
          required={!isAdmin}
          icon={<UserIcon className="h-5 w-5" />}
        />
        {/* Religion: use SelectInput */}
        <SelectInput
          label="Religion"
          name="religion"
          value={
            religionOptions.find((opt) => opt.value === formData.religion) ||
            null
          }
          onChange={(option) => {
            handleChange({
              target: { name: "religion", value: option?.value || "" },
            });
          }}
          error={errors.religion}
          options={religionOptions}
          required={!isAdmin}
          icon={<UserIcon className="h-5 w-5" />}
        />
        <div className="flex gap-2 items-center">
          <FloatingInput
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={<PhoneIcon className="h-5 w-5" />}
            required={!isAdmin}
          />
          {isEditMode && isAdmin && (
            <>
              {employeeData?.isPhoneVerified && employeeData?.phone ? (
                <Tooltip text={"Phone Number Verified"} position="left">
                  {/* <ShieldCheck
                    className="text-white bg-green-500 rounded-md p-1 hover:bg-green-600 transition-colors duration-200"
                    size={40}
                  /> */}
                  {/* <img src={verified} alt="Verified" className="h-8 w-8" /> */}
                  <LazyImage src={verified} alt="Logo" imgClass={"h-8 w-8"} />
                </Tooltip>
              ) : (
                <Tooltip text={"Verify This Phone Number"} position="left">
                  <button
                    type="button"
                    onClick={handleUpdateClick}
                    className=""
                  >
                    {isUpdating ? (
                      <Loader2
                        size={18}
                        className="animate-spin text-primary"
                      />
                    ) : (
                      // <ShieldOff size={27} />
                      <LazyImage
                        src={notVerified}
                        alt="Logo"
                        imgClass={"h-8 w-8"}
                      />
                    )}
                  </button>
                </Tooltip>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <FloatingInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<MailIcon className="h-5 w-5" />}
            disabled={isEditMode}
            required={true}
          />

          {isEditMode && !isAdmin && (
            <>
              {employeeData?.isEmailVerified ? (
                <Tooltip text={"Email Verified"} position="top">
                  <LazyImage src={verified} alt="Logo" imgClass={"h-8 w-8"} />
                </Tooltip>
              ) : (
                <Tooltip text={"Verify This Email"} position="top">
                  <button
                    type="button"
                    onClick={handleOpenVerifyModal}
                    className=""
                  >
                    {isSendingOtp ? (
                      <Loader2
                        size={18}
                        className="animate-spin text-primary"
                      />
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
            </>
          )}
        </div>

        {!isEditMode && (
          <FloatingInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<KeyIcon className="h-5 w-5" />}
            required={true}
            // required={!isEditMode}
          />
        )}

        <FloatingInput
          label="Birth Certificate No"
          name="birthCertificateNo"
          type="number"
          value={formData.birthCertificateNo}
          onChange={handleChange}
          error={errors.birthCertificateNo}
          icon={<HashIcon className="h-5 w-5" />}
        />

        <FloatingInput
          label="NID"
          name="nid"
          type="number"
          value={formData.nid}
          onChange={handleChange}
          error={errors.nid}
          icon={<HashIcon className="h-5 w-5" />}
          required={!isAdmin}
        />

        <div className="flex gap-2 items-center">
          <FileUploadInput
            label="Upload NID"
            targetPath="nidPhotoUrl" // Top-level field
            icon={<FileText className="h-5 w-5" />}
            setFormData={setFormData}
            setErrors={setErrors}
            formData={formData}
            error={getNestedValue(errors, "nidPhotoUrl")}
            accept="image/*,.pdf"
            multiple={false}
            disabled={formData.isNidVerified}
            required={!isAdmin}
          />

          {isEditMode && isAdmin && (
            <>
              {employeeData?.isNidVerified ? (
                <Tooltip text={"NID Verified"} position="left">
                  <LazyImage src={verified} alt="Logo" imgClass={"h-8 w-8"} />
                </Tooltip>
              ) : (
                <Tooltip text={"Verify This NID"} position="left">
                  <button
                    type="button"
                    onClick={handleUpdateNidClick}
                    className=""
                  >
                    {isUpdating ? (
                      <Loader2
                        size={18}
                        className="animate-spin text-primary"
                      />
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
            </>
          )}
        </div>

        {/* Blood Group: use SelectInput */}
        <SelectInput
          label="Blood Group"
          name="bloodGroup"
          value={
            bloodGroupOptions.find(
              (opt) => opt.value === formData.bloodGroup
            ) || null
          }
          onChange={(option) => {
            handleChange({
              target: { name: "bloodGroup", value: option?.value || "" },
            });
          }}
          error={errors.bloodGroup}
          options={bloodGroupOptions}
          icon={<HeartPulse className="h-5 w-5" />}
        />
      </div>

      <SubmitOtpModal
        isOpen={openVerifyModal}
        onClose={() => setOpenVerifyModal(false)}
        userEmail={employeeData?.email}
        onSubmitOtp={verifyOtp}
        isLoading={isVerifyingOtp}
        refetch={refetchEmployee}
        onResendOtp={sendOtp}
        sendingOtpLoader={isSendingOtp}
      />

      <ConfirmDialog
        open={isDialogOpen}
        title="Verify Phone Number"
        message={`Are you sure you want to verify this phone number? This action cannot be undone.`}
        confirmText="Verify"
        cancelText="Cancel"
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
      />

      <ConfirmDialog
        open={isNidDialogOpen}
        title="Verify National ID"
        message={`Are you sure you want to verify this National ID? This action cannot be undone.`}
        confirmText="Verify"
        cancelText="Cancel"
        onConfirm={handleNidConfirmUpdate}
        onCancel={handleNidCancelUpdate}
      />
    </div>
  );
};

export default PersonalInformation;
