import type { PetProfile } from './storage'

export type QuestionSystem = 'respiratory' | 'neurological' | 'urinary' | 'digestive' | 'general'
export type UrgencyLevel = 'watch' | 'caution' | 'emergency'

export type Question = {
  id: string
  system: QuestionSystem
  text: string
  options: string[]
  emergencyTriggers?: string[]
}

const RESPIRATORY_KW = ['기침', '호흡', '숨', '헐떡', '코피', '재채기', '청색', '파란', '쌕쌕', '캑캑', '그르렁']
const NEUROLOGICAL_KW = ['경련', '발작', '비틀', '떨림', '의식', '쓰러', '마비', '눈이 돌아', '고개 기울']
const URINARY_KW = ['소변', '오줌', '혈뇨', '배뇨', '화장실을 못', '소변을 못']
const DIGESTIVE_KW = ['구토', '설사', '식욕', '밥을 안', '먹지 않', '토', '혈변', '복부']

const EMERGENCY_KW = [
  '파랗', '청색', '보라색', '숨을 못', '경련', '발작', '의식 없', '쓰러', '소변을 전혀',
  '피가 많이', '다리가 마비', '뒷다리', '눈이 뒤로', '움직이지 못'
]

export function detectEmergency(text: string): boolean {
  return EMERGENCY_KW.some(kw => text.includes(kw))
}

export function detectSystems(text: string): QuestionSystem[] {
  const systems: QuestionSystem[] = []
  if (RESPIRATORY_KW.some(kw => text.includes(kw))) systems.push('respiratory')
  if (NEUROLOGICAL_KW.some(kw => text.includes(kw))) systems.push('neurological')
  if (URINARY_KW.some(kw => text.includes(kw))) systems.push('urinary')
  if (DIGESTIVE_KW.some(kw => text.includes(kw))) systems.push('digestive')
  return systems.length ? systems : ['general']
}

const QUESTION_BANKS: Record<QuestionSystem, Question[]> = {
  respiratory: [
    {
      id: 'resp_gum',
      system: 'respiratory',
      text: '잇몸이나 혀 색깔이 어떻게 보이나요?',
      options: ['분홍색이에요 (정상)', '창백하거나 흰색이에요', '파랗거나 보라색이에요', '잘 모르겠어요'],
      emergencyTriggers: ['파랗거나 보라색이에요'],
    },
    {
      id: 'resp_effort',
      system: 'respiratory',
      text: '호흡은 어떤 상태인가요?',
      options: ['조금 빠른 편이에요', '많이 헐떡거려요', '배까지 움직이며 숨 쉬어요', '입으로 숨 쉬어요'],
      emergencyTriggers: ['배까지 움직이며 숨 쉬어요', '입으로 숨 쉬어요'],
    },
    {
      id: 'resp_when',
      system: 'respiratory',
      text: '호흡 증상이 언제 더 심해지나요?',
      options: ['밤이나 새벽에 심해요', '운동 후에 심해요', '항상 비슷해요', '기침은 없어요'],
    },
  ],
  neurological: [
    {
      id: 'neuro_seizure',
      system: 'neurological',
      text: '경련이나 발작이 있었나요?',
      options: ['네, 경련이 있었어요', '몸을 심하게 떨었어요', '비틀거리거나 쓰러졌어요', '의식을 잃었어요'],
      emergencyTriggers: ['네, 경련이 있었어요', '의식을 잃었어요'],
    },
    {
      id: 'neuro_duration',
      system: 'neurological',
      text: '증상이 얼마나 지속됐나요?',
      options: ['5분 미만이에요', '5~30분이에요', '30분 이상이에요', '계속 반복돼요'],
      emergencyTriggers: ['5~30분이에요', '30분 이상이에요', '계속 반복돼요'],
    },
  ],
  urinary: [
    {
      id: 'uri_output',
      system: 'urinary',
      text: '소변을 어떻게 보고 있나요?',
      options: ['소변을 아예 못 봐요', '찔끔씩 나와요', '소변에 피가 섞여요', '소변량이 줄었어요'],
      emergencyTriggers: ['소변을 아예 못 봐요'],
    },
    {
      id: 'uri_duration',
      system: 'urinary',
      text: '이 증상이 얼마나 됐나요?',
      options: ['오늘부터예요', '어제부터예요', '2~3일 됐어요', '1주일 이상이에요'],
      emergencyTriggers: ['어제부터예요', '2~3일 됐어요'],
    },
  ],
  digestive: [
    {
      id: 'dige_freq',
      system: 'digestive',
      text: '구토나 설사를 얼마나 자주 하나요?',
      options: ['하루 1~2회', '하루 3~5회', '하루 6회 이상', '구토/설사는 없어요'],
      emergencyTriggers: ['하루 6회 이상'],
    },
    {
      id: 'dige_blood',
      system: 'digestive',
      text: '토하거나 설사에 피가 섞여 있나요?',
      options: ['네, 피가 보여요', '아니요, 없어요', '확인하기 어려워요'],
      emergencyTriggers: ['네, 피가 보여요'],
    },
    {
      id: 'dige_eat',
      system: 'digestive',
      text: '밥과 물을 먹고 있나요?',
      options: ['잘 먹고 마셔요', '조금씩 먹어요', '거의 안 먹어요', '아예 안 먹어요'],
    },
  ],
  general: [
    {
      id: 'gen_duration',
      system: 'general',
      text: '증상이 시작된 지 얼마나 됐나요?',
      options: ['오늘 갑자기 생겼어요', '2~3일 됐어요', '1주일 정도 됐어요', '1개월 이상이에요'],
    },
    {
      id: 'gen_vitality',
      system: 'general',
      text: '전체적인 활기는 어떤가요?',
      options: ['평소와 비슷해요', '조금 처져 있어요', '많이 축 처져요', '거의 움직이지 않아요'],
      emergencyTriggers: ['거의 움직이지 않아요'],
    },
  ],
}

