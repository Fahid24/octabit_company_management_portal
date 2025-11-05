import PropTypes from "prop-types";
import { useState, useEffect, useMemo, useRef } from "react";
import CModal from "@/utils/CModal/CModal";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import { useUpdateIncidentMutation } from "@/redux/features/incident/incidentApiSlice";
import { toast } from "@/component/Toast";
import Button from "@/component/Button";
import SignaturePad from "@/component/SignaturePad";
import Select from "react-select";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import { AlertCircleIcon, CalendarIcon, FileTextIcon } from "lucide-react";
import SelectInput from "@/component/select/SelectInput";

const IncidentUpdateModal = ({ isOpen, onClose, incident }) => {
  const [formData, setFormData] = useState({
    incidentDateTime: "",
    personsInvolved: [],
    witnesses: [],
    reportedTo: "",
    injuries: "",
    howReported: "",
    incidentDescription: "",
    followUpActions: "",
    signature: "",
  });

  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetAllEmployeesQuery({ page: 1, limit: 1000 });
  const [updateIncident, { isLoading: isUpdating }] =
    useUpdateIncidentMutation();
  const sigPadRef = useRef(null);

  // Prepare employee options for react-select
  const employeeOptions = useMemo(() => {
    return (
      employeesData?.data?.map((emp) => ({
        value: emp._id,
        label: `${emp.firstName} ${emp.lastName}`,
      })) || []
    );
  }, [employeesData]);

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Effect to populate form when incident prop changes
  useEffect(() => {
    if (incident) {
      // console.log("incident.personsInvolve", incident);
      setFormData({
        incidentDateTime: formatDateForInput(incident.incidentDateTime),
        // Extract IDs from personsInvolved objects or use as is if already IDs
        personsInvolved: incident.personsInvolved
          ? incident.personsInvolved.map((person) =>
              typeof person === "object" ? person._id : person
            )
          : [],
        // Extract IDs from witnesses objects or use as is if already IDs
        witnesses: incident.witnesses
          ? incident.witnesses.map((witness) =>
              typeof witness === "object" ? witness._id : witness
            )
          : [],
        // Extract ID from reportedTo object or use as is if already ID
        reportedTo: incident.reportedTo
          ? typeof incident.reportedTo === "object"
            ? incident.reportedTo._id
            : incident.reportedTo
          : "",
        injuries: incident.injuries || "",
        howReported: incident.howReported || "",
        incidentDescription: incident.incidentDescription || "",
        followUpActions: incident.followUpActions || "",
        signature: incident.signature || "",
      });
      // The SignaturePad component will automatically load the signature from the value prop
    }
    // Clear form and signature when modal is closed
    if (!isOpen) {
      setFormData({
        incidentDateTime: "",
        personsInvolved: [],
        witnesses: [],
        reportedTo: "",
        injuries: "",
        howReported: "",
        incidentDescription: "",
        followUpActions: "",
        signature: "",
      });
      if (sigPadRef.current) {
        sigPadRef.current.clear();
      }
    }
  }, [incident, employeeOptions, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelectChange = (selectedOptions, field) => {
    // Store just the values (IDs) in formData
    const values = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  const handleSingleSelectChange = (selectedOption, field) => {
    // Store just the value (ID) in formData
    const value = selectedOption ? selectedOption.value : "";
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simple validation for required fields
    if (
      !formData.incidentDateTime ||
      formData.personsInvolved.length === 0 ||
      !formData.incidentDescription ||
      !formData.howReported ||
      !formData.reportedTo
    ) {
      toast.error("Validation Error", "Please fill in all required fields.");
      return;
    }

    try {
      // Prepare payload with the data from formData (which already contains IDs)
      const payload = {
        ...formData,
        // Ensure reportedTo is just the ID string (already is from select change handler)
        reportedTo: formData.reportedTo,
        // Ensure personsInvolved and witnesses are arrays of ID strings (already are from select change handler)
        personsInvolved: formData.personsInvolved,
        witnesses: formData.witnesses,
        // Handle signature separately if Need By your backend, otherwise send as is
        signature: formData.signature,
      };

      await updateIncident({ id: incident._id, data: payload }).unwrap();
      toast.success("Success", "Incident updated successfully!");
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error", error?.data?.message || "Failed to update incident");
    }
  };

  // Don\'t render modal if no incident data is provided or not open
  if (!isOpen || !incident) return null;

  return (
    <CModal
      open={isOpen}
      onClose={onClose}
      title="Update Incident"
      width="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Combined Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput
            label="Incident Date & Time"
            name="incidentDateTime"
            type="datetime-local"
            value={formData.incidentDateTime}
            onChange={handleChange}
            icon={<CalendarIcon className="h-5 w-5" />}
            required
          />
          <FloatingInput
            label="Injuries"
            name="injuries"
            value={formData.injuries}
            onChange={handleChange}
            icon={<AlertCircleIcon className="h-5 w-5" />}
          />
        </div>

        <SelectInput
          isMulti
          isSearchable
          label="Persons Involved"
          className={"z-50"} // Ensure this is above other elements
          options={employeeOptions}
          // Value expects an array of { value, label } objects for react-select
          value={employeeOptions.filter((option) =>
            formData.personsInvolved.includes(option.value)
          )}
          onChange={(selectedOptions) =>
            handleMultiSelectChange(selectedOptions, "personsInvolved")
          }
          isLoading={isLoadingEmployees}
          placeholder="Select or search employees"
          classNamePrefix="react-select"
          required
        />

        <SelectInput
          isMulti
          label="Witnesses"
          className="z-40" // Ensure this is above other elements
          isSearchable
          options={employeeOptions}
          // Value expects an array of { value, label } objects for react-select
          value={employeeOptions.filter((option) =>
            formData.witnesses.includes(option.value)
          )}
          onChange={(selectedOptions) =>
            handleMultiSelectChange(selectedOptions, "witnesses")
          }
          isLoading={isLoadingEmployees}
          placeholder="Select or search employees"
          classNamePrefix="react-select"
        />

        <SelectInput
          isSearchable
          options={employeeOptions}
          label="Reported To"
          className="z-30" // Ensure this is above other elements
          // Value expects a single { value, label } object or null for react-select
          value={
            employeeOptions.find(
              (option) => option.value === formData.reportedTo
            ) || null
          }
          onChange={(selectedOption) =>
            handleSingleSelectChange(selectedOption, "reportedTo")
          }
          isLoading={isLoadingEmployees}
          placeholder="Select or search employee"
          classNamePrefix="react-select"
          required
        />

        {/* <div>
          <label className="block text-sm font-medium text-gray-700">
            How Reported
          </label>
          <select
            name="howReported"
            value={formData.howReported}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="">Select Method</option>
            <option value="form">Form</option>
            <option value="in person">In person</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="other">Other</option>
          </select>
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Incident Description
          </label>
          <FloatingTextarea
            name="incidentDescription"
            value={formData.incidentDescription}
            onChange={handleChange}
            //  label="Incident Description"
            icon={<FileTextIcon className="h-5 w-5" />}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Follow-up Actions
          </label>
          <FloatingTextarea
            name="followUpActions"
            value={formData.followUpActions}
            onChange={handleChange}
            icon={<FileTextIcon className="h-5 w-5" />}
          />
        </div>

        {/* Signature Section */}
        <FloatingInput
          label="Signature"
          name="signature"
          value={formData.signature}
          onChange={handleChange}
          required
        />
        {/* <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Signature
          </label>
          <FloatingInput
            type="text"
            name="signature"
            value={formData.signature}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Type your name as signature"
            required
          />
        </div> */}

        {/* Footer */}
        <div className="mt-8 flex justify-end gap-4 text-primary">
          <Button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-full shadow-sm  hover:bg-gray-50 hover:text-primary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-6 py-2 rounded-full shadow-sm text-white bg-primary hover:bg-[#8c6b43]"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Incident"}
          </Button>
        </div>
      </form>
    </CModal>
  );
};

IncidentUpdateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  // Incident prop expects objects with employee details for persons involved, witnesses, and reportedTo
  incident: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    incidentDateTime: PropTypes.string,
    personsInvolved: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string, // ID string
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          firstName: PropTypes.string,
          lastName: PropTypes.string,
          email: PropTypes.string,
        }),
      ])
    ),
    witnesses: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string, // ID string
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          firstName: PropTypes.string,
          lastName: PropTypes.string,
          email: PropTypes.string,
        }),
      ])
    ),
    reportedTo: PropTypes.oneOfType([
      PropTypes.string, // ID string
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        email: PropTypes.string,
      }),
    ]),
    injuries: PropTypes.string,
    howReported: PropTypes.string.isRequired,
    incidentDescription: PropTypes.string.isRequired,
    followUpActions: PropTypes.string,
    signature: PropTypes.string,
  }),
};

export default IncidentUpdateModal;
