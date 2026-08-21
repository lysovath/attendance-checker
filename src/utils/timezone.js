export function toUTC7Date(utcIsoString) {
  if (!utcIsoString) return new Date(NaN);
  // Ensure we parse the string's components exactly as they are
  // If the backend string already has 'Z', getUTC* methods will extract its exact numbers.
  // If it doesn't have 'Z' and has no offset, appending 'Z' ensures it's parsed as UTC.
  let str = utcIsoString;
  if (!str.endsWith('Z') && !str.includes('+') && !str.match(/-\d{2}:\d{2}$/)) {
    str += 'Z';
  }
  return new Date(str);
}

export function formatTimeUTC7(utcIsoString) {
  if (!utcIsoString) return '';
  const d = toUTC7Date(utcIsoString);
  if (isNaN(d.getTime())) return '';
  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function formatDateUTC7(utcIsoString) {
  if (!utcIsoString) return '';
  const d = toUTC7Date(utcIsoString);
  if (isNaN(d.getTime())) return '';
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTimeUTC7(utcIsoString) {
  if (!utcIsoString) return '';
  const d = toUTC7Date(utcIsoString);
  if (isNaN(d.getTime())) return '';
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
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
