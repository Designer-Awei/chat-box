/**
 * 聊天消息角色
 */
export type ChatRole = "user" | "assistant" | "system";

/**
 * 单条聊天消息
 */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** 用户消息附带的图片（base64 Data URL） */
  images?: string[];
}

/**
 * 多模态消息内容片段
 */
export type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

/**
 * 发送给 API 的聊天消息
 */
export interface ApiChatMessage {
  role: ChatRole;
  content: string | ChatContentPart[];
}

/**
 * 聊天 API 请求体
 */
export interface ChatRequestBody {
  messages: ApiChatMessage[];
}
