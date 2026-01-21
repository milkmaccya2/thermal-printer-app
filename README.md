# POS-80 Thermal Printer Controller

An Astro-based web web interface for controlling a POS-80 thermal printer connected to a Raspberry Pi. This application allows you to print text and images directly from your browser using a modern, responsive UI.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ![Features](https://api.iconify.design/fluent-emoji:sparkles.svg?height=24) Features

- **Text Printing**: Send raw text directly to the printer.
- **Image Printing**: Upload images which are automatically resized and dithered (Floyd-Steinberg) for optimal thermal printing.
- **Queue Management**: Monitor the status of the print queue.
- **Modern UI**: Clean interface built with Astro, React, and TailwindCSS.

## ![Tech Stack](https://api.iconify.design/fluent-emoji:hammer-and-wrench.svg?height=24) Tech Stack

- ![Astro](https://api.iconify.design/logos:astro-icon.svg?height=16) **Framework**: [Astro](https://astro.build/)
- ![React](https://api.iconify.design/logos:react.svg?height=16) **UI Library**: [React](https://react.dev/)
- ![TailwindCSS](https://api.iconify.design/logos:tailwindcss-icon.svg?height=16) **Styling**: [TailwindCSS](https://tailwindcss.com/)
- ![Sharp](https://api.iconify.design/fluent-emoji:framed-picture.svg?height=16) **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/)
- ![Backend](https://api.iconify.design/logos:nodejs-icon.svg?height=16) **Backend Interaction**: `actions` (Astro Actions) calling system `lp` commands.
- ![PM2](https://api.iconify.design/simple-icons:pm2.svg?height=16) **Process Manager**: [PM2](https://pm2.keymetrics.io/) (for production process management)

## ![System Architecture](https://api.iconify.design/fluent-emoji:building-construction.svg?height=24) System Architecture

```mermaid
graph TD
    User["<img src='https://api.iconify.design/fluent-emoji:person-using-laptop.svg?height=40' /><br/>User (Browser)<br/>Mobile / PC"]
    
    subgraph "Raspberry Pi"
        Server["<img src='https://api.iconify.design/fluent-emoji:server.svg?height=40' /><br/>Node.js Server<br/>(Astro + React)"]
        CUPS["<img src='https://api.iconify.design/fluent-emoji:gear.svg?height=40' /><br/>CUPS / lp Command"]
        Queue["<img src='https://api.iconify.design/fluent-emoji:inbox-tray.svg?height=40' /><br/>Print Queue"]
    end
    
    Printer["<img src='https://api.iconify.design/fluent-emoji:printer.svg?height=40' /><br/>Thermal Printer<br/>(POS-80)"]

    User --"HTTP/WiFi<br/>Actions (JSON)"--> Server
    Server --"Execute"--> CUPS
    CUPS --> Queue
    Queue --"USB"--> Printer
```
 
## ![Getting Started](https://api.iconify.design/fluent-emoji:rocket.svg?height=24) Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Raspberry Pi (or Linux system) with CUPS installed and a thermal printer configured.
- The `lp` command line tool should be available in the environment.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd orbital-skylab
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Build for production:
   ```bash
   pnpm build
   ```

5. Preview the production build:
   ```bash
   pnpm preview
   ```

## ![Project Structure](https://api.iconify.design/fluent-emoji:file-folder.svg?height=24) Project Structure

```text
/
├── public/             # Static assets
├── src/
│   ├── actions/        # Server-side actions (printing logic)
│   ├── components/     # React components (TextPrinter, ImagePrinter, etc.)
│   ├── layouts/        # Astro layouts
│   ├── pages/          # Application routes
│   └── styles/         # Global styles (including Tailwind)
└── package.json
```

## ![Important Notes](https://api.iconify.design/fluent-emoji:warning.svg?height=24) Important Notes

- **Printer Firmware**: For printing Japanese text, the thermal printer must support **Shift_JIS (CP932)** encoding and have Japanese fonts (Kanji ROM) installed in its firmware, as text is sent in raw mode.
- **Permissions**: The Node.js process must have permission to execute `lp` commands.

## ![License](https://api.iconify.design/fluent-emoji:page-facing-up.svg?height=24) License

MIT
