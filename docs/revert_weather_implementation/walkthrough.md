# 天気予報スクレイピング機能の復元

APIベースの実装を破棄し、当初のYahoo!天気・災害のスクリーンショットを取得する方法に戻しました。

## 実施した変更

### 1. スクレイピングスクリプトの復元
`scripts/fetch_weather_image.ts` を復元しました。
- Yahoo!天気（東京）のページをPuppeteerで開き、特定の要素をスクリーンショットとして保存します。
- `public/images/weather-today.png` に保存されます。
- 不要なコード（sharp, ESC/POS変換など）は削除し、単純化しました。

### 2. APIルートの復元
`src/pages/api/weather-image.ts` を復元しました。
- `public/images/weather-today.png` を読み込んでクライアントに返します。

### 3. UIの復元
`src/pages/briefing.astro` を修正しました。
- JMA API関連のコードを削除しました。
- `<img src="/api/weather-image?t=..." />` を使用して、スクレイピングした画像を表示するように戻しました。

### 4. 関連ファイルの整理
- 不要になった `src/utils/weather.ts` を削除しました。
- `scripts/cron_fetch_weather.sh` をスクレイピングスクリプトを実行するように戻しました。

## 動作確認

### 画像取得
スクリプトを実行し、正常に画像が保存されることを確認しました。

```bash
npx tsx scripts/fetch_weather_image.ts
```

出力:
```
🚀 Starting Weather Printer...
launching browser...
...
📸 Weather image saved to .../public/images/weather-today.png
Exit code: 0
```

これにより、以前と同じ「見たまま」の天気予報情報がMorning Briefingに表示されるようになります。
