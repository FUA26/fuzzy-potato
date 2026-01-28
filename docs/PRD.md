Product Requirement Document: Feedback SaaS (Backoffice)
Version: 1.0 Scope: Backoffice & API Layer Business Model: Unlimited Feedback per Project (Feature Gating)

I. Executive Summary
Backoffice ini berfungsi sebagai "Control Center" bagi pemilik bisnis (Klien) untuk membuat, mengatur, dan menganalisis survei kepuasan. Sistem ini harus menangani manajemen multi-project, konfigurasi widget visual (Logic Builder), dan visualisasi data volume tinggi (High-volume read).

II. Tech Stack Reference
Framework: Next.js (App Router).

Language: TypeScript.

Database: PostgreSQL.

ORM: Drizzle ORM (Rekomendasi) atau Prisma.

Styling: Tailwind CSS + Shadcn UI.

State/Validation: React Hook Form + Zod.

Auth: Existing Boilerplate (RBAC Support).

III. Database Design (Schema Detail)
Ini adalah struktur tabel kritis. Menggunakan pendekatan Hybrid (Relational + JSONB).

1. Table: projects
   Menyimpan konfigurasi widget dan batasan fitur.

SQL
CREATE TABLE projects (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
owner_id UUID NOT NULL, -- Relasi ke tabel User di Auth Boilerplate
name VARCHAR(255) NOT NULL,
slug VARCHAR(50) UNIQUE NOT NULL, -- Untuk URL public: app.com/s/slug

-- SECURITY
domain_whitelist TEXT[], -- Array domain: ['example.com', 'shop.example.com']
api_key VARCHAR(64) UNIQUE, -- Untuk validasi request dari widget

-- CONFIGURATION (The Brain)
widget_config JSONB DEFAULT '{}', -- Menyimpan warna, teks, logic steps (Lihat Bagian IV)

-- FEATURE GATING (Model Unlimited)
tier VARCHAR(20) DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
settings JSONB DEFAULT '{"remove_branding": false, "retention_days": 30}',

created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
); 2. Table: feedbacks
Menyimpan data masuk. Kolom rating dikeluarkan dari JSON untuk performa query agregat.

SQL
CREATE TABLE feedbacks (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

-- PRIMARY METRICS (Indexed for Dashboard Speed)
rating SMALLINT NOT NULL, -- 1 sampai 5
status VARCHAR(20) DEFAULT 'new', -- 'new', 'read', 'archived'

-- DYNAMIC DATA
answers JSONB, -- { "tags": ["bug", "slow"], "comment": "...", "email": "..." }
meta JSONB, -- { "url": "/checkout", "os": "Android", "browser": "Chrome", "geo": "ID" }

created_at TIMESTAMP DEFAULT NOW() -- Indexing Wajib
);

-- INDEXES
CREATE INDEX idx_feedbacks_project_date ON feedbacks(project_id, created_at);
CREATE INDEX idx_feedbacks_project_rating ON feedbacks(project_id, rating);
CREATE INDEX idx_feedbacks_answers ON feedbacks USING GIN (answers); -- Agar bisa query tags 3. Table: webhooks (Feature Pro)
Untuk integrasi pihak ketiga.

SQL
CREATE TABLE webhooks (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
project_id UUID NOT NULL REFERENCES projects(id),
url TEXT NOT NULL,
events TEXT[], -- ['feedback.created', 'feedback.alert']
is_active BOOLEAN DEFAULT true,
secret_key VARCHAR(100)
);
IV. JSON Data Structures (The Logic Contract)
Struktur ini disimpan di dalam kolom projects.widget_config. Ini yang akan dibaca oleh Widget Builder (UI) dan Widget Client (Preact).

JSON
{
"theme": {
"color_primary": "#000000",
"position": "bottom_right",
"trigger_label": "Feedback"
},
"logic": [
{
"rating_group": [1, 2], // Bucket Negatif
"title": "Maaf mengecewakan Anda",
"tags": ["Bug", "Loading Lama", "Navigasi", "Konten"],
"placeholder": "Ceritakan masalahnya...",
"collect_email": true
},
{
"rating_group": [3], // Bucket Netral
"title": "Terima kasih infonya",
"tags": ["Biasa Saja", "Butuh Fitur"],
"placeholder": "Apa yang bisa kami tingkatkan?",
"collect_email": false
},
{
"rating_group": [4, 5], // Bucket Positif
"title": "Senang mendengarnya!",
"tags": ["Desain", "Kemudahan", "Layanan"],
"placeholder": "Apa yang paling Anda suka?",
"collect_email": false,
"cta_redirect": "https://google.com/maps/..." // Opsional
}
]
}
V. Detail Fitur Backoffice (Per Halaman)

