import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

const ErrorMessage = ({ error, refetch }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Data
        </h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error?.message || "Failed to fetch employee data. Please try again."}
        </div>
        <div className="flex justify-center">
          <Button onClick={refetch} className="mr-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;