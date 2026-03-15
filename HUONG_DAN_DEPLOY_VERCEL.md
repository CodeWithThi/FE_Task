# 🚀 Hướng Dẫn Deploy Frontend Lên Vercel

## 📋 Tổng quan kiến trúc deploy

```
┌─────────────────────────────────────────────────┐
│                 NGƯỜI DÙNG                       │
│            (truy cập bằng trình duyệt)           │
└──────────┬────────────────────┬─────────────────┘
           │                    │
     ┌─────▼──────┐     ┌──────▼───────┐
     │   VERCEL   │     │   RAILWAY    │
     │  (Frontend)│────▶│  (Backend)   │
     │  FE_Task   │ API │  BE_App      │
     │  Miễn phí  │     │  ~$5/tháng   │
     └────────────┘     └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │   RAILWAY    │
                        │  (MySQL DB)  │
                        └──────────────┘
```

---

## ⚡ Điều kiện trước khi bắt đầu

- [x] Có tài khoản GitHub, code đã push lên GitHub
- [x] Backend (BE_App) đã deploy trên Railway và chạy OK
- [ ] Biết URL public của Backend trên Railway (ví dụ: `https://be-app-production-xxxx.up.railway.app`)

> ⚠️ **QUAN TRỌNG:** Bạn PHẢI deploy Backend trên Railway thành công trước. Frontend cần gọi API đến Backend.

---

## Bước 1: Tạo file `vercel.json` (SPA Rewrite)

Tạo file `vercel.json` trong thư mục `FE_Task/`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

> **Giải thích:** App dùng React Router (BrowserRouter), nên khi người dùng truy cập URL như `/dashboard` hoặc `/login`, Vercel cần redirect tất cả về `index.html` để React xử lý routing.

**Sau đó commit và push lên GitHub:**

```bash
cd FE_Task
git add vercel.json
git commit -m "Add vercel.json for SPA routing"
git push
```

---

## Bước 2: Đăng ký & Import Project trên Vercel

