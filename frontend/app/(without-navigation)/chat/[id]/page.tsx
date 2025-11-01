'use client'
import { use, useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Image as ImageIcon, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { chatApi, authApi } from '@/lib/api'
import type { ChatMessage, ChatRoomDetail } from '@/lib/types'
import {
  connectChatSocket,
  disconnectChatSocket,
  joinChatRoom,
  leaveChatRoom,
  sendChatMessage,
  onNewMessage,
  onMessagesRead,
  onUserTyping,
  sendTypingStatus,
  removeAllListeners
} from '@/lib/chatSocket'

export default function ChatRoom({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: chatRoomId } = use(params)
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatRoom, setChatRoom] = useState<ChatRoomDetail | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const [connected, setConnected] = useState(false)
  const hasInitialized = useRef(false)

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const response = await authApi.getMe()
      if (response.success && response.data?.data?.user) {
        setCurrentUserId(response.data.data.user.member_id)
      }
    }
    fetchCurrentUser()
  }, [])

  // WebSocket 연결 및 채팅방 입장
  useEffect(() => {
    // React Strict Mode에서 중복 초기화 방지
    if (hasInitialized.current) {
      return
    }
    hasInitialized.current = true

    const initializeChat = async () => {
      try {
        setLoading(true)

        // JWT 토큰 가져오기
        const token = sessionStorage.getItem('accessToken')
        if (!token) {
          setError('로그인이 필요합니다.')
          return
        }

        // 채팅방 정보 가져오기
        const roomResponse = await chatApi.getChatRoomDetail(chatRoomId)
        if (roomResponse.success && roomResponse.data) {
          setChatRoom(roomResponse.data)
        } else {
          setError(roomResponse.error?.message || '채팅방을 불러오는데 실패했습니다.')
          return
        }

        // 메시지 목록 가져오기
        const messagesResponse = await chatApi.getMessages(chatRoomId)
        if (messagesResponse.success && messagesResponse.data) {
          setMessages(messagesResponse.data)
        } else {
          setError(messagesResponse.error?.message || '메시지를 불러오는데 실패했습니다.')
        }

        // WebSocket 연결
        const socket = connectChatSocket(token)

        socket.on('connect', async () => {
          setConnected(true)

          // 연결 완료 후 채팅방 입장
          try {
            await joinChatRoom(Number(chatRoomId))
            console.log('✅ 채팅방 입장 완료')
          } catch (error) {
            console.error('❌ 채팅방 입장 실패:', error)
            setError('채팅방 입장에 실패했습니다.')
          }
        })

        socket.on('disconnect', () => {
          setConnected(false)
        })

        // 이미 연결된 상태라면 즉시 입장
        if (socket.connected) {
          try {
            await joinChatRoom(Number(chatRoomId))
            console.log('✅ 채팅방 입장 완료 (이미 연결됨)')
          } catch (error) {
            console.error('❌ 채팅방 입장 실패:', error)
            setError('채팅방 입장에 실패했습니다.')
          }
        }

        // 새 메시지 수신
        onNewMessage((newMessage) => {
          setMessages(prev => [...prev, newMessage])

          // 스크롤을 맨 아래로
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        })

        // 메시지 읽음 알림
        onMessagesRead(({ userId }) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.sender_id === userId ? { ...msg, is_read: true } : msg
            )
          )
        })

        // 타이핑 상태
        onUserTyping(({ isTyping }) => {
          setIsOtherUserTyping(isTyping)
        })

      } catch (err: any) {
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    initializeChat()

    // 클린업
    return () => {
      leaveChatRoom(Number(chatRoomId))
      removeAllListeners()
      disconnectChatSocket()
    }
  }, [chatRoomId])

  // 상대방 정보
  const otherUser = chatRoom
    ? {
        id: chatRoom.other_user_id,
        name: chatRoom.other_user_name,
        avatar: chatRoom.other_user_img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatRoom.other_user_id}`,
      }
    : null

  // 상품 정보
  const product = chatRoom
    ? {
        id: chatRoom.product_id,
        name: chatRoom.product_name,
        price: chatRoom.product_price,
        thumbnail: chatRoom.product_thumbnail || 'https://placehold.co/400x400/e2e8f0/64748b?text=Product',
      }
    : null

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
    const myMessages = messages.filter(msg => msg.sender_id === currentUserId)
    for (let i = myMessages.length - 1; i >= 0; i--) {
      if (myMessages[i].is_read) {
        return myMessages[i].msg_id
      }
    }
    return null
  }

  const lastReadMessageId = getLastReadMessageId()

  // 메시지 전송 (WebSocket 사용)
  const handleSendMessage = async () => {
    if (!message.trim() || !connected) return

    try {
      // WebSocket으로 메시지 전송
      sendChatMessage(Number(chatRoomId), message.trim())
      setMessage('')

      // 타이핑 상태 해제
      sendTypingStatus(Number(chatRoomId), false)
    } catch (err) {
      console.error('메시지 전송 오류:', err)
      alert('메시지 전송 중 오류가 발생했습니다.')
    }
  }

  // 타이핑 감지
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    if (!connected) return

    // 타이핑 시작
    sendTypingStatus(Number(chatRoomId), true)

    // 타이핑 중지 타이머
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(Number(chatRoomId), false)
    }, 1000)
  }

  // Enter 키로 메시지 전송
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 한글 입력 중(IME 조합 중)일 때는 Enter 이벤트 무시
    if (e.nativeEvent.isComposing) {
      return
    }

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
  }, [messages])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-lg text-muted-foreground">채팅을 불러오는 중...</p>
      </div>
    )
  }

  if (error || !chatRoom || !otherUser || !product) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50">
        <p className="text-lg text-red-500 mb-4">{error || '채팅방을 찾을 수 없습니다.'}</p>
        <Button onClick={() => router.back()}>돌아가기</Button>
      </div>
    )
  }

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
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{otherUser.name}</h1>
            {connected ? (
              <span className="w-2 h-2 bg-green-500 rounded-full" title="온라인"></span>
            ) : (
              <span className="w-2 h-2 bg-gray-400 rounded-full" title="오프라인"></span>
            )}
          </div>
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
                isDifferentDay(new Date(messages[index - 1].created_at), new Date(msg.created_at))

              const isMyMessage = msg.sender_id === currentUserId
              const isLastReadMessage = msg.msg_id === lastReadMessageId

              return (
                <div key={msg.msg_id}>
                  {/* 날짜 구분선 */}
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatDate(new Date(msg.created_at))}
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
                          {formatTime(new Date(msg.created_at))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* 타이핑 인디케이터 */}
            {isOtherUserTyping && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>{otherUser.name}님이 입력 중</span>
                <span className="flex gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            )}

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
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
            disabled={!connected}
          />

          <Button
            onClick={handleSendMessage}
            size="icon"
            className="shrink-0"
            disabled={!message.trim() || !connected}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {!connected && (
          <p className="text-center text-sm text-red-500 mt-2">
            연결 중... 잠시만 기다려주세요.
          </p>
        )}
      </div>
    </div>
  )
}
