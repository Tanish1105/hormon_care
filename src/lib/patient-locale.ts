export type PatientLocale = "en" | "gu";

export function pickLocale(locale: PatientLocale, en: string, gu: string) {
  return locale === "gu" ? gu : en;
}
