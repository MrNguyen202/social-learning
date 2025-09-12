import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { get } from "http";
import { getUserImageSrc } from "@/app/api/image/route";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  nick_name: string;
  avatar?: string;
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  active?: string;
  data: User[];
}

export default function UserListModal({
  isOpen,
  onClose,
  title,
  active,
  data,
}: UserListModalProps) {
  const [keyword, setKeyword] = useState("");

  const filteredData = data.filter(
    (user) =>
      user.name?.toLowerCase().includes(keyword.toLowerCase()) ||
      user.nick_name?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-xl sm:max-w-[450px] max-w-xs w-full p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="pt-4">
          <DialogTitle className="text-center text-lg font-semibold">
            {title}
          </DialogTitle>
          <div className="border-t pt-3 px-4">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm"
            />
          </div>
        </DialogHeader>

        {/* Scrollable list with fixed height */}
        <ScrollArea className="h-[50vh]">
          <div className="divide-y">
            {filteredData.length > 0 ? (
              filteredData.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={getUserImageSrc(u.avatar)}
                        alt={u.name}
                      />
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{u.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {u.nick_name}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="text-sm cursor-pointer hover:bg-gray-200"
                    onClick={() => {}}
                  >
                    {active}
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-6">
                Không tìm thấy người dùng
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
