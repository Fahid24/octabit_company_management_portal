import Button from "@/component/Button";
import Loader from "@/component/Loader";
import { useGetProjectQuery } from "@/redux/features/admin/project/projectApiSlice";
import Loading from "@/utils/CLoading/Loading";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  Users,
  FileText,
  Link,
  Building2,
  X,
  Info,
  User,
  FileTerminal,
} from "lucide-react";
import PropTypes from "prop-types";

export default function ClientDetailsModal({ isOpen, onClose, data }) {
  const { data: projectDetails, isLoading } = useGetProjectQuery(data.project);
  if (!isOpen) return null;

  if (isLoading) return  <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[95vh] border border-primary/40 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-5 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent rounded-t-2xl sm:rounded-t-3xl">
          <h2 className="text-lg sm:text-2xl font-extrabold text-primary tracking-wide">
            Client Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-primary transition-transform transform hover:scale-110"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 pb-20 sm:pb-8">
          {/* Header Content */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border border-primary/40 rounded-2xl p-4 sm:p-6 shadow-md bg-gradient-to-br from-white to-primary/5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 sm:ring-4 ring-primary/70 shadow-md flex items-center justify-center bg-gray-50">
              {data.companyLogo ? (
                <img
                  src={data.companyLogo}
                  alt={data.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl sm:text-3xl font-bold text-primary">
                  {data.companyName[0]}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-3xl font-extrabold text-primary drop-shadow-sm">
                {data?.companyName}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mt-3">
                <span className="bg-primary text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-full shadow hover:bg-[#8a623c] transition">
                  {data?.clientType ? data.clientType : "N/A"}
                </span>
                <span className="border border-primary text-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-full shadow-sm">
                  {data?.paymentType ? data.paymentType : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* About Section */}
          {data.details && (
            <div className="rounded-2xl shadow-lg border border-primary/30 p-4 sm:p-6 bg-white/70">
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-primary">
                <Info className="w-4 h-4 sm:w-5 sm:h-5" /> About
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {data.details}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Client Info */}
            <div className="rounded-2xl shadow-lg border border-primary/30 p-4 sm:p-6 bg-white/70 hover:shadow-xl transition">
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-primary">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" /> Client Info
              </h2>
              <div className="space-y-2 text-sm sm:text-base text-gray-700">
                <p className="flex items-center gap-2 break-all">
                  <User className="w-4 h-4 text-primary" /> {data.name || "N/A"}
                </p>
                <p className="flex items-center gap-2 break-all">
                  <Mail className="w-4 h-4 text-primary" />{" "}
                  {data.email || "N/A"}
                </p>
                <p className="flex items-center gap-2 break-all">
                  <Phone className="w-4 h-4 text-primary" />{" "}
                  {data.phone || "N/A"}
                </p>
              </div>
            </div>

            {/* Company Info */}
            <div className="rounded-2xl shadow-lg border border-primary/30 p-4 sm:p-6 bg-white/70 hover:shadow-xl transition">
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-primary">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" /> Company Info
              </h2>
              <div className="space-y-2 text-sm sm:text-base text-gray-700">
                <p className="flex items-center gap-2 break-all">
                  <Mail className="w-4 h-4 text-primary" />{" "}
                  {data.companyEmail || "N/A"}
                </p>
                <p className="flex items-center gap-2 break-all">
                  <Globe className="w-4 h-4 text-primary" />{" "}
                  {data.website ? (
                    <a
                      href={data.website}
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {data.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />{" "}
                  {data.state || "N/A"}, {data.country || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />{" "}
                  {data.timeZone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Services */}
            <div className="rounded-2xl shadow-lg border border-primary/30 p-4 sm:p-6 bg-white/70 hover:shadow-xl transition">
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-primary">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Services
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.services?.map((s, idx) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-primary to-[#c29b73] text-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-full shadow-md"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div className="rounded-2xl shadow-lg border border-primary/30 p-4 sm:p-6 bg-white/70">
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-primary">
                <Link className="w-4 h-4 sm:w-5 sm:h-5" /> Attachments
              </h2>
              {data.attachments?.length > 0 ? (
                <ul className="space-y-2 text-xs sm:text-sm break-all">
                  {data.attachments?.map((file, idx) => (
                    <li key={idx}>
                      <a
                        href={file.url}
                        target="_blank"
                        className="text-primary hover:underline hover:font-medium transition"
                      >
                        {file.label === "file"
                          ? file.url.split("/").pop()
                          : file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No attachments available.
                </p>
              )}
            </div>
          </div>

          {/* People */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Employee */}
            <div className="rounded-2xl shadow-lg border border-primary/30 p-4 sm:p-6 bg-white/70">
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-primary">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" /> Key Employee
              </h2>
              <p className="text-sm sm:text-base text-gray-700">
                {data.employees?.firstName} {data.employees?.lastName}
              </p>
            </div>

            {/*Project */}
            <div className="rounded-2xl shadow-lg border border-primary/30 p-4 sm:p-6 bg-white/70 space-y-3">
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-primary">
                <FileTerminal className="w-4 h-4 sm:w-5 sm:h-5" /> Project
              </h2>
              <p className="text-sm sm:text-base text-gray-700">
                {projectDetails?.project?.name}
              </p>
            </div>
          </div>

          <div className="rounded-2xl shadow-lg border border-primary/30 p-4 sm:p-6 bg-white/70 space-y-3">
            <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-primary">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" /> Team Members
            </h2>
            <div className="grid md:grid-cols-2  gap-8">
              {data.teamMembers?.length > 0 ? (
                data.teamMembers.map((m, idx) => (
                  <div
                    key={idx}
                    className="border border-primary/30 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent"
                  >
                    <p className="font-semibold text-primary">
                      {m.name || "N/A"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {m.role || "N/A"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 break-all">
                      Email: {m.email || "N/A"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 break-all">
                      Phone: {m.phone || "N/A"}
                    </p>
                    {m.memberCommunicationChannel?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.memberCommunicationChannel.map((ch, i) => (
                          <span
                            key={i}
                            className="bg-primary text-white text-xs sm:text-sm px-2 py-1 rounded-full shadow"
                          >
                            {ch.type}: {ch.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No team members added yet.
                </p>
              )}
            </div>
          </div>

          {/* Communication Channels */}
          <div className="rounded-2xl shadow-lg border border-primary/30 p-4 sm:p-6 bg-white/70">
            <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-primary">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" /> Communication Channels
            </h2>
            <div className="space-y-2 text-xs sm:text-sm">
              {data.communicationChannels?.length > 0 ? (
                data.communicationChannels?.map((ch, idx) => (
                  <p
                    key={idx}
                    className="flex flex-wrap items-center gap-2 text-gray-700 break-all"
                  >
                    <span className="capitalize font-semibold text-primary">
                      {ch.type}:
                    </span>{" "}
                    <a
                      href={ch.value}
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {ch.value}
                    </a>
                  </p>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No communication channels available.
                </p>
              )}
            </div>
          </div>

          {/* Bottom Close Button */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={onClose}
              className="bg-primary text-white px-6 py-2 rounded-md shadow"
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

ClientDetailsModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.shape({
    companyName: PropTypes.string,
    companyLogo: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    companyEmail: PropTypes.string,
    phone: PropTypes.string,
    website: PropTypes.string,
    state: PropTypes.string,
    country: PropTypes.string,
    timeZone: PropTypes.string,
    clientType: PropTypes.string,
    paymentType: PropTypes.string,
    project: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
      }),
    ]),

    details: PropTypes.string,
    services: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
      })
    ),
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
        label: PropTypes.string,
        name: PropTypes.string,
      })
    ),
    employees: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    teamMembers: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.string,
      })
    ),
    communicationChannels: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        value: PropTypes.string,
      })
    ),
  }),
};
