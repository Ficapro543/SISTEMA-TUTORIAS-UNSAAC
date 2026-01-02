/**
 * Utility function to concatenate CSS class names
 * Filters out falsy values (null, undefined, false, empty strings)
 * @param  {...any} classes - class names to concatenate
 * @returns {string} concatenated class names
 */
export function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default classNames;
