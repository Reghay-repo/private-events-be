import { PartialType } from '@nestjs/swagger';
import { AdminCreateEventDto } from './admin-create-event.dto';

export class AdminUpdateEventDto extends PartialType(AdminCreateEventDto) {}
