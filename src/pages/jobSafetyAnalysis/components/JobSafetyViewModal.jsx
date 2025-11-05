import { X } from "lucide-react";
import PropTypes from "prop-types";

const JobSafetyViewModal = ({ isOpen, onClose, jobSafety }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Job Safety Analysis Details</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">Customer Name & Work Order</h3>
                <p className="text-gray-900">{jobSafety?.customerNameWorkOrder || "N/A"}</p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">Date of Project</h3>
                <p className="text-gray-900">
                  {jobSafety?.dateOfProject ? new Date(jobSafety.dateOfProject).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            {/* Team Section */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Team</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.team) && jobSafety.team.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.team.map((member, index) => (
                      <li key={index} className="text-gray-900">
                        {member}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No team members specified</p>
                )}
              </div>
            </div>

            {/* Persons Involved */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Persons Involved</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.personsInvolved) && jobSafety.personsInvolved.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.personsInvolved.map((person, index) => (
                      <li key={index} className="text-gray-900">
                        {person}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No persons involved specified</p>
                )}
              </div>
            </div>

            {/* PPE Required */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">PPE Required</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.ppeRequired) && jobSafety.ppeRequired.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.ppeRequired.map((ppe, index) => (
                      <li key={index} className="text-gray-900">
                        {ppe}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No PPE specified</p>
                )}
              </div>
            </div>

            {/* Equipment Required */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Equipment Required</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.equipmentRequired) && jobSafety.equipmentRequired.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.equipmentRequired.map((equipment, index) => (
                      <li key={index} className="text-gray-900">
                        {equipment}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No equipment specified</p>
                )}
              </div>
            </div>

            {/* Tools Required */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Tools Required</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.toolsRequired) && jobSafety.toolsRequired.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.toolsRequired.map((tool, index) => (
                      <li key={index} className="text-gray-900">
                        {tool}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No tools specified</p>
                )}
              </div>
            </div>

            {/* Chemicals Required */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Chemicals Required</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.chemicalsRequired) && jobSafety.chemicalsRequired.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.chemicalsRequired.map((chemical, index) => (
                      <li key={index} className="text-gray-900">
                        {chemical}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No chemicals specified</p>
                )}
              </div>
            </div>

            {/* Work Activities */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Work Activities</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.workActivities) && jobSafety.workActivities.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.workActivities.map((activity, index) => (
                      <li key={index} className="text-gray-900">
                        {activity}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No work activities specified</p>
                )}
              </div>
            </div>

            {/* Potential Hazards */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Potential Hazards</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.potentialHazards) && jobSafety.potentialHazards.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.potentialHazards.map((hazard, index) => (
                      <li key={index} className="text-gray-900">
                        {hazard}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No potential hazards specified</p>
                )}
              </div>
            </div>

            {/* Safety Measures */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Safety Measures Discussed</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.safetyMeasuresDiscussed) && jobSafety.safetyMeasuresDiscussed.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.safetyMeasuresDiscussed.map((measure, index) => (
                      <li key={index} className="text-gray-900">
                        {measure}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No safety measures specified</p>
                )}
              </div>
            </div>

            {/* Emergency Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">Nearest Hospital</h3>
                <p className="text-gray-900">{jobSafety?.nearestHospital || "N/A"}</p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">Nearest Urgent Care</h3>
                <p className="text-gray-900">{jobSafety?.nearestUrgentCare || "N/A"}</p>
              </div>
            </div>

            {/* Designated Aerial Rescue Personnel */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Designated Aerial Rescue Personnel</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.designatedAerialRescuePersonnel) && jobSafety.designatedAerialRescuePersonnel.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.designatedAerialRescuePersonnel.map((person, index) => (
                      <li key={index} className="text-gray-900">
                        {person}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No designated personnel specified</p>
                )}
              </div>
            </div>

            {/* Who's Calling 911 */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Who&apos;s Calling 911</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.whosCalling911) && jobSafety.whosCalling911.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.whosCalling911.map((person, index) => (
                      <li key={index} className="text-gray-900">
                        {person}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No designated personnel specified</p>
                )}
              </div>
            </div>

            {/* Approved By */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">Approved By</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {Array.isArray(jobSafety?.approvedBy) && jobSafety.approvedBy.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {jobSafety.approvedBy.map((person, index) => (
                      <li key={index} className="text-gray-900">
                        {person}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No approvers specified</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

JobSafetyViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  jobSafety: PropTypes.shape({
    customerNameWorkOrder: PropTypes.string,
    dateOfProject: PropTypes.string,
    team: PropTypes.arrayOf(PropTypes.string),
    personsInvolved: PropTypes.arrayOf(PropTypes.string),
    ppeRequired: PropTypes.arrayOf(PropTypes.string),
    equipmentRequired: PropTypes.arrayOf(PropTypes.string),
    toolsRequired: PropTypes.arrayOf(PropTypes.string),
    chemicalsRequired: PropTypes.arrayOf(PropTypes.string),
    workActivities: PropTypes.arrayOf(PropTypes.string),
    potentialHazards: PropTypes.arrayOf(PropTypes.string),
    safetyMeasuresDiscussed: PropTypes.arrayOf(PropTypes.string),
    nearestHospital: PropTypes.string,
    nearestUrgentCare: PropTypes.string,
    designatedAerialRescuePersonnel: PropTypes.arrayOf(PropTypes.string),
    whosCalling911: PropTypes.arrayOf(PropTypes.string),
    approvedBy: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default JobSafetyViewModal;
