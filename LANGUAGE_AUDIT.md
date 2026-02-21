# Language Audit Report: Chinese Text in Codebase

> Generated: 2026-02-21
> Scope: Full repository scan for Chinese characters (Unicode \u4e00-\u9fff)

---

## Executive Summary

This audit maps every location where Chinese text appears in the codebase. The findings fall into **6 categories**, ordered by refactor priority:

| Category | File Count | Priority | Action Required |
|----------|-----------|----------|-----------------|
| System role prompts (builtin tools) | 3 | **HIGH** | Rewrite examples to English |
| Source code (resources.ts) | 1 | **LOW** | Keep as-is (language labels) |
| Locale JSON files (zh-CN, zh-TW) | 82+ | **NONE** | Intentional translations |
| Locale JSON files (ja-JP, ko-KR) | 82+ | **NONE** | Intentional translations |
| Chinese README / docs | ~10 | **MEDIUM** | Remove or keep as secondary |
| Test fixtures / snapshots | ~180 | **LOW** | Leave as test data |

---

## Category 1: System Role Prompts (HIGH PRIORITY)

These are the primary files where Chinese is embedded in production prompt logic — not in locale files, but in hardcoded system prompts sent to AI models.

### 1.1 `packages/builtin-tool-agent-builder/src/systemRole.ts`

**23 lines of Chinese.** This is the most impacted file.

**Chinese in translation reference table (lines 64-76):**
```
| systemRole | System Prompt | 系统提示词 |
| openingMessage | Opening Message | 开场白 |
| openingQuestions | Suggested Questions | 开场问题 |
| historyCount | Context History Limit | 上下文消息数 |
| enableHistoryCount | Limit Context History | 限制上下文 |
| enableCompressHistory | Compress Long History | 压缩长对话 |
| enableStreaming | Stream Responses | 流式输出 |
| enableReasoning | Reasoning Mode | 推理模式 |
| temperature | Creativity Level | 创意度 |
| top_p | Sampling Range | 采样范围 |
| frequency_penalty | Reduce Repetition | 减少重复 |
| presence_penalty | Topic Diversity | 话题多样性 |
| autoCreateTopicThreshold | Auto-topic Threshold | 自动话题阈值 |
```

**Chinese in example dialogues (lines 148-222):**
```
User: "帮我创建一个代码助手"        → "Help me create a code assistant"
User: "帮我把模型改成 Claude"       → "Help me switch the model to Claude"
User: "告诉我现在的配置"            → "Tell me the current configuration"
User: "帮我修改一下提示词..."        → "Help me modify the prompt to be friendlier"
User: "帮我找一些开发相关的插件"     → "Help me find development-related plugins"
User: "帮我连接 Twitter"            → "Help me connect Twitter"
User: "帮我设置开场白"              → "Help me set the opening message"
User: "帮我配置开场问题"            → "Help me configure opening questions"
User: "帮我设置 temperature 为 0.7" → "Help me set temperature to 0.7"
User: "我想调整对话配置"            → "I want to adjust conversation settings"
User: "帮我安装网页浏览和图片生成..."→ "Help me install web browsing and image generation plugins"
```

**Refactor action:** Replace the Chinese column in the reference table with a "Description" column. Replace all Chinese example dialogues with English equivalents.

---

### 1.2 `packages/builtin-tool-cloud-sandbox/src/systemRole.ts`

**8 lines of Chinese.** Mixed into a multilingual detection system.

**Line 122 — Creation intent keywords in Chinese:**
```
Chinese: "创建", "生成", "制作", "导出", "下载", "保存", "转换", "帮我做/写/画", "我要/需要一个"
```

**Lines 125-126 — Execution-only intent detection:**
```
User explicitly says "just run it" / "帮我跑一下" / "run this" / "execute only"
User says "don't export" / "不用导出" / "just check" / "只是看看"
```

**Lines 199-200 — PDF font registration instructions:**
```
1. Register the Chinese font: `pdfmetrics.registerFont(TTFont('STSong', 'STSong.ttf'))`
2. Apply the 'STSong' font style to all text elements containing Chinese characters
```

**Refactor action:** Remove Chinese keyword detection (or replace with English equivalents). Keep CJK font instructions if CJK support is needed, but note them as optional/localized.

---

### 1.3 `packages/builtin-agents/src/agents/agent-builder/systemRole.ts`

**1 line of Chinese.**

**Line 85:**
```
User: "帮我把模型改成 Claude" → "Help me switch the model to Claude"
```

**Refactor action:** Replace with English equivalent.

---

## Category 2: Source Code Labels (LOW PRIORITY — KEEP)

### 2.1 `src/locales/resources.ts`

**Lines 58-62:**
```typescript
{ label: '简体中文', value: 'zh-CN' },
{ label: '繁體中文', value: 'zh-TW' },
```

Also contains native-language labels for Japanese (日本語), Korean (한국어), Arabic (العربية), etc.

**Recommendation: DO NOT CHANGE.** These are language-selector labels displayed in the user's own language — an i18n standard practice. Users selecting "Chinese" should see "简体中文", not "Simplified Chinese." This is identical to how macOS, Windows, Chrome, and every other product handles language pickers.

---

## Category 3: Locale JSON Files (NO ACTION — INTENTIONAL)

### Structure

