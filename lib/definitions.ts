import * as z from "zod";

export const SignupFormSchema = z.object({
  name: z.string().trim().min(2, "O nome precisa ter ao menos 2 caracteres.").max(80),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email("Informe um e-mail válido.")),
  password: z
    .string()
    .min(8, "A senha precisa ter ao menos 8 caracteres.")
    .max(100)
    .regex(/[a-zA-Z]/, "Inclua ao menos uma letra.")
    .regex(/[0-9]/, "Inclua ao menos um número."),
  terms: z.literal("on", "Você precisa aceitar os Termos e a Política de Privacidade."),
});

export const SigninFormSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
  password: z.string().min(1, "Informe a senha.").max(100),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(20),
  password: SignupFormSchema.shape.password,
});

export type FormState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
      success?: boolean;
      /** valores (não sensíveis) devolvidos para repovoar o formulário — React 19 limpa campos após a action */
      fields?: Record<string, string>;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  /** versão da sessão (User.tokenVersion); sessões antigas deixam de valer quando a senha muda */
  v?: number;
};
