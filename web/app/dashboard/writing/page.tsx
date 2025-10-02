"use client";

import { CardTypeEx } from "./components/CardTypeEx";
import { useLanguage } from "@/components/contexts/LanguageContext";

export default function WritingPage() {
    const { t } = useLanguage();
    return (
        <>
            <div className="flex-1 px-6 py-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
                        <h2 className="text-3xl font-semibold">{t("learning.titleParagraphExercise")}</h2>
                        <p className="text-lg tracking-widest text-gray-600">
                            {t("learning.descriptionParagraphExercise")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
                        <CardTypeEx />
                    </div>
                </div>
            </div>
        </>
    );
}
