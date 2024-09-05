import { applyDecorators } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { ExceptionCode } from "../errors";

export function ApiPropertyExceptionCode(exceptionCode: ExceptionCode) {
  return applyDecorators(
    ApiProperty({
      description: "Internal exception code.",
      enum: ExceptionCode,
      enumName: "ExceptionCode",
      default: exceptionCode,
    }),
  );
}
