import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { AppService } from './app.service';
import { GroqService } from './groq/groq.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly groqService: GroqService,
  ) {}

  @Get()
  getIndexPage(@Res() res: Response) {
    const candidates = [
      path.join(process.cwd(), 'public', 'index.html'),
      path.join(process.cwd(), 'dist', 'public', 'index.html'),
      path.join(__dirname, '..', 'public', 'index.html'),
    ];

    const filePath = candidates.find((candidate) => fs.existsSync(candidate));
    if (filePath) {
      res.sendFile(filePath);
      return;
    }

    res.status(404).send('Index page not found');
  }

  @Get('admin-page')
  getAdminPage(@Res() res: Response) {
    const candidates = [
      path.join(process.cwd(), 'src', 'admin', 'admin.html'),
      path.join(process.cwd(), 'dist', 'admin', 'admin.html'),
      path.join(__dirname, 'admin', 'admin.html'),
    ];

    const filePath = candidates.find((candidate) => fs.existsSync(candidate));
    if (filePath) {
      res.sendFile(filePath);
      return;
    }

    res.status(404).send('Admin page not found');
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
