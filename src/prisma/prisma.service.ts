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
    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  // When module starts, connect to database
  async onModuleInit() {
    // @ts-ignore
    this.$on('error', (e: any) => console.error('🔴 Prisma error event:', e));
    // @ts-ignore
    this.$on('warn', (e: any) => console.warn('🟡 Prisma warn event:', e));
    // @ts-ignore
    this.$on('query', (e: any) => console.log('📝 Query:', e.query, e.params));

    try {
      await this.$connect();
      console.log('Database connected');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  // When module stops, disconnect from database
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Database disconnected');
  }
}
