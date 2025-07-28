/**
 * Formats a given date to local time in Santiago, Chile (America/Santiago timezone).
 * 
 * @param date - The date to format. Can be a string, number (timestamp), or Date object.
 * @returns A formatted string in the format `dd/mm/yyyy HH:mm`, using a 24-hour clock.
 */

export function formatToLocalTime(date: string | number | Date): string{
    return new Date(date).toLocaleString('es-CL', {
        timeZone: 'America/Santiago', // Sets the timezone to Chile's local time
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h24' // 24-hour format
    }).replace(',', ''); // Remove the comma from the date
}

/**
 * Formats a given date to dd-mm-yyyy format.
 * 
 * @param date - The date to format. Can be a string, number (timestamp), or Date object.
 * @returns A formatted string in the format `dd-mm-yyyy`.
 */
export function formatToLocalDate(date: string | number | Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}