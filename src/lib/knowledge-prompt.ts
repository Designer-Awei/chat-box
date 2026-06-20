import type { ApiChatMessage } from "@/types/chat";
import {
  buildKnowledgeSystemPrompt,
  retrieveRelevantContext,
} from "@/lib/knowledge-base";

/**
 * 从消息列表中提取最新用户问题文本
 * @param messages API 消息列表
 * @returns 用户问题
 */
export function extractLatestUserQuery(messages: ApiChatMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "user") {
      continue;
    }

    if (typeof message.content === "string") {
      return message.content.trim();
    }

    if (Array.isArray(message.content)) {
      return message.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(" ")
        .trim();
    }
  }

  return "";
}

/**
 * 为消息列表注入知识库系统提示词
 * @param messages 原始消息列表
 * @returns 带系统提示词的消息列表
 */
export async function withKnowledgeBasePrompt(
  messages: ApiChatMessage[],
): Promise<ApiChatMessage[]> {
  const query = extractLatestUserQuery(messages);
  const context = await retrieveRelevantContext(query);
  const systemPrompt = buildKnowledgeSystemPrompt(context);

  return [{ role: "system", content: systemPrompt }, ...messages];
}
