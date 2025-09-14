import { ApiProperty } from '@nestjs/swagger';

export class PublicEventDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty({ required: false, nullable: true }) description?: string | null;
  @ApiProperty() city: string;
  @ApiProperty({ type: String, format: 'date-time' }) eventDateTime: Date;
}

export const mapPublic = (e: any): PublicEventDto => ({
  id: e.id,
  title: e.title,
  description: e.description,
  city: e.city,
  eventDateTime: e.eventDateTime,
});