export function buildQuestionQueue(systems: QuestionSystem[], profile: PetProfile | null): Question[] {
  const order: QuestionSystem[] = ['respiratory', 'neurological', 'urinary', 'digestive', 'general']
  const sorted = [...systems].sort((a, b) => order.indexOf(a) - order.indexOf(b))

  // 심장병이면 호흡기 문제가 없어도 호흡기 질문 앞에 추가
  if (profile?.conditions?.includes('심장병') && !sorted.includes('respiratory')) {
    sorted.unshift('respiratory')
  }

  const questions: Question[] = []
  for (const sys of sorted) {
    questions.push(...QUESTION_BANKS[sys].slice(0, 2))
  }
  if (!systems.includes('general')) {
    questions.push(QUESTION_BANKS.general[0])
  }

  // 신부전이면 탈수 확인 질문 맨 앞에 삽입
  if (profile?.conditions?.includes('신부전')) {
    questions.unshift({
      id: 'kidney_dehydrate',
      system: 'general',
      text: '신부전이 있어서 탈수 여부가 중요해요. 피부를 살짝 집었다 놓으면 바로 돌아오나요?',
      options: ['바로 돌아와요', '천천히 돌아와요 (2초 이상)', '그대로 있어요', '확인 못 했어요'],
      emergencyTriggers: ['그대로 있어요'],
    })
  }

  return questions
}

export function checkAnswerForEmergency(question: Question, answer: string): boolean {
  return question.emergencyTriggers?.includes(answer) ?? false
}

export function assessUrgency(questions: Question[], answers: Record<string, string>): UrgencyLevel {
  for (const q of questions) {
    const ans = answers[q.id]
    if (ans && q.emergencyTriggers?.includes(ans)) return 'emergency'
  }

  const cautionAnswers = [
    '창백하거나 흰색이에요', '많이 헐떡거려요', '몸을 심하게 떨었어요', '비틀거리거나 쓰러졌어요',
    '찔끔씩 나와요', '소변에 피가 섞여요', '소변량이 줄었어요', '어제부터예요', '2~3일 됐어요',
    '하루 3~5회', '거의 안 먹어요', '아예 안 먹어요', '많이 축 처져요',
    '천천히 돌아와요 (2초 이상)',
  ]
  if (Object.values(answers).some(a => cautionAnswers.includes(a))) return 'caution'

  return 'watch'
}

