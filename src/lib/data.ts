export interface Category {
  id: string;
  name: string;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  categories: Category[];
  status: 'Đang ra' | 'Hoàn thành';
  views: number;
  chapterCount: number;
  rating: number;
}

export interface Chapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  title: string;
  content: string[];
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Tiên Hiệp' },
  { id: '2', name: 'Kiếm Hiệp' },
  { id: '3', name: 'Ngôn Tình' },
  { id: '4', name: 'Xuyên Không' },
  { id: '5', name: 'Huyền Huyễn' },
];

export const MOCK_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'Thanh Phong Minh Nguyệt',
    author: 'Cố Mạn',
    coverUrl: 'https://images.unsplash.com/photo-1633333423719-7561fadb733b?w=600&h=800&fit=crop',
    description: 'Một câu chuyện tình yêu nhẹ nhàng, êm đềm như cơn gió mùa thu. Nàng là con gái gia đình thư hương, trót vương vấn hình bóng người thư sinh nghèo năm xưa. Định mệnh xoay vần, họ gặp lại nhau giữa chốn thanh vân...',
    categories: [CATEGORIES[2], CATEGORIES[3]],
    status: 'Hoàn thành',
    views: 1250000,
    chapterCount: 42,
    rating: 4.8,
  },
  {
    id: 'story-2',
    title: 'Cửu Trùng Thiên Triều',
    author: 'Thiên Tầm',
    coverUrl: 'https://images.unsplash.com/photo-1608681283842-886d34ac67cb?w=600&h=800&fit=crop',
    description: 'Hắn mang trong mình huyết mạch long tộc, từng bước đạp lên đỉnh cao của lục địa. Giữa muôn vàn kiếp nạn, hắn chọn cách bứt phá càn khôn, kiến tạo một triều đại trải dài chín tầng trời.',
    categories: [CATEGORIES[0], CATEGORIES[4]],
    status: 'Đang ra',
    views: 3400500,
    chapterCount: 156,
    rating: 4.6,
  },
  {
    id: 'story-3',
    title: 'Mạc Thượng Hoa Khai',
    author: 'Tử Yên',
    coverUrl: 'https://images.unsplash.com/photo-1522030064573-0ff7e600fa32?w=600&h=800&fit=crop',
    description: 'Hoa nở trên đường tĩnh lặng, người đợi chốn hồng trần. Bức tranh thuỷ mặc vẽ nên một cuộc đời đầy bi hoan ly hợp của một nữ tử bước ra từ giang hồ, cuốn vào vòng xoáy hoàng quyền.',
    categories: [CATEGORIES[1], CATEGORIES[2]],
    status: 'Hoàn thành',
    views: 890000,
    chapterCount: 88,
    rating: 4.9,
  },
  {
    id: 'story-4',
    title: 'Tinh Thần Chi Lộ',
    author: 'Phong Hỏa',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=800&fit=crop',
    description: 'Khi các tinh tú rơi rụng, một kỷ nguyên mới bắt đầu. Thiếu niên mang trong mình dị hỏa, hành tẩu giang hồ, tìm kiếm bí mật của vũ trụ rộng lớn.',
    categories: [CATEGORIES[4]],
    status: 'Đang ra',
    views: 2100000,
    chapterCount: 302,
    rating: 4.5,
  }
];

