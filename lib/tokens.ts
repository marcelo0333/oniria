import "server-only";
import { createHash, randomBytes } from "crypto";
import type { AuthTokenType } from "@prisma/client";
import { prisma } from "./prisma";

const TTL_MS: Record<AuthTokenType, number> = {
  VERIFY_EMAIL: 48 * 60 * 60 * 1000,
  RESET_PASSWORD: 60 * 60 * 1000,
};

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Cria um token de uso único. Retorna o valor em claro (só vai por e-mail); no banco fica o hash. */
export async function issueToken(userId: string, type: AuthTokenType) {
  await prisma.authToken.deleteMany({ where: { userId, type, usedAt: null } });
  const token = randomBytes(32).toString("base64url");
  await prisma.authToken.create({
    data: { userId, type, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + TTL_MS[type]) },
  });
  return token;
}

/** Consome o token (uso único). Retorna o userId ou null se inválido/expirado/usado. */
export async function consumeToken(token: string, type: AuthTokenType) {
  const hash = hashToken(token);
  const { count } = await prisma.authToken.updateMany({
    where: { tokenHash: hash, type, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  if (count === 0) return null;
  const row = await prisma.authToken.findUnique({ where: { tokenHash: hash } });
  return row?.userId ?? null;
}
