// AI Service cho tư vấn học đường sức khỏe học đường
const GEMINI_API_KEY = 'AIzaSyABI1BYd_ZjvXGU8j1O1wtQpPvcdA1mHmQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Hệ thống prompt cho tư vấn học đường
const SCHOOL_HEALTH_PROMPT = `Bạn là một chuyên gia tư vấn sức khỏe học đường với kiến thức sâu rộng về:
- Dinh dưỡng học đường và phát triển thể chất
- Sức khỏe tâm lý và tâm lý học đường
- Phòng chống bệnh tật và vệ sinh học đường
- Phát triển kỹ năng sống và giáo dục sức khỏe
- Quản lý stress và áp lực học tập
- Phát triển thói quen lành mạnh

Hãy trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu và thực tế. Luôn đưa ra lời khuyên hữu ích và an toàn.`;

// Gửi tin nhắn đến AI
export const sendMessageToAI = async (message, conversationHistory = []) => {
  try {
    const fullPrompt = `${SCHOOL_HEALTH_PROMPT}\n\nLịch sử trò chuyện:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nNgười dùng: ${message}\n\nChuyên gia tư vấn:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
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
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Không nhận được phản hồi từ AI');
    }
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn đến AI:', error);
    throw new Error('Không thể kết nối với AI. Vui lòng thử lại sau!');
  }
};

// Tạo gợi ý câu hỏi cho phụ huynh
export const getSuggestedQuestions = () => {
  return [
    {
      category: "Dinh dưỡng",
      questions: [
        "Thực đơn dinh dưỡng cho học sinh tiểu học như thế nào?",
        "Làm sao để trẻ ăn nhiều rau xanh hơn?",
        "Bữa sáng quan trọng như thế nào với học sinh?",
        "Thực phẩm nào tốt cho trí não của trẻ?",
        "Cách chế biến món ăn hấp dẫn cho trẻ?"
      ]
    },
    {
      category: "Sức khỏe tâm lý",
      questions: [
        "Làm sao để giảm stress cho học sinh?",
        "Cách xử lý khi trẻ bị bắt nạt ở trường?",
        "Làm thế nào để trẻ tự tin hơn?",
        "Dấu hiệu trẻ bị trầm cảm là gì?",
        "Cách giúp trẻ vượt qua áp lực học tập?"
      ]
    },
    {
      category: "Phát triển thể chất",
      questions: [
        "Bài tập thể dục nào phù hợp cho học sinh?",
        "Làm sao để trẻ cao lớn hơn?",
        "Thời gian ngủ hợp lý cho trẻ là bao nhiêu?",
        "Cách phòng tránh béo phì ở trẻ em?",
        "Hoạt động ngoài trời nào tốt cho trẻ?"
      ]
    },
    {
      category: "Vệ sinh và phòng bệnh",
      questions: [
        "Cách phòng chống bệnh tay chân miệng?",
        "Làm sao để trẻ rửa tay đúng cách?",
        "Cách xử lý khi trẻ bị sốt?",
        "Vaccine nào cần thiết cho trẻ?",
        "Cách phòng chống bệnh mùa đông cho trẻ?"
      ]
    },
    {
      category: "Học tập và phát triển",
      questions: [
        "Cách giúp trẻ tập trung học tập?",
        "Thời gian học tập hợp lý cho trẻ?",
        "Cách khuyến khích trẻ đọc sách?",
        "Hoạt động nào giúp phát triển trí não?",
        "Cách cân bằng giữa học và chơi?"
      ]
    }
  ];
}; 