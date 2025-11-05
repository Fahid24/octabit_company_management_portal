// Custom date utility functions to replace moment.js

export const formatDate = (date, format = "MMM DD, YYYY") => {
  if (!date) return ""

  const d = new Date(date)
  if (isNaN(d.getTime())) return ""

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const fullMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const day = d.getDate().toString().padStart(2, "0")
  const month = months[d.getMonth()]
  const fullMonth = fullMonths[d.getMonth()]
  const year = d.getFullYear()
  const hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  const hours12 = hours % 12 || 12

  switch (format) {
    case "MMM DD, YYYY":
      return `${month} ${day}, ${year}`
    case "YYYY-MM-DD":
      return `${year}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${day}`
    case "MM-DD-YYYY":
      return `${(d.getMonth() + 1).toString().padStart(2, "0")}-${day}-${year}`
    case "hh:mm A":
      return `${hours12.toString().padStart(2, "0")}:${minutes} ${ampm}`
    default:
      return d.toLocaleDateString()
  }
}

export const formatDateWithTimezone = (date, offsetHours = -6) => {
  if (!date) return ""

  const d = new Date(date)
  if (isNaN(d.getTime())) return ""

  // Apply timezone offset
  const offsetMs = offsetHours * 60 * 60 * 1000
  const adjustedDate = new Date(d.getTime() + offsetMs)

  const hours = adjustedDate.getUTCHours()
  const minutes = adjustedDate.getUTCMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  const hours12 = hours % 12 || 12

  return `${hours12.toString().padStart(2, "0")}:${minutes} ${ampm}`
}

export const parseDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Convert UTC date specifically for modal date inputs with proper timezone handling
 * @param {string|Date} utcDate - UTC date string or Date object
 * @returns {string} - Local date string in YYYY-MM-DD format for input fields
 */
export const formatUTCToModalInput = (utcDate) => {
  if (!utcDate) return '';
  
  // Create date object from UTC string
  const date = new Date(utcDate);
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  // Get timezone offset in minutes and convert to milliseconds
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  
  // Create new date adjusted for local timezone
  const localDate = new Date(date.getTime() - timezoneOffset);
  
  // Format as YYYY-MM-DD for input field
  return localDate.toISOString().split('T')[0];
};
