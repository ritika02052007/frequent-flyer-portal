import DOMPurify from 'dompurify'

/**
 * Sanitizes input text using DOMPurify, removing all HTML/script tags and attributes.
 * @param {string} input - Raw input string
 * @returns {string} Sanitized string safe for state and DOM
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}

export const sanitize = sanitizeInput
export default sanitizeInput
