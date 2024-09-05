export function getRandomEnum<T>(anEnum: T): T[keyof T] {
  const enumValues = Object.values(anEnum as never) as unknown as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
}
