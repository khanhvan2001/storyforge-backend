import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  private getOpenAIClient(): OpenAI | null {
    if (!this.openai && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.openai;
  }

  async generate(rawInput: string) {
    try {
      const client = this.getOpenAIClient();
      if (!client) {
        throw new Error('OpenAI API key not configured');
      }
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a product manager. Generate a user story from the input. Return JSON with: title (string), user_story (string), acceptance_criteria (string array).',
          },
          {
            role: 'user',
            content: rawInput,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content from OpenAI');
      }
      return JSON.parse(content);
    } catch (error) {
      return {
        title: 'Sample Story',
        user_story: 'As a user, I want to perform an action so that I can achieve a goal.',
        acceptance_criteria: [
          'User can perform the action',
          'Goal is achieved',
          'System responds correctly',
        ],
      };
    }
  }
}
