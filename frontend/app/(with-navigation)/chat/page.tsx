"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ChatFilter = "전체" | "구매자" | "판매자" | "읽지 않음";

interface ChatItem {
  id: string;
  userName: string;
  userImage: string;
  productImage: string;
  lastMessage: string;
  unreadCount: number;
  type: "buyer" | "seller";
  timestamp: string;
}

// 샘플 데이터
const chatData: ChatItem[] = [
  {
    id: "1",
    userName: "김민수",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
    lastMessage: "네, 내일 오후 3시에 만나서 직거래 가능할까요?",
    unreadCount: 2,
    type: "buyer",
    timestamp: "오전 11:23",
  },
  {
    id: "2",
    userName: "이지은",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop",
    lastMessage: "상품 상태가 정말 좋네요! 구매하고 싶습니다.",
    unreadCount: 0,
    type: "buyer",
    timestamp: "어제",
  },
  {
    id: "3",
    userName: "박준영",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    productImage: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop",
    lastMessage: "택배비는 얼마인가요? 서울 지역인데 내일 받을 수 있을까요?",
    unreadCount: 5,
    type: "buyer",
    timestamp: "오후 2:15",
  },
  {
    id: "4",
    userName: "최수진",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
    productImage: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100&h=100&fit=crop",
    lastMessage: "감사합니다. 잘 받았어요!",
    unreadCount: 0,
    type: "seller",
    timestamp: "2일 전",
  },
  {
    id: "5",
    userName: "정우성",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
    productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop",
    lastMessage: "네고 가능한가요? 연락 주세요~",
    unreadCount: 1,
    type: "buyer",
    timestamp: "오전 9:45",
  },
];

export default function ChatPage() {
  const [selectedFilter, setSelectedFilter] = useState<ChatFilter>("전체");

  const filteredChats = chatData.filter((chat) => {
    if (selectedFilter === "전체") return true;
    if (selectedFilter === "구매자") return chat.type === "buyer";
    if (selectedFilter === "판매자") return chat.type === "seller";
    if (selectedFilter === "읽지 않음") return chat.unreadCount > 0;
    return true;
  });

  const filters: ChatFilter[] = ["전체", "구매자", "판매자", "읽지 않음"];

  return (
    <div className="fixed inset-0 flex flex-col bg-background pb-16">
      {/* Header with filter badges */}
      <div className="shrink-0 bg-background">
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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg">채팅이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={cn(
                  "block px-4 py-4 hover:bg-accent/50 cursor-pointer transition-colors",
                  chat.unreadCount > 0 ? "bg-background" : "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Overlapped Images: User Avatar (back) + Product (front) */}
                  <div className="relative shrink-0">
                    {/* User Avatar - Background with white fill */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-background">
                      <Avatar className="w-full h-full">
                        <AvatarImage src={chat.userImage} alt={chat.userName} />
                        <AvatarFallback className="bg-white">{chat.userName[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Product Image - Overlapping */}
                    <div className="absolute -right-2 -bottom-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-background">
                        <img
                          src={chat.productImage}
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
                          chat.unreadCount > 0
                            ? "text-foreground"
                            : "text-foreground/70"
                        )}
                      >
                        {chat.userName}
                      </h3>
                      <span
                        className={cn(
                          "text-xs ml-2",
                          chat.unreadCount > 0
                            ? "text-foreground/60 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {chat.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm truncate flex-1",
                          chat.unreadCount > 0
                            ? "text-foreground/80 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-2 min-w-[20px] h-5 flex items-center justify-center text-xs px-1.5"
                        >
                          {chat.unreadCount}
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
    </div>
  );
}