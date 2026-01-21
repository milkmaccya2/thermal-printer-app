# 実装計画 - Restore Printer Control Buttons

## 目標
ユーザーのリクエストに基づき、以下の機能をUIに追加・復元する。
1. **Enable Printer**: `cupsenable` コマンドを実行するボタンを常時（またはアクセスしやすく）表示する。
2. **Clear Queue**: 全てのジョブをキャンセルするボタンを追加。
3. **Cancel Job**: 個別のジョブをキャンセルするボタンを追加。

## 変更案

### 1. `src/components/PrinterStatusCard.tsx`
- **[MODIFY] Enable Button**: 現在 `isPaused` の時のみ表示されているが、常時表示するか、あるいは「Maintenance」セクションとして強制カットボタンと一緒に配置する。ユーザーが「enablePrinterのボタンもあった」と言っているため、明示的に使えるようにする。

### 2. `src/components/PrintQueueCard.tsx`
- **[MODIFY] Clear Queue Button**: キューリストのヘッダー部分に「Clear All」ボタンを追加。
- **[MODIFY] Cancel Job Button**: 各ジョブの行に「Cancel」（ゴミ箱アイコン等）を追加。
- **[NEW] Props**: `onClearQueue`, `onCancelJob` コールバックを受け取るように変更。

### 3. `src/components/PrinterManager.tsx`
- **[MODIFY] Handlers**:
    - `handleClearQueue`: `actions.clearQueue` を呼び出し、ステータスを更新。
    - `handleCancelJob`: `actions.cancelJob` を呼び出し、ステータスを更新。
    - これらを `PrintQueueCard` に渡す。

## 検証計画
- `npm run build` でビルド確認。
- （実機デプロイ後）ジョブを投入し、個別にキャンセルできるか確認。
- （実機デプロイ後）「Enable」ボタンを押してエラーなく動作するか確認。
