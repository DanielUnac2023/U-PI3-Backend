import { PartialType } from '@nestjs/mapped-types';
import { CreateImplementoDto } from './create-implemento.dto.js';

export class UpdateImplementoDto extends PartialType(CreateImplementoDto) {}
