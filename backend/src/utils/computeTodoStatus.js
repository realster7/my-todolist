function toDateOnly(value) {
  const d = value instanceof Date ? value : new Date(value);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function computeTodoStatus({ isDone, startDate, endDate }, today = new Date()) {
  const start = toDateOnly(startDate);
  const end = toDateOnly(endDate);
  const t = toDateOnly(today);

  if (isDone) return 'DONE';
  if (end < t) return 'OVERDUE';
  if (start <= t && t <= end) return 'IN_PROGRESS';
  return 'NOT_STARTED';
}

module.exports = { computeTodoStatus };
