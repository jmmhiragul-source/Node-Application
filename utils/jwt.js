/**
 * Parse JWT expiration string (e.g., '1m', '30m', '7d') and return expiration date
 * @param {string} expiresIn - JWT expiration string (default: '1m')
 * @returns {Date} - Expiration date
 */
function getExpirationDate(expiresIn = '1m') {
  const expiresAt = new Date();
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));

  switch (unit) {
    case 's': // seconds
      expiresAt.setSeconds(expiresAt.getSeconds() + value);
      break;
    case 'm': // minutes
      expiresAt.setMinutes(expiresAt.getMinutes() + value);
      break;
    case 'h': // hours
      expiresAt.setHours(expiresAt.getHours() + value);
      break;
    case 'd': // days
      expiresAt.setDate(expiresAt.getDate() + value);
      break;
    default:
      // Default to 1 minute if format is unrecognized
      expiresAt.setMinutes(expiresAt.getMinutes() + 1);
  }

  return expiresAt;
}

module.exports = {
  getExpirationDate
};

