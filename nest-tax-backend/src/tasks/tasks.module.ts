import { Module } from '@nestjs/common'

import { AdminModule } from '../admin/admin.module'
import { TasksService } from './tasks.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'

@Module({
  imports: [AdminModule],
  providers: [TasksService, ThrowerErrorGuard],
  exports: [TasksService],
})
export class TasksModule {}
