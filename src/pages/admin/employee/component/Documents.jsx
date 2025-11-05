import { FloatingInput } from "@/component/FloatiingInput";
import { TitleDivider } from "@/component/TitleDevider";
import DocumentUploadInput from "./DocumentUploadInput";
import { useRef, useState } from "react";
import { certificateDocNames, docTypeOptions, identityDocNames } from "./const";
import { useUploadFileMutation } from "@/redux/features/upload/uploadApiSlice";
import { useUpdateEmployeeMutation } from "@/redux/features/admin/employee/employeeApiSlice";
import { toast } from "@/component/Toast";
import Tooltip from "@/component/Tooltip";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import ConfirmDialog from "@/component/ConfirmDialog";
import LazyImage from "@/utils/LazyImage";
import verified from "@/assets/verified.png";
import notVerified from "@/assets/notverified.png";
import SelectInput from "@/component/select/SelectInput";

const Documents = ({
  formData,
  setFormData,
  employeeData,
  refetchEmployee,
  isEditMode,
  isAdmin,
}) => {
  const [currentDocType, setCurrentDocType] = useState("");
  const [currentDocName, setCurrentDocName] = useState("");
  const [currentFileUrl, setCurrentFileUrl] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef(null);

  const [uploadFile, { isLoading: isUploading, error: uploadError }] =
    useUploadFileMutation();

  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setIsUploadingFile(true);
      try {
        const fileFormData = new FormData();
        fileFormData.append("file", files[0]); // Assuming single file upload for now

        // console.log(
        //   "File being uploaded:",
        //   files[0].name,
        //   files[0].type,
        //   files[0].size
        // );
        for (const [key, value] of fileFormData.entries()) {
          // console.log(
          //   `FormData contains: ${key}:`,
          //   value instanceof File ? `File: ${value.name}` : value
          // );
        }

        const response = await uploadFile(fileFormData); // Call simulated upload
        console.log("Upload response:", response);
        setCurrentFileUrl(response?.data?.fileUrl);
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        alert("File upload failed. Please try again."); // Simple alert for now
        setCurrentFileUrl(""); // Clear URL on error
      } finally {
        setIsUploadingFile(false);
        // Clear the input's value to allow re-uploading the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      setCurrentFileUrl("");
    }
  };

  const handleDocTypeChange = (e) => {
    setErrorMessage(""); // Clear error message when docType changes
    const type = e.target.value;
    setCurrentDocType(type);
    setCurrentDocName(""); // Reset docName when docType changes
    setCurrentFileUrl(""); // Reset fileUrl
    setCurrentDescription(""); // Reset description
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input
    }
  };

  const handleDocNameChange = (e) => {
    setErrorMessage("");
    setCurrentDocName(e.target.value);
    setCurrentFileUrl(""); // Reset fileUrl when docName changes
    setCurrentDescription(""); // Reset description
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input
    }
  };

  const handleAddDocument = () => {
    setErrorMessage("");
    if (!currentDocType || !currentDocName || !currentFileUrl) {
      toast.error(
        "Validation Error",
        "Please select document type, document name, and upload a file."
      );
      return;
    }

    const newDocument = {
      docType: currentDocType,
      docName: currentDocName,
      fileUrl: currentFileUrl,
      description: currentDescription,
    };

    setFormData((prevData) => ({
      ...prevData,
      documents: [...prevData.documents, newDocument],
    }));

    // Clear current document states and inputs
    setCurrentDocType("");
    setCurrentDocName("");
    setCurrentFileUrl("");
    setCurrentDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the actual file input element
    }
  };

  const handleDeleteDocument = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      documents: prevData.documents.filter((_, i) => i !== index),
    }));
  };

  // Filter docName options based on docType and already uploaded documents
  const getFilteredDocNameOptions = () => {
    if (currentDocType === "Identity") {
      const uploadedIdentityDocs = formData.documents
        .filter((doc) => doc.docType === "Identity")
        .map((doc) => doc.docName);
      return identityDocNames.filter(
        (option) => !uploadedIdentityDocs.includes(option.value)
      );
    } else if (currentDocType === "Certificate") {
      const uploadedCertificateDocs = formData.documents
        .filter((doc) => doc.docType === "Certificate")
        .map((doc) => doc.docName);
      return certificateDocNames.filter(
        (option) => !uploadedCertificateDocs.includes(option.value)
      );
    }
    return []; // Should not happen for 'Others'
  };

  // Verification functionality
  const handleUpdateClick = () => {
    if (formData.documents.length === 0) {
      toast.error(
        "No documents uploaded",
        "Please upload at least one document before verifying."
      );
      setErrorMessage("Please upload at least one document before verifying.");
      return;
    }
    // setItemToUpdate(id);
    setIsDialogOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      await updateEmployee({
        id: employeeData?._id,
        isDocumentVerified: true,
        documents: formData.documents,
      }).unwrap();
      toast.success("Success", "Employee documents verified successfully!");

      await refetchEmployee();

      // cleanup
      setIsDialogOpen(false);
      //   setItemToUpdate(null);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to verify employee documents."
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
          title="Documents & Verification"
        />
        {isEditMode && isAdmin && (
          <div className="absolute top-6 right-0 inline">
            {employeeData?.isDocumentVerified ? (
              <Tooltip text={"Documents Verified"} position="left">
                <LazyImage src={verified} alt="Logo" imgClass={"h-8 w-8"} />
              </Tooltip>
            ) : (
              <Tooltip text={"Verify These Documents"} position="left">
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

      <div>
        <div
          className={`border  rounded-lg p-6 space-y-4 ${
            errorMessage ? "border-red-500" : "border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Type - use SelectInput */}
            <SelectInput
              label="Document Type"
              isMulti={false}
              value={
                docTypeOptions.find((opt) => opt.value === currentDocType) ||
                null
              }
              onChange={(selected) => {
                setErrorMessage("");
                const type = selected?.value || "";
                setCurrentDocType(type);
                setCurrentDocName("");
                setCurrentFileUrl("");
                setCurrentDescription("");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              options={docTypeOptions}
              error={errorMessage}
            />
            {/* Document Name - show select for Identity/Certificate, text for Others */}
            {currentDocType === "Identity" ||
            currentDocType === "Certificate" ? (
              <SelectInput
                label="Document Name"
                isMulti={false}
                value={
                  getFilteredDocNameOptions().find(
                    (opt) => opt.value === currentDocName
                  ) || null
                }
                onChange={(selected) => {
                  setErrorMessage("");
                  setCurrentDocName(selected?.value || "");
                  setCurrentFileUrl("");
                  setCurrentDescription("");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                options={getFilteredDocNameOptions()}
                error={errorMessage}
                disabled={!currentDocType}
              />
            ) : (
              <FloatingInput
                label="Document Name"
                name="docName"
                type="text"
                value={currentDocName}
                onChange={handleDocNameChange}
              />
            )}
          </div>
          {currentDocType && currentDocName && (
            <>
              <DocumentUploadInput
                label="Upload File"
                onChange={handleFileUpload}
                isLoading={isUploadingFile}
                value={currentFileUrl} // Pass currentFileUrl to show selected file name
                ref={fileInputRef} // Attach ref to clear input
              />
              <FloatingInput
                label="Description (Optional)"
                name="description"
                type="text"
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddDocument}
                className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-md hover:bg-[#8C6542] transition-colors duration-200"
              >
                Add Document
              </button>
            </>
          )}
        </div>

        {errorMessage && (
          <p className="mt-2 text-sm text-red-500 text-center">
            {errorMessage}
          </p>
        )}

        {formData.documents.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Uploaded Documents
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                      Doc Type
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                      Doc Name
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                      File URL
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                      Description
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.documents.map((doc, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {doc.docType}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {doc.docName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View File
                        </a>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {doc.description || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          // disabled={!isAdmin}
                          type="button"
                          onClick={() => handleDeleteDocument(index)}
                          // className={`text-red-500 hover:text-red-700 ${isAdmin ? "cursor-pointer" : "cursor-not-allowed"}`}
                          className={`text-red-500 hover:text-red-700 cursor-pointer`}
                          aria-label={`Delete document ${doc.docName}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={isDialogOpen}
        title="Verify Documents"
        message={`Are you sure you want to verify these documents? This action cannot be undone.`}
        confirmText="Verify"
        cancelText="Cancel"
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
      />
    </div>
  );
};

export default Documents;
