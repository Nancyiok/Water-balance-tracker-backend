import {
  Injectable, // Makes this class injectable
  type OnModuleInit, // Hook: runs when module starts
  type OnModuleDestroy, // Hook: runs when module stops
} from '@nestjs/common';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable() // Now we can inject this into other classes
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({ adapter });
  }

  // When module starts, connect to database
  async onModuleInit() {
    await this.$connect(); // Open database connection
    console.log('Database connected');
  }

  // When module stops, disconnect from database
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Database disconnected');
  }
}
