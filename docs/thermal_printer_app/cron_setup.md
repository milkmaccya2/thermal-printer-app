
## 5. モーニング・ブリーフィングの自動化設定 (Cron)

毎朝自動的に天気とカレンダーを印刷するための設定です。
この機能は `scripts/fetch_weather_image.ts` (画像取得) と `scripts/print_briefing.ts` (印刷) の2つのスクリプトを順次実行することで動作します。


### 5-0. Puppeteer (Chrome) のセットアップ

Raspberry Pi (ARM64) では、Puppeteerが自動ダウンロードするChrome (x64) は動作しません。
代わりにシステムのChromiumブラウザをインストールして使用します。

```bash
# Raspberry Pi上で実行
sudo apt update
sudo apt install -y chromium
```

※ スクリプトは自動的に `/usr/bin/chromium-browser` を検出して使用するように設定されています。

### 5-1. 動作確認

Raspberry Pi上で以下のコマンドを実行し、エラーが出ないことを確認してください。

```bash
# プロジェクトディレクトリに移動
cd ~/git/thermal-printer-app

# 1. 天気画像の取得
npx tsx scripts/fetch_weather_image.ts

# 2. 印刷 (サーバーが起動している必要があります: `pnpm exec pm2 start ecosystem.config.cjs`)
npx tsx scripts/print_briefing.ts
```

### 5-2. Cronジョブの登録

毎朝 7:00 に実行する例です。

1. **crontab の編集**
   ```bash
   crontab -e
   ```

2. **設定の追記**
   ファイルの末尾に以下を追加します。（パスは環境に合わせて変更してください）
   
   ```cron
   # Morning Briefing: Fetch weather and print briefing at 7:00 AM
   0 7 * * * cd /home/milkmaccya/git/thermal-printer-app && /home/milkmaccya/.nvm/versions/node/v22.12.0/bin/node /home/milkmaccya/git/thermal-printer-app/node_modules/.bin/tsx scripts/fetch_weather_image.ts && /home/milkmaccya/.nvm/versions/node/v22.12.0/bin/node /home/milkmaccya/git/thermal-printer-app/node_modules/.bin/tsx scripts/print_briefing.ts >> /home/milkmaccya/git/thermal-printer-app/cron.log 2>&1
   ```

   **注意点:**
   - Cron環境では `PATH` が通っていないため、`node` や `tsx` は**絶対パス**で指定することを強く推奨します。
   - `which node` でNodeのパスを確認できます。
   - Puppeteer (Chrome) を動かすため、GUI環境またはXvfb等が必要な場合がありますが、`--headless` モードを使用しているため通常はそのまま動作します。

### 5-3. タイムゾーンの確認

Raspberry Piのタイムゾーンが日本時間 (JST) になっているか確認してください。

```bash
date
# 出力が "Sat Jan 24 07:00:00 JST 2026" のようになっていればOK
```

なっていない場合は設定します:
```bash
sudo raspi-config
# 5 Localization Options -> L2 Timezone -> Asia -> Tokyo
```
