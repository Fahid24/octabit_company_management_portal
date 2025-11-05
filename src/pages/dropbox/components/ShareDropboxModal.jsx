import { useEffect, useState, useRef } from "react";
import SelectInput from "@/component/select/SelectInput";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import Loader from "@/component/Loader";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import Button from "@/component/Button";
import { toast } from "@/component/Toast";
import { useShareDropboxEntryMutation } from "@/redux/features/dropbox/dropboxApiSlice";

const ShareDropboxModal = ({ isOpen, onClose, dropboxId }) => {
  const [shareType, setShareType] = useState("user");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  const [shareDropboxEntry, { isLoading }] = useShareDropboxEntryMutation();

  const { data: employeeData } = useGetAllEmployeesQuery({
    page: 1,
    limit: 1000,
  });
  const { data: departmentData } = useGetDepartmentsQuery({
    page: 1,
    limit: 1000,
    populate: true, // ✅ correct
  });

  const modalRef = useRef(null);

  // Allow scrolling the modal even when wheel happens on overlay
  const handleOverlayScroll = (e) => {
    if (!modalRef.current) return;
    e.preventDefault();
    modalRef.current.scrollTop += e.deltaY;
  };

  useEffect(() => {
    if (!isOpen) {
      setShareType("user");
      setSelectedUsers([]);
      setSelectedDepartments([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    let shares = [];

    if (shareType === "user") {
      if (selectedUsers.length === 0) {
        return toast.error("Missing", "Please select at least one user.");
      }
      shares = selectedUsers.map((user) => ({
        type: "user",
        targetId: user.value,
      }));
    } else if (shareType === "department") {
      if (selectedDepartments.length === 0) {
        return toast.error("Missing", "Please select at least one department.");
      }
      shares = selectedDepartments.map((dept) => ({
        type: "department",
        targetId: dept.value,
      }));
    } else if (shareType === "all") {
      shares = [{ type: "all" }];
    }

    try {
      await shareDropboxEntry({ id: dropboxId, shares }).unwrap();
      toast.success("Success", "Document shared successfully.");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error", error?.data?.error || "Failed to share document.");
    }
  };

  if (!isOpen) return null;

  const employeeOptions = (employeeData?.data || []).map((emp) => ({
    value: emp._id,
    label: `${emp.firstName} ${emp.lastName}`,
  }));

  const departmentOptions = (departmentData?.data || []).map((dept) => ({
    value: dept._id,
    label: dept.name,
  }));

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onWheel={handleOverlayScroll}
    >
      <div
        className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-xl relative max-h-[90vh] overflow-y-auto"
        ref={modalRef}
      >
        <button
          className="absolute top-4 right-4 text-red-500"
          onClick={onClose}
        >
          <X size={18} strokeWidth={4} />
        </button>
        <h2 className="text-xl font-semibold text-center mb-6">
          Share Document
        </h2>

        <SelectInput
          label="Select Share Type"
          isMulti={false}
          value={{ value: shareType, label: shareType.toUpperCase() }}
          onChange={(selected) => setShareType(selected.value)}
          options={[
            { value: "user", label: "USER" },
            { value: "department", label: "DEPARTMENT" },
            { value: "all", label: "ALL (Everyone)" },
          ]}
        />

        {shareType === "user" && (
          <div className="mt-6">
            <SelectInput
              label="Select Employee(s)"
              isMulti={true}
              value={selectedUsers}
              onChange={setSelectedUsers}
              options={employeeOptions}
            />
          </div>
        )}

        {shareType === "department" && (
          <div className="mt-6">
            <SelectInput
              label="Select Department(s)"
              isMulti={true}
              value={selectedDepartments}
              onChange={setSelectedDepartments}
              options={departmentOptions}
            />
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" onClick={onClose} className="bg-gray-500">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary text-white"
          >
            {isLoading ? "Sharing..." : "Share"}
          </Button>
        </div>
      </div>
    </div>
  );
};

ShareDropboxModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dropboxId: PropTypes.string.isRequired,
};

export default ShareDropboxModal;
