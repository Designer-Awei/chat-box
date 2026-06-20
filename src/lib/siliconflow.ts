import type { ApiChatMessage } from "@/types/chat";
import { hasVisionContent } from "@/lib/chat";

/**
 * 硅基流动 API 配置
 */
export interface SiliconFlowConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  visionModel: string;
}

/**
 * 从环境变量读取硅基流动配置
 * @returns 硅基流动 API 配置对象
 */
export function getSiliconFlowConfig(): SiliconFlowConfig {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  const baseUrl =
    process.env.SILICONFLOW_BASE_URL ?? "https://api.siliconflow.cn/v1";
  const model = process.env.SILICONFLOW_MODEL ?? "Qwen/Qwen3.6-27B";
  const visionModel =
    process.env.SILICONFLOW_VISION_MODEL ?? "Qwen/Qwen3-VL-32B-Instruct";

  if (!apiKey) {
    throw new Error("缺少环境变量 SILICONFLOW_API_KEY");
  }

  return { apiKey, baseUrl, model, visionModel };
}

/**
 * 调用硅基流动 Chat Completions API（流式）
 * @param messages 对话历史
 * @returns 上游 Response 对象
 */
export async function createChatCompletionStream(
  messages: ApiChatMessage[],
): Promise<Response> {
  const { apiKey, baseUrl, model, visionModel } = getSiliconFlowConfig();
  const useVision = hasVisionContent(messages);
  const selectedModel = useVision ? visionModel : model;

  const requestBody: Record<string, unknown> = {
    model: selectedModel,
    messages,
    stream: true,
    max_tokens: 2048,
    temperature: 0.7,
  };

  if (!useVision) {
    requestBody.enable_thinking = false;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return response;
}

/**
 * 调用硅基流动 Chat Completions API（非流式，用于健康检查）
 * @param prompt 测试提示词
 * @returns AI 回复内容
 */
export async function createChatCompletion(
  prompt: string,
): Promise<string> {
  const { apiKey, baseUrl, model } = getSiliconFlowConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
      enable_thinking: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`硅基流动 API 错误 (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
