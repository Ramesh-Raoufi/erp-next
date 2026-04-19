"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  setLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const languageOptions: { value: SupportedLanguage; labelKey: string }[] = [
  { value: "en", labelKey: "language.english" },
  { value: "fa", labelKey: "language.persian" },
];

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const currentLanguage = useMemo(
    () => (i18n.language?.split("-")[0] as SupportedLanguage) ?? "en",
    [i18n.language],
  );
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage>(currentLanguage);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const hasChanges = selectedLanguage !== currentLanguage;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("settings.description")}
        </p>
      </header>

      <div className="max-w-sm space-y-3">
        <label className="block space-y-1">
          <div className="text-xs text-muted-foreground">
            {t("settings.languageLabel")}
          </div>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={
              supportedLanguages.includes(selectedLanguage)
                ? selectedLanguage
                : "en"
            }
            onChange={(event) =>
              setSelectedLanguage(event.target.value as SupportedLanguage)
            }
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </label>
        <div className="text-xs text-muted-foreground">
          {t("settings.helper")}
        </div>
        <Button
          type="button"
          onClick={() => setLanguage(selectedLanguage)}
          disabled={!hasChanges}
        >
          {t("settings.save")}
        </Button>
      </div>
    </div>
  );
}
