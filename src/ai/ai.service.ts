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

  async generateUserStory(
    idea: string,
    userRequirements: string,
    attachedContent: string,
    referenceContent: string,
  ) {
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

  private async generateUserStoryWithPrompt(
    systemPrompt: string,
    userPrompt: string,
    retryCount = 0,
  ): Promise<any> {
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
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const parsed = JSON.parse(cleanedContent);

      return {
        userStory: parsed.userStory || '',
        acceptanceCriteria:
          parsed.acceptanceCriteria || parsed.acceptance_criteria || [],
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
        userStory:
          'As a user, I want to perform an action so that I can achieve a goal.',
        acceptanceCriteria: [
          'Given a scenario, When an action is performed, Then the expected outcome occurs',
        ],
        notes: 'Generated with fallback due to AI error',
      };
    }
  }

  async generateClarifyingQuestions(
    idea: string,
    userRequirements: string,
    attachedContent: string,
    referenceContent: string,
  ) {
    const systemPrompt = `You are a Senior Product Owner. Your goal is to clarify vague requirements before writing a User Story.
    
Strict requirements:
- Analyze the user's idea and requirements, taking into account ANY Attached Content or Reference Content provided.
- Detect the language of the input (Vietnamese, English, etc.) and ASK QUESTIONS IN THAT SAME LANGUAGE.
- Generate 3-5 clarifying questions.
- Question type MUST be 'single_choice' or 'multiple_choice' (NO open_ended).
- For EVERY question, provide exactly 4 options:
  1. 3 creative, context-aware AI suggestions.
  2. The 4th option MUST be "Other (Type your answer)" (Always in English, DO NOT translate this specific option).
- Output MUST be valid JSON ONLY array.

JSON Schema:
[
  {
    "id": "q1",
    "question_text": "...",
    "type": "single_choice" | "multiple_choice",
    "options": ["Option A", "Option B", "Option C", "Other (Type your answer)"]
  }
]`;

    const userPrompt = `Idea: ${idea}

User Requirements: ${userRequirements}

Attached Content: ${attachedContent || 'None'}

Reference Content: ${referenceContent || 'None'}

Generate clarifying questions now. Return only JSON array.`;

    try {
      const client = this.getGeminiClient();
      if (!client) throw new Error('Gemini API key not configured');

      const model = client.getGenerativeModel({
        model: this.GEMINI_MODEL,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const content = response.text();

      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error('AI question generation error:', error);
      return [];
    }
  }

  async editUserStory(currentStory: any, instruction: string) {
    const systemPrompt = `You are a Senior Product Owner. Your goal is to modify an existing User Story based on the user's INSTRUCTION.

STRICT RULES:
- You will receive a JSON object representing the current User Story.
- You will receive an INSTRUCTION (e.g., "Translate to Vietnamese", "Make it shorter", "Add criteria about security").
- You MUST return a valid JSON object with the same structure: { "userStory": "...", "acceptanceCriteria": [...], "notes": "..." }.
- Do NOT output any markdown, only the raw JSON.
- Maintain the professional tone of a User Story.`;

    const userPrompt = `Current Story JSON:
${JSON.stringify(currentStory, null, 2)}

Instruction: ${instruction}

Output the modified JSON now.`;

    try {
      const gemini = this.getGeminiClient();
      if (!gemini)
        throw new Error('Gemini client not initialized (check API key)');
      const model = gemini.getGenerativeModel({ model: this.GEMINI_MODEL });

      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: userPrompt }] },
        ],
      });

      const responseText = result.response.text();
      // Clean up markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(cleanedText.substring(jsonStart, jsonEnd + 1));
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('AI Editing Error:', error);
      // Fallback: Return original story with a note in "notes"
      return {
        ...currentStory,
        notes:
          (currentStory.notes || '') +
          '\n[AI Error: Failed to edit story. Please try again.]',
      };
    }
  }
}