export function makeResultMessage(urgency: UrgencyLevel, systems: QuestionSystem[], petName: string): string {
  const name = petName || '반려동물'

  if (urgency === 'emergency') {
    return [
      '⚠️ 지금 바로 응급 병원에 가세요!',
      '',
      `${name}의 증상이 응급 상황일 가능성이 높습니다.`,
      '지체 없이 가장 가까운 동물병원 응급실로 이동해주세요.',
      '',
      '이동 중에는:',
      '• 조용하고 따뜻하게 유지해주세요',
      '• 억지로 먹이거나 마시게 하지 마세요',
      '• 전화로 미리 병원에 알려주세요',
    ].join('\n')
  }

  const sysAdvice: Partial<Record<QuestionSystem, string>> = {
    respiratory: '오늘 중으로 병원에 가보시는 게 좋겠어요.',
    neurological: '빠른 시일 내 전문의 진료를 권장드려요.',
    urinary: '내일까지는 병원에 가보세요.',
    digestive: '1~2일 내 병원 방문을 권장드려요.',
    general: '2~3일 내 병원에 가보시는 게 좋겠어요.',
  }

  if (urgency === 'caution') {
    const mainSys = systems[0] || 'general'
    return [
      '🟡 주의 관찰 필요',
      '',
      sysAdvice[mainSys] || sysAdvice.general!,
      '',
      '아래 증상이 나타나면 즉시 병원에 가세요:',
      '• 잇몸이 파랗게 변할 때',
      '• 경련이나 발작이 생길 때',
      '• 소변을 전혀 못 볼 때',
      '• 극도로 무기력해질 때',
    ].join('\n')
  }

  return [
    '🟢 집에서 관찰해보세요',
    '',
    `${name}의 증상이 지금 당장 응급한 상황은 아닌 것 같아요.`,
    '충분한 물과 안정을 취하게 해주시고 24~48시간 관찰해보세요.',
    '',
    '다음 증상이 나타나면 바로 병원에 가세요:',
    '• 증상이 갑자기 심해질 때',
    '• 밥, 물을 완전히 거부할 때',
    '• 기력이 급격히 떨어질 때',
  ].join('\n')
}

// ─── 행동학 분석 ─────────────────────────────────────────────

export type BehaviorType =
  | 'separation_anxiety'
  | 'aggression'
  | 'fear'
  | 'compulsive'
  | 'coprophagia'
  | 'marking'
  | 'hyperactivity'
  | 'general_behavior'

const BEHAVIOR_KW: Record<BehaviorType, string[]> = {
  separation_anxiety: ['분리불안', '혼자', '외출', '집을 망가', '문을 긁', '울어요', '짖어요', '짖고'],
  aggression: ['물어요', '물었어', '으르렁', '공격', '달려들', '사납게'],
  fear: ['숨어요', '숨어서', '떨어요', '무서워', '불안해', '겁을', '두려워'],
  compulsive: ['꼬리를 쫓', '빙빙 돌', '계속 핥', '발을 핥', '강박', '반복적'],
  coprophagia: ['배변을 먹', '똥을 먹', '식분증', '이물질을 먹'],
  marking: ['마킹', '여기저기 오줌', '집안에서 오줌', '실내 배변', '소변 실수'],
  hyperactivity: ['너무 활발', '에너지가 넘', '산만', '가만히 못', '과잉행동'],
  general_behavior: [],
}

export function detectBehaviorType(text: string): BehaviorType {
  for (const [type, keywords] of Object.entries(BEHAVIOR_KW)) {
    if (type === 'general_behavior') continue
    if (keywords.some(kw => text.includes(kw))) return type as BehaviorType
  }
  return 'general_behavior'
}

export function getBehaviorTypeName(type: BehaviorType): string {
  const names: Record<BehaviorType, string> = {
    separation_anxiety: '분리불안',
    aggression: '공격 행동',
    fear: '두려움/공포',
    compulsive: '강박 행동',
    coprophagia: '이식증(배변 섭취)',
    marking: '실내 마킹',
    hyperactivity: '과잉 행동',
    general_behavior: '행동 변화',
  }
  return names[type]
}

