'use client'
import { use, useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Image as ImageIcon, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// 메시지 타입 정의
type Message = {
  id: string
  content: string
  senderId: string
  timestamp: Date
  isRead: boolean
}

// 제품 정보 타입
type Product = {
  id: string
  name: string
  price: number
  thumbnail: string
}

export default function ChatRoom({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState('')

  // 현재 사용자 ID (실제로는 인증 시스템에서 가져옴)
  const currentUserId = 'user1'
  
  // 샘플 제품 데이터
  const product: Product = {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 1590000,
    thumbnail: 'https://placehold.co/400x400/e2e8f0/64748b?text=iPhone+15'
  }
  
  // 샘플 메시지 데이터
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '안녕하세요! 제품에 대해 문의드립니다.',
      senderId: 'user2',
      timestamp: new Date('2025-10-31T14:30:00'),
      isRead: true
    },
    {
      id: '2',
      content: '네, 안녕하세요! 무엇이 궁금하신가요?',
      senderId: 'user1',
      timestamp: new Date('2025-10-31T14:32:00'),
      isRead: true
    },
    {
      id: '3',
      content: '직거래도 가능한가요?',
      senderId: 'user2',
      timestamp: new Date('2025-10-31T14:35:00'),
      isRead: true
    },
    {
      id: '4',
      content: '네, 가능합니다. 서울 강남 쪽에서 가능해요.',
      senderId: 'user1',
      timestamp: new Date('2025-10-31T14:36:00'),
      isRead: true
    },
    {
      id: '5',
      content: '내일 오후 3시에 강남역에서 만날 수 있을까요?',
      senderId: 'user2',
      timestamp: new Date('2025-11-01T09:15:00'),
      isRead: true
    },
    {
      id: '6',
      content: '네, 좋습니다! 내일 강남역 10번 출구에서 뵙겠습니다.',
      senderId: 'user1',
      timestamp: new Date('2025-11-01T09:20:00'),
      isRead: false
    },
  ])
  
  // 상대방 정보
  const otherUser = {
    id: 'user2',
    name: '김철수',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
  }
  
  // 날짜가 바뀌었는지 확인
  const isDifferentDay = (date1: Date, date2: Date) => {
    return date1.toDateString() !== date2.toDateString()
  }
  
  // 날짜 포맷팅 (중앙 표시용)
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    return `${year}년 ${month}월 ${day}일`
  }
  
  // 시간 포맷팅 (메시지 옆 표시용)
  const formatTime = (date: Date) => {
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    
    hours = hours % 12
    hours = hours ? hours : 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes
    
    return `${hours}:${minutesStr} ${ampm}`
  }
  
  // 마지막으로 읽은 메시지 찾기
  const getLastReadMessageId = () => {
    const myMessages = messages.filter(msg => msg.senderId === currentUserId)
    for (let i = myMessages.length - 1; i >= 0; i--) {
      if (myMessages[i].isRead) {
        return myMessages[i].id
      }
    }
    return null
  }
  
  const lastReadMessageId = getLastReadMessageId()
  
  // 메시지 전송
  const handleSendMessage = () => {
    if (!message.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      senderId: currentUserId,
      timestamp: new Date(),
      isRead: false
    }
    
    setMessages([...messages, newMessage])
    setMessage('')
    
    // 스크롤을 맨 아래로
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }
  
  // Enter 키로 메시지 전송
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원'
  }
  
  useEffect(() => {
    // 초기 로드 시 스크롤을 맨 아래로
    scrollRef.current?.scrollIntoView()
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">{otherUser.name}</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* 상단 제품 정보 */}
      <div className="border-b bg-white shrink-0 mt-14">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push(`/products/${product.id}`)}
            className="flex items-center gap-3 w-full text-left hover:bg-accent/50 transition-colors rounded-lg p-2 -m-2"
          >
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{product.name}</h3>
              <p className="text-sm font-bold text-blue-600">{formatPrice(product.price)}</p>
            </div>
          </button>
        </div>
      </div>
      
      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((msg, index) => {
              const showDateSeparator = 
                index === 0 || 
                isDifferentDay(messages[index - 1].timestamp, msg.timestamp)
              
              const isMyMessage = msg.senderId === currentUserId
              const isLastReadMessage = msg.id === lastReadMessageId
              
              return (
                <div key={msg.id}>
                  {/* 날짜 구분선 */}
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatDate(msg.timestamp)}
                      </div>
                    </div>
                  )}
                  
                  {/* 메시지 */}
                  <div className={cn(
                    "flex gap-2",
                    isMyMessage ? "justify-end" : "justify-start"
                  )}>
                    {/* 상대방 프로필 이미지 (왼쪽) */}
                    {!isMyMessage && (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                        <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      "flex items-end gap-1",
                      isMyMessage ? "flex-row-reverse" : "flex-row"
                    )}>
                      {/* 메시지 버블 */}
                      <div className={cn(
                        "max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl break-words",
                        isMyMessage 
                          ? "bg-blue-500 text-white rounded-br-sm" 
                          : "bg-white text-gray-900 rounded-bl-sm shadow-sm"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      
                      {/* 시간 및 읽음 표시 */}
                      <div className="flex flex-col items-center gap-0.5 mb-1">
                        {isMyMessage && isLastReadMessage && (
                          <span className="text-[10px] text-blue-600 font-medium">읽음</span>
                        )}
                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={scrollRef} />
          </div>
        </div>
      </div>
      
      {/* 하단 입력 영역 */}
      <div className="border-t bg-white p-4 shrink-0">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon"
            className="shrink-0"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
          />
          
          <Button 
            onClick={handleSendMessage}
            size="icon"
            className="shrink-0"
            disabled={!message.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}