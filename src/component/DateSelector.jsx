// DateSelector.jsx
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateSelector = ({
  label,
  selected,
  onChange,
  primaryColor = "#3941e3", // Tailwind primary
  dateFormat = "MM/dd/yy",
  placeholder = "MM/DD/YY",
}) => {
  return (
    <div className="mt-4 w-full tw-datepicker-wrapper">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat={dateFormat}
        placeholderText={placeholder}
        popperPlacement="bottom-start"
        className="w-full border-2 border-gray-300 rounded-md p-2 text-base outline-none"
        calendarClassName="tw-datepicker"
      />

      <style>{`
        /* Bind primary color */
        .tw-datepicker { --dp-primary: ${primaryColor}; }

        /* Full width container and input */
        .tw-datepicker-wrapper .react-datepicker__input-container {
          width: 100% !important;
          display: block;
        }
        .tw-datepicker-wrapper .react-datepicker__input-container input {
          width: 100% !important;
        }

        /* Focus styles — border + outline as primary */
        .tw-datepicker-wrapper .react-datepicker__input-container input:focus {
          border-color: var(--dp-primary) !important;
          box-shadow: 0 0 0 3px rgba(169,123,80,0.35) !important; /* Primary glow */
          outline: none !important;
        }

        /* Bigger calendar */
        .tw-datepicker .react-datepicker {
          border: 1px solid var(--dp-primary);
          font-size: 1.05rem;
          padding: 8px;
          width: 340px;
        }
        .tw-datepicker .react-datepicker__header {
          background: #fff;
          border-bottom: 1px solid var(--dp-primary);
        }
        .tw-datepicker .react-datepicker__current-month,
        .tw-datepicker .react-datepicker-year-header {
          color: var(--dp-primary);
          font-weight: 600;
          font-size: 1.15rem;
        }

        /* Day cells */
        .tw-datepicker .react-datepicker__day-name,
        .tw-datepicker .react-datepicker__day {
          width: 2.4rem;
          line-height: 2.4rem;
          margin: 0.15rem;
          font-size: 1rem;
        }

        /* Selected + hover */
        .tw-datepicker .react-datepicker__day--selected,
        .tw-datepicker .react-datepicker__day--keyboard-selected {
          background-color: var(--dp-primary) !important;
          color: #fff !important;
        }
        .tw-datepicker .react-datepicker__day:hover {
          background-color: var(--dp-primary) !important;
          color: #fff !important;
        }

        /* Today */
        .tw-datepicker .react-datepicker__day--today {
          border: 1px solid var(--dp-primary) !important;
        }

        /* Navigation arrows */
        .tw-datepicker .react-datepicker__navigation-icon::before {
          border-color: var(--dp-primary) !important;
        }
        .tw-datepicker .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
          border-color: #fff !important;
        }
        .tw-datepicker .react-datepicker__navigation:hover {
          background: var(--dp-primary);
          border-radius: .375rem;
        }
      `}</style>
    </div>
  );
};

export default DateSelector;
