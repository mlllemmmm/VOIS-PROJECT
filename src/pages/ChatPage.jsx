import HealthChat from "../components/HealthChat";

export default function ChatPage() {
  return (
    <div
      style={{
        height: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0fdf4",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          height: "85vh",
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}
      >
        <HealthChat />
      </div>
    </div>
  );
}
