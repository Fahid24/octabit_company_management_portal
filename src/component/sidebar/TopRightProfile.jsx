import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  LogOut,
  Settings,
  AlarmCheck,
  Bell,
  KeySquare,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import NotificationPanel from "@/pages/notification/component/NotificationPanel";

export default function TopRightProfile() {
  const loginUser = useSelector((state) => state.userSlice.user);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const user = {
    role: loginUser?.user?.role || "user",
    username:
      loginUser?.user?.firstName && loginUser?.user?.lastName
        ? `${loginUser.user.firstName} ${loginUser.user.lastName}`
        : "Monkey man User",
    image: loginUser?.user?.image || "",
    profileImage: loginUser?.user?.photoUrl || "",
    designation: loginUser?.user?.designation || "",
  };
  const handleLogout = () => {
    localStorage.removeItem("MONKEY-MAN-USER");
    navigate("/login");
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setNotifOpen(false); // Also close notification dropdown
      }
    }
    if (open || notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, notifOpen]);

  return (
    <div className="relative flex items-center gap-1 md:gap-3" ref={menuRef}>
      {/* Notification Icon */}
      <div className="relative">
        <button
          className="relative p-2.5 rounded-full bg-gray-100 md:bg-white hover:bg-gray-100 focus:outline-none"
          aria-label="Notifications"
          type="button"
          onClick={() => {
            setNotifOpen((v) => !v);
            setOpen(false); // Close profile dropdown when opening notifications
          }}
        >
          <Bell className="w-6 h-6 text-gray-600" />
        </button>
        <NotificationPanel
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          userId={loginUser?.user?._id}
        />
      </div>
      {/* Profile Button */}
      <button
        className="flex items-center gap-2 px-4 py-3 rounded-full focus:outline-none"
        onClick={() => {
          setOpen((v) => !v);
          setNotifOpen(false); // Close notification panel when opening profile
        }}
        aria-label="Open profile menu"
        type="button"
      >
        {user.image || user.profileImage ? (
          <img
            src={user.image || user.profileImage}
            alt="User"
            className="rounded-full w-10 md:w-11 h-10 md:h-11 object-cover border border-primary p-0.5"
          />
        ) : (
          <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center">
            <UserIcon className="text-white w-5 h-5" />
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-16 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {/* User info section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-900 text-sm">
              {user.username}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {loginUser?.user?.designation}
            </div>
          </div>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              if (loginUser?.user?._id) {
                navigate(`/profile/${loginUser.user._id}`);
              } else {
                navigate("/profile");
              }
            }}
          >
            <UserIcon className="w-4 h-4" /> Profile
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              if (loginUser?.user?._id) {
                navigate(`/change-password`);
              } else {
                navigate("/profile");
              }
            }}
          >
            <KeySquare className="w-4 h-4" /> Change Password
          </button>
          {/* <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setOpen(false)
              navigate("/settings")
            }}
          >
            <Settings className="w-4 h-4" /> Settings
          </button> */}
          {/* <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setOpen(false)
              navigate("/settings")
            }}
          >
            <AlarmCheck className="w-4 h-4" /> Notifications
          </button> */}
          <hr />
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              handleLogout();
            }}
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
