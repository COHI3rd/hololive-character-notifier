import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { Character, TimeOfDay } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY environment variable not set. Gemini API calls will fail.");
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return '春';
  if (month >= 6 && month <= 8) return '夏';
  if (month >= 9 && month <= 11) return '秋';
  return '冬'; // Dec, Jan, Feb
}


async function generateMessageInternal(
    character: Character,
    currentWeather: string | null,
    timeOfDay: TimeOfDay,
    specialDayName: string | null
): Promise<string> {
    if (!GEMINI_API_KEY) {
        console.error("Gemini API key is not configured on the server.");
        return character.fallbackMessage;
    }

    const season = getCurrentSeason();
    
    let prompt = `${character.personalityPrompt}\n現在の状況は以下の通りです：\n- 季節: ${season}\n- 時間帯: ${timeOfDay}\n`;

    if (currentWeather && currentWeather !== "不明") {
        prompt += `- 天気: ${currentWeather}\n`;
    } else {
        prompt += `(天気情報は不明です。天気の話題には触れないでください。)\n`;
    }

    if (specialDayName) {
        prompt += `- 特別な日: ${specialDayName}\nお祝いや特別な日の雰囲気をメッセージに含めてください。\n`;
    }
    
    prompt += `上記の状況を踏まえ、ユーザーが元気になるような、ポジティブなメッセージを40文字以内の日本語で生成してください。`;

    try {
        const genAI = new GoogleGenAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text().trim();
        
        if (text.length > 45) { 
            text = text.substring(0, 42) + '…';
        }
        if (!text) return character.fallbackMessage;
        return text;
    } catch (error) {
        console.error('Error generating message with Gemini API:', error);
        return character.fallbackMessage;
    }
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { character, currentWeather, timeOfDay, specialDayName } = req.body;

    if (!character || !timeOfDay) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const message = await generateMessageInternal(character, currentWeather, timeOfDay, specialDayName);
        res.status(200).json({ message });
    } catch (error) {
        console.error('Error in generateMessage handler:', error);
        res.status(500).json({ error: 'Failed to generate message' });
    }
} 