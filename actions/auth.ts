"use server";

import { SignupFormSchema, FormState } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import bcrypt from "bcrypt"; // ← Adicione essa linha!
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signup(state: FormState, formData: FormData) {
    // Validação
    const validateFields = SignupFormSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
    });

    if (!validateFields.success) {
        return { errors: validateFields.error?.flatten().fieldErrors };
    }

    const { name, email, password } = validateFields.data;

    try {
        // Verifica se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { message: 'Email already exists.' };
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cria o usuário direto no banco
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                // NÃO retorne a senha!
            }
        });
        await createSession(user.id, user.email, user.name);

    } catch (error) {
        console.error('Signup error:', error);
        return {
            message: 'An error occurred during sign up.'
        };
    }
    redirect('/');
}

export async function signin(state: FormState, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return { message: 'Invalid email or password.' };
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { message: 'Invalid email or password.' };
        }
        await createSession(user.id, user.email, user.name);

    } catch (error) {
        console.error('Signin error:', error);
        return {
            message: 'An error occurred during sign in.'
        };
    }
    redirect('/');
}

export async function logout() {
    await deleteSession();
    redirect('/');
}