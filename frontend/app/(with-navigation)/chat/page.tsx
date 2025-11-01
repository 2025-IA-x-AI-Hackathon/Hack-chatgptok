"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { chatApi } from "@/lib/api";
import type { ChatRoom } from "@/lib/types";

type ChatFilter = "전체" | "구매자" | "판매자" | "읽지 않음";

export default function ChatPage() {
  const [selectedFilter, setSelectedFilter] = useState<ChatFilter>("전체");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 채팅방 목록 가져오기
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const response = await chatApi.getChatRooms();

        if (response.success && response.data?.data) {
          setChatRooms(response.data.data);
        } else {
          setError(response.error?.message || "채팅방을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("채팅방을 불러오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  const filteredChats = chatRooms.filter((chat) => {
    if (selectedFilter === "전체") return true;
    if (selectedFilter === "구매자") return chat.user_type === "buyer";
    if (selectedFilter === "판매자") return chat.user_type === "seller";
    if (selectedFilter === "읽지 않음") return chat.unread_count > 0;
    return true;
  });

  const filters: ChatFilter[] = ["전체", "구매자", "판매자", "읽지 않음"];

  // 시간 포맷팅
  const formatTimestamp = (timestamp: string | undefined) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      // 오늘 - 시간 표시
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "오후" : "오전";
      const displayHours = hours % 12 || 12;
      return `${ampm} ${displayHours}:${minutes.toString().padStart(2, "0")}`;
    } else if (diffInDays === 1) {
      return "어제";
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with filter badges */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">채팅</h1>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <Badge
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all px-4 py-2 text-sm",
                  selectedFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg">채팅 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg">채팅이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredChats.map((chat) => (
              <Link
                key={chat.room_id}
                href={`/chat/${chat.room_id}`}
                className={cn(
                  "block px-4 py-4 hover:bg-accent/50 cursor-pointer transition-colors",
                  chat.unread_count > 0 ? "bg-background" : "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Overlapped Images: User Avatar (back) + Product (front) */}
                  <div className="relative shrink-0">
                    {/* User Avatar - Background with white fill */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-background">
                      <Avatar className="w-full h-full">
                        <AvatarImage
                          src={chat.other_user_img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.other_user_id}`}
                          alt={chat.other_user_name}
                        />
                        <AvatarFallback className="bg-white">{chat.other_user_name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Product Image - Overlapping */}
                    <div className="absolute -right-2 -bottom-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-background">
                        <img
                          src={chat.product_thumbnail || "https://placehold.co/100x100/e2e8f0/64748b?text=Product"}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={cn(
                          "font-semibold",
                          chat.unread_count > 0
                            ? "text-foreground"
                            : "text-foreground/70"
                        )}
                      >
                        {chat.other_user_name}
                      </h3>
                      <span
                        className={cn(
                          "text-xs ml-2",
                          chat.unread_count > 0
                            ? "text-foreground/60 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatTimestamp(chat.last_message_time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm truncate flex-1",
                          chat.unread_count > 0
                            ? "text-foreground/80 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {chat.last_message || "메시지가 없습니다"}
                      </p>
                      {chat.unread_count > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-2 min-w-[20px] h-5 flex items-center justify-center text-xs px-1.5"
                        >
                          {chat.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
