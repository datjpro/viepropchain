import React from "react";
import "./Terms.css";

export const Terms = () => {
  return (
    <div className="terms-container">
      <h2 className="terms-title">Điều khoản & Điều kiện sử dụng</h2>

      <div className="terms-content">
        <p>
          Chào mừng bạn đến với <strong>ViePropChain</strong> — nền tảng giao dịch bất động sản ứng dụng công nghệ blockchain.
          Khi truy cập hoặc sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản dưới đây.
        </p>

        <h3>1. Mục đích sử dụng</h3>
        <p>
          ViePropChain cung cấp nền tảng giúp người dùng giao dịch, đầu tư và quản lý đất đai thông qua hợp đồng thông minh
          trên blockchain. Người dùng cam kết không sử dụng dịch vụ cho mục đích gian lận, lừa đảo hoặc vi phạm pháp luật.
        </p>

        <h3>2. Quyền và trách nhiệm của người dùng</h3>
        <ul>
          <li>Cung cấp thông tin chính xác, trung thực khi đăng ký tài khoản.</li>
          <li>Bảo mật thông tin đăng nhập và chịu trách nhiệm cho mọi hoạt động trong tài khoản của mình.</li>
          <li>Không thực hiện các hành vi gây ảnh hưởng đến hệ thống hoặc quyền lợi người khác.</li>
        </ul>

        <h3>3. Quyền và nghĩa vụ của ViePropChain</h3>
        <ul>
          <li>Đảm bảo hệ thống vận hành an toàn, ổn định và minh bạch.</li>
          <li>Có quyền tạm ngưng hoặc chấm dứt dịch vụ đối với người dùng vi phạm.</li>
          <li>Cam kết bảo mật dữ liệu cá nhân theo quy định pháp luật hiện hành.</li>
        </ul>

        <h3>4. Giới hạn trách nhiệm</h3>
        <p>
          ViePropChain không chịu trách nhiệm đối với các thiệt hại gián tiếp hoặc phát sinh từ việc người dùng
          vi phạm điều khoản hoặc sử dụng sai mục đích.
        </p>

        <h3>5. Cập nhật và sửa đổi</h3>
        <p>
          ViePropChain có quyền điều chỉnh điều khoản này mà không cần thông báo trước. Người dùng nên thường xuyên
          xem lại để cập nhật thông tin mới nhất.
        </p>

        <p className="terms-footer">
          Việc bạn tiếp tục sử dụng nền tảng đồng nghĩa với việc bạn đồng ý với tất cả các điều khoản trên.
        </p>
      </div>
    </div>
  );
};
