import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToBottom from 'react-scroll-to-bottom';
import "./CourtRoom.css"
import { FaCheckDouble } from 'react-icons/fa';

// Conversation component for each panel
const Conversation = ({ history, setHistory, role }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        const newHistory = [...history, { role, content: message, timestamp: new Date().toLocaleString() }];
        setHistory(newHistory);
        setMessage('');

        try {
            const response = await axios.post('http://localhost:9005/api/chat', {
                message,
                history: newHistory,
            });

            const result = response.data.response;

            setHistory((prevHistory) => [
                ...prevHistory,
                { role: 'assistant', content: result, timestamp: new Date().toLocaleString() },
            ]);

            toast.success('Processed successfully!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error processing the message!');
        }

        setLoading(false);
    };

    return (
        <div className="conversation-box">
            <ScrollToBottom className="conversation-container">
                {history.map((message, index) => (
                    <div key={index} className={`message-wrapper ${message.role}`}>
                        <div className={`message-card ${message.role}`}>
                            <p>{message.content}</p>
                            <div className="message-meta">
                                <FaCheckDouble className="read-receipt" />
                                <span className="user-role">{message.role}</span>
                                <span className="timestamp">{message.timestamp}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </ScrollToBottom>
            <form className="input-container" onSubmit={handleSubmit}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows="3"
                    required
                ></textarea>
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

// Main App component with two panels
const App = () => {
    const [historyLawyer1, setHistoryLawyer1] = useState([]);
    const [historyLawyer2, setHistoryLawyer2] = useState([]);
    const [historyJudge, setHistoryJudge] = useState([]);

    return (
        <div className="app-container">
            <h1>Legal Case Simulation</h1>
            <div className="conversation-panels">
                {/* Lawyer 1 Panel */}
                <div className="panel">
                    <h2>Lawyer 1, Victim </h2>
                    <Conversation history={historyLawyer1} setHistory={setHistoryLawyer1} role="lawyer1" />
                </div>

                {/* Lawyer 2 Panel */}
                <div className="panel">
                    <h2>Lawyer 2, Victim </h2>
                    <Conversation history={historyLawyer2} setHistory={setHistoryLawyer2} role="lawyer2" />
                </div>
                {/* Judge Panel */}
                <div className="panel">
                    <h2>Lawyer, Judge</h2>
                    <Conversation history={historyJudge} setHistory={setHistoryJudge} role="judge" />
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default App;
