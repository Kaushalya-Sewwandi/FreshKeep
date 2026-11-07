export const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return "Unknown";

  // Get today's date without time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Convert expiry date to Date object
  const expiry = new Date(`${expiryDate}T00:00:00`);

  if (Number.isNaN(expiry.getTime())) {
    return "Unknown";
  }

  // Calculate remaining days
  const difference = expiry.getTime() - today.getTime();
  const daysLeft = Math.round(difference / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return "Expired";
  }

  if (daysLeft === 0) {
    return "Expires Today";
  }

  if (daysLeft <= 3) {
    return "Expiring Soon";
  }

  return "Fresh";
};
