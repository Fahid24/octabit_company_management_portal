import Button from "@/component/Button";
import CModal from "@/utils/CModal/CModal";
import { CalendarCheck, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RequestWorkingDaysModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  return (
    <CModal
      open={isOpen}
      onClose={onClose}
      title="Attention Required"
      width="max-w-xl"
    >
      <div className="">
        <div className="flex flex-col items-center justify-center space-y-3">
          <CalendarCheck className="text-blue-600" size={40} />
          <h2 className="text-lg font-semibold text-gray-800">
            Set This Month&apos;s Off Days
          </h2>
          <p className="text-gray-600 text-sm text-center">
            To ensure accurate attendance and scheduling, please set all
            official off days for the current month — including holidays,
            events, weekends, and any additional non-working days.
          </p>
          <p className="text-gray-500 text-xs text-center">
            <strong className="text-red-500">Note:</strong> If you do not
            complete this setup, this reminder will continue to appear each time
            you visit the dashboard until the off days for this month are saved.
          </p>
        </div>

        <div className="mt-10 flex justify-center gap-3">
          <Button
            onClick={onClose}
            className="flex items-center gap-1 px-4 py-2 text-sm text-white rounded-md bg-red-500 hover:bg-red-600 transition-colors"
          >
            <XCircle size={18} /> Cancel
          </Button>
          <Button
            onClick={() => navigate("/event-calendar")}
            className="bg-primary/90 text-white px-4 py-2 text-sm rounded-md"
          >
            Proceed
          </Button>
        </div>
      </div>
    </CModal>
  );
};

export default RequestWorkingDaysModal;

{
  /* <div className="mt-8 flex justify-end">
  <button
    onClick={onClose}
    className="px-6 py-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
  >
    Close
  </button>
</div>; */
}
