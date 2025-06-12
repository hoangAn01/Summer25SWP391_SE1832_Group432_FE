import React, { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

function Manage_account() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md mt-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Tìm kiếm tài khoản</h1>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "40px 0" }}>
          <div style={{ position: "relative", width: 600, maxWidth: "98vw" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Nhập tên, số điện thoại của phụ huynh "
              style={{
                width: "100%",
                padding: "18px 56px 18px 56px",
                fontSize: 22,
                borderRadius: 32,
                border: "2.5px solid #1976d2",
                boxShadow: "0 4px 24px 0 rgba(33,150,243,0.10)",
                outline: "none",
                fontWeight: 500,
                color: "#222",
                background: "#fff",
                letterSpacing: 1,
                transition: "border 0.2s, box-shadow 0.2s"
              }}
            />
            <FiSearch
              size={32}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#1976d2",
                pointerEvents: "none"
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#888"
                }}
                aria-label="Clear search"
              >
                <FiX size={28} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Manage_account;
