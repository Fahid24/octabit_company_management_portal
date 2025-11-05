import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  Link as LinkIcon,
  PlusIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import SelectInput from "@/component/select/SelectInput";
import {
  useAddServiceOptinMutation,
  useCreateClientMutation,
  useCreateFileMutation,
  useGetServiceOptionsQuery,
} from "@/redux/features/revenue/revenueSlice";
import { toast } from "@/component/Toast";
import { useNavigate } from "react-router-dom";
import {
  communicationChannelOptions,
  CountriesOptions,
  timeZoneOptions,
} from "./ClientFormOptions";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import Loading from "@/utils/CLoading/Loading";
import DatePicker from "@/component/CustomCalander";
import { format } from "date-fns";
import { useGetProjectsQuery } from "@/redux/features/admin/project/projectApiSlice";
import Loader from "@/component/Loader";

const ClientForm = () => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [user, setUser] = useState(null);
  const [linkInput, setLinkInput] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [linkName, setLinkName] = useState("");
  const { data: projects, isLoading: isProjectsLoading } = useGetProjectsQuery({
    page: 1,
    limit: 99999,
  });

  const [createFile] = useCreateFileMutation();
  const [createClient] = useCreateClientMutation();
  const [addServiceOption] = useAddServiceOptinMutation();
  const { data: serviceOptions, refetch } = useGetServiceOptionsQuery();

  const { data: employeeData, isLoading: isLoadingEmployee } =
    useGetAllEmployeesQuery({
      page: 1,
      limit: 9000000,
    });

  const employeeOptionsData = employeeData?.data?.map((option) => ({
    label: option.firstName + " " + option.lastName,
    value: option._id,
  }));

  const serviceOptionsData = serviceOptions?.data?.map((option) => ({
    label: option.label,
    value: option.value,
  }));

  const projectOptions = projects?.projects?.map((project) => ({
    label: project.name,
    value: project._id,
  }));

  function loginUser() {
    const userData = localStorage.getItem("MONKEY-MAN-USER");

    if (!userData) {
      console.log("No user found in localStorage.");
      return null;
    }

    try {
      const user = JSON.parse(userData);

      setUser(user.user);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return null;
    }
  }
  useEffect(() => {
    loginUser();
  }, []);

  // console.log("projectOptions  = ", user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userId: null,
    userRole: null,
    selectedDate: null,
    companyemail: "",
    companyname: "",
    companyLogo: null,
    website: "",
    phone: "",
    clientType: null,
    paymentType: null,
    country: null,
    timeZone: null,
    state: "",
    details: "",
    services: [],
    employees: null,
    attachments: [],
    project: null,
    // teamMembers: [],
    teamMembers: [
      // Example of one member with empty fields
      {
        id: Date.now(), // unique id for each member
        name: "",
        email: "",
        phone: "",
        role: "",
        memberCommunicationChannel: [], // initially empty
      },
    ],
    communicationChannels: [],
  });

  const [formErrors, setFormErrors] = useState({});

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Add a new member
  const addTeamMember = () => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        {
          id: Date.now(),
          name: "",
          email: "",
          phone: "",
          role: "",
          memberCommunicationChannel: [],
        },
      ],
    }));
  };

  const removeTeamMember = (id) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((member) => member.id !== id),
    }));
  };

  // Update member's field (name, email, phone, role)
  const updateTeamMember = (memberId, key, value) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member) =>
        member.id === memberId ? { ...member, [key]: value } : member
      ),
    }));
  };

  const addCommunicationChannel = () => {
    setFormData((prev) => ({
      ...prev,
      communicationChannels: [
        ...prev.communicationChannels,
        {
          id: Date.now().toString(),
          type: null,
          value: "",
        },
      ],
    }));
  };

  const removeCommunicationChannel = (id) => {
    setFormData((prev) => ({
      ...prev,
      communicationChannels: prev.communicationChannels.filter(
        (channel) => channel.id !== id
      ),
    }));
  };

  const updateCommunicationChannel = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      communicationChannels: prev.communicationChannels.map((channel) =>
        channel.id === id ? { ...channel, [field]: value } : channel
      ),
    }));
  };

  // for member

  // Add a channel for a member
  const addMemberChannel = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member) =>
        member.id === memberId
          ? {
              ...member,
              memberCommunicationChannel: [
                ...member.memberCommunicationChannel,
                { type: "", value: "" },
              ],
            }
          : member
      ),
    }));
  };

  // Update a channel
  const updateMemberChannel = (memberId, channelIndex, key, value) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member) =>
        member.id === memberId
          ? {
              ...member,
              memberCommunicationChannel: member.memberCommunicationChannel.map(
                (channel, index) =>
                  index === channelIndex
                    ? { ...channel, [key]: value }
                    : channel
              ),
            }
          : member
      ),
    }));
  };

  // Delete a channel
  const deleteMemberChannel = (memberId, channelIndex) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member) =>
        member.id === memberId
          ? {
              ...member,
              memberCommunicationChannel:
                member.memberCommunicationChannel.filter(
                  (_, index) => index !== channelIndex
                ),
            }
          : member
      ),
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
    setFormErrors((prev) => ({ ...prev, attachments: "" }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
    setFormErrors((prev) => ({ ...prev, attachments: "" }));
  };

  const handleAddLink = () => {
    if (!linkInput.trim() || !linkName.trim()) return;

    let isValidUrl = true;
    try {
      new URL(linkInput.trim()); // will throw if invalid
    } catch (err) {
      isValidUrl = false;
      console.log(err);
    }

    if (!isValidUrl) {
      toast.error("Please enter a valid link.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        { type: "link", url: linkInput.trim(), name: linkName.trim() },
      ],
    }));

    setLinkInput("");
    setLinkName("");
  };
  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step) => {
    let errors = {};

    if (step === 1) {
      if (!formData.name.trim()) errors.name = "Name is required";
      // if (!formData.email.trim()) errors.email = "Email is required";
      if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email))
        errors.email = "Invalid email format";
      // if (!formData.phone.trim()) errors.phone = "Phone is required";
      if (formData.phone.trim() && !/^\+?\d{7,15}$/.test(formData.phone))
        errors.phone = "Invalid phone number";
    }

    if (step === 2) {
      if (!formData.companyname.trim())
        errors.companyname = "Company name is required";
      // if (!formData.website.trim()) errors.website = "Website is required";
      if (formData.website.trim()) {
        try {
          new URL(formData.website.trim());
        } catch {
          errors.website = "Invalid website URL";
        }
      }
      if (!formData.country) errors.country = "Country is required";
      if (!formData.timeZone) errors.timeZone = "Time zone is required";
    }

    if (step === 3) {
      if (!formData.employees || formData.employees.length === 0)
        errors.employees = "Please add an employee";
      if (!formData.services || formData.services.length === 0)
        errors.services = "Please select at least one service";
    }

    return errors;
  };

  const renderAttachmentPreview = (attachment, index) => {
    if (attachment.type === "link") {
      return (
        <div
          key={index}
          className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
        >
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-4 w-4 text-gray-500" />
            <div className="flex flex-col">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate max-w-xs"
                title={attachment.url}
              >
                {attachment.url}
              </a>
              <span className="text-xs text-gray-500">{attachment.name}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeAttachment(index)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={index}
        className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
      >
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {attachment.name} ({formatFileSize(attachment.size)})
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeAttachment(index)}
          className="text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all steps before submission
    const step1Errors = validateStep(1);
    const step2Errors = validateStep(2);
    const step3Errors = validateStep(3);

    const allErrors = { ...step1Errors, ...step2Errors, ...step3Errors };

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      setLoading(false);
      toast.error("Please correct the form errors.");
      return;
    }

    setFormErrors({});

    try {
      let companyLogoUrl = null;
      if (formData.companyLogo) {
        const logoFormData = new FormData();
        logoFormData.append("file", formData.companyLogo);
        const res = await createFile(logoFormData).unwrap();
        companyLogoUrl = res.fileUrl;
      }

      // Upload files and format them
      const uploadedFiles = await Promise.all(
        formData.attachments
          .filter((a) => !(a.type === "link"))
          .map(async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            const res = await createFile(fd).unwrap();
            return {
              label: "file",
              url: res.fileUrl,
              name: file.name,
            };
          })
      );

      // Map links to the same format
      const uploadedLinks = formData.attachments
        .filter((a) => a.type === "link")
        .map((link) => ({
          label: "link",
          url: link.url,
          name: link.name,
        }));

      const finalClientData = {
        userId: user?._id,
        userRole: user?.role,
        name: formData.name,
        email: formData?.email ? formData.email : null,
        date: formData.selectedDate,
        companyEmail: formData.companyemail,
        companyName: formData.companyname,
        companyLogo: companyLogoUrl,
        website: formData.website ? formData.website : "N/A",
        phone: formData.phone,
        clientType: formData.clientType?.value,
        paymentType: formData.paymentType?.value,
        country: formData.country?.value,
        timeZone: formData.timeZone?.value,
        state: formData.state,
        details: formData.details,
        services: formData.services?.map((s) => ({
          label: s.label,
          value: s.value,
        })),
        employees: formData.employees ? formData.employees.value : null,
        project: formData.project ? formData.project.value : null,
        attachments: [...uploadedFiles, ...uploadedLinks],
        teamMembers: formData.teamMembers.map((m) => ({
          ...m,
          memberCommunicationChannel: m.memberCommunicationChannel.map((c) => ({
            type: c.type,
            value: c.value,
          })),
        })),
        communicationChannels: formData.communicationChannels.map((c) => ({
          type: c.type?.value,
          value: c.value,
        })),
      };

      // console.log("Final Form Data:", finalClientData);
      await createClient(finalClientData).unwrap();
      toast.success("Client Created Successfully");
      handleReset();
      navigate("/client-management");
    } catch (err) {
      toast.error("Error submitting client");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      selectedDate: null,
      companyemail: "",
      companyname: "",
      companyLogo: null,
      website: "",
      phone: "",
      clientType: null,
      paymentType: null,
      country: null,
      timeZone: null,
      state: "",
      details: "",
      services: [],
      employees: null,
      attachments: [],
      project: null,
      teamMembers: [],
      communicationChannels: [],
    });
    setFormErrors({});
    setInputText("");
    setLinkInput("");
    setActiveTab("upload");
    setCurrentStep(1);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please correct the form errors before proceeding");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
    setFormErrors({});
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setFormErrors({});
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Basic Information</h3>

      <FloatingInput
        label="Name"
        type="text"
        value={formData.name}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, name: e.target.value }));
          setFormErrors((prev) => ({ ...prev, name: "" }));
        }}
        error={formErrors.name}
      />

      <FloatingInput
        label="Personal Email"
        type="email"
        value={formData.email}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, email: e.target.value }));
          setFormErrors((prev) => ({ ...prev, email: "" }));
        }}
        error={formErrors.email}
      />

      <FloatingInput
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, phone: e.target.value }));
          setFormErrors((prev) => ({ ...prev, phone: "" }));
        }}
        error={formErrors.phone}
      />

      <DatePicker
        value={formData.selectedDate ? new Date(formData.selectedDate) : null}
        onChange={(date) => {
          const formatted = format(date, "yyyy-MM-dd");
          setFormData((prev) => ({ ...prev, selectedDate: formatted }));
          setFormErrors((prev) => ({ ...prev, selectedDate: "" }));
        }}
        primaryColor="#3a41e2"
        startWeekOnMonday
        placeholder="Select date"
        error={formErrors.selectedDate}
        className="w-full"
      />

      <div className="flex gap-4 flex-col md:flex-row">
        <SelectInput
          label="Client Type"
          value={formData.clientType}
          isMulti={false}
          onChange={(selected) => {
            setFormData((prev) => ({ ...prev, clientType: selected }));
            setFormErrors((prev) => ({ ...prev, clientType: "" }));
          }}
          options={[
            { label: "One Time", value: "One Time" },
            { label: "Recurring", value: "Recurring" },
          ]}
        />
        <SelectInput
          label="Payment Type"
          value={formData.paymentType}
          isMulti={false}
          onChange={(selected) => {
            setFormData((prev) => ({ ...prev, paymentType: selected }));
            setFormErrors((prev) => ({ ...prev, paymentType: "" }));
          }}
          options={[
            { label: "Prepaid", value: "Prepaid" },
            { label: "Postpaid", value: "Postpaid" },
          ]}
        />
      </div>
    </div>
  );

  // Step 2: Company Information
  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Company Information</h3>

      <FloatingInput
        label="Company Name"
        type="text"
        value={formData.companyname}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, companyname: e.target.value }));
          setFormErrors((prev) => ({ ...prev, companyname: "" }));
        }}
        error={formErrors.companyname}
      />

      <div className="flex flex-col gap-3">
        <FloatingInput
          label="Company Email"
          type="email"
          value={formData.companyemail}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, companyemail: e.target.value }));
            setFormErrors((prev) => ({ ...prev, companyemail: "" }));
          }}
          error={formErrors.companyemail}
        />
        <div className="flex items-center gap-3">
          <input
            id="companyLogo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFormData((prev) => ({
                  ...prev,
                  companyLogo: e.target.files[0],
                }));
                setFormErrors((prev) => ({ ...prev, companyLogo: "" }));
              }
            }}
          />
          <label
            htmlFor="companyLogo"
            className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer bg-primary transition-all"
          >
            <Upload className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white">Upload Logo</span>
          </label>
          {formData.companyLogo && (
            <div className="flex items-center gap-2">
              <img
                src={URL.createObjectURL(formData.companyLogo)}
                alt="Logo Preview"
                className="w-12 h-12 rounded-full object-cover border"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, companyLogo: null }))
                }
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <FloatingInput
        label="Website Link"
        type="url"
        value={formData.website}
        onChange={(e) => {
          const value = e.target.value;

          setFormErrors((prev) => ({ ...prev, website: "" }));

          // Update state
          setFormData((prev) => ({ ...prev, website: value }));

          if (value.trim() !== "") {
            let isValidUrl = true;
            try {
              new URL(value.trim());
            } catch (_) {
              isValidUrl = false;
            }

            if (!isValidUrl) {
              setFormErrors((prev) => ({
                ...prev,
                website: "Please enter a valid website link",
              }));
            }
          }
        }}
        error={formErrors.website}
      />

      <div className="flex gap-4 flex-col md:flex-row">
        <SelectInput
          label="Country"
          value={formData.country}
          isMulti={false}
          onChange={(selected) => {
            setFormData((prev) => ({ ...prev, country: selected }));
            setFormErrors((prev) => ({ ...prev, country: "" }));
          }}
          options={CountriesOptions || []}
          error={formErrors.country}
        />
        <SelectInput
          label="Time Zone"
          value={formData.timeZone}
          isMulti={false}
          onChange={(selected) => {
            setFormData((prev) => ({ ...prev, timeZone: selected }));
            setFormErrors((prev) => ({ ...prev, timeZone: "" }));
          }}
          options={timeZoneOptions || []}
          error={formErrors.timeZone}
        />
      </div>

      <FloatingInput
        label="State"
        type="text"
        value={formData.state}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, state: e.target.value }));
          setFormErrors((prev) => ({ ...prev, state: "" }));
        }}
        error={formErrors.state}
      />

      <FloatingTextarea
        label="Details"
        value={formData.details}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, details: e.target.value }))
        }
        rows={4}
        className="mt-6"
      />
    </div>
  );

  // Step 3: Services & Attachments
  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Services & Attachments</h3>

      <div>
        <SelectInput
          label="Select Service"
          value={formData.services}
          isMulti={true}
          onChange={(selected) => {
            setFormData((prev) => ({ ...prev, services: selected }));
            setFormErrors((prev) => ({ ...prev, services: "" }));
          }}
          options={serviceOptionsData || []}
          inputValue={inputText}
          onInputChange={(value) => setInputText(value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && inputText.trim()) {
              e.preventDefault();
              try {
                const newOption = { label: inputText, value: inputText };
                await addServiceOption(newOption).unwrap();
                await refetch();
                setFormData((prev) => ({
                  ...prev,
                  services: [...prev.services, newOption],
                }));
                setInputText("");
              } catch {
                toast.error("Failed to add service");
              }
            }
          }}
          noOptionsMessage={() =>
            inputText
              ? `Press Enter to add "${inputText}"`
              : "No options available"
          }
          error={formErrors.services}
        />
      </div>

      {formData.services.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {formData.services.map((service, idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
            >
              {service.label}
            </span>
          ))}
        </div>
      )}

      <div>
        <SelectInput
          label="Select Account Manager"
          value={formData.employees}
          isMulti={false}
          onChange={(selected) => {
            setFormData((prev) => ({ ...prev, employees: selected }));
            setFormErrors((prev) => ({ ...prev, employees: "" }));
          }}
          options={employeeOptionsData || []}
          error={formErrors.employees}
        />
      </div>
      <div>
        <SelectInput
          label="Select Project"
          value={formData.project}
          isMulti={false}
          onChange={(selected) => {
            setFormData((prev) => ({ ...prev, project: selected }));
          }}
          options={projectOptions || []}
        />
      </div>

      {/* Client Team Members */}

      <div>
        <div className="flex justify-between items-center py-3">
          <h1 className="text-xl font-semibold">Client Team Members</h1>
          <Button
            type="button"
            onClick={addTeamMember}
            className="flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" /> Add
          </Button>
        </div>

        <div className="space-y-4">
          {formData.teamMembers.map((member) => (
            <div key={member.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Team Member</h4>
                <Button
                  type="button"
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  onClick={() => removeTeamMember(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Basic Member Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  label="Member Name"
                  value={member.name}
                  onChange={(e) =>
                    updateTeamMember(member.id, "name", e.target.value)
                  }
                />
                <FloatingInput
                  label="Member Role"
                  value={member.role}
                  onChange={(e) =>
                    updateTeamMember(member.id, "role", e.target.value)
                  }
                />
                <FloatingInput
                  label="Member Email"
                  type="email"
                  value={member.email}
                  onChange={(e) =>
                    updateTeamMember(member.id, "email", e.target.value)
                  }
                />
                <FloatingInput
                  label="Member Phone"
                  type="tel"
                  value={member.phone}
                  onChange={(e) =>
                    updateTeamMember(member.id, "phone", e.target.value)
                  }
                />
              </div>

              {/* Member Communication Channels */}

              {/* Member Communication Channels */}
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-semibold mb-2">Communication Channels</h4>
                {member.memberCommunicationChannel.map((channel, index) => (
                  <div key={index} className="flex items-center gap-3 mb-2">
                    <SelectInput
                      label="Select Channel"
                      placeholder="Select a channel"
                      value={communicationChannelOptions.find(
                        (opt) => opt.value === channel.type
                      )}
                      onChange={(selectedOption) =>
                        updateMemberChannel(
                          member.id,
                          index,
                          "type",
                          selectedOption?.value || ""
                        )
                      }
                      options={communicationChannelOptions || []}
                    />

                    <FloatingInput
                      type="text"
                      value={channel.value}
                      onChange={(e) =>
                        updateMemberChannel(
                          member.id,
                          index,
                          "value",
                          e.target.value
                        )
                      }
                      className="mt-1"
                      label="Contact info"
                    />

                    <Button
                      type="button"
                      onClick={() => deleteMemberChannel(member.id, index)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      <Trash2 className="h-4 w-4"></Trash2>
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={() => addMemberChannel(member.id)}
                  className="bg-primary text-white px-4 py-2  mt-3 rounded"
                >
                  Add Channels
                </Button>
              </div>
            </div>
          ))}

          {formData.teamMembers.length === 0 && (
            <p className="text-gray-500 py-1">
              No team members added yet. Click &quot;Add Member&quot; to get
              started.
            </p>
          )}
        </div>
      </div>

      {/* Communication Channels */}
      <div>
        <div className="flex justify-between items-center py-3">
          <h1 className="text-xl font-semibold">Communication Channels</h1>
          <Button
            type="button"
            onClick={addCommunicationChannel}
            className="flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4 " /> Add
          </Button>
        </div>
        <div className="space-y-4">
          {formData.communicationChannels.map((channel) => (
            <div key={channel.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Communication Channel</h4>
                <Button
                  type="button"
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  onClick={() => removeCommunicationChannel(channel.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <SelectInput
                    label="Channel Type"
                    value={channel.type}
                    onChange={(selected) =>
                      updateCommunicationChannel(channel.id, "type", selected)
                    }
                    options={communicationChannelOptions || []}
                  />
                </div>
                <div>
                  <FloatingInput
                    label="Contact Info"
                    value={channel.value}
                    onChange={(e) =>
                      updateCommunicationChannel(
                        channel.id,
                        "value",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          {formData.communicationChannels.length === 0 && (
            <p className="text-gray-500 py-1">
              No communication channels added yet. Click &quot;Add Channel&quot;
              to get started.
            </p>
          )}
        </div>
      </div>

      {/* Attachments Tab */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        <div className="flex border-b border-gray-200 mb-3">
          <button
            type="button"
            className={`py-1.5 px-3 font-medium text-xs sm:text-sm focus:outline-none ${
              activeTab === "upload"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            Upload File
          </button>
          <button
            type="button"
            className={`py-1.5 px-3 font-medium text-xs sm:text-sm focus:outline-none ${
              activeTab === "link"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("link")}
          >
            Add Link
          </button>
        </div>

        {activeTab === "upload" ? (
          <div
            className={`border-2 border-dashed rounded-lg p-4 transition-all duration-300 ${
              isDragging ? "border-primary bg-blue-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <Upload className="h-6 w-6 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Drag & drop files here, or
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-1.5 px-3 bg-primary text-white rounded-md text-xs font-medium"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <div className="flex gap-2 items-center mt-2">
            <FloatingInput
              label="Enter URL"
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              className="flex-1"
            />
            <FloatingInput
              label="Link Name"
              type="text"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddLink}
              className="py-1 px-3 bg-primary text-white rounded-md text-xs font-medium"
            >
              Add
            </Button>
          </div>
        )}

        {formErrors.attachments && (
          <p className="text-red-500 text-sm mt-1">{formErrors.attachments}</p>
        )}
        {formData.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.attachments.map((att, idx) =>
              renderAttachmentPreview(att, idx)
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isLoadingEmployee || isProjectsLoading) return <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-2xl mx-auto shadow-md mb-10"
    >
      <h2 className="text-xl font-semibold text-center mb-6">
        Client Registration Form
      </h2>

      {/* Step indicator */}
      {/* // Replace the Step indicator section with this code: */}

      {/* Step indicator with connecting lines */}
      <div className="flex items-center justify-between mb-6 relative">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex flex-col items-center z-10">
            <div
              onClick={() => {
                // Validate previous steps before jumping
                let canJump = true;
                for (let i = 1; i < step; i++) {
                  const errors = validateStep(i);
                  if (Object.keys(errors).length > 0) {
                    canJump = false;
                    setFormErrors(errors);
                    toast.error("Please complete previous steps first.");
                    break;
                  }
                }
                if (canJump) {
                  setCurrentStep(step);
                  // setFormErrors({});
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-gray-300 text-gray-400"
              } transition-all duration-300`}
            >
              {step}
            </div>
            <span className="text-xs mt-1 font-medium">
              {step === 1 && "Basic Info"}
              {step === 2 && "Company Info"}
              {step === 3 && "Services"}
            </span>
          </div>
        ))}

        {/* Connecting lines */}
        <div className="absolute top-5 left-0 right-0 flex justify-between items-center pointer-events-none z-0">
          <div className="flex-1 mx-5">
            <div
              className={`h-1 rounded-full ${
                currentStep >= 2 ? "bg-primary" : "bg-gray-300"
              } transition-all duration-300`}
            ></div>
          </div>
          <div className="flex-1 mx-5">
            <div
              className={`h-1 rounded-full ${
                currentStep >= 3 ? "bg-primary" : "bg-gray-300"
              } transition-all duration-300`}
            ></div>
          </div>
        </div>
      </div>

      {/* Form content based on current step */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation buttons */}

      <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
        {/* Previous Button */}
        <div className="flex justify-start">
          {currentStep > 1 && (
            <Button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 bg-gray-500 w-full sm:w-auto justify-center sm:justify-start"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
          )}
        </div>

        {/* Next / Submit Buttons */}
        <div className="flex gap-4 flex-col sm:flex-row w-full sm:w-auto">
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <>
              <Button
                type="reset"
                onClick={handleReset}
                className="bg-gray-500 w-full sm:w-auto justify-center"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto justify-center"
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
};

export default ClientForm;
