API Contract Specification
Base URL: https://api.your-saas.com

1. Public Zone: Widget API
   Authentication: Tidak ada User Auth. Validasi menggunakan Project ID + Origin Header (CORS Whitelist). Rate Limit: 60 requests/IP/minute.

A. Get Widget Configuration
Digunakan saat widget pertama kali di-load (init). Backend harus merespon secepat mungkin (< 100ms).

Endpoint: GET /api/v1/widget/config

Query Params:

project_id (required): UUID Project.

Headers:

Origin (required): Browser otomatis mengirim ini. Backend wajib memvalidasi apakah domain ini ada di domain_whitelist project.

Response (200 OK):

JSON
{
"project_name": "Toko Online Budi",
"theme": {
"primary_color": "#FF5733",
"position": "bottom_right",
"trigger_icon": "chat_bubble"
},
"logic": [
{
"rating_range": [1, 2],
"tags": ["Bug", "Lambat", "Mahal"],
"placeholder": "Apa masalah yang Anda alami?",
"require_email": true
},
{
"rating_range": [3, 4, 5],
"tags": ["Desain", "Pelayanan", "Kecepatan"],
"placeholder": "Apa yang paling Anda suka?",
"require_email": false
}
]
}
Error Responses:

403 Forbidden: Origin domain tidak terdaftar di whitelist.

404 Not Found: Project ID salah atau non-aktif.

B. Submit Feedback
Digunakan saat user menekan tombol "Submit".

Endpoint: POST /api/v1/widget/feedback

Body (JSON Payload):

JSON
{
"project_id": "uuid-string...",
"rating": 2, // Integer 1-5 (Wajib)
"answers": {
"tags": ["Lambat", "Bug"],
"comment": "Pas checkout muter terus.",
"email": "user@gmail.com" // Opsional
},
"meta": {
"url": "https://toko.com/checkout",
"user_agent": "Mozilla/5.0...",
"device_type": "mobile"
}
}
Response (201 Created):

JSON
{
"success": true,
"message": "Feedback received"
} 2. Private Zone: Dashboard API
Authentication: Bearer Token (Session Cookie dari Auth Boilerplate). Context: Semua endpoint di bawah ini berasumsi user sudah login dan memiliki akses ke project_id terkait.

A. Dashboard Statistics (Analytics)
Untuk menampilkan grafik utama di dashboard.

Endpoint: GET /api/dashboard/projects/:id/stats

Query Params:

range: 7d, 30d, this_month.

Response (200 OK):

JSON
{
"summary": {
"total_feedback": 150,
"average_rating": 4.2,
"nps_score": 60
},
"chart_data": [
{ "date": "2023-10-01", "avg_rating": 4.0, "count": 10 },
{ "date": "2023-10-02", "avg_rating": 4.5, "count": 15 }
],
"top_tags": [
{ "tag": "Lambat", "count": 40, "sentiment": "negative" },
{ "tag": "Desain Bagus", "count": 80, "sentiment": "positive" }
]
}
B. Feedback Inbox (Data Table)
Mengambil data feedback mentah untuk tabel, dengan filter dan pagination.

Endpoint: GET /api/dashboard/projects/:id/feedbacks

Query Params:

page: 1 (Default)

limit: 10 (Default)

min_rating: 1 (Opsional)

tag: Bug (Opsional - filter by JSONB tag)

status: new | read | archived

Response (200 OK):

JSON
{
"data": [
{
"id": "uuid-feedback-1",
"rating": 2,
"status": "new",
"answers": {
"tags": ["Bug"],
"comment": "Error login",
"email": "budi@mail.com"
},
"meta": {
"url": "/login",
"browser": "Chrome"
},
"created_at": "2023-10-05T10:00:00Z"
}
],
"pagination": {
"current_page": 1,
"total_pages": 5,
"total_items": 50
}
}
C. Update Feedback Status
Untuk fitur "Mark as Read" atau "Archive".

Endpoint: PATCH /api/dashboard/feedbacks/:feedback_id

Body:

JSON
{
"status": "read" // Enum: 'new', 'read', 'archived'
}
D. Update Project Config (Builder Save)
Ini endpoint yang dipanggil saat user selesai mengedit Widget di menu "Builder".

Endpoint: PATCH /api/dashboard/projects/:id/config

Body:

JSON
{
"widget_config": {
"theme": { ... },
"logic": [ ... ] // JSON Logic Array penuh
},
"domain_whitelist": ["toko.com", "dev.toko.com"]
}
Validasi Backend:

Pastikan JSON logic valid (rating range tidak tumpang tindih).

Pastikan domain_whitelist formatnya URL valid.

E. Project Settings & Distribution
Untuk generate kode installasi dan QR.

Endpoint: GET /api/dashboard/projects/:id/install

Response (200 OK):

JSON
{
"script_snippet": "<script src='...' data-id='...'></script>",
"public_link": "https://app.com/s/toko-budi",
"qr_code_url": "https://api.qr-server.com/..."
}
Notes untuk Developer (Implementation Tips):
Date Handling: Semua created_at harus dalam format ISO 8601 UTC (YYYY-MM-DDTHH:mm:ssZ). Konversi ke waktu lokal user dilakukan di Frontend.

Pagination: Gunakan offset dan limit di query SQL Drizzle Anda untuk endpoint Inbox.

JSONB Querying:

Untuk filter Tags di endpoint Inbox, gunakan operator contains (@>) pada PostgreSQL.

Contoh Drizzle: sql${feedbacks.answers}->'tags' @> ${tag}``
