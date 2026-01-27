# スマホ共有印刷 実装計画

## ゴール
スマートフォンの「共有」メニューから、テキスト、URL、そして**画像**を直接サーマルプリンターアプリに送信し、印刷できるようにする。

## 変更内容

### 設定
#### [NEW] [manifest.json](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/public/manifest.json)
- PWAマニフェストを定義。
- `share_target` を設定し、`POST` リクエスト (`multipart/form-data`) を受け付けるようにする。
- パラメータ: `title`, `text`, `url` に加えて `files` (画像ファイル) を定義。

### レイアウト
#### [MODIFY] [Layout.astro](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/layouts/Layout.astro)
- `<head>` に `<link rel="manifest" href="/manifest.json" />` を追加。

### コンポーネント
#### [MODIFY] [TextPrinter.tsx](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/components/TextPrinter.tsx)
- オプションの `initialText` prop を追加。
- 初期化時にこの prop があれば `text` state にセットする。

#### [MODIFY] [ImagePrinter.tsx](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/components/ImagePrinter.tsx)
- オプションの `initialImage` prop (Base64文字列) を追加。
- `useEffect` で `initialImage` が渡された場合、それを `original` state としてセットし、プレビュー生成処理を実行する。

### ページ
#### [NEW] [share.astro](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/pages/share.astro)
- Share Target からの `POST` リクエストを処理する。
- `FormData` をパースする。
- **画像ファイルがある場合**:
    - バッファを読み込み、Base64文字列に変換。
    - `ImagePrinter` コンポーネントを表示し、`initialImage` を渡す。
- **テキストのみの場合**:
    - `title`, `text`, `url` を結合。
    - `TextPrinter` コンポーネントを表示し、`initialText` を渡す。

## 検証計画

### 手動検証
1.  **マニフェスト確認**: Chrome/Safari の DevTools -> Application -> Manifest でエラーなく読み込まれているか確認。
2.  **テキスト共有シミュレーション**:
    ```bash
    curl -X POST -F "text=こんにちは" http://localhost:4321/share
    ```
    `TextPrinter` が「こんにちは」と入力された状態で表示されるか確認。
3.  **画像共有シミュレーション**:
    - シンプルなHTMLフォームを作成、またはPythonスクリプト等で画像を `/share` にPOSTする。
    - `ImagePrinter` が画像プレビューが表示された状態で立ち上がるか確認。
4.  **エンドツーエンド (要モバイル端末)**:
    - モバイル端末からアクセスし、「ホーム画面に追加」。
    - 写真アプリやブラウザから「共有」を選び、本アプリを選択。
    - 適切な画面（画像またはテキスト）が開くことを確認。
