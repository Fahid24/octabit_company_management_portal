import React, { useState } from "react";
import Button from "@/component/Button";
import Table from "@/component/Table";
import ConfirmDialog from "@/component/ConfirmDialog";
import { CircleAlert, Pencil, Plus, Trash2 } from "lucide-react";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";

export default function ApplicationTablePage({
  title,
  subtitle,
  newRequestPath,
  onNewRequest,
  columns,
  data,
  isLoading,
  renderCell,
  modalContent,
  onEdit,
  onDelete,
  onView,
  confirmDialogTitle,
  confirmDialogMessage,
  isDeleting,
  loginPrompt,
  employeeId,
  navigate,
  getPriorityColor,
  getStatusColor,
}) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const isMobile = useIsMobile();

  // Helper functions for actions
  const openModalForRow = (row) => {
    setSelectedRow(row);
    setModalOpen(true);
    if (onView) onView(row);
  };
  const openConfirmForRow = (row) => {
    setRowToDelete(row);
    setConfirmOpen(true);
  };

  const handleNewRequest = () => {
    if (onNewRequest) {
      onNewRequest();
    } else if (newRequestPath) {
      navigate(newRequestPath);
    }
  };


  if (!employeeId) {
    return (
      loginPrompt || (
        <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-4">
          <div>No employee found. Please log in.</div>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      )
    );
  }

  return (
    <div className=" space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex">
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <div className="ml-2 pt-2 cursor-pointer">
              {title === "Maintenance Dashboard" ? (
                <Tooltips
                  text="you can view the table listing all maintenance requests you've submitted. This table shows details like request type, status, priority, and assigned staff. You can filter by status or search by request ID or description."
                  position={isMobile ? "bottom" : "right"}
                >
                  <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                </Tooltips>
              ) : title === "Equipment Dashboard" ? (
                <Tooltips
                  text="you can view the table listing all Equipments requests you've submitted. This table shows details like equipment name, status, priority, and quantity. "
                  position={isMobile ? "bottom" : "right"}
                >
                  <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                </Tooltips>
              ) : title === "My Learning Requests" ? (
                <Tooltips
                  text="you can view the table listing all learning requests you've submitted. This table shows details like topics title, priority, status and expected completion date"
                  position={isMobile ? "bottom" : "right"}
                >
                  <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                </Tooltips>
              ) : (
                ""
              )}
            </div>
          </div>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
        {(newRequestPath || onNewRequest) && (
          <Button onClick={handleNewRequest}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        )}
      </div>
      <div className=" rounded-lg  p-4">
        <Table
          columns={columns}
          data={data}
          isLoading={isLoading}
          // onRowClick={row => openModalForRow(row)}
          renderCell={(col, value, row) =>
            renderCell(col, value, row, {
              getPriorityColor,
              getStatusColor,
              openModal: openModalForRow,
              openConfirm: openConfirmForRow,
            })
          }
        />
      </div>
      {/* Modal for full info */}
      {modalOpen && selectedRow && (
        <div className="fixed -inset-10 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            {modalContent &&
              modalContent(selectedRow, {
                close: () => setModalOpen(false),
                onEdit: () => {
                  setModalOpen(false);
                  if (onEdit) onEdit(selectedRow);
                },
                onDelete: () => {
                  setModalOpen(false);
                  setRowToDelete(selectedRow);
                  setConfirmOpen(true);
                },
                getPriorityColor,
                getStatusColor,
              })}
          </div>
        </div>
      )}
      {/* Confirm Dialog for Delete */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmDialogTitle}
        message={confirmDialogMessage(rowToDelete)}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={async () => {
          if (!rowToDelete) return;
          if (onDelete) await onDelete(rowToDelete);
          setConfirmOpen(false);
          setRowToDelete(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setRowToDelete(null);
        }}
      />
    </div>
  );
}
