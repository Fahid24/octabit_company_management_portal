import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CheckIcon, XIcon } from "lucide-react";
import { toast } from "@/component/Toast";
import Error from "@/component/Error";
import { TitleDivider } from "@/component/TitleDevider";
import Button from "@/component/Button";
import {
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
} from "@/redux/features/admin/employee/employeeApiSlice";
import { useOnboardEmployeeMutation } from "@/redux/features/auth/authApiSlice";
import { useDispatch, useSelector } from "react-redux";

import { CardDescription, CardHeader, CardTitle } from "@/component/card";
import { setUser } from "@/redux/features/auth/authSlice";
import Documents from "./Documents";
import EmergencyContact from "./EmergencyContact";
import FamilyMembers from "./FamilyMembers";
import EmploymentDetails from "./EmploymentDetails";
import AddressInformation from "./AddressInformation";
import PersonalInformation from "./PersonalInformation";
import _ from "lodash";
import BankInformation from "./BankInformation";
import { setNestedValue } from "@/utils/getAndSetNestedValues";
// Filing status options
const filingStatusOptions = [
  { value: "Single", label: "Single" },
  { value: "MarriedJoint", label: "Married Filing Jointly" },
  { value: "MarriedSeparate", label: "Married Filing Separately" },
  { value: "HeadOfHousehold", label: "Head of Household" },
];

// Employment type options
const employmentTypeOptions = [
  { value: "FullTime", label: "Full Time" },
  { value: "PartTime", label: "Part Time" },
  { value: "Seasonal", label: "Seasonal" },
  { value: "Contractual", label: "Contractual" },
  { value: "Intern", label: "Intern" },
];

// Status options
const statusOptions = [
  { value: "Active", label: "Active" },
  // { value: "Inactive", label: "Inactive" },
  { value: "OnLeave", label: "On Leave" },
  { value: "Pending", label: "Pending" },
];

// Gender and Marital Status options
const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "NonBinary", label: "Non-binary" },
  { value: "PreferNotToSay", label: "Prefer not to say" },
];
const maritalStatusOptions = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
  { value: "Separated", label: "Separated" },
];

// Storage unit options
const storageUnitOptions = [
  { value: "MB", label: "MB" },
  { value: "GB", label: "GB" },
];

// Helper to format date as YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return "";
  // Create date object from the UTC string
  const date = new Date(dateString);

  // Get year, month, and day components in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Format as YYYY-MM-DD
  return `${year}-${month}-${day}`;
};

