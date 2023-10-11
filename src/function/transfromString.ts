export function transformString(inputString: string): string {
  // Sử dụng biểu thức chính quy để loại bỏ ký tự đặt biệt và dấu cách
  const cleanString = inputString.replace(/[^a-zA-Z0-9]+/g, '_');

  let outputString = '';
  for (let i = 0; i < cleanString.length; i++) {
    const char = cleanString[i];
    if (char === char.toUpperCase()) {
      outputString += char;
    } else {
      outputString += char.toUpperCase();
    }
  }

  return outputString;
}
