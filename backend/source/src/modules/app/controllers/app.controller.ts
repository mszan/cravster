import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("app")
@Controller("")
export class AppController {
  @ApiOperation({
    summary: "Check application health",
    description: "Check whether application has started successfully and is ready to process incomming requests.",
  })
  @Get("healthcheck")
  getHealthcheck() {
    return {
      status: "UP",
    };
  }
}
