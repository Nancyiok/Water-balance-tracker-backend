// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpStatus,
// } from '@nestjs/common';
// import { Prisma } from '@prisma/client';
// import { PRISMA_ERRORS_MAP } from '../constants/prisma-errors.constant';


// @Catch(PrismaClientKnownRequestError)
// export class PrismaErrorFilter implements ExceptionFilter {
//   catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();

//     const { code } = exception;
//     const { status, message } = PRISMA_ERRORS_MAP[code] ?? {
//       status: HttpStatus.INTERNAL_SERVER_ERROR,
//       message: 'Internal server error',
//     };

//     response.status(status).json({ statusCode: status, message });
//   }
// }
