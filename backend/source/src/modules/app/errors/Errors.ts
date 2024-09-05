import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { ApiPropertyExceptionCode } from "./decorators/api-property-exception-code.decorator";
import { ApiPropertyHttpStatus } from "./decorators/api-property-http-status.decorator";
import { ApiPropertyMessage } from "./decorators/api-property-message.decorator";

// todo: fix swagger multiple responses for same http status code

export enum ExceptionCode {
  FORBIDDEN = "FORBIDDEN",
  INTERNAL = "INTERNAL",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  UNIQUE_CONSTRAINT_VIOLATION = "UNIQUE_CONSTRAINT_VIOLATION",
  ENTITY_BLOCKED = "ENTITY_BLOCKED",
  JWT_EXPIRED = "JWT_EXPIRED",
  JWT_MALFORMED = "JWT_MALFORMED",
  FILE_EXTENSION_INVALID = "FILE_EXTENSION_INVALID",
}

export type ExceptionData = {
  httpStatus: HttpStatus;
  exceptionCode: ExceptionCode;
  message: string;
};

export type ExceptionDataSet = {
  [x in ExceptionCode]: ExceptionData;
};

export const exceptionDataSet: ExceptionDataSet = {
  INTERNAL: {
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    exceptionCode: ExceptionCode.INTERNAL,
    message: "Internal server exception.",
  },
  FORBIDDEN: {
    httpStatus: HttpStatus.FORBIDDEN,
    exceptionCode: ExceptionCode.FORBIDDEN,
    message: "Forbidden.",
  },
  UNAUTHORIZED: {
    httpStatus: HttpStatus.FORBIDDEN,
    exceptionCode: ExceptionCode.UNAUTHORIZED,
    message: "Unathorized.",
  },
  JWT_EXPIRED: {
    httpStatus: HttpStatus.FORBIDDEN,
    exceptionCode: ExceptionCode.JWT_EXPIRED,
    message: "JWT expired.",
  },
  NOT_FOUND: {
    httpStatus: HttpStatus.NOT_FOUND,
    exceptionCode: ExceptionCode.NOT_FOUND,
    message: "Resource not found.",
  },
  UNIQUE_CONSTRAINT_VIOLATION: {
    httpStatus: HttpStatus.BAD_REQUEST,
    exceptionCode: ExceptionCode.UNIQUE_CONSTRAINT_VIOLATION,
    message: "Unique constaint violation.",
  },
  ENTITY_BLOCKED: {
    httpStatus: HttpStatus.BAD_REQUEST,
    exceptionCode: ExceptionCode.ENTITY_BLOCKED,
    message: "Entity is blocked by another entity. This is probably caused by foreign key violation.",
  },
  JWT_MALFORMED: {
    httpStatus: HttpStatus.BAD_REQUEST,
    exceptionCode: ExceptionCode.JWT_MALFORMED,
    message: "JWT malformed.",
  },
  FILE_EXTENSION_INVALID: {
    httpStatus: HttpStatus.BAD_REQUEST,
    exceptionCode: ExceptionCode.FILE_EXTENSION_INVALID,
    message: "File extension invalid.",
  },
};

export const httpStatus = exceptionDataSet.INTERNAL.httpStatus;
export const message = exceptionDataSet.INTERNAL.message;
export const exceptionCode = exceptionDataSet.INTERNAL.exceptionCode;
export const defaultPayload: ExceptionData = { message, exceptionCode, httpStatus };

export class InternalException {
  @ApiProperty({
    default: new Date().toISOString(),
    description: "Date in ISO 8601.",
  })
  readonly timeStamp: string;

  @ApiPropertyExceptionCode(ExceptionCode.INTERNAL)
  readonly exceptionCode: ExceptionCode;

  @ApiPropertyMessage(ExceptionCode.INTERNAL)
  readonly message: string;

  @ApiPropertyHttpStatus(ExceptionCode.INTERNAL)
  readonly httpStatus: HttpStatus;

  constructor(payload: ExceptionData = defaultPayload) {
    this.exceptionCode = payload.exceptionCode;
    this.message = payload.message;
    this.httpStatus = payload.httpStatus;
  }
}

export class ForbiddenException extends InternalException {
  @ApiPropertyExceptionCode(ExceptionCode.FORBIDDEN)
  readonly exceptionCode: ExceptionCode;

  @ApiPropertyMessage(ExceptionCode.FORBIDDEN)
  readonly message: string;

  @ApiPropertyHttpStatus(ExceptionCode.FORBIDDEN)
  readonly httpStatus: HttpStatus;

  constructor() {
    super({
      message: exceptionDataSet.FORBIDDEN.message,
      exceptionCode: exceptionDataSet.FORBIDDEN.exceptionCode,
      httpStatus: exceptionDataSet.FORBIDDEN.httpStatus,
    });
  }
}

export class UnauthorizedException extends InternalException {
  @ApiPropertyExceptionCode(ExceptionCode.UNAUTHORIZED)
  readonly exceptionCode: ExceptionCode;

  @ApiPropertyMessage(ExceptionCode.UNAUTHORIZED)
  readonly message: string;

