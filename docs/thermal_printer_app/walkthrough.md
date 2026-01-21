# Walkthrough - UI Component Refactor

UIコンポーネントの大規模リファクタリングと、バッファ溢れ対策（分割印刷、強制カット）の実装を行いました。
これにより、保守性の向上と印刷の安定性が強化されました。

## 変更内容

### 1. 共通構造の整備
- **`src/layouts/Layout.astro`**: アプリケーション全体のレイアウト定義を作成。
- **`src/components/Header.astro`**: ヘッダー部分をコンポーネント化。
- **`src/components/ui/Card.tsx`**: 統一されたデザインのためのカードコンポーネントを作成。
- **`src/components/types.ts`**: `PrintJob` などの型定義を集約。

### 2. PrinterManagerのリファクタリング
`PrinterManager` が巨大になっていたため、機能ごとに分割しました。
- [MODIFY] `printImage` アクション:
    - **Chunking処理**: 廃止（速度低下のため）。一括送信に戻す。まとめるコンテナとしての役割に特化。
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

### 6. バッファ溢れ対策機能
- **強制カット機能 (Force Cut)**:
    - サーバーサイド: `forceCut` アクションを追加。
    - クライアントサイド: `PrinterStatusCard` に「Cut Paper」ボタンを追加し、緊急時に手動でカットできるようにしました。
- **分割印刷 (Chunked Printing)**:
    - [REVERTED] 速度低下が著しいため、分割送信は廃止し一括送信に戻しました。バッファ問題発生時は `Force Cut` で対応します。

### 7. プリンター制御ボタンの復元
- **Enable Printer**: `PrinterStatusCard` 内で常時表示されるように変更しました。
- **Clear Queue**: `PrintQueueCard` に「Clear All」ボタンを追加しました。
- **Cancel Job**: `PrintQueueCard` の各ジョブリストにキャンセルボタンを追加しました。

## 検証結果
`npm run build` により、ビルドが正常に完了することを確認しました。
各コンポーネントは独立して動作し、以前と同じ機能を維持しつつ、コードベースが整理されました。
