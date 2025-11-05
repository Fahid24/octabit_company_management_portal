import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { LockIcon } from "lucide-react";
import { FloatingInput } from "@/component/FloatiingInput";
import Button from "@/component/Button";
import { useChangePasswordMutation } from "@/redux/features/auth/authApiSlice";
import logoImage from "../../../assets/companyLogo/logo_crop_no_bg.png";
import { toast } from "@/component/Toast";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ChangePassword = () => {
  const user = useSelector((state) => state.userSlice.user);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get("token");
  const [changePassword] = useChangePasswordMutation();

  // console.log("user", user);
  const userId = user?.user?._id || "";

  const handleLogout = () => {
    localStorage.removeItem("MONKEY-MAN-USER");
    navigate("/login");
  };

  const handleCurrentPasswordChange = (e) => {
    const value = e.target.value;
    setCurrentPassword(value);
  };
  // Check password match and length on change
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);

    if (value.length > 0 && value.length < 6) {
      setNewPasswordError("Password should be at least 6 characters.");
    } else {
      setNewPasswordError("");
    }

    // Also check confirm password match
    if (confirmPassword && value !== confirmPassword) {
      setConfirmError("Passwords do not match!");
    } else {
      setConfirmError("");
    }
  };

  const handleConfirmChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (newPassword && value && newPassword !== value) {
      setConfirmError("Passwords do not match!");
    } else {
      setConfirmError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setNewPasswordError("Password should be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ userId, currentPassword, newPassword }).unwrap();
      setIsSubmitting(false);
      // successAlert({
      //   title: "Success",
      //   text: "Your password has been reset successfully.",
      // });
      toast.success("Success", "Your password has been changed successfully.");
      handleLogout();
    } catch (err) {
      setIsSubmitting(false);
      // errorAlert({
      //   title: "Error",
      //   text: err?.data?.message || "Failed to reset password.",
      // });
      toast.error("Error", err?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f4f1] via-white to-[#f4f1ee] p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>
        <img src={logoImage} alt="Logo" className="h-16 mb-6" />
        <h2 className="text-xl md:text-2xl font-bold text-center mb-8 mt-2">
          CHANGE YOUR PASSWORD
        </h2>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <FloatingInput
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            required
            icon={<LockIcon className="h-5 w-5" />}
            error={currentPasswordError}
          />
          <div className="mt-4">
            <FloatingInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              required
              icon={<LockIcon className="h-5 w-5" />}
              error={newPasswordError}
            />
          </div>
          <FloatingInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmChange}
            required
            icon={<LockIcon className="h-5 w-5" />}
            className="mt-4"
            error={confirmError}
          />
          <div className="flex justify-center gap-4 mt-8">
            <Button
              type="button"
              className="px-8 py-2 rounded-md bg-gray-500"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 rounded-md"
            >
              {isSubmitting ? "Changing..." : "CHANGE PASSWORD"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
