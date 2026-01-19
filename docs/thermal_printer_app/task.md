# プロジェクト: Raspberry Pi サーマルプリンタ制御 Webアプリ

## 概要
Raspberry Pi に接続された POS-80 サーマルプリンタを使用して、Webインターフェースからテキストや画像を印刷できるアプリケーションを構築します。
Astro v6, React, Tailwind CSS を使用し、Puppeteer を用いてサーバーサイドでレンダリングした画像を印刷します。

## 主な機能
1.  **テキスト印刷**: 任意のテキストを入力して印刷する機能。
2.  **画像印刷**: 画像ファイルをアップロードして印刷する機能。
3.  **シンプル制御**: Puppeteerを使用せず、`lp` コマンドでファイルを直接送信。

## 技術スタック
- Framework: Astro v6
- UI: React, Tailwind CSS
- Backend: Node.js (Astro Actions)
- Deployment: PM2
- Hardware: Raspberry Pi (POS-80 Printer via USB)
