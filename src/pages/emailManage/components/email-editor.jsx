"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Search,
  AlertCircle,
  Loader,
  SendHorizonal,
  Mail,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "@/component/Toast";
import {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useGetTemplatesQuery,
  useSendEmailMutation,
  useUpdateTemplateMutation,
  useFetchEmailsQuery,
} from "@/redux/features/email/emailApiSlice";
import { CustomCheckbox } from "@/component/CustomCheckbox";
import { cn } from "@/utils/cn";
import { RichTextEditor } from "@/component/RichTextEditor";
import { FloatingInput } from "@/component/FloatiingInput";
import SelectInput from "@/component/select/SelectInput";
import Button from "@/component/Button";
import { useGetDepartmentListQuery } from "@/redux/features/department/departmentApiSlice";

export function EmailEditor({
  emailContent,
  setEmailContent,
  handleSendEmail,
  isSingleLoading,
  selectionType,
  onSelectionTypeChange,
  filters,
  onFilterChange,
  employeeEmails,
  isLoadingEmails,
  isBulkSendMode = false,
  setIsBulkSendMode,
  setBulkSendOptions,
  bulkSendOptions = { role: "", plan: [], orgId: "", status: "" },
  userType,
  onUserTypeChange,
}) {
  const [activeField, setActiveField] = useState(null);
  const navigate = useNavigate();
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    content: "<p>Enter your template content here...</p>",
  });
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState("#3a41e2");
  const [templatePanelWidth, setTemplatePanelWidth] = useState(300); // Declare templatePanelWidth
  const resizeDragRef = useRef(null); // Declare resizeDragRef

  // New state to track selected template for highlighting
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const user = useSelector((state) => state.userSlice.user);
  const templateEditorRef = useRef(null);
  const editTemplateEditorRef = useRef(null);

  // Redux API hooks
  const {
    data,
    isLoading: getLoad,
    error: getError,
    refetch,
  } = useGetTemplatesQuery(
    {
      status: "custom",
    },
    { refetchOnMountOrArgChange: true }
  );

  const {
    data: departmentData,
    isLoading: isDepartmentLoading,
    isError: isDepartmentError,
  } = useGetDepartmentListQuery();

  const [createTemplate, { isLoading }] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] =
    useDeleteTemplateMutation();
  const [sendEmail, { isLoading: isSendingBulk, isSuccess, isError, error }] =
    useSendEmailMutation();

  const { data: emailsData, isFetching } = useFetchEmailsQuery(
    userType === "systemUsers"
      ? {
          role: filters.role,
          status: filters.status,
          department: filters.department,
        }
      : {
          role: "client",
          clientIds: filters.clientIds,
          member: filters.member,
          senderType: filters.senderType,
        },
    {
      skip: !isBulkSendMode,
    }
  );

  // User type options for radio buttons
  const USER_TYPE_OPTIONS = [
    { value: "systemUsers", label: "System Users" },
    { value: "clients", label: "Clients" },
  ];

  // Selection type options
  const SELECT_TYPE_OPTIONS = [
    { value: "allUsers", label: "All Users" },
    { value: "byRole", label: "By Role" },
    { value: "byDepartment", label: "By Department" },
  ];

  // Role options with "All" option
  const ROLE_OPTIONS = [
    { value: "", label: "All" },
    { value: "Employee", label: "Employee" },
    { value: "Admin", label: "Admin" },
    { value: "Manager", label: "Manager" },
    { value: "DepartmentHead", label: "Department Head" },
  ];

  // Status options with "All" option
  const STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "Pending", label: "Pending" },
    { value: "Active", label: "Active" },
    { value: "Terminated", label: "Terminated" },
    { value: "OnLeave", label: "On Leave" },
    { value: "Resigned", label: "Resigned" },
  ];

  // Department options with "All" option - now using real API data
  const DEPARTMENT_OPTIONS = [
    { value: "", label: "All" },
    ...(departmentData?.data?.map((dept) => ({
      value: dept._id, // Using _id instead of demo id
      label: dept.name,
    })) || []),
  ];

  const [isFetchingEmails, setIsFetchingEmails] = useState(false); // Declare isFetchingEmails state

  const CLIENT_OPTIONS = useMemo(() => {
    if (!emailsData?.clients) return [];

    const options = emailsData.clients.map((client) => ({
      value: client._id,
      label: `${client.name} (${client.email || client.companyEmail})`,
    }));

    return [{ value: "", label: "Select All Clients" }, ...options];
  }, [emailsData?.clients]);

  const MEMBER_OPTIONS = useMemo(() => {
    if (!emailsData?.members || !filters.clientIds?.length) return [];

    const filteredMembers = emailsData.members.filter((member) =>
      filters.clientIds.includes(member.clientId)
    );

    const options = filteredMembers.map((member) => ({
      value: member.name,
      label: `${member.name} (${member.email})`,
    }));

    return [{ value: "", label: "Select All Members" }, ...options];
  }, [emailsData?.members, filters.clientIds]);

  const SENDER_TYPE_OPTIONS = [
    { value: "both", label: "Both Clients & Members" },
    { value: "clients", label: "Clients Only" },
    { value: "members", label: "Members Only" },
  ];

  // Filter templates based on search term and then sort alphabetically
  const filteredTemplates = data
    ?.filter((template) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return template?.title?.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      const titleA = (a.title || a.name || "").toLowerCase();
      const titleB = (b.title || b.name || "").toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailContent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewTemplateChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate({
      ...newTemplate,
      [name]: value,
    });
  };

  const handleMessageBodyContentChange = (newHtml) => {
    setEmailContent((prev) => ({
      ...prev,
      messageBody: newHtml,
    }));
  };

  const handleTemplateContentChange = (newHtml) => {
    setNewTemplate((prev) => ({
      ...prev,
      content: newHtml,
    }));
  };

  // Handle changes in bulk send options using react-select's selectedOption object
  const handleBulkOptionChange = (name, selectedOption) => {
    setBulkSendOptions((prev) => {
      const newState = { ...prev };

      if (name === "role") {
        const newRoleValue = selectedOption ? selectedOption.value : "";
        newState.role = newRoleValue;
        // Clear plan and orgId if the role changes to something that doesn't use them
        if (newRoleValue !== "Plan") {
          newState.plan = [];
        }
        if (newRoleValue !== "Organization") {
          newState.orgId = "";
        }
        // Update emailContent.to based on selected role label
        setEmailContent((prevEmail) => ({
          ...prevEmail,
          to: selectedOption ? selectedOption.label : "",
        }));
      } else if (name === "plan") {
        // For react-select multi-select, selectedOption is an array of selected option objects
        newState.plan = selectedOption
          ? selectedOption.map((option) => option.value)
          : [];
        // Update emailContent.to with plan names
        setEmailContent((prevEmail) => ({
          ...prevEmail,
          to: `Plans (${
            selectedOption
              ? selectedOption.map((opt) => opt.label).join(", ")
              : ""
          })`,
        }));
      } else if (name === "orgId") {
        // For react-select single-select, selectedOption is a single option object
        newState.orgId = selectedOption ? selectedOption.value : "";
        // Update emailContent.to with organization name
        setEmailContent((prevEmail) => ({
          ...prevEmail,
          to: selectedOption ? `Organization (${selectedOption.label})` : "",
        }));
      } else if (name === "status") {
        newState.status = selectedOption ? selectedOption.value : "";
      }
      return newState;
    });
  };

  // Update emailContent.to when emails data changes
  useEffect(() => {
    if (isBulkSendMode && emailsData?.emails) {
      setEmailContent((prev) => ({
        ...prev,
        to: emailsData.emails.join(", "),
      }));
    } else if (isBulkSendMode) {
      setEmailContent((prev) => ({
        ...prev,
        to: "",
      }));
    }
  }, [emailsData?.emails, isBulkSendMode, setEmailContent]);

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const saveNewTemplate = async () => {
    if (!newTemplate.title.trim()) {
      toast.error("Please provide a title for your template");
      return;
    }

    if (
      !newTemplate.content.trim() ||
      newTemplate.content === "<p>Enter your template content here...</p>"
    ) {
      toast.error("Please provide content for your template");
      return;
    }

    try {
      const templateId = newTemplate.title.toLowerCase().replace(/\s+/g, "-");
      const templateContent = newTemplate.content;
      const newTemplateObj = {
        id: templateId,
        name: newTemplate.title,
        body: `${templateContent}`,
      };

      await createTemplate({
        subject: "",
        header: "",
        footer: "",
        title: newTemplate.title,
        body: `${templateContent}`,
        userId: user?._id,
        userModel: user?.role,
      }).unwrap();

      toast.success("Template created successfully!");
      await refetch();

      setNewTemplate({
        title: "",
        content: "<p>Enter your template content here...</p>",
      });
      setShowNewTemplateForm(false);
    } catch (err) {
      toast.error("Failed to create template. Please try again.");
      console.error("Template creation error:", err);
    }
  };

  const saveEditedTemplate = async () => {
    if (!newTemplate.title.trim()) {
      toast.error("Please provide a title for your template");
      return;
    }

    if (
      !newTemplate.content.trim() ||
      newTemplate.content ===
        "<p>Enter your template content here 자체가...</p>"
    ) {
      toast.error("Please provide content for your template");
      return;
    }

    try {
      const editorContent = newTemplate.content;

      await updateTemplate({
        id: editingTemplate,
        title: newTemplate.title,
        subject: "",
        header: "",
        footer: "",
        body: `${editorContent}`,
        userId: user?._id,
        userModel: user?.role,
      }).unwrap();

      toast.success("Template updated successfully!");
      await refetch();

      setNewTemplate({
        title: "",
        content: "<p>Enter your template content here 자체가...</p>",
      });
      setEditingTemplate(null);
    } catch (err) {
      toast.error("Failed to update template. Please try again.");
      console.error("Template update error:", err);
    }
  };

  const cancelEdit = () => {
    setEditingTemplate(null);
    setNewTemplate({
      title: "",
      content: "<p>Enter your template content here 자체가...</p>",
    });
  };

  const confirmDeleteTemplate = (templateId) => {
    setShowDeleteConfirm(templateId);
  };

  const deleteTemplateItem = async (templateId) => {
    const data = {
      id: templateId,
      userId: user?._id,
      userModel: user?.role,
    };
    try {
      await deleteTemplate(data).unwrap();
      toast.success("Template deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete template. Please try again.");
      console.error("Template deletion error:", err);
    } finally {
      await refetch();
      setShowDeleteConfirm(null);
    }
  };

  // Completely revised applyTemplate function
  const applyTemplate = (templateId) => {
    // First check API data
    const apiTemplate = data?.find(
      (t) => t._id === templateId || t.id === templateId
    );

    if (apiTemplate) {
      // Update the React state, RichTextEditor will handle updating its DOM
      setEmailContent((prev) => ({
        ...prev,
        messageBody: apiTemplate.body,
        subject: apiTemplate.subject || "", // Populate subject from template
      }));
      setActiveField("messageBody");
      setSelectedTemplateId(apiTemplate._id || apiTemplate.id); // Set selected template ID
    }
  };

  const handleSendBulkEmail = async () => {
    const { role, plan, orgId, status } = bulkSendOptions;

    if (!emailContent.subject.trim()) {
      toast.error("Please enter an email subject.");
      return;
    }
    if (
      !emailContent.messageBody.trim() ||
      emailContent.messageBody === "<p>Enter your message here...</p>"
    ) {
      toast.error("Please enter a message body.");
      return;
    }

    if (role === "Organization" && !orgId.trim()) {
      toast.error(
        "Organization ID is required when sending to 'Organization' role."
      );
      return;
    }
    if (role === "Plan" && plan.length === 0) {
      toast.error(
        "At least one Plan ID is required when sending to 'Plan' role."
      );
      return;
    }

    const payload = {
      to: emailContent?.to,
      subject: emailContent?.subject,
      body: emailContent?.messageBody,
      userId: user?._id,
    };

    try {
      await sendEmail(payload).unwrap();
      toast.success("Bulk email sent successfully!");
      console.log("Bulk Email Payload:", payload);
      setBulkSendOptions({ role: "", plan: [], orgId: "", status: "" }); // Reset status to empty string
      setEmailContent((prev) => ({ ...prev, to: "" })); // Clear 'to' field after sending bulk
    } catch (err) {
      toast.error(
        `Failed to send bulk email: ${
          err?.data?.message || err?.message || "Unknown error"
        }`
      );
      console.error("Bulk email error:", err);
    }
  };

  const handleSelectAll = () => {
    if (userType === "systemUsers") {
      // Select all system user filters
      const allRoles = ROLE_OPTIONS.filter((opt) => opt.value !== "").map(
        (opt) => opt.value
      );
      const allStatuses = STATUS_OPTIONS.filter((opt) => opt.value !== "").map(
        (opt) => opt.value
      );
      const allDepartments =
        departmentData?.data?.map((dept) => dept._id) || [];

      onFilterChange("role", allRoles);
      onFilterChange("status", allStatuses);
      onFilterChange("department", allDepartments);
    } else {
      // Select all clients and members
      const allClientIds =
        emailsData?.clients?.map((client) => client._id) || [];
      const allMemberNames =
        emailsData?.members?.map((member) => member.name) || [];

      onFilterChange("clientIds", allClientIds);
      onFilterChange("member", allMemberNames);
      onFilterChange("senderType", "both");
    }
  };

  const handleResetAll = () => {
    if (userType === "systemUsers") {
      onFilterChange("role", []);
      onFilterChange("status", []);
      onFilterChange("department", []);
    } else {
      onFilterChange("clientIds", []);
      onFilterChange("member", []);
      onFilterChange("senderType", "both");
    }

    // Reset email content to field
    setEmailContent((prev) => ({
      ...prev,
      to: "",
    }));

    setBulkSendOptions({ role: "", plan: [], orgId: "", status: "" }); // Reset status to empty string
  };

  const startEditTemplate = (template) => {
    setEditingTemplate(template._id || template.id);
    setNewTemplate({
      title: template.title || template.name,
      content: template.body,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Top row: From, To, Bulk Checkbox, Subject */}
        <div
          className={`${
            isBulkSendMode
              ? "flex flex-col space-y-4"
              : "grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          }`}
        >
          {/* From */}
          <div>
            <FloatingInput
              id="from"
              name="from"
              type="email"
              label="From"
              value={emailContent.from}
              disabled
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* To Field and Bulk Checkbox */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                {isBulkSendMode ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To
                    </label>
                    <textarea
                      id="to"
                      name="to"
                      rows={3}
                      value={emailContent.to}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                      placeholder="Enter email addresses separated by commas"
                    />
                  </div>
                ) : (
                  <FloatingInput
                    id="to"
                    name="to"
                    type="text"
                    label="To"
                    value={emailContent.to}
                    onChange={handleInputChange}
                    className="flex-1"
                    required
                  />
                )}
              </div>
              <CustomCheckbox
                label="Bulk Email"
                checked={isBulkSendMode || false}
                onChange={(e) => {
                  setIsBulkSendMode(e.target.checked);
                  if (!e.target.checked) {
                    setEmailContent((prev) => ({ ...prev, to: "" }));
                    setBulkSendOptions({
                      role: "",
                      plan: [],
                      orgId: "",
                      status: "",
                    });
                    // Reset all filters
                    onFilterChange("role", []);
                    onFilterChange("status", []);
                    onFilterChange("department", []);
                    onFilterChange("clientIds", []);
                    onFilterChange("member", []);
                    onFilterChange("senderType", "both");
                  }
                }}
              />
            </div>

            {isBulkSendMode && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Recipients
                </label>
                <div className="flex gap-6">
                  {USER_TYPE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="userType"
                        value={option.value}
                        checked={userType === option.value}
                        onChange={(e) => onUserTypeChange(e.target.value)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isBulkSendMode && (
            <div>
              <FloatingInput
                id="subject"
                name="subject"
                type="text"
                label="Subject"
                value={emailContent.subject}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
        </div>

        {isBulkSendMode && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <FloatingInput
                id="subject"
                name="subject"
                type="text"
                label="Subject"
                value={emailContent.subject}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        )}

        {isBulkSendMode && (
          <div className="col-span-full p-4 border rounded-md bg-gray-50">
            <div className="col-span-full flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">
                {userType === "systemUsers"
                  ? "System User Selection"
                  : "Client Selection"}
              </h3>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-[#8B6A42] transition-colors"
              >
                Select All
              </button>
            </div>

            {userType === "systemUsers" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Role Dropdown */}
                <div>
                  <SelectInput
                    id="roleFilter"
                    name="role"
                    label="Role"
                    isMulti
                    options={ROLE_OPTIONS}
                    value={ROLE_OPTIONS.filter((option) =>
                      filters.role.includes(option.value)
                    )}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions
                        ? selectedOptions.map((opt) => opt.value)
                        : [];
                      if (
                        selectedOptions &&
                        selectedOptions.some((opt) => opt.value === "")
                      ) {
                        const allValues = ROLE_OPTIONS.filter(
                          (opt) => opt.value !== ""
                        ).map((opt) => opt.value);
                        onFilterChange("role", allValues);
                      } else {
                        onFilterChange("role", values);
                      }
                    }}
                    placeholder="Select Roles"
                  />
                </div>

                {/* Status Dropdown */}
                <div>
                  <SelectInput
                    id="statusFilter"
                    name="status"
                    label="Status"
                    isMulti
                    options={STATUS_OPTIONS}
                    value={STATUS_OPTIONS.filter((option) =>
                      filters.status.includes(option.value)
                    )}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions
                        ? selectedOptions.map((opt) => opt.value)
                        : [];
                      if (
                        selectedOptions &&
                        selectedOptions.some((opt) => opt.value === "")
                      ) {
                        const allValues = STATUS_OPTIONS.filter(
                          (opt) => opt.value !== ""
                        ).map((opt) => opt.value);
                        onFilterChange("status", allValues);
                      } else {
                        onFilterChange("status", values);
                      }
                    }}
                    placeholder="Select Status"
                  />
                </div>

                {/* Department Dropdown */}
                <div>
                  <SelectInput
                    id="departmentFilter"
                    name="department"
                    label="Department"
                    isMulti
                    options={DEPARTMENT_OPTIONS}
                    value={DEPARTMENT_OPTIONS.filter((option) =>
                      filters.department.includes(option.value)
                    )}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions
                        ? selectedOptions.map((opt) => opt.value)
                        : [];
                      if (
                        selectedOptions &&
                        selectedOptions.some((opt) => opt.value === "")
                      ) {
                        const allValues =
                          departmentData?.data?.map((dept) => dept._id) || [];
                        onFilterChange("department", allValues);
                      } else {
                        onFilterChange("department", values);
                      }
                    }}
                    placeholder="Select Departments"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Client Selection */}
                <div>
                  <SelectInput
                    id="clientFilter"
                    name="clientIds"
                    label="Select Clients"
                    isMulti
                    options={CLIENT_OPTIONS}
                    value={CLIENT_OPTIONS.filter((option) =>
                      filters.clientIds?.includes(option.value)
                    )}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions
                        ? selectedOptions.map((opt) => opt.value)
                        : [];
                      if (
                        selectedOptions &&
                        selectedOptions.some((opt) => opt.value === "")
                      ) {
                        const allClientIds =
                          emailsData?.clients?.map((client) => client._id) ||
                          [];
                        onFilterChange("clientIds", allClientIds);
                        const allMemberNames =
                          emailsData?.members?.map((member) => member.name) ||
                          [];
                        onFilterChange("member", allMemberNames);
                      } else {
                        onFilterChange("clientIds", values);
                        onFilterChange("member", []);
                      }
                    }}
                    placeholder="Select Clients"
                  />
                </div>

                {/* Sender Type Selection */}
                <div>
                  <SelectInput
                    id="senderTypeFilter"
                    name="senderType"
                    label="Sender Type"
                    options={SENDER_TYPE_OPTIONS}
                    value={SENDER_TYPE_OPTIONS.find(
                      (option) => option.value === filters.senderType
                    )}
                    onChange={(selectedOption) => {
                      onFilterChange(
                        "senderType",
                        selectedOption?.value || "both"
                      );
                    }}
                    placeholder="Select Sender Type"
                  />
                </div>

                {/* Member Selection */}
                <div>
                  <SelectInput
                    id="memberFilter"
                    name="member"
                    label="Select Members"
                    isMulti
                    options={MEMBER_OPTIONS}
                    value={MEMBER_OPTIONS.filter((option) =>
                      filters.member?.includes(option.value)
                    )}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions
                        ? selectedOptions.map((opt) => opt.value)
                        : [];
                      if (
                        selectedOptions &&
                        selectedOptions.some((opt) => opt.value === "")
                      ) {
                        const filteredMembers =
                          emailsData?.members?.filter((member) =>
                            filters.clientIds?.includes(member.clientId)
                          ) || [];
                        const allFilteredMemberNames = filteredMembers.map(
                          (member) => member.name
                        );
                        onFilterChange("member", allFilteredMemberNames);
                      } else {
                        onFilterChange("member", values);
                      }
                    }}
                    placeholder="Select Members"
                    isDisabled={!filters.clientIds?.length}
                  />
                </div>
              </div>
            )}

            {/* Recipients Preview */}
            <div className="col-span-full mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected Recipients
              </label>
              {isFetchingEmails || isFetching ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader className="h-4 w-4 animate-spin" />
                  Loading recipients...
                </div>
              ) : (
                (() => {
                  const hasFilters =
                    userType === "systemUsers"
                      ? filters.role.length > 0 ||
                        filters.status.length > 0 ||
                        filters.department.length > 0
                      : filters.clientIds?.length > 0;

                  const recipientCount = emailsData?.emails?.length || 0;

                  if (!hasFilters) {
                    return (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="h-4 w-4" />
                        No filters selected
                      </div>
                    );
                  } else if (recipientCount > 0) {
                    return (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <Mail className="h-4 w-4" />
                        {recipientCount} recipient
                        {recipientCount !== 1 ? "s" : ""} selected
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center gap-2 text-sm text-orange-500">
                        <AlertCircle className="h-4 w-4" />
                        No recipients match the selected filters
                      </div>
                    );
                  }
                })()
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex email-editor-container relative">
        <div className="flex-1 space-y-6 pr-4 min-w-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Body
            </label>
            <RichTextEditor
              initialContent={emailContent.messageBody}
              onContentChange={handleMessageBodyContentChange}
              onFocus={() => setActiveField("messageBody")}
              minHeight="500px"
              buttonBackgroundColor={buttonBackgroundColor}
              setButtonBackgroundColor={setButtonBackgroundColor}
            />
          </div>
          <div className="flex  mt-6">
            <Button
              onClick={isBulkSendMode ? handleSendBulkEmail : handleSendEmail}
              disabled={isSendingBulk || isSingleLoading}
              isLoading={isSendingBulk || isSingleLoading}
              icon={SendHorizonal}
              variant="primary"
              className="bg-primary hover:bg-primary px-6"
            >
              {isBulkSendMode ? "Send Bulk Email" : "Send Email"}
            </Button>
          </div>
        </div>

        <div
          ref={resizeDragRef}
          className="w-3 cursor-pointer bg-gray-200 hover:bg-primary-300 active:bg-primary-400 transition-colors"
          title="Drag to resize"
        ></div>

        <div
          className="border-l pl-4 overflow-hidden"
          style={{ width: `${templatePanelWidth}px` }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm text-gray-700">
              Email Templates
            </h3>
            <Button
              onClick={() => {
                navigate("/emails/templates");
              }}
              icon={Plus}
              variant="primary"
              size="sm"
              className="bg-primary hover:bg-primary text-sm"
            >
              Manage Templates
            </Button>
          </div>

          <div className="relative mb-4">
            <FloatingInput
              type="text"
              label="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-3.5 w-3.5 text-gray-400" />}
              className="text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-2 flex items-center"
              >
                <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {showNewTemplateForm && (
            <div
              className="mb-4 p-3 border rounded-md"
              style={{ borderColor: "#3a41e2" }}
            >
              <div className="flex justify-between items-center mb-2">
                <h4
                  className="font-medium text-sm"
                  style={{ color: "#3a41e2" }}
                >
                  Create New Template
                </h4>
                <button
                  onClick={() => {
                    setShowNewTemplateForm(false);
                    setNewTemplate({
                      title: "",
                      content: "<p>Enter your template content here...</p>",
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <FloatingInput
                    id="templateTitle"
                    name="title"
                    type="text"
                    label="Template Title"
                    value={newTemplate.title}
                    onChange={handleNewTemplateChange}
                    placeholder="e.g., Patient Discharge"
                    className="text-xs"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="templateContent"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Template Content
                  </label>
                  <RichTextEditor
                    initialContent={newTemplate.content}
                    onContentChange={handleTemplateContentChange}
                    onFocus={() => setActiveField("newTemplateContent")}
                    minHeight="120px"
                    buttonBackgroundColor={buttonBackgroundColor}
                    setButtonBackgroundColor={setButtonBackgroundColor}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={saveNewTemplate}
                    disabled={isLoading}
                    isLoading={isLoading}
                    variant="primary"
                    size="sm"
                    className="bg-primary hover:bg-primary text-xs"
                  >
                    Save Template
                  </Button>
                </div>
              </div>
            </div>
          )}

          {editingTemplate && (
            <div
              className="mb-4 p-3 border rounded-md"
              style={{ borderColor: "#3a41e2" }}
            >
              <div className="flex justify-between items-center mb-2">
                <h4
                  className="font-medium text-sm"
                  style={{ color: "#3a41e2" }}
                >
                  Edit Template
                </h4>
                <button
                  onClick={cancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <FloatingInput
                    id="editTemplateTitle"
                    name="title"
                    type="text"
                    label="Template Title"
                    value={newTemplate.title}
                    onChange={handleNewTemplateChange}
                    className="text-xs"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="editTemplateContent"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Template Content
                  </label>
                  <RichTextEditor
                    initialContent={newTemplate.content}
                    onContentChange={handleTemplateContentChange}
                    onFocus={() => setActiveField("editTemplateContent")}
                    minHeight="120px"
                    buttonBackgroundColor={buttonBackgroundColor}
                    setButtonBackgroundColor={setButtonBackgroundColor}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={cancelEdit}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveEditedTemplate}
                    variant="primary"
                    size="sm"
                    className="bg-primary hover:bg-primary text-xs"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {getLoad && (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Loader className="h-5 w-5 text-gray-400 animate-spin mb-2" />
              <p className="text-xs text-gray-500">Loading templates...</p>
            </div>
          )}

          {getError && (
            <div className="flex flex-col items-center justify-center p-4 text-center border border-red-200 rounded-md bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-500 mb-2" />
              <p className="text-xs text-red-500">Failed to load templates</p>
            </div>
          )}

          {!getLoad && filteredTemplates?.length === 0 && (
            <div className="flex flex-col items-center justify-center p-4 text-center border border-dashed rounded-md">
              <AlertCircle className="h-5 w-5 text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">No templates found</p>
            </div>
          )}

          <div className="h-[500px] overflow-y-auto pr-2 space-y-3">
            {filteredTemplates?.map((template) => (
              <div
                onClick={() => applyTemplate(template._id || template.id)}
                key={template._id || template.id}
                className={cn(
                  "p-3 rounded-md hover:bg-primaryDark/15 transition-colors relative group",
                  (template._id || template.id) === selectedTemplateId
                    ? "border-2 bg-primaryDark/10 border-primary" // Thicker border for selected
                    : "border-2 border-gray-300" // Regular border for unselected
                )}
              >
                <div className="flex cursor-pointer items-center gap-3">
                  <div className="bg-primary text-white p-3 rounded-full">
                    <Mail size={16} />
                  </div>
                  <div className="">
                    <h4
                      className="font-medium text-sm mb-1"
                      style={{ color: "#3a41e2" }}
                    >
                      {template.title || template.name}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {template.subject.substring(0, 60)}...
                    </p>
                  </div>
                </div>

                {showDeleteConfirm === (template._id || template.id) && (
                  <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center p-2 rounded-md">
                    <p className="text-xs text-center mb-2">
                      Delete this template?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(null);
                        }}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplateItem(template._id || template.id);
                        }}
                        className="px-2 py-1 text-xs text-white bg-red-500 rounded-md"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
