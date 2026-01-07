# Storyforge Backend - AI Driven Storyforge

NestJS backend application với PostgreSQL, Prisma, JWT authentication và AI integration.

## Yêu cầu

- Node.js >= 20.11.1
- Docker & Docker Compose
- npm hoặc yarn

## Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
cd storyforge-backend
npm install
```

### 2. Khởi động PostgreSQL với Docker

```bash
docker-compose up -d
```

### 3. Tạo file `.env`

Tạo file `.env` trong thư mục `storyforge-backend` với nội dung:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storyforge-db"
# Google Gemini Configuration (Free Tier)
GEMINI_API_KEY="" # Lấy tại https://aistudio.google.com/app/apikey (miễn phí)
```

**Lưu ý:** 
- Nếu không có `GEMINI_API_KEY`, API sẽ trả về mock data
- **Google Gemini**: Miễn phí, sử dụng model `gemini-2.5-flash` (hard-coded trong code)
- Lấy API key miễn phí tại: https://aistudio.google.com/app/apikey

### 4. Chạy migrations và seed data

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Khởi động server

```bash
npm run start
```

Server sẽ chạy tại: `http://localhost:3000`

## API Documentation (Swagger)

Swagger UI documentation có sẵn tại:
- **Swagger UI:** `http://localhost:3000/swagger`

Tại đây bạn có thể:
- Xem tất cả API endpoints
- Test API trực tiếp từ browser
- Xem request/response schemas
- Authenticate bằng JWT token (click "Authorize" button)

## API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký user mới
- `POST /auth/login` - Đăng nhập

### Stories (JWT protected)
- `GET /stories` - Lấy danh sách stories
- `POST /stories` - Tạo story mới
- `GET /stories/:id` - Lấy chi tiết story
- `PUT /stories/:id` - Cập nhật story
- `DELETE /stories/:id` - Xóa story
- `GET /stories/:id/documents` - Lấy documents của story

### Documents (JWT protected)
- `GET /documents` - Lấy danh sách documents
- `POST /documents` - Tạo document mới
- `GET /documents/:id` - Lấy chi tiết document
- `PUT /documents/:id` - Cập nhật document
- `DELETE /documents/:id` - Xóa document

### AI
- `POST /ai/generate` - Generate user story từ raw input

## Seed Data

Project đã có seed data với:
- 1 admin user: `admin` / `123456`
- 10 normal users (xem `prisma/seed.ts`)

Tất cả users đều dùng password: `123456`

## Database

- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Migrations:** `npx prisma migrate dev`
- **Prisma Studio:** `npx prisma studio` (GUI để xem database)

## Scripts

```bash
# Development
npm run start:dev

# Production
npm run start:prod

# Build
npm run build

# Lint
npm run lint

# Test
npm run test
```

## Cấu trúc Project

```
storyforge-backend/
├── src/
│   ├── auth/          # JWT authentication
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   ├── story/          # Story CRUD
│   │   ├── story.controller.ts
│   │   ├── story.service.ts
│   │   └── story.module.ts
│   ├── document/       # Document CRUD
│   │   ├── document.controller.ts
│   │   ├── document.service.ts
│   │   └── document.module.ts
│   ├── ai/             # AI integration
│   │   ├── ai.controller.ts
│   │   ├── ai.service.ts
│   │   └── ai.module.ts
│   ├── dto/            # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   ├── story.dto.ts
│   │   ├── document.dto.ts
│   │   └── ai.dto.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   └── main.ts         # Entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── seed.ts         # Seed data
│   └── migrations/     # Database migrations
└── docker-compose.yml  # PostgreSQL container
```

## Troubleshooting

### Database connection error
- Kiểm tra Docker container đang chạy: `docker ps`
- Kiểm tra `.env` có đúng `DATABASE_URL` không

### Migration error
- Reset database: `npx prisma migrate reset`
- Chạy lại migration: `npx prisma migrate dev`

### Port 3000 đã được sử dụng
- Đổi port trong `src/main.ts` hoặc set `PORT` trong `.env`
