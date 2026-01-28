Visual ERD (Mermaid Syntax)
Code snippet
erDiagram
%% Tabel dari Boilerplate Auth/RBAC Anda (Referensi)
USERS {
uuid id PK
string email
string name
string role "Admin/User"
}

    %% Tabel Utama Project
    PROJECTS {
        uuid id PK
        uuid owner_id FK "Relasi ke USERS"
        string name
        string slug UK "URL unik: app.com/s/slug"
        string api_key UK "Kunci validasi widget"
        text_array domain_whitelist "Security CORS"
        jsonb widget_config "Menyimpan Logic & Tampilan"
        jsonb settings "Branding & Retention rules"
        enum tier "Basic / Pro / Enterprise"
        timestamp created_at
    }

    %% Tabel Transaksi Feedback (High Volume)
    FEEDBACKS {
        uuid id PK
        uuid project_id FK
        smallint rating "Kolom terpisah untuk Indexing (1-5)"
        enum status "New / Read / Archived"
        jsonb answers "Data dinamis: Tags, Comment, Email"
        jsonb meta "Context: URL, OS, Browser"
        timestamp created_at "Indexed untuk filter tanggal"
    }

    %% Tabel Integrasi (Pro Feature)
    WEBHOOKS {
        uuid id PK
        uuid project_id FK
        string url "Target URL Klien"
        text_array events "Contoh: ['feedback.created']"
        string secret_key "Untuk signature verification"
        boolean is_active
        timestamp created_at
    }

    %% Relasi
    USERS ||--o{ PROJECTS : "memiliki"
    PROJECTS ||--o{ FEEDBACKS : "menerima"
    PROJECTS ||--o{ WEBHOOKS : "mentrigger"

Penjelasan Detail Komponen ERD

1. Tabel PROJECTS (The Config Container)
   Tabel ini adalah "otak" dari setiap widget.

domain_whitelist (Array): Menggunakan tipe data array PostgreSQL native. Jauh lebih efisien daripada membuat tabel relasi project_domains terpisah hanya untuk menyimpan string domain.

widget_config (JSONB): Menyimpan seluruh logika "Conditional Grouping" yang kita bahas (warna, teks, aturan tag berdasarkan rating).

Kenapa JSONB? Karena struktur visual widget bisa berubah-ubah/kompleks tanpa perlu migrasi database.

tier: Penentu fitur (Basic vs Pro). Logic di kode akan mengecek kolom ini sebelum mengizinkan akses fitur tertentu (misal: Webhooks).

2. Tabel FEEDBACKS (The High-Traffic Table)
   Tabel ini didesain untuk Write-Heavy (banyak input masuk) dan Read-Heavy (dashboard analytics).

Hybrid Approach:

Kolom rating (Relational): Dikeluarkan dari JSON agar fungsi agregat seperti AVG(rating) berjalan instan (miliseconds) meskipun data ada jutaan baris.

Kolom answers (JSONB): Menyimpan detail. Contoh isi: {"tags": ["Bug", "Lambat"], "comment": "Error di checkout", "email": "user@mail.com"}.

Kolom meta (JSONB): Menyimpan data teknis. Contoh: {"url": "/pricing", "device": "Mobile", "agent": "Chrome 112"}.

status: Berfungsi layaknya sistem tiket sederhana. User bisa menandai feedback sebagai "Read" atau "Archived".

3. Tabel WEBHOOKS
   Tabel pendukung untuk fitur integrasi.

One-to-Many: Satu project bisa punya banyak webhook (misal: satu ke Slack, satu ke Zapier).

secret_key: Saat backend kita mengirim data ke webhook klien, kita menyertakan signature menggunakan key ini agar klien bisa memvalidasi bahwa data benar-benar dari kita (Security Best Practice).

Strategi Indexing (Performance Tuning)
Agar dashboard Next.js Anda tetap ngebut saat data mencapai jutaan, pastikan migrasi database Anda menyertakan index berikut:

Composite Index untuk Dashboard:

SQL
CREATE INDEX idx_feedbacks_main ON feedbacks (project_id, created_at DESC);
Fungsi: Mempercepat query "Tampilkan feedback project X dari yang terbaru".

Index untuk Metrik Rating:

SQL
CREATE INDEX idx_feedbacks_rating ON feedbacks (project_id, rating);
Fungsi: Mempercepat hitungan CSAT atau Average Rating per project.

GIN Index untuk Filter Tag (Advanced):

SQL
CREATE INDEX idx_feedbacks_answers ON feedbacks USING GIN (answers);
Fungsi: Memungkinkan user memfilter dashboard berdasarkan JSON key, misalnya: "Tampilkan semua feedback yang memiliki tag 'Bug'". Tanpa GIN index, filter ini akan sangat lambat.

Implementasi di Drizzle ORM
Jika Anda menggunakan Drizzle, definisinya akan terlihat seperti ini:

TypeScript
// schema.ts
import { pgTable, uuid, varchar, text, timestamp, smallint, jsonb, boolean, index } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
id: uuid('id').defaultRandom().primaryKey(),
ownerId: uuid('owner_id').notNull(),
name: varchar('name', { length: 255 }).notNull(),
// ...kolom lain
widgetConfig: jsonb('widget_config').default({}),
tier: varchar('tier', { length: 20 }).default('basic'),
});

export const feedbacks = pgTable('feedbacks', {
id: uuid('id').defaultRandom().primaryKey(),
projectId: uuid('project_id').references(() => projects.id).notNull(),
rating: smallint('rating').notNull(),
answers: jsonb('answers'),
meta: jsonb('meta'),
createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
return {
projectDateIdx: index('idx_feedbacks_project_date').on(table.projectId, table.createdAt),
answersGinIdx: index('idx_feedbacks_answers').on(table.answers).using('gin') // Perlu extension pg_trgm/btree_gin
}
});
