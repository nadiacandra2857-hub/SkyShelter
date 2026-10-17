import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Safely parse a date value from string, number, or Date object
 */
export function parseSafeDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isValid(dateInput) ? dateInput : null;
  try {
    const parsed = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Format time only (HH:mm:ss atau HH:mm)
 */
export function formatTime(dateInput, withSeconds = true) {
  const d = parseSafeDate(dateInput);
  if (!d) return '-';
  return format(d, withSeconds ? 'HH:mm:ss' : 'HH:mm', { locale: id });
}

/**
 * Format date & time (17 Okt 2026, 14:30)
 */
export function formatDateTime(dateInput) {
  const d = parseSafeDate(dateInput);
  if (!d) return '-';
  return format(d, 'dd MMM yyyy, HH:mm', { locale: id });
}

/**
 * Format full date with day (Sabtu, 17 Oktober 2026)
 */
export function formatFullDate(dateInput) {
  const d = parseSafeDate(dateInput);
  if (!d) return '-';
  return format(d, 'EEEE, d MMMM yyyy', { locale: id });
}

/**
 * Format relative time (e.g. "3 menit lalu")
 */
export function formatRelativeTime(dateInput) {
  const d = parseSafeDate(dateInput);
  if (!d) return '-';
  try {
    return formatDistanceToNow(d, { addSuffix: true, locale: id });
  } catch {
    return formatTime(d);
  }
}
