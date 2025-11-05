"use client";

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
import { toast } from "@/component/Toast";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddServiceOptinMutation,
  useCreateFileMutation,
  useGetClientsQuery,
  useGetIncomesDetailsQuery,
  useGetServiceOptionsQuery,
  useUpdateIncomeDeaislMutation,
} from "@/redux/features/revenue/revenueSlice";
import Loading from "@/utils/CLoading/Loading";
import DatePicker from "@/component/CustomCalander";
import SelectInput from "@/component/select/SelectInput";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import Button from "@/component/Button";
import { useDeleteFileMutation } from "@/redux/features/upload/uploadApiSlice";
import Loader from "@/component/Loader";

const UpdateIncomeForm = () => {
  const { incomeId } = useParams();
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

  const { data: serviceOptions, refetch } = useGetServiceOptionsQuery();
  const [addServiceOption] = useAddServiceOptinMutation();
  const [inputText, setInputText] = useState("");
  const [deletedProof, setDeletedProf] = useState([]);
  const [deleteFile] = useDeleteFileMutation();
  const [updateIncome] = useUpdateIncomeDeaislMutation();
  const { data: incomeDetails, isLoading: incomeLoading } =
    useGetIncomesDetailsQuery(incomeId);

  const [formData, setFormData] = useState({
    client: null,
    amount: "",
    receivedAmount: "",
    services: [],
    description: "",
    refInvoiceNo: null,
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

  // Populate form with fetched data
  useEffect(() => {
    if (!incomeDetails?.data) return;

    const detailsData = {
      client: incomeDetails.data?.clientId
        ? {
            label: incomeDetails.data.clientId?.name,
            value: incomeDetails.data.clientId?._id,
          }
        : null,
      amount: incomeDetails.data.amount,
      receivedAmount: incomeDetails.data.receivedAmount,
      services: incomeDetails.data.services?.map((service) => ({
        label: service.label,
        value: service.value,
      })),
      description: incomeDetails.data.description,
      refInvoiceNo: incomeDetails.data.refInvoiceNo,
      proof: incomeDetails.data.proof?.map((p) => ({
        type: "link",
        url: p.url,
        linkType: p.linkType || "",
      })),
      selectedDate: incomeDetails.data.date,
    };
    setFormData(detailsData);
  }, [incomeDetails]);

  const serviceOptionsData = serviceOptions?.data?.map((option) => ({
    label: option.label,
    value: option.value,
  }));

  // Drag & Drop handlers
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
    const files = Array.from(e.dataTransfer.files).map((file) => ({
      type: "file",
      file,
      name: file.name,
      size: file.size,
    }));
    setFormData((prev) => ({ ...prev, proof: [...prev.proof, ...files] }));
    setFormErrors((prev) => ({ ...prev, proof: "" }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      type: "file",
      file,
      name: file.name,
      size: file.size,
    }));
    setFormData((prev) => ({ ...prev, proof: [...prev.proof, ...files] }));
    setFormErrors((prev) => ({ ...prev, proof: "" }));
  };

  // Add link handler
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
            linkType: trimmedType || "",
          },
        ],
      }));
      setLinkInput("");
      setLinkType("");
    } catch {
      toast.error("Invalid URL format. Please enter a valid link.");
    }
  };

  // Remove file or link
  const removeFile = (index) => {
    const attachmentToRemove = formData.proof[index];
    if (attachmentToRemove.url && attachmentToRemove.url.includes("uploads")) {
      setDeletedProf((prev) => [...prev, attachmentToRemove]);
      // await deleteFile(attachmentToRemove.url.split("/").pop()).unwrap();
    }
    setFormData((prev) => ({
      ...prev,
      proof: prev.proof.filter((_, i) => i !== index),
    }));
  };

  // console.log(deletedProof)

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

  // Submit handler
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
      // Upload files
      const uploadedFiles = await Promise.all(
        formData.proof
          .filter((p) => p.type === "file")
          .map(async (fileObj) => {
            const fileFormData = new FormData();
            fileFormData.append("file", fileObj.file);
            const resFile = await createFile(fileFormData).unwrap();
            return { url: resFile.fileUrl, linkType: "file" };
          })
      );

      // Get links
      const links = formData.proof
        .filter((p) => p.type === "link")
        .map((p) => ({ url: p.url, linkType: p.linkType }));

      deletedProof.forEach(async (f) => {
        await deleteFile(f.url.split("/").pop()).unwrap();
      });

      const incomeData = {
        clientId: formData.client? formData.client.value : null,
        amount: Number(formData.amount),
        receivedAmount: Number(formData.receivedAmount),
        refInvoiceNo: formData.refInvoiceNo,
        services: formData.services.map((s) => ({
          label: s.label,
          value: s.value,
        })),
        description: formData.description,
        proof: [...uploadedFiles, ...links],
        date: formData.selectedDate,
      };

      await updateIncome({ id: incomeId, data: incomeData }).unwrap();
      toast.success("Income Updated successfully");
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
      refInvoiceNo: null,
      selectedDate: null,
    });
    setFormErrors({});
    setActiveTab("upload");
    setLinkInput("");
    setLinkType("");
    setInputText("");
    if (fileInputRef.current) fileInputRef.current.value = null;
    setResetKey((prev) => prev + 1);
  };

  if (isLoading || incomeLoading) return <div className="flex items-center justify-center min-h-screen">
            <Loader />
          </div>;

  return (
    <div className="p-6 sm:p-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto mb-10">
        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Update Income</h2>
          <p className="text-primary-light text-sm">
            Update income transaction
          </p>
        </div>
        <form key={resetKey} onSubmit={handleSubmit} className="p-6">
          {/* DATE */}
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

            {/* CLIENT */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
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

            {/* INVOICE */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
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

            {/* SERVICES */}
            <div className="md:col-span-2">
              <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
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
                className="w-full"
              />

              {formData?.services?.length > 0 && (
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
            </div>

            {/* AMOUNT */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" /> Amount
              </label>
              <FloatingInput
                type="number"
                value={formData.amount}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, amount: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, amount: "" }));
                }}
                error={formErrors.amount}
                label="Amount"
                className="w-full"
              />
            </div>

            {/* RECEIVED AMOUNT */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" /> Received Amount
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
                label="Received Amount"
                className="w-full"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FileText className="h-4 w-4 mr-1" /> Description
              </label>
              <FloatingTextarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          {/* PROOF / DOCUMENTATION */}
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
                  <p className="text-sm font-medium text-gray-700">
                    Drag & drop files here
                  </p>
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

            {formData?.proof?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Attachments ({formData.proof.length})
                </h4>
                <div className="space-y-2">
                  {formData.proof.map((att, idx) =>
                    att.type === "file" ? (
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
                    ) : (
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
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT & RESET */}
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

export default UpdateIncomeForm;
