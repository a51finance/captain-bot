import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';

@Module({
  imports: [],
  controllers: [BotController],
  providers: [],
})
export class BotModule {}
