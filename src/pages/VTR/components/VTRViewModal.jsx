import CModal from "@/utils/CModal/CModal";

const PRIMARY = "#2563eb"; // Tailwind primary-600
const ACCENT = "#1e40af"; // Tailwind primary-800

const VTRViewModal = ({ isOpen, onClose, vtr }) => {
  
  if (!isOpen || !vtr) return null;
  return (
    <CModal open={isOpen} onClose={onClose} title="VTR Details" width="max-w-2xl">
      <div className="space-y-6 p-4 bg-white rounded-xl shadow-xl border border-primary-100">
        {/* Header Card */}
        <div className="flex items-center gap-4 pb-4 border-b border-primary-200">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">Verifiable Time Record</div>
            <div className="text-sm text-primary">Work Order #{vtr.workOrder || "-"}</div>
          </div>
        </div>
        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold text-primary">Completed By</div>
            <div className="text-gray-900">{vtr.completedBy || "-"}</div>
          </div>
          <div>
            <div className="font-semibold text-primary">Date of Project</div>
            <div className="text-gray-900">{vtr.dateOfProject ? new Date(vtr.dateOfProject).toLocaleDateString() : "-"}</div>
          </div>
          <div>
            <div className="font-semibold text-primary">Customer Name</div>
            <div className="text-gray-900">{vtr.customerName || "-"}</div>
          </div>
          <div>
            <div className="font-semibold text-primary">Sales Rep</div>
            <div className="text-gray-900">{vtr.salesRep || "-"}</div>
          </div>
          <div>
            <div className="font-semibold text-primary">Crew Team</div>
            <div className="text-gray-900">{vtr.crewTeam || "-"}</div>
          </div>
          <div className="md:col-span-2">
            <div className="font-semibold text-primary">Crew Members</div>
            <div className="text-gray-900">
              {Array.isArray(vtr.crewMembers) && vtr.crewMembers.length > 0
                ? vtr.crewMembers
                    .map((member) => `${member.firstName} ${member.lastName}`)
                    .join(", ")
                : "-"}
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-primary-200 my-2" />
        {/* Time Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold text-primary">Estimated Time on Site</div>
            <div className="text-gray-900">{vtr.estimatedTime || "-"}</div>
          </div>
          <div>
            <div className="font-semibold text-primary">Actual Time on Site</div>
            <div className="text-gray-900">{vtr.actualTime || "-"}</div>
          </div>
        </div>
        <div>
          <div className="font-semibold text-primary">Time to Complete</div>
          <div className="text-gray-900">{vtr.timeToComplete || "-"}</div>
        </div>
        {/* Divider */}
        <div className="border-t border-primary-200 my-2" />
        {/* Time Slots */}
        <div>
          <div className="font-semibold text-primary">Time Slots</div>
          <div className="text-gray-900">
            {vtr.timeSlots && Object.keys(vtr.timeSlots).length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(vtr.timeSlots).map(([slot, value]) => (
                  <li key={slot}>
                    <span className="font-medium text-primary-800">{slot}:</span> {value}
                  </li>
                ))}
              </ul>
            ) : (
              "-"
            )}
          </div>
        </div>
        {/* Feedback */}
        <div>
          <div className="font-semibold text-primary">Feedback</div>
          <div className="text-gray-900 whitespace-pre-line">{vtr.feedback || "-"}</div>
        </div>
      </div>
    </CModal>
  );
};

export default VTRViewModal;
