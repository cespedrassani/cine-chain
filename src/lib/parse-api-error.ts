import axios from "axios";

const ERROR_MAP: Array<{ match: string; message: string }> = [
  {
    match: "failed to delete asset: another asset holds a reference to this one",
    message: "Não é possível excluir. Existem itens vinculados a este.",
  },
  {
    match: "asset already exists",
    message: "Já existe um item com esses dados. Verifique e tente novamente.",
  },
];

export function isReferenceError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const message: unknown = error.response?.data?.error;
  return (
    typeof message === "string" &&
    message
      .trim()
      .includes(
        "failed to delete asset: another asset holds a reference to this one",
      )
  );
}

export function parseApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.error;
    if (typeof message === "string") {
      const trimmed = message.trim().toLowerCase();
      const found = ERROR_MAP.find((e) => trimmed.includes(e.match));
      if (found) return found.message;
      return message.trim();
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
