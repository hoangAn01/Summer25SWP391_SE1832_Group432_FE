import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Avatar,
  Spin,
  Alert,
  Collapse,
  Tag,
  Divider,
  message,
  Tooltip,
  Badge
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  MessageOutlined,
  HeartOutlined,
  BookOutlined,
  SafetyOutlined,
  TrophyOutlined,
  BulbOutlined,
  CloseOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { sendMessageToAI, getSuggestedQuestions } from '../../services/aiService';
import './AIChatBot.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      // Cập nhật lịch sử hội thoại
      const updatedHistory = [...conversationHistory, 
        { role: 'user', content: inputMessage }
      ];
      setConversationHistory(updatedHistory);

      const aiResponse = await sendMessageToAI(inputMessage, updatedHistory);
      
      const aiMessage = {
        id: Date.now() + 1,
        content: aiResponse,
        role: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      setError(error.message);
      message.error('Không thể kết nối với AI. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gợi ý câu hỏi
  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  // Xóa lịch sử chat
  const clearChat = () => {
    setMessages([]);
    setConversationHistory([]);
    setError('');
  };

  // Toggle chat
  const toggleChat = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  // Đóng chat
  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Gợi ý câu hỏi
  const suggestedQuestions = getSuggestedQuestions();

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Dinh dưỡng':
        return <HeartOutlined style={{ color: '#52c41a' }} />;
      case 'Sức khỏe tâm lý':
        return <MessageOutlined style={{ color: '#1890ff' }} />;
      case 'Phát triển thể chất':
        return <TrophyOutlined style={{ color: '#faad14' }} />;
      case 'Vệ sinh và phòng bệnh':
        return <SafetyOutlined style={{ color: '#f5222d' }} />;
      case 'Học tập và phát triển':
        return <BulbOutlined style={{ color: '#722ed1' }} />;
      default:
        return <BookOutlined style={{ color: '#722ed1' }} />;
    }
  };

  return (
    <>
      {/* Chat Bot Icon */}
      <div className="chat-bot-icon" onClick={toggleChat}>
        <Badge count={messages.length > 0 ? messages.length : 0} size="small">
          <Avatar
            size={56}
            icon={<RobotOutlined />}
            style={{
              backgroundColor: '#1890ff',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}
          />
        </Badge>
        <div className="chat-bot-tooltip">
          AI Tư Vấn Sức Khỏe
        </div>
      </div>

      {/* Chat Popup */}
      {isOpen && (
        <div className={`chat-popup ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            <Space>
              <RobotOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
              <Text strong style={{ color: 'white', fontSize: '16px' }}>
                AI Tư Vấn Sức Khỏe
              </Text>
            </Space>
            <Space>
              <Button
                type="text"
                icon={<MinusOutlined />}
                onClick={() => setIsMinimized(!isMinimized)}
                style={{ color: 'white' }}
                size="small"
              />
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={closeChat}
                style={{ color: 'white' }}
                size="small"
              />
            </Space>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="chat-messages">
                {messages.length === 0 && (
                  <div className="chat-welcome">
                    <RobotOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
                    <Text strong>Chào mừng bạn!</Text>
                    <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
                      Hỏi tôi về sức khỏe học đường
                    </Text>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`}
                  >
                    <div className="message-content">
                      <div className="message-header">
                        <Avatar
                          size={24}
                          icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                          style={{
                            backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a'
                          }}
                        />
                        <Text strong style={{ fontSize: '12px' }}>
                          {msg.role === 'user' ? 'Bạn' : 'AI'}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          {msg.timestamp.toLocaleTimeString()}
                        </Text>
                      </div>
                      <div className="message-text">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="chat-message ai">
                    <div className="message-content">
                      <div className="message-header">
                        <Avatar size={24} icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
                        <Text strong style={{ fontSize: '12px' }}>AI</Text>
                      </div>
                      <div className="message-text">
                        <Spin size="small" /> Đang suy nghĩ...
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert
                    message="Lỗi kết nối"
                    description={error}
                    type="error"
                    showIcon
                    size="small"
                    style={{ margin: '8px 0' }}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length === 0 && (
                <div className="chat-suggestions">
                  <Text strong style={{ fontSize: '12px', marginBottom: '8px' }}>Gợi ý:</Text>
                  <div className="suggestion-tags">
                    {suggestedQuestions.slice(0, 2).map((category, index) => 
                      category.questions.slice(0, 2).map((question, qIndex) => (
                        <Tag
                          key={`${index}-${qIndex}`}
                          className="suggestion-tag"
                          onClick={() => handleSuggestedQuestion(question)}
                          style={{ cursor: 'pointer', margin: '2px', fontSize: '11px' }}
                        >
                          {question}
                        </Tag>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="chat-input">
                <Space.Compact style={{ width: '100%' }}>
                  <TextArea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nhập câu hỏi..."
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={loading}
                    style={{ fontSize: '12px' }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={loading}
                    disabled={!inputMessage.trim()}
                    size="small"
                  />
                </Space.Compact>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatBot; 