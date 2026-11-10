# AQŞİN BABAYEV — 90

Bu layihə Aqşin Babayevin 90 illik yubileyi münasibətilə yaradılmış rəqəmsal ədəbi memorial və arxiv saytıdır. Layihə statik HTML, CSS və JavaScript ilə qurulub.

## Başlamaq

1. Repository root qovluğunda ( `.git`, `index.html` və `assets/` olan qovluqda) terminal açın.
2. Kompleks serveri işə salın:
   ```bash
   python -m http.server 8000
   ```
3. Brauzerdə bu ünvanı açın: http://localhost:8000

## Vercel deployment

- Vercel layihəsi GitHub repository `lamirashid13/aqsin`-ə və `main` branch-inə qoşulmalıdır.
- Root Directory repository root olmalıdır: `.` (bu qovluqda `index.html`, `assets/` və `pages/` yerləşir).
- Bu statik sayt üçün Build Command təyin etməyin və Output Directory override etməyin.
- Deployment-dən sonra `/assets/images/portretlife2.jpeg` ünvanının HTTP 200 qaytardığını yoxlayın.

## Struktur

- `index.html` — əsas ana səhifə
- `pages/` — əlavə səhifələr
- `assets/css/styles.css` — stil və dizayn sistemi
- `assets/js/app.js` — interaktivlik və filtrlər
- `assets/js/site-data.js` — məlumatlar və fotoqalereya siyahısı
- `assets/images/placeholder/` — yer tutucu qrafiklər

## Məzmunu dəyişmək

- Mətni dəyişmək üçün HTML fayllarını redaktə edin.
- Timeline və digər məlumatları `site-data.js` içərisindən dəyişə bilərsiniz.
- Qalereya elementlərini `site-data.js` içərisində artırın.

## Məhdudiyyətlər

Layihədə istifadə olunan foto, audio və video materiallar hələ tam şəkildə təqdim olunmayıb. Düzgün arxiv şəkilləri əlavə edildikdə, `site-data.js` içindəki yollar dəyişdirilir.
