# Web Pixel Art Editor

PoC project to develop Web based Pixel Art Editor



## ✨ Features

* **32x32 Pixel Canvas**: Intuitive click-and-drag drawing across a 1,024-pixel grid, with a single-click **Clear** action to reset the canvas.
* **Customizable 16-Color Palette**: Select from 16 indexed colors and customize any palette slot in real time using native color pickers.
* **Structured JSON Export & Import**: Save and reload artwork—including sprite name, comments, custom palette, and pixel data—as portable `.json` files.
* **Dual Encoding Formats**: Choose between **Hex** (1,024 chars) for human-readable inspection or **Base64** (684 chars) for compact storage.

---

## 📦 JSON Data Format

Exported files follow a clean, self-contained JSON schema:

```json
{
  "name": "untitled_sprite",
  "comment": "Created with 32x32 Pixel Art Editor",
  "width": 32,
  "height": 32,
  "palette": ["#000000", "#FFFFFF", "... (16 hex colors)"],
  "encoding": "base64",
  "data": "..."
}
```

## 🛠 Tech Stack

Designed with a type-safe, modern frontend architecture to prioritize maintainability and Developer Experience (DX).

* **Frontend**: React, TypeScript
* **Build Tool**: Vite
* **Package Manager**: pnpm (v12)
* **Testing**: Vitest, React Testing Library, jsdom


## 💡 Technical Highlights & Architecture

Key engineering decisions and design considerations behind this project:

1. **Efficient Pixel Data Encoding (`encoder.ts`)**
   * Implemented custom encoding and decoding logic to represent canvas grid states in a compact format.
   * Decoupled data transformation logic completely from UI components (Separation of Concerns) to improve maintainability and testability.
2. **Strict Type Safety**
   * Leveraged TypeScript's strict type system to prevent runtime inconsistencies across canvas coordinates and grid states.
3. **Test-Driven Reliability**
   * Established unit tests for core encoding logic (`encoder.test.ts`) alongside component tests simulating user interactions (`App.test.tsx`) to ensure reliable behavior and safe refactoring.


## 🚀 Getting Started
1. Clone repository
```bash
$ git clone https://github.com/atsupi/web-pixel-art-editor
$ cd web-pixel-art-editor
```

2. Install dependencies
```bash
$ pnpm install
```

3. Run application
```bash
$ pnpm run dev
```

4. Test application
```bash
$ pnpm test
```

5. Lint check
```bash
$ pnpm run lint
```

6. Build application
```bash
$ pnpm run build
```

## License
MIT License