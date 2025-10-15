# ViePropChain - Real Estate Infrastructure Platform

## 📖 Giới thiệu / Introduction

**ViePropChain** là một nền tảng hạ tầng bất động sản dựa trên công nghệ Blockchain và Web3, kết hợp dữ liệu thống nhất, xác thực blockchain và khả năng sẵn sàng AI để tạo ra một hệ sinh thái bất động sản minh bạch, an toàn và hiệu quả.

**ViePropChain** is a blockchain-based real estate infrastructure platform that combines unified data, blockchain validation, and AI-readiness to create a transparent, secure, and efficient real estate ecosystem.

---

## 🎯 Mục tiêu Dự án / Project Goals

- Xây dựng nền tảng dữ liệu bất động sản thống nhất và chuẩn hóa
- Tích hợp công nghệ Blockchain để đảm bảo tính minh bạch và bảo mật
- Tạo ra thị trường NFT cho bất động sản
- Cung cấp công cụ phân tích và quản lý tài sản thông minh
- Hỗ trợ đa ngôn ngữ (Tiếng Việt / English)

---

## 🚀 Các Chức năng Chính / Main Features

### 1. **Smart Contract - Hợp đồng Thông minh**

#### ViePropChainNFT Contract

- **Mint NFT**: Tạo NFT đại diện cho tài sản bất động sản
- **ERC721 Standard**: Tuân thủ chuẩn ERC721 với URI Storage
- **Owner Management**: Quản lý quyền sở hữu tài sản
- **Metadata Storage**: Lưu trữ thông tin chi tiết của tài sản trên IPFS/URI

#### Marketplace Contract

- **List Property**: Niêm yết tài sản NFT lên sàn giao dịch
- **Buy Property**: Mua bán tài sản NFT trực tiếp
- **Cancel Listing**: Hủy niêm yết tài sản
- **Fee Management**: Quản lý phí giao dịch (fee percentage)
- **Transaction Status**: Theo dõi trạng thái giao dịch (Active, Sold, Cancelled)
- **Secure Escrow**: Hệ thống ký quỹ an toàn cho giao dịch

### 2. **Frontend Features - Tính năng Giao diện**

#### 🏠 Landing Page

- **Hero Section**: Giới thiệu tổng quan về nền tảng
- **Platform Architecture**: Hiển thị kiến trúc 3 lớp của hệ thống:
  - **Layer 1 - Propchain Cloud**: Thu thập và chuẩn hóa dữ liệu
  - **Layer 2 - Blockchain Validation**: Xác thực và bảo mật dữ liệu
  - **Layer 3 - Purpose-built Solutions**: Giải pháp chuyên biệt
- **Stakeholders Section**: Giới thiệu các bên liên quan
- **Global Statistics**: Thống kê tác động toàn cầu
- **Responsive Design**: Thiết kế responsive, tương thích mọi thiết bị

#### 🌐 Multi-language Support

- **Tiếng Việt / English**: Chuyển đổi ngôn ngữ dễ dàng
- **Context API**: Quản lý ngôn ngữ toàn ứng dụng
- **Complete Translation**: Dịch thuật đầy đủ mọi phần của ứng dụng

#### 🎨 UI/UX Features

- **Framer Motion**: Hiệu ứng animation mượt mà
- **Parallax Scrolling**: Hiệu ứng cuộn parallax
- **Interactive Components**: Các component tương tác thông minh
- **Modern Design**: Thiết kế hiện đại với Tailwind CSS và Bulma

#### 💼 Wallet Integration

- **MetaMask Connection**: Kết nối ví MetaMask
- **Web3 Integration**: Tích hợp Web3.js cho tương tác blockchain
- **Account Management**: Quản lý tài khoản và địa chỉ ví
- **Transaction Signing**: Ký và gửi giao dịch blockchain

### 3. **Data Management - Quản lý Dữ liệu**

- **Unified Data Foundation**: Nền tảng dữ liệu thống nhất
- **Data Normalization**: Chuẩn hóa dữ liệu từ nhiều nguồn
- **Data Enrichment**: Làm giàu dữ liệu với thông tin bổ sung
- **Secure Data Sharing**: Chia sẻ dữ liệu an toàn với kiểm soát truy cập
- **APIs & Governance**: API và quản trị cấp doanh nghiệp

### 4. **Blockchain Features - Tính năng Blockchain**

- **Provenance & Integrity**: Nguồn gốc và toàn vẹn dữ liệu
- **Smart Contract Templates**: Mẫu hợp đồng thông minh
- **Compliance-ready**: Sẵn sàng tuân thủ quy định
- **Interoperability**: Khả năng tương tác với các hệ thống khác
- **Tokenization**: Hỗ trợ token hóa tài sản

