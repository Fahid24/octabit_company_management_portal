"use client";

import { useState, useEffect } from "react";
import { FingerPrintScanner } from "./components/FingerPrint";
import { LocationSelector } from "./components/LocationSelector";
import {
  useCheckinMutation,
  useCheckoutMutation,
  useGetSingleEmployeeStatsByIdQuery,
} from "@/redux/features/employee/employeeApiSlice";
import { useSelector } from "react-redux";
import Loader from "@/component/Loader";
import { useNavigate } from "react-router-dom";
import { FloatingInput } from "@/component/FloatiingInput";
import { MoveLeft, UserIcon } from "lucide-react";
import Button from "@/component/Button";
import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";

export function AttendanceSystem() {
  const loginUser = useSelector((state) => state.userSlice.user);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [locationPermission, setLocationPermission] = useState("prompt");
  const [attendanceType, setAttendanceType] = useState("office");
  const [locationData, setLocationData] = useState(null);
  const [isQrVerified, setIsQrVerified] = useState(false);
  const [selectedLateOption, setSelectedLateOption] = useState("");
  const [customLateReason, setCustomLateReason] = useState("");

  const lateReasonOptions = [
    { value: "Sick", label: "Sick" },
    { value: "Traffic", label: "Traffic" },
    { value: "Family Emergency", label: "Family Emergency" },
    { value: "Office Transport", label: "Office Transport" },
    { value: "Other", label: "Other" },
  ];

  const [checkinMutation, { isLoading: isCheckinLoading }] =
    useCheckinMutation();
  const [checkoutMutation, { isLoading: isCheckoutLoading }] =
    useCheckoutMutation();
  const { data, error, isLoading, refetch } =
    useGetSingleEmployeeStatsByIdQuery(
      {
        id: loginUser?.user?._id,
      },
      {
        refetchOnFocus: true,
        refetchOnReconnect: true,
        refetchOnMountOrArgChange: true,
      }
    );

  const { data: adminConfig } = useGetAdminConfigQuery();

  const navigate = useNavigate();

  const isNightShift = loginUser?.user?.shift === "Night";

  const workStartTime = isNightShift ? adminConfig?.nightShiftWorkingHours.start : adminConfig?.workingHours.start;

  // Function to check if current time is past 9:00 AM
  const isLate = () => {
    const now = new Date();
    const nineAM = new Date();
    const startHour = workStartTime?.split(":")[0];
    const startMinute = workStartTime?.split(":")[1];
    nineAM.setHours(startHour, startMinute, 0, 0);
    return now > nineAM;
  };

  // Determine if we should show the late reason input
  const shouldShowLateReasonInput = !data?.checkIn && isLate();

  // Get the final late reason to pass as props
  const getFinalLateReason = () => {
    if (selectedLateOption === "Other") {
      return customLateReason;
    }
    return selectedLateOption;
  };

  const shouldDisableFingerprint = () => {
    // If already checked in, don't disable
    if (data?.checkIn) {
      return false;
    }

    // If not late, don't disable
    if (!isLate()) {
      return false;
    }

    // If late but no reason provided, disable
    const finalLateReason = getFinalLateReason();
    return !finalLateReason || finalLateReason.trim() === "";
  };

  useEffect(() => {
    if (data?.checkIn) {
      setIsQrVerified(true);
    }
    if (
      loginUser?.user?.workLocation === "Hybrid" ||
      loginUser?.user?.workLocation === "Remote"
    ) {
      setIsQrVerified(true);
    }
  }, [data, loginUser]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check location permission
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationPermission(result.state);

        result.addEventListener("change", () => {
          setLocationPermission(result.state);
        });
      });
    }
  }, []);

  const handleLocationUpdate = (location) => {
    setLocationData(location);
  };

  const handleAttendanceTypeChange = (type) => {
    setAttendanceType(type);
    setLocationData(null);
  };

  const handleQrVerification = (verified) => {
    setIsQrVerified(verified);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md lg:max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-form-header-gradient p-6 text-gray-800">
          <h1 className="text-xl lg:text-2xl font-bold text-center mt-2 lg:mt-0">
            Employee Attendance
          </h1>
          <div className="mt-2 text-center">
            <p className="text-sm opacity-90">{currentDate}</p>
            <p className="text-lg font-semibold">{currentTime}</p>
          </div>
          {/* Link to My Attendance List */}
          <div className="absolute top-2 lg:top-4 right-2 lg:right-4 flex">
            <button
              onClick={() =>
                navigate(`/attendance/employee/${loginUser?.user?._id}`)
              }
              className="text-xs lg:text-sm bg-gray-200 hover:bg-gray-300 px-3 py-0.5 lg:py-1 rounded-full transition-all font-semibold backdrop:blur-lg"
            >
              View Records
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-8 left-8 h-6 w-6 rounded-full bg-white/10"></div>
        </div>

        {/* Location Selector - Only show if QR is verified */}
        {isQrVerified && (
          <div className="p-6 border-b border-gray-100">
            <LocationSelector
              onLocationUpdate={handleLocationUpdate}
              onAttendanceTypeChange={handleAttendanceTypeChange}
              locationPermission={locationPermission}
              attendanceType={attendanceType}
            />
          </div>
        )}

        {/* Late Reason Input - Show conditionally */}
        {isQrVerified && shouldShowLateReasonInput && (
          <div className="flex items-center justify-center w-full mx-auto p-6">
            <div className="min-w-80">
              {selectedLateOption !== "Other" ? (
                <FloatingInput
                  label="Select Late Reason"
                  name="lateReason"
                  type="select"
                  value={selectedLateOption}
                  onChange={(e) => {
                    setSelectedLateOption(e.target.value);
                    // Clear custom reason when switching away from "Other"
                    if (e.target.value !== "Other") {
                      setCustomLateReason("");
                    }
                  }}
                  icon={<UserIcon className="h-5 w-5" />}
                  options={lateReasonOptions}
                  className="max-w-80 mb-4"
                  required
                />
              ) : (
                <div className="space-y-3">
                  <FloatingInput
                    label="Please specify your late reason"
                    name="customLateReason"
                    type="text"
                    value={customLateReason}
                    onChange={(e) => setCustomLateReason(e.target.value)}
                    icon={<UserIcon className="h-5 w-5" />}
                    className="max-w-80"
                    placeholder=""
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedLateOption("");
                        setCustomLateReason("");
                      }}
                      className="text-sm flex items-center gap-2 py-0.5 bg-primary text-white px-2 rounded-xl mt-3"
                    >
                      <MoveLeft strokeWidth={2} /> Back to options
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fingerprint Scanner */}
        <FingerPrintScanner
          isCheckinLoading={isCheckinLoading}
          isCheckoutLoading={isCheckoutLoading}
          refetch={refetch}
          data={data}
          checkoutMutation={checkoutMutation}
          checkinMutation={checkinMutation}
          locationData={locationData}
          attendanceType={attendanceType}
          locationPermission={locationPermission}
          isQrVerified={isQrVerified}
          onQrVerification={handleQrVerification}
          lateReason={getFinalLateReason()}
          shouldDisableFingerprint={shouldDisableFingerprint()}
        />

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            {!isQrVerified
              ? "Please scan the QR code to unlock attendance."
              : locationData
              ? "You can now mark your attendance."
              : "Please select your location to proceed."}
          </p>
        </div>
      </div>
    </div>
  );
}
