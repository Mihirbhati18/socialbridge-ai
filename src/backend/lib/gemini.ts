import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
export const genAI = new GoogleGenerativeAI(apiKey);

export const getFlashModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};

export const getProModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.0-pro" });
};

export const generateText = async (prompt: string): Promise<string | null> => {
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.error("Groq text generation failed, falling back to Gemini:", e);
    }
  }

  try {
    const model = getFlashModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    return null;
  }
};

export const generateJSON = async (prompt: string): Promise<any | null> => {
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: `${prompt}\n\nReturn ONLY a valid JSON object or array.` }],
          response_format: { type: "json_object" },
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      if (res.ok) {
        const data = await res.json();
        return JSON.parse(data.choices[0].message.content);
      }
    } catch (e) {
      console.error("Groq JSON generation failed, falling back to Gemini:", e);
    }
  }

  try {
    const model = getFlashModel();
    const result = await model.generateContent(`${prompt}\n\nReturn the response as valid JSON only, without any markdown formatting or code blocks.`);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error generating JSON with Gemini:", error);
    return null;
  }
};
