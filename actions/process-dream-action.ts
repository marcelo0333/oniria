"use server";

import { DreamInfos } from "@/actions/interfaces/DreamInfos";
import { BuildDreamPrompt } from "@/utils/build-dream-prompt";
import { buildPollinationsImage } from "@/utils/build-image";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);
const model = genAi.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function ProcessDreamAction(infos: DreamInfos){
    const {userPrompt, systemPrompt, negativeSuffix} = BuildDreamPrompt(infos);

    try {
        const result = await model.generateContent([systemPrompt, userPrompt]);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').replace(/```/g, "").trim();
        const dreamPrompt = JSON.parse(text);

        const finalScenePrompt = encodeURIComponent(dreamPrompt.imagePromptLiteral + ",  highly detailed photograph, cinematic lighting, 8k resolution, realistic " + negativeSuffix)
        const finalEmotionPrompt = encodeURIComponent(dreamPrompt.imagePromptAbstract + ", abstract art, surrealism, highly textured, emotional, vivid colors" + negativeSuffix)

        const finalSceneImageUrl = buildPollinationsImage(finalScenePrompt);
        const finalEmotionImageUrl = buildPollinationsImage(finalEmotionPrompt);

      return {
        interpretation: dreamPrompt.interpretation as string,
        keySymbolism: dreamPrompt.keySymbolism as string,
        imagesPrompts: {finalSceneImageUrl, finalEmotionImageUrl}
      };
    }catch (error) {
        console.error("Error interpreting dream:", error);
        throw new Error("Failed to interpret dream.");
    }
}