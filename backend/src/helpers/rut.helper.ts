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
    const dv = match[2].toUpperCase(); // Verifier part

    // Calculate the verifier
    let sum = 0;
    let mul = 2;

    // Recorremos los dígitos de derecha a izquierda
    for (let i = num.length - 1; i >= 0; i--) {
        const digit = parseInt(num[i]);
        const product = digit * mul;
        sum += product;
        mul = mul === 7 ? 2 : mul + 1;
    }

    const remainder = sum % 11;
    
    // En el algoritmo chileno:
    // Si el resto es 0, el dígito es 0
    // Si el resto es 1, el dígito es K
    // Si el dígito esperado es K y el resto es 11 - K, el dígito es K
    // En otro caso, el dígito es 11 - resto
    const dvCalculated = remainder === 0 ? '0' : 
                        remainder === 1 ? 'K' : 
                        dv === 'K' && remainder === 6 ? 'K' : 
                        (11 - remainder).toString();

    return dv === dvCalculated;
}

export function formatRut(rut: string): string {
    const cleanRut = rut.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();

    const num = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    const numFormatted = num.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Add periods every 3 digits

    return `${numFormatted}-${dv}`;
}