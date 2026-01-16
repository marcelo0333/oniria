import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/dreams - Lista todos os dreams
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const id = (await context.params).id;
        const dreams = await prisma.dream.findUnique({
            where: {
                id: id
            }
        });
        if (!dreams) {
            return NextResponse.json({ error: "Dream not found" }, { status: 404 });
        }
        return NextResponse.json(dreams);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

// DELETE /api/dreams/:id - Deleta um dream pelo ID
export async function DELETE(
    req: Request, 
    context: { params: Promise<{ id: string }> }) {
    try {
        const id = (await context.params).id;
        await prisma.dream.delete({
            where:{
                id: id
            }
        })

        return NextResponse.json({ message: "Dream deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function PATCH(req: Request, 
    context: { params: Promise<{ id: string }> }) {
    try {
        const id = (await context.params).id;
        const body = await req.json();
        const updatedDream = await prisma.dream.update({
            where: {
                id: id
            },
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
        return NextResponse.json(updatedDream);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}