  @ApiPropertyHttpStatus(ExceptionCode.UNAUTHORIZED)
  readonly httpStatus: HttpStatus;

  constructor() {
    super({
      message: exceptionDataSet.UNAUTHORIZED.message,
      exceptionCode: exceptionDataSet.UNAUTHORIZED.exceptionCode,
      httpStatus: exceptionDataSet.UNAUTHORIZED.httpStatus,
    });
  }
}

export class JwtExpiredException extends InternalException {
  @ApiPropertyExceptionCode(ExceptionCode.JWT_EXPIRED)
  readonly exceptionCode: ExceptionCode;

  @ApiPropertyMessage(ExceptionCode.JWT_EXPIRED)
  readonly message: string;

  @ApiPropertyHttpStatus(ExceptionCode.JWT_EXPIRED)
  readonly httpStatus: HttpStatus;

  constructor() {
    super({
      message: exceptionDataSet.JWT_EXPIRED.message,
      exceptionCode: exceptionDataSet.JWT_EXPIRED.exceptionCode,
      httpStatus: exceptionDataSet.JWT_EXPIRED.httpStatus,
    });
  }
}

export class JwtMalformedException extends InternalException {
  @ApiPropertyExceptionCode(ExceptionCode.JWT_MALFORMED)
  readonly exceptionCode: ExceptionCode;

  @ApiPropertyMessage(ExceptionCode.JWT_MALFORMED)
  readonly message: string;

  @ApiPropertyHttpStatus(ExceptionCode.JWT_MALFORMED)
  readonly httpStatus: HttpStatus;

  constructor() {
    super({
      message: exceptionDataSet.JWT_MALFORMED.message,
      exceptionCode: exceptionDataSet.JWT_MALFORMED.exceptionCode,
      httpStatus: exceptionDataSet.JWT_MALFORMED.httpStatus,
    });
  }
}

export class UniqueConstraintViolationException extends InternalException {
  @ApiPropertyExceptionCode(ExceptionCode.UNIQUE_CONSTRAINT_VIOLATION)
  readonly exceptionCode: ExceptionCode;

  @ApiPropertyMessage(ExceptionCode.UNIQUE_CONSTRAINT_VIOLATION)
  readonly message: string;

  @ApiPropertyHttpStatus(ExceptionCode.UNIQUE_CONSTRAINT_VIOLATION)
  readonly httpStatus: HttpStatus;

  constructor() {
    super({
      message: exceptionDataSet.UNIQUE_CONSTRAINT_VIOLATION.message,
      exceptionCode: exceptionDataSet.UNIQUE_CONSTRAINT_VIOLATION.exceptionCode,
      httpStatus: exceptionDataSet.UNIQUE_CONSTRAINT_VIOLATION.httpStatus,
    });
  }
}

export class EntityBlockedException extends InternalException {
  @ApiPropertyExceptionCode(ExceptionCode.ENTITY_BLOCKED)
  readonly exceptionCode: ExceptionCode;

  @ApiPropertyMessage(ExceptionCode.ENTITY_BLOCKED)
  readonly message: string;

  @ApiPropertyHttpStatus(ExceptionCode.ENTITY_BLOCKED)
  readonly httpStatus: HttpStatus;

  constructor() {
    super({
      message: exceptionDataSet.ENTITY_BLOCKED.message,
      exceptionCode: exceptionDataSet.ENTITY_BLOCKED.exceptionCode,
      httpStatus: exceptionDataSet.ENTITY_BLOCKED.httpStatus,
    });
  }
}

export class NotFoundException extends InternalException {
  @ApiPropertyExceptionCode(ExceptionCode.NOT_FOUND)
  readonly exceptionCode: ExceptionCode;

  @ApiPropertyMessage(ExceptionCode.NOT_FOUND)
  readonly message: string;

  @ApiPropertyHttpStatus(ExceptionCode.NOT_FOUND)
  readonly httpStatus: HttpStatus;

  constructor() {
    super({
      message: exceptionDataSet.NOT_FOUND.message,
      exceptionCode: exceptionDataSet.NOT_FOUND.exceptionCode,
      httpStatus: exceptionDataSet.NOT_FOUND.httpStatus,
    });
  }
}

export class FileExtensionInvalidException extends InternalException {
  @ApiPropertyExceptionCode(ExceptionCode.FILE_EXTENSION_INVALID)
  readonly exceptionCode: ExceptionCode;

  @ApiPropertyMessage(ExceptionCode.FILE_EXTENSION_INVALID)
  readonly message: string;

  @ApiPropertyHttpStatus(ExceptionCode.FILE_EXTENSION_INVALID)
  readonly httpStatus: HttpStatus;

  constructor() {
    super({
      message: exceptionDataSet.FILE_EXTENSION_INVALID.message,
      exceptionCode: exceptionDataSet.FILE_EXTENSION_INVALID.exceptionCode,
      httpStatus: exceptionDataSet.FILE_EXTENSION_INVALID.httpStatus,
    });
  }
}

export const allExceptions = [
  InternalException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  UniqueConstraintViolationException,
  EntityBlockedException,
  JwtExpiredException,
  JwtMalformedException,
  FileExtensionInvalidException,
];
