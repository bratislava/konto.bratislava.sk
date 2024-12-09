import { Module } from '@nestjs/common'

import { AdminModule } from '../admin/admin.module'
import { TasksService } from './tasks.service'

@Module({
  imports: [AdminModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
