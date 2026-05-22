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
