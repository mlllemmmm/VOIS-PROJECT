import React, { useState } from "react";

export default function HealthChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    const response = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();

    const botMessage = { sender: "bot", text: data.reply };

    setMessages((prev) => [...prev, botMessage]);
    setInput("");
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>💬 Aarogya AI Assistant</h3>

      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <span
              style={{
                background:
                  msg.sender === "user" ? "#bbf7d0" : "#e5e7eb",
                padding: "8px 12px",
                borderRadius: "12px",
                display: "inline-block",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask your health question..."
        style={{ width: "70%", padding: "8px" }}
      />
      <button onClick={sendMessage} style={{ padding: "8px 12px" }}>
        Send
      </button>
    </div>
  );
}
