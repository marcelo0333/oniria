import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/dreams - Lista todos os dreams
export async function GET(req: Request) {
    try {
        const dreams = await prisma.dream.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(dreams);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

// POST /api/dreams - Cria um novo dream
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const dream = await prisma.dream.create({
            data: {
                title: body.title,
                description: body.description,
                type: body.type,
                emotion: body.emotion,
                scenerie: body.scenerie,
                intensity: body.intensity,
                interpretation: body.interpretation,
                keySymbolism: body.keySymbolism,
            },
        });
        return NextResponse.json(dream, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}