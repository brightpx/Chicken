import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { GroqService } from './groq/groq.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly groqService: GroqService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ai/groq')
  async getGroqResponse(@Query('prompt') prompt: string) {
    return {
      response: await this.groqService.generateChatCompletion(
        prompt || 'Say hello to the chicken shop system.',
      ),
    };
  }
}