1. Truy cập **[https://vercel.com](https://vercel.com)**
2. Click **"Sign Up"** → chọn **"Continue with GitHub"**
3. Sau khi đăng nhập, click **"Add New..."** → **"Project"**
4. Tìm và chọn **repository GitHub** chứa code của bạn
5. Click **"Import"**

---

## Bước 3: Cấu hình Project trên Vercel

Ở trang **Configure Project**, điền như sau:

| Mục | Giá trị |
|---|---|
| **Project Name** | `fe-task` (hoặc tên tuỳ bạn) |
| **Framework Preset** | `Vite` (Vercel thường tự detect) |
| **Root Directory** | Click **"Edit"** → nhập **`FE_Task`** |
| **Build Command** | `npm run build` (mặc định, không cần sửa) |
| **Output Directory** | `dist` (mặc định, không cần sửa) |

> ⚠️ **RẤT QUAN TRỌNG:** Vì repo của bạn có cả `BE_App` và `FE_Task`, bạn **PHẢI set Root Directory = `FE_Task`**. Nếu không Vercel sẽ không tìm được `package.json`.

---

## Bước 4: Thêm Environment Variables

Ở phần **"Environment Variables"** (cùng trang Configure), thêm:

| Tên biến | Giá trị |
|---|---|
| `VITE_API_URL` | `https://YOUR-RAILWAY-BACKEND-URL/api/v1` |
| `VITE_API_BASE_URL` | `https://YOUR-RAILWAY-BACKEND-URL` |

**Ví dụ cụ thể:**

```
VITE_API_URL = https://be-app-production-a1b2.up.railway.app/api/v1
VITE_API_BASE_URL = https://be-app-production-a1b2.up.railway.app
```

> **Lưu ý:** Thay `YOUR-RAILWAY-BACKEND-URL` bằng URL thật của Backend trên Railway. Lấy URL này ở Railway → Backend service → Settings → Networking → Public Domain.

---

## Bước 5: Deploy!

1. Click **"Deploy"**
2. Đợi Vercel build (thường 1-3 phút)
3. Khi thấy **"Congratulations!"** → Deploy thành công ✅
4. Vercel sẽ cho bạn URL dạng: `https://fe-task-xxxx.vercel.app`

---

## Bước 6: Cập nhật CORS trên Railway Backend

Sau khi có URL Vercel, bạn cần **cho phép Backend chấp nhận request từ Frontend**:

1. Vào **Railway Dashboard** → Backend service → **Variables**
2. Thêm hoặc sửa biến:

```
CORS_ORIGIN = https://fe-task-xxxx.vercel.app
```

> Nếu muốn cho phép nhiều URL (ví dụ cả localhost khi dev), dùng dấu phẩy:
> ```
> CORS_ORIGIN = https://fe-task-xxxx.vercel.app,http://localhost:8080
> ```

3. Railway sẽ tự redeploy sau khi sửa biến

---

## Bước 7: Test toàn bộ hệ thống

1. Mở URL Vercel: `https://fe-task-xxxx.vercel.app`
2. Thử **đăng nhập** → kiểm tra API có gọi được không
3. Mở **F12 → Console** → kiểm tra không có lỗi CORS
4. Thử các tính năng: tạo task, upload file, v.v.

---

## 🔧 Xử lý lỗi thường gặp

### Lỗi 1: "CORS error" hoặc "blocked by CORS policy"
**Nguyên nhân:** Backend chưa cho phép URL Vercel.
**Fix:** Thêm `CORS_ORIGIN` trên Railway (Bước 6).

### Lỗi 2: API trả về 404 hoặc không kết nối được
**Nguyên nhân:** `VITE_API_URL` sai hoặc Backend chưa chạy.
**Fix:**
- Kiểm tra Backend đã chạy trên Railway chưa (xem logs)
- Kiểm tra giá trị `VITE_API_URL` trên Vercel có đúng không (có `https://`, không có `/` ở cuối)

### Lỗi 3: Trắng trang khi vào URL con (vd: `/dashboard`)
**Nguyên nhân:** Thiếu `vercel.json` rewrite.
**Fix:** Tạo file `vercel.json` như Bước 1.

### Lỗi 4: Build lỗi trên Vercel
**Nguyên nhân:** Có thể do Root Directory chưa set đúng.
**Fix:** Vào Vercel → Settings → General → Root Directory → đổi thành `FE_Task`.

---

## 🔄 Auto Deploy (tự động)

Sau khi setup xong, mỗi lần bạn **push code lên GitHub**, Vercel sẽ **tự động build và deploy** phiên bản mới. Không cần làm gì thêm!

```bash
git add .
git commit -m "Update feature X"
git push
# → Vercel tự động deploy bản mới ✅
```

---

## 📌 Cập nhật biến môi trường sau deploy

Nếu cần sửa `VITE_API_URL` sau này:

1. Vào **Vercel Dashboard** → chọn project
2. Click **"Settings"** → **"Environment Variables"**
3. Sửa giá trị
4. **QUAN TRỌNG:** Phải **Redeploy** lại để thay đổi có hiệu lực
   - Vào tab **"Deployments"** → click **"..."** ở deployment mới nhất → **"Redeploy"**

> Vite nhúng biến env lúc build, nên sửa biến xong phải build lại.

---

## ✅ Checklist tổng hợp

- [ ] Tạo file `vercel.json` trong `FE_Task/` và push lên GitHub
- [ ] Đăng ký Vercel bằng GitHub
- [ ] Import project, set **Root Directory = `FE_Task`**
- [ ] Thêm `VITE_API_URL` = URL Backend Railway + `/api/v1`
- [ ] Thêm `VITE_API_BASE_URL` = URL Backend Railway
- [ ] Click Deploy và đợi build thành công
- [ ] Quay lại Railway, thêm `CORS_ORIGIN` = URL Vercel
- [ ] Test đăng nhập và các tính năng
