import { AiService } from './ai.service';
import * as fs from 'fs';
import * as path from 'path';

// Simple manual .env loading for the test script
try {
  const envPath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const [key, ...value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.join('=').trim();
      }
    });
    console.log('.env file loaded');
    // Sanitize key if needed
    if (process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY.replace(
        /['"]+/g,
        '',
      );
    }
  }
} catch (e) {
  console.log('No .env file found or failed to load');
}

async function testRefinement() {
  const aiService = new AiService();

  // Test Case 1: Vietnamese Input (Targeting Multiple Choice)
  const ideaVN = 'Tôi muốn làm ứng dụng đặt Pizza.';
  const reqVN =
    'Khách hàng có thể chọn nhiều loại đế bánh và nhiều loại topping khác nhau.';

  console.log('\n--- Test 1: Vietnamese Input ---');
  console.log(`Idea: ${ideaVN}`);

  try {
    const startTime = Date.now();
    const result = await aiService.generateClarifyingQuestions(
      ideaVN,
      reqVN,
      '',
      '',
    );
    const duration = (Date.now() - startTime) / 1000;

    console.log(`\n--- Response (took ${duration}s) ---`);
    console.log(JSON.stringify(result, null, 2));

    if (Array.isArray(result) && result.length > 0) {
      console.log('✅ Response is a non-empty array.');

      const validTypes = ['single_choice', 'multiple_choice'];
      const allValid = result.every((q) => {
        const hasValidType = validTypes.includes(q.type);
        const hasOptions = Array.isArray(q.options) && q.options.length > 0;
        const hasOther = q.options.some(
          (opt: string) =>
            opt.toLowerCase().includes('other') ||
            opt.toLowerCase().includes('khác'),
        );

        if (!hasValidType) console.warn(`⚠️ Invalid type: ${q.type}`);
        if (!hasOptions) console.warn(`⚠️ Missing options for ${q.id}`);
        if (!hasOther) console.warn(`⚠️ Missing 'Other' option for ${q.id}`);

        return hasValidType && hasOptions && hasOther;
      });

      if (allValid) {
        console.log('✅ All questions valid (type & options check passed).');
      } else {
        console.log('❌ Some questions failed validation.');
      }
    } else {
      console.log('❌ Refinement loop (VN) failed (empty or invalid).');
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }

  // Test Case 2: English Input
  const ideaEN = 'Build a dashboard for analyzing stock market trends.';
  const reqEN = 'Real-time charts, user watchlist, and news feed integration.';

  console.log('\n--- Test 2: English Input ---');
  console.log(`Idea: ${ideaEN}`);

  try {
    const startTime = Date.now();
    const result = await aiService.generateClarifyingQuestions(
      ideaEN,
      reqEN,
      '',
      '',
    );
    const duration = (Date.now() - startTime) / 1000;

    console.log(`\n--- Response (took ${duration}s) ---`);
    console.log(JSON.stringify(result, null, 2));

    if (Array.isArray(result) && result.length > 0) {
      console.log('✅ Refinement loop (EN) working successfully!');
    } else {
      console.log('❌ Refinement loop (EN) failed (empty or invalid).');
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testRefinement();