const BEHAVIOR_QUESTION_BANKS: Record<BehaviorType, Question[]> = {
  separation_anxiety: [
    {
      id: 'sa_symptom', system: 'general',
      text: '외출할 때 주로 어떤 행동을 하나요?',
      options: ['계속 짖거나 울어요', '물건을 물어뜯어요', '배변 실수를 해요', '문이나 벽을 긁어요'],
    },
    {
      id: 'sa_duration', system: 'general',
      text: '하루에 혼자 있는 시간이 얼마나 되나요?',
      options: ['1시간 이하', '1~4시간', '4~8시간', '8시간 이상'],
    },
    {
      id: 'sa_onset', system: 'general',
      text: '이 행동이 언제부터 시작됐나요?',
      options: ['어릴 때부터', '환경이 바뀐 후 (이사, 가족 변화)', '최근 갑자기 시작됐어요', '오래됐어요'],
    },
  ],
  aggression: [
    {
      id: 'agg_trigger', system: 'general',
      text: '공격 행동이 주로 언제 나타나나요?',
      options: ['낯선 사람/동물에게', '밥이나 장난감 관련해서', '만지거나 쓰다듬을 때', '이유 없이 갑자기'],
    },
    {
      id: 'agg_signal', system: 'general',
      text: '공격 전에 어떤 신호가 있나요?',
      options: ['으르렁거려요', '꼬리를 낮게 내려요', '귀를 뒤로 젖혀요', '아무 신호 없이 갑자기'],
    },
    {
      id: 'agg_change', system: 'general',
      text: '최근 생활에 달라진 점이 있나요?',
      options: ['없어요', '새 가족이나 동물이 생겼어요', '이사했어요', '건강 문제가 있었어요'],
    },
  ],
  fear: [
    {
      id: 'fear_trigger', system: 'general',
      text: '주로 언제 두려움을 보이나요?',
      options: ['큰 소리 날 때 (천둥, 폭죽)', '낯선 사람/환경에서', '다른 동물을 볼 때', '특별한 이유 없이'],
    },
    {
      id: 'fear_expr', system: 'general',
      text: '두려움을 어떻게 표현하나요?',
      options: ['숨어요', '계속 떨어요', '오줌/대변 실수를 해요', '공격적으로 변해요'],
    },
    {
      id: 'fear_onset', system: 'general',
      text: '이 행동이 언제부터 시작됐나요?',
      options: ['어릴 때부터', '특정 사건 이후 (사고, 학대 등)', '최근 시작됐어요', '오래됐지만 심해졌어요'],
    },
  ],
  compulsive: [
    {
      id: 'comp_when', system: 'general',
      text: '반복 행동이 언제 주로 나타나나요?',
      options: ['심심하거나 혼자 있을 때', '스트레스받을 때', '거의 항상', '특정 상황에서'],
    },
    {
      id: 'comp_freq', system: 'general',
      text: '하루에 얼마나 자주 반복하나요?',
      options: ['가끔 (하루 1~2번)', '자주 (수시로)', '거의 멈추지 않아요', '점점 심해지고 있어요'],
    },
  ],
  coprophagia: [
    {
      id: 'cop_when', system: 'general',
      text: '언제 이런 행동을 하나요?',
      options: ['자신의 배변 직후', '다른 동물의 배변', '산책 중 발견할 때', '상황 구분 없이'],
    },
    {
      id: 'cop_diet', system: 'general',
      text: '평소 식이 습관은 어떤가요?',
      options: ['정상적으로 잘 먹어요', '항상 배고파 보여요', '편식이 심해요', '특이 식이를 해요'],
    },
  ],
  marking: [
    {
      id: 'mark_where', system: 'general',
      text: '주로 어디에 소변을 보나요?',
      options: ['집 곳곳에 조금씩', '특정 장소에만', '새 물건이나 낯선 냄새에', '외출 후 돌아와서'],
    },
    {
      id: 'mark_neuter', system: 'general',
      text: '중성화 수술을 했나요?',
      options: ['네, 했어요', '아니요, 안 했어요', '모르겠어요'],
    },
  ],
  hyperactivity: [
    {
      id: 'hyper_exercise', system: 'general',
      text: '하루 운동량은 얼마나 되나요?',
      options: ['30분 미만', '30~60분', '1~2시간', '2시간 이상'],
    },
    {
      id: 'hyper_time', system: 'general',
      text: '언제 가장 활발한가요?',
      options: ['항상 비슷해요', '저녁/밤에 특히 심해요', '밥 먹은 직후', '산책 후에도 안 풀려요'],
    },
  ],
  general_behavior: [
    {
      id: 'behav_what', system: 'general',
      text: '가장 걱정되는 행동이 어떤 건가요?',
      options: ['갑자기 행동이 변했어요', '특정 행동을 계속 반복해요', '사람/동물에게 공격적이에요', '무기력하거나 우울해 보여요'],
    },
    {
      id: 'behav_duration', system: 'general',
      text: '이 행동이 얼마나 됐나요?',
      options: ['1주일 미만', '1개월 정도', '3개월 이상', '오래됐어요'],
    },
  ],
}

