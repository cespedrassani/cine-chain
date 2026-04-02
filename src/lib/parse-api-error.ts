import axios from "axios";

const REFERENCE_ERROR_KEY =
  "failed to delete asset: another asset holds a reference to this one";

const ERROR_MAP: Record<string, string> = {
  [REFERENCE_ERROR_KEY]:
    "Não é possível excluir. Existem itens vinculados a este.",
};

export function isReferenceError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const message: unknown = error.response?.data?.error;
  return typeof message === "string" && message.trim() === REFERENCE_ERROR_KEY;
}

export function parseApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.error;
    if (typeof message === "string") {
      const trimmed = message.trim();
      return ERROR_MAP[trimmed] ?? trimmed;
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
