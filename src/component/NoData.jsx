import PropTypes from "prop-types";
import { Users, RefreshCw } from "lucide-react";
import Button from "./Button";

export function EmptyState({ message = "No data found in the system.", refetch, icon = <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" /> }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {icon}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something Went Wrong
        </h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-center">
          <Button onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}

EmptyState.propTypes = {
  message: PropTypes.string,
  refetch: PropTypes.func.isRequired,
  icon: PropTypes.node
};