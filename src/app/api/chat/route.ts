import { createChatCompletionStream } from "@/lib/siliconflow";
import type { ChatRequestBody } from "@/types/chat";

/**
 * 处理聊天请求，将硅基流动流式响应转发给客户端
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;

    if (!body.messages?.length) {
      return Response.json({ error: "消息不能为空" }, { status: 400 });
    }

    const upstream = await createChatCompletionStream(body.messages);

    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text();
      return Response.json(
        { error: `硅基流动 API 错误: ${errorText}` },
        { status: upstream.status || 500 },
      );
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "服务器内部错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
