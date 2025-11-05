import PropTypes from "prop-types";
import {
  File,
  Link,
  User,
  Building2,
  Mail,
  Globe,
  Phone,
  Flag,
  Clock,
  CreditCard,
} from "lucide-react";
import Button from "@/component/Button";

const IncomeDetailsModal = ({ open, onClose, data }) => {
  if (!open || !data) return null;

  const clientData = data?.clientId || {};
  const {
    name,
    companyName,
    clientType,
    email,
    phone,
    website,
    country,
    paymentType,
    timeZone,
    companyEmail,
  } = clientData;

  const {
    amount,
    receivedAmount,
    refInvoiceNo,
    date,
    proof,
    description,
    details,
    services,
  } = data || {};

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "N/A";
    const cleaned = ("" + phoneNumber).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return phoneNumber;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-5xl mx-4 my-8 p-8 overflow-y-auto max-h-[90vh] border border-white/30 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <span className="p-2 rounded-full bg-gradient-to-r from-primary to-[#d3a97c] text-white">
              <CreditCard className="w-6 h-6" />
            </span>
            Invoice{" "}
            <span className="text-primary">#{refInvoiceNo || "N/A"}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200/50 text-gray-600 hover:text-primary transition"
          >
            ✕
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Info */}
          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/80 to-[#d3a97c]/70 p-3 text-white font-semibold">
              Client Information
            </div>
            <div className="p-5 space-y-3 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />{" "}
                <span className="font-medium">Name:</span> {name || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />{" "}
                <span className="font-medium">Company:</span>{" "}
                {companyName || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />{" "}
                <span className="font-medium">Email:</span>{" "}
                <a
                  href={`mailto:${email}`}
                  className="text-blue-600 hover:underline"
                >
                  {email || "N/A"}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />{" "}
                <span className="font-medium">Company Email:</span>{" "}
                <a
                  href={`mailto:${companyEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {companyEmail || "N/A"}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />{" "}
                <span className="font-medium">Phone:</span>{" "}
                {formatPhoneNumber(phone)}
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />{" "}
                <span className="font-medium">Website:</span> {website || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-primary" />{" "}
                <span className="font-medium">Country:</span> {country || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />{" "}
                <span className="font-medium">Time Zone:</span>{" "}
                {timeZone || "N/A"}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-600/80 to-green-400/70 p-3 text-white font-semibold">
              Payment Information
            </div>
            <div className="p-5 space-y-4 text-sm text-gray-700">
              <div className="flex justify-between items-center">
                <p className="text-gray-500">Amount</p>
                <p className="font-bold text-primary">${amount || 0}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-500">Received</p>
                <p className="font-bold text-green-600">
                  BDT {receivedAmount || 0}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-500">Payment Type</p>
                <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                  {paymentType || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-500">Client Type</p>
                <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                  {clientType || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-500">Date</p>
                <p>{date ? new Date(date).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-8 grid md:grid-cols-2 md:gap-8">
          {/* Services */}
          <div className=" rounded-lg p-4 shadow-sm border-l-4 border-primary">
            <h3 className="text-lg font-semibold mb-3 text-primary">
              Services
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {services?.length > 0 ? (
                services.map((service, index) => (
                  <li key={index}>
                    {service?.label || `Service ${index + 1}`}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No services listed.</p>
              )}
            </ul>
          </div>

          {/* Proof */}
          <div className=" rounded-lg p-4 shadow-sm border-l-4 border-primary">
            <h3 className="text-lg font-semibold mb-3 text-primary">Proof</h3>
            <div className="flex flex-col gap-2 text-sm text-blue-600">
              {proof?.length > 0 ? (
                proof.map((item) => (
                  <a
                    key={item?._id}
                    href={item?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:underline break-all"
                  >
                    {item?.linkType === "file" ? (
                      <File className="w-4 h-4" />
                    ) : (
                      <Link className="w-4 h-4" />
                    )}
                    {item?.linkType === "file"
                      ? item?.url?.split("/")?.pop()
                      : `View ${item?.linkType}`}
                  </a>
                ))
              ) : (
                <p className="text-gray-500">No proof provided.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 shadow-sm border-l-4 border-primary mt-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">
            Notes & Details
          </h3>
          <p className="text-sm text-gray-600">
            {description || details || "No additional notes or details."}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-[#d3a97c] text-white font-medium hover:opacity-90 transition"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

IncomeDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.object,
};

export default IncomeDetailsModal;
