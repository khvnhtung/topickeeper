/**
 * IELTS Speaking Quest — Story Multiplier Clusters
 * Connects 15–20 core life stories to all 62 forecast cue cards
 */

const storyClusters = [
  {
    "id": 1,
    "title": "Mẹ / Người thân truyền cảm hứng (Inspiring Family Member)",
    "emoji": "👩‍🏫",
    "description": "Câu chuyện về người mẹ đảm đang, chu đáo, vượt khó và luôn giúp đỡ mọi người.",
    "topicIds": [
      1,
      6,
      13,
      25,
      45
    ],
    "narrative": "Tập trung vào hình ảnh mẹ (hoặc người thân) với kỹ năng lập kế hoạch xuất sắc (#13), luôn sẵn lòng giúp đỡ người khác (#6), động viên bạn vượt qua mục tiêu khó (#25), đạt được thành tựu đáng tự hào (#45), và khiến cả gia đình tự hào (#1)."
  },
  {
    "id": 2,
    "title": "Chuyến đi biển Cửa Lò (Cua Lo Beach Trip)",
    "emoji": "🏖️",
    "description": "Chuyến đi biển cùng gia đình linh hoạt ứng dụng cho các đề thiên nhiên, du lịch, địa điểm yên tĩnh.",
    "topicIds": [
      11,
      22,
      29,
      43,
      44,
      57
    ],
    "narrative": "Chuyến đi biển Cửa Lò bằng ô tô cùng gia đình. Có thể dùng để miêu tả một nơi yên tĩnh ngắm sóng biển (#11), thành phố/địa điểm đáng sống (#22, #29), địa điểm du lịch đáng gợi ý (#43), chuyến đi trái mùa ít hàng quán (#44), hoặc điểm đến xa xôi (#57)."
  },
  {
    "id": 3,
    "title": "Tiệc sinh nhật ấm cúng (Birthday Celebration)",
    "emoji": "🎂",
    "description": "Bữa tiệc sinh nhật ngập tràn tiếng cười, quà tặng bất ngờ và món ăn đặc biệt.",
    "topicIds": [
      4,
      8,
      26,
      62
    ],
    "narrative": "Kỷ niệm sinh nhật tại căn hộ/nhà hàng cùng bạn bè thân thiết. Gắn liền với món quà ý nghĩa (#8), những món ăn ngon đặc biệt (#26), chiếc bánh sinh nhật socola tự làm (#62), và khoảnh khắc mọi người cùng cười vui vẻ (#4)."
  },
  {
    "id": 4,
    "title": "Đi xem hòa nhạc cùng Lan (Concert with Lan)",
    "emoji": "🎵",
    "description": "Trải nghiệm tham dự concert sôi động và cách xử lý tình huống thông minh khi gặp sự cố.",
    "topicIds": [
      14,
      19,
      23,
      54
    ],
    "narrative": "Lần đầu đi xem một sự kiện âm nhạc lớn (#54). Trải nghiệm biểu diễn trực tiếp (#14), âm thanh bài hát ballad không hợp gu (#19), và cách cô bạn thân Lan xử lý thông minh khi điện thoại hết pin vào lúc 11h đêm bằng cách nhờ xe cảnh sát (#23)."
  },
  {
    "id": 5,
    "title": "Giao thông & Ô nhiễm môi trường (Traffic & Environment)",
    "emoji": "🚗",
    "description": "Vấn đề tắc đường giờ cao điểm, bụi mịn và các giải pháp bảo vệ môi trường.",
    "topicIds": [
      10,
      25,
      46
    ],
    "narrative": "Trải nghiệm chuyến đi gặp tắc đường và khói bụi giờ cao điểm (#10), động viên bạn bè chuyển sang đi xe đạp (#25), và đề xuất luật tăng thuế xe cá nhân hoặc phạt xả rác để giảm ô nhiễm không khí (#46)."
  },
  {
    "id": 6,
    "title": "Mua sắm Shopee & Thiết bị công nghệ (Shopee & Tech)",
    "emoji": "📱",
    "description": "Thói quen mua sắm trực tuyến, sở hữu thiết bị thông minh và xử lý lỗi kỹ thuật.",
    "topicIds": [
      7,
      18,
      21,
      35
    ],
    "narrative": "Sử dụng ứng dụng mua sắm trực tuyến Shopee (#7), thiết bị công nghệ hữu ích muốn sở hữu (#18), lần phải trả phí cao hơn dự kiến (#21), và trải nghiệm sửa chữa/xử lý sự cố lỗi pin thiết bị (#35)."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { storyClusters };
}

if (typeof window !== 'undefined') {
  window.storyClusters = storyClusters;
}
