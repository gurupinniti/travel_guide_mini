// import React, { useState, useEffect } from "react";
// import ReactMarkdown from "react-markdown";
// import { sendMessage, checkStatus } from "./api";

// function ChatApp() {
//   const [history, setHistory] = useState([]);
//   const [input, setInput] = useState("");
//   const [status, setStatus] = useState({ connected: false, model: "" });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     async function fetchStatus() {
//       const res = await checkStatus();
//       setStatus(res);
//     }
//     fetchStatus();
//   }, []);

//   const handleSend = async () => {
//     if (!input.trim() || loading) return;

//     const newHistory = [...history, { role: "user", content: input }];
//     setHistory(newHistory);
//     setInput("");
//     setLoading(true);

//     try {
//       const response = await sendMessage(input, newHistory);
//       setHistory((prev) => [
//         ...newHistory,
//         { role: "assistant", content: response },
//       ]);
//     } catch (err) {
//       setHistory((prev) => [
//         ...newHistory,
//         { role: "assistant", content: "⚠️ Error fetching response from backend." },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chat-container" style={styles.container}>
//       <h2 style={styles.header}>Omio Mini Assistant</h2>
//       <p style={styles.status}>
//         Model: {status.connected ? status.model : "❌ Not Connected"}
//       </p>

//       <div style={styles.messages}>
//         {history.map((msg, idx) => (
//           <div
//             key={idx}
//             style={{
//               ...styles.message,
//               alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
//               backgroundColor: msg.role === "user" ? "#DCF8C6" : "#EAEAEA",
//             }}
//           >
//             <strong>{msg.role}:</strong>{" "}
//             {msg.role === "assistant" ? (
//               <ReactMarkdown>{msg.content}</ReactMarkdown>
//             ) : (
//               msg.content
//             )}
//           </div>
//         ))}

//         {loading && (
//           <div style={{ ...styles.message, alignSelf: "flex-start", backgroundColor: "#EAEAEA", display: "flex", alignItems: "center" }}>
//             <strong>assistant:</strong>
//             <div className="spinner" style={styles.spinner}></div>
//           </div>
//         )}
//       </div>

//       <div style={styles.inputRow}>
//         <input
//           style={styles.input}
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//           placeholder="Type your message..."
//           disabled={loading}
//         />
//         <button style={styles.button} onClick={handleSend} disabled={loading}>
//           {loading ? <div style={styles.spinner}></div> : "Send"}
//         </button>
//       </div>
//     </div>
//   );
// }

// // Inline styles with spinner animation
// const styles = {
//   container: { display: "flex", flexDirection: "column", maxWidth: "600px", margin: "20px auto", border: "1px solid #ddd", borderRadius: "8px", padding: "16px", fontFamily: "Arial, sans-serif" },
//   header: { textAlign: "center" },
//   status: { textAlign: "center", fontSize: "14px", color: "gray" },
//   messages: { display: "flex", flexDirection: "column", height: "400px", overflowY: "auto", margin: "10px 0", padding: "10px", border: "1px solid #eee", borderRadius: "6px", backgroundColor: "#fafafa" },
//   message: { padding: "8px 12px", borderRadius: "12px", margin: "4px 0", maxWidth: "80%" },
//   inputRow: { display: "flex", marginTop: "10px" },
//   input: { flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", marginRight: "8px" },
//   button: { padding: "10px 20px", border: "none", backgroundColor: "#007BFF", color: "white", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
//   spinner: {
//     width: "16px",
//     height: "16px",
//     border: "3px solid #fff",
//     borderTop: "3px solid #007BFF",
//     borderRadius: "50%",
//     animation: "spin 1s linear infinite",
//     marginLeft: "8px",
//   },
// };


// // Add CSS keyframes for spin
// const styleSheet = document.styleSheets[0];
// styleSheet.insertRule(`
// @keyframes spin {
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// }`, styleSheet.cssRules.length);

// export default ChatApp;

  // src/ChatApp.js
  // src/ChatApp.jsx
// src/ChatApp.jsx
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendMessage, checkStatus } from "./api";

function ChatApp() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState({ connected: false, model: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let interval = null;

    async function fetchStatus() {
      try {
        const res = await checkStatus();
        if (!mounted) return;

        setStatus(res);

        // Stop polling once model is loaded
        if (res.connected && res.model) {
          clearInterval(interval);
        }
      } catch (e) {
        console.error("Error fetching model status", e);
      }
    }

    // Fetch once immediately
    fetchStatus();

    // Start polling every 3 sec only if model not yet loaded
    interval = setInterval(fetchStatus, 3000);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const newHistory = [...history, { role: "user", content: input }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage(input, newHistory);
      setHistory((prev) => [
        ...newHistory,
        { role: "assistant", content: response },
      ]);
    } catch (err) {
      setHistory((prev) => [
        ...newHistory,
        { role: "assistant", content: "⚠️ Error fetching response from backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Omio Mini Assistant</h2>
      <p style={styles.status}>
        Model: {status.connected ? status.model : "❌ Loading model..."}
      </p>

      <div style={styles.messages}>
        {history.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.role === "user" ? "#DCF8C6" : "#EAEAEA",
            }}
          >
            <strong>{msg.role}:</strong>{" "}
            {msg.role === "assistant" ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        ))}

        {loading && (
          <div
            style={{
              ...styles.message,
              alignSelf: "flex-start",
              backgroundColor: "#EAEAEA",
              display: "flex",
              alignItems: "center",
            }}
          >
            <strong>assistant:</strong>
            <div style={styles.spinner}></div>
          </div>
        )}
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button style={styles.button} onClick={handleSend} disabled={loading}>
          {loading ? <div style={styles.spinner}></div> : "Send"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "90%",
    maxWidth: "1000px",
    minHeight: "70vh",
    padding: "25px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
    margin: "20px auto",
  },
  header: { textAlign: "center", marginBottom: "15px", fontSize: "22px", color: "#007BFF" },
  status: { textAlign: "center", fontSize: "14px", color: "gray", marginBottom: "15px" },
  messages: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    overflowY: "auto",
    marginBottom: "15px",
    padding: "15px",
    border: "1px solid #eee",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  message: {
    padding: "10px 16px",
    borderRadius: "14px",
    margin: "6px 0",
    maxWidth: "70%",
    fontSize: "15px",
    lineHeight: "1.5",
  },
  inputRow: { display: "flex", marginTop: "10px", gap: "12px" },
  input: {
    flex: 1,
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  button: {
    padding: "0 20px",
    border: "none",
    backgroundColor: "#007BFF",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "3px solid #fff",
    borderTop: "3px solid #007BFF",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginLeft: "8px",
  },
};

// Spinner keyframes
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`, styleSheet.cssRules.length);

export default ChatApp;



