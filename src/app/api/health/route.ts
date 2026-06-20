import { createChatCompletion, getSiliconFlowConfig } from "@/lib/siliconflow";

/**
 * 健康检查：验证硅基流动 API 连接是否正常
 */
export async function GET() {
  try {
    const config = getSiliconFlowConfig();
    const reply = await createChatCompletion("请用一句话介绍你自己。");

    return Response.json({
      ok: true,
      model: config.model,
      baseUrl: config.baseUrl,
      reply,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "硅基流动 API 连接失败";

    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
