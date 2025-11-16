"use client";

import { useLanguage } from "@/components/contexts/LanguageContext";
import ModalSearchNewChat from "./components/ModalSearchNewChat";

export default function ChatPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-2xl font-bold">{t("dashboard.chat")}</h1>
      <p className="my-4">{t("dashboard.startChat")}</p>
      {/* <ModalSearchNewChat /> */}
    </div>
  );
}
