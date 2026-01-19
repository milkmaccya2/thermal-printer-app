# 実装計画: Raspberry Pi サーマルプリンタ制御アプリ (Text & Image)

## フェーズ 1: アクションの再構築
- [x] `src/actions/index.ts` の修正
    - Puppeteer 関連コードの削除
    - `printText`: テキストを受け取り、一時ファイルに保存して `lp` 実行
    - `printImage`: Base64画像を受け取り、デコードして画像ファイル保存 -> `lp` 実行

## フェーズ 2: フロントエンド刷新
- [x] `src/components/TextPrinter.tsx` の作成
    - テキストエリアと印刷ボタン
- [x] `src/components/ImagePrinter.tsx` の作成
    - 画像アップロードUI (ドラッグ＆ドロップ対応推奨)
    - プレビュー表示
    - 印刷ボタン
- [x] `src/pages/index.astro` の更新
    - タブ切り替え、または並列配置で Text/Image プリンタを表示

## フェーズ 3: 不要ファイルのクリーンアップ
- [x] `ReceiptLayout.tsx`, `ReceiptEditor.tsx` などのレシート関連コードは削除またはアーカイブ

## フェーズ 4: デプロイ準備
- [x] ビルド確認
