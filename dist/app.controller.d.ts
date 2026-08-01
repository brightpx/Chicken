import { AppService } from './app.service';
import { GroqService } from './groq/groq.service';
export declare class AppController {
    private readonly appService;
    private readonly groqService;
    constructor(appService: AppService, groqService: GroqService);
    getHello(): string;
    getGroqResponse(prompt: string): Promise<{
        response: string;
    }>;
}