const EmployeeAddEdit = ({ employee }) => {
  const [hasExperience, setHasExperience] = useState(false);
  const loginUser = useSelector((state) => state.userSlice.user);
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  // console.log(id);
  const navigate = useNavigate();
  // console.log(" employee:",employee)

  // If employee data is passed via navigation state, use it
  const employeeFromState = location.state?.employee || employee;
  // console.log(employeeFromState);
  const isEditMode = Boolean(id || employeeFromState);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    religion: "",
    phone: "",
    email: "",
    password: "",
    nid: "",
    nidPhotoUrl: "",
    birthCertificateNo: "",
    address: {
      // address: "",
      // street: "",
      // city: "",
      // state: "",
      flatNo: "",
      houseNo: "",
      roadNo: "",
      village: "",
      union: "",
      postOffice: "",
      policeStation: "",
      subDistrict: "",
      district: "",
      zip: "",
      currentAddress: "",
      proofType: "",
      utilityProofUrl: "",
    },
    role: "Employee",
    status: "Active",
    employmentType: "FullTime",
    workLocation: "Offline",
    startDate: new Date().toISOString().split("T")[0],
    terminationDate: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phonePrimary: "",
      phoneAlternate: "",
      email: "",
      address: "",
      businessName: "",
      occupation: "",
      nid: "",
      nidPhotoUrl: "",
      other: "",
    },
    additionalWithholding: 0,
    department: "",
    documents: [],
    photoUrl: "",
    maritalStatus: "Single",
    familyMembers: [
      { name: "", email: "", phone: "", address: "", relation: "" },
    ],
    prevWorkExperience: [],
    designation: "",
    employeeId: "",
    bloodGroup: "",
    bankInfo: {
      accountNumber: "",
      bankName: "",
      branchName: "",
      routingNumber: "",
    },
    storageLimit: {
      value: null,
      unit: "MB",
    },
    shift: "Day",
  });

  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);

  // API hooks

  // Only fetch by ID if not using state
  const {
    data: employeeData,
    isLoading: employeeLoading,
    error: employeeError,
    refetch: refetchEmployee,
  } = useGetEmployeeByIdQuery(employeeFromState?._id, {
    skip: !employeeFromState,
  });

  // console.log(employeeData);

  const [onboardEmployee, { isLoading: isCreating }] =
    useOnboardEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  // Department options

  // Load employee data in edit mode (from state or API)
  useEffect(() => {
    let data = null;
    if (employeeData) {
      data = employeeData;
    } else if (employeeFromState) {
      data = employeeFromState;
    }
    // console.log(data);
    if (isEditMode && data) {
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        email: data.email || "",
        // ssnLast4: data.ssnLast4 || "",
        password: "",
        // filingStatus: data.filingStatus || "",
        // i9: {
        //   docType: data.i9?.docType || "",
        //   docNumber: data.i9?.docNumber || "",
        //   docExpires: formatDate(data.i9?.docExpires),
        // },
        address: {
          roadNo: data.address?.roadNo || "",
          flatNo: data.address?.flatNo || "",
          houseNo: data.address?.houseNo || "",
          village: data.address?.village || "",
          union: data.address?.union || "",
          postOffice: data.address?.postOffice || "",
          policeStation: data.address?.policeStation || "",
          subDistrict: data.address?.subDistrict || "",
          district: data.address?.district || "",
          currentAddress: data.address?.currentAddress || "",
          proofType: data?.address?.proofType || "",
          utilityProofUrl: data?.address?.utilityProofUrl || "",

          // address: data.address?.address || "",
          // street: data.address?.street || "",
          // city: data.address?.city || "",
          // state: data.address?.state || "",
          zip: data.address?.zip || "",
        },
        role: data.role || "",
        status: data.status || "Pending",
        employmentType: data.employmentType || "",
        workLocation: data.workLocation || "Offline",
        startDate:
          formatDate(data.startDate) || new Date().toISOString().split("T")[0],
        terminationDate: formatDate(data.terminationDate),
        emergencyContact: {
          name: data.emergencyContact?.name || "",
          relationship: data.emergencyContact?.relationship || "",
          phonePrimary: data.emergencyContact?.phonePrimary || "",
          phoneAlternate: data.emergencyContact?.phoneAlternate || "",
          email: data.emergencyContact?.email || "",
          address: data.emergencyContact?.address || "",
          businessName: data.emergencyContact?.businessName || "",
          occupation: data.emergencyContact?.occupation || "",
          nid: data.emergencyContact?.nid || "",
          nidPhotoUrl: data.emergencyContact?.nidPhotoUrl || "",
        },
        additionalWithholding: data.additionalWithholding || 0,
        department: data.department?._id || data.department || "",
        documents: data.documents || [],
        dateOfBirth: formatDate(data.dateOfBirth),
        gender: data.gender || "",
        religion: data.religion || "",
        familyMembers: data.familyMembers || [
          { name: "", email: "", phone: "", address: "", relation: "" },
        ],
        prevWorkExperience: data.prevWorkExperience || [],
        nid: data.nid || "",
        nidPhotoUrl: data.nidPhotoUrl || "",
        birthCertificateNo: data.birthCertificateNo || "",
        designation: data.designation || "",
        employeeId: data.employeeId || "",
        bloodGroup: data.bloodGroup || "",
        bankInfo: {
          accountNumber: data.bankInfo?.accountNumber || "",
          bankName: data.bankInfo?.bankName || "",
          branchName: data.bankInfo?.branchName || "",
          routingNumber: data.bankInfo?.routingNumber || "",
        },
        storageLimit: {
          value: data.storageLimit?.value || null,
          unit: data.storageLimit?.unit || "MB",
        },
        shift: data.shift || "Day",
      });
      setOriginalData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        email: data.email || "",
        nid: data.nid || "",
        nidPhotoUrl: data.nidPhotoUrl || "",
        birthCertificateNo: data.birthCertificateNo || "",
        // ssnLast4: data.ssnLast4 || "",
        // filingStatus: data.filingStatus || "",
        // i9: {
        //   docType: data.i9?.docType || "",
        //   docNumber: data.i9?.docNumber || "",
        //   docExpires: formatDate(data.i9?.docExpires),
        // },
        address: {
          roadNo: data.address?.roadNo || "",
          flatNo: data.address?.flatNo || "",
          houseNo: data.address?.houseNo || "",
          village: data.address?.village || "",
          union: data.address?.union || "",
          postOffice: data.address?.postOffice || "",
          policeStation: data.address?.policeStation || "",
          subDistrict: data.address?.subDistrict || "",
          district: data.address?.district || "",
          currentAddress: data.address?.currentAddress || "",
          proofType: data?.address?.proofType || "",
          utilityProofUrl: data?.address?.utilityProofUrl || "",
          // address: data.address?.address || "",
          // street: data.address?.street || "",
          // city: data.address?.city || "",
          // state: data.address?.state || "",
          zip: data.address?.zip || "",
        },
        role: data.role || "",
        status: data.status || "Pending",
        employmentType: data.employmentType || "",
        workLocation: data.workLocation || "Offline",
        startDate:
          formatDate(data.startDate) || new Date().toISOString().split("T")[0],
        terminationDate: formatDate(data.terminationDate),
        emergencyContact: {
          name: data.emergencyContact?.name || "",
          relationship: data.emergencyContact?.relationship || "",
          phonePrimary: data.emergencyContact?.phonePrimary || "",
          phoneAlternate: data.emergencyContact?.phoneAlternate || "",
          email: data.emergencyContact?.email || "",
          address: data.emergencyContact?.address || "",
          businessName: data.emergencyContact?.businessName || "",
          occupation: data.emergencyContact?.occupation || "",
          nid: data.emergencyContact?.nid || "",
          nidPhotoUrl: data.emergencyContact?.nidPhotoUrl || "",
          other: data.emergencyContact?.other || "",
        },
        additionalWithholding: data.additionalWithholding || 0,
        department: data.department?._id || data.department || "",
        documents: data.documents || [],
        dateOfBirth: formatDate(data.dateOfBirth),
        gender: data.gender || "",
        religion: data.religion || "",
        familyMembers: data.familyMembers || [
          { name: "", email: "", phone: "", address: "", relation: "" },
        ],
        prevWorkExperience: data.prevWorkExperience || [],
        designation: data.designation || "",
        employeeId: data.employeeId || "",
        bloodGroup: data.bloodGroup || "",
        bankInfo: {
          accountNumber: data.bankInfo?.accountNumber || "",
          bankName: data.bankInfo?.bankName || "",
          branchName: data.bankInfo?.branchName || "",
          routingNumber: data.bankInfo?.routingNumber || "",
        },
        storageLimit: {
          value: data.storageLimit?.value || null,
          unit: data.storageLimit?.unit || "MB",
        },
        shift: data.shift || "Day",
      });
    }
  }, [employeeFromState, employeeData, isEditMode]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert storage value to number
    const processedValue =
      name === "storageLimit.value" ? (value ? Number(value) : null) : value;

    // Handle nested objects
    if (name.includes(".")) {
      const keys = name.split(".");
      const lastKey = keys.pop();

      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }
        current[lastKey] = processedValue;
        return newData;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateExperiences = () => {
    const newErrors = {};

    // Check if experience checkbox is checked but no experiences added
    if (hasExperience && formData.prevWorkExperience.length === 0) {
      newErrors.prevWorkExperience = "Please add at least one work experience";
      return newErrors;
    }

    // Validate each experience if checkbox is checked
    if (hasExperience) {
      formData.prevWorkExperience.forEach((exp, index) => {
        if (!exp.designation?.trim()) {
          newErrors[`prevWorkExperience.${index}.designation`] =
            "Designation is required";
        }
        if (!exp.joiningDate?.trim()) {
          newErrors[`prevWorkExperience.${index}.joiningDate`] =
            "Joining date is required";
        }
        if (!exp.endDate?.trim()) {
          newErrors[`prevWorkExperience.${index}.endDate`] =
            "End date is required";
        }
      });
    }
    return newErrors;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Always required fields (for both admin and non-admin)
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    // Only require password for new employees
    if (!isEditMode && !formData.password)
      newErrors.password = "Password is required";
    else if (!isEditMode && formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.employmentType)
      newErrors.employmentType = "Employment type is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.designation)
      newErrors.designation = "Designation is required";
    if (!formData.employeeId) newErrors.employeeId = "Employee ID is required";
    if (!formData.workLocation)
      newErrors.workLocation = "Work location is required";

    // Storage limit validation
    if (formData.storageLimit?.value && formData.storageLimit.value <= 0) {
      newErrors["storageLimit.value"] = "Storage size must be greater than 0";
    }
    if (formData.storageLimit?.value && !formData.storageLimit.unit) {
      newErrors["storageLimit.unit"] = "Storage unit is required";
    }
    if (formData?.status === "Terminated" && !formData.terminationDate) {
      newErrors.terminationDate = "Termination date is required";
    }

    if (formData?.status === "Resigned" && !formData.terminationDate) {
      newErrors.terminationDate = "Termination date is required";
    }

    if (!formData.shift) {
      newErrors.shift = "Shift is required";
    }

    const experienceErrors = validateExperiences();
    Object.assign(newErrors, experienceErrors);

    // Admin-only required fields
    if (!isAdmin) {
      // Personal Info validation

      if (!formData.phone) newErrors.phone = "Phone number is required";
      if (!formData.dateOfBirth)
        newErrors.dateOfBirth = "Date of birth is required";
      if (!formData.nid) newErrors.nid = "NID is required";
      if (!formData.nidPhotoUrl)
        newErrors.nidPhotoUrl = "NID Photo is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.religion) newErrors.religion = "Religion is required";

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
      // if (!formData.address.zip)
      //   newErrors["address.zip"] = "ZIP code is required";

      // Employment validation

      // Emergency contact validation
      if (!formData.emergencyContact.name)
        newErrors["emergencyContact.name"] = "Name is required";
      if (!formData.emergencyContact.relationship)
        newErrors["emergencyContact.relationship"] = "Relationship is required";
      if (!formData.emergencyContact.phonePrimary)
        newErrors["emergencyContact.phonePrimary"] = "Phone number is required";
      if (!formData.emergencyContact.address)
        newErrors["emergencyContact.address"] = "Address is required";
      if (!formData.emergencyContact.nid)
        newErrors["emergencyContact.nid"] = "NID is required";
      if (!formData.emergencyContact.nidPhotoUrl) {
        setNestedValue(
          newErrors,
          "emergencyContact.nidPhotoUrl",
          "NID Proof (photo/pdf) is required"
        );
      }

      // if (!formData.emergencyContact.nidPhotoUrl)
      //   newErrors["emergencyContact.nidPhotoUrl"] =
      //     "NID Proof (photo/pdf) is required";
      // if (!formData.emergencyContact.email)
      //   newErrors["emergencyContact.email"] = "Email is required";
    }
    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    // console.log("Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to get changed fields
  const getChangedFields = (original, updated) => {
    const changes = {};
    Object.keys(updated).forEach((key) => {
      if (_.isObject(updated[key]) && !Array.isArray(updated[key])) {
        const nested = getChangedFields(original?.[key] || {}, updated[key]);
        if (Object.keys(nested).length > 0) changes[key] = nested;
      } else if (!_.isEqual(updated[key], original?.[key])) {
        changes[key] = updated[key];
      }
    });
    return changes;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (isEditMode && !isAdmin && !employeeData?.isEmailVerified) {
    //   toast.error(
    //     "Please verify your email address first before proceeding."
    //   );
    //   return false;
    // }

    if (validateForm()) {
      try {
        if (isEditMode) {
          // Only send changed fields + id
          const changedFields = getChangedFields(originalData, formData);
          delete changedFields.password;

          // Ensure storageLimit is properly formatted if it's being updated
          if (changedFields.storageLimit) {
            changedFields.storageLimit = {
              value: changedFields.storageLimit.value
                ? Number(changedFields.storageLimit.value)
                : null,
              unit: changedFields.storageLimit.unit,
            };
          }

          const res = await updateEmployee({
            ...changedFields,
            id: employeeFromState?._id || id,
          }).unwrap();
          toast.success("Success!", "Employee updated successfully", 2000);
          if (res?.user?._id === loginUser?.user?._id) {
            dispatch(setUser({ user: res.user }));
          }
        } else {
          const data = {
            ...formData,
            department: formData.department ? formData.department : null,
            employmentType: formData.employmentType
              ? formData.employmentType
              : null,
            startDate: formData.startDate ? formData.startDate : null,
            gender: formData.gender ? formData.gender : null,
            religion: formData.religion ? formData.religion : null,
            status: formData.status ? formData.status : null,
            dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
            phone: formData.phone ? formData.phone : null,
            photoUrl: formData.photoUrl ? formData.photoUrl : null,
            storageLimit: formData.storageLimit?.value
              ? {
                  value: Number(formData.storageLimit.value),
                  unit: formData.storageLimit.unit,
                }
              : null,
            shift: formData.shift ? formData.shift : "Day",
          };
          await onboardEmployee(data).unwrap();
          toast.success("Success!", "Employee created successfully", 2000);
        }
        if (location?.pathname === "/update-profile") {
          navigate(`/`);
        } else {
          if (
            loginUser?.user?.role !== "Admin" ||
            loginUser?.user?._id === employeeFromState?._id
          ) {
            navigate(`/profile/${loginUser?.user?._id}`);
          } else {
            navigate("/employee");
          }
        }
      } catch (error) {
        // console.error("Operation failed:", error);
        toast.error("Error", error?.data?.error || "An error occurred", 5000);
      }
    } else {
      toast.error(
        "Validation Error",
        "Please complete all required fields",
        3000
      );
    }
  };

  // Get isAdmin from Redux userSlice
  const user = useSelector((state) => state.userSlice.user).user;
  const isAdmin = user?.role === "Admin" || user?.user?.role === "Admin";

  if (employeeError) {
    return <Error />;
  }

  if (employeeLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (employeeError && !employeeData) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <h1>
          Failed to load employee data. Please check your internet connection
          and try again.
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="bg-form-header-gradient p-6 text-gray-800">
        <CardTitle className=" text-center mb-1 text-2xl md:text-3xl">
          {isEditMode ? "Edit Employee" : "Create an Employee"}
        </CardTitle>
        <CardDescription className=" text-center">
          <TitleDivider
            color="black"
            className={"-mt-0"}
            title="Fill up Employee Information"
          />
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="pb-6 px-6">
        {/* Personal Information Section */}

        <PersonalInformation
          formData={formData}
          handleChange={handleChange}
          errors={errors}
          employeeData={employeeData}
          refetchEmployee={refetchEmployee}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
          setErrors={setErrors}
          setFormData={setFormData}
        />

        {/* Address Information Section */}
        <AddressInformation
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          setErrors={setErrors}
          employeeData={employeeData}
          refetchEmployee={refetchEmployee}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
        />

        {/* Employment Details Section (Admin only) */}
        <EmploymentDetails
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          employeeData={employeeData}
          refetchEmployee={refetchEmployee}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
          setErrors={setErrors}
          hasExperience={hasExperience}
          setHasExperience={setHasExperience}
        />

        {/* Family Members Section */}
        <FamilyMembers
          formData={formData}
          setFormData={setFormData}
          isAdmin={isAdmin}
        />

        {/* Emergency Contact Section */}
        <EmergencyContact
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          handleChange={handleChange}
          setErrors={setErrors}
          employeeData={employeeData}
          refetchEmployee={refetchEmployee}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
        />

        <BankInformation
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />

        <Documents
          formData={formData}
          setFormData={setFormData}
          employeeData={employeeData}
          refetchEmployee={refetchEmployee}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/employee")}
              className="flex items-center rounded-md"
            >
              <XIcon className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="flex items-center rounded-md"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                {isEditMode ? "Update" : "Create"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeAddEdit;
