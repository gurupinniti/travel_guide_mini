import React, { useState, useEffect, useRef } from 'react';

const AutogenConversationUI = () => {
  const [conversations, setConversations] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState({ connected: false, model: '' });
  const messagesEndRef = useRef(null);
  
  // Backend API URL
  const API_URL = 'http://localhost:9005/api';

  useEffect(() => {
    // Initial system message
    setConversations([
      { 
        role: 'system', 
        content: 'Conversation started with AutoGen + Local LLM', 
        timestamp: new Date().toISOString() 
      }
    ]);
    
    // Check connection to the LLM server
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();
        setModelStatus({ 
          connected: data.connected, 
          model: data.model || 'Unknown Model'
        });
      } catch (error) {
        console.error('Error checking status:', error);
        setModelStatus({ 
          connected: false, 
          model: 'Connection Error' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    if (!modelStatus.connected) {
      alert('Not connected to LLM server. Please check your connection.');
      return;
    }
    
    // Add user message to conversation
    const userMessage = { 
      role: 'user', 
      content: userInput, 
      timestamp: new Date().toISOString() 
    };
    setConversations(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Send request to the FastAPI backend
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          history: conversations.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const assistantMessage = { 
        role: 'assistant', 
        content: data.response, 
        timestamp: new Date().toISOString() 
      };
      setConversations(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to conversation
      const errorMessage = { 
        role: 'system', 
        content: `Error: ${error.message}. Please try again.`, 
        timestamp: new Date().toISOString() 
      };
      setConversations(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        {/* <h1 className="text-xl font-bold">AutoGen + Local LLM Chat</h1> */}
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${modelStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">{modelStatus.connected ? modelStatus.model : 'Disconnected'}</span>
        </div>
      </div>
      
      {/* Conversation area */}
      <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
        {conversations.map((msg, index) => (
          <div key={index} className={`mb-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto' : ''}`}>
            <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : msg.role === 'system' ? 'bg-gray-200' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center mb-1">
                <span className="font-semibold text-sm">
                  {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Assistant' : 'System'}
                </span>
                <span className="text-xs text-gray-500 ml-2">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="bg-white p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={isLoading || !modelStatus.connected}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isLoading || !modelStatus.connected}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </span>
            ) : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AutogenConversationUI;