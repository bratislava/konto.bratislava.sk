import { Module } from '@nestjs/common'

import { AdminModule } from '../admin/admin.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { TasksService } from './tasks.service'

@Module({
  imports: [AdminModule],
  providers: [TasksService, ThrowerErrorGuard],
  exports: [TasksService],
})
export class TasksModule {}
