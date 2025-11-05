import React, { useState, useEffect } from "react";
import { Package, Upload, Calendar, UserCheck } from "lucide-react";
import { FloatingInput } from "@/component/FloatiingInput";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/component/card";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import Button from "@/component/Button";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { TitleDivider } from "@/component/TitleDevider";
import { useSelector } from "react-redux";
import {
  useCreateEquipmentRequestMutation,
  useUpdateEquipmentRequestMutation,
} from "@/redux/features/application/applicationApiSlice";
import { formatDateInput } from "@/utils/dateFormatFunction";
import { FileUpload } from "@/component/FileUpload";
import RequestForm from "./component/RequestForm";
import SelectInput from "@/component/select/SelectInput"; // add this import

// Helper to get and set requests in localStorage
const getRequests = () => {
  try {
    return JSON.parse(localStorage.getItem("equipmentRequests")) || [];
  } catch {
    return [];
  }
};
const setRequests = (requests) => {
  localStorage.setItem("equipmentRequests", JSON.stringify(requests));
};

export default function EquipmentFormPage() {
  const [equipmentForm, setEquipmentForm] = useState({
    employeeId: "",
    equipmentName: "",
    quantity: 1,
    purpose: "",
    priority: "",
    expectedDate: "",
    image: [],
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const location = useLocation();
  const passedRequest = location.state?.requestData; // FIX: use requestData
  const user = useSelector((state) => state.userSlice.user);
  const employeeId = user?.user?._id;
  const [createEquipmentRequest, { isLoading, error }] =
    useCreateEquipmentRequestMutation();
  const [
    updateEquipmentRequest,
    { isLoading: isUpdating, error: updateError },
  ] = useUpdateEquipmentRequestMutation();
  const [imageUrlInput, setImageUrlInput] = useState("");

  // NEW: normalize priority value to match select options
  const normalizePriority = (p) => {
    if (!p) return "";
    const v = p.toString().toLowerCase();
    if (v === "low") return "Low";
    if (v === "medium") return "Medium";
    if (v === "urgent") return "Urgent";
    // Accept "high" as "Urgent" for compatibility
    if (v === "high") return "Urgent";
    return p;
  };

  // Helper: get clean file name from a URL or string
  const extractFileName = (val) => {
    if (!val || typeof val !== "string") return val || "";
    try {
      // Strip query/hash then take last path segment
      const clean = val.split("?")[0].split("#")[0];
      const parts = clean.split("/");
      return parts[parts.length - 1] || val;
    } catch {
      return val;
    }
  };

  // Load request data if editing
  useEffect(() => {
    if (isEdit) {
      if (passedRequest) {
        setEquipmentForm({
          employeeId: passedRequest.employeeId || "",
          equipmentName: passedRequest.equipmentName || "",
          quantity: passedRequest.quantity || 1,
          purpose: passedRequest.purpose || "",
          priority: normalizePriority(passedRequest.priority || ""),
          expectedDate: formatDateInput(passedRequest.expectedDate) || "",
          image: (passedRequest.image || []).map((img, i) =>
            typeof img === "string"
              ? { fileUrl: img, name: extractFileName(img) }
              : {
                  ...img,
                  fileUrl:
                    img.fileUrl ||
                    img.url ||
                    img.link ||
                    img.name ||
                    `file-${i + 1}`,
                  name:
                    extractFileName(
                      img.name ||
                        img.docType ||
                        img.title ||
                        img.fileUrl ||
                        img.url
                    ) || `File-${i + 1}`,
                }
          ),
        });
      } else {
        // fallback to localStorage if not passed
        const requests = getRequests();
        const req = requests.find((r) => r.id === id);
        if (req) {
          setEquipmentForm({
            employeeId: req.employeeId || "",
            equipmentName: req.equipmentName || "",
            quantity: req.quantity || 1,
            purpose: req.purpose || "",
            priority: normalizePriority(req.priority || ""),
            expectedDate: formatDateInput(req.expectedDate) || "",
            image: (req.image || []).map((img, i) =>
              typeof img === "string"
                ? { fileUrl: img, name: extractFileName(img) }
                : {
                    ...img,
                    fileUrl:
                      img.fileUrl ||
                      img.url ||
                      img.link ||
                      img.name ||
                      `file-${i + 1}`,
                    name:
                      extractFileName(
                        img.name ||
                          img.docType ||
                          img.title ||
                          img.fileUrl ||
                          img.url
                      ) || `File-${i + 1}`,
                  }
            ),
          });
        }
      }
    }
  }, [id, isEdit, passedRequest]);

  // Helper to create a local URL for preview
  const createFilePreview = (file) => {
    return {
      file,
      fileUrl: URL.createObjectURL(file),
      name: extractFileName(file.name),
    };
  };

  // Handle file selection for Equipment
  const handleEquipmentFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEquipmentForm((prev) => {
      const existingNames = prev.image.map((f) => f.name);
      const newFiles = files
        .filter((f) => !existingNames.includes(f.name))
        .map(createFilePreview);
      return { ...prev, image: [...prev.image, ...newFiles] };
    });
    e.target.value = "";
  };

  // Remove a file from Equipment form
  const handleRemoveEquipmentFile = (name) => {
    setEquipmentForm((prev) => ({
      ...prev,
      image: prev.image.filter((f) =>
        typeof f === "string" ? f !== name : f.name !== name
      ),
    }));
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    const raw = imageUrlInput.trim();
    if (
      raw &&
      !equipmentForm.image.some(
        (f) =>
          (typeof f === "string" && f === raw) ||
          (typeof f === "object" &&
            (f.fileUrl === raw || f.url === raw || f.link === raw))
      )
    ) {
      setEquipmentForm((prev) => ({
        ...prev,
        image: [...prev.image, { fileUrl: raw, name: extractFileName(raw) }],
      }));
      setImageUrlInput("");
    }
  };

  // Handle form submit
  const handleEquipmentSubmit = async (e) => {
    e.preventDefault();
    const imageUrls = equipmentForm.image.map((f) =>
      typeof f === "string" ? f : f.fileUrl || f.url || f.link || f.name || ""
    );
    if (isEdit) {
      // Use mutation for update
      try {
        await updateEquipmentRequest({
          id,
          updatedData: {
            ...equipmentForm,
            image: imageUrls,
            employeeId,
            priority: equipmentForm.priority.toLowerCase(),
            type: "Equipment",
          },
        }).unwrap();
        navigate(user?.user?.role === "Admin" ? "/applications" : "/equipment");
      } catch (err) {
        // error handled below
      }
    } else {
      // Use mutation for new requests
      try {
        await createEquipmentRequest({
          ...equipmentForm,
          image: imageUrls,
          employeeId,
          // Ensure priority is always lowercase for backend validation
          priority: equipmentForm.priority.toLowerCase(),
          type: "Equipment",
        }).unwrap();
        navigate(user?.user?.role === "Admin" ? "/applications" : "/equipment");
      } catch (err) {
        // error handled below
      }
    }
  };

  // Define the fields for the form
  const fields = [
    {
      name: "equipmentName",
      label: "Equipment Name",
      type: "text",
      icon: <Package size={18} />,
      component: FloatingInput,
      required: true,
    },
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      icon: <Package size={18} />,
      min: "1",
      component: FloatingInput,
      required: true,
      gridClass: "",
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      icon: <UserCheck size={18} />,
      options: [
        { value: "Low", label: "Low" },
        { value: "Medium", label: "Medium" },
        { value: "Urgent", label: "Urgent" },
      ],
      component: SelectInput, // CHANGED HERE
      required: true,
      gridClass: "",
    },
    {
      name: "expectedDate",
      label: "Need On",
      type: "date",
      icon: <Calendar size={18} />,
      min: new Date().toISOString().split("T")[0],
      component: FloatingInput,
      required: true,
      gridClass: "",
    },
    {
      name: "image",
      label: "Upload Documents",
      type: "file",
      accept: ".jpg,.jpeg,.png,.webp,.gif",
      isMultiFile: true,
      required: false,
    },
    {
      name: "purpose",
      label: "Purpose",
      type: "textarea",
      component: FloatingTextarea,
      required: true,
    },
  ];

  return (
    <RequestForm
      title={isEdit ? "Edit Equipment Request" : "Equipment Request"}
      description={
        isEdit
          ? "Edit your equipment request below"
          : "Fill out the form to create an equipment request"
      }
      fields={fields}
      formState={equipmentForm}
      setFormState={setEquipmentForm}
      onSubmit={handleEquipmentSubmit}
      onCancel={() =>
        navigate(user?.user?.role === "Admin" ? "/applications" : "/equipment")
      }
      isEdit={isEdit}
      isLoading={isLoading}
      isUpdating={isUpdating}
      error={error?.data?.message || (error && "Failed to submit request.")}
      updateError={
        updateError?.data?.message ||
        (updateError && "Failed to update request.")
      }
      submitLabel="Submit"
      editLabel="Save Changes"
      cancelLabel="Cancel"
    />
  );
}
