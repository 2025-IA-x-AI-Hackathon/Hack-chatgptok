import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { chatApi } from "@/lib/api"
import type { CreateChatRoomRequest, SendMessageRequest } from "@/lib/types"

// ============ Query Keys ============
export const chatKeys = {
  all: ["chat"] as const,
  rooms: () => [...chatKeys.all, "rooms"] as const,
  room: (roomId: string) => [...chatKeys.all, "room", roomId] as const,
  messages: (roomId: string) => [...chatKeys.all, "messages", roomId] as const,
}

// ============ 채팅방 목록 조회 ============
export function useChatRooms() {
  return useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: async () => {
      const response = await chatApi.getChatRooms()

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "채팅방 목록을 불러오는데 실패했습니다")
      }

      return response.data
    },
  })
}

// ============ 채팅방 상세 조회 ============
export function useChatRoom(roomId: string) {
  return useQuery({
    queryKey: chatKeys.room(roomId),
    queryFn: async () => {
      const response = await chatApi.getChatRoomDetail(roomId)

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "채팅방 정보를 불러오는데 실패했습니다")
      }

      return response.data
    },
    enabled: !!roomId,
  })
}

// ============ 메시지 목록 조회 ============
export function useMessages(roomId: string) {
  return useQuery({
    queryKey: chatKeys.messages(roomId),
    queryFn: async () => {
      const response = await chatApi.getMessages(roomId)

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "메시지를 불러오는데 실패했습니다")
      }

      return response.data
    },
    enabled: !!roomId,
  })
}

// ============ 채팅방 생성/조회 ============
export function useCreateOrGetChatRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateChatRoomRequest) => {
      const response = await chatApi.createOrGetChatRoom(data)

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "채팅방 생성에 실패했습니다")
      }

      return response.data
    },
    onSuccess: () => {
      // 채팅방 목록 갱신
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() })
    },
  })
}

// ============ 메시지 전송 ============
export function useSendMessage(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      const response = await chatApi.sendMessage(roomId, data)

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "메시지 전송에 실패했습니다")
      }

      return response.data
    },
    onSuccess: () => {
      // 메시지 목록 갱신
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(roomId) })
      // 채팅방 목록도 갱신 (최근 메시지 업데이트)
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() })
    },
  })
}

// ============ 메시지 읽음 처리 ============
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roomId: string) => {
      const response = await chatApi.markAsRead(roomId)

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "읽음 처리에 실패했습니다")
      }

      return response.data
    },
    onSuccess: (_, roomId) => {
      // 채팅방 정보 갱신
      queryClient.invalidateQueries({ queryKey: chatKeys.room(roomId) })
      // 채팅방 목록 갱신
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() })
    },
  })
}
