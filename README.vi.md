<div align="center">

![new-api](/web/public/logo.png)

# New API

🍥 **Hệ thống Quản lý Tài nguyên AI và Cổng API Mô hình Lớn Thế hệ Mới**

<p align="center">
  <a href="./README.zh_CN.md">简体中文</a> |
  <a href="./README.zh_TW.md">繁體中文</a> |
  <a href="./README.en.md">English</a> |
  <a href="./README.fr.md">Français</a> |
  <a href="./README.ja.md">日本語</a> |
  <strong>Tiếng Việt</strong>
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/Calcium-Ion/new-api/main/LICENSE">
    <img src="https://img.shields.io/github/license/Calcium-Ion/new-api?color=brightgreen" alt="license">
  </a>
  <a href="https://github.com/Calcium-Ion/new-api/releases/latest">
    <img src="https://img.shields.io/github/v/release/Calcium-Ion/new-api?color=brightgreen&include_prereleases" alt="release">
  </a>
  <a href="https://github.com/users/Calcium-Ion/packages/container/package/new-api">
    <img src="https://img.shields.io/badge/docker-ghcr.io-blue" alt="docker">
  </a>
  <a href="https://hub.docker.com/r/CalciumIon/new-api">
    <img src="https://img.shields.io/badge/docker-dockerHub-blue" alt="docker">
  </a>
  <a href="https://atomgit.com/QuantumNous/new-api" target="_blank">
    <img alt="AtomGit G-Star" src="https://atomgit.com/QuantumNous/new-api/star/badge.svg"/>
  </a>
</p>

<p align="center">
  <a href="https://trendshift.io/repositories/20180" target="_blank">
    <img src="https://trendshift.io/api/badge/repositories/20180" alt="QuantumNous%2Fnew-api | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/>
  </a>
  <br>
  <a href="https://hellogithub.com/repository/QuantumNous/new-api" target="_blank">
    <img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=539ac4217e69431684ad4a0bab768811&claim_uid=tbFPfKIDHpc4TzR" alt="Featured｜HelloGitHub" style="width: 250px; height: 54px;" width="250" height="54" />
  </a>
  <a href="https://atomgit.com/QuantumNous/new-api" target="_blank">
    <img alt="AtomGit G-Star" src="https://atomgit.com/QuantumNous/new-api/star/new_badge.svg" width="250" height="55" />
  </a>
</p>

<p align="center">
  <a href="#-bắt-đầu-nhanh">Bắt đầu nhanh</a> •
  <a href="#-tính-năng-chính">Tính năng chính</a> •
  <a href="#-triển-khai">Triển khai</a> •
  <a href="#-tài-liệu">Tài liệu</a> •
  <a href="#-hỗ-trợ">Hỗ trợ</a>
</p>

</div>

## 📝 Giới thiệu Dự án

