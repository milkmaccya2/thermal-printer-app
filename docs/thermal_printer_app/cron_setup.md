
## 5. モーニング・ブリーフィングの自動化設定 (Cron)

システムの安定性を高めるため、**「データの取得（天気）」** と **「印刷」** を別々のジョブとして設定します。これにより、印刷時にデータ取得待ちが発生せず、スムーズに動作します。

### 5-0. Puppeteer (Chrome) のセットアップ

Raspberry Pi (ARM64) では、Puppeteerが自動ダウンロードするChrome (x64) は動作しません。
代わりにシステムのChromiumブラウザをインストールして使用します。

```bash
# Raspberry Pi上で実行
sudo apt update
sudo apt install -y chromium
```

### 5-1. 動作確認

Raspberry Pi上で以下のコマンドを実行し、エラーが出ないことを確認してください。

```bash
# プロジェクトディレクトリに移動
cd ~/git/thermal-printer-app
git pull

# 1. 天気画像の取得テスト
./scripts/cron_fetch_weather.sh
# -> public/images/weather-today.png が更新されます

# 2. 印刷テスト (サーバーが起動している必要があります)
./scripts/cron_print_briefing.sh
# -> プリンタから出力されます
```

### 5-2. Cronジョブの登録

以下の2つのジョブを登録します。

1. **Weather Fetcher**: 毎時実行（常に最新の予報画像をキャッシュ）
2. **Morning Printer**: 朝 7:00 に実行（キャッシュされた画像と最新のカレンダーで印刷）

**設定手順:**

1. **crontab の編集**
   ```bash
   crontab -e
   ```

2. **設定の追記**
   ファイルの末尾に以下を追加します。（パスは環境に合わせて変更してください）
   
   ```cron
   # Job 1: Fetch Weather Image (Daily at 6:50 AM)
   50 6 * * * /home/milkmaccya/git/thermal-printer-app/scripts/cron_fetch_weather.sh >> /home/milkmaccya/git/thermal-printer-app/cron_weather.log 2>&1

   # Job 2: Print Morning Briefing (Daily at 7:00 AM)
   0 7 * * * /home/milkmaccya/git/thermal-printer-app/scripts/cron_print_briefing.sh >> /home/milkmaccya/git/thermal-printer-app/cron_print.log 2>&1
   ```

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
