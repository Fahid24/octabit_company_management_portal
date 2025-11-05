import PropTypes from "prop-types";
import CModal from "@/utils/CModal/CModal";
import {
  CalendarIcon,
  FileTextIcon,
  AlertCircleIcon,
  UserIcon,
  UsersIcon,
  CheckCircleIcon,
} from "lucide-react";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import { useMemo } from "react";

const InfoSection = ({ title, children, icon: Icon }) => (
  <div className="bg-gray-50 rounded-lg p-4 mb-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="pl-7 text-gray-600">{children}</div>
  </div>
);

InfoSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType.isRequired,
};

const IncidentViewModal = ({ isOpen, onClose, incident }) => {
  const { data: employeesData } = useGetAllEmployeesQuery({
    page: 1,
    limit: 1000,
  });

  const employeeMap = useMemo(() => {
    const map = {};
    employeesData?.data?.forEach((emp) => {
      map[emp._id] = `${emp.firstName} ${emp.lastName}`;
    });
    return map;
  }, [employeesData]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get employee name safely
  const getEmployeeName = (person) => {
    if (!person) return "Unknown Person";

    if (typeof person === "string") {
      // If it's a string (ID), look it up in the map
      return employeeMap[person] || person || "Unknown Person";
    } else if (typeof person === "object" && person._id) {
      // If it's an object with _id, try to get name from object first, then map
      const fullName =
        person.firstName && person.lastName
          ? `${person.firstName} ${person.lastName}`
          : null;
      return (
        fullName || employeeMap[person._id] || person._id || "Unknown Person"
      );
    }

    return "Unknown Person";
  };

  if (!incident) {
    return null;
  }

  return (
    <CModal
      open={isOpen}
      onClose={onClose}
      title="Incident Details"
      width="max-w-4xl"
    >
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <InfoSection title="Incident Date & Time" icon={CalendarIcon}>
              {formatDate(incident.incidentDateTime)}
            </InfoSection>

            <InfoSection title="Persons Involved" icon={UsersIcon}>
              <div className="space-y-1">
                {incident.personsInvolved?.length > 0 ? (
                  incident.personsInvolved.map((person, index) => (
                    <div
                      key={person._id || person || index}
                      className="flex items-center gap-2"
                    >
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span>{getEmployeeName(person)}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">No persons involved</span>
                )}
              </div>
            </InfoSection>

            <InfoSection title="Witnesses" icon={UsersIcon}>
              <div className="space-y-1">
                {incident.witnesses?.length > 0 ? (
                  incident.witnesses.map((witness, index) => (
                    <div
                      key={witness._id || witness || index}
                      className="flex items-center gap-2"
                    >
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span>{getEmployeeName(witness)}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">No witnesses</span>
                )}
              </div>
            </InfoSection>

            <InfoSection title="Reported To" icon={UserIcon}>
              {incident.reportedTo
                ? getEmployeeName(incident.reportedTo)
                : "Not specified"}
            </InfoSection>
          </div>

          {/* Right Column */}
          <div>
            <InfoSection title="Injuries" icon={AlertCircleIcon}>
              {incident.injuries || "No injuries reported"}
            </InfoSection>

            <InfoSection title="How Reported" icon={CheckCircleIcon}>
              <span className="capitalize">
                {incident.howReported || "Not specified"}
              </span>
            </InfoSection>

            <InfoSection title="Incident Description" icon={FileTextIcon}>
              <p className="whitespace-pre-wrap">
                {incident.incidentDescription || "No description provided"}
              </p>
            </InfoSection>

            <InfoSection title="Follow-up Actions" icon={FileTextIcon}>
              <p className="whitespace-pre-wrap">
                {incident.followUpActions || "No follow-up actions specified"}
              </p>
            </InfoSection>
          </div>
        </div>

        {/* Signature Section */}
        {incident.signature && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Signature
            </h3>
            <div className="bg-white p-2 rounded border min-h-[2.5rem] flex items-center">
              <span className="text-base text-gray-700">
                {incident.signature}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </CModal>
  );
};

IncidentViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
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
    howReported: PropTypes.string,
    incidentDescription: PropTypes.string,
    followUpActions: PropTypes.string,
    signature: PropTypes.string,
  }),
};

export default IncidentViewModal;