> [!NOTE]  
> Đây là dự án mã nguồn mở được phát triển dựa trên [One API](https://github.com/songquanpeng/one-api).

> [!IMPORTANT]  
> - Dự án này chỉ nhằm mục đích hợp pháp và được cấp phép để làm cổng API AI, xác thực cấp tổ chức, quản lý đa mô hình, phân tích lượng dùng, hạch toán chi phí và triển khai cục bộ/riêng tư.
> - Người dùng phải tự lấy khóa API, tài khoản, dịch vụ mô hình và quyền truy cập từ nhà cung cấp một cách hợp pháp, đồng thời tuân thủ điều khoản dịch vụ của bên cung cấp cùng luật pháp và quy định hiện hành.
> - Khi cung cấp dịch vụ AI tạo sinh ra công chúng, người dùng cần tuân thủ đầy đủ các yêu cầu quản lý, giấy phép, an toàn nội dung, định danh, lưu trữ nhật ký, thuế và nghĩa vụ ủy quyền liên quan.

---

## 🤝 Đối tác Tin cậy

<p align="center">
  <em>Sắp xếp ngẫu nhiên</em>
</p>

<p align="center">
  <a href="https://www.cherry-ai.com/" target="_blank">
    <img src="./docs/images/cherry-studio.png" alt="Cherry Studio" height="80" />
  </a>
  <a href="https://bda.pku.edu.cn/" target="_blank">
    <img src="./docs/images/pku.png" alt="Peking University" height="80" />
  </a>
  <a href="https://www.compshare.cn/?ytag=GPU_yy_gh_newapi" target="_blank">
    <img src="./docs/images/ucloud.png" alt="UCloud" height="80" />
  </a>
  <a href="https://www.aliyun.com/" target="_blank">
    <img src="./docs/images/aliyun.png" alt="Alibaba Cloud" height="80" />
  </a>
  <a href="https://io.net/" target="_blank">
    <img src="./docs/images/io-net.png" alt="IO.NET" height="80" />
  </a>
</p>

---

## 🙏 Lời cảm ơn Đặc biệt

<p align="center">
  <a href="https://www.jetbrains.com/?from=new-api" target="_blank">
    <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.png" alt="JetBrains Logo" width="120" />
  </a>
</p>

<p align="center">
  <strong>Cảm ơn <a href="https://www.jetbrains.com/?from=new-api">JetBrains</a> đã cung cấp giấy phép phát triển mã nguồn mở miễn phí cho dự án này</strong>
</p>

---

## 🚀 Bắt đầu Nhanh

### Sử dụng Docker Compose (Khuyên dùng)

```bash
# Clone repository
git clone https://github.com/QuantumNous/new-api.git
cd new-api

# Chỉnh sửa cấu hình docker-compose.yml
nano docker-compose.yml

# Khởi chạy dịch vụ
docker-compose up -d
```

<details>
<summary><strong>Sử dụng lệnh Docker thuần</strong></summary>

```bash
# Tải image mới nhất
docker pull calciumion/new-api:latest

# Sử dụng SQLite (mặc định)
docker run --name new-api -d --restart always \
  -p 3000:3000 \
  -e TZ=UTC \
  -v ./data:/data \
  calciumion/new-api:latest

# Sử dụng MySQL
docker run --name new-api -d --restart always \
  -p 3000:3000 \
  -e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi" \
  -e TZ=UTC \
  -v ./data:/data \
  calciumion/new-api:latest
```

> **💡 Mẹo:** `-v ./data:/data` sẽ lưu trữ dữ liệu tại thư mục `data` hiện tại, bạn có thể đổi thành đường dẫn tuyệt đối như `-v /your/custom/path:/data`.

</details>

---

🎉 Sau khi triển khai xong, hãy mở `http://localhost:3000` để bắt đầu sử dụng!

> [!WARNING]
> Khi vận hành dự án này như một dịch vụ AI tạo sinh công cộng hoặc dịch vụ bán lại API, người dùng cần hoàn thành đầy đủ tất cả các nghĩa vụ pháp lý, cấp phép, an toàn nội dung, xác thực danh tính, lưu nhật ký, thuế, thanh toán và ủy quyền từ các nhà cung cấp nguồn.

📖 Để tìm hiểu thêm các phương thức triển khai khác, vui lòng tham khảo [Hướng dẫn Cài đặt](https://docs.newapi.pro/en/docs/installation).

---

## 📚 Tài liệu

<div align="center">

### 📖 [Tài liệu Chính thức](https://docs.newapi.pro/en/docs) | [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/QuantumNous/new-api)

</div>

**Điều hướng Nhanh:**

| Danh mục | Liên kết |
|------|------|
| 🚀 Hướng dẫn Triển khai | [Tài liệu Cài đặt](https://docs.newapi.pro/en/docs/installation) |
| ⚙️ Cấu hình Môi trường | [Biến Môi trường](https://docs.newapi.pro/en/docs/installation/config-maintenance/environment-variables) |
| 📡 Tài liệu API | [API Documentation](https://docs.newapi.pro/en/docs/api) |
| ❓ Câu hỏi Thường gặp | [FAQ](https://docs.newapi.pro/en/docs/support/faq) |
| 💬 Tương tác Cộng đồng | [Kênh Trao đổi](https://docs.newapi.pro/en/docs/support/community-interaction) |

---

## ✨ Tính năng Chính

> Để xem chi tiết các tính năng, vui lòng đọc [Giới thiệu Tính năng](https://docs.newapi.pro/en/docs/guide/wiki/basic-concepts/features-introduction).

### 🎨 Chức năng Cốt lõi

| Tính năng | Mô tả |
|------|------|
| 🎨 Giao diện Bento Hiện đại | Thiết kế Obsidian Dark kính mờ chuẩn Developer-First với dữ liệu thống kê trực quan |
| 🌍 Đa ngôn ngữ | Hỗ trợ Tiếng Việt, Tiếng Anh, Tiếng Trung, Tiếng Pháp, Tiếng Nhật, Tiếng Nga |
| 🔄 Tương thích Dữ liệu | Tương thích đồng thời với SQLite, MySQL và PostgreSQL |
| 📈 Bảng Điều khiển Dữ liệu | Theo dõi SLA thời gian hoạt động, đo độ trễ mô hình và dự báo thời gian sử dụng số dư (Runway) |
| 🔒 Quản lý Quyền hạn | Phân nhóm Token, giới hạn mô hình, quản lý người dùng và phiên đăng nhập |

### 💰 Cổng Thanh toán & Tính phí Thời gian thực

- ✅ **Chuyển khoản Ngân hàng VietQR**: Tự động sinh mã QR động, đẩy dữ liệu thời gian thực qua Server-Sent Events (SSE), phí 0% và cộng số dư ngay lập tức
- ✅ **Cổng Crypto NOWPayments**: Hỗ trợ thanh toán tự động đa đồng tiền mã hóa (USDT, BTC, ETH, SOL) với tỷ giá chuyển đổi trực tiếp
- ✅ **Công cụ Tính giá Phân tầng (Tiered Pricing)**: Hỗ trợ quy tắc thời gian (`hour >= 8 && hour < 20`, khung giờ qua đêm), điều kiện header và tham số body
- ✅ **Hạch toán Prompt Caching**: Thống kê và chiết khấu cache chi tiết cho OpenAI, Claude, DeepSeek, Azure và Gemini
- ✅ **Kiến trúc Zero-Polling**: Đẩy trạng thái giao dịch qua SSE và WebSocket với độ trễ sub-millisecond

### 🔐 Xác thực & Bảo mật Cấp cao

- 🛡️ **Xác thực 2 Lớp (2FA)**: Hỗ trợ mã xác thực TOTP (Google Authenticator, Microsoft Authenticator, 1Password)
- 🌐 **Cloudflare Turnstile**: Chống bot AI và xác thực thông minh tự động
- 📱 **Đa dạng OAuth**: GitHub, Discord, LinuxDO, Telegram, WeChat, OIDC và Custom OAuth với tính năng hủy liên kết linh hoạt
- 📋 **Quản lý Phiên Đăng nhập**: Kiểm tra các thiết bị đang hoạt động và đăng xuất từ xa chỉ với một chạm
- 🔑 **Công cụ Quản lý API Key**: Tích hợp tra cứu và quản lý token với [new-api-key-tool](https://github.com/Calcium-Ion/new-api-key-tool)

### 🚀 Tính năng Nâng cao

**Hỗ trợ Định dạng API:**
- ⚡ [OpenAI Responses](https://docs.newapi.pro/en/docs/api/ai-model/chat/openai/create-response)
- ⚡ [OpenAI Realtime API](https://docs.newapi.pro/en/docs/api/ai-model/realtime/create-realtime-session) (bao gồm Azure)
- ⚡ [Claude Messages](https://docs.newapi.pro/en/docs/api/ai-model/chat/create-message)
- ⚡ [Google Gemini](https://doc.newapi.pro/en/api/google-gemini-chat)
- 🔄 [Mô hình Rerank](https://docs.newapi.pro/en/docs/api/ai-model/rerank/create-rerank) (Cohere, Jina)

**Định tuyến Thông minh:**
- ⚖️ Ngẫu nhiên theo trọng số kênh (Weighted Load Balancing)
- 🔄 Tự động thử lại khi kênh gặp sự cố (Failover Retry)
- 🚦 Giới hạn tốc độ theo người dùng và mô hình (Rate Limiting)

**Chuyển đổi Định dạng:**
- 🔄 **Tương thích OpenAI ⇄ Claude Messages**
- 🔄 **Tương thích OpenAI → Google Gemini**
- 🔄 **Google Gemini → Tương thích OpenAI** (Chế độ văn bản)
- 🔄 **Chuyển đổi Thinking sang nội dung phản hồi**

---

## 🤖 Hỗ trợ Mô hình

> Chi tiết tham khảo [Tài liệu API - Giao diện Cổng](https://docs.newapi.pro/en/docs/api).

| Loại mô hình | Mô tả | Tài liệu |
|---------|------|------|
| 🤖 OpenAI GPTs | Dòng gpt-4-gizmo-* | - |
| 🎨 Midjourney-Proxy | [Midjourney-Proxy(Plus)](https://github.com/novicezk/midjourney-proxy) | [Tài liệu](https://doc.newapi.pro/en/api/midjourney-proxy-image) |
| 🎵 Suno-API | [Suno API](https://github.com/Suno-API/Suno-API) | [Tài liệu](https://doc.newapi.pro/en/api/suno-music) |
| 🔄 Rerank | Cohere, Jina | [Tài liệu](https://docs.newapi.pro/en/docs/api/ai-model/rerank/create-rerank) |
| 💬 Claude | Định dạng Messages | [Tài liệu](https://docs.newapi.pro/en/docs/api/ai-model/chat/create-message) |
| 🌐 Gemini | Định dạng Google Gemini | [Tài liệu](https://doc.newapi.pro/en/api/google-gemini-chat) |
| 🔧 Dify | Chế độ ChatFlow | - |
| 🎯 Kênh tùy chỉnh | Hỗ trợ cấu hình các điểm cuối thượng nguồn được ủy quyền hợp pháp | - |

---

## 🚢 Triển khai

> [!TIP]
> **Docker image mới nhất:** `calciumion/new-api:latest`

### 📋 Yêu cầu Hệ thống

| Thành phần | Yêu cầu |
|------|------|
| **Cơ sở dữ liệu cục bộ** | SQLite (Docker cần mount thư mục `/data`) |
| **Cơ sở dữ liệu máy chủ** | MySQL ≥ 5.7.8 hoặc PostgreSQL ≥ 9.6 |
| **Công cụ container** | Docker / Docker Compose |
| **Kiến trúc CPU** | Chỉ hỗ trợ 64-bit (amd64 / arm64); không hỗ trợ hệ thống 32-bit |

### ⚙️ Cấu hình Biến Môi trường Phổ biến

<details>
<summary>Bảng cấu hình biến môi trường chính</summary>

| Tên biến | Mô tả | Giá trị mặc định |
|--------|------|--------|
| `SESSION_SECRET` | Khóa bí mật ký xác thực phiên làm việc; phải giống nhau trên mọi node | - |
| `SESSION_COOKIE_SECURE` | `false`/để trống tắt OriginGuard khi chạy HTTP dev; `true` bật cookie Secure và kiểm tra Origin nghiêm ngặt trên HTTPS | `false` |
| `SESSION_COOKIE_TRUSTED_URL` | Bắt buộc khi bật Secure: danh sách các HTTPS Origin chính xác được phép gọi refresh/logout | - |
| `TRUSTED_PROXIES` | Danh sách IP/CIDR proxy tin cậy | `127.0.0.0/8, ::1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7` |
| `SQL_DSN` | Chuỗi kết nối cơ sở dữ liệu (PostgreSQL/MySQL) | - |
| `REDIS_CONN_STRING` | Chuỗi kết nối Redis | - |
| `STREAMING_TIMEOUT` | Thời gian chờ phản hồi stream (giây) | `300` |
| `ERROR_LOG_ENABLED` | Bật/tắt ghi nhật ký lỗi | `false` |

📖 **Tài liệu cấu hình đầy đủ:** [Tài liệu Biến Môi trường](https://docs.newapi.pro/en/docs/installation/config-maintenance/environment-variables)

</details>

---

## 🔗 Dự án Liên quan

### Dự án Thượng nguồn

| Dự án | Mô tả |
|------|------|
| [One API](https://github.com/songquanpeng/one-api) | Nền tảng dự án gốc |
| [Midjourney-Proxy](https://github.com/novicezk/midjourney-proxy) | Hỗ trợ giao diện Midjourney |

### Công cụ Hỗ trợ

| Dự án | Mô tả |
|------|------|
| [new-api-key-tool](https://github.com/Calcium-Ion/new-api-key-tool) | Công cụ tra cứu hạn mức API key |
| [new-api-horizon](https://github.com/Calcium-Ion/new-api-horizon) | Phiên bản tối ưu hóa hiệu năng cao New API |

---

## 💬 Hỗ trợ & Đóng góp

### 📖 Kênh Tài liệu & Phản hồi

| Tài nguyên | Liên kết |
|------|------|
| 📘 FAQ | [Câu hỏi Thường gặp](https://docs.newapi.pro/en/docs/support/faq) |
| 💬 Trao đổi | [Kênh Giao tiếp](https://docs.newapi.pro/en/docs/support/community-interaction) |
| 🐛 Báo lỗi | [Issue Feedback](https://docs.newapi.pro/en/docs/support/feedback-issues) |
| 📚 Toàn bộ Tài liệu | [Tài liệu Chính thức](https://docs.newapi.pro/en/docs) |

---

<div align="center">

### 💖 Cảm ơn bạn đã sử dụng New API

Nếu dự án hữu ích với bạn, hãy ủng hộ chúng tôi bằng một ⭐️ Star！

**[Tài liệu Chính thức](https://docs.newapi.pro/en/docs)** • **[Phản hồi Sự cố](https://github.com/Calcium-Ion/new-api/issues)** • **[Bản phát hành Mới nhất](https://github.com/Calcium-Ion/new-api/releases)**

<sub>Built with ❤️ by QuantumNous</sub>

</div>
