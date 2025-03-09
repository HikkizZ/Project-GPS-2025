/**
 * Validates a Chilean RUT.
 * @param rut - The RUT to validate (can be with or without periods and hyphen).
 * @returns `true` if valid, `false` if invalid.
 */

export function validateRut(rut: string): boolean {
    if (!rut) return false;

    // Remove all periods and convert to uppercase
    const cleanRut = rut.replace(/\./g, '').trim().toUpperCase();

    // Split the RUT into number and verifier
    const match = cleanRut.match(/^(\d{7,8})-([\dK])$/);
    if (!match) return false;

    const num = match[1]; // Number part
    const dv = match[2]; // Verifier part

    // Calculate the verifier
    let sum = 0;
    let mul = 2;

    for (let i = num.length - 1; i >= 0; i--) {
        sum += parseInt(num[i]) * mul;
        mul = (mul === 7) ? 2 : mul + 1;
    }

    const dvExpected = 11 - (sum % 11);
    const dvCalculated = (dvExpected === 11) ? '0' : (dvExpected === 10) ? 'K' : dvExpected.toString();

    return dv === dvCalculated;
}

export function formatRut(rut: string): string {
    const cleanRut = rut.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();

    const num = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    const numFormatted = num.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Add periods every 3 digits

    return `${numFormatted}-${dv}`;
}