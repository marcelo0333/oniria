"use server";

import { prisma } from '@/test-prisma';
import { getId } from '@/lib/session';

interface SaveDreamActionProps {
    dreamForm: {
        description: string;
        type: string;
        emotion: string;
        scenerie: string;
        intensity: number;
    },
    dreamResult: {
        title: string;
        interpretation: string;
        keySymbolism: string;
        luckNumbers: string;
        warnings: string,
        imagesPrompts: {
            finalSceneImageUrl: undefined;
            finalEmotionImageUrl: undefined;
        };
    }
}

export async function saveDreamAction(dreamForm: SaveDreamActionProps['dreamForm'], dreamResult: SaveDreamActionProps['dreamResult']) {
    const id = await getId();
    if (!id) {
        console.error('User not authenticated. Cannot save dream.');
        return;
    }
    try {
        const response = await prisma.dream.create({
            data: {
                description: dreamForm.description,
                type: dreamForm.type,
                emotion: dreamForm.emotion,
                scenerie: dreamForm.scenerie,
                intensity: dreamForm.intensity,
                title: dreamResult.title,
                interpretation: dreamResult.interpretation,
                keySymbolism: dreamResult.keySymbolism,
                luckNumbers: dreamResult.luckNumbers,
                userId: id,
                warnings: dreamResult.warnings,
                finalSceneImageUrl: dreamResult.imagesPrompts.finalSceneImageUrl,
                finalEmotionImageUrl: dreamResult.imagesPrompts.finalEmotionImageUrl,
            }
        });
        console.log('Dream saved successfully:', response);
        return response;
    } catch (error) {
        console.error('Error saving dream:', error);
    }
}
