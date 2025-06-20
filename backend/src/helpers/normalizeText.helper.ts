/**
 * Normaliza texto eliminando tildes y convirtiendo a minúsculas
 * @param text - Texto a normalizar
 * @returns Texto normalizado sin tildes y en minúsculas
 */
export function normalizeText(text: string): string {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos (tildes)
        .trim();
}

/**
 * Crea un patrón ILIKE para búsqueda insensible a tildes y mayúsculas
 * @param searchTerm - Término de búsqueda
 * @returns Patrón para usar con ILIKE
 */
export function createSearchPattern(searchTerm: string): string {
    if (!searchTerm) return '';
    
    const normalized = normalizeText(searchTerm);
    return `%${normalized}%`;
} 