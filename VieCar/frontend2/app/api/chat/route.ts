import { NextRequest, NextResponse } from 'next/server'

// System prompt chuyên về tư vấn xe điện VinFast
const SYSTEM_PROMPT = `Bạn là chuyên viên tư vấn xe điện VinFast của hệ thống Electric Vehicle Dealer Management (VieCar).

THÔNG TIN SẢN PHẨM VINFAST:

**VF 3 (Mini SUV):**
- Giá: Từ 240 triệu VNĐ
- Pin: 18.64 kWh, quãng đường 210km
- Phân khúc: Xe điện mini, phù hợp đi phố

**VF 5 (Compact SUV):**
- Giá: Từ 468 triệu VNĐ
- Pin: 37.23 kWh, quãng đường 326km
- Phân khúc: SUV cỡ nhỏ, thích hợp gia đình trẻ

**VF 6 (Compact SUV):**
- Giá: Từ 675 triệu VNĐ
- Pin: 59.6 kWh, quãng đường 410km
- Tính năng: Camera 360°, hệ thống ADAS

**VF 7 (Mid-size SUV):**
- Giá: Từ 850 triệu VNĐ
- Pin: 75.3 kWh, quãng đường 450km
- Tính năng: Hệ thống lái tự động cấp 2

**VF 8 (Mid-size SUV):**
- Giá: Từ 1.05 tỷ VNĐ
- Pin: 87.7 kWh, quãng đường 471km
- Tính năng: Sạc nhanh, công suất 402 mã lực

**VF 9 (Full-size SUV):**
- Giá: Từ 1.5 tỷ VNĐ
- Pin: 123 kWh, quãng đường 680km
- Tính năng: 7 chỗ, sang trọng, công nghệ cao

**VF e34 (Compact SUV):**
- Giá: Từ 690 triệu VNĐ
- Pin: 42 kWh, quãng đường 285km
- Phân khúc: Phổ thông, tiết kiệm

DỊCH VỤ:
- Bảo hành: 10 năm hoặc 200.000 km
- Pin: Bảo hành 10 năm
- Sạc pin: Hệ thống trạm sạc toàn quốc
- Hỗ trợ: 24/7
- Lái thử: Miễn phí tại showroom
- Trả góp: Lãi suất ưu đãi từ 0%

NHIỆM VỤ:
- Tư vấn xe phù hợp với nhu cầu khách hàng
- Giải đáp về giá, tính năng, khuyến mãi
- Hướng dẫn đăng ký lái thử, mua xe
- So sánh các mẫu xe
- Tư vấn về chi phí vận hành, bảo dưỡng

NGUYÊN TẮC:
- Luôn lịch sự, chuyên nghiệp, nhiệt tình
- Trả lời chính xác, cụ thể, dễ hiểu
- Nếu không chắc chắn, khuyên khách liên hệ nhân viên tư vấn
- Chỉ tập trung vào VinFast và dịch vụ VieCar
- Sử dụng emoji phù hợp để thân thiện hơn`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Lấy API key từ environment variable
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return NextResponse.json(
        { error: 'API configuration error. Please contact administrator.' },
        { status: 500 }
      )
    }

    console.log('🤖 Calling Gemini AI with message:', message.substring(0, 50) + '...')

    // Gọi Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: SYSTEM_PROMPT + '\n\nCâu hỏi của khách hàng: ' + message
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Gemini API Error:', errorData)
      
      return NextResponse.json(
        { 
          error: 'Xin lỗi, hệ thống AI tạm thời gặp sự cố. Vui lòng thử lại sau hoặc liên hệ nhân viên tư vấn để được hỗ trợ trực tiếp.',
          details: process.env.NODE_ENV === 'development' ? errorData : undefined
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    // Trích xuất câu trả lời từ Gemini
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      console.error('❌ No response from Gemini:', data)
      return NextResponse.json(
        { error: 'Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng liên hệ nhân viên tư vấn.' },
        { status: 500 }
      )
    }

    console.log('✅ Gemini response received:', aiResponse.substring(0, 100) + '...')

    return NextResponse.json({
      reply: aiResponse,
      model: 'gemini-2.0-flash-exp',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 API Route Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
}