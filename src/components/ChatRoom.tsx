"use client";

import { FormEvent, useRef, useState } from "react";
import { toApiMessages } from "@/lib/chat";
import type { ChatMessage } from "@/types/chat";

/**
 * 生成唯一消息 ID
 * @returns 消息 ID 字符串
 */
function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 从 SSE 数据块中解析 OpenAI 兼容的 delta 内容
 * @param chunk SSE 原始文本块
 * @returns 解析出的文本片段
 */
function parseStreamChunk(chunk: string): string {
  let content = "";

  for (const line of chunk.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) {
      continue;
    }

    const data = trimmed.slice(5).trim();
    if (!data || data === "[DONE]") {
      continue;
    }

    try {
      const parsed = JSON.parse(data) as {
        choices?: Array<{
          delta?: { content?: string; reasoning_content?: string };
        }>;
      };
      const delta = parsed.choices?.[0]?.delta;
      content += delta?.content ?? "";
    } catch {
      // 忽略无法解析的行
    }
  }

  return content;
}

/**
 * 知识库助手聊天界面
 */
export function ChatRoom() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "你好！我是知识库专属助手，只会根据 knowledge-base 文件夹中的资料回答问题。如果资料中没有相关内容，我会明确告知无法回答。",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /**
   * 滚动消息列表到底部
   */
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  /**
   * 提交用户问题并流式接收 AI 回复
   * @param event 表单提交事件
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = input.trim();
    if (!text || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
    };

    const assistantId = createMessageId();
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiMessages(nextMessages),
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "请求失败");
      }

      if (!response.body) {
        throw new Error("未收到流式响应");
      }

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = parseStreamChunk(decoder.decode(value, { stream: true }));
        if (!chunk) {
          continue;
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? { ...message, content: message.content + chunk }
              : message,
          ),
        );
        scrollToBottom();
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "发送失败";
      setError(message);
      setMessages((prev) => prev.filter((item) => item.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          知识库助手
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          仅基于 knowledge-base 资料回答，资料外问题将拒绝作答
        </p>
      </header>

      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto px-6 py-6"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
              }`}
            >
              {message.content || (isLoading ? "检索资料中..." : "")}
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <div className="mx-6 mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="基于知识库资料提问..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-blue-900"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "发送中" : "发送"}
          </button>
        </div>
      </form>
    </div>
  );
}
