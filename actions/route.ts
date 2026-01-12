"use server";

import { buildPollinationsImage } from '@/utils/build-image';
import { NextResponse } from 'next/server';


export async function GET(req: Request) {

    const { prompt } = await req.json();
    
    const imageUrl = buildPollinationsImage(prompt);
    
    const response = await fetch(imageUrl.toString(), {
        headers: {
            Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY || ''}`,
            }
        });
    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'image/png',
        },
    });
}
