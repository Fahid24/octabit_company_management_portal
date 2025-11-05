import React, { useState, useEffect } from "react";
import { Wrench, Upload, Calendar, UserCheck } from "lucide-react";
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
import {
  useCreateMaintenanceRequestMutation,
  useUpdateMaintenanceRequestMutation,
} from "@/redux/features/application/applicationApiSlice";
import { useSelector } from "react-redux";
import { formatDateInput } from "@/utils/dateFormatFunction";
import { FileUpload } from "@/component/FileUpload";
import RequestForm from "./component/RequestForm";
import SelectInput from "@/component/select/SelectInput"; // add this import

// Helper to get and set requests in localStorage
const getRequests = () => {
  try {
    return JSON.parse(localStorage.getItem("maintenanceRequests")) || [];
  } catch {
    return [];
  }
};
const setRequests = (requests) => {
  localStorage.setItem("maintenanceRequests", JSON.stringify(requests));
};

export default function MaintenanceFormPage() {
  const [maintenanceForm, setMaintenanceForm] = useState({
    employeeId: "",
    equipmentName: "",
    problemDescription: "",
    image: [],
    priority: "",
    damageDate: "",
    expectedDate: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const location = useLocation();
  const passedRequest = location.state?.requestData; // FIX: use requestData
  const [createMaintenanceRequest, { isLoading, error }] =
    useCreateMaintenanceRequestMutation();
  const [
    updateMaintenanceRequest,
    { isLoading: isUpdating, error: updateError },
  ] = useUpdateMaintenanceRequestMutation();
  const user = useSelector((state) => state.userSlice.user);
  const employeeId = user?.user?._id;

  // Normalize priority value for select
  const normalizePriority = (p) => {
    if (!p) return "";
    const v = p.toString().toLowerCase();
    if (v === "low") return "Low";
    if (v === "medium") return "Medium";
    if (v === "urgent") return "Urgent";
    if (v === "high") return "Urgent";
    return p;
  };

  // Helper: get clean file name from a URL or string
  const extractFileName = (val) => {
    if (!val || typeof val !== "string") return val || "";
    try {
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
        setMaintenanceForm({
          employeeId: passedRequest.employeeId || "",
          equipmentName: passedRequest.equipmentName || "",
          problemDescription: passedRequest.problemDescription || "",
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
          priority: normalizePriority(passedRequest.priority || ""),
          damageDate: formatDateInput(passedRequest.damageDate) || "",
          expectedDate: formatDateInput(passedRequest.expectedDate) || "",
        });
      } else {
        // fallback to localStorage if not passed
        const requests = getRequests();
        const req = requests.find((r) => r.id === id);
        if (req) {
          setMaintenanceForm({
            employeeId: req.employeeId || "",
            equipmentName: req.equipmentName || "",
            problemDescription: req.problemDescription || "",
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
            priority: normalizePriority(req.priority || ""),
            damageDate: formatDateInput(req.damageDate) || "",
            expectedDate: formatDateInput(req.expectedDate) || "",
          });
        }
      }
    }
  }, [id, isEdit, passedRequest]);

  const createFilePreview = (file) => {
    return {
      file,
      fileUrl: URL.createObjectURL(file),
      name: extractFileName(file.name),
    };
  };

  // Handle file selection for Maintenance
  const handleMaintenanceFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMaintenanceForm((prev) => {
      const existingNames = prev.image.map((f) => f.name);
      const newFiles = files
        .filter((f) => !existingNames.includes(f.name))
        .map(createFilePreview);
      return {
        ...prev,
        image: [...prev.image, ...newFiles],
      };
    });
    e.target.value = "";
  };

  // Add image URL to Maintenance form
  const handleAddImageUrl = () => {
    const raw = imageUrl.trim();
    if (
      raw &&
      !maintenanceForm.image.some(
        (f) =>
          (typeof f === "string" && f === raw) ||
          (typeof f === "object" &&
            (f.fileUrl === raw || f.url === raw || f.link === raw))
      )
    ) {
      setMaintenanceForm((prev) => ({
        ...prev,
        image: [...prev.image, { fileUrl: raw, name: extractFileName(raw) }],
      }));
      setImageUrl("");
    }
  };

  // Remove a file or URL from Maintenance form
  const handleRemoveMaintenanceFile = (nameOrUrl) => {
    setMaintenanceForm((prev) => ({
      ...prev,
      image: prev.image.filter((f) => {
        if (typeof f === "string") return f !== nameOrUrl;
        return f.name !== nameOrUrl;
      }),
    }));
  };

  // Handle form submit
  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    // Convert all images to string URLs/paths
    const imageUrls = maintenanceForm.image.map((f) => {
      if (typeof f === "string") return f;
      return f.fileUrl || f.url || f.link || f.name || "";
    });
    if (isEdit) {
      // Use mutation for update
      try {
        await updateMaintenanceRequest({
          id,
          updatedData: {
            ...maintenanceForm,
            image: imageUrls,
            employeeId,
            priority: maintenanceForm.priority.toLowerCase(),
            type: "Maintenance",
          },
        }).unwrap();
        navigate(
          user?.user?.role === "Admin" ? "/applications" : "/maintenance"
        );
      } catch (err) {
        // error handled below
      }
    } else {
      // Use mutation for new requests
      try {
        await createMaintenanceRequest({
          ...maintenanceForm,
          image: imageUrls,
          employeeId,
          // Ensure priority is always lowercase for backend validation
          priority: maintenanceForm.priority.toLowerCase(),
          type: "Maintenance",
        }).unwrap();
        navigate(
          user?.user?.role === "Admin" ? "/applications" : "/maintenance"
        );
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
      icon: <Wrench size={18} />,
      component: FloatingInput,
      required: true,
    },
    {
      name: "problemDescription",
      label: "Describe The Issue",
      type: "textarea",
      component: FloatingTextarea,
      required: true,
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
      name: "damageDate",
      label: "Damage Date",
      type: "date",
      icon: <Calendar size={18} />,
      component: FloatingInput,
      required: true,
      gridClass: "",
    },
    {
      name: "expectedDate",
      label: "Need On",
      type: "date",
      icon: <Calendar size={18} />,
      component: FloatingInput,
      required: true,
      gridClass: "",
    },
  ];

  return (
    <RequestForm
      title={isEdit ? "Edit Maintenance Request" : "Maintenance Request"}
      description={
        isEdit
          ? "Edit your maintenance request below"
          : "Fill out the form to create a maintenance request"
      }
      fields={fields}
      formState={maintenanceForm}
      setFormState={setMaintenanceForm}
      onSubmit={handleMaintenanceSubmit}
      onCancel={() =>
        navigate(
          user?.user?.role === "Admin" ? "/applications" : "/maintenance"
        )
      }
      isEdit={isEdit}
      isLoading={isLoading}
      isUpdating={isUpdating}
      error={error?.data?.message || (error && "Failed to submit request.")}
      updateError={
        updateError?.data?.message ||
        (updateError && "Failed to update request.")
      }
      submitLabel="Submit Maintenance Request"
      editLabel="Save Changes"
      cancelLabel="Cancel"
    />
  );
}
