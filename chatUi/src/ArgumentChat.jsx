import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Conversation component to display messages
const Conversation = ({ history }) => {
    return (
        <div>
            <div>
                {history.map((message, index) => (
                    <div key={index}>
                        <strong>{message.role.toUpperCase()}:</strong>
                        <p>{message.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main application component
const App = () => {
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);

        // Add the user message to history
        const newHistory = [...history, { role: 'user', content: message }];
        setHistory(newHistory);
        setMessage('');

        try {
            // Send request to the backend FastAPI to process the legal case
            const response = await axios.post('http://localhost:9005/api/chat', {
                message,
                history: newHistory,
            });

            const result = response.data.response;
            // Update history with the response
            setHistory([...newHistory, { role: 'assistant', content: result }]);
            toast.success('Case processed successfully!');
        } catch (error) {
            console.error('Error in processing the case:', error);
            toast.error('Error in processing the case!');
        }

        setLoading(false);
    };

    return (
        <div style={{ margin: '20px' }}>
            <h1>Legal Case Simulation</h1>
            <Conversation history={history} />
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="message">Victim's Testimony / Input</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter victim's testimony or input..."
                        rows="4"
                        cols="50"
                        required
                    ></textarea>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Submit Testimony'}
                </button>
            </form>

            <ToastContainer />
        </div>
    );
};

export default App;
