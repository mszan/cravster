export function parseBooleanQueryString(string: string): boolean | string {
  return string == "true" ? true : string == "false" ? false : string;
}
