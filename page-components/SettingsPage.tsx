"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage, supportedLanguages, type SupportedLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { CrudLayout } from "@/components/layout/CrudLayout";

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
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentLanguage);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const hasChanges = selectedLanguage !== currentLanguage;

  return (
    <CrudLayout title={t("settings.title", { defaultValue: "Settings" })} subtitle={t("settings.description", { defaultValue: "Configure your ERP preferences" })}>
      <div className="p-6 space-y-6">
        <div className="rounded-xl border bg-white p-5 space-y-4 max-w-md">
          <h2 className="font-semibold text-base text-gray-800 border-b pb-2">Language</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                {t("settings.languageLabel", { defaultValue: "Language" })}
              </label>
              <select
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={supportedLanguages.includes(selectedLanguage) ? selectedLanguage : "en"}
                onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500">{t("settings.helper", { defaultValue: "Changing language will reload the interface." })}</p>
            <Button onClick={() => setLanguage(selectedLanguage)} disabled={!hasChanges}>
              {t("settings.save", { defaultValue: "Save Settings" })}
            </Button>
          </div>
        </div>
      </div>
    </CrudLayout>
  );
}
