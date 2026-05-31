window.PORTFOLIO_DEFAULTS = {
  version: 1,
  profile: {
    nameKo: "손민형",
    nameEn: "Minhyung Son",
    birthYear: "2000",
    role: "Product Designer",
    location: "Seoul, Korea",
    email: "Add email in Edit Mode",
    phone: "Add phone in Edit Mode",
    linkedin: "https://www.linkedin.com/in/%EB%AF%BC%ED%98%95-%EC%86%90-a209b5361/",
    behance: "https://www.behance.net/_mxnxxng",
    instagram: "https://instagram.com/",
    intro:
      "제품과 사용 맥락 사이의 불편을 발견하고, 실현 가능한 구조와 정제된 인터랙션으로 풀어내는 제품 디자이너입니다. 의료, 웨어러블, 하드웨어 인터페이스처럼 물리적 제품과 디지털 경험이 만나는 지점에 관심이 있습니다.",
    education: [
      "Hanyang University ERICA, Industrial Design, Graduate",
      "Design Engineering Studio, product and engineering convergence"
    ],
    experience: [
      "OLIVESTONE, Seoul - Planning, UX, Graphic",
      "Freelance product and visual design projects"
    ],
    awards: [
      "James Dyson Award 2025 Korea National Winner - Ventri",
      "Spark Design Award 2024 Silver - Ventri",
      "IBDA 2024 Silver - Ventri",
      "CES 2025 Eureka Park Showcase - Ventri"
    ],
    tools: ["Photoshop", "Illustrator", "Lightroom", "After Effects", "Figma"]
  },
  settings: {
    glassBlur: 14,
    thumbnailOpacity: 0.92,
    fontScale: 1,
    cardSpacing: 22,
    gridDensity: 420,
    animationSpeed: 360
  },
  projects: [
    {
      id: "ventri",
      title: "Ventri",
      subtitle: "혈액 역류를 감지하고 차단하는 링거 부착형 의료기기",
      category: "Medical Device",
      year: "2025",
      status: "Awarded",
      thumbnail: "assets/ventri-hero.svg",
      hero: "assets/ventri-hero.svg",
      summary:
        "Ventri는 수액 투여 과정에서 발생하는 혈액 역류를 실시간으로 감지하고 차단해 환자 안전과 간호 업무 환경을 개선하는 프로젝트입니다.",
      tags: ["Healthcare", "Feasibility", "Sensor", "Actuator", "CES"],
      role: "Project Lead, Product Design, UX Scenario, Prototyping",
      sections: {
        problem:
          "수액 투여 중 환자가 잠들거나 의료진이 즉시 확인하지 못하는 상황에서 혈액 역류가 방치될 수 있습니다. 이는 감염 위험, 불안, 사후 처치 부담으로 이어집니다.",
        process:
          "현장 의료진 인터뷰를 통해 문제 빈도와 위험도를 확인하고, 튜브를 부드럽게 압박해 흐름을 멈추는 구조를 중심으로 제품 방향을 정의했습니다.",
        research:
          "간호사 4명과의 대화를 바탕으로 역류 감지 위치, 배터리 분리, 기존 링거 워크플로에 끼치는 영향을 주요 검증 항목으로 설정했습니다.",
        ideation:
          "빨대를 손으로 눌러 흐름을 멈추는 행위에서 출발해 초음파 센서와 액추에이터 조합, 이후 페리스탈틱 펌프 기반의 선제적 차단 구조로 발전시켰습니다.",
        prototype:
          "초기 프로토타입은 초음파 센서가 역류를 감지하면 하단 원형 밸브가 튜브를 압박하는 방식입니다. 이후 롤러가 튜브를 지속적으로 압박해 역류를 예방하는 구조를 개발 중입니다.",
        result:
          "James Dyson Award 2025 국내전 우승, Spark Design Award Silver, IBDA Silver, CES 2025 Eureka Park 전시를 통해 실현 가능성과 시장성을 검증했습니다."
      },
      gallery: ["assets/ventri-hero.svg", "assets/ventri-detail.svg", "assets/press-thumb.svg"],
      videoUrl: "https://www.youtube.com/embed/vplHYWsIcd0",
      links: [
        {
          label: "James Dyson Award",
          url: "https://www.jamesdysonaward.org/ja-JP/2025/project/ventri"
        },
        {
          label: "Behance",
          url: "https://www.behance.net/_mxnxxng"
        }
      ]
    },
    {
      id: "equi",
      title: "EQUI",
      subtitle: "감각 균형을 위한 헤드 인터페이스 콘셉트",
      category: "Wearable Interface",
      year: "2024",
      status: "Portfolio",
      thumbnail: "assets/equi-hero.svg",
      hero: "assets/equi-hero.svg",
      summary:
        "EQUI는 착용자의 감각 균형 경험을 중심으로 하드웨어 폼, 접촉부, 시각 인터페이스를 함께 설계한 웨어러블 콘셉트입니다.",
      tags: ["Wearable", "Interface", "Human Factors", "CMF"],
      role: "Industrial Design, CMF, UX Scenario",
      sections: {
        problem:
          "웨어러블 제품은 기능을 전달하는 동시에 신체에 직접 닿기 때문에 시각적 부담, 압박감, 조작 방식이 모두 경험 품질을 좌우합니다.",
        process:
          "착용 흐름, 무게 중심, 시야 간섭, 표면 마감의 인상을 기준으로 여러 폼팩터를 비교했습니다.",
        research:
          "헤드 마운트 제품의 사용 자세와 피로 요인을 관찰하고, 접촉부가 사용자의 불안감을 줄이는 방향으로 구성했습니다.",
        ideation:
          "검은 렌즈와 밝은 지지 구조의 대비를 이용해 기술적인 인상과 의료적 안정감을 동시에 표현했습니다.",
        prototype:
          "폼 스터디와 착용 시나리오를 조합해 제품의 실루엣, 조작면, 보관 방식을 정리했습니다.",
        result:
          "Behance 포트폴리오 프로젝트로 공개했고, 후속 프로젝트의 하드웨어 인터페이스 설계 언어로 확장 가능합니다."
      },
      gallery: ["assets/equi-hero.svg", "assets/surface-hero.svg"],
      videoUrl: "",
      links: [
        {
          label: "Behance",
          url: "https://www.behance.net/_mxnxxng"
        }
      ]
    },
    {
      id: "aerosound",
      title: "AeroSound",
      subtitle: "공간 음향 경험을 위한 원형 모듈 제품 템플릿",
      category: "Editable Template",
      year: "Template",
      status: "Replace",
      thumbnail: "assets/aerosound-hero.svg",
      hero: "assets/aerosound-hero.svg",
      summary:
        "실제 프로젝트를 추가하기 전 레이아웃과 상세 페이지 구조를 테스트하기 위한 편집용 템플릿입니다.",
      tags: ["Template", "Sound", "Product Render"],
      role: "Replace with your role",
      sections: {
        problem: "이 영역을 프로젝트의 문제 정의로 교체하세요.",
        process: "리서치, 스케치, 모델링, 프로토타이핑 흐름을 단계별로 기록하세요.",
        research: "사용자 관찰과 시장 조사를 정리하세요.",
        ideation: "핵심 아이디어와 선택하지 않은 대안까지 남기면 설득력이 좋아집니다.",
        prototype: "실험한 재료, 구조, 인터랙션, 검증 기준을 기록하세요.",
        result: "최종 산출물, 영상, 수상, 배포 결과를 정리하세요."
      },
      gallery: ["assets/aerosound-hero.svg", "assets/surface-hero.svg"],
      videoUrl: "",
      links: []
    },
    {
      id: "studio-object-system",
      title: "Studio Object System",
      subtitle: "CMF와 모션을 결합한 오브젝트 시스템 템플릿",
      category: "Editable Template",
      year: "Template",
      status: "Replace",
      thumbnail: "assets/studio-hero.svg",
      hero: "assets/studio-hero.svg",
      summary:
        "하이엔드 제품 디자인 에이전시 톤을 참고한 대형 이미지 중심의 상세 페이지 템플릿입니다.",
      tags: ["Template", "CMF", "Motion"],
      role: "Replace with your role",
      sections: {
        problem: "브랜드 맥락과 제품이 해결해야 하는 감각적, 기능적 문제를 입력하세요.",
        process: "무드보드, 조형 언어, 소재 테스트, 최종 렌더링으로 이어지는 흐름을 구성하세요.",
        research: "레퍼런스와 사용 환경을 정리하세요.",
        ideation: "형태 실험과 비율 비교를 보여주세요.",
        prototype: "3D 프린트, 렌더링, 영상 시퀀스 등을 연결하세요.",
        result: "최종 결과와 학습을 짧고 밀도 있게 정리하세요."
      },
      gallery: ["assets/studio-hero.svg", "assets/ventri-detail.svg"],
      videoUrl: "",
      links: []
    }
  ],
  press: [
    {
      title: "Ventri | James Dyson Award",
      source: "James Dyson Award",
      date: "2025",
      thumbnail: "assets/press-thumb.svg",
      url: "https://www.jamesdysonaward.org/ja-JP/2025/project/ventri",
      summary:
        "Ventri를 국내 최우수상 프로젝트로 소개하며, 혈액 역류 예방 장치의 구조, 개발 과정, 차별성, 팀 멤버를 정리한 공식 프로젝트 페이지입니다."
    },
    {
      title: "다이슨, 제임스 다이슨 어워드 국내전 우승작에 혈액 역류 솔루션 ‘벤트리’ 선정",
      source: "동아일보",
      date: "2025.09.10",
      thumbnail: "assets/press-thumb.svg",
      url: "https://www.donga.com/news/Economy/article/all/20250910/132361648/1",
      summary:
        "다이슨코리아가 Ventri를 James Dyson Award 2025 국내전 우승작으로 선정했다는 소식과 장치의 작동 원리를 소개합니다."
    },
    {
      title: "‘제임스 다이슨 어워드 2025’ 국내전 수상작 3개 발표",
      source: "전자신문",
      date: "2025.09.10",
      thumbnail: "assets/press-thumb.svg",
      url: "https://www.etnews.com/20250910000131",
      summary:
        "Ventri가 의료 현장의 혈액 역류를 감지하고 차단하는 링거 부착형 장치로 평가받았고, 상용화 상금을 받는다고 보도했습니다."
    },
    {
      title: "다이슨, ‘제임스 어워드’ 수상팀 발표... 우승작은 혈액 역류 예방 솔루션",
      source: "씨넷코리아",
      date: "2025.09.10",
      thumbnail: "assets/press-thumb.svg",
      url: "https://www.cnet.co.kr/view/?no=20250910105637",
      summary:
        "한양대학교 ERICA 산업디자인학과 손민형 등 Ventri 팀 멤버와 프로젝트 배경, 국내전 우승 소감을 함께 다룬 기사입니다."
    },
    {
      title: "한양대 ERICA 최종우 교수팀, ‘제임스 다이슨 어워드 2025’ 국내전 우승",
      source: "뉴시스",
      date: "2025.09.11",
      thumbnail: "assets/press-thumb.svg",
      url: "https://www.newsis.com/view/NISX20250911_0003324671",
      summary:
        "한양대 ERICA 산업디자인학과와 커뮤니케이션디자인학과 학생들이 개발한 Ventri의 국내전 우승과 CES, Spark, IBDA 성과를 보도했습니다."
    },
    {
      title: "“링거 역류, 이제 그만”... 美 CES도 주목했다는 이 기술",
      source: "전자신문",
      date: "2025.09.13",
      thumbnail: "assets/press-thumb.svg",
      url: "https://www.etnews.com/20250913000001",
      summary:
        "프로젝트 대표 손민형의 수상 소감, CES 2025 주목, Spark 및 부산국제디자인어워드 성과를 함께 소개한 후속 기사입니다."
    }
  ]
};
