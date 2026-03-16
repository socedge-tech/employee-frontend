/**
 * Converts a string to Title Case (First Letter of Each Word Uppercase)
 */
export const toTitleCase = (str: string | null | undefined): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Capitalizes only the first letter of the entire string
 */
export const capitalizeFirstLetter = (value: string): string => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};
