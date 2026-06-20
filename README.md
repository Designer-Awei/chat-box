# AI 聊天室

基于 Next.js 的 AI 问答聊天室，接入[硅基流动 SiliconFlow](https://cloud.siliconflow.cn/) 大模型 API，支持流式对话。

## 功能

- 实时流式问答
- 多轮对话上下文
- 图片上传与识图分析
- 硅基流动 OpenAI 兼容 API 接入
- 健康检查接口 `/api/health`

## 技术栈

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入硅基流动 API 密钥：

```env
SILICONFLOW_API_KEY=your_api_key_here
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
SILICONFLOW_MODEL=Qwen/Qwen3.6-27B
SILICONFLOW_VISION_MODEL=Qwen/Qwen3-VL-32B-Instruct
```

可在 [硅基流动模型中心](https://cloud.siliconflow.cn/models) 查看可用模型名称。

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 4. 验证 API 连接

```bash
curl http://localhost:3000/api/health
```

返回 `ok: true` 表示硅基流动 API 连接正常。

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts    # 聊天流式 API
│   │   └── health/route.ts  # 健康检查
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ChatRoom.tsx         # 聊天界面
├── lib/
│   └── siliconflow.ts       # 硅基流动 API 封装
└── types/
    └── chat.ts              # 类型定义
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SILICONFLOW_API_KEY` | 硅基流动 API 密钥 | 必填 |
| `SILICONFLOW_BASE_URL` | API 基础地址 | `https://api.siliconflow.cn/v1` |
| `SILICONFLOW_MODEL` | 文字对话模型 | `Qwen/Qwen3.6-27B` |
| `SILICONFLOW_VISION_MODEL` | 识图视觉模型（上传图片时自动使用） | `Qwen/Qwen3-VL-32B-Instruct` |

## 注意事项

- `.env.local` 已加入 `.gitignore`，请勿将 API 密钥提交到版本库
- 硅基流动平台模型名称需与控制台一致，例如 `zai-org/GLM-5.2`、`deepseek-ai/DeepSeek-V3.2`
