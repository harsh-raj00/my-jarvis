export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isValidApiKey = (key) => {
  return key && key.length > 20 && key.includes('AIza')
}

export const isStrongPassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  )
}

export const validateForm = (data, schema) => {
  const errors = {}
  
  Object.keys(schema).forEach(key => {
    const validator = schema[key]
    const value = data[key]
    
    if (validator.required && !value) {
      errors[key] = 'This field is required'
    } else if (validator.pattern && !validator.pattern.test(value)) {
      errors[key] = validator.message || 'Invalid format'
    } else if (validator.minLength && value.length < validator.minLength) {
      errors[key] = `Minimum ${validator.minLength} characters required`
    } else if (validator.maxLength && value.length > validator.maxLength) {
      errors[key] = `Maximum ${validator.maxLength} characters allowed`
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}