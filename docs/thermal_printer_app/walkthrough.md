# Walkthrough - UI Component Refactor

UIコンポーネントの大規模なリファクタリングを行いました。
これにより、各コンポーネントの責務が明確になり、再利用性と保守性が向上しました。

## 変更内容

### 1. 共通構造の整備
- **`src/layouts/Layout.astro`**: アプリケーション全体のレイアウト定義を作成。
- **`src/components/Header.astro`**: ヘッダー部分をコンポーネント化。
- **`src/components/ui/Card.tsx`**: 統一されたデザインのためのカードコンポーネントを作成。
- **`src/components/types.ts`**: `PrintJob` などの型定義を集約。

### 2. PrinterManagerのリファクタリング
`PrinterManager` が巨大になっていたため、機能ごとに分割しました。
- **`PrinterStatusCard.tsx`**: ステータス表示と「Enable Printer」ボタン。
- **`PrintQueueCard.tsx`**: 印刷キューのリスト表示。
- **`PrinterManager.tsx`**: 上記2つをまとめるコンテナとしての役割に特化。

### 3. ImagePrinterのリファクタリング
- **`ImageUploader.tsx`**: 画像のアップロード、エリア表示、プレビュー切り替えのロジックを分離。
- **`ImagePrinter.tsx`**: 印刷処理の制御に集中。

### 4. TextPrinterの更新
- **`TextPrinter.tsx`**: 新しい `Card` コンポーネントを使用するように更新。

### 5. ページ構造の更新
- **`src/pages/index.astro`**: 新しい `Layout` と `Header`、およびリファクタリングされたコンポーネントを使用するように書き換え。

## 検証結果
`npm run build` により、ビルドが正常に完了することを確認しました。
各コンポーネントは独立して動作し、以前と同じ機能を維持しつつ、コードベースが整理されました。