export const MOCK_CHAPTERS: Chapter[] = [
  {
    id: 'c-1-1',
    storyId: 'story-1',
    chapterNumber: 1,
    title: 'Gặp Lại Chốn Xưa',
    content: [
      'Gió mùa thu hiu hắt thổi qua rặng liễu ven hồ, mang theo chút se lạnh của những ngày giao mùa. Thanh Thu khẽ chớp mắt, đưa tay phẩy nhẹ dải lụa mỏng bay lòa xòa trước mặt.',
      'Gác nhỏ nhà nàng nhìn thẳng ra hồ Tây Cảnh. Từ đây, nàng có thể thấy những chiếc thuyền gỗ lặng lẽ rẽ sóng nước mênh mang. Đã năm năm trôi qua kể từ ngày người đó rời đi. Năm năm, một khoảng thời gian không dài với đời người, nhưng đủ để cô thiếu nữ mười sáu tuổi ngây thơ ngày nào trở nên đằm thắm, tĩnh lặng hơn.',
      '"Tiểu thư, trời nổi gió rồi, người nên khoác thêm áo ngoài." Tiếng nha hoàn Tiểu Thúy vang lên cắt đứt dòng suy nghĩ của nàng.',
      'Thanh Thu khẽ mỉm cười, quay đầu lại: "Không sao, ta chỉ đứng hóng gió một lát thôi."',
      'Đúng lúc ấy, từ phía cổng trước vang lên tiếng ồn ào. Quản gia hớt hải chạy vào báo: "Tiểu thư, lão gia có lệnh gọi người ra sảnh chính. Có khách quý đến thăm."',
      'Thanh Thu hơi cau mày. Quê nhà vốn dĩ thanh tĩnh, ít khi có khách vãng lai, càng đừng nói đến "khách quý" khiến phụ thân nàng phải đích thân ra đón. Nàng chỉnh lại vạt áo, chậm rãi theo quản gia bước về phía trước.',
      'Vừa bước qua ngạch cửa, bước chân Thanh Thu bỗng khựng lại.',
      'Giữa sảnh đường rộng lớn, ánh nắng xuyên qua khe cửa rọi xuống một bóng lưng cao ngất, khoác trên mình bộ trường bào màu xanh nhạt. Khi nghe thấy tiếng bước chân, người đó từ từ quay lại.',
      'Ánh mắt chạm nhau.',
      'Trái tim Thanh Thu tưởng chừng như ngừng đập trong một khoảnh khắc. Khuôn mặt quen thuộc vương chút sương gió thời gian, đôi mắt vẫn tĩnh lặng sâu thẳm như xưa, nhưng giờ đây lại mang theo một vẻ phong sương khó tả.',
      'Là chàng.',
      'Dịch Hàn.'
    ]
  },
  {
    id: 'c-1-2',
    storyId: 'story-1',
    chapterNumber: 2,
    title: 'Trà Chiều Bên Hiên',
    content: [
      'Không khí trong sảnh đột nhiên như đông cứng lại. Lão phu nhân ngồi sạp trên mỉm cười hiền từ, dường như không nhận ra sự khác thường giữa hai người.',
      '"Thu nhi, tới đây chào Dịch công tử đi con." Lão gia lên tiếng phá vỡ sự im lặng.',
      'Thanh Thu rũ mắt, khép nép bước tới, nhẹ nhàng nhún người hành lễ: "Thanh Thu bái kiến Dịch công tử."',
      'Dịch Hàn hơi khom người đáp lễ, thanh âm trầm thấp vang lên: "Thanh Thu cô nương, đã lâu không gặp."',
      'Câu nói "Đã lâu không gặp" nhẹ tựa lông hồng nhưng lại khiến lòng người nghe dậy sóng. Lão gia ngạc nhiên: "Hai đứa quen biết nhau từ trước sao?"',
      'Dịch Hàn mỉm cười nhạt, ánh mắt vẫn không rời khỏi bóng dáng mảnh mai trước mặt: "Năm xưa vãn bối từng tá túc tại Lâm châu một thời gian, may mắn được Lâm bá phụ chỉ giáo vài bài thi phú, cũng từng có duyên gặp mặt Thanh Thu cô nương vài lần."',
      'Trái tim Thanh Thu siết lại. Vài lần gặp mặt? Chàng coi những tháng ngày cùng ngâm thơ, gảy đàn dưới ánh trăng thu ngày đó chỉ là "vài lần gặp mặt" sao?',
      'Buổi trà chiều diễn ra trong không khí gượng gạo. Thanh Thu phần lớn thời gian chỉ biết cúi đầu, lặng lẽ rót trà. Nước sơn trà màu hổ phách sóng sánh trong chén ngọc, thơm ngát mùi sen, nhưng nàng lại chẳng nếm ra vị gì.',
      'Khi ánh chiều tà bắt đầu buông xuống, Dịch Hàn mới đứng dậy cáo từ. Lâm lão gia tiễn chàng ra tận cổng, còn Thanh Thu chỉ đứng nhìn theo từ xa.',
      'Chỉ một bóng dáng ấy thôi, đã làm xáo trộn cả mặt hồ tâm trí tưởng chừng đã lặng sóng của nàng.'
    ]
  }
];

export function getStoryById(id: string): Story | undefined {
  return MOCK_STORIES.find(s => s.id === id);
}

export function getChaptersByStoryId(storyId: string): Chapter[] {
  return MOCK_CHAPTERS.filter(c => c.storyId === storyId).sort((a, b) => a.chapterNumber - b.chapterNumber);
}

export function getChapter(storyId: string, chapterNumber: number): Chapter | undefined {
  return MOCK_CHAPTERS.find(c => c.storyId === storyId && c.chapterNumber === chapterNumber);
}
