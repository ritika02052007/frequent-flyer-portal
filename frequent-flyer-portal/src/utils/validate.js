/**
 * Validates flyer form inputs.
 * @param {Object} flyer - Flyer input values
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export const validateFlyer = ({ name, email, membershipNumber, tier, points }) => {
  const errors = {}

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.name = 'Name is required'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.email = 'Email is required'
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  if (!membershipNumber || typeof membershipNumber !== 'string' || !membershipNumber.trim()) {
    errors.membershipNumber = 'Membership number is required'
  }

  const validTiers = ['Silver', 'Gold', 'Platinum']
  if (!tier || !validTiers.includes(tier)) {
    errors.tier = 'Tier must be Silver, Gold, or Platinum'
  }

  const numPoints = Number(points)
  if (points === '' || points === null || points === undefined || Number.isNaN(numPoints) || numPoints < 0) {
    errors.points = 'Points must be a non-negative number'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export default validateFlyer
