# メッセージデータ生成用LLMプロンプト（決定版）

## 🎯 革新的な一括生成システム

**手作業を完全排除**し、**一度のプロンプト実行で最終的にアプリに組み込める形式のJSONを直接生成**する究極のプロンプトです。

---

## 📋 使用方法

1. 以下の**【究極版】一括生成プロンプト**をLLM（ChatGPT、Gemini、Claude等）にコピー&ペースト
2. `[キャラクター資料をここに貼り付け]` 部分に友人Aの資料を挿入
3. **一度実行するだけで310件のメッセージデータが完成**
4. 生成されたJSONを `src/data/messages.json` として保存

---

## 🚀 【究極版】メッセージ一括生成プロンプト

```text
# 命令書

あなたはプロのシナリオライター兼データエンジニアです。以下のキャラクター資料と生成ルールに基づき、スマートフォンアプリで使用するメッセージデータセットを**単一のJSON配列**として生成してください。

---
## キャラクター資料

[キャラクター資料をここに貼り付け]

---
## 生成ルール

### 基本方針
- キャラクター資料を厳格に守り、一貫した口調・性格を保持
- 各メッセージは25-80文字以内で作成
- ユーザーの日常に自然に溶け込む温かい内容
- 毎日違うメッセージを受け取る喜びを演出

### 品質基準
- 不適切な表現の完全排除
- ポジティブで心温まる内容
- キャラクターのイメージを損なわない表現
- 飽きのこない多様性の確保

---
## 生成タスク一覧

以下の各タスクを順番に実行し、全体で一つのJSON配列として出力してください：

```json
[
  {"id_start": 1,   "count": 50, "content_theme": "朝の励ましメッセージ（6-10時）", "category_time": "morning", "category_day": "all", "category_season": "all", "category_special": null, "tags": ["greeting", "morning", "encouragement"]},
  
  {"id_start": 51,  "count": 30, "content_theme": "昼の気遣いメッセージ（11-16時）", "category_time": "afternoon", "category_day": "all", "category_season": "all", "category_special": null, "tags": ["care", "break", "afternoon"]},
  
  {"id_start": 81,  "count": 40, "content_theme": "夜の労いメッセージ（17-22時）", "category_time": "evening", "category_day": "all", "category_season": "all", "category_special": null, "tags": ["rest", "appreciation", "evening"]},
  
  {"id_start": 121, "count": 20, "content_theme": "深夜の心配メッセージ（23-5時）", "category_time": "late", "category_day": "all", "category_season": "all", "category_special": null, "tags": ["sleep", "health", "late"]},
  
  {"id_start": 141, "count": 25, "content_theme": "月曜日の憂鬱対策メッセージ", "category_time": "all", "category_day": "monday", "category_season": "all", "category_special": null, "tags": ["monday", "encouragement", "weekstart"]},
  
  {"id_start": 166, "count": 25, "content_theme": "金曜日の嬉しさメッセージ", "category_time": "all", "category_day": "friday", "category_season": "all", "category_special": null, "tags": ["friday", "weekend", "celebration"]},
  
  {"id_start": 191, "count": 30, "content_theme": "休日のリラックスメッセージ", "category_time": "all", "category_day": "weekend", "category_season": "all", "category_special": null, "tags": ["relax", "hobby", "weekend"]},
  
  {"id_start": 221, "count": 20, "content_theme": "春の季節感メッセージ（桜・新緑・暖かさ）", "category_time": "all", "category_day": "all", "category_season": "spring", "category_special": null, "tags": ["spring", "sakura", "nature"]},
  
  {"id_start": 241, "count": 20, "content_theme": "夏の季節感メッセージ（暑さ・海・夏祭り）", "category_time": "all", "category_day": "all", "category_season": "summer", "category_special": null, "tags": ["summer", "hot", "vacation"]},
  
  {"id_start": 261, "count": 20, "content_theme": "秋の季節感メッセージ（紅葉・読書・涼しさ）", "category_time": "all", "category_day": "all", "category_season": "autumn", "category_special": null, "tags": ["autumn", "reading", "nature"]},
  
  {"id_start": 281, "count": 20, "content_theme": "冬の季節感メッセージ（寒さ・雪・温かさ）", "category_time": "all", "category_day": "all", "category_season": "winter", "category_special": null, "tags": ["winter", "warm", "cozy"]},
  
  {"id_start": 301, "count": 10, "content_theme": "友人Aの誕生日お祝いメッセージ", "category_time": "all", "category_day": "all", "category_season": "all", "category_special": "birthday", "tags": ["birthday", "celebration", "gratitude"]}
]
```

---
## 出力形式

上記の12タスクを順番に実行し、以下の形式で**全体で一つのJSON配列**を生成してください：

```json
[
  {
    "id": 1,
    "content": "おはよう！今日も一日、あなたのペースで頑張ってね〜",
    "category_time": "morning",
    "category_day": "all",
    "category_season": "all",
    "category_special": null,
    "tags": ["greeting", "morning", "encouragement"]
  },
  {
    "id": 2,
    "content": "朝だよ〜！新しい一日の始まりだね。私も一緒に頑張るから！",
    "category_time": "morning",
    "category_day": "all",
    "category_season": "all",
    "category_special": null,
    "tags": ["greeting", "morning", "encouragement"]
  },
  {
    "id": 51,
    "content": "お疲れ様！お昼の時間だけど、ちゃんと休憩取ってる？",
    "category_time": "afternoon",
    "category_day": "all",
    "category_season": "all",
    "category_special": null,
    "tags": ["care", "break", "afternoon"]
  },
  {
    "id": 141,
    "content": "月曜日だけど、無理しないでね〜。一歩ずつ進めばいいよ！",
    "category_time": "all",
    "category_day": "monday",
    "category_season": "all",
    "category_special": null,
    "tags": ["monday", "encouragement", "weekstart"]
  },
  {
    "id": 301,
    "content": "今日は私の誕生日！一緒にお祝いしてくれてありがとう♪",
    "category_time": "all",
    "category_day": "all",
    "category_season": "all",
    "category_special": "birthday",
    "tags": ["birthday", "celebration", "gratitude"]
  }
]
```

### 重要な注意事項
1. **id番号は連続で振ること**（1から310まで）
2. **contentは各タスクのテーマに沿った内容にすること**
3. **category_*の値は指定されたもの以外使用禁止**
4. **tagsは内容に適した1-3個のキーワードを設定**
5. **キャラクター資料の口調・性格を全メッセージで一貫させること**

---
## 生成開始

上記の指示に従い、310件のメッセージを含む完全なJSON配列を生成してください。
```

