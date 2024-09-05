import { Transform } from "class-transformer";

export const TransformBoolean = () => {
  const toPlain = Transform(
    ({ value }) => {
      return value;
    },
    {
      toPlainOnly: true,
    },
  );
  const toClass = (target: unknown, key: string) => {
    return Transform(
      ({ obj }) => {
        return valueToBoolean(obj[key]);
      },
      {
        toClassOnly: true,
      },
    )(target as never, key);
  };
  return function (target: unknown, key: string) {
    toPlain(target as never, key);
    toClass(target, key);
  };
};

const valueToBoolean = (value: unknown) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    if (["true", "on", "yes", "1"].includes(value.toLowerCase())) {
      return true;
    }
    if (["false", "off", "no", "0"].includes(value.toLowerCase())) {
      return false;
    }
  }
  return undefined;
};