1. Dashboard Overview (/dashboard)
   Halaman pertama setelah login.

Top Cards: Total Projects, Total Feedback (This Month), Global Avg Rating.

Project List Table:

Kolom: Nama Project, Status (Active/Inactive), Feedback Count (30d), Avg Rating.

Action: tombol "Manage".

2. Widget Builder (/project/[id]/builder)
   Fitur paling kompleks. Editor visual.

Layout: Split screen. Kiri = Form Config, Kanan = Live Preview (Mobile/Desktop).

Logic Editor: Menggunakan accordion/tabs untuk 3 kondisi (Negatif, Netral, Positif).

User menginput Tags (tekan enter untuk add tag).

Toggle "Collect Email".

Appearance: Color picker untuk warna utama widget.

Save Action: Melakukan PATCH ke endpoint /api/projects/[id] dan update kolom widget_config.

3. Feedback Inbox (/project/[id]/inbox)
   Tempat melihat data masuk.

Component: Data Table (Server-side Pagination).

Filters:

Date Range Picker.

Rating (Checkbox 1-5).

Tags (Dropdown dynamic dari GIN index JSONB).

Row Detail (Expandable):

Saat baris diklik, muncul Drawer/Modal berisi detail lengkap: User Agent, URL asal, Komentar penuh.

Export: Tombol "Export CSV" (Locked untuk plan Basic).

4. Distribution & Installation (/project/[id]/install)
   Web Install: Box berisi kode <script> siap copy-paste.

Link/QR:

Menampilkan Dynamic Link: https://app.com/s/[slug].

Tombol "Download QR Code".

Link Generator untuk WA/Email.

5. Settings (/project/[id]/settings)
   General: Ganti nama project, Delete project.

Security: Input field Domain Whitelist (Wajib diisi agar widget jalan).

Webhooks: Form tambah URL webhook (Locked untuk plan Basic).

VI. API Routes Structure (Next.js)
Public API (Untuk Widget & QR)
Perlu handling CORS ketat dan Rate Limiting.

GET /api/v1/widget/config

Query: ?project_id=... & origin=...

Logic: Cek domain whitelist. Return JSON config. Cache-Control header aktif.

POST /api/v1/feedback

Body: JSON Payload (Rating, Answers, Meta).

Logic: Validasi skema, simpan ke DB, trigger webhook (asynchronous).

Private API (Untuk Backoffice)
Dilindungi oleh Auth Middleware.

GET /api/dashboard/stats -> Agregasi metrik global.

GET /api/projects/[id]/feedbacks -> Data table dengan pagination & filter.

PATCH /api/projects/[id] -> Update config/settings.

VII. Business Logic Rules (Implementation Guide)
CORS Protection: Saat widget request config, server mengecek header Origin atau Referer. Jika domain tidak ada di array projects.domain_whitelist, return 403 Forbidden.

Plan Limits (Middleware Level):

Saat akses halaman /webhooks, cek projects.tier. Jika basic, redirect ke upgrade page atau disable tombol.

Saat export CSV, cek projects.tier.

Data Retention (Cron Job): Buat script (bisa via Vercel Cron atau pg_cron) yang jalan tiap malam:

SQL
DELETE FROM feedbacks
WHERE project_id IN (SELECT id FROM projects WHERE settings->>'retention_days' = '30')
AND created_at < NOW() - INTERVAL '30 DAYS';
VIII. Langkah Pengerjaan (Step-by-Step)
Setup Database: Jalankan migrasi Drizzle untuk tabel di atas.

API Integration: Buat CRUD project di Next.js.

Builder UI: Fokus selesaikan UI Logic Builder karena ini fitur utama. Simpan outputnya sebagai JSON.

Public API: Buat endpoint /api/v1/widget/config dan tes responnya (pastikan cepat < 100ms).

Inbox UI: Buat tabel feedback dengan filter.

Widget Dev: (Terpisah) Baru mulai coding Preact widget setelah Public API siap.
