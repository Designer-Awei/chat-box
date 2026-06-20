# AI 聊天室

基于 Next.js 的 AI 问答聊天室，接入[硅基流动 SiliconFlow](https://cloud.siliconflow.cn/) 大模型 API，支持流式对话。

## 功能

- 实时流式问答
- 多轮对话上下文
- **知识库专属问答**：仅基于 `knowledge-base` 文件夹资料回答
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

### 3. 添加知识库资料

将文档放入项目根目录的 `knowledge-base` 文件夹，支持 `.txt`、`.md`、`.docx` 格式。助手会检索相关资料后再作答，资料中没有的内容将拒绝回答。

### 4. 启动开发服务器

```bash
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 5. 验证 API 连接

```bash
curl http://localhost:3000/api/health
```

返回 `ok: true` 表示硅基流动 API 连接正常。

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts    # 聊天流式 API（含知识库检索）
│   │   └── health/route.ts  # 健康检查
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ChatRoom.tsx         # 知识库助手界面
├── lib/
│   ├── chat.ts              # 消息格式转换
│   ├── knowledge-base.ts    # 知识库加载与检索
│   ├── knowledge-prompt.ts  # 知识库系统提示词
│   └── siliconflow.ts       # 硅基流动 API 封装
└── types/
    └── chat.ts              # 类型定义
knowledge-base/              # 知识库文档目录
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SILICONFLOW_API_KEY` | 硅基流动 API 密钥 | 必填 |
| `SILICONFLOW_BASE_URL` | API 基础地址 | `https://api.siliconflow.cn/v1` |
| `SILICONFLOW_MODEL` | 文字对话模型 | `Qwen/Qwen3.6-27B` |
| `SILICONFLOW_VISION_MODEL` | 识图视觉模型（当前知识库模式未启用） | `Qwen/Qwen3-VL-32B-Instruct` |
| `KNOWLEDGE_BASE_DIR` | 知识库目录路径 | `./knowledge-base` |
| `KNOWLEDGE_TOP_K` | 每次检索返回的片段数量 | `5` |

## 注意事项

- `.env.local` 已加入 `.gitignore`，请勿将 API 密钥提交到版本库
- 硅基流动平台模型名称需与控制台一致，例如 `zai-org/GLM-5.2`、`deepseek-ai/DeepSeek-V3.2`
