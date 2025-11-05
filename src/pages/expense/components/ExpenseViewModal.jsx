import PropTypes from "prop-types";
import { Calendar, DollarSign, User, History, Tag, FileText } from "lucide-react";
import Modal from "../../../component/Modal";
import { formatDate } from "../../../utils/dateFormatFunction";

const ExpenseViewModal = ({ open, onClose, expense }) => {
  if (!expense) return null;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format history changes
  const formatHistoryChanges = (changes) => {
    if (changes === "Created in bulk insert") {
      return "Expense created through bulk upload";
    }
    return changes;
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-3xl">
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Expense Details</h2>
          <p className="text-sm text-gray-600">View comprehensive expense information</p>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Left Column */}
          <div className="space-y-3">
            {/* Title */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Title</span>
              </div>
              <p className="text-base font-semibold text-gray-900">{expense.title}</p>
            </div>

            {/* Category */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Category</span>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {expense.category}
              </span>
            </div>

            {/* Amount */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Amount</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {/* Date */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Date</span>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {formatDate(expense.date)}
              </p>
            </div>

            {/* Created By */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Created By</span>
              </div>
              <div className="flex items-center gap-2">
                {expense.createdBy?.photoUrl && (
                  <img
                    src={expense.createdBy.photoUrl}
                    alt={`${expense.createdBy.firstName} ${expense.createdBy.lastName}`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {expense.createdBy?.firstName} {expense.createdBy?.lastName}
                  </p>
                  <p className="text-xs text-gray-600">
                    {expense.createdBy?.designation} • {expense.createdBy?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="space-y-1">
                <div>
                  <span className="text-xs font-medium text-gray-700">Created:</span>
                  <p className="text-xs text-gray-600">{formatDate(expense.createdAt)}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-700">Last Updated:</span>
                  <p className="text-xs text-gray-600">{formatDate(expense.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proof Files */}
        {expense.proofUrl && expense.proofUrl.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Proof Documents
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {expense.proofUrl.map((url, index) => (
                <div key={index} className="bg-gray-50 rounded p-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                  >
                    Doc {index + 1}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        {expense.history && expense.history.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <History className="w-4 h-4" />
              Update History
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {expense.history && [...expense.history].sort((a, b) => new Date(b.date) - new Date(a.date)).map((historyItem, index) => (
                    <div key={historyItem._id} className="border-l-2 border-blue-500 pl-3 py-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-gray-900">
                          Update #{expense.history.length - index}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(historyItem.date)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mb-1">
                        {formatHistoryChanges(historyItem.changes)}
                      </p>
                      {/* <p className="text-xs text-gray-500">
                        Updated by: {historyItem.updatedBy}
                      </p> */}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-purple-50 rounded-lg p-2">
            <p className="text-xs text-purple-600 font-medium">Version</p>
            <p className="text-sm font-semibold text-purple-800">v{expense.__v}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};



export default ExpenseViewModal;
