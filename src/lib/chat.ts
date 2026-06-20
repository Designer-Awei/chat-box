import type { ApiChatMessage, ChatContentPart, ChatMessage } from "@/types/chat";
import type { ChatRole } from "@/types/chat";

/**
 * 判断消息列表是否包含图片
 * @param messages API 消息列表
 * @returns 是否包含图片
 */
export function hasVisionContent(messages: ApiChatMessage[]): boolean {
  return messages.some((message) => {
    if (!Array.isArray(message.content)) {
      return false;
    }

    return message.content.some((part) => part.type === "image_url");
  });
}

/**
 * 将前端聊天消息转换为 API 消息格式
 * @param messages 前端消息列表
 * @returns API 消息列表
 */
export function toApiMessages(messages: ChatMessage[]): ApiChatMessage[] {
  return messages
    .filter((message) => message.role !== "system")
    .map((message) => {
      if (message.role !== "user" || !message.images?.length) {
        return {
          role: message.role as ChatRole,
          content: message.content,
        };
      }

      const parts: ChatContentPart[] = [];

      if (message.content.trim()) {
        parts.push({ type: "text", text: message.content });
      }

      for (const imageUrl of message.images) {
        parts.push({
          type: "image_url",
          image_url: { url: imageUrl },
        });
      }

      return {
        role: "user",
        content: parts,
      };
    });
}
