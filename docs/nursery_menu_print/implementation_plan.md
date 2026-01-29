# 保育園メニュー印刷機能 実装計画

## 概要
毎朝のcronジョブで印刷される「モーニング・ブリーフィング」(`briefing.astro`) に、保育園の「今日の献立」を追加します。提供された2026年2月のメニューデータを使用します。

## 提案される変更

### データレイヤー
#### [NEW] [menu-data.ts](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/data/menu-data.ts)
- 提供された `Menu` インターフェースと `februaryMenu` 配列を格納します。
- `getMenuForDate(date: Date): Menu | undefined` のようなヘルパー関数もここに含めると便利です。

### ページ
#### [MODIFY] [briefing.astro](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/pages/briefing.astro)
- `src/data/menu-data.ts` から今日のメニューを取得します。
- `SCHEDULE` セクションの下（または適切な場所）に `LUNCH MENU` セクションを追加します。
- メニューがある場合（平日など）、昼食（Details）、おやつ、カロリーを表示します。
- デザインは既存のブリーフィングページのスタイル（白黒、太枠、高コントラスト）に合わせます。

## 検証計画
### 手動検証
- ブラウザで `/briefing` にアクセスし、今日のメニューが表示されていることを確認します。
- 日付を変更し（コード内で一時的に日付をモックするなどして）、該当する日のメニューが正しく表示されるか確認します。
