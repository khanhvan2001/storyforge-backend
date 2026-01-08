# Storyforge Backend - AI Driven User Story Generator

Backend cho hệ thống AI hỗ trợ tạo User Story, trong đó AI đóng vai trò đề xuất và người dùng quyết định bản cuối.

---

## Core Idea

- AI đề xuất User Story theo chuẩn Agile.
- Người dùng toàn quyền chỉnh sửa trước khi xác nhận.
- Hệ thống lưu song song:
  - generatedUserStory: bản nháp do AI sinh.
  - finalUserStory: bản cuối do user chỉnh (nguồn dữ liệu chính).

---

## Tech Stack

- Backend: NestJS
- Database: PostgreSQL 15
- ORM: Prisma
- Auth: JWT
- AI: Google Gemini (gemini-2.5-flash, free tier)
- Naming: camelCase (code/API) và snake_case (database)

---

## Requirements

- Node.js >= 20.11.1
- Docker & Docker Compose
- npm hoặc yarn

---

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start PostgreSQL
```bash
docker-compose up -d
```

### 3. Create .env file
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storyforge-db"
GEMINI_API_KEY=""
```

Nếu không có GEMINI_API_KEY, hệ thống sẽ trả về mock data để demo.

### 4. Migrate & seed database
```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start server
```bash
npm run start
```

Server chạy tại http://localhost:3000  
Swagger tại http://localhost:3000/swagger

---

## Authentication

- POST /auth/register
- POST /auth/login

Response:
```json
{ "accessToken": "string" }
```

---

## Core API - Stories

### POST /stories/generate (Main endpoint)

Sinh User Story từ idea, user requirements, file đính kèm và link tham khảo.

Request (multipart/form-data):

- idea (string, required)
- userRequirements (string, required)
- referenceLinks (string, optional, tối đa 5 links, phân cách bằng dấu phẩy)
- files (file[], optional, tối đa 10 files)

Supported file types: .txt, .md, .pdf, .docx

Response (rút gọn):
```json
{
  "id": 1,
  "generatedUserStory": {
    "userStory": "...",
    "acceptanceCriteria": ["..."],
    "notes": "..."
  },
  "finalUserStory": {
    "userStory": "...",
    "acceptanceCriteria": ["..."],
    "notes": "..."
  },
  "status": "DRAFT"
}
```

finalUserStory là bản được user chỉnh sửa và sử dụng chính thức.

---

### Other Story APIs

- GET /stories
- GET /stories/:id
- PUT /stories/:id (update finalUserStory và status)
- DELETE /stories/:id

---

## Documents (Optional)

Các endpoint này không nằm trong flow generate chính.

- GET /documents
- POST /documents
- GET /documents/:id
- PUT /documents/:id
- DELETE /documents/:id

---

## Seed Data

- admin / 123456
- 10 users demo (xem prisma/seed.ts)

---

## Database Notes

- Prisma migrate: npx prisma migrate dev
- Prisma Studio: npx prisma studio
- Migration là lịch sử bất biến, không sửa migration cũ

---

## Project Structure (Simplified)

```
src/
├── auth/
├── story/
├── ai/
├── document/
├── dto/
└── main.ts
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

---

## Troubleshooting

- Database connection error: kiểm tra docker ps và DATABASE_URL
- Reset database (dev only):
```bash
npx prisma migrate reset
```
- Port conflict: đổi PORT trong .env hoặc src/main.ts

---

## Summary

Storyforge là hệ thống AI hỗ trợ tạo User Story, trong đó AI sinh bản nháp và người dùng quyết định bản cuối.
