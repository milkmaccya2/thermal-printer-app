# Weather Printing Walkthrough

Yahoo!天気の予報を自動的に印刷するためのスクリプトを実装し、動作確認を行いました。

## 実施内容

### 1. 依存関係の追加
- `puppeteer`: ヘッドレスブラウザによるスクリーンショット撮影用
- `scripts/print_weather.ts`: メインの印刷スクリプト

### 2. スクリプトの実装 (`scripts/print_weather.ts`)
- **ブラウザ操作**: Puppeteerで [Yahoo!天気ページ](https://weather.yahoo.co.jp/weather/jp/13/4410.html) にアクセス
- **予報取得**: `.forecastCity table tr > td:nth-child(1)` セレクタを使用して「今日」の予報部分のみを特定
- **画像処理**: `sharp` と既存のディザリングロジック (`applyFloydSteinberg`) を使用して、サーマルプリンタ (POS-80) 用の2値画像に変換
- **印刷**: 生成されたバイナリデータを `lp -o raw` コマンドでプリンタに送信

### 3. テスト結果
スクリプトを実行し、以下の結果を得ました：
- **プレビュー画像**: `docs/weather-preview.png` に保存されました。予報エリアが正しくキャプチャされているか確認できます。
- **印刷ジョブ**: Mac上の `lp` コマンドにより、「Printer_POS_80」へジョブが送信されました。

## 次のステップ
- 指定した時間（例: 朝7時）に自動実行するためのCronジョブの設定