export function buildBehaviorQuestions(type: BehaviorType): Question[] {
  return BEHAVIOR_QUESTION_BANKS[type] ?? BEHAVIOR_QUESTION_BANKS.general_behavior
}

export function makeBehaviorResultMessage(type: BehaviorType, petName: string): string {
  const name = petName || '반려동물'
  const messages: Record<BehaviorType, string> = {
    separation_anxiety: [
      `💙 ${name}의 분리불안에 대해 분석했어요`,
      '',
      '【왜 이런 행동을 할까요?】',
      '분리불안은 혼자 남겨지는 것에 대한 극도의 불안 반응이에요. 보호자가 곁에 없을 때 공황 상태에 빠지는 것과 비슷해요. 인간과 오래 살아온 개에게 특히 흔하고, 이건 나쁜 행동이 아니라 "불안이라는 감정의 표현"이에요.',
      '',
      '【개선 방법】',
      '• 외출 전후 과도한 인사/관심 줄이기 (차분하게)',
      '• 짧은 외출부터 연습 → 점진적으로 늘리기',
      '• 혼자 있을 때 즐거운 것 연결 (특별한 간식, 장난감)',
      '• 코그 장난감이나 냄새 탐색 장난감으로 집중력 유도',
      '',
      '【전문가 도움이 필요한 경우】',
      '2~4주 후에도 개선이 없거나 심해지면 수의사 또는 반려동물 행동전문가 상담을 권장해요.',
    ].join('\n'),
    aggression: [
      `🔶 ${name}의 공격 행동에 대해 분석했어요`,
      '',
      '【왜 이런 행동을 할까요?】',
      '공격 행동은 대부분 두려움이나 불안에서 시작해요. "나를 건드리지 마"라는 경고 신호예요. 자원 지키기(밥, 장난감), 영역 보호, 통증, 또는 과거 안 좋은 경험이 원인일 수 있어요.',
      '',
      '【개선 방법】',
      '• 공격 유발 상황을 파악하고 미리 피하기',
      '• 으르렁거릴 때 벌주지 않기 (경고 신호를 억누르면 더 위험해요)',
      '• 긍정 강화 훈련으로 "낯선 것 = 좋은 것" 연결하기',
      '• 자원 지키기라면: 접근 시 간식으로 보상',
      '',
      '⚠️ 사람에게 상처를 입혔다면 반드시 전문 행동교정사 상담이 필요해요.',
    ].join('\n'),
    fear: [
      `💜 ${name}의 두려움/공포에 대해 분석했어요`,
      '',
      '【왜 이런 행동을 할까요?】',
      '숨거나 떠는 행동은 위협을 느낄 때 보이는 자연스러운 반응이에요. 어릴 때 사회화가 부족했거나, 트라우마가 있는 경우 더 심할 수 있어요. 강제로 꺼내거나 억지로 달래면 오히려 불안을 강화할 수 있어요.',
      '',
      '【개선 방법】',
      '• 무서워하는 자극에 강제 노출하지 않기',
      '• 숨을 수 있는 안전한 공간 만들어주기',
      '• 두려운 것 + 좋아하는 간식을 천천히 연결하기 (탈감작)',
      '• 천둥/폭죽 시: 백색 소음기나 불안방지 조끼 활용',
      '',
      '【전문가 도움이 필요한 경우】',
      '일상생활에 지장을 줄 정도의 극심한 공포라면 수의사와 상담하세요. 약물 치료와 행동 수정을 병행하면 효과적이에요.',
    ].join('\n'),
    compulsive: [
      `🔵 ${name}의 반복/강박 행동에 대해 분석했어요`,
      '',
      '【왜 이런 행동을 할까요?】',
      '강박 행동은 스트레스, 지루함, 또는 불안을 해소하려는 방식이에요. 처음에는 기분 전환으로 시작하다가 점점 패턴화될 수 있어요. 뇌의 보상 회로와 관련이 있어서 스스로 멈추기 어려워해요.',
      '',
      '【개선 방법】',
      '• 충분한 운동과 정신적 자극 늘리기',
      '• 행동이 시작될 때 다른 활동으로 전환하기',
      '• 스트레스 원인 찾아서 제거하기',
      '• 환경 풍부화 (새로운 냄새, 탐색 기회 제공)',
      '',
      '⚠️ 피부 손상이 생길 정도로 핥는다면 수의사 진료가 필요해요.',
    ].join('\n'),
    coprophagia: [
      `🟡 ${name}의 배변 섭취에 대해 분석했어요`,
      '',
      '【왜 이런 행동을 할까요?】',
      '배변을 먹는 행동(식분증)은 영양 결핍, 기생충, 소화 효소 부족, 또는 어릴 때 학습된 행동일 수 있어요. 지루함이나 관심 끌기 목적인 경우도 많아요.',
      '',
      '【개선 방법】',
      '• 배변 후 즉시 치워서 접근 차단하기',
      '• 영양제(소화효소, 비타민) 보충 고려',
      '• 파인애플, 호박씨 등 기피제 시도',
      '• 배변에 과도하게 반응하지 않기 (관심 강화 방지)',
      '',
      '【전문가 도움이 필요한 경우】',
      '수의사에게 기생충 검사 및 영양 평가를 받아보시길 권장해요.',
    ].join('\n'),
    marking: [
      `🟠 ${name}의 실내 마킹에 대해 분석했어요`,
      '',
      '【왜 이런 행동을 할까요?】',
      '마킹은 "여기는 내 영역"이라는 의사소통 방식이에요. 중성화 수술을 하지 않은 경우 호르몬의 영향으로 더 강하게 나타나요. 새로운 냄새나 동물, 스트레스 상황에서 더 자주 발생해요.',
      '',
      '【개선 방법】',
      '• 중성화 수술 고려 (가장 효과적인 방법)',
      '• 마킹 장소를 효소 세정제로 완전히 제거',
      '• 스트레스 원인 파악 및 해결',
      '• 마킹 직전 행동 패턴 파악해서 미리 주의 돌리기',
    ].join('\n'),
    hyperactivity: [
      `🟢 ${name}의 과잉 행동에 대해 분석했어요`,
      '',
      '【왜 이런 행동을 할까요?】',
      '대부분의 경우 에너지 발산이 부족해서예요. 특히 활동량이 많은 견종(보더콜리, 허스키, 래브라도 등)은 충분한 운동 없이는 실내에서 과잉 행동을 보여요. 어린 나이일수록 더 활발한 것은 정상이에요.',
      '',
      '【개선 방법】',
      '• 하루 운동량 늘리기 (견종에 맞게 1~2시간 이상)',
      '• 정신적 자극 추가: 코 훈련, 노즈워크, 복종 훈련',
      '• 에너지가 넘칠 때 훈련 시간으로 활용하기',
      '• 규칙적인 생활 패턴 만들기',
      '',
      '정상 범위의 활발함인지, 진짜 과잉행동 장애인지는 수의사와 확인해 보세요.',
    ].join('\n'),
    general_behavior: [
      `🐾 ${name}의 행동에 대해 분석했어요`,
      '',
      '【행동 변화의 가장 흔한 원인】',
      '• 신체적 통증이나 불편함 (숨겨진 증상)',
      '• 환경 변화 (이사, 새 가족/동물)',
      '• 스트레스 또는 지루함',
      '• 노화에 따른 인지 변화',
      '',
      '【먼저 확인해보세요】',
      '행동 변화가 갑자기 시작됐다면 먼저 신체 증상이 없는지 확인이 중요해요. 통증이 있는 동물은 행동으로 표현하거든요.',
      '',
      '구체적인 행동을 더 설명해주시면 아래 입력창에서 계속 질문하실 수 있어요!',
    ].join('\n'),
  }
  return messages[type]
}

