"use client";

import { useLanguage } from "@/components/contexts/LanguageContext";
import ModalSearchNewChat from "./components/ModalSearchNewChat";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const { t } = useLanguage();
  const [openNewChat, setOpenNewChat] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center h-full relative">
      <h1 className="text-2xl font-bold">{t("dashboard.chat")}</h1>
      <p className="my-4">{t("dashboard.startChat")}</p>
      <Button onClick={() => setOpenNewChat(true)} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 px-6 shadow-md font-bold">
        {t("dashboard.newMessage")}
      </Button>
      <ModalSearchNewChat open={openNewChat} setOpen={setOpenNewChat} />
    </div>
  );
}
