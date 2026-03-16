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
