import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "@/component/Toast";

export default function PasswordCell({ password, readOnly = false }) {
  const [visible, setVisible] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    toast.success("Copied", "Password copied to clipboard");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono">{visible ? password : "*".repeat(8)}</span>
      <button
        onClick={() => setVisible(!visible)}
        className={`${
          readOnly ? "text-gray-400" : "text-gray-500 hover:text-gray-700"
        }`}
        title={readOnly ? "View password" : "Toggle password visibility"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
      <button
        onClick={handleCopy}
        className={`${
          readOnly ? "text-gray-400" : "text-gray-500 hover:text-gray-700"
        }`}
        title="Copy password"
      >
        <Copy size={16} />
      </button>
    </div>
  );
}
