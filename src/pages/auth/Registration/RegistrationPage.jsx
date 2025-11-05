"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  UserIcon,
  HomeIcon,
  BriefcaseIcon,
  FileTextIcon,
  ShieldIcon,
  MailIcon,
  PhoneIcon,
  KeyIcon,
  HashIcon,
  MapPinIcon,
  BuildingIcon,
  CalendarIcon,
  FileIcon,
  UserCircleIcon,
  HeartIcon,
} from "lucide-react";
import { FloatingInput } from "@/component/FloatiingInput";
import { CustomCheckbox } from "@/component/CustomCheckbox";
import { TitleDivider } from "@/component/TitleDevider";
import { StepProgress } from "@/component/StepProgress";
import { FileUpload } from "@/component/FileUpload";
import LazyImage from "@/utils/LazyImage";
import logo from "../../../../public/logo.png";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { useOnboardEmployeeMutation } from "@/redux/features/auth/authApiSlice";
import { toast } from "@/component/Toast";

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

export default function RegisterPage() {
  // Form steps
  const steps = [
    {
      id: "personal",
      title: "Personal Info",
      icon: UserIcon,
      fullTitle: "Personal Information",
    },
    {
      id: "address",
      title: "Address",
      icon: HomeIcon,
      fullTitle: "Address Information",
    },
    {
      id: "employment",
      title: "Employment",
      icon: BriefcaseIcon,
      fullTitle: "Employment Details",
    },
    {
      id: "emergency",
      title: "Emergency",
      icon: ShieldIcon,
      fullTitle: "Emergency Contact",
    },
    {
      id: "documents",
      title: "Documents",
      icon: FileTextIcon,
      fullTitle: "Documents & Verification",
    },
  ];

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("Personal Information");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const formRef = useRef(null);
  const [formAttempted, setFormAttempted] = useState(false);
  const [lastStepAttempted, setLastStepAttempted] = useState(false);

  // Initialize form data with default values
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    ssnLast4: "",
    password: "",
    dateOfBirth: "", // Added field
    gender: "PreferNotToSay", // Added field
    maritalStatus: "Single", // Added field
    filingStatus: "", // Empty initial value
    i9: {
      docType: "",
      docNumber: "",
      docExpires: "",
      // document: null,
    },
    address: {
      address: "",
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    role: "Employee",
    status: "Pending",
    employmentType: "", // Empty initial value
    workLocation: "Offline",
    startDate: new Date().toISOString().split("T")[0],
    terminationDate: null,
    emergencyContact: {
      name: "",
      relationship: "",
      phonePrimary: "",
      phoneAlternate: "",
      email: "",
      address: "",
    },
    additionalWithholding: 0,
    department: "", // Empty initial value
    documents: [], // Changed to array for multiple documents
  });
  const [onboardEmployee, { isLoading: regLoading }] =
    useOnboardEmployeeMutation();

  const { data, isLoading } = useGetDepartmentsQuery(
    {
      isPopulate: true,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  // console.log(data)
  const departmentOptions = data?.data?.map((d) => ({
    label: d?.name,
    value: d?._id,
  }));
  // console.log(formData)
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects
    if (name.includes(".")) {
      const keys = name.split(".");
      const lastKey = keys.pop();

      setFormData((prev) => {
        // Create a deep copy of the previous state
        const newData = { ...prev };

        // Navigate to the nested object
        let current = newData;
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          // Ensure the path exists
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }

        // Set the value
        current[lastKey] = value;
        return newData;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

  // Handle file upload change
  const handleFileChange = (name, value) => {
    if (name === "documents") {
      // Handle documents array
      setFormData((prev) => {
        // Convert the uploaded files to the required format
        const documents = Array.isArray(value)
          ? value.map((file) => ({
              docType: file.title || file.name || file.docType || "Document",
              fileUrl:
                file.fileUrl ||
                file.link ||
                (file.file ? URL.createObjectURL(file.file) : null),
              serverFilename: file.serverFilename || null, // Store server filename for deletion
            }))
          : value
          ? [
              {
                docType:
                  value.title || value.name || value.docType || "Document",
                fileUrl:
                  value.fileUrl ||
                  value.link ||
                  (value.file ? URL.createObjectURL(value.file) : null),
                serverFilename: value.serverFilename || null,
              },
            ]
          : [];

        return { ...prev, documents };
      });
    } else if (name.includes(".")) {
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

        // If this is a file upload, extract the necessary information
        if (value && (value.file || value.link)) {
          current[lastKey] = {
            docType: value.title || value.name,
            fileUrl:
              value.fileUrl ||
              value.link ||
              (value.file ? URL.createObjectURL(value.file) : null),
            serverFilename: value.serverFilename || null,
          };
        } else {
          current[lastKey] = value;
        }

        return newData;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

  // Handle checkbox change
  const handleCheckboxChange = (checked) => {
    setTermsAccepted(checked);

    if (checked) {
      // Clear error for terms if it exists
      if (errors.terms) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.terms;
          return newErrors;
        });
      }
    }
  };

  useEffect(() => {
    switch (currentStep) {
      case 0:
        setCurrentTitle("Personal Information");
        break;
      case 1:
        setCurrentTitle("Address Information");
        break;
      case 2:
        setCurrentTitle("Employment Details");
        break;
      case 3:
        setCurrentTitle("Emergency Contact");
        break;
      case 4:
        setCurrentTitle("Documents & Verification");
        // Reset the last step attempted flag when navigating to the last step
        // This ensures errors won't show until user tries to submit
        setLastStepAttempted(false);
        break;
      default:
        setCurrentTitle("");
        break;
    }
  }, [currentStep]);

  // Validate current step
  const validateStep = (stepIndex = currentStep, isSubmitAttempt = false) => {
    const newErrors = {};

    // Validation for each step
    if (stepIndex === 0) {
      // Personal Info validation
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.phone) newErrors.phone = "Phone number is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email is invalid";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";

      // Document fields moved to personal info step
      if (!formData.filingStatus)
        newErrors.filingStatus = "Filing status is required";
      if (!formData.ssnLast4)
        newErrors.ssnLast4 = "SSN last 4 digits are required";
      if (!formData.i9.docType)
        newErrors["i9.docType"] = "Document type is required";
      if (!formData.i9.docNumber)
        newErrors["i9.docNumber"] = "Document number is required";
      if (!formData.i9.docExpires)
        newErrors["i9.docExpires"] = "Document expiration date is required";
    } else if (stepIndex === 1) {
      // Address validation
      if (!formData.address.address)
        newErrors["address.address"] = "Address is required";
      if (!formData.address.city)
        newErrors["address.city"] = "City is required";
      if (!formData.address.state)
        newErrors["address.state"] = "State is required";
      if (!formData.address.zip)
        newErrors["address.zip"] = "ZIP code is required";
    } else if (stepIndex === 2) {
      // Employment validation
      if (!formData.department) newErrors.department = "Department is required";
      if (!formData.employmentType)
        newErrors.employmentType = "Employment type is required";
      if (!formData.startDate) newErrors.startDate = "Start date is required";
    } else if (stepIndex === 3) {
      // Emergency contact validation
      if (!formData.emergencyContact.name)
        newErrors["emergencyContact.name"] = "Name is required";
      if (!formData.emergencyContact.relationship)
        newErrors["emergencyContact.relationship"] = "Relationship is required";
      if (!formData.emergencyContact.phonePrimary)
        newErrors["emergencyContact.phonePrimary"] = "Phone number is required";
      if (!formData.emergencyContact.address)
        newErrors["emergencyContact.address"] = "Address is required";
    } else if (stepIndex === 4) {
      // Documents validation - only show errors if form has been attempted on the last step
      // or if this is an actual submit attempt
      // if ((lastStepAttempted || isSubmitAttempt) && !formData.i9.document) {
      //     newErrors["i9.document"] = "Document upload is required"
      // }

      // Terms validation (only on final step)
      if ((lastStepAttempted || isSubmitAttempt) && !termsAccepted) {
        newErrors.terms = "You must accept the terms to continue";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step click
  const handleStepClick = (stepIndex) => {
    // Allow going back to previous steps without validation
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);

      // Scroll to top of form
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    // For going forward, validate current step
    setFormAttempted(true);
    if (validateStep()) {
      // Add current step to completed steps if it's not already there
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }

      // Navigate to the clicked step
      setCurrentStep(stepIndex);

      // Scroll to top of form
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Handle next step
  const handleNext = () => {
    setFormAttempted(true);
    if (validateStep()) {
      // Add current step to completed steps
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }

      // Move to next step
      const nextStep = Math.min(currentStep + 1, steps.length - 1);
      setCurrentStep(nextStep);

      // Scroll to top of form
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    // Scroll to top of form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark that we've attempted to submit the form
    setLastStepAttempted(true);

    // Final validation including terms acceptance
    if (validateStep(currentStep, true)) {
      setIsSubmitting(true);

      try {
        // Simulate API call
        await onboardEmployee(formData).unwrap();

        // Redirect to success page or login
        toast.success("Success!", "Employee Onboarded Successfully", 2000);
        // Redirect to login
        window.location.href = "/login";
      } catch (error) {
        console.error("Registration failed:", error);
        toast.error("Registration failed", error?.data?.error, 5000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Render form step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                icon={<UserIcon className="h-5 w-5" />}
                required
              />
              <FloatingInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                icon={<UserCircleIcon className="h-5 w-5" />}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={errors.dateOfBirth}
                icon={<CalendarIcon className="h-5 w-5" />}
              />
              <FloatingInput
                label="Gender"
                name="gender"
                type="select"
                value={formData.gender}
                onChange={handleChange}
                error={errors.gender}
                icon={<UserIcon className="h-5 w-5" />}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "NonBinary", label: "Non-binary" },
                  { value: "PreferNotToSay", label: "Prefer not to say" },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Marital Status"
                name="maritalStatus"
                type="select"
                value={formData.maritalStatus}
                onChange={handleChange}
                error={errors.maritalStatus}
                icon={<HeartIcon className="h-5 w-5" />}
                options={[
                  { value: "Single", label: "Single" },
                  { value: "Married", label: "Married" },
                  { value: "Divorced", label: "Divorced" },
                  { value: "Widowed", label: "Widowed" },
                  { value: "Separated", label: "Separated" },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={<PhoneIcon className="h-5 w-5" />}
                required
              />
              <FloatingInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<MailIcon className="h-5 w-5" />}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<KeyIcon className="h-5 w-5" />}
                required
              />
              <FloatingInput
                label="Document Expiration Date"
                name="i9.docExpires"
                type="date"
                value={formData.i9.docExpires}
                onChange={handleChange}
                error={errors["i9.docExpires"]}
                icon={<CalendarIcon className="h-5 w-5" />}
                required
              />
            </div>

            {/* <TitleDivider title="Document Information" /> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Filing Status"
                name="filingStatus"
                type="select"
                value={formData.filingStatus}
                onChange={handleChange}
                error={errors.filingStatus}
                icon={<FileIcon className="h-5 w-5" />}
                options={filingStatusOptions}
                required
              />

              <FloatingInput
                label="SSN (Last 4 digits)"
                name="ssnLast4"
                value={formData.ssnLast4}
                onChange={handleChange}
                error={errors.ssnLast4}
                icon={<HashIcon className="h-5 w-5" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="I-9 Document Type"
                name="i9.docType"
                value={formData.i9.docType}
                onChange={handleChange}
                error={errors["i9.docType"]}
                icon={<FileTextIcon className="h-5 w-5" />}
                required
              />
              <FloatingInput
                label="Document Number"
                name="i9.docNumber"
                value={formData.i9.docNumber}
                onChange={handleChange}
                error={errors["i9.docNumber"]}
                icon={<HashIcon className="h-5 w-5" />}
                required
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FloatingInput
                label="Address"
                name="address.address"
                value={formData.address.address}
                onChange={handleChange}
                error={errors["address.address"]}
                icon={<MapPinIcon className="h-5 w-5" />}
                required
              />
              <FloatingInput
                label="Street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                error={errors["address.street"]}
                icon={<MapPinIcon className="h-5 w-5" />}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FloatingInput
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                error={errors["address.city"]}
                icon={<BuildingIcon className="h-5 w-5" />}
                required
              />
              <FloatingInput
                label="State"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                error={errors["address.state"]}
                icon={<MapPinIcon className="h-5 w-5" />}
                required
              />
              <FloatingInput
                label="ZIP Code"
                name="address.zip"
                value={formData.address.zip}
                onChange={handleChange}
                error={errors["address.zip"]}
                icon={<HashIcon className="h-5 w-5" />}
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4 p-4 max-w-sm w-full border rounded-md shadow-md">
                  <div className="h-48 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ) : (
                <FloatingInput
                  label="Department"
                  name="department"
                  type="select"
                  value={formData.department}
                  onChange={handleChange}
                  error={errors.department}
                  icon={<BriefcaseIcon className="h-5 w-5" />}
                  options={departmentOptions}
                  required
                />
              )}

              <FloatingInput
                label="Employment Type"
                name="employmentType"
                type="select"
                value={formData.employmentType}
                onChange={handleChange}
                error={errors.employmentType}
                icon={<BriefcaseIcon className="h-5 w-5" />}
                options={employmentTypeOptions}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
                icon={<CalendarIcon className="h-5 w-5" />}
                required
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Name"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                error={errors["emergencyContact.name"]}
                icon={<UserIcon className="h-5 w-5" />}
                required
              />
              <FloatingInput
                label="Relationship"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
                error={errors["emergencyContact.relationship"]}
                icon={<HeartIcon className="h-5 w-5" />}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Primary Phone"
                name="emergencyContact.phonePrimary"
                type="tel"
                value={formData.emergencyContact.phonePrimary}
                onChange={handleChange}
                error={errors["emergencyContact.phonePrimary"]}
                icon={<PhoneIcon className="h-5 w-5" />}
                required
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
            </div>
            <FloatingInput
              label="Address"
              name="emergencyContact.address"
              value={formData.emergencyContact.address}
              onChange={handleChange}
              error={errors["emergencyContact.address"]}
              icon={<MapPinIcon className="h-5 w-5" />}
              required
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            {/* <div className="mt-4">
                            <FileUpload
                                label="Upload I-9 Document"
                                onChange={(value) => handleFileChange("i9.document", value)}
                                value={formData.i9.document}
                                error={lastStepAttempted ? errors["i9.document"] : null}
                                required
                                isTitle={true}
                                isTitleRequired={true}
                            />
                        </div> */}

            <div className="mt-4">
              <FileUpload
                label="Upload Additional Documents"
                onChange={(value) => handleFileChange("documents", value)}
                value={
                  formData.documents.length > 0 ? formData.documents : null
                }
                isMultiFile={true}
                isTitle={true}
                isTitleRequired={true}
                onFileClick={(file) => {
                  if (file?.fileUrl) {
                    window.open(file.fileUrl, "_blank");
                  } else {
                    console.warn("No file URL available.");
                  }
                }}
              />
            </div>

            <div className="mt-4">
              <CustomCheckbox
                label="I certify that all information provided is true and accurate"
                checked={termsAccepted}
                onChange={handleCheckboxChange}
              />
              {lastStepAttempted && errors.terms && (
                <p className="mt-1 text-xs text-red-500">{errors.terms}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Add a new useEffect to reset focus when changing steps
  useEffect(() => {
    // Remove focus from any active element when changing steps
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-green-100 p-4">
      <div className="w-full max-w-2xl" ref={formRef}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="relative h-42 bg-gradient-to-r from-primary to-primary p-6">
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <LazyImage src={logo} imgClass="max-w-12 mx-auto" alt="" />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/10"></div>
            <div className="absolute bottom-12 left-8 h-8 w-8 rounded-full bg-white/10"></div>

            <div>
              <h1 className="text-3xl font-semibold text-white text-center mt-2">
                Employee Onboarding
              </h1>
              <TitleDivider
                color="white"
                className={"-mt-0"}
                title={currentTitle}
              />
            </div>
          </div>

          {/* Step Indicator */}
          <div className="pt-16 px-6">
            <StepProgress
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              completedSteps={completedSteps}
            />
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="transition-opacity duration-300">
                {renderStepContent()}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center px-4 py-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 ${
                    currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <ChevronLeftIcon className="mr-1 h-5 w-5" />
                  Previous
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                  >
                    Next
                    <ChevronRightIcon className="ml-1 h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || regLoading}
                    className="flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || regLoading ? (
                      <>
                        <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Register
                        <CheckIcon className="ml-1 h-5 w-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Footer with Login Link */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
