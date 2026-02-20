import 'dotenv/config'

import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { Prisma, PrismaClient } from '../../prisma/generated/prisma/client'

import { escapeForLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger: LineLoggerSubservice

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    super({
      adapter,
      log: [
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: 'colorless',
    })
    this.logger = new LineLoggerSubservice(PrismaService.name)
      ; (this as PrismaClient<'info' | 'warn' | 'error'>).$on('info', (e) => {
        this.logger.log(
          `target="${escapeForLogfmt(e.target)}" message="${escapeForLogfmt(e.message)}"`,
        )
      })
      ; (this as PrismaClient<'info' | 'warn' | 'error'>).$on('warn', (e) => {
        this.logger.warn(
          `target="${escapeForLogfmt(e.target)}" message="${escapeForLogfmt(e.message)}"`,
        )
      })
  }

  async onModuleInit() {
    await this.$connect()
  }
}
