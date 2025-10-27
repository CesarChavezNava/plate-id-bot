export class RequestUtils {
  static getParameters(
    fullText: string,
    size: number,
    separator: string = '|',
  ): string[] {
    const parts = fullText.split(' ');
    const request = parts.slice(1).join(' ').trim();

    const rawParameters = request.split(separator);
    const parameters = rawParameters.map((param) => param.trim());

    if (parameters.length !== size) {
      throw new Error('Too many parameters');
    }

    return parameters;
  }
}
