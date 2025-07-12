import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import axios from 'axios';

const AdminMessageBanner = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveMessages();
  }, []);

  const fetchActiveMessages = async () => {
    try {
      const response = await axios.get('/api/admin/messages?active=true');
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch admin messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const dismissMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getMessageStyles = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (loading || messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`border rounded-lg p-4 ${getMessageStyles(message.type)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getMessageIcon(message.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">{message.title}</h3>
                <p className="text-sm mt-1">{message.message}</p>
              </div>
            </div>
            <button
              onClick={() => dismissMessage(message.id)}
              className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminMessageBanner; 