/**
 * ============================================
 *  모바일 청첩장 설정 파일
 *  이 파일만 수정하면 청첩장이 완성됩니다.
 *
 *  이미지는 설정이 필요 없습니다.
 *  아래 폴더에 1.jpg, 2.jpg, ... 순서로 넣어주세요:
 *    images/hero/1.jpg       — 메인 사진 (1장)
 *    images/story/1.jpg ...  — 스토리 사진 (자동 감지)
 *    images/gallery/1.jpg ...— 갤러리 사진 (자동 감지)
 *    images/location/1.jpg   — 오시는 길 사진 (1장)
 *    images/og/1.jpg         — OG 공유 썸네일 (1장)
 * ============================================
 */

const CONFIG = {
  // ── 초대장 열기 ──
  useCurtain: true,  // 초대장 열기 화면 사용 여부 (true: 사용, false: 바로 본문 표시)

  // ── 메인 (히어로) ──
  groom: {
    name: "경일",
    lastName: "민",
    fullName: "민경일",
    father: "민현기",
    mother: "조한임",
    fatherDeceased: false, // 故인이면 true
    motherDeceased: false,
  },

  bride: {
    name: "유민",
    lastName: "박",
    fullName: "박유민",
    father: "박우현",
    mother: "서혜주",
    fatherDeceased: false,
    motherDeceased: false,
  },

  wedding: {
    date: "2025-08-30",        // YYYY-MM-DD
    time: "11:30",             // HH:MM (24시간)
    dayOfWeek: "일요일",
    venue: "용인 IT 컨벤션",
    hall: "그레이스 홀",
    address: "경기도 용인시 기흥구 흥덕1로 13(영덕동 1005) IT밸리 B/D2 층",
    mapLinks: {
      kakao: "https://kko.to/eWmbckU_bq",
      naver: "https://map.naver.com/p/search/%EC%95%84%EC%9D%B4%ED%8B%B0%EC%BB%A8%EB%B2%A4%EC%85%98/place/33989425?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home/",
    },
  },

  // ── 인사말 ──
  greeting: {
    title: "소중한 분들을 초대합니다",
    content:
      "서로 다른 길을 걷던 두 사람이\n하나의 길을 함께 걷게 되었습니다.\n\n삶의 여정 속에서 만난 소중한 인연,\n이제 평생을 함께 하려 합니다.\n\n귀한 걸음 하시어\n저희의 새 출발을 축복해 주세요.",
  },

  // ── 우리의 이야기 ──
  story: {
    title: "우리의 이야기",
    content:
      "서로 다른 길을 걷던 두 사람이\n하나의 길을 함께 걷게 되었습니다.\n\n여러분을 소중한 자리에 초대합니다.",
  },

  // ── 오시는 길 ──
  // (mapLinks는 wedding 객체 내에 포함)

  // ── 마음 전하실 곳 ──
  accounts: {
    groom: [
      { role: "신랑", name: "면경일", bank: "케", number: "110-123-456789" },
    ],
    bride: [
      { role: "신부", name: "박유민", bank: "하나은행", number: "234-56-7890123" },
      { role: "아버지", name: "박우현", bank: "농협", number: "301-0123-4567-01" },
    ],
  },

  // ── 링크 공유 시 나타나는 문구 ──
  kakaoShare: {
    // Kakao Developers 앱키 (JavaScript 키)
    appKey: "",
    title: "민경일 ♥ 박유민 결혼합니다",
    description: "2026년 8월 30일 일요일 오후 11시30분\n용인 IT 컨벤션",
  },

  meta: {
    title: "민경일 ♥ 박유민 결혼합니다",
    description: "2026년 8월 30일 일요일 오후 11시30분\n용인 IT 컨벤션",
  },
};
