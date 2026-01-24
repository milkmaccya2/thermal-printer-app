# 実装計画: Astro活用型 モーニング・ブリーフィング

ユーザーの要望に基づき、Astroの機能を最大限活用したアーキテクチャに変更します。
UI構築とデータ統合はAstro担当、スクリプトは「素材集め」と「最終出力」に特化させます。

## アーキテクチャ

1.  **Weather Scraper (定期実行)**
    *   以前作成したスクリプトを改修し、印刷せず **`public/images/weather-today.png` に画像を保存する** 機能に特化させます。
2.  **Astro Dashboard (`/briefing`)**
    *   Astroページとして実装。
    *   **表示内容**:
        *   保存された天気画像 (`<img src="/images/weather-today.png" />`)
        *   Google Calendarから取得した「今日の予定」 (Astro Server Island または Server Side Rendering で取得)
    *   CSS (Tailwind) で印刷用にデザインを調整。
3.  **Printer Script (定期実行/トリガー)**
    *   Puppeteerで `http://localhost:4321/briefing` を開き、画面全体をキャプチャ。
    *   サーマルプリンタへ出力。

## ユーザーレビューが必要な事項
- **Google認証**: サーバーサイドでCalendar APIを叩くため、`credentials.json` (Service Account または OAuth Client) の配置が必要です。

## 提案される変更

### 1. 天気スクリプトの改修
#### [MODIFY] [scripts/print_weather.ts](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/scripts/print_weather.ts)
- ファイル名を `scripts/fetch_weather_image.ts` に変更（推奨）
- 印刷ロジックを削除（またはオプション化）
- 保存先を `public/weather-today.png` に固定

### 2. Astroページ作成
#### [NEW] [src/pages/briefing.astro](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/pages/briefing.astro)
- レイアウト: 縦長、幅576px (プリンタ幅に合わせる)
- コンポーネント: 天気画像表示、予定リスト表示

#### [NEW] [src/lib/googleCalendar.ts](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/utils/googleCalendar.ts)
- `googleapis` を使用して予定を取得するロジック

### 3. 印刷スクリプト
#### [NEW] [scripts/print_briefing.ts](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/scripts/print_briefing.ts)
- ターゲットURL: `http://localhost:4321/briefing`
- 処理: Capture -> Dither -> Print

### 依存関係
- `googleapis`
- `google-auth-library`

## 手順
1. `package.json` に依存関係追加
2. 天気スクリプトを修正して `public/` に保存するように変更
3. Google Calendar API 連携の実装 (まずはダミーデータでUI作成でも可)
4. `/briefing` ページの作成
5. 印刷スクリプトの作成

## 検証計画
- `npm run dev` 中に `scripts/fetch_weather_image.ts` を実行し、ファイルが生成されるか。
- `/briefing` にアクセスして天気と予定が表示されるか。
- `scripts/print_briefing.ts` で実機印刷。
