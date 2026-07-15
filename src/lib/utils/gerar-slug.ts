import { nanoid } from "nanoid";

export function gerarSlug(): string {
  return nanoid(10);
}
