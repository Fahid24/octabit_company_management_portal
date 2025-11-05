import { useState } from "react";

export default function Tooltip({ children, text, position = "top" }) {
  const [visible, setVisible] = useState(false);

  const positionClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
    left: "right-full top-1/2 -translate-y-1/2 mr-3",
    right: "left-full top-1/2 -translate-y-1/2 ml-3",
  };

  const arrowPosition = {
    top: "bottom-[-6px] left-1/2 -translate-x-1/2 border-t-gray-800",
    bottom: "top-[-6px] left-1/2 -translate-x-1/2 border-b-gray-800",
    left: "right-[-6px] top-1/2 -translate-y-1/2 border-l-gray-800",
    right: "left-[-6px] top-1/2 -translate-y-1/2 border-r-gray-800",
  };

  return (
    <div
      className="relative inline-block group"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-md shadow-md
          whitespace-nowrap transition-all duration-200 ${positionClass[position]}`}
        >
          {text}
          <span
            className={`absolute w-3 h-3 bg-gray-800 rotate-45 ${arrowPosition[position]}`}
          />
        </div>
      )}
    </div>
  );
}
