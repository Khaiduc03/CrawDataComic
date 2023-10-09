export function transformString(inputString: string): string {
  let outputString = '';

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    if (char === ' ') {
      outputString += '_';
    } else {
      if (char === char.toUpperCase()) {
        outputString += char;
      } else {
        outputString += char.toUpperCase();
      }
    }
  }

  return outputString;
}
