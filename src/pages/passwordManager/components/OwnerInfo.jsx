import React from "react";
import { useGetEmployeeByIdQuery } from "@/redux/features/admin/employee/employeeApiSlice";

export default function OwnerInfo({ createdBy, label = "Owned by" }) {
  // Allow createdBy to be: employee object, user object, or an id string
  const raw = createdBy;

  // Try to render directly if details already exist on the object
  const immediate = (() => {
    if (raw && typeof raw === "object") {
      const name =
        raw.fullName || `${raw.firstName || ""} ${raw.lastName || ""}`.trim();
      const dept =
        raw?.department?.name || raw?.departmentName || raw?.department?.title;
      if (name) return { name, dept };
    }
    return null;
  })();

  // Derive a best-effort employee id for fetching
  const creatorId =
    raw?._id ||
    raw?.employeeId ||
    raw?.id ||
    raw?.user?._id ||
    (typeof raw === "string" ? raw : undefined);

  // Always call the hook; skip when we already have details or no id
  const { data, isFetching, isError } = useGetEmployeeByIdQuery(creatorId, {
    skip: !creatorId || Boolean(immediate),
  });

  if (!raw) return null;

  if (immediate) {
    return (
      <span className="ml-2">
        • {label} {immediate.name}
        {immediate.dept ? ` (${immediate.dept})` : ""}
      </span>
    );
  }

  if (isFetching) return <span className="ml-2">• {label} Loading…</span>;
  if (isError || !data) return <span className="ml-2">• {label} Unknown</span>;

  const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
  const displayName = fullName || data.email || "Unknown";
  const dept = data?.department?.name ? ` (${data.department.name})` : "";

  return (
    <span className="ml-2">
      • {label} {displayName}
      {dept}
    </span>
  );
}
