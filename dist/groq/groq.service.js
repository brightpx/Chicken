"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GroqService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqService = void 0;
const common_1 = require("@nestjs/common");
let GroqService = GroqService_1 = class GroqService {
    logger = new common_1.Logger(GroqService_1.name);
    async generateChatCompletion(prompt) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is not configured.');
        }
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'openai/gpt-oss-120b',
                    messages: [
                        {
                            role: 'system',
                            content: 'คุณคือผู้ช่วยที่มีประโยชน์สำหรับระบบหลังบ้าน (Backend) ของร้านขายไก่',
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                    max_completion_tokens: 4096,
                    top_p: 0.9,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Groq request failed: ${response.status} ${errorText}`);
                throw new Error(`Groq request failed with status ${response.status}`);
            }
            const data = await response.json();
            return data.choices?.[0]?.message?.content ?? 'No response from Groq.';
        }
        catch (error) {
            this.logger.error('Failed to call Groq API', error);
            throw error;
        }
    }
};
exports.GroqService = GroqService;
exports.GroqService = GroqService = GroqService_1 = __decorate([
    (0, common_1.Injectable)()
], GroqService);
//# sourceMappingURL=groq.service.js.map