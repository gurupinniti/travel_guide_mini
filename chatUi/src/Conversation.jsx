import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToBottom from 'react-scroll-to-bottom';
import "./Conversation.css"
import { FaCheckDouble } from 'react-icons/fa';


const Conversation = ({ history }) => {
    return (
        <ScrollToBottom className="conversation-container">
            <div>
                {history.map((message, index) => (
                    <div key={index} className={`message-wrapper ${message.role}`}>
                        <div className={`message-card ${message.role}`}>
                            <p>{message.content}</p>
                            <div className="message-meta">
                                <span className="user-role">{message.role === 'user' ? 'You' : 'Assistant'}</span>
                                <span className="timestamp">{message.timestamp}</span>
                                <FaCheckDouble className="read-receipt" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollToBottom>
    );
};

const App = () => {
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        const newHistory = [...history, { role: 'user', content: message }];
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
                { role: 'assistant', content: result },
            ]);

            toast.success('Processed successfully!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error processing the message!');
        }

        setLoading(false);
    };

    return (
        <div className="app-container">
            {/* <h1>Legal Case Simulation</h1> */}
            <Conversation history={history} />
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
            <ToastContainer />
        </div>
    );
};

export default App;
