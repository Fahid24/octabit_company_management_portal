export function setNestedValue(obj, path, value) {
  const keys = path.split(".")
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {}
    }
    current = current[key]
  }
  current[keys[keys.length - 1]] = value
}

// Helper to get a nested value from an object
export function getNestedValue(obj, path) {
  const keys = path.split(".")
  let current = obj
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (current === null || typeof current !== "object" || !current.hasOwnProperty(key)) {
      return undefined // Or null, depending on desired behavior
    }
    current = current[key]
  }
  return current
}