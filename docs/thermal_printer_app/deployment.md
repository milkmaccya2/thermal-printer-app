# Raspberry Pi へのデプロイガイド

Macで開発し、Raspberry Piで本番稼働させるための推奨ワークフロー手順です。

## 概要

**Gitベースのデプロイ**を推奨します。
MacとRaspberry PiではCPUアーキテクチャやOSが異なるため、特に画像処理ライブラリ `sharp` などのネイティブ依存関係を含むプロジェクトでは、**Raspberry Pi上で依存関係のインストールとビルドを行うこと**が最も確実で安定的です。

**フロー:**
1. Mac: コードを書き、GitHub (GitLab等) にPush
2. Raspberry Pi: GitHubからPull
3. Raspberry Pi: 依存関係をインストール・ビルド・再起動

---

## 1. Raspberry Pi のセットアップ (初回のみ)

Raspberry PiにSSH接続し、必要なツールをインストールします。

### 1-1. nvm (Node Version Manager) と Node.js のインストール
`nvm` を使って Node.js をインストールします。これによりバージョンの切り替えが容易になります。

```bash
# nvm のインストール (バージョンは適宜最新を確認)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# シェル設定の再読み込み
source ~/.bashrc

# Node.js LTS版 (v22系など) をインストール
nvm install --lts

# インストール確認
node -v
npm -v
```

### 1-2. pnpm のインストール
```bash
# npm経由でpnpmをグローバルインストール
npm install -g pnpm
```

### 1-3. PM2 について
PM2 はプロジェクトの `devDependencies` に含まれているため、グローバルインストールの必要はありません。
プロジェクト内の PM2 を使用します。

### 1-4. CUPS (プリンタドライバ) の設定
すでに印刷できている場合はスキップしてください。
```bash
sudo apt-get install cups
sudo usermod -a -G lpadmin pi
# 必要に応じてプリンタドライバを入れる
```

---

## 2. デプロイ手順

### ステップ 1: Macで変更をコミット＆プッシュ
```bash
git add .
git commit -m "機能追加: キュー管理画面"
git push origin main
```

### ステップ 2: Raspberry Pi で更新を取り込む
Raspberry PiにSSH接続し、プロジェクトディレクトリで以下を実行します。

```bash
# プロジェクトディレクトリへ移動
cd ~/orbital-skylab  # ※実際のパスに合わせてください

# 最新コードを取得
git pull origin main

# 依存関係の更新 (sharp等がPi用にリビルドされます)
pnpm install

# 本番用ビルド
pnpm build

# ---- 初回起動時のみ ----
# PM2にアプリを登録して起動
pnpm exec pm2 start ecosystem.config.cjs

# サーバー再起動時も自動起動するように設定（表示されるコマンドを実行）
pnpm exec pm2 startup
pnpm exec pm2 save
# ----------------------

# ---- 2回目以降の更新 ----
pnpm exec pm2 restart thermal-printer-app
# ----------------------
```

---

## 3. デプロイの自動化（推奨）

`package.json` にデプロイ用のスクリプトが設定されています。
Macのターミナルから以下のコマンドを実行するだけで、`deploy.sh` が実行され、Git Pull, 依存関係インストール、ビルド、PM2再起動が一括で行われます。

```bash
pnpm run deploy
```

※ `deploy.sh` は `ssh` コマンドを使用します。必要に応じてファイルを編集し、Raspberry Piのホスト名やパスを環境に合わせてください。

### `deploy.sh` の内容例:
```bash
#!/bin/bash
HOST="raspberrypi.local"      # あなたのRaspberry Piのホスト名
USER="pi"                     # SSHユーザー名
DIR="~/path/to/project"       # プロジェクトのディレクトリパス

echo "🚀 Starting deployment..."
ssh $USER@$HOST "cd $DIR && git pull && pnpm install && pnpm build && pnpm exec pm2 restart thermal-printer-app"
echo "✅ Deployment complete!"
```

## 注意事項: `sharp` について
このプロジェクトでは画像処理に `sharp` を使用しています。`sharp` はインストールされた環境（OS/CPU）に合わせてバイナリをダウンロードします。
「Macでビルドした `node_modules` をそのままコピー」すると、Raspberry Piでは**確実に動作しません**。
必ずRaspberry Pi上で `pnpm install` を実行してください。

## 4. トラブルシューティング

### 印刷エラー: "Error - No default destination"
**原因:** デフォルトのプリンターがシステムで設定されていません。

**解決策:**
1. 現在のプリンター名を確認します。
   ```bash
   lpstat -p
   # 出力例: printer POS-80 is idle...
   ```
2. 確認したプリンター名（例: `POS-80`）をデフォルトに設定します。
   ```bash
   lpoptions -d POS-80
   ```

### 再起動後に自動起動しない場合
**原因:** PM2のスタートアップフックが正しく登録されていないか、設定が保存されていません。

**解決策:**
特に**手順2**を忘れがちですので確認してください。

1. **アプリを起動しておく**
   ```bash
   pnpm exec pm2 start ecosystem.config.cjs
   ```

2. **スタートアップ設定の生成コマンドを表示**
   ```bash
   pnpm exec pm2 startup
   ```

3. **表示されたコマンドを実行 (最重要)**
   上記を実行すると、ターミナルに以下のようなコマンドが表示されます（環境により異なります）：
   > `sudo env PATH=$PATH:... pm2 startup systemd -u pi --hp /home/pi`
   
   **この表示された行をコピーして、そのまま実行してください。** これを実行しないと自動起動設定は完了しません。

4. **現在の状態を保存**
   ```bash
   pnpm exec pm2 save
   ```

## 5. モーニング・ブリーフィング (自動印刷)
自動印刷の設定手順については、[Cron設定ガイド](./cron_setup.md) を参照してください。
