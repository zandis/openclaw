# OpenClaw 產品需求文件 (PRD)

**版本**: 2026.1.30
**最後更新**: 2026-01-31
**語言**: 繁體中文 (zh-TW)

---

## 目錄

1. [產品概述](#1-產品概述)
2. [核心架構](#2-核心架構)
3. [系統元件](#3-系統元件)
4. [頻道整合](#4-頻道整合)
5. [代理系統](#5-代理系統)
6. [外掛架構](#6-外掛架構)
7. [配置系統](#7-配置系統)
8. [媒體管線](#8-媒體管線)
9. [安全機制](#9-安全機制)
10. [CLI 命令參考](#10-cli-命令參考)
11. [原生應用程式](#11-原生應用程式)
12. [測試框架](#12-測試框架)
13. [技術堆疊](#13-技術堆疊)
14. [未來發展](#14-未來發展)

---

## 1. 產品概述

### 1.1 產品定義

**OpenClaw** 是一個多頻道 AI 代理閘道 (Multi-channel AI Agent Gateway)，專為統一管理跨平台即時通訊而設計。它允許使用者透過單一介面，將 AI 代理連接至多種通訊平台，實現自動化訊息處理與回覆。

### 1.2 核心價值主張

| 價值 | 描述 |
|------|------|
| **統一管理** | 單一閘道管理 13+ 個通訊頻道 |
| **本地優先** | 資料儲存於本機，完全掌控隱私 |
| **多代理支援** | 支援多個獨立 AI 代理同時運作 |
| **可擴展性** | 外掛架構支援自訂頻道與服務 |
| **跨平台** | 支援 macOS、iOS、Android 及 Linux |

### 1.3 目標使用者

1. **個人使用者**: 希望透過 AI 助理自動化個人通訊
2. **開發者**: 需要建構自訂通訊機器人的技術人員
3. **企業團隊**: 需要統一管理多頻道客服的組織
4. **自動化愛好者**: 希望整合通訊與工作流程的使用者

### 1.4 產品定位

```
┌─────────────────────────────────────────────────────────┐
│                    OpenClaw 定位                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  通訊平台   │    │   閘道層    │    │  AI 代理    │ │
│  │  WhatsApp   │◀──▶│  OpenClaw   │◀──▶│  Pi Agent   │ │
│  │  Telegram   │    │   Gateway   │    │  自訂模型   │ │
│  │  Discord    │    │             │    │             │ │
│  │  Slack      │    └─────────────┘    └─────────────┘ │
│  │  Signal     │           ▲                           │
│  │  ...13+     │           │                           │
│  └─────────────┘    ┌─────────────┐                    │
│                     │  控制介面   │                    │
│                     │  CLI/App/UI │                    │
│                     └─────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 核心架構

### 2.1 系統架構圖

```
                          ┌──────────────────────────────────────┐
                          │           Gateway (閘道)              │
                          │  ┌────────────────────────────────┐  │
┌──────────┐              │  │        WebSocket 伺服器         │  │
│ WhatsApp │◀────────────▶│  │      (預設 127.0.0.1:18789)     │  │
│ (Baileys)│              │  └────────────────────────────────┘  │
└──────────┘              │                 ▲                    │
                          │                 │                    │
┌──────────┐              │  ┌──────────────┼──────────────┐     │
│ Telegram │◀────────────▶│  │   頻道管理器  │  代理管理器   │     │
│ (grammY) │              │  └──────────────┼──────────────┘     │
└──────────┘              │                 │                    │
                          │  ┌──────────────┼──────────────┐     │
┌──────────┐              │  │   外掛載入器  │  配置載入器   │     │
│ Discord  │◀────────────▶│  └──────────────┼──────────────┘     │
│(discord.js)             │                 │                    │
└──────────┘              │  ┌──────────────▼──────────────┐     │
                          │  │        Pi Agent 運行時       │     │
┌──────────┐              │  │      (pi-mono 整合)          │     │
│  Slack   │◀────────────▶│  └────────────────────────────┘     │
│  (Bolt)  │              │                                      │
└──────────┘              └──────────────────────────────────────┘
                                           ▲
     ┌─────────────────────────────────────┼────────────────────┐
     │                                     │                    │
┌────┴────┐    ┌──────────┐    ┌──────────┴──────┐    ┌────────┐
│ macOS   │    │   CLI    │    │    Control UI   │    │ Mobile │
│   App   │    │ Terminal │    │    (Web 介面)   │    │  Node  │
└─────────┘    └──────────┘    └─────────────────┘    └────────┘
```

### 2.2 資料流程

```
訊息流入 (Inbound):
    頻道 (WhatsApp/Telegram/...)
      → 入站適配器 (Inbound Adapter)
      → 訊息路由 (Message Routing)
      → 會話查詢 (Session Lookup)
      → Pi Agent 執行
      → 回應串流 (Response Streaming)
      → 出站適配器 (Outbound Adapter)
      → 頻道發送

訊息流出 (Outbound):
    控制介面 (CLI/App/UI)
      → WebSocket 請求
      → Gateway RPC 處理
      → 頻道出站適配器
      → 目標平台發送
```

### 2.3 連線生命週期

```
客戶端                    Gateway
  │                          │
  │──── req:connect ────────>│
  │<────── res (ok) ─────────│   (連線建立)
  │   (payload=hello-ok: presence + health)
  │                          │
  │<────── event:presence ───│
  │<────── event:tick ───────│   (心跳)
  │                          │
  │─────── req:agent ───────>│
  │<────── res:agent ────────│   (確認: status:"accepted")
  │<────── event:agent ──────│   (串流回應)
  │<────── res:agent ────────│   (完成: status,summary)
  │                          │
```

---

## 3. 系統元件

### 3.1 Gateway (閘道)

**位置**: `src/gateway/`

Gateway 是整個系統的控制平面，負責協調所有元件。

#### 核心檔案結構

| 檔案 | 功能 |
|------|------|
| `server.impl.ts` | 主伺服器實作 (~20KB) |
| `server-channels.ts` | 頻道管理器 |
| `server-chat.ts` | 代理事件處理 |
| `server-methods.ts` | Gateway RPC 方法 |
| `server-cron.ts` | 排程任務 |
| `server-plugins.ts` | 外掛載入/管理 |
| `server-discovery.ts` | mDNS/Bonjour 探索 |
| `server-tailscale.ts` | Tailscale 整合 |

#### 主要功能

1. **連線管理**: 維護與所有頻道的連線
2. **訊息路由**: 根據綁定規則將訊息導向正確的代理
3. **會話管理**: 追蹤並管理所有代理會話
4. **健康監控**: 持續監控系統狀態
5. **事件廣播**: 向客戶端推送即時事件

### 3.2 配置系統

**位置**: `src/config/`

#### 配置架構

```typescript
type OpenClawConfig = {
  // 代理預設值
  agentDefaults?: {
    model?: string;
    thinking?: string;
    workspace?: string;
  };

  // 認證設定
  auth?: {
    anthropic?: AuthProfile;
    openai?: AuthProfile;
    // ...其他提供者
  };

  // 模型配置
  models?: {
    default?: string;
    customIds?: Record<string, ModelEntry>;
  };

  // 頻道配置
  channels?: {
    whatsapp?: WhatsAppConfig;
    telegram?: TelegramConfig;
    discord?: DiscordConfig;
    slack?: SlackConfig;
    // ...更多頻道
  };

  // 代理綁定
  bindings?: AgentBinding[];

  // 會話管理
  session?: SessionConfig;

  // 排程任務
  cron?: CronConfig[];

  // 外掛
  plugins?: PluginConfig[];

  // 閘道設定
  gateway?: GatewayConfig;

  // 安全設定
  sandbox?: SandboxConfig;
  approvals?: ApprovalsConfig;
};
```

#### 配置路徑

| 平台 | 路徑 |
|------|------|
| Linux/macOS | `~/.openclaw/config.json` |
| Windows | `%APPDATA%/openclaw/config.json` |
| 環境變數覆蓋 | `OPENCLAW_CONFIG` |

#### 類型定義 (30+ 模組)

- `types/agent.ts` - 代理設定
- `types/auth.ts` - 認證設定
- `types/channels.ts` - 頻道設定
- `types/models.ts` - 模型設定
- `types/plugins.ts` - 外掛設定
- `types/gateway.ts` - 閘道設定
- ...更多

### 3.3 代理系統

**位置**: `src/agents/`

#### 核心元件

| 元件 | 功能 |
|------|------|
| `context.ts` | 代理上下文 (懶載入模型元資料) |
| `agent-scope.ts` | 代理工作空間解析 |
| `bash-tools.*.ts` | Shell 執行工具 (PTY, 核准管理) |
| `pi-embedded-runner.ts` | Pi 代理運行時整合 |
| `model-selection.ts` | 模型選擇邏輯 |
| `model-fallback.ts` | 模型故障轉移 |
| `subagent-registry.ts` | 子代理註冊表 |

#### 工作空間結構

```
~/.openclaw/workspace/
├── AGENTS.md       # 操作指令 + "記憶"
├── SOUL.md         # 人格、邊界、語調
├── TOOLS.md        # 使用者維護的工具筆記
├── BOOTSTRAP.md    # 首次運行儀式 (完成後刪除)
├── IDENTITY.md     # 代理名稱/風格/表情符號
├── USER.md         # 使用者設定檔 + 偏好稱呼
└── skills/         # 工作空間技能
```

#### 會話儲存

```
~/.openclaw/agents/<agentId>/sessions/<SessionId>.jsonl
```

### 3.4 路由系統

**位置**: `src/routing/`

#### 綁定規則

```typescript
type AgentBinding = {
  agent: string;           // 代理 ID
  channel?: ChannelId;     // 頻道類型
  account?: string;        // 帳號識別
  peer?: string;           // 對話對象
  guild?: string;          // Discord 伺服器
  workspace?: string;      // Slack 工作區
  isDefault?: boolean;     // 預設路由
};
```

#### 路由優先順序

1. **Peer 層級**: 特定對話對象綁定
2. **群組層級**: Discord 伺服器或 Slack 工作區
3. **帳號層級**: 特定頻道帳號
4. **頻道層級**: 頻道預設代理
5. **全域預設**: 未匹配時的備援

---

## 4. 頻道整合

### 4.1 統一頻道介面

**位置**: `src/channels/plugins/`

```typescript
type ChannelPlugin = {
  id: ChannelId;
  meta: ChannelMeta;

  // 核心適配器
  setup?: ChannelSetupAdapter;      // 初始設定
  auth?: ChannelAuthAdapter;        // 認證流程
  status?: ChannelStatusAdapter;    // 狀態查詢
  messaging?: ChannelMessagingAdapter;  // 訊息監聽
  outbound?: ChannelOutboundAdapter;    // 訊息發送

  // 擴展適配器
  security?: ChannelSecurityAdapter;    // 安全策略
  group?: ChannelGroupAdapter;          // 群組管理
  mention?: ChannelMentionAdapter;      // @提及處理
  threading?: ChannelThreadingAdapter;  // 執行緒支援
  actions?: ChannelMessageActionAdapter;// 訊息動作
  heartbeat?: ChannelHeartbeatAdapter;  // 心跳檢測
};
```

### 4.2 內建頻道

#### WhatsApp (`src/whatsapp/`)

**SDK**: `@whiskeysockets/baileys` 7.0.0-rc.9

| 檔案 | 功能 |
|------|------|
| `monitor-inbox.ts` | 入站訊息處理 |
| `auto-reply/` | 自動回覆系統 |
| `send.ts` | 出站訊息發送 |
| `login-qr.ts` | QR Code 認證 |
| `accounts.ts` | 多帳號管理 |
| `media.ts` | 媒體上傳/下載 |

**特色**:
- 免 API 金鑰 (使用 WhatsApp Web)
- 完整功能支援
- 多裝置支援
- 即時訊息送達

#### Telegram (`src/telegram/`)

**SDK**: `grammy` ^1.39.3

| 檔案 | 功能 |
|------|------|
| `bot.ts` | Bot 建立與更新處理 |
| `bot-handlers.ts` | 訊息/回調處理器 |
| `send.ts` | 發送訊息 (含格式化) |
| `accounts.ts` | Bot Token 管理 |
| `bot-native-commands.ts` | 原生命令支援 |

#### Discord (`src/discord/`)

**SDK**: `discord.js` + `discord-api-types`

| 檔案 | 功能 |
|------|------|
| `monitor/` | 伺服器/私訊監聽 |
| `send.ts` | 頻道/私訊/執行緒發送 |
| `targets.ts` | 頻道/使用者解析 |
| `actions.ts` | 表情/反應動作 |

#### Slack (`src/slack/`)

**SDK**: `@slack/bolt` ^4.6.0

| 檔案 | 功能 |
|------|------|
| `monitor/` | 事件處理 (訊息/反應/執行緒) |
| `send.ts` | 私訊/頻道/執行緒發送 |
| `actions.ts` | Slack 動作 (按鈕/選單) |
| `threading.ts` | 執行緒管理 |
| `scopes.ts` | OAuth 權限管理 |

#### Signal (`src/signal/`)

**SDK**: `signal-utils` ^0.21.1

| 檔案 | 功能 |
|------|------|
| `monitor.ts` | 訊息監聽 |
| `send.ts` | 群組/私訊發送 |
| `pairing-store.ts` | 配對碼儲存 |

#### iMessage (`src/imessage/`)

**依賴**: `imsg` CLI

| 檔案 | 功能 |
|------|------|
| `monitor.ts` | iMessage 監聽 |
| `send.ts` | 訊息發送 |

#### LINE (`src/line/`)

**SDK**: `@line/bot-sdk` ^10.6.0

### 4.3 擴展頻道 (`extensions/`)

| 擴展 | 說明 |
|------|------|
| **BlueBubbles** | macOS/iOS iMessage 中繼 |
| **Matrix** | 聯邦式聊天 (Synapse/Dendrite) |
| **Microsoft Teams** | Teams Bot API |
| **Mattermost** | 自建團隊聊天 |
| **Nextcloud Talk** | Nextcloud 語音/視訊 |
| **Zalo** | 越南即時通訊 |
| **Zalo Personal** | Zalo 私訊 |
| **Tlon** | Urbit 通訊 |
| **Voice Call** | VoIP 擴展 |

### 4.4 頻道媒體限制

| 頻道 | 圖片限制 | 檔案限制 |
|------|----------|----------|
| WhatsApp | 16MB | 100MB (影片) |
| Telegram | 2000x2000 | 50MB |
| Discord | - | 10MB |
| Slack | - | 200MB |
| Signal | - | 30MB |

---

## 5. 代理系統

### 5.1 Pi Agent 整合

OpenClaw 整合 `pi-mono` 代碼庫，提供：

- **模型管理**: 多提供者支援 (Anthropic, OpenAI, Bedrock, OpenRouter)
- **工具系統**: 檔案讀取/寫入、Shell 執行、瀏覽器自動化
- **會話管理**: 持久化會話與上下文

### 5.2 支援的 AI 模型提供者

| 提供者 | 說明 |
|--------|------|
| Anthropic | Claude 系列模型 |
| OpenAI | GPT 系列模型 |
| AWS Bedrock | 多種雲端模型 |
| OpenRouter | 模型路由服務 |
| Ollama | 本地模型運行 |

### 5.3 內建工具

| 工具 | 功能 |
|------|------|
| `read` | 讀取檔案 |
| `write` | 寫入檔案 |
| `edit` | 編輯檔案 |
| `exec` | 執行 Shell 命令 |
| `browser` | 瀏覽器自動化 |
| `apply_patch` | 應用補丁 (選用) |

### 5.4 技能系統

技能載入順序 (工作空間優先):

1. **捆綁技能**: 隨安裝包提供
2. **受管技能**: `~/.openclaw/skills`
3. **工作空間技能**: `<workspace>/skills`

### 5.5 會話模式

| 模式 | 行為 |
|------|------|
| `steer` | 新訊息注入當前運行 |
| `followup` | 等待當前回合結束後處理 |
| `collect` | 收集並批次處理訊息 |

### 5.6 串流輸出

```typescript
// 區塊串流設定
agents.defaults.blockStreamingDefault: "off" | "on"
agents.defaults.blockStreamingBreak: "text_end" | "message_end"
agents.defaults.blockStreamingChunk: number  // 800-1200 字元
agents.defaults.blockStreamingCoalesce: boolean  // 合併小區塊
```

---

## 6. 外掛架構

### 6.1 外掛系統

**位置**: `src/plugins/`

#### 核心元件

| 元件 | 功能 |
|------|------|
| `loader.ts` | 動態外掛載入 (via jiti) |
| `registry.ts` | 外掛探索與元資料 |
| `manifest.ts` | 外掛清單 Schema |
| `discovery.ts` | 自動探索捆綁外掛 |
| `hooks.ts` | 全域 Hook 執行器 |
| `install.ts` | 外掛安裝/設定 |

### 6.2 外掛類型

#### 頻道外掛 (ChannelPlugin)

```typescript
type ChannelPlugin = {
  id: ChannelId;
  meta: ChannelMeta;
  setup?: ChannelSetupAdapter;
  auth?: ChannelAuthAdapter;
  status?: ChannelStatusAdapter;
  messaging?: ChannelMessagingAdapter;
  outbound?: ChannelOutboundAdapter;
  // ...40+ 適配器類型
};
```

#### Gateway 服務外掛

```typescript
type OpenClawPluginService = {
  name: string;
  methods: Record<string, RpcHandler>;
  httpRoutes?: HttpRoute[];
  hooks?: PluginHooks;
};
```

### 6.3 外掛 SDK

**匯出路徑**: `openclaw/plugin-sdk`

```typescript
// 頻道外掛類型
export type {
  ChannelPlugin,
  ChannelConfigAdapter,
  ChannelMessagingAdapter,
  // ...
};

// Gateway 服務類型
export type {
  OpenClawPluginService,
  OpenClawPluginApi,
  // ...
};

// 配置
export type { OpenClawConfig };

// 工具
export {
  registerPluginHttpRoute,
  emptyPluginConfigSchema,
  // ...
};
```

### 6.4 Hook 系統

| Hook | 觸發時機 |
|------|----------|
| `beforeAgentRun` | 代理執行前 |
| `afterAgentRun` | 代理執行後 |
| `onMessageReceived` | 收到訊息時 |
| `onMessageSent` | 發送訊息時 |

### 6.5 擴展外掛結構

```
extensions/
├── msteams/
│   ├── package.json      # 獨立依賴
│   ├── tsconfig.json     # 獨立編譯
│   ├── src/
│   │   └── index.ts      # 外掛入口
│   └── README.md
├── matrix/
├── voice-call/
└── ...
```

---

## 7. 配置系統

### 7.1 配置格式

OpenClaw 使用 **JSON5** 格式，支援：
- 註解
- 尾隨逗號
- 單引號字串
- 無引號鍵名

### 7.2 完整配置結構

```json5
{
  // 代理預設設定
  agentDefaults: {
    model: "anthropic/claude-opus-4-5-20251101",
    thinking: "low",
    workspace: "~/.openclaw/workspace",
    blockStreamingDefault: "off"
  },

  // 認證設定
  auth: {
    anthropic: {
      apiKey: "sk-ant-..."
    },
    openai: {
      apiKey: "sk-..."
    }
  },

  // 頻道設定
  channels: {
    whatsapp: {
      accounts: ["default"],
      dmPolicy: "pairing",
      allowFrom: ["+1234567890"]
    },
    telegram: {
      accounts: ["my-bot"],
      dmPolicy: "open"
    },
    discord: {
      accounts: ["my-bot-token"],
      guilds: ["123456789"]
    }
  },

  // 代理綁定
  bindings: [
    {
      agent: "main",
      channel: "whatsapp",
      isDefault: true
    },
    {
      agent: "support",
      channel: "telegram",
      peer: "@customer1"
    }
  ],

  // 排程任務
  cron: [
    {
      id: "daily-report",
      schedule: "0 9 * * *",
      agent: "main",
      message: "請生成今日報告"
    }
  ],

  // 外掛
  plugins: [
    {
      name: "matrix",
      enabled: true,
      config: {}
    }
  ],

  // 閘道設定
  gateway: {
    mode: "local",
    port: 18789,
    auth: {
      token: "your-secure-token"
    }
  },

  // 安全設定
  sandbox: {
    enabled: false,
    workspaceRoot: "~/.openclaw/sandboxes"
  },

  approvals: {
    exec: {
      requireApproval: true,
      autoApprove: ["git status", "ls"]
    }
  }
}
```

### 7.3 環境變數

| 變數 | 說明 |
|------|------|
| `OPENCLAW_CONFIG` | 配置檔路徑覆蓋 |
| `OPENCLAW_GATEWAY_TOKEN` | 閘道認證 Token |
| `OPENCLAW_PROFILE` | 設定檔名稱 |
| `OPENCLAW_SKIP_CHANNELS` | 跳過頻道載入 |
| `ANTHROPIC_API_KEY` | Anthropic API 金鑰 |
| `OPENAI_API_KEY` | OpenAI API 金鑰 |

### 7.4 配置驗證

使用 **Zod** 進行執行時 Schema 驗證：

```typescript
// src/config/zod-schema.ts
const configSchema = z.object({
  agentDefaults: agentDefaultsSchema.optional(),
  auth: authSchema.optional(),
  channels: channelsSchema.optional(),
  // ...
});
```

---

## 8. 媒體管線

### 8.1 架構

**位置**: `src/media/`

| 元件 | 功能 |
|------|------|
| `fetch.ts` | 從 URL 下載媒體 |
| `input-files.ts` | 解析檔案輸入、大小驗證 |
| `mime.ts` | MIME 類型偵測與驗證 |
| `parse.ts` | 解析媒體元資料 |
| `image-ops.ts` | 圖片縮放/裁切/轉換 |
| `store.ts` | 持久化儲存與暫存清理 |
| `server.ts` | 媒體 HTTP 伺服器 |

### 8.2 支援格式

| 類型 | 格式 |
|------|------|
| 圖片 | JPEG, PNG, WebP, GIF, BMP |
| 音訊 | MP3, WAV, OGG, M4A |
| 影片 | MP4, WebM, MOV |
| 文件 | PDF |

### 8.3 處理流程

```
接收媒體
  → MIME 類型偵測
  → 大小驗證 (依頻道限制)
  → 格式轉換 (如需要)
  → 圖片縮放 (如超限)
  → 暫存儲存
  → 提供 HTTP URL
  → 定時清理 (TTL)
```

### 8.4 圖片操作

```typescript
// 使用 Sharp 進行圖片處理
await sharp(inputBuffer)
  .resize(maxWidth, maxHeight, { fit: 'inside' })
  .jpeg({ quality: 85 })
  .toBuffer();
```

---

## 9. 安全機制

### 9.1 DM 安全策略

| 策略 | 行為 |
|------|------|
| `pairing` (預設) | 未知發送者收到配對碼 |
| `allowlist` | 僅允許白名單對象 |
| `open` | 允許所有私訊 |
| `disabled` | 不處理私訊 |

### 9.2 核准系統

**位置**: `src/gateway/exec-approval-manager.ts`

#### 核准類型

| 工具 | 行為 |
|------|------|
| `exec` | Shell 命令需要核准 |
| `write` | 檔案寫入可設定核准 |
| `browser` | 瀏覽器操作可設定核准 |

#### 自動核准規則

```json5
{
  approvals: {
    exec: {
      requireApproval: true,
      autoApprove: [
        "git status",
        "git log",
        "ls",
        "cat"
      ]
    }
  }
}
```

### 9.3 沙箱模式

```json5
{
  sandbox: {
    enabled: true,
    workspaceRoot: "~/.openclaw/sandboxes",
    // Docker 容器隔離
    docker: {
      image: "openclaw-sandbox:latest",
      networkPolicy: "none"
    }
  }
}
```

### 9.4 認證與授權

#### Gateway Token

```bash
# 設定認證 Token
export OPENCLAW_GATEWAY_TOKEN="your-secure-token"

# 或在配置中
gateway:
  auth:
    token: "your-secure-token"
```

#### 裝置配對

- 新裝置 ID 需要配對核准
- 本地連線 (loopback) 可自動核准
- 非本地連線需簽署 challenge nonce

### 9.5 憑證儲存

```
~/.openclaw/credentials/
├── whatsapp/
│   └── session.json
├── telegram/
│   └── bot-tokens.json
├── discord/
│   └── tokens.json
└── ...
```

---

## 10. CLI 命令參考

### 10.1 核心命令

#### 初始化與設定

```bash
# 引導式設定
openclaw onboard

# 快速設定
openclaw setup

# 配置管理
openclaw config set <key> <value>
openclaw config get <key>
openclaw config list
openclaw configure  # 互動式配置
```

#### 閘道操作

```bash
# 啟動閘道
openclaw gateway run [--bind <host>] [--port <port>]

# 重啟閘道
openclaw gateway restart

# 停止閘道
openclaw gateway stop
```

#### 狀態與健康

```bash
# 查看狀態
openclaw status [--all] [--deep] [--json]

# 健康檢查
openclaw health [--json]

# 會話列表
openclaw sessions [--active]
```

### 10.2 代理命令

```bash
# 運行代理
openclaw agent [--message <msg>] [--model <model>] [--thinking <level>]

# 列出代理
openclaw agents list [--bindings]

# 代理訊息
openclaw agent --message "你好" --model anthropic/claude-opus-4-5-20251101
```

### 10.3 訊息命令

```bash
# 發送訊息
openclaw message send --channel <channel> --to <recipient> --text <message>

# 範例
openclaw message send --channel whatsapp --to "+1234567890" --text "Hello!"
openclaw message send --channel telegram --to "@username" --text "Hi!"
```

### 10.4 頻道管理

```bash
# 列出頻道
openclaw channels list

# 頻道狀態
openclaw channels status [--probe]

# 登入頻道
openclaw channels login --channel <channel>

# 登出頻道
openclaw channels logout --channel <channel>
```

### 10.5 維護命令

```bash
# 診斷問題
openclaw doctor

# 更新
openclaw update [--channel <stable|beta|dev>]

# 解除安裝
openclaw uninstall

# 重置
openclaw reset [--all]
```

### 10.6 進階命令

```bash
# 配對管理
openclaw pairing list
openclaw pairing create
openclaw pairing revoke <code>

# 記憶管理
openclaw memory status [--agent <id>]
openclaw memory clear [--agent <id>]

# 排程任務
openclaw cron list
openclaw cron trigger <id>

# 外掛管理
openclaw plugins list
openclaw plugins enable <name>
openclaw plugins disable <name>
```

---

## 11. 原生應用程式

### 11.1 macOS 應用程式

**位置**: `apps/macos/`

#### 功能

- 選單列常駐圖示
- Gateway 自動啟動/管理
- 系統通知整合
- 快捷鍵支援
- 偏好設定介面

#### 技術棧

- SwiftUI
- Observation 框架 (`@Observable`, `@Bindable`)
- AppKit 整合

#### 封裝

```bash
# 開發版封裝
scripts/package-mac-app.sh

# 產出
dist/OpenClaw.app
```

### 11.2 iOS 應用程式

**位置**: `apps/ios/`

#### 功能

- 行動節點功能
- 相機存取
- 位置存取
- 推送通知
- 背景處理

#### 技術棧

- SwiftUI
- XcodeGen 專案生成
- OpenClawKit 共用框架

#### 建置

```bash
# 生成專案
pnpm ios:gen

# 建置
pnpm ios:build

# 運行
pnpm ios:run
```

### 11.3 Android 應用程式

**位置**: `apps/android/`

#### 功能

- 行動節點功能
- 相機存取
- 位置存取
- 前景服務

#### 技術棧

- Kotlin
- Jetpack Compose
- Gradle (Kotlin DSL)

#### 建置

```bash
# 組建 Debug
pnpm android:assemble

# 安裝
pnpm android:install

# 運行
pnpm android:run
```

### 11.4 Control UI (Web 介面)

**位置**: `ui/`

#### 功能

- 即時狀態監控
- 會話管理
- 頻道設定
- 代理互動

#### 技術棧

- Lit (Web Components)
- Lit Context
- Lit Signals
- Rolldown 打包

#### 開發

```bash
# 開發模式
pnpm ui:dev

# 建置
pnpm ui:build
```

---

## 12. 測試框架

### 12.1 測試配置

**框架**: Vitest + V8 覆蓋率

```typescript
// vitest.config.ts
coverage: {
  provider: "v8",
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70
  }
}
```

### 12.2 測試類型

| 類型 | 模式 | 命令 |
|------|------|------|
| 單元測試 | `*.test.ts` | `pnpm test` |
| E2E 測試 | `*.e2e.test.ts` | `pnpm test:e2e` |
| 即時測試 | 需要 API 金鑰 | `LIVE=1 pnpm test:live` |
| Docker 測試 | 容器化測試 | `pnpm test:docker:all` |

### 12.3 測試命令

```bash
# 運行所有測試
pnpm test

# 覆蓋率報告
pnpm test:coverage

# 監視模式
pnpm test:watch

# 特定測試
pnpm test <pattern>

# Docker 測試套件
pnpm test:docker:live-models
pnpm test:docker:live-gateway
pnpm test:docker:onboard
```

### 12.4 CI/CD 整合

- Pre-commit hooks: `prek install`
- 型別檢查: `pnpm build`
- Lint/格式化: `pnpm lint`
- 完整驗證: `pnpm test:all`

---

## 13. 技術堆疊

### 13.1 運行環境

| 技術 | 版本 | 用途 |
|------|------|------|
| Node.js | ≥22.12.0 | 執行環境 |
| TypeScript | ^5.9.3 | 主要語言 |
| pnpm | 10.23.0 | 套件管理 |
| Bun | (支援) | 開發執行 |

### 13.2 核心依賴

#### AI & 模型整合

| 套件 | 版本 | 用途 |
|------|------|------|
| `@mariozechner/pi-agent-core` | 0.50.7 | Pi 代理運行時 |
| `@mariozechner/pi-ai` | 0.50.7 | 模型管理 |
| `@aws-sdk/client-bedrock` | ^3.980.0 | AWS Bedrock |

#### 頻道 SDK

| 套件 | 版本 | 頻道 |
|------|------|------|
| `@whiskeysockets/baileys` | 7.0.0-rc.9 | WhatsApp |
| `grammy` | ^1.39.3 | Telegram |
| `@slack/bolt` | ^4.6.0 | Slack |
| `discord-api-types` | ^0.38.38 | Discord |
| `@line/bot-sdk` | ^10.6.0 | LINE |
| `signal-utils` | ^0.21.1 | Signal |

#### 基礎設施

| 套件 | 用途 |
|------|------|
| `commander` | CLI 解析 |
| `express` | HTTP 伺服器 |
| `ws` | WebSocket |
| `chalk` | 終端顏色 |
| `@clack/prompts` | 互動式提示 |
| `chokidar` | 檔案監視 |

#### 資料處理

| 套件 | 用途 |
|------|------|
| `sqlite-vec` | 向量儲存 |
| `sharp` | 圖片處理 |
| `pdfjs-dist` | PDF 解析 |
| `linkedom` | DOM 解析 |
| `markdown-it` | Markdown 解析 |

#### 類型系統

| 套件 | 用途 |
|------|------|
| `@sinclair/typebox` | JSON Schema 生成 |
| `zod` | 執行時驗證 |

### 13.3 開發依賴

| 套件 | 用途 |
|------|------|
| `vitest` | 測試框架 |
| `@vitest/coverage-v8` | 覆蓋率 |
| `oxlint` | Lint |
| `oxfmt` | 格式化 |
| `tsx` | TypeScript 執行 |
| `rolldown` | 打包工具 |

### 13.4 目錄結構

```
openclaw/
├── src/                    # 主要原始碼
│   ├── agents/             # 代理系統
│   ├── channels/           # 頻道抽象層
│   ├── cli/                # CLI 程式
│   ├── commands/           # CLI 命令實作
│   ├── config/             # 配置系統
│   ├── discord/            # Discord 整合
│   ├── gateway/            # 閘道核心
│   ├── hooks/              # Hook 系統
│   ├── imessage/           # iMessage 整合
│   ├── infra/              # 基礎設施
│   ├── line/               # LINE 整合
│   ├── media/              # 媒體管線
│   ├── plugins/            # 外掛系統
│   ├── plugin-sdk/         # 外掛 SDK
│   ├── routing/            # 訊息路由
│   ├── signal/             # Signal 整合
│   ├── slack/              # Slack 整合
│   ├── telegram/           # Telegram 整合
│   ├── terminal/           # 終端工具
│   ├── web/                # Web 頻道
│   └── whatsapp/           # WhatsApp 整合
├── extensions/             # 擴展外掛
│   ├── bluebubbles/
│   ├── matrix/
│   ├── msteams/
│   ├── voice-call/
│   └── ...
├── apps/                   # 原生應用程式
│   ├── macos/
│   ├── ios/
│   └── android/
├── ui/                     # Control UI
├── docs/                   # 文件 (Mintlify)
├── scripts/                # 建置腳本
├── skills/                 # 捆綁技能
└── dist/                   # 編譯輸出
```

---

## 14. 未來發展

### 14.1 規劃中的功能

| 功能 | 優先級 | 說明 |
|------|--------|------|
| 多租戶支援 | 高 | 企業級隔離 |
| 端對端加密 | 高 | 訊息加密 |
| 語音通話整合 | 中 | VoIP 深度整合 |
| 視訊通話支援 | 中 | 視訊會議整合 |
| 分析儀表板 | 中 | 使用統計與分析 |
| 自訂工作流程 | 低 | 視覺化工作流程編輯器 |

### 14.2 已知限制

1. **單一閘道**: 每個主機只能運行一個 Gateway
2. **WhatsApp 會話**: 單一 Baileys 會話限制
3. **Bun 相容性**: Gateway 不建議使用 Bun (WhatsApp/Telegram bugs)
4. **Windows 支援**: 部分功能可能受限

### 14.3 版本發布週期

| 頻道 | 說明 | npm dist-tag |
|------|------|--------------|
| `stable` | 標記發布版 (vYYYY.M.D) | `latest` |
| `beta` | 預發布版 (vYYYY.M.D-beta.N) | `beta` |
| `dev` | main 分支 (開發中) | - |

---

## 附錄

### A. 快速開始

```bash
# 1. 安裝
curl -fsSL https://openclaw.bot/install.sh | bash

# 2. 初始化
openclaw onboard

# 3. 啟動閘道
openclaw gateway run

# 4. 檢查狀態
openclaw status
```

### B. 故障排除

```bash
# 診斷工具
openclaw doctor

# 重置配置
openclaw reset

# 查看日誌
tail -f /tmp/openclaw-gateway.log
```

### C. 參考連結

- **文件**: https://docs.openclaw.ai
- **GitHub**: https://github.com/openclaw/openclaw
- **問題回報**: https://github.com/openclaw/openclaw/issues

---

**文件結束**

*本 PRD 基於 OpenClaw v2026.1.30 版本撰寫*
