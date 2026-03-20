/**
 * Slug utility - Converts resource names to camelCase URL-friendly slugs
 * Used for creating RESTful text-based identifiers in URLs
 * 
 * Example: "Dự án Website Redesign" → "duAnWebsiteRedesign"
 * Example: "Setup Database Server" → "setupDatabaseServer"
 */

/**
 * Convert any string to a camelCase slug
 * Handles Vietnamese characters by converting to ASCII equivalents
 */
export function toSlug(text) {
    if (!text) return '';

    // Vietnamese character mapping
    const vnMap = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'đ': 'd',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    };

    // Convert Vietnamese chars to ASCII
    let result = text.toLowerCase().split('').map(c => vnMap[c] || c).join('');

    // Remove special characters, keep letters, numbers, spaces
    result = result.replace(/[^a-z0-9\s]/g, ' ');

    // Split into words, filter empty, convert to camelCase
    const words = result.split(/\s+/).filter(Boolean);

    if (words.length === 0) return '';

    return words
        .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

/**
 * Navigate helper - navigates using slug URL but passes real ID via state
 * @param {Function} navigate - React Router navigate function
 * @param {string} basePath - Base path like '/projects' or '/tasks'
 * @param {object} item - The item with { id, name/title }
 * @param {string} [suffix] - Optional suffix like '/board' or '/workspace'
 */
export function navigateWithSlug(navigate, basePath, item, suffix = '') {
    const name = item.name || item.title || item.id;
    const slug = toSlug(name) || item.id;

    navigate(`${basePath}/${slug}${suffix}`, {
        state: { _resourceId: item.id }
    });
}

/**
 * Hook helper - resolves the actual resource ID from URL params + location state
 * Priority: location.state._resourceId > URL param (as fallback)
 * @param {string} paramId - The URL parameter (slug or ID)
 * @param {object} locationState - React Router location.state
 * @returns {string} The actual resource ID
 */
export function resolveResourceId(paramId, locationState) {
    // If state has the real ID, use it (normal navigation)
    if (locationState?._resourceId) {
        return locationState._resourceId;
    }
    // Fallback: use the param directly (might be an ID for backward compatibility)
    return paramId;
}
