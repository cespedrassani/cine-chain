import { z } from "zod";

export const tvShowSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  recommendedAge: z.coerce
    .number({ error: "Idade deve ser um número" })
    .int("Idade deve ser um número inteiro")
    .min(0, "Idade mínima é 0")
    .max(99, "Idade máxima é 99"),
});

export const seasonSchema = z.object({
  number: z.coerce
    .number({ error: "Informe um número válido" })
    .int("Deve ser um número inteiro")
    .min(1, "O número da temporada deve ser pelo menos 1"),
  year: z.coerce
    .number({ error: "Informe um ano válido" })
    .int("Deve ser um número inteiro")
    .min(1900, "Ano mínimo é 1900")
    .max(
      new Date().getUTCFullYear(),
      `Ano deve ser no máximo ${new Date().getUTCFullYear()}`,
    ),
});

export const episodeSchema = z.object({
  episodeNumber: z.coerce
    .number({ error: "Informe um número válido" })
    .int("Deve ser um número inteiro")
    .min(1, "O número do episódio deve ser pelo menos 1"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  releaseDate: z
    .string()
    .min(1, "Data de lançamento é obrigatória")
    .refine((val) => !isNaN(new Date(val).getTime()), "Data inválida")
    .refine(
      (val) => new Date(val).getUTCFullYear() >= 1900,
      "Ano mínimo é 1900",
    )
    .refine(
      (val) => new Date(val) <= new Date(),
      "A data não pode ser no futuro",
    ),
  rating: z.union([
    z.literal(""),
    z.coerce
      .number({ error: "A nota deve ser um número" })
      .min(0, "A nota mínima é 0")
      .max(10, "A nota máxima é 10"),
  ]),
});

export type TvShowSchema = z.infer<typeof tvShowSchema>;
export type SeasonSchema = z.infer<typeof seasonSchema>;
export type EpisodeSchema = z.infer<typeof episodeSchema>;
