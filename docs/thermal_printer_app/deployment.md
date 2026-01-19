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

### 1-1. Node.js のインストール
最新のLTSバージョン（v20やv22など）を推奨します。
```bash
# NodeSourceからインストールする例 (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1-2. pnpm のインストール
```bash
sudo npm install -g pnpm
```

### 1-3. PM2 のインストール（プロセス管理）
```bash
sudo npm install -g pm2
```

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

# PM2でアプリを再起動
pnpm exec pm2 restart thermal-printer-app
```

---

## 3. デプロイの自動化（オプション）

毎回SSHでコマンドを打つのが面倒な場合、Macの `package.json` にデプロイ用コマンドを追加しておくと便利です。
（※Raspberry Piのホスト名が `raspberrypi.local`、ユーザーが `pi`、パスが `~/app` の場合の例）

```json
"scripts": {
  "deploy": "ssh pi@raspberrypi.local 'cd ~/app && git pull && pnpm install && pnpm build && pnpm exec pm2 restart thermal-printer-app'"
}
```

実行コマンド:
```bash
npm run deploy
```

## 注意事項: `sharp` について
このプロジェクトでは画像処理に `sharp` を使用しています。`sharp` はインストールされた環境（OS/CPU）に合わせてバイナリをダウンロードします。
「Macでビルドした `node_modules` をそのままコピー」すると、Raspberry Piでは**確実に動作しません**。
必ずRaspberry Pi上で `pnpm install` を実行してください。
