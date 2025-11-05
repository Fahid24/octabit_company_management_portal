import { ChevronRight, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function Button({
  children,
  onClick,
  type = "button",
  size = "md",
  variant = "primary",
  iconPosition = "right",
  icon: Icon = "",
  isLoading = false,
  isSuccess = false,
  isError = false,
  disabled = false,
  className = "",
  ...props
}) {
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  // Variant classes (background, hover, focus)
  const variantClasses = {
    primary: "bg-primary hover:bg-primary focus:ring-primary text-white",
    secondary:
      "bg-gray-200 hover:bg-gray-300 focus:ring-gray-400 text-gray-800",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white",
    error: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
    cancel: "bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white",
    reset:
      " bg-gray-200 hover:bg-gray-300 focus:ring-gray-400 text-gray-800 rounded-md",
    outline:
      "bg-transparent border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
  };

  // Determine which variant to use based on state
  let currentVariant = variant;
  if (isError) currentVariant = "error";
  if (isSuccess) currentVariant = "success";

  // Determine which icon to show
  let IconComponent = Icon || "";
  if (isLoading) IconComponent = Loader2;
  else if (isSuccess) IconComponent = CheckCircle;
  else if (isError) IconComponent = XCircle;

  // If IconComponent is a React component, render it, else render nothing
  const renderIcon = (icon) => {
    if (typeof icon === "function") {
      const IconTag = icon;
      return <IconTag className="w-4 h-4 mr-1" />;
    }
    return null;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        flex items-center justify-center
        rounded-full shadow-sm
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${sizeClasses[size]}
        ${variantClasses[currentVariant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      {...props}
    >
      {iconPosition === "left" && IconComponent
        ? renderIcon(IconComponent)
        : null}

      {children}

      {iconPosition === "right" && IconComponent
        ? renderIcon(IconComponent)
        : null}
    </button>
  );
}
