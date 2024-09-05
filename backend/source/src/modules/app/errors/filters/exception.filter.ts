import { ArgumentsHost, Catch, Logger } from "@nestjs/common";
import { Response } from "express";
import { InternalException } from "../errors";
import { RESPONSE_ERROR_SYMBOL } from "../../middlewares/req-res-log.middleware";

@Catch(InternalException)
export class ExceptionFilter implements ExceptionFilter {
  private logger = new Logger(ExceptionFilter.name);

  catch(exception: InternalException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.httpStatus;

    const finalResponse: InternalException = {
      exceptionCode: exception.exceptionCode,
      httpStatus: exception.httpStatus,
      message: exception.message,
      timeStamp: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    response[RESPONSE_ERROR_SYMBOL] = finalResponse;
    response.status(status).json(finalResponse);
  }
}