### 5. **Analytics & Reporting - Phân tích & Báo cáo**

- **Portfolio Analytics**: Phân tích danh mục đầu tư
- **Market Intelligence**: Thông tin thị trường
- **Risk Assessment**: Đánh giá rủi ro
- **ESG Compliance**: Tuân thủ tiêu chuẩn ESG
- **Automated Reporting**: Báo cáo tự động

---

## 🛠 Công nghệ Sử dụng / Technology Stack

### Frontend

- **React 19**: Framework JavaScript hiện đại
- **Web3.js**: Thư viện tương tác blockchain
- **Framer Motion**: Animation library
- **Tailwind CSS & Bulma**: CSS frameworks
- **Context API**: State management

### Blockchain

- **Solidity 0.8.21**: Ngôn ngữ smart contract
- **OpenZeppelin**: Thư viện smart contract tiêu chuẩn
- **Truffle**: Framework phát triển blockchain
- **ERC721**: Token standard cho NFT

### Development Tools

- **Node.js & npm**: Package management
- **MetaMask**: Web3 wallet provider
- **Ganache**: Local blockchain (port 7575)

---

## 📋 Yêu cầu Hệ thống / System Requirements

- Node.js >= 14.x
- npm >= 6.x
- MetaMask wallet extension
- Truffle >= 5.x (for smart contract deployment)
- Ganache (for local blockchain testing)

---

## 🚀 Cài đặt và Chạy / Installation & Running

### 1. Clone Repository

```bash
git clone https://github.com/datjpro/viepropchain.git
cd viepropchain
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Local Blockchain (Optional)

```bash
# Install Truffle globally
npm install -g truffle

# Start Ganache on port 7575
ganache-cli -p 8575
```

### 4. Deploy Smart Contracts

```bash
truffle migrate --network development
```

### 5. Start Development Server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 6. Build for Production

```bash
npm run build
```

---

## 📁 Cấu trúc Dự án / Project Structure

```
viepropchain/
├── contracts/              # Smart contracts
│   ├── Marketplace.sol    # Marketplace contract
│   ├── ViePropChainNFT.sol # NFT contract
│   └── Migrations.sol     # Migration contract
├── migrations/            # Deployment scripts
├── src/
│   ├── components/        # React components
│   │   ├── Header/       # Header component
│   │   ├── Footer/       # Footer component
│   │   ├── property/     # Property components
│   │   ├── transaction/  # Transaction components
│   │   └── wallet/       # Wallet components
│   ├── pages/            # Page components
│   │   ├── Home/         # Landing page
│   │   ├── Marketplace/  # Marketplace page
│   │   └── NFT/          # NFT details page
│   ├── contexts/         # React contexts
│   │   └── LanguageContext.js
│   ├── translations/     # Multi-language support
│   └── assets/           # Images and static files
├── public/               # Public assets
├── test/                 # Smart contract tests
└── truffle-config.js     # Truffle configuration
```

---

## 🎯 Roadmap / Lộ trình Phát triển

### Phase 1: Foundation (Completed)

- ✅ Smart contract development (NFT + Marketplace)
- ✅ Landing page with multi-language support
- ✅ Wallet integration
- ✅ Basic UI/UX design

### Phase 2: Core Features (In Progress)

- 🔄 Property listing and management
- 🔄 NFT minting interface
- 🔄 Marketplace trading functionality
- 🔄 User dashboard

### Phase 3: Advanced Features (Planned)

- 📋 Portfolio analytics
- 📋 Advanced search and filters
- 📋 Data enrichment services
- 📋 API integration

### Phase 4: Enterprise (Future)

- 📋 Institutional features
- 📋 Compliance tools
- 📋 ESG reporting
- 📋 AI-powered insights

---

## 👥 Đối tượng Sử dụng / Target Users

- **Investors & Asset Managers**: Nhà đầu tư và quản lý tài sản
- **Property Developers**: Nhà phát triển bất động sản
- **Banks & Lenders**: Ngân hàng và tổ chức cho vay
- **PropTech Companies**: Công ty công nghệ bất động sản
- **Government & Municipalities**: Chính phủ và cơ quan quản lý

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Contributors / Đóng góp

- **Team ViePropChain**
- GitHub: [@datjpro](https://github.com/datjpro)

---

## 📞 Contact / Liên hệ

- Website: [ViePropChain](#)
- Email: todat2207@gmail.com

---

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- React and Web3 communities
- All contributors and supporters

---

_Built with ❤️ for the future of real estate_
