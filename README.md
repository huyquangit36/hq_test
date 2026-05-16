Đây là file **README.md** được thiết kế riêng cho dự án **HQ Streetwear** của bạn. Nội dung được viết theo phong cách chuyên nghiệp, hiện đại, đúng vibe "Streetwear" và bao quát toàn bộ các công nghệ, quy tắc mà chúng ta đã thống nhất.

---

# HQ STREETWEAR // HIGH-END URBAN ARCHIVE

![Project Version](https://img.shields.io/badge/version-2.6.0-65a3aa)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)
![AI](https://img.shields.io/badge/AI-Gemini_3.1_Flash-65a3aa)

## 01. Project Overview

**HQ Streetwear** is a full-stack e-commerce ecosystem designed for the modern urban culture. Beyond a simple shop, it integrates an **AI Neural Link** for real-time fashion consultation and a **Secure Checkout Protocol** via VNPAY. The platform focuses on minimalist aesthetics, high-speed performance, and "The Drop" experience.

---

## 02. Tech Stack

| Layer            | Technologies                                                             |
| :--------------- | :----------------------------------------------------------------------- |
| **Frontend**     | Next.js 15 (App Router), Tailwind CSS 4, Shadcn/UI, Lucide React, Sonner |
| **Backend**      | Node.js Runtime, Next.js Route Handlers                                  |
| **Database**     | PostgreSQL (with JSONB for flexible inventory control)                   |
| **Intelligence** | Google Gemini 3.1 Flash Lite (RAG context integration)                   |
| **Payment**      | VNPAY Sandbox (HMAC-SHA512 Security)                                     |
| **Auth**         | JWT (JSON Web Token), Bcrypt.js (10 Rounds Salting)                      |

---

## 03. Design Scheme (Mint / Jade / Navy)

The interface follows a **High-end Minimalism** aesthetic, focusing on clarity and sharp interactions.

- **Primary (Jade):** `oklch(0.65 0.1 170)` - Used for buttons, accents, and brand elements.
- **Background:** `oklch(0.98 0.01 160)` - Mint-white tint for a clean, premium feel.
- **Foreground (Navy):** `oklch(0.22 0.06 240)` - High-contrast text for maximum readability.
- **Typography:**
  - _Headings:_ **Space Grotesk** (Bold Italic) for a technical, aggressive look.
  - _Body:_ **Inter** for functional clarity.
- **Corners:** `rounded-none` (Sharp edges) to maintain an industrial streetwear vibe.

---

## 04. Core Rules & Development Standards

To maintain system integrity, the following rules must be strictly followed:

1.  **Anti-Lag Protocol:** Every Input field must use `autoComplete="one-time-code"` and `transition-none` to prevent browser autofill lag.
2.  **No Local Notifications:** Never use browser `alert()` or `confirm()`. All feedback must go through the **Sonner Toast** system.
3.  **Inventory Logic:** Stock MUST be managed via the `size_stocks` JSONB column in PostgreSQL using the `jsonb_set` atomic update algorithm.
4.  **AI Scope:** The AI Assistant must only answer fashion/store-related queries. It is forbidden to discuss code, math, or competitor brands.
5.  **Cursor States:** All interactive elements (buttons, images, links) MUST have `cursor-pointer` applied.

---

## 05. File Structure

```text
hq-streetwear/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, Register, Recovery (Shared Layout)
│   ├── admin/              # Management Terminal (Protected Routes)
│   ├── api/                # Core API Infrastructure
│   │   ├── admin/          # Restricted Admin Operations
│   │   ├── chat/           # Gemini AI Neural Link
│   │   └── payment/        # VNPAY Integration & Return Handlers
│   ├── checkout/           # Secure Payment UI
│   └── products/           # Dynamic Product Archives
├── components/             # Reusable UI Architecture (Shadcn)
├── lib/                    # Database (pg) & Utility Configs
├── public/                 # Image Assets & Media
└── .env                    # Secure Environment Keys (VNPAY, Google AI)
```

---

## 06. Key Algorithms

### ⚛️ Real-time Inventory Subtraction (SQL)

Instead of fetching data to the client, we subtract stock directly in the database to prevent race conditions:

```sql
UPDATE products SET size_stocks = jsonb_set(size_stocks, array[$1], ((COALESCE(size_stocks->>$1, '0')::int) - $2)::text::jsonb) WHERE id = $3
```

### 🧠 Retrieval-Augmented Chat (AI)

The chatbot fetches the top 15 products from the database and injects them into the `system_instruction` context before responding, ensuring 100% accurate product advice.

---

## 07. Setup Instructions

1.  **Clone the archive:** `git clone https://github.com/huyquangit36/hq_test.git`
2.  **Install dependencies:** `pnpm install`
3.  **Environment Setup:** Create a `.env` file with the following keys:
    - `DATABASE_URL` (PostgreSQL)
    - `GOOGLE_AI_API_KEY` (Gemini API)
    - `VNP_TMN_CODE`, `VNP_HASH_SECRET` (VNPAY Sandbox)
4.  **Initialize Terminal:** `pnpm dev`
5.  **Access:** `localhost:3000`

---

_Created by **HQ Streetwear Collective** // EST. 2026_
