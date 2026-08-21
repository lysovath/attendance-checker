const UTC7_OFFSET = 7 * 60 * 60 * 1000;

export function toUTC7Date(utcIsoString) {
  const utcDate = new Date(utcIsoString);
  return new Date(utcDate.getTime() + UTC7_OFFSET);
}

export function formatTimeUTC7(utcIsoString) {
  const d = toUTC7Date(utcIsoString);
  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function formatDateUTC7(utcIsoString) {
  const d = toUTC7Date(utcIsoString);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTimeUTC7(utcIsoString) {
  const d = toUTC7Date(utcIsoString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${month} ${day}, ${year}, ${h12}:${minutes} ${ampm}`;
}

export function formatDateTimeLocalInput(utcIsoString) {
  if (!utcIsoString) return '';
  const d = toUTC7Date(utcIsoString);
  if (isNaN(d.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function todayKeyUTC7() {
  const d = new Date(Date.now() + UTC7_OFFSET);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
