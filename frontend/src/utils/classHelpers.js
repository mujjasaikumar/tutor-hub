export function getClassStatus(classDate, classTime) {
  const classDateTime = new Date(`${classDate}T${classTime}`);
  const now = new Date();
  const classEndTime = new Date(classDateTime.getTime() + 60 * 60 * 1000); // Assume 1 hour class

  if (now >= classDateTime && now <= classEndTime) {
    return 'live';
  } else if (now > classEndTime) {
    return 'completed';
  } else {
    return 'upcoming';
  }
}

export function canJoinClass(classDate, classTime) {
  const status = getClassStatus(classDate, classTime);
  return status === 'live';
}

export function formatDateTime(date, time) {
  const dt = new Date(`${date}T${time}`);
  return dt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
