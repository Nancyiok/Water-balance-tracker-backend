import { HttpStatus } from "@nestjs/common";

export const PRISMA_ERRORS_MAP: Record<
  string,
  { status: number; message: string } | undefined
> = {
  P2000: { status: HttpStatus.BAD_REQUEST, message: 'Invalid data provided' }, 
  P2002: { status: HttpStatus.CONFLICT, message: 'Resource already exists' }, 
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Resource not found' }, 
};
