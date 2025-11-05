import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";

const PModal = ({ isOpen, title, onClose, children }) => {
  // Prevent background scroll when modal is open
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

  if (!isOpen) return null;

  return (
    <div className="fixed -top-7 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-red-500"
          onClick={onClose}
        >
          <X size={18} strokeWidth={4} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
        {children}
      </div>
    </div>
  );
};

PModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default PModal;
