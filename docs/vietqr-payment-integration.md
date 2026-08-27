# VietQR & MBBank Automated Payment Integration Guide

This document explains the architecture, configuration, deployment, and operation of the **VietQR automated payment gateway** and **Telegram management bot** integrated into the platform.

---

## 1. System Architecture

```
[Khách hàng / User]
       │ (1. Chọn số tiền & Quota)
       ▼
[Frontend / React 19]
       │ (2. POST /api/user/vietqr/pay)
       ▼
[Backend / Go API Gateway] ◄── (Tính tỷ giá Real-time từ Binance P2P / CoinGecko)
       │ (3. Sinh mã đơn KCxxxxxx & VietQR Image URL)
       ▼
[Khách hàng quét mã VietQR trên App Ngân hàng]
       │ (4. Chuyển tiền tới MBBank với nội dung "KCxxxxxx")
       ▼
[Điện thoại Android nhận thông báo biến động số dư MBBank]
       │
       ▼
[Termux Event Listener (mbbank_listener.py)] ── (0% CPU, đọc stream Logcat realtime)
       │
       │ (5. POST /api/vietqr/webhook kèm X-Webhook-Secret)
       ▼
[Backend / Webhook Handler]
       ├─► (Kiểm tra X-Webhook-Secret & Rate Limit)
       ├─► (Phân tích cú pháp: Bóc tách chính xác số tiền GD: và mã đơn KCxxxxxx trong ND:)
       ├─► (Chống gian lận: Kiểm tra số tiền thực chuyển >= số tiền yêu cầu)
       ├─► (Tự động cộng Quota & cập nhật trạng thái đơn thành công)
       └─► (Gửi thông báo nạp thành công tức thì về Telegram Bot Admin)
```

---

## 2. Environment Configuration (`.env`)

Tất cả các tham số cấu hình đều được tải tự động từ file `.env` (không hardcode trong source code).

```env
# ==============================================================================
# VIETQR PAYMENT CONFIGURATION
# ==============================================================================

# Bật/Tắt cổng thanh toán VietQR
VIETQR_ENABLED=true

# Thông tin tài khoản ngân hàng nhận tiền
VIETQR_BANK_ID=MB
VIETQR_ACCOUNT_NO=your_bank_account_number
VIETQR_ACCOUNT_NAME=YOUR_ACCOUNT_NAME

# Mức nạp tối thiểu (USD)
VIETQR_MIN_TOPUP=1

# Tỷ lệ phí duy trì hạ tầng (+2%)
VIETQR_INFRA_FEE_RATIO=0.02

# Khóa bí mật xác thực Webhook gửi từ Termux
VIETQR_WEBHOOK_SECRET=your_secret_webhook_key

# Tỷ giá dự phòng & Thời gian Cache tỷ giá (Phút)
VIETQR_DEFAULT_RATE=25800.0
VIETQR_RATE_CACHE_MINUTES=2

# Endpoints lấy tỷ giá USDT/VND Real-time
BINANCE_P2P_API_URL=https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search
COINGECKO_API_URL=https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd,vnd

# ==============================================================================
# TELEGRAM BOT & ADMIN MANAGEMENT
# ==============================================================================

TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_ADMIN_ID=your_telegram_user_id

# ==============================================================================
# SECURITY & AUTO-BAN ENGINE
# ==============================================================================

SECURITY_AUTO_BAN_ENABLED=true
SECURITY_IP_MAX_RPS=15
SECURITY_USER_MAX_RPS=10
SECURITY_BAN_DURATION_MINUTES=60
```

---

## 3. Termux Event-Driven Listener on Android

Không sử dụng cron polling gây hao pin và nóng máy. Script sử dụng cơ chế **Blocking Logcat Stream Event-Driven** (0% CPU khi rảnh, phản hồi mili-giây khi có thông báo ngân hàng).

### Cài đặt trên Android:
1. Cài đặt **Termux**, **Termux:API**, và **Termux:Boot** từ F-Droid.
2. Cấp quyền Thông báo và quyền Chạy ngầm không giới hạn pin cho Termux & MBBank.
3. Trong Termux, cài đặt Python & Requests:
   ```bash
   pkg update && pkg install -y python python-pip termux-api
   pip install requests
   ```
