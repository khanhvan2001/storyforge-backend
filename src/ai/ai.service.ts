import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private gemini: GoogleGenerativeAI | null = null;
  private readonly GEMINI_MODEL = 'gemini-2.5-flash';

  private getGeminiClient(): GoogleGenerativeAI | null {
    if (!this.gemini && process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return this.gemini;
  }

  async generate(rawInput: string) {
    try {
      const client = this.getGeminiClient();
      if (!client) {
        throw new Error('Gemini API key not configured');
      }

      const model = client.getGenerativeModel({
        model: this.GEMINI_MODEL,
      });

      const prompt = `You are an Agile Product Owner. Generate a user story from the input. Respond in the same language as the input.

Return JSON with: title (string), user_story (string), acceptance_criteria (string array).

Input: ${rawInput}

Important: Use the same language as the input text. Return only valid JSON, no other text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No content from Gemini');
      }

      // Clean up the response (remove markdown code blocks if present)
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error('AI generation error:', error);
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
