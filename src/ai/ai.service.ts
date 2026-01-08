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

  async generateUserStory(idea: string, userRequirements: string, attachedContent: string, referenceContent: string) {
    const systemPrompt = `You are a Senior Product Owner specialized in Agile User Stories.

Strict requirements:
- User Story format: As a [persona], I want [feature] so that [benefit].
- Follow INVEST principle.
- Acceptance Criteria must use Gherkin (Given-When-Then).
- At least 3–5 acceptance criteria.
- Output MUST be valid JSON ONLY.

JSON schema:
{
  "userStory": "...",
  "acceptanceCriteria": ["..."],
  "notes": "..."
}`;

    const userPrompt = `Idea: ${idea}

User Requirements: ${userRequirements}

Attached Content: ${attachedContent || 'Không có'}

Reference Content: ${referenceContent || 'Không có'}

Generate a high-quality User Story following the requirements above. Return only valid JSON, no other text.`;

    // Estimate token count (rough: 1 token ≈ 4 characters)
    const totalLength = systemPrompt.length + userPrompt.length;
    if (totalLength > 128000) {
      // Truncate if too long
      const maxUserPromptLength = 128000 - systemPrompt.length;
      const truncated = userPrompt.substring(0, maxUserPromptLength);
      return this.generateUserStoryWithPrompt(systemPrompt, truncated);
    }

    return this.generateUserStoryWithPrompt(systemPrompt, userPrompt);
  }

  private async generateUserStoryWithPrompt(systemPrompt: string, userPrompt: string, retryCount = 0): Promise<any> {
    try {
      const client = this.getGeminiClient();
      if (!client) {
        throw new Error('Gemini API key not configured');
      }

      const model = client.getGenerativeModel({
        model: this.GEMINI_MODEL,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No content from Gemini');
      }

      // Clean up the response (remove markdown code blocks if present)
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedContent);
      
      return {
        userStory: parsed.userStory || '',
        acceptanceCriteria: parsed.acceptanceCriteria || parsed.acceptance_criteria || [],
        notes: parsed.notes || '',
      };
    } catch (error) {
      console.error('AI generation error:', error);
      
      // Retry once if first attempt fails
      if (retryCount === 0) {
        return this.generateUserStoryWithPrompt(systemPrompt, userPrompt, 1);
      }
      
      // Return fallback on retry failure
      return {
        userStory: 'As a user, I want to perform an action so that I can achieve a goal.',
        acceptanceCriteria: [
          'Given a scenario, When an action is performed, Then the expected outcome occurs',
        ],
        notes: 'Generated with fallback due to AI error',
      };
    }
  }
}
