import { applyDecorators } from "@nestjs/common";
import { ApiInternalServerErrorResponse } from "@nestjs/swagger";
import { InternalException } from "../errors/errors";

export function ApplyApiInternalServiceExceptionResponse() {
  return applyDecorators(
    ApiInternalServerErrorResponse({
      type: InternalException,
    }),
  );
}
