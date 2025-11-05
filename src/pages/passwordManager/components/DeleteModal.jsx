import React from "react";
import PropTypes from "prop-types";
import { XCircle } from "lucide-react";
import Button from "@/component/Button";

const DeleteModal = ({
  isOpen,
  onClose,
  onDelete,
  item,
  type = "credential",
}) => {
  if (!isOpen || !item) return null;

  const getItemName = () => {
    if (type === "project") return item.projectName;
    if (type === "credential") return item.website || item.title || "this item";
    return "this item";
  };

  return (
    <div className="fixed -top-7 inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm relative text-center">
        {/* <XCircle className="mx-auto text-red-500 mb-2" size={48} /> */}

        <h2 className="text-xl font-bold mt-2 mb-2">
          Delete {type === "project" ? "Project" : "Credential"}?
        </h2>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{getItemName()}</strong>?
        </p>

        <div className="flex justify-center gap-4">
          <Button className="bg-gray-400" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-red-600" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  item: PropTypes.object, // Can be credential or project
  type: PropTypes.oneOf(["credential", "project"]),
};

export default DeleteModal;
