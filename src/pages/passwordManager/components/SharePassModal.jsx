import { useEffect, useState } from "react";
import SelectInput from "@/component/select/SelectInput";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import {
  useUpdateProjectSharingMutation,
  useUpdateCredentialSharingMutation,
} from "@/redux/features/passmanager/passmanagerApiSlice";
import Loader from "@/component/Loader";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import Button from "@/component/Button";
import { toast } from "@/component/Toast";

const SharePassModal = ({ isOpen, onClose, type, project, credential }) => {
  const [shareType, setShareType] = useState("user");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  const [updateProjectSharing, { isLoading: isProjectLoading }] =
    useUpdateProjectSharingMutation();
  const [updateCredentialSharing, { isLoading: isCredentialLoading }] =
    useUpdateCredentialSharingMutation();

  const { data: employeeData } = useGetAllEmployeesQuery({
    page: 1,
    limit: 1000,
  });
  const { data: departmentData } = useGetDepartmentsQuery({
    page: 1,
    limit: 1000,
    populate: true,
  });

  useEffect(() => {
    if (!isOpen) {
      setShareType("user");
      setSelectedUsers([]);
      setSelectedDepartments([]);
    }
  }, [isOpen]);

  // Guard: Don't allow submit if IDs are missing
  const isShareDisabled =
    (type === "project" && (!project || !project._id)) ||
    (type === "credential" &&
      (!project || !project._id || !credential || !credential._id));

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

    // Prevent API call if IDs are missing
    if (isShareDisabled) {
      toast.error("Error", "Missing project or credential information.");
      return;
    }

    try {
      if (type === "project" && project && project._id) {
        await updateProjectSharing({
          projectId: project._id,
          sharedWith: shares,
        }).unwrap();
        toast.success("Success", "Project shared successfully.");
      } else if (
        type === "credential" &&
        project &&
        project._id &&
        credential &&
        credential._id
      ) {
        await updateCredentialSharing({
          projectId: project._id,
          credentialId: credential._id,
          sharedWith: shares,
        }).unwrap();
        toast.success("Success", "Credential shared successfully.");
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error", error?.data?.error || "Failed to share.");
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
    <div className="fixed -top-7 inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-red-500"
          onClick={onClose}
        >
          <X size={18} strokeWidth={4} />
        </button>
        <h2 className="text-xl font-semibold text-center mb-6">
          Share {type === "project" ? "Project" : "Credential"}
        </h2>

        {/* Show warning if IDs are missing */}
        {isShareDisabled && (
          <div className="mb-4 text-red-600 text-center text-sm">
            Cannot share: Missing project or credential information.
          </div>
        )}

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
            disabled={
              isProjectLoading || isCredentialLoading || isShareDisabled
            }
            className="bg-primary text-white"
          >
            {isProjectLoading || isCredentialLoading ? "Sharing..." : "Share"}
          </Button>
        </div>
      </div>
    </div>
  );
};

SharePassModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["project", "credential"]),
  project: PropTypes.object,
  credential: PropTypes.object,
};

export default SharePassModal;
