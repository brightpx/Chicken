import { Response } from 'express';
import { AppService } from './app.service';
import { GroqService } from './groq/groq.service';
export declare class AppController {
    private readonly appService;
    private readonly groqService;
    constructor(appService: AppService, groqService: GroqService);
    getIndexPage(res: Response): void;
    getAdminPage(res: Response): void;
    getGroqResponse(prompt: string): Promise<{
        response: string;
    }>;
}