---

## 🔧 生成後の作業手順

### ステップ1: データ保存
1. 生成されたJSONをコピー
2. `src/data/messages.json` として保存
3. JSON形式の正確性を確認

### ステップ2: 品質確認
```javascript
// 簡単な検証スクリプト
const messages = require('./src/data/messages.json');

console.log(`総メッセージ数: ${messages.length}`);
console.log(`ID重複チェック: ${new Set(messages.map(m => m.id)).size === messages.length}`);
console.log(`文字数チェック: ${messages.every(m => m.content.length >= 25 && m.content.length <= 80)}`);

// カテゴリ別集計
const timeCategories = {};
messages.forEach(m => {
    timeCategories[m.category_time] = (timeCategories[m.category_time] || 0) + 1;
});
console.log('時間帯別メッセージ数:', timeCategories);
```

### ステップ3: アプリ組み込み
- 生成されたJSONがそのままアプリで使用可能
- 追加の変換作業は不要
- `DatabaseService.js`が自動でデータベースに読み込み

---

## 📊 生成されるデータ構成

| カテゴリ | メッセージ数 | ID範囲 | 用途 |
|---------|------------|--------|------|
| 朝の時間帯 | 50件 | 1-50 | 起床・出勤時の励まし |
| 昼の時間帯 | 30件 | 51-80 | 休憩・昼食時の気遣い |
| 夜の時間帯 | 40件 | 81-120 | 帰宅・リラックス時の労い |
| 深夜の時間帯 | 20件 | 121-140 | 就寝前・夜更かし時の心配 |
| 月曜日特化 | 25件 | 141-165 | 週始めの憂鬱対策 |
| 金曜日特化 | 25件 | 166-190 | 週末前の嬉しさ表現 |
| 休日特化 | 30件 | 191-220 | 土日のリラックス提案 |
| 春の季節 | 20件 | 221-240 | 桜・新緑への言及 |
| 夏の季節 | 20件 | 241-260 | 暑さ・夏祭りへの言及 |
| 秋の季節 | 20件 | 261-280 | 紅葉・読書への言及 |
| 冬の季節 | 20件 | 281-300 | 寒さ・温かさへの言及 |
| 特別日 | 10件 | 301-310 | 誕生日等のお祝い |
| **合計** | **310件** | **1-310** | **一年間毎日違うメッセージ** |

---

## 💡 プロンプト使用のコツ

### LLM選択の推奨
- **ChatGPT**: 安定した品質、日本語自然
- **Claude**: 細かい指示への対応力
- **Gemini**: 大量データ生成に適している

### 生成時の注意点
- **キャラクター資料を詳細に**: 口調・性格の詳細な説明が重要
- **一度に全件生成**: 分割生成すると口調にブレが生じる可能性
- **生成後の確認**: 不適切な表現がないか必ずチェック

### トラブル対応
- **途中で生成停止**: 「続きを生成してください」で再開
- **JSON形式エラー**: オンラインJSONバリデーターで確認
- **文字数オーバー**: 該当メッセージを手動で調整

---

## 🎯 期待される効果

この究極プロンプトにより、以下を実現：

✅ **開発効率の劇的向上**（数日 → 数時間）  
✅ **人的ミスの完全排除**（手動作業なし）  
✅ **一貫した高品質データ**（同一LLMによる生成）  
✅ **即座にアプリ組み込み可能**（変換作業不要）  

---

**この決定版プロンプトにより、最高品質のメッセージデータセットを最短時間で作成し、ファンの皆様に最高の日常体験を提供できます。**