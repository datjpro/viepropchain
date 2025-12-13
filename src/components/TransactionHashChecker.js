import React, { useState } from "react";
import { useWeb3 } from "src/contexts/GanacheWeb3Context";
import { useLanguage } from "src/contexts/LanguageContext";
import Toast from "src/components/Toast/Toast";

const TransactionHashChecker = ({ isOpen, onClose }) => {
  const { web3 } = useWeb3();
  const { language } = useLanguage();
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const checkTransaction = async () => {
    if (!hash.trim()) {
      setToast({
        message:
          language === "en"
            ? "Please enter transaction hash"
            : "Vui lòng nhập transaction hash",
        type: "error",
      });
      return;
    }

    if (!web3) {
      setToast({
        message: language === "en" ? "Web3 not connected" : "Web3 chưa kết nối",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const tx = await web3.eth.getTransaction(hash);
      if (!tx) {
        setResult({
          status: "not_found",
          message:
            language === "en"
              ? "Transaction not found"
              : "Không tìm thấy giao dịch",
        });
        return;
      }

      const receipt = await web3.eth.getTransactionReceipt(hash);
      const block = await web3.eth.getBlock(tx.blockNumber);

      setResult({
        status: "success",
        data: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: web3.utils.fromWei(tx.value.toString(), "ether"),
          gasUsed: receipt ? receipt.gasUsed.toString() : "N/A",
          status: receipt ? (receipt.status ? "Success" : "Failed") : "Pending",
          blockNumber: tx.blockNumber.toString(),
          timestamp: block
            ? new Date(Number(block.timestamp) * 1000).toLocaleString()
            : "N/A",
        },
      });
    } catch (error) {
      console.error("Error checking transaction:", error);
      setResult({
        status: "error",
        message:
          language === "en"
            ? "Error checking transaction"
            : "Lỗi khi kiểm tra giao dịch",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setHash("");
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content transaction-checker-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>
              {language === "en"
                ? "Check Transaction Hash"
                : "Kiểm tra Transaction Hash"}
            </h3>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label>
                {language === "en" ? "Transaction Hash:" : "Transaction Hash:"}
              </label>
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder={
                  language === "en"
                    ? "Enter transaction hash..."
                    : "Nhập transaction hash..."
                }
                className="hash-input"
              />
            </div>

            <div className="button-group">
              <button
                className="check-btn"
                onClick={checkTransaction}
                disabled={loading}
              >
                {loading
                  ? language === "en"
                    ? "Checking..."
                    : "Đang kiểm tra..."
                  : language === "en"
                  ? "Check"
                  : "Kiểm tra"}
              </button>
              <button className="reset-btn" onClick={resetForm}>
                {language === "en" ? "Reset" : "Đặt lại"}
              </button>
            </div>

            {result && (
              <div className="result-section">
                {result.status === "success" ? (
                  <div className="success-result">
                    <h4>
                      {language === "en"
                        ? "Transaction Details:"
                        : "Chi tiết giao dịch:"}
                    </h4>
                    <div className="result-grid">
                      <div>
                        <strong>Hash:</strong> {result.data.hash}
                      </div>
                      <div>
                        <strong>From:</strong> {result.data.from}
                      </div>
                      <div>
                        <strong>To:</strong>{" "}
                        {result.data.to || "Contract Creation"}
                      </div>
                      <div>
                        <strong>Value:</strong> {result.data.value} ETH
                      </div>
                      <div>
                        <strong>Gas Used:</strong> {result.data.gasUsed}
                      </div>
                      <div>
                        <strong>Status:</strong> {result.data.status}
                      </div>
                      <div>
                        <strong>Block:</strong> {result.data.blockNumber}
                      </div>
                      <div>
                        <strong>Timestamp:</strong> {result.data.timestamp}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="error-result">
                    <p>{result.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .transaction-checker-modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #555;
        }

        .hash-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: monospace;
          font-size: 14px;
        }

        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .check-btn,
        .reset-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .check-btn {
          background: #007bff;
          color: white;
        }

        .check-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .reset-btn {
          background: #6c757d;
          color: white;
        }

        .result-section {
          border-top: 1px solid #eee;
          padding-top: 20px;
        }

        .success-result h4 {
          color: #000;
          margin-bottom: 15px;
        }

        .result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .result-grid div {
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 14px;
          color: #000;
        }

        .result-grid strong {
          color: #495057;
        }

        .error-result {
          color: #dc3545;
          text-align: center;
          padding: 20px;
        }
      `}</style>
    </>
  );
};

export default TransactionHashChecker;
