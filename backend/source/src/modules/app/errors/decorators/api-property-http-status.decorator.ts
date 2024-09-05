import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { ExceptionCode, exceptionDataSet } from "../errors";

export function ApiPropertyHttpStatus(exceptionCode: ExceptionCode) {
  return applyDecorators(
    ApiProperty({
      description: "HTTP status of an exception.",
      default: <HttpStatus>exceptionDataSet[exceptionCode].httpStatus,
      format: "int32",
      type: "integer",
    }),
  );
}
