// src/utils/date-utils.js
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getWeekRange(date = new Date()) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  return { start, end };
}

export function isWithinDateRange(date, start, end) {
  const checkDate = new Date(date);
  return checkDate >= start && checkDate <= end;
}