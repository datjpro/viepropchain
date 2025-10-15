# ng dẫn kết nối ví MetaMask

## Cài đặt MetaMask

1. Tải extension MetaMask cho trình duyệt của bạn:

   - Chrome: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/
   - Edge: https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm
2. Làm theo hướng dẫn để tạo ví mới hoặc import ví hiện có

## Kết nối ví với ViePropChain

1. Mở ứng dụng ViePropChain trên trình duyệt
2. Click vào nút "Connect Wallet" / "Kết nối ví" ở góc trên bên phải
3. Extension MetaMask sẽ tự động hiện lên
4. Chọn tài khoản bạn muốn kết nối
5. Click "Connect" / "Kết nối" trong popup MetaMask
6. Sau khi kết nối thành công, bạn sẽ thấy địa chỉ ví được hiển thị dạng rút gọn (vd: 0x1234...5678)

## Tính năng

- **Tự động phát hiện MetaMask**: Ứng dụng sẽ tự động kiểm tra xem bạn đã cài MetaMask chưa
- **Hiển thị địa chỉ rút gọn**: Địa chỉ ví được hiển thị dưới dạng ngắn gọn để giao diện gọn gàng
- **Copy địa chỉ**: Click vào địa chỉ ví để sao chép địa chỉ đầy đủ
- **Tự động kết nối lại**: Nếu bạn đã kết nối trước đó, ứng dụng sẽ tự động kết nối lại
- **Theo dõi thay đổi**: Ứng dụng tự động cập nhật khi bạn chuyển đổi tài khoản hoặc mạng trong MetaMask

## Xử lý sự cố

### MetaMask không hiện lên

- Đảm bảo bạn đã cài đặt extension MetaMask
- Thử refresh lại trang
- Kiểm tra xem extension có bị disable không

### Không thể kết nối

- Đảm bảo bạn đã unlock ví MetaMask
- Thử disconnect và connect lại
- Kiểm tra console log để xem chi tiết lỗi

### Địa chỉ ví không hiển thị

- Refresh lại trang
- Disconnect và connect lại ví MetaMask
- Kiểm tra xem tài khoản đã được chọn trong MetaMask chưa

## Network Configuration

Để sử dụng đầy đủ tính năng của ViePropChain, bạn cần kết nối đến mạng blockchain phù hợp:

### Ganache Local (Development)

- Network Name: Ganache Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 1337
- Currency Symbol: ETH

### Sepolia Testnet (Testing)

- Network Name: Sepolia Test Network
- RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- Chain ID: 11155111
- Currency Symbol: SepoliaETH
- Block Explorer: https://sepolia.etherscan.io

## Bảo mật

- ⚠️ **KHÔNG BAO GIỜ** chia sẻ seed phrase hoặc private key của bạn với bất kỳ ai
- ⚠️ Luôn kiểm tra kỹ URL của trang web trước khi kết nối ví
- ⚠️ Chỉ kết nối ví với các trang web đáng tin cậy
- ⚠️ Luôn backup seed phrase của bạn ở nơi an toàn

## Liên hệ hỗ trợ

Nếu bạn gặp vấn đề khi kết nối ví, vui lòng liên hệ với chúng tôi qua:

- Email: support@viepropchain.com
- Discord: [ViePropChain Community]
- GitHub Issues: [viepropchain/issues]
