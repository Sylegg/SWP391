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
  
  // AssistiveTouch draggable states
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

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

  // Draggable AssistiveTouch handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return // Don't drag when chat is open
    
    setIsDragging(true)
    setHasMoved(false)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    setHasMoved(true)
    const buttonSize = 64 // Size of the button
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Keep button within viewport bounds
    const maxX = window.innerWidth - buttonSize
    const maxY = window.innerHeight - buttonSize

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }

  const snapToEdge = () => {
    const buttonSize = 64
    const screenWidth = window.innerWidth
    const centerX = position.x + buttonSize / 2

    // Determine which side is closer: left or right
    const distanceToLeft = centerX
    const distanceToRight = screenWidth - centerX

    let newPosition = { ...position }

    // Snap to the closest edge (left or right only) with some padding
    const edgePadding = 16

    if (distanceToLeft < distanceToRight) {
      // Snap to left edge
      newPosition.x = edgePadding
    } else {
      // Snap to right edge
      newPosition.x = screenWidth - buttonSize - edgePadding
    }

    // Keep Y position but ensure it's within bounds
    const maxY = window.innerHeight - buttonSize - edgePadding
    newPosition.y = Math.max(edgePadding, Math.min(position.y, maxY))

    // Smooth animation to edge
    setPosition(newPosition)
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      // Snap to nearest edge after drag
      snapToEdge()
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isOpen) return
    
    const touch = e.touches[0]
    setIsDragging(true)
    setHasMoved(false)
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    })
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()

    setHasMoved(true)
    const touch = e.touches[0]
    const buttonSize = 64
    const newX = touch.clientX - dragStart.x
    const newY = touch.clientY - dragStart.y

    const maxX = window.innerWidth - buttonSize
    const maxY = window.innerHeight - buttonSize

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false)
      snapToEdge()
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, dragStart, position])

  const handleButtonClick = () => {
    // Only open chat if button wasn't dragged
    if (!hasMoved) {
      setIsOpen(true)
    }
  }

  return (
    <>
      {/* AssistiveTouch Draggable Button */}
      {!isOpen && (
        <div
          ref={buttonRef}
          className="fixed z-50 select-none"
          style={{
            left: position.x ? `${position.x}px` : 'auto',
            top: position.y ? `${position.y}px` : 'auto',
            right: !position.x && !position.y ? '24px' : 'auto',
            bottom: !position.x && !position.y ? '24px' : 'auto',
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Liquid Glass Button with AssistiveTouch style */}
          <div
            onClick={handleButtonClick}
            className={`
              relative h-16 w-16 rounded-full transition-all duration-500 ease-out
              ${isDragging ? 'scale-95 cursor-grabbing' : isHovered ? 'scale-110 cursor-grab' : 'scale-100 cursor-grab'}
            `}
          >
            {/* Outer glow ring - animated on hover */}
            <div className={`
              absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400
              transition-all duration-500
              ${isHovered ? 'blur-xl opacity-80 scale-125' : 'blur-md opacity-40 scale-100'}
              animate-gradient-shift
            `}></div>
            
            {/* Glass container */}
            <div className={`
              relative h-full w-full rounded-full overflow-hidden
              backdrop-blur-2xl bg-white/40 border-2
              shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
              transition-all duration-300
              ${isHovered ? 'border-white/40 shadow-[0_12px_40px_0_rgba(59,130,246,0.5)]' : 'border-white/20'}
            `}>
              {/* Animated gradient background */}
              <div className={`
                absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20
                transition-opacity duration-300
                ${isHovered ? 'opacity-100 animate-gradient-shift' : 'opacity-60'}
              `}></div>
              
              {/* Inner shine effect */}
              <div className={`
                absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent
                transition-opacity duration-300
                ${isHovered ? 'opacity-100' : 'opacity-50'}
              `}></div>

              {/* Icon container */}
              <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-full">
                {/* AI Logo with glass effect */}
                <div className={`
                  relative transition-transform duration-300
                  ${isHovered ? 'scale-105 rotate-6' : 'scale-100 rotate-0'}
                `}>
                  <div className={`
                    absolute -inset-1 bg-gradient-to-r from-yellow-400/50 to-white/50 rounded-full
                    transition-all duration-300
                    ${isHovered ? 'blur-md opacity-100' : 'blur-sm opacity-60'}
                  `}></div>
                  <div className="relative backdrop-blur-xl bg-white/90 rounded-full p-1 shadow-lg border border-white/50">
                    <Image
                      src="/AIcar.webp"
                      alt="AI Car Logo"
                      width={44}
                      height={44}
                      className="rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Ripple effect on hover */}
              {isHovered && (
                <div className="absolute inset-0 rounded-full">
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                </div>
              )}
            </div>

            {/* Notification badge (optional) */}
            <div className={`
              absolute -top-1 -right-1 h-5 w-5 rounded-full
              backdrop-blur-xl bg-gradient-to-r from-red-500 to-pink-500
              border-2 border-white shadow-lg
              flex items-center justify-center
              transition-all duration-300
              ${isHovered ? 'scale-110' : 'scale-100'}
            `}>
              <span className="text-[10px] font-bold text-white">AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window - Liquid Glass Effect */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[550px] z-50 flex flex-col animate-in slide-in-from-bottom-2 slide-in-from-right-2 duration-300">
          {/* Glass container with border */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden backdrop-blur-3xl bg-white/40 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-gradient-shift"></div>
            
            {/* Inner glass effect */}
            <div className="relative h-full flex flex-col">
              {/* Header - Glass effect */}
              <div className="relative backdrop-blur-2xl bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0 border-b border-white/10">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                <div className="relative flex items-center gap-3 z-10">
                  {/* Logo AI Car with liquid glass effect */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/40 to-white/40 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 animate-pulse"></div>
                    <div className="relative backdrop-blur-xl bg-white/90 rounded-full p-0.5 shadow-[0_8px_16px_0_rgba(31,38,135,0.4)] transform group-hover:scale-110 transition-all duration-300 border border-white/30">
                      <Image
                        src="/AIcar.webp"
                        alt="AI Car Logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold drop-shadow-lg">Chat AI VieCar</h3>
                    <p className="text-xs text-white/80"></p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="relative z-10 text-white hover:bg-white/20 p-1 h-8 w-8 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages Area - Glass scrollable */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 backdrop-blur-sm"
                style={{ maxHeight: 'calc(100% - 140px)' }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 transition-all duration-200 hover:shadow-lg backdrop-blur-xl border ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600/90 to-blue-700/90 text-white animate-in slide-in-from-right-2 duration-300 border-blue-400/30 shadow-[0_4px_16px_0_rgba(59,130,246,0.3)]'
                          : 'bg-white/60 text-gray-800 animate-in slide-in-from-left-2 duration-300 border-white/40 shadow-[0_4px_16px_0_rgba(255,255,255,0.4)]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.sender === 'bot' && (
                          <div className="relative group flex-shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/50 to-blue-600/50 rounded-full blur-sm group-hover:blur-md transition-all duration-300 animate-pulse"></div>
                            <div className="relative backdrop-blur-xl bg-white/95 rounded-full p-[2px] shadow-[0_4px_12px_0_rgba(59,130,246,0.3)] border border-white/50">
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
                          <div className="backdrop-blur-sm bg-white/20 rounded-full p-1">
                            <User className="h-4 w-4 mt-1 flex-shrink-0" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-600'
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
                    <div className="backdrop-blur-xl bg-white/60 rounded-2xl p-3 max-w-[80%] animate-in slide-in-from-left-2 duration-300 border border-white/40 shadow-[0_4px_16px_0_rgba(255,255,255,0.4)]">
                      <div className="flex items-center gap-2">
                        <div className="relative group flex-shrink-0">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/50 to-blue-600/50 rounded-full blur-sm animate-pulse"></div>
                          <div className="relative backdrop-blur-xl bg-white/95 rounded-full p-[2px] shadow-[0_4px_12px_0_rgba(59,130,246,0.3)] border border-white/50">
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
                          <div className="w-2 h-2 bg-blue-500/80 rounded-full animate-bounce shadow-lg"></div>
                          <div className="w-2 h-2 bg-blue-500/80 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500/80 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Glass effect */}
              <div className="relative backdrop-blur-2xl bg-white/50 p-4 rounded-b-2xl flex-shrink-0 border-t border-white/20">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-b-2xl"></div>
                
                <div className="relative flex gap-2 z-10">
                  <div className="flex-1 relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Nhập tin nhắn..."
                      disabled={isLoading}
                      className="backdrop-blur-xl bg-white/70 border-white/30 focus:border-blue-400/50 focus:ring-blue-400/30 transition-all duration-200 rounded-xl shadow-[0_4px_12px_0_rgba(255,255,255,0.3)] hover:shadow-[0_4px_16px_0_rgba(59,130,246,0.2)] placeholder:text-gray-500"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="backdrop-blur-xl bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 rounded-xl shadow-[0_4px_16px_0_rgba(59,130,246,0.4)] border border-blue-400/30 hover:shadow-[0_6px_20px_0_rgba(59,130,246,0.5)]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}