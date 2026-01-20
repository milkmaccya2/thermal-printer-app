# 実装計画: アイコンセットの導入 (Lucide React)

## 概要
アプリケーション内の絵文字（🤖, 🖼️, 📝, ✅, ❌ など）を、モダンで統一感のあるアイコンセット `lucide-react` に置き換えます。これにより、「AI生成っぽさ」を払拭し、より洗練されたUIを目指します。

## 変更内容

### 1. 依存関係の追加
- `lucide-react` をインストールします。

### 2. コンポーネントの修正
以下のコンポーネント内の絵文字を対応する Lucide アイコンに置換します。

#### `src/components/PrinterManager.tsx`
- **Printer Status**: `Printer` (Printer icon), `CheckCircle` (Online), `AlertCircle` (Error/Offline)
- **Queue**: `List` (Queue header), `FileText` (Job item)
- **Enable Button**: `Play` or `RefreshCcw` (Enable)

#### `src/components/ImagePrinter.tsx`
- **Header**: `Image` (Image Printer header)
- **Placeholder**: `Upload` or `FolderOpen` (Upload area)
- **Status**: `Check` (Success), `XCircle` (Error)
- **Button**: `Printer` (Print button)

#### `src/components/TextPrinter.tsx`
- **Header**: `Type` or `FileType2` (Text Printer header)
- **Status**: `Check` (Success), `XCircle` (Error)
- **Button**: `Printer` (Print button)

## 検証
- モバイル・デスクトップでの表示確認。
- アイコンのサイズや色が既存の Tailwind CSS スタイルと調和しているか確認。
