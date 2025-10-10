'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { getApiUrl, API_CONFIG } from '@/lib/config'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Xin chào! Tôi là trợ lý AI của VieCar. Tôi có thể giúp bạn tìm hiểu về xe điện VinFast, thủ tục mua xe, đăng ký lái thử và các dịch vụ liên quan. Bạn cần hỗ trợ gì?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsLoading(true)

    try {
      // Kết nối với Gemini AI qua Next.js API route
      console.log('🤖 Đang gửi tin nhắn đến Gemini AI...')
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Gemini AI response:', data)
      
      // Xử lý response từ Gemini AI
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
        sender: 'bot',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, botMessage])
      
    } catch (error) {
      console.error('❌ Lỗi kết nối Gemini AI:', error)
      
      // Fallback message khi AI không khả dụng
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau hoặc liên hệ trực tiếp với nhân viên tư vấn để được hỗ trợ tốt nhất. 📞',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
          >
            <MessageCircle className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[550px] z-50 shadow-2xl rounded-lg bg-white flex flex-col animate-in slide-in-from-bottom-2 slide-in-from-right-2 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Logo AI Car with enhanced styling */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 to-white/30 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                <div className="relative bg-white rounded-full p-0.5 shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  <Image
                    src="/AIcar.webp"
                    alt="AI Car Logo"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold">Chat AI VieCar</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ maxHeight: 'calc(100% - 140px)' }}
          >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 transition-all duration-200 hover:shadow-md ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white animate-in slide-in-from-right-2 duration-300'
                          : 'bg-gray-100 text-gray-800 animate-in slide-in-from-left-2 duration-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.sender === 'bot' && (
                          <div className="relative group flex-shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/40 to-blue-600/40 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                            <div className="relative bg-white rounded-full p-[2px] shadow-md">
                              <Image
                                src="/AIcar.webp"
                                alt="AI"
                                width={28}
                                height={28}
                                className="rounded-full"
                              />
                            </div>
                          </div>
                        )}
                        {message.sender === 'user' && (
                          <User className="h-4 w-4 mt-1 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] animate-in slide-in-from-left-2 duration-300">
                      <div className="flex items-center gap-2">
                        <div className="relative group flex-shrink-0">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/40 to-blue-600/40 rounded-full blur-sm animate-pulse"></div>
                          <div className="relative bg-white rounded-full p-[2px] shadow-md">
                            <Image
                              src="/AIcar.webp"
                              alt="AI"
                              width={28}
                              height={28}
                              className="rounded-full animate-pulse"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-white rounded-b-lg flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  disabled={isLoading}
                  className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
        </div>
      )}
    </>
  )
}