"use client";

import { useLanguage } from "@/components/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function ModalSearchNewChat() {
  const { t } = useLanguage();
  const [searchFocus, setSearchFocus] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Dialog>
      {/* Nút mở modal */}
      <DialogTrigger asChild>
        <Button
          variant={"default"}
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:scale-105 transition-transform hover:cursor-pointer"
        >
            {t("dashboard.newMessage")}
        </Button>
      </DialogTrigger>

      {/* Nội dung modal */}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            {t("dashboard.newMessage")}
          </DialogTitle>
          <div className="flex items-center gap-2 border-y border-gray-500 py-4">
            <span className="font-semibold">{t("dashboard.to")}:</span>
            <input
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              type="text"
              className="w-full h-10 p-2 border border-gray-300 rounded-md"
              placeholder={t("dashboard.recipient")}
            />
          </div>
        </DialogHeader>

        {/* Suggestion */}
        {searchFocus ? (
          <DialogDescription className="mt-2 min-h-96">
            {/* List query */}
          </DialogDescription>
        ) : (
          <DialogDescription className="mt-2 min-h-96">
            <span className="font-semibold text-black">{t("dashboard.recommendations")}</span>
            {/* List suggestion */}
          </DialogDescription>
        )}
        <div className="flex justify-center items-center">
          <Button variant="default" className="w-fit">
            {t("dashboard.sendMessage")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
