import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  Link as LinkIcon,
  Plus,
  Calendar,
  User,
  DollarSign,
  FileDigit,
  FileCheck,
} from "lucide-react";
import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import SelectInput from "@/component/select/SelectInput";
import { toast } from "@/component/Toast";
import Loading from "@/utils/CLoading/Loading";
import {
  useAddServiceOptinMutation,
  useCreateClientIncomeMutation,
  useCreateFileMutation,
  useGetClientsQuery,
  useGetServiceOptionsQuery,
} from "@/redux/features/revenue/revenueSlice";
import DatePicker from "@/component/CustomCalander";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Loader from "@/component/Loader";

const ClientIncomeForm = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [activeTab, setActiveTab] = useState("upload");
  const [linkInput, setLinkInput] = useState("");
  const [linkType, setLinkType] = useState("");

  const { data: ClientData, isLoading } = useGetClientsQuery();
  const [createFile] = useCreateFileMutation();
  const [createClientIncome] = useCreateClientIncomeMutation();
  const { data: serviceOptions, refetch } = useGetServiceOptionsQuery();
  const [addServiceOption] = useAddServiceOptinMutation();
  const [inputText, setInputText] = useState("");


  const [formData, setFormData] = useState({
    client: null,
    amount: "",
    receivedAmount: "",
    services: [],
    description: "",
    refInvoiceNo: "",
    proof: [],
    selectedDate: null,
  });

  const [formErrors, setFormErrors] = useState({});

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const serviceOptionsData = serviceOptions?.data?.map((option) => ({
    label: option.label,
    value: option.value,
  }));


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
    setFormData((prev) => ({ ...prev, proof: [...prev.proof, ...files] }));
    setFormErrors((prev) => ({ ...prev, proof: "" }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, proof: [...prev.proof, ...files] }));
    setFormErrors((prev) => ({ ...prev, proof: "" }));
  };

  const handleAddLink = () => {
    const trimmedLink = linkInput.trim();
    const trimmedType = linkType.trim();
    if (!trimmedLink) {
      toast.error("Link URL cannot be empty.");
      return;
    }
    try {
      new URL(trimmedLink);
      setFormData((prev) => ({
        ...prev,
        proof: [
          ...prev.proof,
          {
            type: "link",
            url: trimmedLink,
            linkType: trimmedType ? trimmedType : "",
          },
        ],
      }));
      setLinkInput("");
      setLinkType("");
    } catch {
      toast.error("Invalid URL format. Please enter a valid link.");
    }
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      proof: prev.proof.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    let errors = {};
    // if (!formData.client) errors.client = "Client is required";
    if (!formData.amount) errors.amount = "Amount is required";
    if (!formData.receivedAmount)
      errors.receivedAmount = "Received amount is required";
    if (!formData.selectedDate) errors.selectedDate = "Date is required";
    // if (!formData.refInvoiceNo)
    //   errors.refInvoiceNo = "Ref Invoice No is required";
    if (!formData.services || formData.services.length === 0)
      errors.services = "Please select at least one service";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }
    try {
      const uploadedFiles = await Promise.all(
        formData.proof
          .filter((p) => !(p.type === "link"))
          .map(async (file) => {
            const fileFormData = new FormData();
            fileFormData.append("file", file);
            const resFile = await createFile(fileFormData).unwrap();
            return { url: resFile.fileUrl, linkType: "file" };
          })
      );

      const links = formData.proof
        .filter((p) => p.type === "link")
        .map((p) => ({ url: p.url, linkType: p.linkType }));

      const incomeData = {
        clientId: formData.client? formData.client.value : null,
        amount: Number(formData.amount),
        receivedAmount: Number(formData.receivedAmount),
        refInvoiceNo: formData?.refInvoiceNo ? formData?.refInvoiceNo : null,
        services: formData.services?.map((s) => ({
          label: s.label,
          value: s.value,
        })),
        description: formData.description,
        proof: [...uploadedFiles, ...links],
        date: formData.selectedDate,
      };

      

      // console.log(incomeData);

      await createClientIncome(incomeData).unwrap();
      // console.log(res.data)
      toast.success("Income Added successfully");
      handleReset();
      navigate("/income-management");
    } catch (error) {
      toast.error("Error submitting form");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      client: null,
      amount: "",
      receivedAmount: "",
      description: "",
      services: [],
      proof: [],
      refInvoiceNo: "",
      selectedDate: null,
    });
    setFormErrors({});
    setActiveTab("upload");
    setLinkInput("");
    setLinkType("");
    if (fileInputRef.current) fileInputRef.current.value = null;
    setResetKey((prevKey) => prevKey + 1);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">
            <Loader />
          </div>;

  return (
    <div className="p-6 sm:p-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto mb-10">
        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            Add Client Income
          </h2>
          <p className="text-primary-light text-sm">
            Record a new income transaction
          </p>
        </div>
        <form key={resetKey} onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> Transaction Date
              </label>
              <DatePicker
                value={
                  formData.selectedDate ? new Date(formData.selectedDate) : null
                }
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
              {formErrors.selectedDate && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.selectedDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <User className="h-4 w-4 mr-1" /> Select Client
              </label>
              <SelectInput
                label="Select Your Client"
                value={formData.client}
                onChange={(selected) => {
                  setFormData((prev) => ({ ...prev, client: selected }));
                  // setFormErrors((prev) => ({ ...prev, client: "" }));
                }}
                options={
                  ClientData?.data?.map((client) => ({
                    label: client.name,
                    value: client._id,
                  })) || []
                }
                // error={formErrors.client}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FileDigit className="h-4 w-4 mr-1" /> Reference Invoice No
              </label>
              <FloatingInput
                type="text"
                value={formData.refInvoiceNo}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    refInvoiceNo: e.target.value,
                  }));
                  // setFormErrors((prev) => ({ ...prev, refInvoiceNo: "" }));
                }}
                // error={formErrors.refInvoiceNo}
                label="Invoice"
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FileCheck className="h-4 w-4 mr-1" /> Services
              </label>
              <SelectInput
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
                label="Select services"
                className="w-full"
              />
              {formData.services.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.services.map((service, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"
                    >
                      {service.label}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            services: prev.services.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" /> Amount ($)
              </label>
              <FloatingInput
                type="number"
                value={formData.amount}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, amount: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, amount: "" }));
                }}
                error={formErrors.amount}
                placeholder="0.00"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" /> Received Amount (BDT)
              </label>
              <FloatingInput
                type="number"
                value={formData.receivedAmount}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    receivedAmount: e.target.value,
                  }));
                  setFormErrors((prev) => ({ ...prev, receivedAmount: "" }));
                }}
                error={formErrors.receivedAmount}
                placeholder="0.00"
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <FloatingTextarea
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proof / Documentation
              </label>
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  type="button"
                  className={`py-2 px-4 font-medium text-sm focus:outline-none flex items-center ${
                    activeTab === "upload"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("upload")}
                >
                  <Upload className="h-4 w-4 mr-1" /> Upload File
                </button>
                <button
                  type="button"
                  className={`py-2 px-4 font-medium text-sm focus:outline-none flex items-center ${
                    activeTab === "link"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("link")}
                >
                  <LinkIcon className="h-4 w-4 mr-1" /> Add Link
                </button>
              </div>
              {activeTab === "upload" ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 ${
                    isDragging ? "border-primary bg-blue-50" : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-3 text-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Drag & drop files here
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-4 bg-primary text-white rounded-md text-sm font-medium flex items-center"
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
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <FloatingInput
                        label="Document URL"
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <FloatingInput
                        label="Link Type"
                        type="text"
                        value={linkType}
                        onChange={(e) => setLinkType(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddLink}
                    className="py-2 px-4 bg-primary text-white rounded-md text-sm font-medium flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Link
                  </Button>
                </div>
              )}
              {formErrors.proof && (
                <p className="text-red-500 text-sm mt-2">{formErrors.proof}</p>
              )}
              {formData.proof.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Attachments ({formData.proof.length})
                  </h4>
                  <div className="space-y-2">
                    {formData.proof.map((att, idx) =>
                      att.type === "link" ? (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded">
                              <LinkIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-600 hover:underline truncate block"
                                title={att.url}
                              >
                                {att.url}
                              </a>
                              {att.linkType && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {att.linkType}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">
                                {att.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatFileSize(att.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientIncomeForm;
