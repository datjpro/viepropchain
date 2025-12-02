import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ message = "Đang tải dữ liệu..." }) => {
  return (
    <div className="loading-spinner-container">
      <img
        src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjRubnhzenVzZjdxZTVsM2xhNXBvNmNtZ3IyZ3ltdHdncGdpNGw0ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pVXyJy2k7WO1n49bGg/giphy.gif"
        alt="Loading..."
        className="loading-cat-gif"
        onError={(e) => {
          // Fallback nếu GIF không load được
          e.target.style.display = "none";
        }}
      />
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
