// Helper to format date as '28 May, 2025'
export function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).replace(/ /, ' ');
}

// Helper to format date as 'YYYY-MM-DD' for input fields
export function formatDateInput(dateString) {
    if (!dateString) return '';
    // Create date object from the UTC string
    const date = new Date(dateString);
    
    // Get year, month, and day components in local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Format as YYYY-MM-DD
    return `${year}-${month}-${day}`;
} 