
## 5. モーニング・ブリーフィングの自動化設定 (Cron)

毎朝7:00に自動的に天気とカレンダーを印刷するための設定です。
実行を簡単にするために、専用のラッパースクリプト `scripts/run_daily_briefing.sh` を用意しました。

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

# 権限の付与
chmod +x scripts/run_daily_briefing.sh

# 手動実行
./scripts/run_daily_briefing.sh
```

### 5-2. Cronジョブの登録

毎朝 7:00 に実行する設定です。

1. **crontab の編集**
   ```bash
   crontab -e
   ```

2. **設定の追記**
   ファイルの末尾に以下を追加します。（パスは環境に合わせて変更してください）
   
   ```cron
   # Morning Briefing: Run daily briefing script at 7:00 AM
   0 7 * * * /home/milkmaccya/git/thermal-printer-app/scripts/run_daily_briefing.sh >> /home/milkmaccya/git/thermal-printer-app/cron.log 2>&1
   ```

   **メリット:**
   - 複雑なパス指定が不要になります。
   - スクリプト内で `NVM` の読み込みやディレクトリ移動を自動で行います。
   - `cron.log` に詳細な実行ログが残ります。

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
