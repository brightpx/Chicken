import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);

  async generateChatCompletion(prompt: string): Promise<string> {
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
    } catch (error) {
      this.logger.error('Failed to call Groq API', error);
      throw error;
    }
  }
}
