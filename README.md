# Sign Natural Academy — Backend (README)

This README covers the backend for **Sign Natural Academy** (MERN).  
It shows how to run the server, required env vars, how to test key routes, and deployment notes.

## Table of contents

- Project summary
- Prerequisites
- Install & run
- Environment variables
- Quick start — health check
- Common routes & curl examples (admin first)
- Testing file uploads (courses, workshops, testimonials)
- Removing accidentally committed `.env`
- Production / deploy notes
- Project structure (final backend tree)
- Troubleshooting

## Project summary

Backend provides:
- Auth with OTP email verification (register → OTP → verify → login).
- Two roles: `user` (learner) and `admin` (instructor). Only admin can create another admin.
- Courses, Workshops, Products CRUD (admin).
- Bookings (user creates, admin views/changes).
- Testimonials with image upload and admin approval.
- Cloudinary for images.
- SMTP for OTP emails.
- Joi validators for request validation.
- JWT authentication.

## Prerequisites

- Node.js v18+ (tested with v22).  
- npm (or yarn).  
- MongoDB connection string (Atlas recommended).  
- Cloudinary account (cloud name, api key, api secret).  
- SMTP account (Gmail app-password or other provider).  
- `type: "module"` in `package.json`.

## Install & run

```bash
git clone <your-repo-url>
cd sign-natural-api
npm install
# create .env file
npm run dev  # uses nodemon

## Required environment variables
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/dbname
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
OTP_EXPIRES_MINUTES=10
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Sign Natural <no-reply@signnatural.com>"
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPass123
ADMIN_NAME=AdminName
PORT=5000
NODE_ENV=development

## Quick start — health check
After server is running:

curl http://localhost:5000/api/health
# -> { "ok": true, "now": 167... }

Common routes and curl examples

Replace localhost:5000 with your base URL. Replace tokens and IDs.

1. Admin login
curl -X POST http://localhost:5000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@example.com","password":"AdminPass123"}'


Response: { token: "...", user: { role: "admin", ... } }

Set shell var for reuse:

ADMIN_TOKEN="eyJ..."

2. Admin creates another admin
curl -X POST http://localhost:5000/api/auth/admin \
 -H "Authorization: Bearer $ADMIN_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"name":"New Admin","email":"newadmin@example.com","password":"StrongPass123"}'

3. Register user (sends OTP)
curl -X POST http://localhost:5000/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{"name":"Learner","email":"learner@example.com","password":"LearnerPass123"}'

4. Verify email (OTP)
curl -X POST http://localhost:5000/api/auth/verify-email \
 -H "Content-Type: application/json" \
 -d '{"email":"learner@example.com","otp":"123456"}'


Response includes token. Save as USER_TOKEN.

5. Login (user)
curl -X POST http://localhost:5000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"learner@example.com","password":"LearnerPass123"}'

6. Get current user
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:5000/api/auth/me

File upload testing (courses, workshops, testimonials)

The back end expects multipart/form-data with file field named image. Use upload.single('image').

Create Course (admin)
curl -X POST http://localhost:5000/api/courses \
 -H "Authorization: Bearer $ADMIN_TOKEN" \
 -F "title=Shea Course" \
 -F "description=Learn to make shea butter" \
 -F "type=in-person" \
 -F "price=45" \
 -F "duration=60mins" \
 -F "image=@/path/to/image.jpg"

Create Workshop (admin)
curl -X POST http://localhost:5000/api/workshops \
 -H "Authorization: Bearer $ADMIN_TOKEN" \
 -F "title=Glow-Up Party" \
 -F "description=Group workshop" \
 -F "type=celebration" \
 -F "location=Accra" \
 -F "image=@/path/to/image.jpg"

Create Testimonial (user)
curl -X POST http://localhost:5000/api/testimonials \
 -H "Authorization: Bearer $USER_TOKEN" \
 -F "text=Loved the workshop!" \
 -F "tag=My Creation" \
 -F "image=@/path/to/photo.jpg"


Notes:

Backend uses multer memory storage. Controllers read req.file.buffer and upload to Cloudinary.

Cloudinary must be configured in .env.

Removing accidentally committed .env

If you pushed .env, take action now.

1) Remove from repo and push

git rm --cached .env
git commit -m "remove .env from repo"
git push origin main


2) To fully remove it from history (careful, rewrites history)

Use git filter-branch or BFG. Example with BFG (recommended for ease):

Install BFG and run:

bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force


Only do this if you understand history rewrite implications and coordinate with your team.

3) Rotate secrets — change any secret values exposed (Cloudinary, SMTP, DB, JWT).

Production / deploy notes

Use environment-specific secrets (Heroku, Vercel, Railway, AWS Secrets Manager).

Use HTTPS.

Do not verify SMTP in a blocking manner if you want faster boot; current code warns if SMTP fails.

Use Cloudinary credentials for production images and restrict them.

Use robust logging and Sentry for errors.

Set NODE_ENV=production in production.

Troubleshooting

SMTP errors: ensure SMTP_USER & SMTP_PASS are correct. For Gmail use an App password or OAuth. Check verifyTransporter() logs.

Cloudinary missing: restart server after setting env. Confirm CLOUDINARY_* set and cloudinary.config(...) runs.

JWT errors: ensure JWT_SECRET same between processes. Use long, random secret.

Multer/file-size: set limits in uploads.js or validate in controllers.

Node ESM import errors: ensure file path casing matches actual filenames. Use relative imports and exact file names. Example: ../middlewares/uploads.js matches uploads.js.