4. Lưu script `mbbank_listener.py`:
   ```python
   import subprocess, json, time, requests, re

   WEBHOOK_URL = "https://your-domain.com/api/vietqr/webhook"
   WEBHOOK_SECRET = "your_secret_webhook_key"

   print("🚀 MBBank Notification Listener is running...")

   def check_and_forward(content):
       if "MB" in content or "TK" in content or "SD" in content or "GD" in content:
           print(f"[{time.strftime('%H:%M:%S')}] Detected MBBank Notification: {content}")
           try:
               headers = {
                   "Content-Type": "application/json",
                   "X-Webhook-Secret": WEBHOOK_SECRET
               }
               payload = {"content": content}
               resp = requests.post(WEBHOOK_URL, json=payload, headers=headers, timeout=10)
               print(f"[{time.strftime('%H:%M:%S')}] Server Response: {resp.status_code} - {resp.text}")
           except Exception as e:
               print(f"[{time.strftime('%H:%M:%S')}] Forwarding Error: {e}")

   # Blocking stream logcat filter
   process = subprocess.Popen(
       ["logcat", "-v", "brief", "*:S", "NotificationService:V", "StatusBarNotification:V"],
       stdout=subprocess.PIPE,
       stderr=subprocess.STDOUT,
       text=True
   )

   for line in process.stdout:
       if "MBBank" in line or "mbbank" in line:
           # Trigger instant check via Termux API
           try:
               out = subprocess.check_output(["termux-notification-list"])
               notifs = json.loads(out)
               for n in notifs:
                   if "mbbank" in n.get("packageName", "").lower() or "mb" in n.get("title", "").lower():
                       full_text = f"{n.get('title', '')} {n.get('content', '')}"
                       check_and_forward(full_text)
           except Exception as err:
               pass
   ```
5. **Cấu hình Autostart khi khởi động máy**:
   Tạo file `~/.termux/boot/start-mbbank.sh`:
   ```bash
   #!/data/data/com.termux/files/usr/bin/bash
   termux-wake-lock
   python /data/data/com.termux/files/home/mbbank_listener.py > /data/data/com.termux/files/home/listener.log 2>&1 &
   ```
   Cấp quyền: `chmod +x ~/.termux/boot/start-mbbank.sh`

---

## 4. Telegram Bot Management Suite

Bot Telegram (`TelegramBotToken`) tích hợp bàn phím tương tác nhanh (Persistent Reply Keyboard) và bộ lệnh quản trị bảo mật cho Admin:

### Nút bấm nhanh (Reply Keyboard Box):
- 📊 **Thống kê**: Báo cáo doanh thu hôm nay, tháng này, tổng toàn thời gian (VNĐ & USD), số lượng đơn thành công/chờ.
- 🕒 **Đơn gần đây**: Danh sách 10 giao dịch nạp VietQR/Crypto mới nhất (Mã đơn, Số tiền, User ID, Trạng thái, Thời gian).
- 💵 **Tỷ giá & Phí**: Tỷ giá USDT/VNĐ Real-time từ Binance P2P, tỷ giá đơn gần nhất, cấu hình STK MBBank.
- 🔍 **Tra cứu đơn**: Tra cứu đơn nạp theo mã (`/order KCxxxxxx`). Nếu đơn đang chờ, bot đính kèm nút `[✅ Duyệt]` / `[❌ Hủy]`.
- 👤 **Tra cứu User**: Xem số dư USD, email, nhóm quyền, ngày đăng ký (`/user <id|username>`).
- 🆔 **My ID**: Xem Telegram ID & Chat ID.

### Lệnh Quản trị & Cứu hộ:
- `/addquota <user_id> <số_usd>`: Nạp tiền/Quota thủ công trực tiếp cho User.
- `/banned`: Xem danh sách toàn bộ IP đang bị hệ thống Auto-Ban khóa.
- `/unban <ip|user_id>`: Mở khóa IP hoặc kích hoạt lại tài khoản User bị khóa.
- `/help`: Xem hướng dẫn sử dụng bot.

---

## 5. Security & Rate Limiting Rules

1. **Auto-Ban Engine (`middleware/security_ban.go`)**:
   - **IP Flood Protection**: Nếu 1 IP gửi `> 15 req/s` ➜ Tự động khóa IP trong **60 phút** (`403 Forbidden`) và bắn cảnh báo khẩn cấp về Telegram Admin.
   - **User Spam Protection**: Nếu 1 User gửi `> 10 req/s` ➜ Tự động vô hiệu hóa tài khoản (`Disabled`) và báo về Telegram Admin.
2. **Endpoint Rate Limits**:
   - **Auth APIs** (`/login`, `/register`, `/reset`): `5 req / 60s`.
   - **Payment APIs** (`/vietqr/*`, `/stripe/*`, `/payos/*`): `10 req / 60s`.
   - **Webhook APIs** (`/vietqr/webhook`, etc.): `30 req / 60s`.
   - **User Self APIs**: `60 req / 60s`.
   - **Admin APIs**: `120 req / 60s`.
   - **Public Read APIs**: `100 req / 60s`.
   - **AI Proxy (`/v1/*`)**: Cấu hình độc lập theo Token/Channel.
3. **Đa ngôn ngữ i18n**:
   - Tất cả lỗi rate limit (`429 Too Many Requests`) và auto-ban (`403 Forbidden`) đều trả về JSON chuẩn hóa và tự động dịch theo ngôn ngữ của khách hàng (`vi`, `en`, `zh`, `zh-TW`, `ja`, `fr`, `ru`).
