import axios from "axios";

const API_BASE = "http://0.0.0.0:9005/api"; // backend URL

// Check LLM model status
export async function checkStatus() {
  try {
    const res = await axios.get(`${API_BASE}/status`, { timeout: 300000 }); // 5 minutes
    return res.data;
  } catch (err) {
    console.error("Error checking status:", err);
    return { connected: false, model: "", error: err.message };
  }
}

// Send a chat message to the backend
export async function sendMessage(message, history) {
    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        message,
        history,
      }, {
        timeout: 10 * 60 * 1000  // 5 minutes
      });
      return res.data.response;
    } catch (err) {
      console.error("Error sending message:", err);
      return "⚠️ Error fetching response from backend.";
    }
  }
  

// Example request
export async function getExample() {
  try {
    const res = await axios.get(`${API_BASE}/example`, { timeout: 300000 }); // 5 minutes
    return res.data.example;
  } catch (err) {
    console.error("Error fetching example:", err);
    return "⚠️ Could not fetch example.";
  }
}
