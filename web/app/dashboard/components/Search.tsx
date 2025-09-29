"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { searchUsers } from "@/app/api/user/route";
import { getUserImageSrc } from "@/app/api/image/route";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const { t } = useLanguage();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await searchUsers(keyword);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchData, 400); // debounce
    return () => clearTimeout(timeout);
  }, [keyword]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 z-50 flex flex-col"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">{t("dashboard.search")}</h2>
              <button onClick={onClose}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Input */}
            <div className="p-4">
              <Input
                placeholder={t("dashboard.searchByNameOrNickname")}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading && (
                <p className="text-sm text-gray-500 px-2">
                  {t("dashboard.searching")}
                </p>
              )}
              {!loading && results.length === 0 && keyword && (
                <p className="text-sm text-gray-500 px-2">
                  {t("dashboard.noResults")}
                </p>
              )}
              <ul className="space-y-3">
                {results.map((user) => (
                  <li key={user.id}>
                    <Link
                      href={`/dashboard/profile/${user.nick_name}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={getUserImageSrc(user.avatar) || ""}
                          alt={user.name}
                        />
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.nick_name}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
