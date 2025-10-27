export class StringUtils {
  static toPascalCaseWithSpaces(str: string): string {
    if (!str) {
      return '';
    }

    return str
      .split(' ')
      .map((word) => {
        if (!word) return '';
        const firstLetter = word.charAt(0).toUpperCase();
        const restOfWord = word.slice(1).toLowerCase();
        return `${firstLetter}${restOfWord}`;
      })
      .join(' ');
  }
}
