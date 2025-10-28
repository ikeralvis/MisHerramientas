/**
 * Obtiene las iniciales de un texto (primera letra)
 * @param {string} text - El texto del cual extraer la inicial
 * @returns {string} - La primera letra en mayúscula
 */
export const getInitial = (text) => {
    return text?.charAt(0).toUpperCase() || '?';
};

/**
 * Trunca un texto a un número específico de caracteres
 * @param {string} text - El texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado con '...'
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Valida si una URL es válida
 * @param {string} url - URL a validar
 * @returns {boolean} - true si es válida
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Formatea una fecha para mostrar
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Genera un color aleatorio del array de colores
 * @param {Array} colors - Array de colores disponibles
 * @returns {string} - Color hexadecimal
 */
export const getRandomColor = (colors) => {
    return colors[Math.floor(Math.random() * colors.length)];
};
