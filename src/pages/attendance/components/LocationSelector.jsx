"use client";

import { useState, useEffect } from "react";
import { MapPin, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

export function LocationSelector({
  onLocationUpdate,
  onAttendanceTypeChange,
  setLoading,
  locationPermission,
  attendanceType,
}) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    if (attendanceType && locationPermission === "granted") {
      getCurrentLocation();
    }
  }, [attendanceType, locationPermission]);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const address = await getDetailedAddress(latitude, longitude);

          const locationData = {
            latitude,
            longitude,
            address,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy,
            type: attendanceType,
          };

          setCurrentLocation(locationData);
          onLocationUpdate(locationData);

          // console.log("User Latitude:", latitude)
          // console.log("User Longitude:", longitude)
          // console.log("User Location:", address)
          // console.log("Selected Option:", attendanceType === "office" ? "In Office" : "Outside of Office")
        } catch (error) {
          const locationData = {
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy,
            type: attendanceType,
          };

          setCurrentLocation(locationData);
          onLocationUpdate(locationData);

          // console.log("User Latitude:", latitude)
          // console.log("User Longitude:", longitude)
          // console.log("User Location:", `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          // console.log("Selected Option:", attendanceType === "office" ? "In Office" : "Outside of Office")
        }

        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Unable to get location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location timeout - try again";
            break;
        }

        setLocationError(errorMessage);
      },
      options
    );
  };

  const getDetailedAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
        {
          headers: {
            "User-Agent": "AttendanceApp/1.0",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.address) {
          const addressParts = [];

          if (data.address.house_number && data.address.road) {
            addressParts.push(
              `${data.address.house_number} ${data.address.road}`
            );
          } else if (data.address.road) {
            addressParts.push(data.address.road);
          }

          if (data.address.neighbourhood) {
            addressParts.push(data.address.neighbourhood);
          } else if (data.address.suburb) {
            addressParts.push(data.address.suburb);
          }

          if (data.address.city_district) {
            addressParts.push(data.address.city_district);
          }

          if (data.address.city || data.address.town || data.address.village) {
            addressParts.push(
              data.address.city || data.address.town || data.address.village
            );
          }

          if (addressParts.length > 0) {
            return addressParts.join(", ");
          }
        }

        return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    }

    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const requestLocationPermission = async () => {
    try {
      setIsRequestingPermission(true);
      setLocationError(null);

      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser");
        setIsRequestingPermission(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setIsRequestingPermission(false);
          await getCurrentLocation();
        },
        (error) => {
          setIsRequestingPermission(false);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationError(
              "Location permission denied. Please enable location access in your browser settings."
            );
          } else {
            setLocationError("Failed to get location. Please try again.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      setLocationError("Failed to request location permission");
      setIsRequestingPermission(false);
    }
  };

  const handleAttendanceTypeSelect = (type) => {
    onAttendanceTypeChange(type);
    setCurrentLocation(null);
  };

  const refreshLocation = () => {
    if (attendanceType && locationPermission === "granted") {
      getCurrentLocation();
    }
  };

  const needsLocationPermission = locationPermission !== "granted";
  const needsSetup =
    !attendanceType || needsLocationPermission || !currentLocation;

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg rounded-xl">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <MapPin className="h-5 w-5 text-primary" />
              {currentLocation && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              )}
            </div>
            <span className="text-lg font-semibold text-primary">
              Location Setup
            </span>
          </div>
          {currentLocation && (
            <button
              onClick={refreshLocation}
              disabled={isGettingLocation}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
            >
              <RefreshCw
                className={`h-4 w-4 ${isGettingLocation ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Location Loading */}
        {isGettingLocation && (
          <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-primary font-medium">
              Getting precise location...
            </span>
          </div>
        )}

        {/* Location Error */}
        {locationError && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-red-800 text-sm">{locationError}</span>
            </div>
            <button
              onClick={requestLocationPermission}
              disabled={isRequestingPermission || isGettingLocation}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Current Location Display */}
        {currentLocation && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="relative">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-primary mb-2">
                  📍 Current Location
                </h4>
                <p className="text-sm text-primary/90 mb-3">
                  {currentLocation.address}
                </p>
                <div className="flex items-center justify-between text-sm text-primary/70">
                  <span>Work Location: {currentLocation.type}</span>
                  <span>
                    Accuracy: ±{Math.round(currentLocation.accuracy)}m
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Setup Required Notification */}
        {needsSetup && needsLocationPermission && attendanceType && (
          <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 mb-1">
                Location Setup Required
              </h3>
              <p className="text-sm text-amber-700">
                Please allow location access to record attendance.
              </p>
            </div>
            {needsLocationPermission && attendanceType && (
              <div>
                <button
                  onClick={requestLocationPermission}
                  disabled={isRequestingPermission || isGettingLocation}
                  className="text-xs flex items-end gap-2 bg-primary text-white font-semibold px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequestingPermission ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Requesting Permission...</span>
                    </>
                  ) : (
                    <span>Allow</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
