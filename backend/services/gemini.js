import { GoogleGenerativeAI } from '@google/generative-ai';
import { BANNED_TERMS } from '../config/constants.js';
import { ENHANCED_PROMPT_STYLE, PROMPT_ENGINEER_SYSTEM } from '../config/promptEngineer.js';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function parseJsonResponse(text) {
  const cleaned = String(text || '')
    .replace(/```json\n?|\n?```/g, '')
    .trim();
  return JSON.parse(cleaned);
}

function stripBannedTerms(text) {
  let result = text;
  const stripped = [];
  for (const term of BANNED_TERMS) {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (re.test(result)) {
      stripped.push(term);
      result = result.replace(re, 'a friendly original character');
    }
  }
  return { text: result, stripped };
}

function ruleBasedInputModeration(story) {
  const lower = story.toLowerCase();
  const blockedPatterns = [
    /\b(kill|murder|blood|gore|weapon|gun|knife|death|war|perang|berdarah|kekerasan)\b/i,
    /\b(sex|nude|naked|porn)\b/i,
    /\b(drug|cocaine|heroin)\b/i,
    /\b(horror|hantu|setan|ghost|demon)\b/i
  ];
  for (const pattern of blockedPatterns) {
    if (pattern.test(lower)) {
      return {
        decision: 'block',
        reasons: ['Maaf, kami tidak dapat memproses permintaan ini karena tidak ramah anak.'],
        stripped: []
      };
    }
  }
  const { text, stripped } = stripBannedTerms(story);
  return { decision: 'pass', reasons: [], sanitized: text, stripped };
}

function buildFallbackEnhancedPrompt(story, partIndex = 1, totalParts = 1) {
  const beat =
    partIndex === 1 ? 'beginning' : partIndex === totalParts ? 'happy ending' : 'middle';
  const { text } = stripBannedTerms(story);
  return (
    `${ENHANCED_PROMPT_STYLE}. ${text.slice(0, 400)} (${beat} of the story). ` +
    'Smooth looping motion, slow panning.'
  );
}

function ruleBasedScreenAndEnhance(userInput, structure = 'single') {
  const mod = ruleBasedInputModeration(userInput);
  if (mod.decision === 'block') {
    return {
      status: 'REJECTED',
      reason_if_rejected: mod.reasons[0],
      theme_category: null,
      enhanced_prompt: null,
      suggested_bg_color: null,
      prompts: [],
      styleString: ENHANCED_PROMPT_STYLE,
      parts: [],
      stripped: mod.stripped
    };
  }

  const partCount = structure === 'three_part' ? 3 : 1;
  const prompts = [];
  for (let i = 0; i < partCount; i++) {
    prompts.push(buildFallbackEnhancedPrompt(userInput, i + 1, partCount));
  }

  return {
    status: 'APPROVED',
    reason_if_rejected: null,
    theme_category: 'Custom',
    enhanced_prompt: prompts[0],
    suggested_bg_color: '#AEE2FF',
    prompts,
    styleString: ENHANCED_PROMPT_STYLE,
    parts: prompts.map((prompt, index) => ({
      index,
      prompt,
      theme_category: 'Custom',
      suggested_bg_color: '#AEE2FF'
    })),
    stripped: mod.stripped
  };
}

/**
 * Screen parent input + produce PixVerse-ready enhanced prompt(s).
 * Single entry point before video generation.
 */
async function screenAndEnhanceStory(userInput, structure = 'single') {
  const rule = ruleBasedInputModeration(userInput);
  if (rule.decision === 'block') {
    return {
      status: 'REJECTED',
      reason_if_rejected: rule.reasons[0],
      theme_category: null,
      enhanced_prompt: null,
      suggested_bg_color: null,
      prompts: [],
      styleString: ENHANCED_PROMPT_STYLE,
      parts: [],
      stripped: rule.stripped
    };
  }

  if (!genAI) {
    return ruleBasedScreenAndEnhance(userInput, structure);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const structureHint =
    structure === 'three_part'
      ? 'The story should become THREE connected video shots. Return enhanced_prompts as an array of exactly 3 English prompts (beginning, middle, ending). Also set enhanced_prompt to the first shot.'
      : 'Return a single enhanced_prompt for one video shot.';

  const userMessage = `${PROMPT_ENGINEER_SYSTEM}

---
STRUCTURE: ${structureHint}

User Input: ${JSON.stringify(userInput)}`;

  try {
    const result = await model.generateContent(userMessage);
    const json = parseJsonResponse(result.response.text());

    if (json.status === 'REJECTED') {
      return {
        status: 'REJECTED',
        reason_if_rejected:
          json.reason_if_rejected ||
          'Maaf, permintaan ini tidak dapat diproses. Coba cerita yang lebih ramah anak.',
        theme_category: json.theme_category || null,
        enhanced_prompt: null,
        suggested_bg_color: json.suggested_bg_color || null,
        prompts: [],
        styleString: ENHANCED_PROMPT_STYLE,
        parts: [],
        stripped: rule.stripped
      };
    }

    const prompts =
      Array.isArray(json.enhanced_prompts) && json.enhanced_prompts.length > 0
        ? json.enhanced_prompts.filter(Boolean)
        : json.enhanced_prompt
          ? [json.enhanced_prompt]
          : [];

    if (prompts.length === 0) {
      return ruleBasedScreenAndEnhance(userInput, structure);
    }

    return {
      status: 'APPROVED',
      reason_if_rejected: null,
      theme_category: json.theme_category || 'Custom',
      enhanced_prompt: prompts[0],
      suggested_bg_color: json.suggested_bg_color || '#AEE2FF',
      prompts,
      styleString: ENHANCED_PROMPT_STYLE,
      parts: prompts.map((prompt, index) => ({
        index,
        prompt,
        theme_category: json.theme_category || 'Custom',
        suggested_bg_color: json.suggested_bg_color || '#AEE2FF'
      })),
      stripped: rule.stripped
    };
  } catch (err) {
    console.error('Prompt engineer Gemini error:', err.message);
    return ruleBasedScreenAndEnhance(userInput, structure);
  }
}

/** @deprecated Use screenAndEnhanceStory — kept for compatibility */
async function geminiModerateInput(story) {
  const result = await screenAndEnhanceStory(story, 'single');
  if (result.status === 'REJECTED') {
    return {
      decision: 'block',
      reasons: [result.reason_if_rejected || 'Blocked by moderation'],
      stripped: result.stripped
    };
  }
  return {
    decision: result.stripped?.length ? 'warn' : 'pass',
    reasons: result.stripped?.length ? ['Brand names were adapted to original characters'] : [],
    sanitized: story,
    stripped: result.stripped
  };
}

/** @deprecated Use screenAndEnhanceStory */
async function geminiStoryToPrompt(story, structure = 'single') {
  const result = await screenAndEnhanceStory(story, structure);
  return {
    prompts: result.prompts,
    styleString: result.styleString,
    parts: result.parts,
    theme_category: result.theme_category,
    suggested_bg_color: result.suggested_bg_color
  };
}

async function geminiOutputModeration(_thumbnailPath) {
  if (!genAI) return { decision: 'pass', reasons: [] };
  return { decision: 'pass', reasons: ['Vision moderation skipped in dev mode'] };
}

export {
  screenAndEnhanceStory,
  geminiModerateInput,
  geminiStoryToPrompt,
  geminiOutputModeration,
  stripBannedTerms,
  ruleBasedInputModeration
};
