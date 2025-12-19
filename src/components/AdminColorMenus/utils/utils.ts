export function insertSampleBeforeExtension(inputString: string) {
  // Regular expression to find .jpg, .png, or .svg
  const regex = /\.(jpg|png|svg)/i;

  // Replace the first occurrence of .jpg, .png, or .svg with _sample.jpg, _sample.png, or _sample.svg
  const modifiedString = inputString.replace(regex, "_sample.$1");

  return modifiedString;
}

export function capitalizeFirstLetterInAllWords(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}