// 결과 후 추가 질문 답변 (키워드 기반)
export function answerFollowUp(text: string): string {
  if (/타이레놀|아스피린|이부프로펜|인간\s*약|사람\s*약|진통제/.test(text)) {
    return [
      '⚠️ 절대 사람용 약을 주지 마세요!',
      '',
      '타이레놀(아세트아미노펜), 아스피린, 이부프로펜은 반려동물에게 심각한 독성을 일으켜요. 특히 고양이에게는 소량으로도 치명적이에요.',
      '통증이 의심되면 반드시 수의사에게 처방받은 동물용 약만 사용하세요.',
    ].join('\n')
  }

  if (/먹여도|먹어도|줘도\s*(되|될)|음식|간식|과일|채소|뭘\s*먹/.test(text)) {
    return [
      '🍎 반려동물에게 안전한 음식 안내',
      '',
      '✅ 주어도 되는 것:',
      '• 삶은 닭가슴살, 소고기 (무염)',
      '• 당근, 브로콜리, 오이',
      '• 블루베리, 수박 (씨 제거)',
      '',
      '❌ 절대 주면 안 되는 것:',
      '• 포도, 건포도 (신부전 위험)',
      '• 양파, 마늘, 대파',
      '• 초콜릿, 자일리톨 (껌, 사탕)',
      '• 아보카도, 마카다미아',
      '• 카페인, 알코올',
    ].join('\n')
  }

  if (/집에서|가정에서|관리|케어|어떻게\s*해|돌봐/.test(text)) {
    return [
      '🏠 집에서 할 수 있는 관리법',
      '',
      '• 신선한 물을 항상 제공해주세요',
      '• 따뜻하고 조용한 안정 공간 확보',
      '• 격렬한 운동이나 스트레스 최소화',
      '• 식욕·배변·활기 상태를 매일 메모하기',
      '',
      '아래 증상이 생기면 즉시 병원에 가세요:',
      '• 잇몸이 파랗게 변할 때',
      '• 숨을 가파르게 쉴 때',
      '• 아무것도 먹거나 마시지 않을 때',
    ].join('\n')
  }

  if (/병원에\s*(언제|갈|가야)|언제\s*병원|병원\s*기준/.test(text)) {
    return [
      '🏥 병원에 가야 할 기준',
      '',
      '🚨 지금 당장 (응급):',
      '• 호흡 곤란, 잇몸이 파랗게 변함',
      '• 경련 또는 의식 잃음',
      '• 소변을 12시간 이상 못 봄',
      '',
      '⚡ 당일 방문:',
      '• 밥/물을 12시간 이상 완전히 거부',
      '• 구토/설사 6회 이상',
      '• 갑작스러운 심한 통증 징후',
      '',
      '📅 2~3일 내 방문:',
      '• 간헐적 구토/설사',
      '• 식욕이 줄었지만 조금은 먹음',
      '• 활기가 약간 줄어든 상태',
    ].join('\n')
  }

  if (/전염|옮|다른\s*(동물|개|고양이)/.test(text)) {
    return [
      '🦠 전염성 여부',
      '',
      '대부분의 내부 질환(소화기, 비뇨기 문제 등)은 다른 동물이나 사람에게 전염되지 않아요.',
      '',
      '⚠️ 주의가 필요한 경우:',
      '• 켄넬코프 (개→개 전염)',
      '• 범백혈구감소증 (고양이→고양이)',
      '• 외부 기생충 (벼룩, 진드기)',
      '• 피부 진균증 (사람에게도 전염 가능)',
      '',
      '전염이 걱정된다면 다른 반려동물과 격리하고 수의사에게 확인하세요.',
    ].join('\n')
  }

  if (/예방|건강\s*관리|백신|구충/.test(text)) {
    return [
      '💉 기본 건강 관리 체크리스트',
      '',
      '✅ 정기 예방접종:',
      '• 강아지: DHPPL, 켄넬코프, 광견병 (연 1~2회)',
      '• 고양이: FVRCP, 광견병',
      '',
      '✅ 구충제:',
      '• 내부 기생충: 3~6개월마다',
      '• 외부 기생충 + 심장사상충: 매달',
      '',
      '✅ 정기 검진:',
      '• 1~7세: 연 1회',
      '• 7세 이상: 연 2회 권장',
    ].join('\n')
  }

  if (/훈련|교육|가르치|버릇|습관/.test(text)) {
    return [
      '🎓 반려동물 훈련의 기본 원칙',
      '',
      '• 긍정 강화: 잘한 행동에 즉시 보상 (간식, 칭찬)',
      '• 일관성: 온 가족이 같은 규칙을 적용하기',
      '• 짧게 자주: 한 번에 5~10분, 하루 2~3회가 효과적',
      '• 타이밍: 행동 직후 0.5~1초 안에 보상해야 효과 있어요',
      '',
      '체벌은 신뢰를 깨고 공격성이나 두려움을 유발할 수 있어서 권장하지 않아요.',
    ].join('\n')
  }

  return [
    '더 구체적으로 알려주시면 도움을 드릴게요! 😊',
    '',
    '이런 질문을 하실 수 있어요:',
    '• "집에서 어떻게 관리하면 될까요?"',
    '• "언제 병원에 가야 하나요?"',
    '• "먹여도 되는 음식이 뭔가요?"',
    '• "전염될 수 있나요?"',
    '• "훈련은 어떻게 시키나요?"',
  ].join('\n')
}