```
locales/
├── en-US/          # 41 JSON files — English translations (primary)
├── zh-CN/          # 41 JSON files — Simplified Chinese translations
├── zh-TW/          # 41 JSON files — Traditional Chinese translations
├── ja-JP/          # 41 JSON files — Japanese translations
├── ko-KR/          # 41 JSON files — Korean translations
├── de-DE/          # ... German
├── fr-FR/          # ... French
├── es-ES/          # ... Spanish
├── it-IT/          # ... Italian
├── pt-BR/          # ... Portuguese
├── ru-RU/          # ... Russian
├── tr-TR/          # ... Turkish
├── vi-VN/          # ... Vietnamese
├── pl-PL/          # ... Polish
├── nl-NL/          # ... Dutch
├── bg-BG/          # ... Bulgarian
├── ar/             # ... Arabic
└── fa-IR/          # ... Persian
```

Desktop app locales at `apps/desktop/resources/locales/` follow the same structure.

**Recommendation: DO NOT CHANGE.** These are the i18n translation files. They exist to serve users in those languages. The `en-US/` files are the source of truth; other locales are translations.

### Decision Point: Remove Non-English Locales?

If this fork is English-only, you **could** remove all locale directories except `en-US/`. This would:
- Reduce repo size
- Simplify maintenance (no translation sync needed)
- Break the app for non-English users

**If you want to keep multi-language support:** leave these files entirely.
**If you want English-only:** delete all locale directories except `en-US/` and update `src/locales/resources.ts` to only list `en-US`.

---

## Category 4: Chinese Documentation Files (MEDIUM PRIORITY)

### Files

| File | Description |
|------|-------------|
| `README.zh-CN.md` | Full Chinese README (mirror of README.md) |
| `README.md` line 11 | Link: `[简体中文](./README.zh-CN.md)` |
| `packages/electron-client-ipc/README.zh-CN.md` | Package-level Chinese docs |
| `packages/electron-server-ipc/README.zh-CN.md` | Package-level Chinese docs |
| `packages/file-loaders/README.zh-CN.md` | Package-level Chinese docs |
| `packages/web-crawler/README.zh-CN.md` | Package-level Chinese docs |
| `apps/desktop/README.zh-CN.md` | Desktop app Chinese docs |
| `docs/glossary.zh-CN.md` | Chinese terminology glossary |
| `docs/wiki/HOME.zh-CN.md` | Wiki home in Chinese |
| `changelog/CHANGELOG.v0.md` | Some Chinese in older changelog |
| `changelog/CHANGELOG.v1.md` | Some Chinese in older changelog |

**Refactor action options:**
1. **Delete all `*.zh-CN.md` files** — simplest, no Chinese docs in fork
2. **Keep but don't maintain** — they'll drift from English docs over time
3. **Leave as-is** — if Chinese-speaking contributors are expected

---

## Category 5: Test Fixtures and Snapshots (LOW PRIORITY)

~180 test files contain Chinese text as test data. These are in:

- `src/**/__tests__/**` — Unit test fixtures
- `packages/database/src/repositories/**/__tests__/fixtures/` — DB import/export test data
- `packages/conversation-flow/src/__tests__/fixtures/` — Conversation flow fixtures
- `packages/prompts/src/**/__tests__/` — Prompt chain tests
- `packages/model-runtime/src/**/__tests__/` — Model runtime tests
- `packages/utils/src/detectChinese.test.ts` — Chinese detection utility tests

**Recommendation:** Leave these alone. Test data should test real-world scenarios, which includes non-English text. The `detectChinese` utility and its tests serve a legitimate purpose (CJK font detection for PDF generation, etc.).

---

## Category 6: `.agents/skills/` Documentation

Several skill files in `.agents/skills/` reference Chinese in their guidelines:

- `.agents/skills/i18n/SKILL.md` — References zh-CN locale workflow
- `.agents/skills/microcopy/SKILL.md` — Contains Chinese/English microcopy guidelines

**Recommendation:** Update these to be English-focused if the fork is English-only. If multi-language, keep as-is.

---

## Summary: What Needs to Change

### Must Change (Production Code with Chinese)
| File | Lines | Change |
|------|-------|--------|
| `packages/builtin-tool-agent-builder/src/systemRole.ts` | 64-76, 148-222 | Replace Chinese examples/table with English |
| `packages/builtin-tool-cloud-sandbox/src/systemRole.ts` | 122, 125-126, 199-200 | Replace Chinese keywords with English |
| `packages/builtin-agents/src/agents/agent-builder/systemRole.ts` | 85 | Replace Chinese example with English |

### Should Decide (Fork Strategy)
| Item | Options |
|------|---------|
| Chinese README files (*.zh-CN.md) | Delete / Keep / Ignore |
| Non-English locale directories | Delete all non-en-US / Keep all / Keep subset |
| Chinese changelog entries | Leave as historical / Remove |
| Agent skill docs with Chinese refs | Update to English-only / Keep |

### Do Not Change
| Item | Reason |
|------|--------|
| `src/locales/resources.ts` language labels | i18n standard — labels in native script |
| `locales/zh-CN/*.json` and other locales | Intentional translation files |
| Test fixtures with Chinese data | Legitimate test coverage |
| `packages/utils/src/detectChinese.test.ts` | Tests a real utility function |

---

## Recommended Refactor Order

1. **System role prompts** (3 files, ~32 lines) — immediate, high impact
2. **Documentation files** (delete or update *.zh-CN.md) — quick cleanup
3. **Skill docs** (update .agents/skills/ references) — if English-only fork
4. **Locale decision** — architectural choice, discuss before acting
