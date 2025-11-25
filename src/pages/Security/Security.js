import React from 'react'
import "./Security.css";
export const Security = () => {
    return (
        <div className="policy">
            <h1>Chính sách Bảo mật</h1>
            <p>Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng khi sử dụng DApp giao dịch đất. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.</p>

            <h2>1. Thông tin chúng tôi thu thập</h2>
            <ul>
                <li><strong>Địa chỉ ví blockchain</strong> của bạn khi kết nối ví (MetaMask, WalletConnect,...).</li>
                <li><strong>Dữ liệu giao dịch</strong> trên blockchain liên quan đến mua bán hoặc chuyển nhượng tài sản.</li>
                <li><strong>Thông tin kỹ thuật:</strong>  IP (không lưu trữ), loại thiết bị, trình duyệt (dùng cho tối ưu trải nghiệm).</li>
            </ul>

            <h2>2. Cách chúng tôi sử dụng thông tin</h2>
            <ul>
                <li>Xác thực người dùng thông qua địa chỉ ví.</li>
                <li>Thực hiện giao dịch và hiển thị lịch sử giao dịch của bạn.</li>
                <li>Nâng cấp trải nghiệm người dùng và cải thiện hiệu suất hệ thống.</li>
            </ul>

            <h2>3. Không lưu trữ dữ liệu nhạy cảm</h2>
            <p>DApp không lưu trữ mật khẩu, private key hoặc seed phrase.
                Bạn hoàn toàn kiểm soát tài sản thông qua ví cá nhân của mình.</p>

            <h2>4. Bảo mật dữ liệu</h2>
            <ul>
                <li>Mọi giao dịch đều được ghi trực tiếp trên blockchain, không thể thay đổi.</li>
                <li>Backend (nếu có) chỉ lưu các thông tin không nhạy cảm nhằm phục vụ hiển thị.</li>
                <li>Dữ liệu truyền tải được mã hóa với HTTPS.</li>
            </ul>

            <h2>5. Chia sẻ dữ liệu</h2>
            <p>Chúng tôi không chia sẻ dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào, ngoại trừ khi:</p>
            <ul>
                <li>Việc chia sẻ là cần thiết để thực thi giao dịch blockchain.</li>
                <li>Tuân thủ yêu cầu pháp lý từ cơ quan nhà nước có thẩm quyền.</li>
            </ul>

            <h2>6. Quyền của người dùng</h2>
            <ul>
                <li>Quyền xem dữ liệu liên quan đến tài khoản ví của bạn.</li>
                <li>Quyền yêu cầu xóa dữ liệu off-chain (nếu bạn cung cấp thông tin cá nhân).</li>
            </ul>

            <h2>7. Cookies & theo dõi</h2>
            <p>DApp chỉ sử dụng cookies cần thiết (session) để duy trì trạng thái đăng nhập.
                Không sử dụng cookies quảng cáo hoặc theo dõi hành vi.</p>

            <h2>8. Liên hệ</h2>
            <p>Nếu bạn có câu hỏi về bảo mật hoặc quyền riêng tư, vui lòng liên hệ:
                <strong>support@VietPropChaindapp.com</strong></p>

            <p>Cập nhật lần cuối: 2025</p>
        </div>

    )
}
