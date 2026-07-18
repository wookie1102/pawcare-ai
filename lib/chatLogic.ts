import type { PetProfile } from './storage'

export type QuestionSystem = 'respiratory' | 'neurological' | 'urinary' | 'digestive' | 'skin' | 'eye' | 'ear' | 'orthopedic' | 'dental' | 'lump' | 'endocrine' | 'general'
export type UrgencyLevel = 'watch' | 'caution' | 'emergency'

export type Question = {
  id: string
  system: QuestionSystem
  text: string
  options: string[]
  emergencyTriggers?: string[]   // 즉시 종료 (생사 응급만)
  urgencySignals?: string[]      // 심각도 기록 후 질문 계속 진행
  cautionSignals?: string[]      // 주의 수준 기록
}

const RESPIRATORY_KW = ['기침', '호흡', '숨', '헐떡', '코피', '재채기', '청색', '파란', '쌕쌕', '캑캑', '그르렁']
const NEUROLOGICAL_KW = ['경련', '발작', '비틀', '떨림', '의식', '쓰러', '마비', '눈이 돌아', '고개 기울']
const URINARY_KW = ['소변', '오줌', '혈뇨', '배뇨', '화장실을 못', '소변을 못']
const DIGESTIVE_KW = ['구토', '설사', '식욕', '밥을 안', '먹지 않', '토', '혈변', '복부']
const SKIN_KW = ['긁어', '긁고', '긁는', '긁음', '가려워', '가렵', '핥아', '핥고', '핥는', '털이 빠', '탈모', '발진', '피부', '두드러기', '비듬', '각질', '발바닥을 핥', '피부가 붉']
const EYE_KW = ['눈곱', '충혈', '눈을 비', '눈물이', '눈이 뿌', '백내장', '눈이 흐', '눈이 부어', '눈 분비물']
const EAR_KW = ['귀를 긁', '귀 긁', '귀에서', '외이염', '귀 냄새', '머리를 흔', '귀 분비물', '귀 안에', '귀가', '귀를 만져', '귀 쪽']
const ORTHOPEDIC_KW = ['절뚝', '다리를 절', '절름', '계단을 못', '앉았다 일어', '관절', '슬개골', '다리가 아', '걸음걸이', '다리를 들', '다리를 못', '다리가 이상', '뒷다리', '앞다리']
const DENTAL_KW = ['입냄새', '구취', '이빨', '잇몸이 부어', '잇몸 염증', '잇몸에서 피', '잇몸이 빨갛', '잇몸이 아파', '치석', '이를 못', '씹기', '치아', '이가 흔들', '입 안', '이빨이', '입에서 냄새']
const LUMP_KW = ['혹', '덩어리', '멍울', '종양', '부어올', '혹이', '만져져', '유선', '멍이', '혹을 발견', '뭔가 만져', '혹 같은', '자궁축농증', '비장', '음부에서 고름', '배가 딱딱하게']
const ENDOCRINE_KW = ['물을 많이', '물을 엄청', '다음증', '소변이 많', '체중이 줄', '살이 빠', '배가 볼록', '복부가 팽', '쿠싱', '당뇨', '갑상선', '물을 너무', '살이 너무 빠']

const EMERGENCY_KW = [
  '파랗', '청색', '보라색', '숨을 못', '경련', '발작', '의식 없', '쓰러', '소변을 전혀',
  '피가 많이', '다리가 마비', '뒷다리가 마비', '뒷다리를 못 써', '뒷다리를 전혀',
  '눈이 뒤로', '움직이지 못', '눈이 돌출', '다리를 전혀 못', '갑자기 못 걸어',
  '혹이 터졌', '눈이 빠져',
]

// detectEmergency는 첫 증상 설명 문장만 보고 질문 없이 곧장 응급으로 보내는
// 유일한 경로라, 부정문("파랗지는 않아요")이나 "이미 지나간 일" 표현
// ("쓰러질 뻔했는데 지금은 괜찮아요")까지 그대로 매칭되면 위험 신호가 없다고
// 안심시키려 쓴 문장에도 응급 배너가 떠 버린다. 키워드 주변의 부정/해소 표현을
// 함께 확인해서 이런 오탐을 걸러낸다.
const NEGATION_NEAR_KEYWORD = /지\s*않|진\s*않|지는\s*않|은\s*아니|는\s*아니|이\s*아니|가\s*아니|건\s*아니|게\s*아니|지\s*마|은\s*없|는\s*없|도\s*없|뻔했|뻔함|은\s*안\s|는\s*안\s/
const CURRENTLY_RESOLVED = /지금은?\s*(괜찮|멀쩡|정상)/

function isNegatedMatch(text: string, index: number, kwLen: number): boolean {
  const after = text.slice(index + kwLen, index + kwLen + 12)
  const before = text.slice(Math.max(0, index - 6), index)
  return NEGATION_NEAR_KEYWORD.test(after) || /안\s*$/.test(before)
}

function includesLiveKeyword(text: string, kw: string): boolean {
  let from = 0
  while (true) {
    const idx = text.indexOf(kw, from)
    if (idx === -1) return false
    if (!isNegatedMatch(text, idx, kw.length)) return true
    from = idx + kw.length
  }
}

export function detectEmergency(text: string): boolean {
  if (CURRENTLY_RESOLVED.test(text)) return false
  return EMERGENCY_KW.some(kw => includesLiveKeyword(text, kw))
}

export function detectSystems(text: string): QuestionSystem[] {
  const systems: QuestionSystem[] = []
  if (RESPIRATORY_KW.some(kw => text.includes(kw))) systems.push('respiratory')
  if (NEUROLOGICAL_KW.some(kw => text.includes(kw))) systems.push('neurological')
  if (URINARY_KW.some(kw => text.includes(kw))) systems.push('urinary')
  if (DIGESTIVE_KW.some(kw => text.includes(kw))) systems.push('digestive')
  if (SKIN_KW.some(kw => text.includes(kw))) systems.push('skin')
  if (EYE_KW.some(kw => text.includes(kw))) systems.push('eye')
  if (EAR_KW.some(kw => text.includes(kw))) systems.push('ear')
  if (ORTHOPEDIC_KW.some(kw => text.includes(kw))) systems.push('orthopedic')
  if (DENTAL_KW.some(kw => text.includes(kw))) systems.push('dental')
  if (LUMP_KW.some(kw => text.includes(kw))) systems.push('lump')
  if (ENDOCRINE_KW.some(kw => text.includes(kw))) systems.push('endocrine')
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
      urgencySignals: ['창백하거나 흰색이에요'],
    },
    {
      id: 'resp_effort',
      system: 'respiratory',
      text: '지금 호흡 상태가 어떤가요?',
      options: ['조금 빠른 편이에요', '많이 헐떡거려요', '배까지 움직이며 숨 쉬어요', '입으로 숨 쉬어요'],
      urgencySignals: ['배까지 움직이며 숨 쉬어요', '입으로 숨 쉬어요'],
    },
    {
      id: 'resp_sleep_rate',
      system: 'respiratory',
      text: '잠자는 동안 1분간 숨 쉬는 횟수를 세어보셨나요? (정상: 분당 30회 이하)',
      options: ['30회 이하예요 (정상)', '30~40회 정도예요', '40회 이상이에요', '아직 세어보지 않았어요'],
      urgencySignals: ['40회 이상이에요'],
    },
    {
      id: 'resp_cough_type',
      system: 'respiratory',
      text: '기침이 어떤 형태인가요?',
      options: ['마른 기침이에요', '가래가 끓는 듯한 기침이에요', '기침 후 구토해요', '기침은 없고 호흡만 이상해요'],
      urgencySignals: ['가래가 끓는 듯한 기침이에요'],
    },
    {
      id: 'resp_when',
      system: 'respiratory',
      text: '호흡 증상이 언제 더 심해지나요?',
      options: ['밤이나 새벽에 심해요', '운동 후에 심해요', '항상 비슷해요', '자다가 갑자기 깨요'],
      urgencySignals: ['자다가 갑자기 깨요', '밤이나 새벽에 심해요'],
    },
    {
      id: 'resp_heart_hx',
      system: 'respiratory',
      text: '심장병 진단을 받은 적 있나요?',
      options: ['네, 심장약 복용 중이에요', '심장병은 있는데 약은 없어요', '없어요', '모르겠어요'],
      urgencySignals: ['심장병은 있는데 약은 없어요'],
    },
    {
      id: 'resp_duration',
      system: 'respiratory',
      text: '이 증상이 얼마나 됐나요?',
      options: ['오늘 갑자기 시작됐어요', '2~3일 됐어요', '1~2주 됐어요', '1개월 이상이에요'],
    },
    {
      id: 'resp_nasal',
      system: 'respiratory',
      text: '코 분비물이나 재채기가 있나요?',
      options: ['맑은 콧물이 나요', '노랗거나 탁한 콧물이에요', '코피가 났어요', '없어요'],
      urgencySignals: ['코피가 났어요', '노랗거나 탁한 콧물이에요'],
    },
    {
      id: 'resp_sound',
      system: 'respiratory',
      text: '호흡할 때 소리가 나나요?',
      options: ['그르렁거리는 소리가 나요', '쌕쌕거리는 소리가 나요', '깊고 힘든 소리예요', '소리는 없어요'],
      urgencySignals: ['그르렁거리는 소리가 나요'],
    },
    {
      id: 'resp_activity',
      system: 'respiratory',
      text: '최근 운동이나 산책량이 줄었나요?',
      options: ['많이 줄었어요 (쉽게 지쳐요)', '조금 줄었어요', '비슷해요', '원래 운동을 안 해요'],
      urgencySignals: ['많이 줄었어요 (쉽게 지쳐요)'],
    },
    {
      id: 'resp_diuretic',
      system: 'respiratory',
      text: '이뇨제(라식스 등)를 복용 중인가요?',
      options: ['네, 복용 중이에요', '최근 중단했어요', '복용한 적 없어요', '모르겠어요'],
      urgencySignals: ['최근 중단했어요'],
    },
    {
      id: 'resp_ascites',
      system: 'respiratory',
      text: '배가 부풀어 오르거나 복수가 찬 적이 있나요?',
      options: ['지금 배가 불러요', '이전에 복수 빼는 처치를 받은 적 있어요', '없어요', '모르겠어요'],
      urgencySignals: ['지금 배가 불러요', '이전에 복수 빼는 처치를 받은 적 있어요'],
    },
    {
      id: 'resp_appetite',
      system: 'respiratory',
      text: '식욕은 어떤가요?',
      options: ['잘 먹어요', '평소보다 줄었어요', '거의 안 먹어요', '전혀 안 먹어요'],
      urgencySignals: ['거의 안 먹어요', '전혀 안 먹어요'],
    },
    {
      id: 'resp_contact',
      system: 'respiratory',
      text: '최근 다른 동물과 접촉한 적 있나요? (전염 가능성 확인)',
      options: ['최근 접촉 있어요', '없어요', '애견 카페·호텔 이용했어요', '모르겠어요'],
    },
  ],
  neurological: [
    {
      id: 'neuro_type',
      system: 'neurological',
      text: '어떤 증상이 나타났나요?',
      options: ['전신 경련·발작이에요', '한쪽으로 기울거나 빙빙 돌아요', '비틀거리거나 걷기 어려워요', '의식을 잃었어요'],
      emergencyTriggers: ['의식을 잃었어요'],
      urgencySignals: ['전신 경련·발작이에요'],
    },
    {
      id: 'neuro_now',
      system: 'neurological',
      text: '지금 이 순간 증상이 진행 중인가요?',
      options: ['지금도 발작 중이에요', '방금 끝났어요 (10분 이내)', '멈췄어요 (30분 이상 됐어요)', '완전히 정상으로 돌아왔어요'],
      emergencyTriggers: ['지금도 발작 중이에요'],
      urgencySignals: ['방금 끝났어요 (10분 이내)'],
    },
    {
      id: 'neuro_duration',
      system: 'neurological',
      text: '증상이 얼마나 지속됐나요?',
      options: ['5분 미만이에요', '5~30분이에요', '30분 이상이에요', '계속 반복돼요'],
      urgencySignals: ['5~30분이에요', '30분 이상이에요', '계속 반복돼요'],
    },
    {
      id: 'neuro_after',
      system: 'neurological',
      text: '증상 직후 상태는 어떤가요?',
      options: ['바로 정상으로 돌아왔어요', '멍하거나 비틀거려요 (수분 내)', '몇 시간째 이상해요', '아직 회복 못 했어요'],
      urgencySignals: ['아직 회복 못 했어요', '몇 시간째 이상해요'],
    },
    {
      id: 'neuro_first',
      system: 'neurological',
      text: '이런 증상이 처음인가요?',
      options: ['처음이에요', '이전에도 있었어요 (6개월 이상 전)', '최근 반복되고 있어요 (월 1회 이상)', '점점 잦아지고 있어요'],
      urgencySignals: ['점점 잦아지고 있어요', '최근 반복되고 있어요 (월 1회 이상)'],
    },
    {
      id: 'neuro_head_tilt',
      system: 'neurological',
      text: '머리가 한쪽으로 기울어져 있나요?',
      options: ['네, 한쪽으로 기울어져 있어요', '눈이 흔들려요 (안진)', '둘 다 있어요', '없어요'],
      urgencySignals: ['둘 다 있어요', '눈이 흔들려요 (안진)'],
    },
    {
      id: 'neuro_walk',
      system: 'neurological',
      text: '걸을 수 있나요?',
      options: ['전혀 못 걸어요', '비틀거리지만 걸어요', '한쪽 다리를 질질 끌어요', '거의 정상이에요'],
      urgencySignals: ['전혀 못 걸어요'],
    },
    {
      id: 'neuro_neck',
      system: 'neurological',
      text: '목이 아파 보이거나 고개를 숙이나요?',
      options: ['목을 움직이기 싫어해요', '고개를 완전히 못 들어요', '만지면 아파해요', '괜찮아 보여요'],
      urgencySignals: ['고개를 완전히 못 들어요'],
    },
    {
      id: 'neuro_epilepsy_hx',
      system: 'neurological',
      text: '뇌전증(간질) 진단을 받은 적 있나요?',
      options: ['네, 항경련제 복용 중이에요', '진단받았지만 약은 없어요', '진단받은 적 없어요', '모르겠어요'],
      urgencySignals: ['진단받았지만 약은 없어요'],
    },
    {
      id: 'neuro_med_change',
      system: 'neurological',
      text: '최근 약을 바꾸거나 빠뜨린 적 있나요?',
      options: ['약을 며칠 건너뜀', '용량이 바뀌었어요', '새 약이 추가됐어요', '변화 없어요'],
      urgencySignals: ['약을 며칠 건너뜀'],
    },
    {
      id: 'neuro_pain_response',
      system: 'neurological',
      text: '발바닥을 꼬집으면 반응하나요? (통증 반응 확인)',
      options: ['반응해요 (발을 빼요)', '약하게 반응해요', '반응이 없어요', '확인 못 했어요'],
      urgencySignals: ['약하게 반응해요', '반응이 없어요'],
    },
    {
      id: 'neuro_video',
      system: 'neurological',
      text: '발작·경련 영상을 촬영하셨나요?',
      options: ['촬영했어요', '촬영 못 했어요', '이미 끝났어요', '모르겠어요'],
    },
    {
      id: 'neuro_trigger',
      system: 'neurological',
      text: '발작 전 특이한 행동(조짐)이 있었나요?',
      options: ['갑자기 멍하니 있었어요', '침을 흘리거나 입 주변을 씹었어요', '특이한 행동 없었어요', '보지 못했어요'],
    },
  ],
  urinary: [
    {
      id: 'uri_output',
      system: 'urinary',
      text: '소변을 어떻게 보고 있나요?',
      options: ['소변을 아예 못 봐요', '찔끔씩 자주 시도해요', '소변에 피가 섞여요', '소변량이 많이 줄었어요'],
      emergencyTriggers: ['소변을 아예 못 봐요'],
      urgencySignals: ['찔끔씩 자주 시도해요'],
    },
    {
      id: 'uri_last_time',
      system: 'urinary',
      text: '마지막으로 소변 본 게 언제예요?',
      options: ['12시간 이상 됐어요', '6~12시간 됐어요', '몇 시간 이내예요', '모르겠어요'],
      urgencySignals: ['12시간 이상 됐어요'],
    },
    {
      id: 'uri_color',
      system: 'urinary',
      text: '소변 색깔이 어떤가요?',
      options: ['노란색 (정상)', '빨갛거나 분홍색이에요', '갈색이나 진한 색이에요', '확인 못 했어요'],
      urgencySignals: ['빨갛거나 분홍색이에요', '갈색이나 진한 색이에요'],
    },
    {
      id: 'uri_pain',
      system: 'urinary',
      text: '소변 볼 때 통증 신호가 있나요?',
      options: ['울거나 끙끙거려요', '자세가 이상해 보여요', '배를 핥아요', '특별한 신호 없어요'],
      urgencySignals: ['울거나 끙끙거려요'],
    },
    {
      id: 'uri_freq',
      system: 'urinary',
      text: '소변 횟수가 어떻게 달라졌나요?',
      options: ['평소보다 훨씬 자주 봐요', '평소와 비슷해요', '평소보다 훨씬 줄었어요', '거의 못 보고 있어요'],
      urgencySignals: ['거의 못 보고 있어요', '평소보다 훨씬 줄었어요'],
    },
    {
      id: 'uri_drink',
      system: 'urinary',
      text: '물은 평소보다 많이 마시나요?',
      options: ['평소보다 훨씬 많이 마셔요', '비슷하게 마셔요', '오히려 적게 마셔요', '잘 모르겠어요'],
      urgencySignals: ['오히려 적게 마셔요'],
    },
    {
      id: 'uri_kidney_hx',
      system: 'urinary',
      text: '신장(콩팥) 관련 진단을 받은 적 있나요?',
      options: ['신부전 진단받고 관리 중이에요', '혈액검사에서 수치 이상이 나온 적 있어요', '없어요', '모르겠어요'],
      urgencySignals: ['신부전 진단받고 관리 중이에요'],
    },
    {
      id: 'uri_sub_fluid',
      system: 'urinary',
      text: '피하수액을 맞고 있나요?',
      options: ['병원에서 맞고 있어요', '집에서 직접 놔요', '예전에 맞았지만 지금은 안 해요', '맞은 적 없어요'],
    },
    {
      id: 'uri_phosphorus',
      system: 'urinary',
      text: '최근 혈액검사에서 인(P) 수치를 확인했나요?',
      options: ['인 수치가 높다고 했어요', '정상 범위라고 했어요', '검사 안 했어요', '모르겠어요'],
      urgencySignals: ['인 수치가 높다고 했어요'],
    },
    {
      id: 'uri_bp',
      system: 'urinary',
      text: '혈압 측정을 해보셨나요?',
      options: ['혈압이 높다고 했어요', '정상이라고 했어요', '측정 안 했어요', '모르겠어요'],
      urgencySignals: ['혈압이 높다고 했어요'],
    },
    {
      id: 'uri_vitality',
      system: 'urinary',
      text: '전체적인 기운이 어떤가요?',
      options: ['비교적 정상이에요', '무기력하고 처져요', '거의 움직이지 않아요', '구토나 식욕 저하도 있어요'],
      urgencySignals: ['거의 움직이지 않아요', '구토나 식욕 저하도 있어요'],
    },
    {
      id: 'uri_duration',
      system: 'urinary',
      text: '이 증상이 얼마나 됐나요?',
      options: ['오늘부터예요', '어제부터예요', '2~3일 됐어요', '1주일 이상이에요'],
    },
  ],
  digestive: [
    {
      id: 'dige_onset',
      system: 'digestive',
      text: '증상이 언제부터 시작됐나요?',
      options: ['오늘 갑자기 시작됐어요', '어제부터예요', '2~3일 됐어요', '1주일 이상이에요'],
    },
    {
      id: 'dige_freq',
      system: 'digestive',
      text: '구토나 설사를 얼마나 자주 하나요?',
      options: ['아직 안 했어요 (헛구역질만 해요)', '한 번만 했어요', '하루 1~2회', '하루 3~5회', '하루 6회 이상'],
      urgencySignals: ['하루 6회 이상', '하루 3~5회'],
    },
    {
      id: 'dige_vomit_timing',
      system: 'digestive',
      text: '구토가 언제 일어나나요? (구토가 없으면 마지막 선택)',
      options: ['밥 먹은 직후 바로 토해요', '밥 먹고 1시간 이상 지나서 토해요', '빈속에 토해요', '구토는 없어요'],
    },
    {
      id: 'dige_vomit_type',
      system: 'digestive',
      text: '구토물이 어떻게 생겼나요? (구토가 없으면 마지막 선택)',
      options: ['먹은 음식이 나와요', '노랗거나 거품 같아요 (담즙)', '흰 거품이나 침이에요', '구토는 없어요'],
    },
    {
      id: 'dige_blood',
      system: 'digestive',
      text: '구토물이나 대변에 피가 섞여 있나요?',
      options: ['둘 다 없어요', '구토에 피가 보여요', '대변에 피가 섞여요', '확인하기 어려워요'],
      urgencySignals: ['구토에 피가 보여요', '대변에 피가 섞여요'],
    },
    {
      id: 'dige_stool',
      system: 'digestive',
      text: '대변 상태는 어떤가요?',
      options: ['정상이에요', '묽거나 죽처럼 풀어져요', '물처럼 흘러요', '대변을 못 봤어요'],
      urgencySignals: ['물처럼 흘러요'],
    },
    {
      id: 'dige_stool_color',
      system: 'digestive',
      text: '대변 색깔이 어떤가요?',
      options: ['갈색 (정상)', '검은색이에요 (타르 같아요)', '선홍색 피가 섞여요', '노랗거나 회색이에요'],
      urgencySignals: ['검은색이에요 (타르 같아요)', '선홍색 피가 섞여요'],
    },
    {
      id: 'dige_eat',
      system: 'digestive',
      text: '밥과 물을 먹고 있나요?',
      options: ['잘 먹고 마셔요', '물만 조금 마셔요', '거의 안 먹어요', '아무것도 안 먹어요'],
      urgencySignals: ['아무것도 안 먹어요', '거의 안 먹어요'],
    },
    {
      id: 'dige_vitality',
      system: 'digestive',
      text: '지금 기운이 어떻게 보이나요?',
      options: ['비교적 정상이에요', '조금 처져 있어요', '많이 축 처지고 무기력해요', '쓰러지거나 일어나지 못해요'],
      emergencyTriggers: ['쓰러지거나 일어나지 못해요'],
      urgencySignals: ['많이 축 처지고 무기력해요'],
    },
    {
      id: 'dige_abdomen',
      system: 'digestive',
      text: '배를 살짝 눌러보면 어떻게 반응하나요?',
      options: ['아파하지 않아요', '약간 긴장하거나 피해요', '많이 아파해요', '배가 빵빵하게 부풀어 있어요'],
      urgencySignals: ['많이 아파해요', '배가 빵빵하게 부풀어 있어요'],
    },
    {
      id: 'dige_foreign',
      system: 'digestive',
      text: '이물질(장난감·뼈·비닐 등)을 삼켰을 가능성이 있나요?',
      options: ['삼킨 것 같아요', '모르겠어요', '없어요', '뭔가 이상한 걸 먹었어요'],
      urgencySignals: ['삼킨 것 같아요'],
    },
    {
      id: 'dige_fever',
      system: 'digestive',
      text: '몸이 평소보다 뜨겁게 느껴지나요?',
      options: ['체온이 정상이에요 (38~39℃)', '약간 따뜻한 것 같아요', '뜨겁게 느껴져요', '모르겠어요'],
      urgencySignals: ['뜨겁게 느껴져요'],
    },
    {
      id: 'dige_pancreas_hx',
      system: 'digestive',
      text: '췌장염 진단을 받은 적 있나요?',
      options: ['네, 있어요', '의심받은 적 있어요', '없어요', '모르겠어요'],
      urgencySignals: ['네, 있어요'],
    },
    {
      id: 'dige_weight',
      system: 'digestive',
      text: '최근 체중이 줄었나요?',
      options: ['많이 줄었어요 (1kg 이상)', '조금 줄었어요', '변화 없어요', '모르겠어요'],
      urgencySignals: ['많이 줄었어요 (1kg 이상)'],
    },
    {
      id: 'dige_cause',
      system: 'digestive',
      text: '최근에 바뀐 게 있었나요?',
      options: ['새로운 음식이나 간식을 줬어요', '스트레스 상황이 있었어요', '특별히 바뀐 건 없어요', '모르겠어요'],
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
      urgencySignals: ['거의 움직이지 않아요', '많이 축 처져요'],
    },
    {
      id: 'gen_eat',
      system: 'general',
      text: '밥과 물을 잘 먹고 있나요?',
      options: ['평소처럼 잘 먹어요', '조금 줄었어요', '거의 안 먹어요', '전혀 안 먹어요'],
      urgencySignals: ['전혀 안 먹어요', '거의 안 먹어요'],
    },
    {
      id: 'gen_weight',
      system: 'general',
      text: '최근 체중 변화가 있나요?',
      options: ['많이 빠졌어요', '조금 빠졌어요', '변화 없어요', '모르겠어요'],
      urgencySignals: ['많이 빠졌어요'],
    },
    {
      id: 'gen_fever',
      system: 'general',
      text: '체온을 재보셨나요? (정상: 38~39℃)',
      options: ['39.5℃ 이상이에요 (고열)', '38~39.5℃예요 (정상~약간 높음)', '38℃ 미만이에요 (저체온)', '재지 않았어요'],
      urgencySignals: ['39.5℃ 이상이에요 (고열)', '38℃ 미만이에요 (저체온)'],
    },
    {
      id: 'gen_medication',
      system: 'general',
      text: '현재 복용 중인 약이 있나요?',
      options: ['여러 가지 약을 먹고 있어요', '한 가지 약을 먹고 있어요', '없어요', '최근 새로운 약을 시작했어요'],
      urgencySignals: ['최근 새로운 약을 시작했어요'],
    },
    {
      id: 'gen_hospital_hx',
      system: 'general',
      text: '이 증상으로 병원을 가본 적 있나요?',
      options: ['이번 증상으로 아직 안 갔어요', '갔는데 진단이 안 나왔어요', '치료 중이에요', '이전에 같은 증상으로 간 적 있어요'],
    },
  ],
  skin: [
    {
      id: 'skin_where',
      system: 'skin',
      text: '주로 어디를 긁거나 핥나요?',
      options: ['얼굴·귀 주변', '배, 겨드랑이', '발바닥·발 사이', '등·꼬리 부근'],
    },
    {
      id: 'skin_multi',
      system: 'skin',
      text: '증상이 온몸에 퍼져 있나요, 특정 부위에만 있나요?',
      options: ['온몸에 퍼져 있어요', '여러 군데 있어요', '특정 부위에만 있어요', '계속 번지고 있어요'],
      urgencySignals: ['온몸에 퍼져 있어요', '계속 번지고 있어요'],
    },
    {
      id: 'skin_look',
      system: 'skin',
      text: '피부 상태가 어떻게 보이나요?',
      options: ['빨갛게 부어있어요', '털이 빠지거나 벗겨져요', '딱지나 상처가 생겼어요', '겉으로는 정상이에요'],
      urgencySignals: ['딱지나 상처가 생겼어요'],
    },
    {
      id: 'skin_secondary',
      system: 'skin',
      text: '2차 감염 징후가 있나요?',
      options: ['고름이나 진물이 나와요', '피부가 두꺼워지거나 색이 변했어요', '상처가 잘 낫지 않아요', '없어요'],
      urgencySignals: ['고름이나 진물이 나와요'],
    },
    {
      id: 'skin_onset',
      system: 'skin',
      text: '증상이 언제부터, 어떻게 시작됐나요?',
      options: ['갑자기 시작됐어요', '특정 계절에만 심해요', '오래됐는데 점점 심해져요', '새 간식·사료 바꾼 뒤 시작됐어요'],
      urgencySignals: ['오래됐는데 점점 심해져요'],
    },
    {
      id: 'skin_smell',
      system: 'skin',
      text: '피부나 털에서 냄새가 나나요?',
      options: ['퀴퀴하거나 기름진 냄새가 나요', '고름 냄새가 나요', '특별한 냄새 없어요', '잘 모르겠어요'],
      urgencySignals: ['고름 냄새가 나요'],
    },
    {
      id: 'skin_allergy_hx',
      system: 'skin',
      text: '알레르기나 아토피 진단을 받은 적 있나요?',
      options: ['알레르기 진단 있어요', '음식 알레르기가 있어요', '없어요', '의심은 되는데 진단은 못 받았어요'],
    },
    {
      id: 'skin_parasite',
      system: 'skin',
      text: '기생충 예방약(벼룩·진드기)을 정기적으로 사용 중인가요?',
      options: ['정기적으로 사용해요', '가끔 사용해요', '사용 안 해요', '최근 중단했어요'],
      urgencySignals: ['사용 안 해요', '최근 중단했어요'],
    },
    {
      id: 'skin_steroid',
      system: 'skin',
      text: '스테로이드나 면역억제제를 복용 중인가요?',
      options: ['스테로이드 복용 중이에요', '면역억제제 복용 중이에요', '없어요', '최근 중단했어요'],
    },
    {
      id: 'skin_scratch_freq',
      system: 'skin',
      text: '얼마나 자주 긁거나 핥나요?',
      options: ['하루 종일 거의 멈추지 않아요', '자주 긁어요 (하루 수십 번)', '가끔 긁어요', '수면 중에도 긁어요'],
      urgencySignals: ['하루 종일 거의 멈추지 않아요'],
    },
    {
      id: 'skin_treatment',
      system: 'skin',
      text: '이 증상으로 병원 치료를 받아본 적 있나요?',
      options: ['치료 중이에요', '치료했는데 재발했어요', '아직 안 갔어요', '자가 치료 중이에요'],
      urgencySignals: ['치료했는데 재발했어요'],
    },
  ],
  eye: [
    {
      id: 'eye_look',
      system: 'eye',
      text: '눈 상태가 어떻게 보이나요?',
      options: ['눈곱이 많이 껴요', '눈이 충혈됐어요', '눈이 뿌옇게 변했어요', '눈이 부어있거나 돌출됐어요'],
      urgencySignals: ['눈이 부어있거나 돌출됐어요'],
    },
    {
      id: 'eye_behave',
      system: 'eye',
      text: '눈을 어떻게 하나요?',
      options: ['계속 비벼요', '눈을 잘 못 떠요 (계속 감아요)', '눈물이 많이 나요', '평소와 비슷해요'],
      urgencySignals: ['눈을 잘 못 떠요 (계속 감아요)'],
    },
    {
      id: 'eye_discharge',
      system: 'eye',
      text: '눈 분비물이 있다면 어떤 색인가요?',
      options: ['맑거나 투명해요', '노랗거나 초록색이에요', '갈색이나 진해요', '없어요'],
      urgencySignals: ['노랗거나 초록색이에요'],
    },
    {
      id: 'eye_third',
      system: 'eye',
      text: '눈 안쪽에 하얀 막(제3안검)이 올라와 있나요?',
      options: ['네, 올라와 있어요', '조금 보여요', '없어요', '잘 모르겠어요'],
      urgencySignals: ['네, 올라와 있어요'],
    },
    {
      id: 'eye_vision',
      system: 'eye',
      text: '시력에 변화가 있나요?',
      options: ['물체에 자꾸 부딪혀요', '어두운 곳에서 못 봐요', '시력은 정상 같아요', '모르겠어요'],
      urgencySignals: ['물체에 자꾸 부딪혀요', '어두운 곳에서 못 봐요'],
    },
    {
      id: 'eye_cornea',
      system: 'eye',
      text: '각막(눈동자 표면)에 상처나 흰 점이 보이나요?',
      options: ['흰 점이나 혼탁이 보여요', '상처 같은 게 보여요', '없어요', '잘 모르겠어요'],
      urgencySignals: ['상처 같은 게 보여요'],
    },
    {
      id: 'eye_pain',
      system: 'eye',
      text: '눈 주변을 만지면 아파하나요?',
      options: ['많이 아파해요 (피해요)', '약간 싫어해요', '괜찮아해요', '확인 못 했어요'],
      urgencySignals: ['많이 아파해요 (피해요)'],
    },
    {
      id: 'eye_both',
      system: 'eye',
      text: '한쪽 눈만 이상한가요, 양쪽 다 이상한가요?',
      options: ['양쪽 다 이상해요', '한쪽만 이상해요', '한쪽이 더 심해요', '모르겠어요'],
    },
    {
      id: 'eye_trauma',
      system: 'eye',
      text: '눈에 외상을 입었을 가능성이 있나요?',
      options: ['긁히거나 다쳤어요', '다른 동물과 싸웠어요', '없어요', '모르겠어요'],
      urgencySignals: ['긁히거나 다쳤어요'],
    },
    {
      id: 'eye_bp',
      system: 'eye',
      text: '고혈압 진단을 받은 적 있나요? (노령 동물의 시력 저하 원인)',
      options: ['네, 혈압이 높아요', '측정한 적 없어요', '정상이에요', '모르겠어요'],
      urgencySignals: ['네, 혈압이 높아요'],
    },
    {
      id: 'eye_onset',
      system: 'eye',
      text: '언제부터 증상이 생겼나요?',
      options: ['오늘 갑자기', '2~3일 됐어요', '1주일 이상', '오래됐는데 점점 심해져요'],
    },
  ],
  ear: [
    {
      id: 'ear_symptom',
      system: 'ear',
      text: '귀 관련 증상이 어떤가요?',
      options: ['귀를 계속 긁어요', '머리를 자꾸 흔들어요', '귀에서 냄새가 나요', '귀 안에 분비물이 있어요'],
    },
    {
      id: 'ear_inside',
      system: 'ear',
      text: '귀 안을 들여다보면 어떻게 보이나요?',
      options: ['까맣거나 갈색 분비물', '노랗거나 고름 같은 분비물', '붉게 부어있어요', '잘 안 보여요'],
      urgencySignals: ['노랗거나 고름 같은 분비물', '붉게 부어있어요'],
    },
    {
      id: 'ear_smell',
      system: 'ear',
      text: '귀에서 냄새가 나나요?',
      options: ['심한 악취가 나요', '약간 냄새가 나요', '없어요', '모르겠어요'],
      urgencySignals: ['심한 악취가 나요'],
    },
    {
      id: 'ear_pain',
      system: 'ear',
      text: '귀 쪽을 만지면 아파하나요?',
      options: ['많이 아파해요 (피해요)', '약간 싫어해요', '괜찮아해요', '확인 못 했어요'],
      urgencySignals: ['많이 아파해요 (피해요)'],
    },
    {
      id: 'ear_head_tilt',
      system: 'ear',
      text: '머리가 한쪽으로 기울어져 있나요?',
      options: ['네, 한쪽으로 기울어져 있어요', '눈이 흔들려요', '둘 다 있어요', '없어요'],
      urgencySignals: ['네, 한쪽으로 기울어져 있어요', '둘 다 있어요'],
    },
    {
      id: 'ear_both',
      system: 'ear',
      text: '양쪽 귀 다 증상이 있나요?',
      options: ['양쪽 다 이상해요', '한쪽만 이상해요', '한쪽이 더 심해요', '모르겠어요'],
    },
    {
      id: 'ear_recurrence',
      system: 'ear',
      text: '귀 문제가 자주 반복되나요?',
      options: ['처음이에요', '1~2달에 한 번 재발해요', '자주 재발해요 (월 1회 이상)', '항상 달고 살아요'],
      urgencySignals: ['항상 달고 살아요'],
    },
    {
      id: 'ear_allergy',
      system: 'ear',
      text: '알레르기나 피부 문제가 함께 있나요?',
      options: ['알레르기가 있어요', '피부 가려움이 자주 있어요', '없어요', '모르겠어요'],
    },
    {
      id: 'ear_hematoma',
      system: 'ear',
      text: '귓바퀴(귀 겉면)가 부풀어 있거나 물렁물렁한가요?',
      options: ['귓바퀴가 부풀어 있어요', '두껍게 변했어요', '정상이에요', '모르겠어요'],
      urgencySignals: ['귓바퀴가 부풀어 있어요'],
    },
    {
      id: 'ear_treatment',
      system: 'ear',
      text: '지금 귀 치료를 받고 있나요?',
      options: ['치료 중이에요', '이전에 치료했는데 재발했어요', '아직 안 받았어요', '자가 치료 중이에요'],
    },
    {
      id: 'ear_duration',
      system: 'ear',
      text: '얼마나 됐나요?',
      options: ['오늘 처음이에요', '3~7일 됐어요', '2주 이상이에요', '한 달 이상이에요'],
      urgencySignals: ['2주 이상이에요', '한 달 이상이에요'],
    },
  ],
  orthopedic: [
    {
      id: 'ortho_leg',
      system: 'orthopedic',
      text: '어떤 다리에 문제가 있나요?',
      options: ['앞다리 한쪽', '뒷다리 한쪽', '뒷다리 양쪽 다', '허리·등이 문제인 것 같아요'],
      urgencySignals: ['뒷다리 양쪽 다'],
    },
    {
      id: 'ortho_onset',
      system: 'orthopedic',
      text: '증상이 어떻게 시작됐나요?',
      options: ['갑자기 못 쓰게 됐어요', '서서히 심해졌어요', '사고나 낙하 후 시작됐어요', '오래된 증상이에요'],
      urgencySignals: ['갑자기 못 쓰게 됐어요', '사고나 낙하 후 시작됐어요'],
    },
    {
      id: 'ortho_weight',
      system: 'orthopedic',
      text: '다리에 체중을 실을 수 있나요?',
      options: ['전혀 못 써요', '살짝 짚긴 해요', '절뚝이지만 쓸 수 있어요', '거의 정상이에요'],
      urgencySignals: ['전혀 못 써요'],
    },
    {
      id: 'ortho_pain',
      system: 'orthopedic',
      text: '해당 부위를 만지면 어떻게 하나요?',
      options: ['많이 아파해요', '약간 싫어해요', '괜찮아해요', '확인 못 했어요'],
      urgencySignals: ['많이 아파해요'],
    },
    {
      id: 'ortho_when',
      system: 'orthopedic',
      text: '언제 증상이 심해지나요?',
      options: ['항상 절어요', '운동·산책 후 심해요', '아침에 일어날 때 심해요', '앉았다 일어날 때만'],
    },
    {
      id: 'ortho_spine',
      system: 'orthopedic',
      text: '등이나 허리 부위를 만지면 아파하나요?',
      options: ['많이 아파해요', '약간 싫어해요', '괜찮아해요', '확인 못 했어요'],
      urgencySignals: ['많이 아파해요'],
    },
    {
      id: 'ortho_hind_drag',
      system: 'orthopedic',
      text: '뒷다리를 질질 끌거나 마비 증상이 있나요?',
      options: ['뒷다리를 전혀 못 써요', '질질 끌어요', '약해 보이는 정도예요', '없어요'],
      urgencySignals: ['뒷다리를 전혀 못 써요', '질질 끌어요'],
    },
    {
      id: 'ortho_bladder',
      system: 'orthopedic',
      text: '소변이나 대변을 못 가리게 됐나요? (척수 손상 확인)',
      options: ['소변을 못 가려요', '대변을 못 가려요', '둘 다 못 가려요', '괜찮아요'],
      urgencySignals: ['소변을 못 가려요', '둘 다 못 가려요'],
    },
    {
      id: 'ortho_swelling',
      system: 'orthopedic',
      text: '관절이나 다리가 부어있나요?',
      options: ['눈에 띄게 부어있어요', '약간 부어 보여요', '없어요', '확인 못 했어요'],
      urgencySignals: ['눈에 띄게 부어있어요'],
    },
    {
      id: 'ortho_age',
      system: 'orthopedic',
      text: '나이가 어떻게 되나요? (관절 문제 원인 파악)',
      options: ['1~4살 (어린 편)', '5~8살 (중년)', '9~12살 (노령)', '13살 이상 (고령)'],
      urgencySignals: ['13살 이상 (고령)', '9~12살 (노령)'],
    },
    {
      id: 'ortho_surgery',
      system: 'orthopedic',
      text: '과거에 정형외과 수술을 받은 적 있나요?',
      options: ['슬개골 수술을 받았어요', '십자인대 수술을 받았어요', '디스크 수술을 받았어요', '없어요'],
    },
    {
      id: 'ortho_xray',
      system: 'orthopedic',
      text: '방사선(엑스레이) 촬영을 해봤나요?',
      options: ['최근에 찍었어요', '이전에 찍었어요', '아직 안 찍었어요', '모르겠어요'],
    },
  ],
  dental: [
    {
      id: 'dental_look',
      system: 'dental',
      text: '입 안이나 치아 상태가 어떤가요?',
      options: ['입냄새가 심해요', '잇몸이 붓거나 빨개요', '치석이 많이 쌓였어요', '이빨이 흔들려요'],
      urgencySignals: ['이빨이 흔들려요', '잇몸이 붓거나 빨개요'],
    },
    {
      id: 'dental_eat',
      system: 'dental',
      text: '밥 먹는 데 영향이 있나요?',
      options: ['밥 먹기 힘들어해요', '한쪽으로만 씹어요', '딱딱한 건 못 먹어요', '별로 영향 없어요'],
      urgencySignals: ['밥 먹기 힘들어해요'],
    },
    {
      id: 'dental_gum_color',
      system: 'dental',
      text: '잇몸 색깔이 어떤가요?',
      options: ['분홍색 (정상)', '빨갛거나 진한 빨강이에요', '하얗거나 창백해요', '잘 모르겠어요'],
      urgencySignals: ['하얗거나 창백해요', '빨갛거나 진한 빨강이에요'],
    },
    {
      id: 'dental_mouth_open',
      system: 'dental',
      text: '입 주변이나 얼굴이 부어있나요?',
      options: ['턱 아래나 뺨이 부어있어요', '코나 눈 아래가 부어있어요', '없어요', '잘 모르겠어요'],
      urgencySignals: ['코나 눈 아래가 부어있어요', '턱 아래나 뺨이 부어있어요'],
    },
    {
      id: 'dental_blood',
      system: 'dental',
      text: '입에서 피가 난 적 있나요?',
      options: ['네, 피가 났어요', '음식을 먹을 때 피가 나요', '없어요', '모르겠어요'],
      urgencySignals: ['네, 피가 났어요'],
    },
    {
      id: 'dental_jaw',
      system: 'dental',
      text: '입을 잘 다물거나 열 수 있나요?',
      options: ['입을 못 다물어요', '입 벌리기가 힘들어 보여요', '정상이에요', '모르겠어요'],
      urgencySignals: ['입을 못 다물어요'],
    },
    {
      id: 'dental_xray',
      system: 'dental',
      text: '치아 방사선 촬영(전신마취 치과 처치)을 받아봤나요?',
      options: ['받아봤어요', '스케일링만 받았어요', '무마취 스케일링만 받았어요', '한 번도 받지 않았어요'],
      urgencySignals: ['무마취 스케일링만 받았어요', '한 번도 받지 않았어요'],
    },
    {
      id: 'dental_duration',
      system: 'dental',
      text: '마지막 치과 처치가 언제인가요?',
      options: ['1년 이내', '2~3년 됐어요', '5년 이상', '한 번도 안 했어요'],
      urgencySignals: ['5년 이상', '한 번도 안 했어요'],
    },
    {
      id: 'dental_oral_tumor',
      system: 'dental',
      text: '입 안에 혹이나 변색된 부위가 보이나요?',
      options: ['혹 같은 게 보여요', '궤양이나 색이 변한 부위가 있어요', '없어요', '잘 모르겠어요'],
      urgencySignals: ['혹 같은 게 보여요', '궤양이나 색이 변한 부위가 있어요'],
    },
    {
      id: 'dental_systemic',
      system: 'dental',
      text: '기존에 심장병이나 신부전이 있나요? (마취 위험도 확인)',
      options: ['심장병이 있어요', '신부전이 있어요', '둘 다 있어요', '없어요'],
    },
    {
      id: 'dental_drool',
      system: 'dental',
      text: '침을 많이 흘리거나 입을 자주 닦나요?',
      options: ['침을 계속 흘려요', '자주 입을 닦아요', '가끔 있어요', '없어요'],
      urgencySignals: ['침을 계속 흘려요'],
    },
  ],
  lump: [
    {
      id: 'lump_where',
      system: 'lump',
      text: '혹이나 덩어리가 어디에 있나요?',
      options: ['피부 표면 (손으로 만져져요)', '유선 주변 (젖꼭지 근처)', '입·목 주변', '몸 안쪽인 것 같아요'],
      urgencySignals: ['몸 안쪽인 것 같아요', '입·목 주변'],
    },
    {
      id: 'lump_feel',
      system: 'lump',
      text: '혹의 느낌이 어떤가요?',
      options: ['말랑하고 잘 움직여요', '딱딱하고 고정돼 있어요', '만지면 아파해요', '빠르게 커지고 있어요'],
      urgencySignals: ['빠르게 커지고 있어요', '딱딱하고 고정돼 있어요'],
    },
    {
      id: 'lump_size',
      system: 'lump',
      text: '크기가 어느 정도인가요?',
      options: ['완두콩 크기 이하', '포도알 정도', '골프공 이상', '잘 모르겠어요'],
      urgencySignals: ['골프공 이상'],
    },
    {
      id: 'lump_growth',
      system: 'lump',
      text: '혹이 얼마나 빠르게 커지고 있나요?',
      options: ['1~2주 안에 눈에 띄게 커졌어요', '한 달에 걸쳐 커졌어요', '크기 변화 없어요', '모르겠어요'],
      urgencySignals: ['1~2주 안에 눈에 띄게 커졌어요'],
    },
    {
      id: 'lump_when',
      system: 'lump',
      text: '언제 발견했나요?',
      options: ['오늘 처음 발견했어요', '1~2주 됐어요', '한 달 이상 됐어요', '오래됐는데 최근 변했어요'],
      urgencySignals: ['오래됐는데 최근 변했어요'],
    },
    {
      id: 'lump_surface',
      system: 'lump',
      text: '혹 표면이 어떻게 보이나요?',
      options: ['피부가 정상이에요', '피부가 변색됐어요', '궤양이나 상처가 있어요', '분비물이 나와요'],
      urgencySignals: ['궤양이나 상처가 있어요', '분비물이 나와요'],
    },
    {
      id: 'lump_multiple',
      system: 'lump',
      text: '혹이 여러 개인가요?',
      options: ['하나만 있어요', '2~3개 있어요', '여러 곳에 있어요', '온몸에 퍼진 것 같아요'],
      urgencySignals: ['온몸에 퍼진 것 같아요', '여러 곳에 있어요'],
    },
    {
      id: 'lump_systemic',
      system: 'lump',
      text: '혹 외에 다른 증상이 있나요?',
      options: ['식욕이 줄었어요', '체중이 빠졌어요', '기운이 없어요', '다른 증상 없어요'],
      urgencySignals: ['체중이 빠졌어요', '식욕이 줄었어요'],
    },
    {
      id: 'lump_neuter',
      system: 'lump',
      text: '중성화 수술을 했나요?',
      options: ['네, 했어요', '아니요, 안 했어요', '모르겠어요'],
    },
    {
      id: 'lump_fna',
      system: 'lump',
      text: '세침흡인세포검사(FNA)를 받아봤나요?',
      options: ['받아봤어요 (결과 있어요)', '아직 안 받았어요', '검사 예정이에요', '모르겠어요'],
    },
  ],
  endocrine: [
    {
      id: 'endo_symptom',
      system: 'endocrine',
      text: '어떤 변화가 가장 눈에 띄나요?',
      options: ['물을 엄청 많이 마셔요', '체중이 갑자기 빠졌어요', '배만 볼록하게 나왔어요', '털이 많이 빠지고 피부가 변했어요'],
      urgencySignals: ['배만 볼록하게 나왔어요'],
    },
    {
      id: 'endo_weight_period',
      system: 'endocrine',
      text: '체중 변화가 얼마나 빠르게 일어났나요?',
      options: ['1~2주 안에 눈에 띄게', '한 달 정도에 걸쳐서', '3개월 이상 서서히', '잘 모르겠어요'],
      urgencySignals: ['1~2주 안에 눈에 띄게'],
    },
    {
      id: 'endo_appetite',
      system: 'endocrine',
      text: '식욕은 어떤가요?',
      options: ['식욕이 크게 늘었어요', '식욕이 줄었어요', '평소와 비슷해요', '들쑥날쑥해요'],
    },
    {
      id: 'endo_urine',
      system: 'endocrine',
      text: '소변량이나 횟수가 달라졌나요?',
      options: ['소변량이 많이 늘었어요', '소변을 자주 봐요', '소변 색이 이상해요', '별 변화 없어요'],
      urgencySignals: ['소변량이 많이 늘었어요'],
    },
    {
      id: 'endo_panting',
      system: 'endocrine',
      text: '운동 없이도 헐떡거리거나 호흡이 빠른가요?',
      options: ['항상 헐떡거려요', '자주 헐떡거려요', '가끔 있어요', '없어요'],
      urgencySignals: ['항상 헐떡거려요'],
    },
    {
      id: 'endo_belly',
      system: 'endocrine',
      text: '배가 팽창하거나 늘어진 느낌이 있나요?',
      options: ['많이 볼록해요', '조금 팽창한 것 같아요', '없어요', '모르겠어요'],
      urgencySignals: ['많이 볼록해요'],
    },
    {
      id: 'endo_muscle',
      system: 'endocrine',
      text: '근육이 약해지거나 계단 오르기가 힘들어졌나요?',
      options: ['많이 약해졌어요', '조금 약해진 것 같아요', '변화 없어요', '모르겠어요'],
      urgencySignals: ['많이 약해졌어요'],
    },
    {
      id: 'endo_steroid_hx',
      system: 'endocrine',
      text: '스테로이드를 장기간 복용한 적 있나요?',
      options: ['6개월 이상 복용했어요', '단기 복용만 했어요', '없어요', '지금도 복용 중이에요'],
      urgencySignals: ['6개월 이상 복용했어요', '지금도 복용 중이에요'],
    },
    {
      id: 'endo_thyroid',
      system: 'endocrine',
      text: '갑상선 검사를 받아봤나요? (고양이, 노령견 주의)',
      options: ['갑상선 수치가 높아요', '정상이에요', '검사 안 했어요', '모르겠어요'],
      urgencySignals: ['갑상선 수치가 높아요'],
    },
    {
      id: 'endo_other',
      system: 'endocrine',
      text: '피부나 털에 변화가 있나요?',
      options: ['털이 대칭으로 빠져요', '피부가 얇아지거나 멍이 잘 들어요', '색소 침착이 생겼어요', '없어요'],
      urgencySignals: ['피부가 얇아지거나 멍이 잘 들어요'],
    },
    {
      id: 'endo_diagnosis',
      system: 'endocrine',
      text: '쿠싱증후군 또는 당뇨 진단을 받은 적 있나요?',
      options: ['쿠싱증후군 진단받았어요', '당뇨 진단받았어요', '검사 중이에요', '없어요'],
      urgencySignals: ['쿠싱증후군 진단받았어요', '당뇨 진단받았어요'],
    },
    {
      id: 'endo_acth',
      system: 'endocrine',
      text: 'ACTH 자극 검사나 코르티솔 검사를 받아봤나요?',
      options: ['받아봤어요 (수치 있어요)', '아직 안 받았어요', '검사 예정이에요', '모르겠어요'],
    },
  ],
}

const COMBINED_VOMIT_DIARRHEA_QUESTIONS: Question[] = [
  {
    id: 'dige_combo_vitality',
    system: 'digestive',
    text: '구토와 설사가 동시에 있으면 탈수가 빠르게 올 수 있어요. 지금 기운이 어떻게 보이나요?',
    options: ['비교적 활발해요', '기운이 없어 보여요', '거의 움직이지 않아요', '쓰러져 있어요'],
    emergencyTriggers: ['거의 움직이지 않아요', '쓰러져 있어요'],
  },
  {
    id: 'dige_combo_dehydrate',
    system: 'digestive',
    text: '피부를 살짝 집었다 놓으면 바로 돌아오나요? (탈수 확인)',
    options: ['바로 돌아와요 (정상)', '천천히 돌아와요 (2초 이상)', '그대로 있어요', '확인 못 했어요'],
    emergencyTriggers: ['그대로 있어요'],
  },
]

export function buildQuestionQueue(systems: QuestionSystem[], profile: PetProfile | null, symptomText?: string): Question[] {
  const order: QuestionSystem[] = ['respiratory', 'neurological', 'urinary', 'digestive', 'skin', 'eye', 'ear', 'orthopedic', 'dental', 'lump', 'endocrine', 'general']
  const sorted = [...systems].sort((a, b) => order.indexOf(a) - order.indexOf(b))

  if (profile?.conditions?.includes('심장병') && !sorted.includes('respiratory')) {
    sorted.unshift('respiratory')
  }

  const seen = new Set<string>()
  const questions: Question[] = []
  const primary = sorted[0]

  for (const sys of sorted) {
    // 주 증상은 최대 15개(가장 질문이 많은 digestive 기준), 부가 증상은 최대 4개 (중복 방지).
    // 예전엔 주 증상도 10개로 잘라서 digestive(15개)·urinary(12개)의 뒷부분 질문
    // (dige_fever, dige_weight, uri_vitality 등)이 구조적으로 절대 안 나왔는데,
    // EMERGENCY_REASONS나 임상 소견 로직은 여전히 그 답변을 참조하고 있어서 조용히 죽은 코드가 됐었다.
    const limit = sys === primary ? 15 : 4
    for (const q of QUESTION_BANKS[sys].slice(0, limit)) {
      if (!seen.has(q.id)) { seen.add(q.id); questions.push(q) }
    }
  }

  // 일반 질문은 최대 2개만 추가 (중복 제거 후 — 이미 계통별 질문에서 같은 취지를 물었다면 해당 gen_* 질문은 건너뜀)
  const GENERAL_DUPLICATE_SUFFIX: Record<string, RegExp> = {
    gen_duration: /_(onset|duration|when)$/,
    gen_vitality: /_vitality$/,
    gen_eat: /_eat$/,
    gen_weight: /_weight$/,
    gen_fever: /_fever$/,
  }
  let addedGeneral = 0
  for (const q of QUESTION_BANKS.general) {
    if (addedGeneral >= 2) break
    const dupPattern = GENERAL_DUPLICATE_SUFFIX[q.id]
    if (dupPattern && questions.some(existing => dupPattern.test(existing.id))) continue
    if (!seen.has(q.id)) { seen.add(q.id); questions.push(q); addedGeneral++ }
  }

  // 구토 + 설사 동시: 탈수 체크 질문을 맨 앞에
  if (symptomText && systems.includes('digestive')) {
    const hasVomit = ['구토', '토했', '토를', '토해'].some(kw => includesLiveKeyword(symptomText, kw))
    const hasDiarrhea = includesLiveKeyword(symptomText, '설사')
    if (hasVomit && hasDiarrhea) {
      const extra = COMBINED_VOMIT_DIARRHEA_QUESTIONS.filter(q => !seen.has(q.id))
      questions.unshift(...extra)
    }
  }

  // 신부전 탈수 확인
  if (profile?.conditions?.includes('신부전')) {
    const q: Question = {
      id: 'kidney_dehydrate',
      system: 'general',
      text: '신부전이 있어서 탈수 여부가 중요해요. 피부를 살짝 집었다 놓으면 바로 돌아오나요?',
      options: ['바로 돌아와요', '천천히 돌아와요 (2초 이상)', '그대로 있어요', '확인 못 했어요'],
      urgencySignals: ['천천히 돌아와요 (2초 이상)', '그대로 있어요'],
    }
    if (!seen.has(q.id)) questions.unshift(q)
  }

  // 쿠싱 증후군: 호르몬 약 복용 상태와 애디슨 위기 징후 확인
  if (profile?.conditions?.includes('쿠싱 증후군')) {
    const crisisQ: Question = {
      id: 'cushing_crisis',
      system: 'endocrine',
      text: '쿠싱 이력이 있어서 여쭤볼게요. 심하게 기력이 없어 축 처지거나 몸을 떠는 증상이 있나요? (애디슨 위기 가능성 확인)',
      options: ['네, 심하게 처져요', '약간 기운이 없어요', '평소와 비슷해요', '모르겠어요'],
      emergencyTriggers: ['네, 심하게 처져요'],
      urgencySignals: ['약간 기운이 없어요'],
    }
    const medQ: Question = {
      id: 'cushing_med',
      system: 'endocrine',
      text: '쿠싱 치료를 위해 베토리릴(트리로스탄) 같은 호르몬 약을 복용 중인가요?',
      options: ['네, 매일 복용 중이에요', '최근에 복용을 시작했어요 (2주 이내)', '최근에 중단했어요', '복용한 적 없어요'],
      urgencySignals: ['최근에 중단했어요', '최근에 복용을 시작했어요 (2주 이내)'],
    }
    if (!seen.has(crisisQ.id)) questions.unshift(crisisQ)
    if (!seen.has(medQ.id)) questions.unshift(medQ)
  }

  // 당뇨: 인슐린 투여 상태와 저혈당 징후 확인
  if (profile?.conditions?.includes('당뇨')) {
    const hypoQ: Question = {
      id: 'diabetes_hypo',
      system: 'endocrine',
      text: '당뇨 이력이 있어서 여쭤볼게요. 휘청거리거나 몸을 떨거나 의식이 흐려지는 증상이 있나요? (저혈당 의심)',
      options: ['네, 그런 증상이 있어요', '약간 이상해요', '없어요', '모르겠어요'],
      emergencyTriggers: ['네, 그런 증상이 있어요'],
      urgencySignals: ['약간 이상해요'],
    }
    const insulinQ: Question = {
      id: 'diabetes_insulin',
      system: 'endocrine',
      text: '인슐린 주사를 맞고 있나요? 오늘 정상적으로 투여했나요?',
      options: ['네, 정상적으로 맞았어요', '오늘 아직 안 맞았어요', '최근에 용량을 바꿨어요', '인슐린은 안 맞아요'],
      urgencySignals: ['최근에 용량을 바꿨어요'],
    }
    if (!seen.has(hypoQ.id)) questions.unshift(hypoQ)
    if (!seen.has(insulinQ.id)) questions.unshift(insulinQ)
  }

  // 갑상선 질환: 종에 따라 저하증(개)/항진증(고양이) 방향이 달라요
  if (profile?.conditions?.includes('갑상선 질환')) {
    const q: Question = profile?.species === 'cat'
      ? {
          id: 'thyroid_cat',
          system: 'endocrine',
          text: '갑상선 이력이 있어서 여쭤볼게요. 물을 많이 마시거나 잘 먹는데도 살이 빠지는 증상이 심해졌나요? (항진증 관련)',
          options: ['네, 심해졌어요', '조금 그런 것 같아요', '평소와 비슷해요', '모르겠어요'],
          urgencySignals: ['네, 심해졌어요'],
        }
      : {
          id: 'thyroid_dog',
          system: 'endocrine',
          text: '갑상선 저하증 약(레보티록신 등)을 매일 복용 중인가요? 최근 복용을 거른 적 있나요?',
          options: ['네, 매일 복용 중이에요', '가끔 거를 때가 있어요', '최근에 중단했어요', '복용한 적 없어요'],
          urgencySignals: ['최근에 중단했어요'],
        }
    if (!seen.has(q.id)) questions.unshift(q)
  }

  // 관절염: 진통제 복용 상태 확인 (다리·관절 증상일 때만)
  if (profile?.conditions?.includes('관절염') && sorted.includes('orthopedic')) {
    const q: Question = {
      id: 'arthritis_med',
      system: 'orthopedic',
      text: '관절염 이력이 있어서 여쭤볼게요. 관절염 약(소염진통제 등)을 평소대로 복용 중인가요?',
      options: ['평소대로 복용 중이에요', '최근 용량이나 종류를 바꿨어요', '최근에 중단했어요', '복용 안 해요'],
      urgencySignals: ['최근에 중단했어요'],
    }
    if (!seen.has(q.id)) questions.unshift(q)
  }

  // 간 질환: 황달 여부 확인
  if (profile?.conditions?.includes('간 질환')) {
    const q: Question = {
      id: 'liver_jaundice',
      system: 'digestive',
      text: '간 질환 이력이 있어서 여쭤볼게요. 잇몸이나 눈 흰자가 노랗게 보이는 황달 증상이 있나요?',
      options: ['네, 노랗게 보여요', '약간 그런 것 같아요', '아니요', '확인 못 했어요'],
      urgencySignals: ['네, 노랗게 보여요', '약간 그런 것 같아요'],
    }
    if (!seen.has(q.id)) questions.unshift(q)
  }

  // 총 질문 수 최대 12개로 제한 (긴급 질문은 항상 유지)
  const MAX_QUESTIONS = 12
  if (questions.length > MAX_QUESTIONS) {
    const emergency = questions.filter(q => q.emergencyTriggers && q.emergencyTriggers.length > 0)
    const rest = questions.filter(q => !q.emergencyTriggers || q.emergencyTriggers.length === 0)
    const keepRest = rest.slice(0, MAX_QUESTIONS - emergency.length)
    return [...emergency, ...keepRest].slice(0, MAX_QUESTIONS)
  }

  return questions
}

export function checkAnswerForEmergency(question: Question, answer: string): boolean {
  return question.emergencyTriggers?.includes(answer) ?? false
}

export function assessUrgency(questions: Question[], answers: Record<string, string>): UrgencyLevel {
  // 즉시 종료 emergencyTrigger 체크
  for (const q of questions) {
    const ans = answers[q.id]
    if (ans && q.emergencyTriggers?.includes(ans)) return 'emergency'
  }
  // 혈변/혈토/복부 통증/흑색변/고열 등은 다른 답변과 무관하게 단독으로 emergency
  // (예: 검은 변 하나만 있어도 상부 소화관 출혈 가능성이 있으므로, 아래의
  // "신호 2개 이상" 카운트 결과를 기다리지 않고 먼저 확정한다)
  // 반드시 질문 ID까지 함께 매칭한다 — 같은 텍스트("많이 아파해요" 등)가
  // 정형외과 촉진 질문처럼 훨씬 낮은 위중도의 다른 질문에도 쓰이기 때문에,
  // 텍스트만으로 전체 답변을 훑으면 무관한 질문에서도 응급으로 잘못 튈 수 있다.
  const hardTrigger = EMERGENCY_REASONS.some(r => {
    const userAns = answers[r.questionId]
    if (!userAns) return false
    return Array.isArray(r.answer) ? r.answer.includes(userAns) : r.answer === userAns
  })
  if (hardTrigger) return 'emergency'

  // urgencySignals 누적 체크 (2개 이상이면 emergency)
  let urgencyCount = 0
  for (const q of questions) {
    const ans = answers[q.id]
    if (ans && q.urgencySignals?.includes(ans)) urgencyCount++
  }
  if (urgencyCount >= 2) return 'emergency'
  if (urgencyCount === 1) return 'caution'

  const cautionAnswers = [
    '창백하거나 흰색이에요', '많이 헐떡거려요', '몸을 심하게 떨었어요', '비틀거리거나 쓰러졌어요',
    '찔끔씩 자주 시도해요', '소변에 피가 섞여요', '소변량이 많이 줄었어요', '어제부터예요', '2~3일 됐어요',
    '하루 3~5회', '거의 안 먹어요', '아무것도 안 먹어요', '많이 축 처져요',
    '천천히 돌아와요 (2초 이상)', '기운이 없어 보여요',
    '물처럼 흘러요', '약간 긴장하거나 피해요',
    '노랗거나 초록색이에요', '빨갛거나 분홍색이에요', '갈색이나 진한 색이에요',
    '많이 아파해요 (피해요)', '전혀 못 써요',
    // 소화기 (신규)
    '많이 축 처지고 무기력해요', '선홍색 피가 섞여요', '노랗거나 회색이에요',
    '약간 따뜻한 것 같아요',
    '밥 먹고 1시간 이상 지나서 토해요',
    // 피부
    '빨갛게 부어있어요', '털이 빠지거나 벗겨져요', '오래됐는데 점점 심해져요',
    // 눈
    '눈이 충혈됐어요', '계속 비벼요', '눈물이 많이 나요', '눈이 뿌옇게 변했어요',
    // 귀
    '까맣거나 갈색 분비물', '붉게 부어있어요', '3~7일 됐어요',
    // 정형외과
    '항상 절어요', '서서히 심해졌어요', '운동·산책 후 심해요', '아침에 일어날 때 심해요',
    // 구강
    '잇몸이 붓거나 빨개요', '치석이 많이 쌓였어요', '한쪽으로만 씹어요', '딱딱한 건 못 먹어요',
    // 혹
    '딱딱하고 고정돼 있어요', '1~2주 됐어요', '한 달 이상 됐어요',
    // 내분비
    '물을 엄청 많이 마셔요', '체중이 갑자기 빠졌어요', '배만 볼록하게 나왔어요',
    '소변을 자주 봐요', '소변 색이 이상해요', '털이 많이 빠지고 피부가 변했어요',
  ]
  if (Object.values(answers).some(a => cautionAnswers.includes(a))) return 'caution'

  return 'watch'
}

type EmergencyReason = {
  questionId: string
  answer: string | string[]
  explanation: string
  extraLines?: (name: string) => string[]
}

// 답변 하나만으로도 응급으로 확정되는 소견들 — 어떤 답변을 선택해서
// 응급으로 판단됐는지 결과 메시지에 그대로 인용해서 보여주기 위한 목록.
const EMERGENCY_REASONS: EmergencyReason[] = [
  { questionId: 'dige_blood', answer: '구토에 피가 보여요', explanation: '상부 소화관(위·소장) 출혈 가능성이 있는 소견이에요. 혈액검사 + 위장관 초음파/내시경이 필요해요.' },
  { questionId: 'dige_stool_color', answer: '검은색이에요 (타르 같아요)', explanation: '흑색변(멜레나)은 상부 소화관(위·소장) 출혈 가능성을 의미해요. 혈액검사 + 위장관 초음파/내시경이 필요해요.' },
  { questionId: 'dige_blood', answer: '대변에 피가 섞여요', explanation: '하부 소화관(대장·직장) 출혈 가능성이 있는 소견이에요. 신체검사 + 혈액검사 + 대장 평가가 필요해요.' },
  { questionId: 'dige_abdomen', answer: '배가 빵빵하게 부풀어 있어요', explanation: '복부 팽창은 위확장·염전(GDV) 또는 복수 가능성을 의미해요. 즉시 확인이 필요해요.' },
  { questionId: 'dige_abdomen', answer: '많이 아파해요', explanation: '배를 눌렀을 때 심하게 아파하는 반응은 장중첩·췌장염 악화·복막염 등을 의심할 수 있는 소견이에요.' },
  { questionId: 'dige_fever', answer: '뜨겁게 느껴져요', explanation: '발열과 함께 나타난 소화기 증상은 감염성 장염(파보바이러스 포함) 가능성을 의미해요.' },
  { questionId: 'dige_freq', answer: '하루 6회 이상', explanation: '하루 6회 이상의 구토·설사는 짧은 시간 안에 심한 탈수와 전해질 불균형을 일으킬 수 있는 수준이에요.' },
  { questionId: 'dige_vitality', answer: '쓰러지거나 일어나지 못해요', explanation: '스스로 일어나지 못하는 상태는 쇼크나 중증 탈수를 의심할 수 있는 소견이에요.' },
  { questionId: 'dige_combo_vitality', answer: ['거의 움직이지 않아요', '쓰러져 있어요'], explanation: '구토·설사가 함께 있으면서 거의 움직이지 못하는 상태는 심한 탈수·쇼크 가능성을 의미해요.' },
  { questionId: 'dige_combo_dehydrate', answer: '그대로 있어요', explanation: '피부를 집었다 놨을 때 그대로 남아있는 건 중증 탈수 신호예요. 즉시 수액 치료가 필요해요.' },
  { questionId: 'gen_vitality', answer: '거의 움직이지 않아요', explanation: '전신 활력이 거의 없어 움직이지 못하는 상태는 쇼크나 중증 질환을 의심할 수 있는 소견이에요.' },
  { questionId: 'uri_vitality', answer: '거의 움직이지 않아요', explanation: '비뇨기 증상과 함께 거의 움직이지 못하는 상태는 요독증이나 요폐색으로 인한 쇼크 가능성을 의심할 수 있는 소견이에요.' },
  { questionId: 'resp_gum', answer: '파랗거나 보라색이에요', explanation: '잇몸·혀의 청색증은 산소 공급 저하 상태를 의미해요. 즉시 산소 치료가 필요해요.' },
  { questionId: 'neuro_type', answer: '의식을 잃었어요', explanation: '의식 소실은 심각한 신경학적 응급 상황이에요.' },
  { questionId: 'neuro_now', answer: '지금도 발작 중이에요', explanation: '발작이 진행 중인 상태는 뇌 손상 위험이 있어 즉시 처치가 필요해요.' },
  { questionId: 'uri_output', answer: '소변을 아예 못 봐요', explanation: '완전한 요폐(소변을 전혀 못 보는 상태)는 방광 파열이나 요독증으로 이어질 수 있는 응급 상황이에요.' },
  {
    questionId: 'cushing_crisis',
    answer: '네, 심하게 처져요',
    explanation: '애디슨 위기(부신 기능 저하) 가능성이 있는 소견이에요. 전해질(Na/K) 검사와 수액 치료가 시급해요.',
    extraLines: name => [`병원에 도착하면 ${name}의 쿠싱 치료제(베토리릴 등) 마지막 복용 시각과 최근 용량 변경 여부를 꼭 알려주세요.`],
  },
  {
    questionId: 'diabetes_hypo',
    answer: '네, 그런 증상이 있어요',
    explanation: '저혈당 쇼크 가능성이 있는 소견이에요. 즉시 혈당 확인과 포도당 공급이 필요해요.',
    extraLines: name => [
      '이동 전 삼킬 수 있는 상태라면 꿀이나 설탕물을 잇몸에 소량 발라주세요 (억지로 먹이지는 마세요).',
      `병원에 도착하면 ${name}의 마지막 인슐린 투여 시각과 용량을 꼭 알려주세요.`,
    ],
  },
]

export function makeResultMessage(
  urgency: UrgencyLevel,
  systems: QuestionSystem[],
  petName: string,
  questions?: Question[],
  answers?: Record<string, string>,
): string {
  const name = petName || '반려동물'

  if (urgency === 'emergency') {
    const ans = answers ?? {}
    const emergLines: string[] = ['⚠️ 지금 바로 응급 병원에 가세요!', '', `${name}의 증상이 응급 상황일 가능성이 높습니다.`, '지체 없이 가장 가까운 동물병원 응급실로 이동해주세요.', '']

    const matched = EMERGENCY_REASONS.filter(r => {
      const userAns = ans[r.questionId]
      if (!userAns) return false
      return Array.isArray(r.answer) ? r.answer.includes(userAns) : r.answer === userAns
    })

    if (matched.length > 0) {
      emergLines.push('[응급 판단 근거]')
      for (const r of matched) {
        emergLines.push(`• "${ans[r.questionId]}"를 선택하셔서 → ${r.explanation}`)
      }
      for (const r of matched) {
        if (r.extraLines) emergLines.push(...r.extraLines(name))
      }
    } else if (questions) {
      // 단독 응급 소견은 없지만, 경고 신호 2개 이상이 겹쳐서 응급으로 판단된 경우
      const contributing = questions
        .filter(q => ans[q.id] && q.urgencySignals?.includes(ans[q.id]))
        .map(q => ans[q.id])
      if (contributing.length >= 2) {
        emergLines.push('[응급 판단 근거]')
        emergLines.push(`• 다음 답변이 함께 나타나 응급 수준으로 판단했어요: ${contributing.map(a => `"${a}"`).join(', ')}`)
      }
    }

    emergLines.push('', '이동 중에는:')
    emergLines.push('• 조용하고 따뜻하게 유지해주세요')
    emergLines.push('• 억지로 먹이거나 마시게 하지 마세요')
    emergLines.push('• 전화로 미리 병원에 도착 시간을 알려주세요')

    const emergConditions = buildPossibleConditions(systems, questions, answers)
    if (emergConditions.length) {
      emergLines.push('', '[참고: 고려해볼 수 있는 질환]')
      emergLines.push('※ 진단이 아니라 답변 내용을 바탕으로 한 참고 정보예요. 확진은 병원 검사로만 가능해요.')
      emergLines.push(...emergConditions.map(c => `• ${c}`))
    }
    return emergLines.join('\n')
  }

  const lines: string[] = []
  lines.push(urgency === 'caution' ? '🟡 주의 관찰 필요' : '🟢 집에서 관찰 가능')
  lines.push('')

  // ── 확인된 증상 요약 ──────────────────────────────
  if (questions && answers && Object.keys(answers).length > 0) {
    lines.push('[확인된 증상 요약]')
    for (const q of questions) {
      const ans = answers[q.id]
      if (ans) lines.push(`• ${ans}`)
    }
    lines.push('')
  }

  // ── 시스템별 임상 소견 ────────────────────────────
  const clinical = buildClinicalNote(systems, questions, answers)
  if (clinical.length) {
    lines.push('[임상 소견]', ...clinical, '')
  }

  // ── 권장 조치 ────────────────────────────────────
  lines.push('[권장 조치]')
  lines.push(...buildRecommendation(urgency, systems, questions, answers))
  lines.push('')

  // ── 병원 방문 시 알려주세요 ────────────────────────
  const vetInfo = buildVetInfo(systems, questions, answers)
  if (vetInfo.length) {
    lines.push('[병원 방문 시 알려주세요]', ...vetInfo, '')
  }

  // ── 이런 증상이 생기면 즉시 응급실로 ─────────────
  lines.push('[즉시 응급실로 가야 할 증상]')
  lines.push(...buildRedFlags(systems))

  // ── 참고: 고려해볼 수 있는 질환 ───────────────────
  const possibleConditions = buildPossibleConditions(systems, questions, answers)
  if (possibleConditions.length) {
    lines.push('', '[참고: 고려해볼 수 있는 질환]')
    lines.push('※ 진단이 아니라 답변 내용을 바탕으로 한 참고 정보예요. 확진은 병원 검사로만 가능해요.')
    lines.push(...possibleConditions.map(c => `• ${c}`))
  }

  return lines.join('\n')
}

function buildClinicalNote(
  systems: QuestionSystem[],
  questions?: Question[],
  answers?: Record<string, string>,
): string[] {
  const ans = answers ?? {}
  const lines: string[] = []

  if (systems.includes('digestive')) {
    const freq = ans['dige_freq']
    const blood = ans['dige_blood']
    const vomitType = ans['dige_vomit_type']
    const vomitTiming = ans['dige_vomit_timing']
    const stool = ans['dige_stool']
    const stoolColor = ans['dige_stool_color']
    const cause = ans['dige_cause']
    const foreign = ans['dige_foreign']
    const eat = ans['dige_eat']
    const onset = ans['dige_onset']
    const vitality = ans['dige_vitality']
    const fever = ans['dige_fever']

    // 구토 패턴 분석
    if (vomitTiming === '빈속에 토해요') {
      lines.push('• 공복 구토: 담즙역류 또는 위산 자극이 원인일 가능성이 높아요. 식사 간격을 줄여보세요.')
    } else if (vomitTiming === '밥 먹은 직후 바로 토해요') {
      lines.push('• 식후 즉시 구토: 과식, 급하게 먹음, 또는 위장 자극 가능성이에요. 소량씩 자주 급여해 보세요.')
    } else if (vomitTiming === '밥 먹고 1시간 이상 지나서 토해요') {
      lines.push('• 지연성 구토: 위 배출 지연 또는 위염 가능성이 있어요. 먹은 내용물이 나온다면 위 운동 이상도 고려해요.')
    }
    if (vomitType === '노랗거나 거품 같아요 (담즙)') {
      lines.push('• 담즙성(노란) 구토: 공복이 길 때 담즙이 역류한 것으로, 위 자극 증상이에요.')
    } else if (vomitType === '흰 거품이나 침이에요') {
      lines.push('• 흰 거품 구토: 위산 분비 과다 또는 위장 자극 신호예요.')
    }

    // 설사 색깔 분석 (검은 변 vs 혈변 구분)
    if (stoolColor === '검은색이에요 (타르 같아요)') {
      lines.push('• 흑색변(멜레나): 상부 소화관(위, 소장) 출혈 가능성 — 즉시 진료가 필요해요.')
    } else if (stoolColor === '선홍색 피가 섞여요') {
      lines.push('• 혈변(선홍색): 하부 소화관(대장, 직장) 출혈 가능성이에요.')
    } else if (stoolColor === '노랗거나 회색이에요') {
      lines.push('• 회색/노란 변: 담즙 분비 이상 또는 췌장·간 문제를 고려할 수 있어요.')
      lines.push('  → 췌장염 의심 시: CPL(췌장 특이 리파아제) + 복부 초음파 검사가 필요해요.')
    }

    // 췌장염 패턴 분석
    const abdomen = ans['dige_abdomen']
    if (abdomen === '많이 아파해요') {
      lines.push('• 복통 동반: 췌장염의 가장 중요한 임상 신호가 통증이에요. 등이 굽거나 고개를 숙이는 자세도 췌장염 통증 신호예요.')
      lines.push('  → 췌장염 치료의 핵심: 통증 관리 + 수액 요법. 금식보다 소량씩 빨리 재급여가 현재 권장 방향이에요.')
    }
    if (freq === '하루 3~5회' && stoolColor === '노랗거나 회색이에요') {
      lines.push('• 반복 구토 + 회색/노란 변: 급성 췌장염 패턴이에요. CPL 검사를 우선 받으세요.')
    }

    // IBD 의심 패턴 — 만성 구토 + 만성 설사 반복
    if (onset === '1주일 이상이에요' && stool !== '정상이에요') {
      lines.push('• 만성 소화기 문제: 반복성 구토·설사가 오래 지속되면 IBD(염증성 장 질환) 가능성을 고려해야 해요.')
      lines.push('  → 임상 사례: "IBD는 질병이 아니라 증후군이에요. 췌장염과 동반되는 경우가 많아 복합 검사(내시경 + 조직 생검)가 필요해요."')
    }

    if (stool === '물처럼 흘러요') {
      lines.push('• 수양성 설사: 탈수가 빠르게 진행될 수 있어요. 수분 보충이 최우선이에요.')
    } else if (stool === '묽거나 죽처럼 풀어져요') {
      lines.push('• 연변: 장 점막 자극 또는 식이성 원인을 고려할 수 있어요.')
    }

    if (blood === '구토에 피가 보여요' || blood === '대변에 피가 섞여요') {
      lines.push('• 출혈 동반: 소화관 출혈 가능성 — 즉시 병원 진료가 필요해요.')
    }

    // 발열 + 소화기 = 감염 가능성
    if (fever === '뜨겁게 느껴져요') {
      lines.push('• 발열 동반: 감염성 장염(파보바이러스, 세균성 등) 가능성을 배제해야 해요. 오늘 중 진료를 받으세요.')
    }

    if (vitality === '많이 축 처지고 무기력해요') {
      lines.push('• 무기력 동반: 단순 위장 장애를 넘어 전신 영향이 시작된 신호일 수 있어요.')
    }

    // 만성 구토 패턴 — 임상 사례: 체중 감소 + 만성 구토 = 기저 질환 신호
    if (onset === '1주일 이상이에요' && (vitality === '많이 축 처지고 무기력해요' || eat === '거의 안 먹어요')) {
      lines.push('• 만성 구토 + 무기력/식욕부진: 임상 사례 원칙 — "만성 구토는 기저 질환(신부전, 심부전, 종양)의 신호일 수 있어요. 단순 위장약으로 덮기 전에 기저 원인 검사가 우선이에요."')
    }

    if (foreign === '삼킨 것 같아요' || foreign === '뭔가 이상한 걸 먹었어요') {
      lines.push('• 이물 섭취 가능성: 방사선 촬영으로 이물 위치 및 장 폐색 여부 확인이 필요해요.')
    }
    if (cause === '새로운 음식이나 간식을 줬어요') {
      lines.push('• 최근 식이 변화: 새 사료·간식이 소화기 자극의 원인일 수 있어요. 해당 음식을 중단하고 반응을 지켜보세요.')
    } else if (cause === '스트레스 상황이 있었어요') {
      lines.push('• 최근 스트레스 상황: 스트레스성 위장 증상(과민성 장) 가능성이 있어요. 환경을 안정시켜주세요.')
    }
    if (freq === '하루 3~5회' && (eat === '거의 안 먹어요' || eat === '아무것도 안 먹어요')) {
      lines.push('• 잦은 구토/설사 + 식욕 저하: 급성 위장염 가능성이 높아요.')
    }
    if (onset === '오늘 갑자기 시작됐어요') {
      lines.push('• 급성 발병: 식이성 원인, 이물, 감염 등을 감별해야 해요.')
    }

    const jaundice = ans['liver_jaundice']
    if (jaundice === '네, 노랗게 보여요' || jaundice === '약간 그런 것 같아요') {
      lines.push('• 황달(잇몸·눈 흰자가 노랗게 변함): 간 수치(ALT, ALP, 빌리루빈) 확인이 필요해요. 간 질환 이력이 있다면 기존 처방약 목록도 함께 챙겨가세요.')
    }
  }

  if (systems.includes('respiratory')) {
    const gum = ans['resp_gum']
    const effort = ans['resp_effort']
    const coughType = ans['resp_cough_type']
    const when = ans['resp_when']
    const sleepRate = ans['resp_sleep_rate']
    const heartHx = ans['resp_heart_hx']

    if (gum === '창백하거나 흰색이에요') {
      lines.push('• 창백한 잇몸: 빈혈 또는 순환 장애(심부전) 가능성 — 빠른 진료가 필요해요.')
    }
    if (sleepRate === '40회 이상이에요') {
      lines.push('• 수면 중 호흡수 40회 이상: 정상(30회 이하)을 크게 초과 — 폐수종·흉수 가능성. 오늘 응급 진료가 필요해요.')
    } else if (sleepRate === '30~40회 정도예요') {
      lines.push('• 수면 중 호흡수 30~40회: 경계 수준입니다. 매일 같은 시간에 재서 기록해 두세요.')
    }
    if (heartHx === '네, 심장약 복용 중이에요' || heartHx === '심장병은 있는데 약은 없어요') {
      lines.push('• 기존 심장 질환 동반: 호흡기 증상이 폐수종(심장성 폐부종)의 신호일 수 있어요. 현재 복용 중인 약 목록을 병원에 가져가세요.')
    }
    if (effort === '많이 헐떡거려요' && when === '밤이나 새벽에 심해요') {
      lines.push('• 야간 호흡 곤란: 심부전 또는 폐부종 가능성을 우선 배제해야 해요.')
    }
    if (when === '자다가 갑자기 깨요') {
      lines.push('• 수면 중 갑작스러운 각성: 호흡 곤란·폐수종의 급성 증상일 수 있어요. 즉시 확인이 필요해요.')
    }
    if (coughType === '기침 후 구토해요') {
      lines.push('• 기침 후 구토: 심한 기관지 자극 또는 역류성 기침 가능성이에요.')
      lines.push('  → 소형견에서 "캑캑" + 기침 후 하얀 거품 구토: 기관지 협착(기관허탈) 패턴이에요.')
      lines.push('  → 임상 사례: "기관지 협착은 저절로 좋아지지 않아요. 심해지면 기침보다 호흡 장애가 먼저 와요. 수면 중 호흡수 체크가 중요해요."')
    }
    if (coughType === '마른 기침이에요') {
      lines.push('• 마른 기침: 기관지 자극, 기관지 협착, 또는 역류성 기침 가능성이에요. 기침 동영상이 진단에 중요해요.')
    }
    if (coughType === '가래가 끓는 듯한 기침이에요') {
      lines.push('• 습성 기침: 하부 기도 감염, 폐렴, 또는 폐에 액체 축적 가능성이에요.')
    }
    if (heartHx === '심장병은 있는데 약은 없어요') {
      lines.push('• 심장병 + 약 없음: 심장 단계 평가 후 약물 시작이 필요한 상태일 수 있어요. ACVIM 가이드라인상 B2 이상이면 피모벤단 처방이 권장돼요.')
    }
    // 심장 D단계 경고
    const nasal = ans['resp_nasal']
    if (effort === '배까지 움직이며 숨 쉬어요' && heartHx === '네, 심장약 복용 중이에요') {
      lines.push('• 심장약 복용 중 심한 호흡 곤란: 약물로 교정이 안 되는 D단계 진행 가능성이 있어요. 용량 조정 또는 추가 처치가 필요해요.')
    }
    if (nasal === '코피가 났어요') {
      lines.push('• 코피 동반: 응고 장애, 고혈압, 또는 코 안쪽 종양·이물 가능성이 있어요. 혈액검사(혈소판, 응고 수치)가 필요해요.')
    } else if (nasal === '노랗거나 탁한 콧물이에요') {
      lines.push('• 화농성 콧물: 세균성 부비동염 또는 치아 뿌리 감염이 코로 퍼진 경우일 수 있어요.')
    }
  }

  if (systems.includes('urinary')) {
    const output = ans['uri_output']
    const color = ans['uri_color']
    const pain = ans['uri_pain']
    const drink = ans['uri_drink']
    const kidneyHx = ans['uri_kidney_hx']
    const freq = ans['uri_freq']

    if (output === '찔끔씩 자주 시도해요' || freq === '평소보다 훨씬 자주 봐요') {
      lines.push('• 빈뇨·배뇨 곤란: 방광염 또는 요로결석 가능성이 높아요. 아침 첫 소변 샘플 지참 후 진료 권장.')
    }
    if (output === '소변량이 많이 줄었어요' || freq === '평소보다 훨씬 줄었어요') {
      lines.push('• 소변량 감소: 신장 기능 저하 또는 탈수 가능성이에요. CRE(크레아티닌) 수치 확인이 필요해요.')
    }
    if (color === '빨갛거나 분홍색이에요') {
      lines.push('• 혈뇨: 방광염, 요로결석, 종양 등 다양한 원인 — 소변 검사(비중·침사 검사)가 필수예요.')
    }
    if (color === '갈색이나 진한 색이에요') {
      lines.push('• 갈색 소변: 근육 손상(미오글로빈뇨) 또는 용혈성 빈혈 가능성 — 즉시 진료 필요.')
    }
    if (pain === '울거나 끙끙거려요') {
      lines.push('• 배뇨 시 통증: 하부 요로 염증이나 결석에 의한 자극 신호예요.')
    }
    if (drink === '평소보다 훨씬 많이 마셔요') {
      lines.push('• 다음다뇨(물 많이 마시고 소변 많이): 신장 질환, 당뇨, 쿠싱 증후군 감별이 필요해요.')
      lines.push('  → 신장 질환이라면: CRE(크레아티닌) + SDMA 수치 확인이 우선이에요.')
      lines.push('  → 쿠싱이라면: ALKP(ALP) 상승 + 복부 팽창 여부도 같이 확인하세요.')
    }
    if (kidneyHx === '신부전 진단받고 관리 중이에요') {
      lines.push('• 기존 신부전 환자: CRE·SDMA 수치 변화, 혈압, 인(P) 수치가 핵심 모니터링 지표예요.')
      lines.push('  → 임상 사례 원칙: "CRE랑 고혈압 먼저 — BUN은 나중"')
    }
  }

  if (systems.includes('neurological')) {
    const type = ans['neuro_type']
    const duration = ans['neuro_duration']
    const after = ans['neuro_after']
    const first = ans['neuro_first']
    const meds = ans['neuro_epilepsy_hx']

    if (type === '한쪽으로 기울거나 빙빙 돌아요') {
      lines.push('• 전정 증상 (머리 기울기, 안구진탕, 빙빙 돌기): 말초성(내이 문제) 또는 중추성(뇌 문제) 전정 질환 감별이 필요해요.')
      lines.push('  → 안구진탕 방향이 빠른 면: 말초성이면 1~2주 내 자연 개선 가능, 중추성이면 MRI 필요.')
      lines.push('• 임상 사례 원칙 — 머리 기울어짐 검사 순서:')
      lines.push('  1단계: 외이염·중이염 배제 (이경 검사)')
      lines.push('  2단계: 갑상선기능저하증 배제 (T4 혈액검사)')
      lines.push('  3단계: 두 검사 모두 정상이면 그때 MRI 고려')
    }
    if (type === '전신 경련·발작이에요') {
      lines.push('• 발작 원인 분류: 간질(특발성) vs 증상성(뇌 병변, 대사 이상)을 감별해야 해요.')
      lines.push('  → 5세 이하 첫 발작 → 구조적 뇌 질환 or 특발성 간질 고려')
      lines.push('  → 7세 이상 첫 발작 → 뇌종양·뇌염 가능성이 더 높아요')
    }
    if (duration === '계속 반복돼요') {
      lines.push('• 군발 발작(짧은 시간에 반복): 뇌에 심각한 손상을 줄 수 있어요. 즉시 응급 처치가 필요해요.')
    }
    if (after === '몇 시간째 이상해요') {
      lines.push('• 발작 후 오래 지속되는 이상 상태: 발작 자체보다 뇌 손상이 더 심할 수 있어요.')
    }
    if (first === '점점 잦아지고 있어요') {
      lines.push('• 발작 빈도 증가: 항경련제 용량 조정 또는 기저 질환 악화 가능성 — 신경과 전문의 상담 필요.')
    }
    if (meds === '네, 항경련제 복용 중이에요') {
      lines.push('• 항경련제 복용 중 발작 재발: 약 용량 조정 또는 약 변경이 필요할 수 있어요. 현재 약 이름과 용량을 병원에 알려주세요.')
    }
    lines.push('• 발작 동영상이 있다면 반드시 병원에 보여주세요 — 발작 유형 분류에 매우 중요한 자료예요.')
  }

  if (systems.includes('orthopedic')) {
    const leg = ans['ortho_leg']
    const onset = ans['ortho_onset']
    const weight = ans['ortho_weight']
    const when = ans['ortho_when']
    const pain = ans['ortho_pain']

    lines.push('• 임상 사례 원칙: 디스크든 슬개골이든 정형외과 질환의 기본은 방사선 촬영이에요. 보충제(관절 영양제)만으로 관절염이 개선되거나 진행이 멈추지는 않아요.')

    if (leg === '뒷다리 한쪽' && onset === '서서히 심해졌어요') {
      lines.push('• 뒷다리 점진적 파행: 슬개골 탈구(소형견 특히 많음) 또는 고관절 이형성 가능성이에요. 방사선으로 단계 확인이 먼저예요.')
    }
    if (leg === '허리·등이 문제인 것 같아요') {
      lines.push('• 허리·척추 통증: 추간판 질환(IVDD) 가능성이에요. 디스크가 탈출 상태인지 파열 상태인지에 따라 치료 방향이 달라요.')
      lines.push('  → 경미한 탈출: 스테로이드 + 절대 안정으로 호전 가능')
      lines.push('  → 마비 동반 파열: MRI + 수술 여부 판단이 필요 (빠를수록 예후 좋음)')
    }
    if (onset === '갑자기 못 쓰게 됐어요') {
      lines.push('• 급성 마비: 척추 디스크 탈출·파열 가능성 — 마비가 생긴 후 48~72시간 이내 수술 여부 결정이 중요해요.')
      lines.push('  → 통증만 있고 걸을 수 있으면 내과 처치 가능 / 마비가 완전하면 응급 MRI 필요')
    }
    if (when === '아침에 일어날 때 심해요') {
      lines.push('• 기상 시 뻣뻣함: 퇴행성 관절염의 전형적 패턴이에요. 보온 + 통증 관리 + 체중 조절이 핵심이에요.')
    }
    if (when === '운동·산책 후 심해요') {
      lines.push('• 운동 후 심화: 구조적 관절 문제(슬개골, 고관절) 또는 관절염 초기를 고려해요. 방사선 평가 후 운동 강도를 조절하세요.')
    }
    if (weight === '전혀 못 써요') {
      lines.push('• 완전 파행(체중 부하 불가): 골절, 인대 파열, 또는 척추 문제 가능성 — 방사선 촬영이 우선이에요.')
    }
    if (pain === '많이 아파해요') {
      lines.push('• 심한 통증: 진통제 없이 견디는 것은 동물도 매우 힘들어요. 통증 관리를 먼저 시작하는 게 회복에 도움이 돼요.')
    }
    if (onset === '사고나 낙하 후 시작됐어요') {
      lines.push('• 외상: 골절 및 인대 파열 여부를 방사선으로 즉시 확인해야 해요. 내부 출혈 가능성도 배제가 필요해요.')
    }

    const arthritisMed = ans['arthritis_med']
    if (arthritisMed === '최근에 중단했어요') {
      lines.push('• 관절염 약 최근 중단: 통증 재발과 직접 연관될 수 있어요. 중단 사유와 시점을 병원에 알려주세요.')
    } else if (arthritisMed === '최근 용량이나 종류를 바꿨어요') {
      lines.push('• 관절염 약 최근 변경: 새 약 적응 기간이거나 용량이 맞지 않을 수 있어요. 변경 전후 증상 차이를 기록해두면 도움이 돼요.')
    }
  }

  if (systems.includes('lump')) {
    const feel = ans['lump_feel']
    const surface = ans['lump_surface']
    const size = ans['lump_size']
    const where = ans['lump_where']
    const when = ans['lump_when']

    // 위치에 따른 특이 소견
    if (where === '유선 주변 (젖꼭지 근처)') {
      lines.push('• 유선 혹: 암컷(특히 미중성화)에서 유선종양 발생률이 높아요. 악성 비율이 약 50% — 즉시 세침흡인세포검사(FNA)를 권장해요.')
    }

    if (feel === '딱딱하고 고정돼 있어요') {
      lines.push('• 딱딱하고 고정된 혹: 악성 종양 가능성이 높아요. 반드시 세침흡인세포검사(FNA) 또는 조직 생검이 필요해요.')
    } else if (feel === '말랑하고 잘 움직여요') {
      lines.push('• 말랑하고 움직이는 혹: 지방종이나 낭종 가능성이 있지만 크기가 크거나 빠르게 자라면 검사가 필요해요.')
    }
    if (feel === '빠르게 커지고 있어요') {
      lines.push('• 빠른 성장: 비만세포종·육종 등 악성 종양은 빠르게 자라는 경우가 많아요. 즉시 FNA 권장.')
    }

    if (surface === '궤양이나 상처가 있어요' || surface === '분비물이 나와요') {
      lines.push('• 표면 궤양/분비물: 감염 또는 악성 변환 가능성 — 즉시 진료가 필요해요.')
    }
    if (size === '골프공 이상') {
      lines.push('• 크기가 큰 혹: 크기 자체가 수술적 제거 및 조직검사 우선순위를 높여요.')
    }

    if (when === '오래됐는데 최근 변했어요') {
      lines.push('• 기존 혹의 성상 변화: 악성 전환 가능성 — 즉시 세포 검사가 필요해요.')
    }

    if (where === '몸 안쪽인 것 같아요') {
      lines.push('• 복강 내 종괴: 비장 등 내부 장기 종양 가능성이에요. 비장의 경우 초음파로 양성/악성을 구별하기 어려워요 — 수술적 절제 후 조직 생검이 확진 방법이에요.')
    }
    lines.push('• 임상 사례 원칙: 혹이 발견되면 크기나 느낌에 관계없이 세침흡인세포검사(FNA)를 먼저 받는 것을 강력히 권장해요.')
  }

  if (systems.includes('endocrine')) {
    const symptom = ans['endo_symptom']
    const weightPeriod = ans['endo_weight_period']
    const appetite = ans['endo_appetite']
    const urine = ans['endo_urine']
    const other = ans['endo_other']
    const belly = ans['endo_belly']

    if (symptom === '물을 엄청 많이 마셔요') {
      lines.push('• 다음다뇨(물 많이 마심): 3가지 주요 감별 진단이 필요해요:')
      lines.push('  1) 당뇨 → 혈당 검사, 소변 당 확인')
      lines.push('  2) 쿠싱 증후군(부신피질기능항진증) → ALKP 상승, 복부 팽창, LDDST(저용량 덱사메타손 억제 검사)')
      lines.push('  3) 신부전 → CRE, SDMA, BUN 수치 확인')
    }
    if (symptom === '배만 볼록하게 나왔어요') {
      lines.push('• 복부 팽창(배가 볼록): 쿠싱 증후군의 전형적 소견이에요. 근육 약화 + 털 빠짐이 함께 있으면 쿠싱 의심도 더 높아요.')
    }
    if (symptom === '털이 많이 빠지고 피부가 변했어요') {
      lines.push('• 탈모 + 피부 변화: 갑상선기능저하증(저하 시 털 빠짐) 또는 쿠싱(피부 얇아짐, 탈모) 감별 필요.')
    }
    if (appetite === '식욕이 크게 늘었어요') {
      lines.push('• 식욕 증가: 쿠싱이나 당뇨에서 흔히 나타나는 증상이에요.')
    }
    if (weightPeriod === '1~2주 안에 눈에 띄게') {
      lines.push('• 급격한 체중 감소: 심각한 내과 질환(당뇨, 종양, 신부전 등)의 신호 — 오늘~내일 진료 필요.')
    }
    if (belly === '많이 볼록해요' || belly === '조금 팽창한 것 같아요') {
      lines.push('• 복부 팽창: 쿠싱 또는 복강 내 액체 축적 가능성 — 초음파 검사 권장.')
    }
    if (urine === '소변 색이 이상해요') {
      lines.push('• 소변 색 변화: 당뇨·신장 질환 동반 시 요로 감염 위험이 높아져요. 소변 검사를 함께 받아보세요.')
    }
    if (other === '털이 대칭으로 빠져요') {
      lines.push('• 좌우 대칭 탈모: 내분비 질환(갑상선기능저하증, 쿠싱)에서 특징적으로 나타나는 패턴이에요.')
    } else if (other === '피부가 얇아지거나 멍이 잘 들어요') {
      lines.push('• 피부가 얇아지고 멍이 잘 듦: 쿠싱 증후군의 전형적 피부 소견이에요.')
    } else if (other === '색소 침착이 생겼어요') {
      lines.push('• 색소 침착: 내분비 질환에서 동반될 수 있는 피부 변화예요.')
    }

    const cushingMed = ans['cushing_med']
    if (cushingMed === '최근에 중단했어요' || cushingMed === '최근에 복용을 시작했어요 (2주 이내)') {
      lines.push('• 쿠싱 치료제 최근 변경: 용량 조정 초기에는 애디슨 위기(부신 기능 저하) 위험이 높아져요. 전해질(Na/K) 검사로 확인이 필요해요.')
    }
    const insulin = ans['diabetes_insulin']
    if (insulin === '최근에 용량을 바꿨어요') {
      lines.push('• 인슐린 용량 최근 변경: 저혈당·고혈당 어느 쪽으로도 치우칠 수 있어요. 혈당 커브 검사로 재확인이 필요해요.')
    } else if (insulin === '오늘 아직 안 맞았어요') {
      lines.push('• 오늘 인슐린 미투여: 고혈당 상태일 수 있어요. 투여 전 혈당 수치를 확인하는 게 안전해요.')
    }
    const thyroidDog = ans['thyroid_dog']
    if (thyroidDog === '최근에 중단했어요' || thyroidDog === '가끔 거를 때가 있어요') {
      lines.push('• 갑상선 저하증 약 복용 불규칙: 증상 재발과 직접 연관될 수 있어요. T4 수치 재검이 필요해요.')
    }
    const thyroidCat = ans['thyroid_cat']
    if (thyroidCat === '네, 심해졌어요') {
      lines.push('• 항진증 악화 의심(체중 감소 + 다음다갈): 심장에 부담을 줄 수 있어 T4 수치와 심장 상태를 함께 확인해야 해요.')
    }
  }

  if (systems.includes('dental')) {
    const look = ans['dental_look']
    const eat = ans['dental_eat']
    const gumColor = ans['dental_gum_color']
    const mouthOpen = ans['dental_mouth_open']
    const xray = ans['dental_xray']
    const systemic = ans['dental_systemic']

    if (look === '이빨이 흔들려요') {
      lines.push('• 동요치(흔들리는 이빨): 치주 질환 말기 또는 외상 — 발치가 필요한 경우가 많아요.')
    }
    if (gumColor === '빨갛거나 진한 빨강이에요') {
      lines.push('• 잇몸 발적: 치은염·치주염의 초기 신호예요. 스케일링 및 치주 치료가 필요할 수 있어요.')
    } else if (gumColor === '하얗거나 창백해요') {
      lines.push('• 잇몸 창백: 빈혈이나 순환 장애 가능성 — 구강 문제 외의 전신 상태도 함께 확인이 필요해요.')
    }
    if (mouthOpen === '코나 눈 아래가 부어있어요') {
      lines.push('• 얼굴 부종(코·눈 아래): 치근 농양이 주변으로 퍼진 가능성 — 즉시 진료 필요. 항생제 + 발치 치료가 필요해요.')
    }
    if (mouthOpen === '턱 아래나 뺨이 부어있어요') {
      lines.push('• 턱·뺨 부종: 치근 주위 농양 가능성 — 치과 방사선 촬영으로 확인 필요.')
    }
    if (xray === '무마취 스케일링만 받았어요') {
      lines.push('• 무마취 스케일링: 치아 표면만 청소하며 잇몸 아래 치주 병변은 확인·치료가 불가능해요. 전신마취 하의 정식 치과 처치가 필요해요.')
    }
    if (eat === '밥 먹기 힘들어해요' || eat === '한쪽으로만 씹어요') {
      lines.push('• 식이 영향 동반: 구강 통증이 식욕에 영향을 주고 있어요. 치과 치료 후 개선되는 경우가 많아요.')
    }
    if (systemic === '심장병이 있어요' || systemic === '신부전이 있어요' || systemic === '둘 다 있어요') {
      lines.push('• 기저 질환 + 치과 질환: 치주 질환은 심장병·신부전을 악화시킬 수 있어요. 국소마취 병행으로 전신마취 부담을 줄이는 방법을 담당의와 상의하세요.')
    }
    lines.push('• 임상 사례 원칙: 육안 검사만으로는 치과 진단이 불완전해요. 치과 방사선 촬영(전신마취 하)이 필수예요.')
    lines.push('  → "치아 방사선 사진을 찍는 병원이 아니라면 일단 믿고 거르시길 바랍니다." — 임상 사례')
    lines.push('• 습식 vs 건식 사료: 임상 사례: "치석은 음식 종류보다 음식 형태가 더 중요해요. 이빨 사이에 음식물이 남는 것이 치주 질환의 핵심 원인이에요."')
    lines.push('  → 사료 종류보다 식후 양치질(하루 1회)이 치주 건강에 가장 중요해요.')
  }

  if (systems.includes('skin')) {
    const where = ans['skin_where']
    const look = ans['skin_look']
    const onset = ans['skin_onset']
    const smell = ans['skin_smell']

    if (onset === '새 간식·사료 바꾼 뒤 시작됐어요') {
      lines.push('• 식이 알레르기 가능성: 새 사료·간식 도입 후 시작됐다면 해당 식품을 즉시 중단하고 단백질 원을 바꿔보세요.')
      lines.push('  → 진단을 위해서는 가수분해 단백질 사료로 8~12주 식이 시험이 필요해요.')
    }
    if (onset === '특정 계절에만 심해요') {
      lines.push('• 계절성 알레르기: 환경적 알레르겐(꽃가루, 먼지) 가능성이 높아요.')
    }
    if (where === '발바닥·발 사이') {
      lines.push('• 발 핥기: 알레르기성 족부 피부염이에요. 장기간 지속 시 세균 감염이 동반돼 만성화되는 경우가 많아요.')
    }
    if (smell === '고름 냄새가 나요') {
      lines.push('• 농성 분비물: 농피증(세균성 피부 감염) 가능성 — 항생제 치료가 필요해요. 세균 배양·감수성 검사를 권장해요.')
    }
    if (look === '빨갛게 부어있어요') {
      lines.push('• 급성 발적·부종: 급성 습성 피부염(핫스팟) 또는 알레르기 반응 초기 소견일 수 있어요.')
    } else if (look === '털이 빠지거나 벗겨져요') {
      lines.push('• 탈모 부위: 진균(링웜), 옴진드기, 또는 내분비 질환(갑상선·쿠싱) 감별이 필요해요. 피부 스크래핑 검사를 권장해요.')
    } else if (look === '딱지나 상처가 생겼어요') {
      lines.push('• 딱지·상처: 자가 손상(긁음)에 의한 2차 세균 감염 가능성이 있어요.')
    }
    if (onset === '오래됐는데 점점 심해져요') {
      lines.push('• 만성 진행성 피부 질환: 알레르기, 세균, 곰팡이, 면역 이상이 복합적으로 섞인 경우가 많아요. 복합 검사가 필요해요.')
    }
  }

  if (systems.includes('eye')) {
    const look = ans['eye_look']
    const behave = ans['eye_behave']
    const discharge = ans['eye_discharge']
    const vision = ans['eye_vision']
    const pain = ans['eye_pain']
    const onset = ans['eye_onset']

    if (look === '눈이 부어있거나 돌출됐어요') {
      lines.push('• 안구 돌출/부종: 안압 상승(녹내장) 또는 안와 뒤 종괴 가능성 — 즉시 응급 진료가 필요해요.')
    }
    if (look === '눈이 뿌옇게 변했어요') {
      lines.push('• 각막 혼탁 또는 백내장: 고양이에서 백내장의 가장 흔한 원인은 포도막염(눈 내부 염증)이에요. 방치 시 녹내장으로 진행될 수 있어요.')
    }
    if (discharge === '노랗거나 초록색이에요') {
      lines.push('• 농성 분비물: 세균성 결막염 또는 각막 궤양 가능성 — 항생제 안약이 필요해요. 각막 형광 검사(플루오레신)로 궤양 유무 확인이 필요해요.')
    }
    if (behave === '눈을 잘 못 떠요 (계속 감아요)') {
      lines.push('• 눈 찡그리기(안검경련): 각막 자극, 각막 궤양, 또는 안압 상승의 통증 신호예요. 오늘 중 진료를 받으세요.')
    }
    if (pain === '많이 아파해요 (피해요)') {
      lines.push('• 눈 주변 통증: 안압 상승(녹내장) 또는 포도막염 가능성이 있어요. 안압 측정이 필수예요.')
      lines.push('  → 녹내장은 개방각/폐쇄각에 따라 통증 정도가 다르지만 안압이 높으면 즉시 안압 강하 처치가 필요해요.')
    }
    if (vision === '물체에 자꾸 부딪혀요') {
      lines.push('• 시력 저하: 갑작스러운 실명은 고혈압성 망막 박리(고혈압·신부전 합병증) 또는 진행된 녹내장일 수 있어요. 즉시 안압·혈압 측정이 필요해요.')
    }
    if (onset === '오늘 갑자기') {
      lines.push('• 급성 안과 증상: 각막 궤양, 급성 녹내장, 또는 전방출혈(외상) 가능성 — 오늘 중 진료가 필요해요.')
    }
    lines.push('• 안압 측정은 안과 진료의 기본이에요. 모든 눈 증상에서 안압 체크를 요청하세요.')
  }

  if (systems.includes('ear')) {
    const symptom = ans['ear_symptom']
    const inside = ans['ear_inside']
    const pain = ans['ear_pain']
    const recurrence = ans['ear_recurrence']
    const allergy = ans['ear_allergy']

    if (inside === '노랗거나 고름 같은 분비물') {
      lines.push('• 농성 이루(고름): 세균성 외이염 또는 중이염 가능성 — 귀 세척 + 항균 귀약이 필요해요. 세균 배양·감수성 검사를 권장해요.')
    }
    if (inside === '까맣거나 갈색 분비물') {
      lines.push('• 갈색/검은 분비물: 말라세치아(효모균) 외이염의 전형적 소견이에요. 항진균 귀약 처방이 필요해요.')
    }
    if (recurrence === '자주 재발해요 (월 1회 이상)' || recurrence === '항상 달고 살아요') {
      lines.push('• 반복성 외이염: 단순 감염이 아닌 알레르기 또는 면역 이상이 기저 원인일 가능성이 높아요.')
      lines.push('  → 반복 재발 시 외이염 자체보다 근본 원인(알레르기) 치료가 더 중요해요. 피부과 전문 진료를 고려하세요.')
    }
    if (allergy === '알레르기가 있어요' || allergy === '피부 가려움이 자주 있어요') {
      lines.push('• 알레르기 + 외이염: 알레르기 피부염의 일환으로 귀가 반복적으로 감염되는 패턴이에요. 귀 치료와 함께 알레르기 관리가 필요해요.')
    }
    if (pain === '많이 아파해요 (피해요)') {
      lines.push('• 귀 통증 심함: 외이도 심한 염증 또는 중이염으로의 진행 가능성 — 귀 안쪽 검사(이경 or 내시경)가 필요해요.')
    }
    if (symptom === '머리를 자꾸 흔들어요') {
      lines.push('• 지속적인 두부 진탕: 귀 깊숙이 불편함이 있다는 신호예요. 이물질 또는 중이염 가능성을 배제해야 해요.')
    }
  }

  // 심장 + 신장 동반 감지 — 임상 사례의 심장-신장 악순환 원칙
  if (systems.includes('respiratory') && systems.includes('urinary')) {
    lines.push('⚠️ 심장+신장 복합 주의: 심장약(이뇨제·혈관확장제)은 심장에 도움이 되지만 신장 혈류를 줄여 신장에 부담을 줄 수 있어요.')
    lines.push('  → 임상 사례 원칙: "심장을 위한 약이 신장에 해롭다고 약을 끊으면 안 돼요. 두 장기의 균형을 전문의와 함께 조율해야 해요."')
    lines.push('  → 심장약 복용 중 CRE·SDMA 수치가 올라가도 심장 안정이 우선인 경우가 많아요.')
  }

  // general 시스템 — 활기 저하·무기력 단독 케이스
  if (systems.includes('general') && !systems.some(s => s !== 'general')) {
    const vitality = ans['gen_vitality']
    if (vitality === '많이 축 처져요' || vitality === '거의 움직이지 않아요') {
      lines.push('• 전신 활기 저하: 신체 증상이 뚜렷하지 않아도 내부 질환(신부전, 빈혈, 심부전, 종양)의 초기 신호일 수 있어요.')
      lines.push('  → 체중이 빠지고 있다면 기저 질환 가능성이 더 높아요 — 혈액검사가 우선이에요.')
    }
  }

  return lines
}

function buildRecommendation(
  urgency: UrgencyLevel,
  systems: QuestionSystem[],
  questions?: Question[],
  answers?: Record<string, string>,
): string[] {
  const ans = answers ?? {}
  const lines: string[] = []

  const timingMap: Partial<Record<QuestionSystem, { caution: string; watch: string }>> = {
    respiratory: { caution: '오늘 중으로 진료를 받으세요.', watch: '24시간 내 상태 변화를 주시하세요.' },
    neurological: { caution: '오늘 중으로 신경과 전문 진료를 받으세요.', watch: '재발 시 즉시 병원에 가세요.' },
    urinary: { caution: '오늘~내일 중 소변 검사를 받으세요.', watch: '24시간 내 소변량을 확인하세요.' },
    digestive: { caution: '오늘~내일 중 진료를 받으세요.', watch: '12~24시간 소식(少食)으로 장을 쉬게 하세요.' },
    skin: { caution: '2~3일 내 피부 검사를 받으세요.', watch: '핥거나 긁지 못하게 넥카라를 씌워주세요.' },
    eye: { caution: '오늘 중으로 안과 검진을 받으세요.', watch: '눈 주변을 청결하게 닦아주세요.' },
    ear: { caution: '2~3일 내 귀 검사를 받으세요.', watch: '귀 안에 물이 들어가지 않게 주의하세요.' },
    orthopedic: { caution: '오늘~내일 중 방사선 촬영을 받으세요.', watch: '안정을 취하고 계단·점프를 제한하세요.' },
    dental: { caution: '1주일 내 구강 검진을 받으세요.', watch: '딱딱한 간식을 피하고 치아를 확인하세요.' },
    lump: { caution: '1주일 내 세포 검사를 받으세요.', watch: '크기 변화를 사진으로 기록해두세요.' },
    endocrine: { caution: '오늘~내일 중 혈액·소변 검사를 받으세요.', watch: '물 섭취량과 소변량을 기록하세요.' },
    general: { caution: '24~48시간 내 진료를 받으세요.', watch: '수분 섭취와 활기를 주시하세요.' },
  }

  const primary = systems[0] ?? 'general'
  const timing = timingMap[primary] ?? timingMap.general!

  lines.push(urgency === 'caution' ? `▶ ${timing.caution}` : `▶ ${timing.watch}`)

  // 소화기 특이 지침
  if (systems.includes('digestive')) {
    const eat = ans['dige_eat']
    const stool = ans['dige_stool']
    const blood = ans['dige_blood']
    const stoolColor = ans['dige_stool_color']
    const freq = ans['dige_freq']
    const fever = ans['dige_fever']

    if (blood === '구토에 피가 보여요' || blood === '대변에 피가 섞여요' || stoolColor === '검은색이에요 (타르 같아요)') {
      lines.push('▶ 혈성 구토/혈변이 있으므로 음식을 주지 말고 오늘 중 병원에 가세요.')
    } else if (fever === '뜨겁게 느껴져요') {
      lines.push('▶ 발열이 동반됐으므로 오늘 중 진료를 받으세요.')
    } else if (freq === '하루 3~5회' || freq === '하루 6회 이상') {
      lines.push('▶ 구토/설사가 잦으므로 오늘~내일 중 진료를 받으세요.')
      lines.push('▶ 그동안 수분 보충이 중요해요. 닭가슴살 삶은 물(무염)을 조금씩 제공해보세요.')
    } else if (stool === '물처럼 흘러요') {
      lines.push('▶ 급성 설사 직후 12~24시간 금식이 도움이 돼요. 소화기관을 쉬게 해주세요.')
      lines.push('▶ 금식 중에도 신선한 물 또는 닭고기 삶은 물(무염)은 반드시 제공해주세요.')
      lines.push('▶ 금식 후 재급여 시: 닭가슴살(기름 없이 삶은 것) + 흰쌀죽을 1:1 비율로 소량부터 시작하세요.')
    } else if (eat === '거의 안 먹어요' || eat === '아무것도 안 먹어요') {
      lines.push('▶ 12시간 절식 후 닭가슴살(삶은 것) + 흰쌀죽을 1:1 비율로 소량 급여해보세요.')
      lines.push('▶ 절식 중에도 물은 반드시 제공해주세요.')
    }
    if (!blood && stool !== '물처럼 흘러요') {
      lines.push('▶ 설사의 양, 색깔, 횟수를 날짜별로 기록해두세요. 병원 방문 시 중요한 단서가 돼요.')
    }
    lines.push('▶ 아래 증상이 생기면 지체 없이 응급 병원으로 가세요: 혈변/혈토, 잇몸이 파랗게 변함, 복부 팽창, 완전히 못 일어남.')
  }

  // 정형외과 특이 지침
  if (systems.includes('orthopedic')) {
    const weight = ans['ortho_weight']
    const onset = ans['ortho_onset']
    if (weight === '전혀 못 써요') {
      lines.push('▶ 다리를 전혀 못 쓰는 경우: 안아서 이동하고 스스로 걷게 하지 마세요.')
      lines.push('▶ 방사선 촬영으로 골절·척추 문제 확인이 우선이에요.')
    }
    if (onset === '갑자기 못 쓰게 됐어요') {
      lines.push('▶ 갑작스러운 마비: 척추 디스크 탈출 가능성 — 오늘 중 진료를 받으세요. 빠를수록 회복 예후가 좋아요.')
    }
    lines.push('▶ 안정 시 계단·점프·소파 오르내리기를 제한하세요.')
  }

  // 호흡기 특이 지침
  if (systems.includes('respiratory')) {
    const sleepRate = ans['resp_sleep_rate']
    const heartHx = ans['resp_heart_hx']
    if (sleepRate === '30~40회 정도예요' || sleepRate === '40회 이상이에요') {
      lines.push('▶ 매일 잠든 후 1분간 호흡수를 세서 기록해두세요 (정상: 분당 30회 이하).')
      lines.push('▶ 호흡수가 연속 2일 이상 40회를 넘으면 당일 병원에 가세요.')
    }
    if (heartHx === '네, 심장약 복용 중이에요') {
      lines.push('▶ 현재 복용 중인 심장약(피모벤단, 이뇨제 등) 목록을 병원에 가져가세요.')
      lines.push('▶ 임의로 심장약을 중단하지 마세요.')
    }
  }

  // 비뇨기 특이 지침
  if (systems.includes('urinary')) {
    const kidneyHx = ans['uri_kidney_hx']
    const output = ans['uri_output']
    if (kidneyHx === '신부전 진단받고 관리 중이에요') {
      lines.push('▶ 신부전 환자: 최신 혈액검사 결과지(CRE, SDMA, BUN, 인 수치)와 처방전을 지참하세요.')
      lines.push('▶ 수분 섭취량과 소변량을 일간 기록해두면 진료 시 도움이 돼요.')
    }
    if (output === '소변을 아예 못 봐요') {
      lines.push('▶ 12시간 이상 소변을 전혀 못 보면 즉시 응급 병원으로 가세요.')
    }
  }

  // 신경계 특이 지침
  if (systems.includes('neurological')) {
    const type = ans['neuro_type']
    const duration = ans['neuro_duration']
    if (type === '한쪽으로 기울거나 빙빙 돌아요') {
      lines.push('▶ 걷다가 넘어지거나 부딪히지 않도록 주변 위험물을 치우고, 억지로 걷게 하지 마세요.')
      lines.push('▶ 눈이 흔들리는 방향(안구진탕)을 스마트폰으로 촬영해두면 진단에 도움이 돼요.')
    } else if (type === '비틀거리거나 걷기 어려워요') {
      lines.push('▶ 계단·높은 곳에서 떨어지지 않도록 주의하고, 이동이 필요하면 안아서 옮겨주세요.')
    } else if (type === '의식을 잃었어요') {
      lines.push('▶ 잇몸 색깔과 호흡 상태를 확인하고, 의식이 돌아올 때까지 옆으로 눕혀 기도를 확보해주세요.')
      lines.push('▶ 의식을 잃은 시간을 기록해두면 진단에 중요한 정보가 돼요.')
    } else {
      lines.push('▶ 발작이 일어나는 동안: 억지로 잡거나 입안에 손을 넣지 마세요. 주변 위험물만 치워주세요.')
      lines.push('▶ 발작이 5분 이상 지속되면 즉시 응급 병원으로 이동하세요.')
    }
    lines.push('▶ 다음 증상 발생 시 스마트폰으로 영상 촬영 — 병원 진단에 매우 중요해요.')
    if (duration === '계속 반복돼요') {
      lines.push('▶ 짧은 간격으로 반복되고 있다면 지체 없이 응급 병원으로 이동하세요.')
    }
    if (ans['neuro_epilepsy_hx'] === '네, 항경련제 복용 중이에요') {
      lines.push('▶ 항경련제는 임의로 중단하거나 용량을 변경하지 마세요.')
    }
  }

  // 치과 특이 지침
  if (systems.includes('dental')) {
    const systemic = ans['dental_systemic']
    lines.push('▶ 딱딱한 간식(뼈, 사슴뿔 등)은 치아 파절의 원인이 될 수 있어요. 치료 전까지 피해주세요.')
    lines.push('▶ 습식 사료나 물에 불린 사료로 급여해서 씹는 부담을 줄여주세요.')
    if (systemic === '심장병이 있어요' || systemic === '신부전이 있어요') {
      lines.push('▶ 기저 질환이 있는 경우 마취 전 심장·신장 기능 평가가 필수예요. 치과 전문 병원 또는 2차 병원 방문을 권장해요.')
    }
  }

  // 안과 특이 지침
  if (systems.includes('eye')) {
    const look = ans['eye_look']
    const pain = ans['eye_pain']
    const behave = ans['eye_behave']
    if (look === '눈이 부어있거나 돌출됐어요' || pain === '많이 아파해요 (피해요)' || behave === '눈을 잘 못 떠요 (계속 감아요)') {
      lines.push('▶ 안구 돌출·통증·눈 찡그리기는 응급 소견이에요. 오늘 중 진료를 받으세요.')
    }
    lines.push('▶ 눈 주변을 면봉이나 생리식염수에 적신 거즈로 부드럽게 닦아주세요 (문지르지 않기).')
    lines.push('▶ 사람용 안약(항생제 포함)은 동물에게 함부로 사용하지 마세요.')
    if (look === '눈이 뿌옇게 변했어요') {
      lines.push('▶ 혼탁 진행 여부를 사진으로 날짜별로 기록해두세요.')
    }
    lines.push('▶ 반드시 안압 측정을 요청하세요 — 녹내장은 통증이 없어도 진행될 수 있어요.')
  }

  // 귀 특이 지침
  if (systems.includes('ear')) {
    const recurrence = ans['ear_recurrence']
    lines.push('▶ 귀 안에 물이 들어가지 않도록 목욕·수영을 피하세요.')
    lines.push('▶ 귀 세척은 수의사 지시 없이 임의로 하지 마세요 — 잘못된 세척은 상태를 악화시킬 수 있어요.')
    if (recurrence === '자주 재발해요 (월 1회 이상)' || recurrence === '항상 달고 살아요') {
      lines.push('▶ 반복 재발이면 항균 귀약만 반복하지 말고 알레르기 등 기저 원인 검사를 받으세요.')
    }
    lines.push('▶ 귀를 과도하게 긁어 상처가 생기면 넥카라를 씌워주세요.')
  }

  // 종양 특이 지침
  if (systems.includes('lump')) {
    lines.push('▶ 혹의 크기 변화를 사진으로 날짜별로 기록해두세요.')
    lines.push('▶ 발견 즉시 세침흡인세포검사(FNA)를 받는 것을 권장해요 — 조직을 최소로 건드리는 간단한 검사예요.')
  }

  // 내분비 특이 지침
  if (systems.includes('endocrine')) {
    lines.push('▶ 하루 음수량(물 마신 양)과 소변량을 ml 단위로 3일간 기록해오세요. 진료 시 매우 중요한 자료예요.')
    if (ans['endo_symptom'] === '물을 엄청 많이 마셔요') {
      lines.push('▶ 혈액검사(혈당, 코르티솔/ALKP, CRE, SDMA) + 소변 검사(비중, 당뇨 확인)를 함께 받으세요.')
    }
  }

  return lines
}

function buildVetInfo(
  systems: QuestionSystem[],
  questions?: Question[],
  answers?: Record<string, string>,
): string[] {
  const ans = answers ?? {}
  const lines: string[] = []
  const tests: string[] = []
  const info: string[] = []

  if (systems.includes('digestive')) {
    info.push('증상 시작 시각')
    info.push('구토 횟수 + 구토물 색깔/양 (기록하거나 사진 찍어두세요)')
    info.push('설사 횟수 + 변 색깔 (갈색/검은색/혈변)')
    info.push('마지막으로 먹은 것과 시간')
    if (ans['dige_foreign'] === '삼킨 것 같아요' || ans['dige_foreign'] === '뭔가 이상한 걸 먹었어요') info.push('삼켰을 가능성이 있는 물건 종류')
    tests.push('복부 신체검사')
    tests.push('혈액검사 (염증 수치 CRP, 췌장 수치 CPL·리파아제, 신장·간 기능, 백혈구)')
    tests.push('복부 초음파 (췌장 크기·밀도 확인 — 하얗게 보이면 췌장염 시사)')
    if (ans['dige_stool'] === '물처럼 흘러요' || ans['dige_freq'] === '하루 3~5회' || ans['dige_freq'] === '하루 6회 이상') {
      tests.push('복부 방사선 (이물·장폐색 확인)')
    }
    if (ans['dige_blood'] === '구토에 피가 보여요' || ans['dige_blood'] === '대변에 피가 섞여요' || ans['dige_stool_color'] === '검은색이에요 (타르 같아요)') {
      tests.push('위장관 출혈 평가 (내시경 또는 초음파 우선)')
    }
    if (ans['dige_stool_color'] === '노랗거나 회색이에요' || ans['dige_abdomen'] === '많이 아파해요') {
      tests.push('⚠️ 췌장염 확인: CPL 수치 + 복부 초음파가 핵심 검사예요. 치료 핵심은 통증 관리 + 수액이에요.')
    }
  }

  if (systems.includes('respiratory')) {
    info.push('기침 동영상 촬영 (기침 소리·빈도 확인에 중요)')
    info.push('수면 중 호흡수 측정값 (1분간 횟수)')
    if (ans['resp_heart_hx'] === '네, 심장약 복용 중이에요') {
      info.push('현재 복용 중인 심장약 전체 목록 + 용량')
    }
    tests.push('흉부 방사선 촬영 (폐·심장 크기 확인)')
    tests.push('심장 질환 의심 시: 심장초음파(심에코)')
    tests.push('감염 의심 시: 혈액검사 (백혈구, CRP 염증 수치)')
  }

  if (systems.includes('urinary')) {
    info.push('아침 첫 소변 샘플 (깨끗한 용기에 담아 2시간 내 검사)')
    info.push('24시간 음수량·소변량 기록')
    if (ans['uri_kidney_hx'] === '신부전 진단받고 관리 중이에요') {
      info.push('최근 혈액검사 결과지 (CRE, SDMA, BUN, 인(P), 혈압 수치)')
    }
    tests.push('소변 검사 (비중, 혈뇨, 단백뇨, 결정 침사)')
    tests.push('혈액검사 (CRE, SDMA, BUN, 전해질)')
    tests.push('방광 초음파 (결석·종괴 확인)')
  }

  if (systems.includes('orthopedic')) {
    info.push('파행 시작 시각, 외상·낙하 여부')
    info.push('어느 다리·어느 상황에서 심해지는지 메모')
    info.push('현재 복용 중인 진통제·관절 보충제 이름')
    tests.push('방사선 촬영 (골절·관절·척추 이상 확인) — 정형외과의 기본 검사')
    if (ans['ortho_onset'] === '갑자기 못 쓰게 됐어요' || ans['ortho_leg'] === '허리·등이 문제인 것 같아요') {
      tests.push('척추 디스크 의심 시: MRI 또는 CT 촬영 (방사선만으로는 연부 조직 확인 불가)')
    }
    if (ans['ortho_when'] === '아침에 일어날 때 심해요' || ans['ortho_when'] === '운동·산책 후 심해요') {
      tests.push('관절염 평가: 방사선 + 관절 촉진 (슬개골 grade, 고관절 각도 측정)')
    }
  }

  if (systems.includes('lump')) {
    info.push('혹 발견 날짜, 처음 발견 시 크기')
    info.push('날짜별 크기 변화 사진')
    tests.push('세침흡인세포검사(FNA) — 가장 먼저, 간단하고 통증 적음')
    tests.push('악성 의심 시: 조직 생검(절제 생검 or 코어 생검)')
    tests.push('악성 확진 시: CT 또는 흉부 방사선 (전이 확인)')
  }

  if (systems.includes('endocrine')) {
    info.push('3일간 하루 음수량(ml) + 소변량(ml) 기록')
    info.push('체중 변화 추이 (최근 1~3개월)')
    tests.push('혈액검사: 혈당, ALKP(쿠싱 지표), 코르티솔, CRE, 갑상선(T4)')
    tests.push('소변 검사: 비중, 소변 당, 단백뇨')
    if (ans['endo_symptom'] === '배만 볼록하게 나왔어요') {
      tests.push('쿠싱 확진: LDDST(저용량 덱사메타손 억제 검사) + 복부 초음파')
    }
  }

  if (systems.includes('neurological')) {
    info.push('발작 동영상 (스마트폰으로 촬영한 것)')
    info.push('발작 시작 시각, 지속 시간, 횟수')
    info.push('발작 직전 행동 (전조 증상)')
    if (ans['neuro_epilepsy_hx'] === '네, 항경련제 복용 중이에요') {
      info.push('현재 복용 중인 항경련제 이름 + 용량')
    }
    tests.push('혈액검사 (혈당, 칼슘, 신장·간 기능 — 대사성 원인 배제)')
    tests.push('신경계 이상 의심 시: MRI 또는 CT (뇌 종양·염증·구조적 이상)')
    if (ans['neuro_first'] === '처음이에요') {
      tests.push('첫 발작 시: 혈액·소변 검사 우선 → 원인 불명 시 MRI')
    }
  }

  if (systems.includes('dental')) {
    info.push('마지막 스케일링(전신마취 치과 처치) 날짜')
    info.push('식욕 변화, 한쪽으로만 씹는지 여부')
    if (ans['dental_systemic'] && ans['dental_systemic'] !== '없어요') {
      info.push(`기저 질환: ${ans['dental_systemic']} — 마취 위험도에 영향이 있어요`)
    }
    tests.push('구강 검사 (전신마취 하의 치과 방사선 촬영 필수)')
    tests.push('⚠️ 무마취 스케일링은 잇몸 아래 병변을 확인할 수 없어요 — 전신마취 하의 정식 치과 처치 권장')
    if (ans['dental_mouth_open'] && ans['dental_mouth_open'] !== '없어요') {
      tests.push('얼굴 부종 동반 시: 방사선 촬영으로 치근 농양·뼈 흡수 여부 확인')
    }
  }

  if (systems.includes('skin')) {
    info.push('가려움 시작 시점, 계절적 패턴 여부')
    info.push('최근 바뀐 사료·간식·샴푸·환경')
    tests.push('피부 스크래핑 검사 (기생충·곰팡이 확인)')
    tests.push('세균 감염 의심 시: 세균 배양·감수성 검사')
    tests.push('식이 알레르기 의심 시: 가수분해 단백질 사료로 8~12주 식이 시험')
  }

  if (systems.includes('eye')) {
    info.push('증상 시작 시각, 눈 분비물 색깔·양 (사진 찍어두세요)')
    info.push('안약이나 약을 사용 중이라면 약 이름')
    if (ans['eye_look'] === '눈이 뿌옇게 변했어요') {
      info.push('처음 뿌옇게 보이기 시작한 시점 (언제부터 변했는지)')
    }
    if (ans['eye_vision'] === '물체에 자꾸 부딪혀요') {
      info.push('시력 저하 시작 시점 — 혈압·신장 수치 최근 검사 결과도 지참')
    }
    tests.push('안압 측정 (모든 눈 증상에서 기본 검사)')
    tests.push('각막 플루오레신 염색 검사 (각막 궤양·찰과상 확인)')
    tests.push('세극등 검사 (포도막염·백내장·녹내장 감별)')
    if (ans['eye_discharge'] === '노랗거나 초록색이에요') {
      tests.push('결막 도말 검사 (세균 확인)')
    }
    if (ans['eye_look'] === '눈이 부어있거나 돌출됐어요') {
      tests.push('안와 초음파 또는 CT (안와 종괴 배제)')
    }
  }

  if (systems.includes('ear')) {
    info.push('귀 증상 시작 시점, 분비물 색깔·냄새')
    info.push('이전에 외이염 치료 경험과 사용한 귀약 이름')
    if (ans['ear_recurrence'] === '자주 재발해요 (월 1회 이상)' || ans['ear_recurrence'] === '항상 달고 살아요') {
      info.push('재발 패턴 (계절성 여부, 알레르기 병력)')
    }
    if (ans['ear_allergy'] === '알레르기가 있어요') {
      info.push('현재 알레르기 치료 여부 + 알레르겐 종류')
    }
    tests.push('이경(이내시경) 검사 (외이도·고막 상태 확인)')
    tests.push('귀 도말 세포 검사 (세균/효모균 감별 — 세균이면 항균제, 효모면 항진균제)')
    if (ans['ear_recurrence'] === '자주 재발해요 (월 1회 이상)' || ans['ear_recurrence'] === '항상 달고 살아요') {
      tests.push('세균 배양·감수성 검사 (반복 재발 시 내성균 확인)')
      tests.push('알레르기 검사 고려 (반복 외이염의 기저 원인 파악)')
    }
    if (ans['ear_pain'] === '많이 아파해요 (피해요)') {
      tests.push('방사선 촬영 또는 CT (중이염·내이염 진행 확인)')
    }
  }

  if (info.length) lines.push('• 알릴 정보: ' + info.join(' / '))
  if (tests.length) lines.push('• 예상 검사: ' + tests.join(' / '))

  return lines
}

// 진단이 아니라 참고용 — 답변 패턴을 근거로 병원에서 감별해볼 만한 질환명을 모아 보여준다.
function buildPossibleConditions(
  systems: QuestionSystem[],
  questions?: Question[],
  answers?: Record<string, string>,
): string[] {
  const ans = answers ?? {}
  const conditions: string[] = []
  const add = (c: string) => { if (!conditions.includes(c)) conditions.push(c) }

  if (systems.includes('digestive')) {
    const freq = ans['dige_freq']
    const blood = ans['dige_blood']
    const stoolColor = ans['dige_stool_color']
    const stool = ans['dige_stool']
    const onset = ans['dige_onset']
    const eat = ans['dige_eat']
    const vitality = ans['dige_vitality']
    const fever = ans['dige_fever']
    const abdomen = ans['dige_abdomen']
    const foreign = ans['dige_foreign']
    const vomitType = ans['dige_vomit_type']

    if (blood === '구토에 피가 보여요' || stoolColor === '검은색이에요 (타르 같아요)') add('상부 소화관 출혈')
    if (blood === '대변에 피가 섞여요' || stoolColor === '선홍색 피가 섞여요') add('하부 소화관 출혈')
    if (abdomen === '많이 아파해요' || stoolColor === '노랗거나 회색이에요') add('췌장염')
    if (onset === '1주일 이상이에요' && stool !== '정상이에요') add('염증성 장질환(IBD)')
    if (foreign === '삼킨 것 같아요' || foreign === '뭔가 이상한 걸 먹었어요') add('이물 섭취(장폐색 위험)')
    if (fever === '뜨겁게 느껴져요') add('감염성 장염(파보바이러스 등)')
    if (vomitType === '노랗거나 거품 같아요 (담즙)') add('담즙 역류성 위염')
    if (freq === '하루 3~5회' || freq === '하루 6회 이상') add('급성 위장염')
    if (abdomen === '배가 빵빵하게 부풀어 있어요') add('위확장·염전(GDV)')
    if (onset === '1주일 이상이에요' && (vitality === '많이 축 처지고 무기력해요' || eat === '거의 안 먹어요')) {
      add('신부전·심부전·종양 등 기저 질환')
    }
    if (ans['liver_jaundice'] === '네, 노랗게 보여요' || ans['liver_jaundice'] === '약간 그런 것 같아요') add('간 질환(황달)')
  }

  if (systems.includes('respiratory')) {
    const gum = ans['resp_gum']
    const sleepRate = ans['resp_sleep_rate']
    const heartHx = ans['resp_heart_hx']
    const coughType = ans['resp_cough_type']

    if (gum === '창백하거나 흰색이에요') add('빈혈 또는 순환 장애')
    if (sleepRate === '40회 이상이에요' || (heartHx !== '없어요' && heartHx !== '모르겠어요' && sleepRate === '30~40회 정도예요')) {
      add('폐수종·흉수(심부전 관련)')
    }
    if (coughType === '기침 후 구토해요' || coughType === '마른 기침이에요') add('기관지 협착(기관 허탈)')
    if (coughType === '가래가 끓는 듯한 기침이에요') add('폐렴·하부 기도 감염')
  }

  if (systems.includes('urinary')) {
    const output = ans['uri_output']
    const color = ans['uri_color']
    const drink = ans['uri_drink']
    const kidneyHx = ans['uri_kidney_hx']

    if (output === '소변을 아예 못 봐요') add('요로 폐색(응급)')
    if (color === '빨갛거나 분홍색이에요') add('방광염·요로결석')
    if (color === '갈색이나 진한 색이에요') add('근육 손상 또는 용혈성 빈혈')
    if (output === '소변량이 많이 줄었어요' || kidneyHx === '신부전 진단받고 관리 중이에요') add('신장 기능 저하(신부전)')
    if (drink === '평소보다 훨씬 많이 마셔요') add('당뇨·쿠싱증후군·신부전(다음다뇨 감별 필요)')
  }

  if (systems.includes('neurological')) {
    const type = ans['neuro_type']
    const duration = ans['neuro_duration']
    if (type === '한쪽으로 기울거나 빙빙 돌아요') add('전정 질환(말초성/중추성 감별 필요)')
    if (type === '전신 경련·발작이에요') add('특발성 간질 또는 증상성 발작')
    if (duration === '계속 반복돼요') add('군발 발작(응급)')
  }

  if (systems.includes('orthopedic')) {
    const leg = ans['ortho_leg']
    const onset = ans['ortho_onset']
    const when = ans['ortho_when']
    if (leg === '뒷다리 한쪽' && onset === '서서히 심해졌어요') add('슬개골 탈구 또는 고관절 이형성')
    if (leg === '허리·등이 문제인 것 같아요' || onset === '갑자기 못 쓰게 됐어요') add('추간판 질환(IVDD)')
    if (when === '아침에 일어날 때 심해요') add('퇴행성 관절염(골관절염)')
  }

  if (systems.includes('lump')) {
    const where = ans['lump_where']
    const feel = ans['lump_feel']
    if (where === '유선 주변 (젖꼭지 근처)') add('유선종양')
    if (feel === '딱딱하고 고정돼 있어요' || feel === '빠르게 커지고 있어요') add('악성 종양(비만세포종·육종 등)')
    if (feel === '말랑하고 잘 움직여요') add('지방종·낭종')
    if (where === '몸 안쪽인 것 같아요') add('내부 장기 종양(비장 등)')
  }

  if (systems.includes('endocrine')) {
    const symptom = ans['endo_symptom']
    if (symptom === '물을 엄청 많이 마셔요' || symptom === '배만 볼록하게 나왔어요') add('쿠싱증후군')
    if (symptom === '물을 엄청 많이 마셔요') add('당뇨')
    if (symptom === '털이 많이 빠지고 피부가 변했어요') add('갑상선기능저하증')
    if (ans['thyroid_cat'] === '네, 심해졌어요') add('갑상선기능항진증')
  }

  if (systems.includes('dental')) {
    const look = ans['dental_look']
    const mouthOpen = ans['dental_mouth_open']
    if (look === '이빨이 흔들려요' || look === '잇몸이 붓거나 빨개요' || look === '치석이 많이 쌓였어요') add('치주 질환')
    if (mouthOpen === '턱 아래나 뺨이 부어있어요' || mouthOpen === '코나 눈 아래가 부어있어요') add('치근 농양')
  }

  if (systems.includes('skin')) {
    const onset = ans['skin_onset']
    const smell = ans['skin_smell']
    if (onset === '새 간식·사료 바꾼 뒤 시작됐어요') add('식이 알레르기')
    if (onset === '특정 계절에만 심해요') add('계절성 알레르기(아토피)')
    if (smell === '고름 냄새가 나요') add('농피증(세균성 피부 감염)')
  }

  if (systems.includes('eye')) {
    const look = ans['eye_look']
    const discharge = ans['eye_discharge']
    if (look === '눈이 부어있거나 돌출됐어요') add('녹내장 또는 안와 종괴')
    if (look === '눈이 뿌옇게 변했어요') add('백내장 또는 포도막염')
    if (discharge === '노랗거나 초록색이에요') add('세균성 결막염·각막 궤양')
  }

  if (systems.includes('ear')) {
    const inside = ans['ear_inside']
    if (inside === '노랗거나 고름 같은 분비물') add('세균성 외이염·중이염')
    if (inside === '까맣거나 갈색 분비물') add('말라세치아(효모균) 외이염')
  }

  return conditions
}

function buildRedFlags(systems: QuestionSystem[]): string[] {
  const common = [
    '• 잇몸이 파랗거나 보라색으로 변할 때',
    '• 경련·발작이 멈추지 않거나 5분 이상 지속될 때',
    '• 완전히 쓰러져 일어나지 못할 때',
    '• 극심한 통증으로 비명을 지를 때',
  ]
  const specific: Partial<Record<QuestionSystem, string[]>> = {
    digestive: [
      '• 구토나 설사에 선홍색 피가 다량 섞이거나 검은 변이 나올 때',
      '• 배가 딱딱하게 부풀어 오를 때 (위확장·염전 의심)',
      '• 발열(39.5℃ 이상) + 구토/설사가 동반될 때',
      '• 등을 굽히고 배를 만지면 극심하게 아파할 때 (췌장염 심화 신호)',
    ],
    respiratory: [
      '• 잠자는 중 호흡수가 분당 40회 이상 지속될 때',
      '• 입으로 숨 쉬거나 팔꿈치를 벌리고 앉아 숨 쉴 때',
      '• 흰 거품을 토하며 호흡 곤란이 같이 올 때 (폐수종 의심)',
    ],
    urinary: [
      '• 12시간 이상 소변을 전혀 못 볼 때 (고양이 특히 위험)',
      '• 배를 만지면 극심하게 아파할 때',
      '• 갈색이나 검붉은 소변이 나올 때',
    ],
    orthopedic: [
      '• 갑자기 뒷다리를 전혀 못 쓰게 될 때 (척추 디스크 의심)',
      '• 척추 통증으로 목이나 허리를 움직이지 못할 때',
      '• 사고 후 다리를 전혀 못 쓸 때',
    ],
    lump: [
      '• 혹에서 피나 고름이 흘러나올 때',
      '• 하루 사이에 혹이 눈에 띄게 커질 때',
      '• 기존 혹 주변 피부가 갑자기 검게 변하거나 무너질 때',
    ],
    neurological: [
      '• 발작이 5분 이상 지속되거나 반복될 때 (군발 발작)',
      '• 발작 후 30분 이상 의식이 돌아오지 않을 때',
      '• 갑자기 한쪽 방향으로만 계속 돌 때 (전정 문제)',
    ],
    endocrine: [
      '• 갑자기 식욕이 완전히 없어지고 기운이 없을 때',
      '• 혈당이 매우 높거나 낮을 때 (당뇨 관리 중)',
      '• 쿠싱 약 복용 중 구토·식욕부진이 생길 때 (부신 위기 가능성)',
    ],
    skin: [
      '• 갑자기 전신에 두드러기가 퍼질 때 (알레르기 쇼크 의심)',
      '• 피부가 터지거나 깊이 감염돼 고름이 흐를 때',
    ],
    eye: [
      '• 눈이 갑자기 돌출되거나 크기가 달라 보일 때 (안구 탈출 의심)',
      '• 눈을 전혀 못 뜰 정도로 통증을 심하게 표현할 때',
      '• 갑자기 아무것도 보지 못하고 물체에 계속 부딪힐 때 (급성 실명)',
      '• 눈에서 피나 진한 고름이 흘러나올 때',
    ],
    ear: [
      '• 귀 통증이 심해 고개를 움직이지 못할 때',
      '• 갑자기 한쪽으로 쓰러지거나 빙빙 돌 때 (내이염·전정 증상)',
      '• 귀 주변 피부가 붉고 부어오르며 열감이 느껴질 때',
    ],
  }

  const extra: string[] = []
  for (const sys of systems) {
    extra.push(...(specific[sys] ?? []))
  }

  return [...common, ...extra]
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
  | 'cognitive_dysfunction'
  | 'general_behavior'

const BEHAVIOR_KW: Record<BehaviorType, string[]> = {
  separation_anxiety: ['분리불안', '혼자', '외출', '집을 망가', '문을 긁', '울어요', '짖어요', '짖고'],
  aggression: ['물어요', '물었어', '으르렁', '공격', '달려들', '사납게'],
  fear: ['숨어요', '숨어서', '떨어요', '무서워', '불안해', '겁을', '두려워'],
  compulsive: ['꼬리를 쫓', '계속 핥', '발을 핥', '강박', '반복적으로 도', '발을 깨물', '앞발을 핥', '뒷발을 핥', '발이 빨개', '발을 계속', '허공을 물', '꼬리를 물'],
  coprophagia: ['배변을 먹', '똥을 먹', '식분증', '이물질을 먹'],
  marking: ['마킹', '여기저기 오줌', '집안에서 오줌', '실내 배변', '소변 실수'],
  hyperactivity: ['너무 활발', '에너지가 넘', '산만', '가만히 못', '과잉행동'],
  cognitive_dysfunction: ['인지장애', '치매', '헛짖', '밤에 짖', '새벽에 짖', '멍하니', '멍때림', '길을 잃', '방향감각', '노령견', '노령 증상', '서클링', '빙빙 돌아요'],
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
    cognitive_dysfunction: '인지장애(치매)',
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
  cognitive_dysfunction: [
    {
      id: 'cog_symptom', system: 'general',
      text: '주로 어떤 증상이 보이나요?',
      options: ['밤에 이유 없이 짖거나 울어요', '멍하니 벽을 바라봐요', '집 안에서 길을 잃은 것 같아요', '익숙한 사람을 못 알아봐요'],
    },
    {
      id: 'cog_sleep', system: 'general',
      text: '수면 패턴이 달라졌나요?',
      options: ['낮에 많이 자고 밤에 활동해요 (낮밤 역전)', '잠을 거의 못 자요', '평소와 비슷해요', '잠만 자요'],
    },
    {
      id: 'cog_age', system: 'general',
      text: '나이가 어떻게 되나요?',
      options: ['7~10세', '11~13세', '14세 이상', '모르겠어요'],
    },
    {
      id: 'cog_other', system: 'general',
      text: '다른 신체 증상도 있나요?',
      options: ['없어요', '밥을 잘 안 먹어요', '소변 실수가 생겼어요', '뒷다리가 약해졌어요'],
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

// 행동 유형별 답변 중 방향을 바꿀 만큼 중요한 답변이 있으면 한 줄 덧붙인다.
function buildBehaviorNote(type: BehaviorType, answers: Record<string, string>): string[] {
  const notes: string[] = []
  if (type === 'separation_anxiety' && answers['sa_duration'] === '8시간 이상') {
    notes.push('', '💡 하루 8시간 이상 혼자 두는 상황이라면 행동 교정만으로는 한계가 있을 수 있어요. 도그워커나 데이케어 이용도 함께 고려해보세요.')
  }
  if (type === 'aggression' && answers['agg_change'] === '건강 문제가 있었어요') {
    notes.push('', '💡 최근 건강 문제 이후 공격성이 생겼다면 통증이 원인일 가능성이 높아요. 행동 교정 전에 반드시 신체 검진을 먼저 받아보세요.')
  }
  if (type === 'cognitive_dysfunction' && answers['cog_other'] && answers['cog_other'] !== '없어요') {
    notes.push('', `💡 "${answers['cog_other']}" 같은 신체 증상이 함께 있다면 인지장애만이 아니라 다른 질환(신장·관절 등)이 겹쳐 있을 수 있어요. 병원 검진을 미루지 마세요.`)
  }
  if (type === 'fear' && answers['fear_expr'] === '오줌/대변 실수를 해요') {
    notes.push('', '💡 극도의 두려움으로 배변 실수까지 한다면 스트레스 수준이 상당히 높은 상태예요. 자극을 줄이는 환경 조성이 우선이에요.')
  }
  if (type === 'compulsive' && answers['comp_freq'] === '거의 멈추지 않아요') {
    notes.push('', '💡 거의 멈추지 않는 수준이라면 의학적 원인이나 2차 피부 손상 가능성이 높아요. 행동 교정보다 병원 진료가 먼저예요.')
  }
  return notes
}

export function makeBehaviorResultMessage(
  type: BehaviorType,
  petName: string,
  questions?: Question[],
  answers?: Record<string, string>,
): string {
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
      '【먼저 의학적 원인을 배제해야 해요】',
      '임상 사례: "발을 깨물거나 핥는 행동의 1차 원인을 찾는 것이 중요해요. 가벼운 상처부터 호르몬 질환까지 원인이 매우 다양해요."',
      '',
      '【의학적 원인 (병원 확인 필요)】',
      '• 알레르기 (음식, 환경, 접촉성 피부염) → 피부 염증·발적 동반',
      '• 호르몬 질환 (갑상선기능저하, 쿠싱) → 피부감염·탈모 동반',
      '• 기생충 (벼룩·진드기·모낭충) → 눈에 안 보여도 감염 가능',
      '• 통증 (관절염, 고관절 이형성증) → 아픈 부위를 집중적으로 핥음',
      '',
      '【행동·심리 원인】',
      '• 지루함 또는 분리불안 → 심심하거나 보호자 없을 때 더 심함',
      '• 인간의 강박장애와 유사한 상태 → 상처가 있어도 멈추지 못함',
      '',
      '【2차 감염 예방이 시급해요】',
      '임상 사례: "근본 원인보다 먼저 2차 감염(피부궤양, 화농)이 생기지 않도록 관리하는 것이 중요해요."',
      '• 핥는 부위가 빨갛거나 상처·분비물이 있으면 넥카라 착용',
      '• 핥는 부위를 클로르헥시딘으로 소독 후 보습',
      '',
      '【개선 방법】',
      '• 충분한 운동과 정신적 자극 (노즈워크, 코 훈련)',
      '• 행동 시작 시 다른 활동으로 전환',
      '• 스트레스 원인(환경 변화 등) 파악 및 제거',
      '',
      '⚠️ 피부 손상이 생길 정도로 핥는다면 즉시 수의사 진료가 필요해요. 피부과 전문 진료를 먼저 받고 행동 교정을 병행하는 것이 효과적이에요.',
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
    cognitive_dysfunction: [
      `🧠 ${name}의 인지장애(노령견 치매) 증상에 대해 분석했어요`,
      '',
      '【인지장애란?】',
      '노령견 인지장애 증후군(CDS)은 뇌 노화로 인해 기억력·학습능력·방향감각·수면 패턴이 변하는 질환이에요. 사람의 알츠하이머와 유사해요.',
      '대표 증상: 밤 짖음 / 멍하니 있기 / 집 안에서 길 잃기 / 익숙한 사람을 못 알아보기 / 낮밤 역전',
      '',
      '【수의사 임상 사례의 조언】',
      '"치매는 삶의 관계와 방식을 잊어버리는 병이에요. 마치 이제 막 태어난 아기처럼 돌봐주세요. 그리고 보호자 자신도 우울해지지 않도록 마음 건강을 챙기는 게 중요해요."',
      '',
      '【집에서 할 수 있는 관리】',
      '• 가구 위치를 바꾸지 말고 환경을 일정하게 유지하기',
      '• 낮에 충분히 활동시켜 밤 수면 유도',
      '• 야간 짖음이 심하면 작은 조명을 켜두기 (방향감각 도움)',
      '• 소변 실수를 혼내지 말기 — 의도가 아닌 증상이에요',
      '• 규칙적인 식사와 산책 시간 유지',
      '',
      '【병원에서 확인할 것】',
      '• 갑상선 기능저하·신부전·당뇨 등 신체 질환 배제 (혈액검사)',
      '• 인지기능 보조제: 아니프릴(셀레길린), 오메가3, 항산화제',
      '• 영상 검사(MRI)로 뇌 구조 이상 확인 가능',
      '',
      '⚠️ 낮밤이 완전히 역전되거나 하루 종일 불안해하면 약물 치료 상담을 받으세요.',
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
  const base = messages[type]
  if (!questions || !answers || Object.keys(answers).length === 0) return base

  const summaryLines: string[] = ['', '【확인된 답변】']
  for (const q of questions) {
    const a = answers[q.id]
    if (a) summaryLines.push(`• ${a}`)
  }

  return [base, ...summaryLines, ...buildBehaviorNote(type, answers)].join('\n')
}

// ─── 대화형 오프너 & 질문 순서 조정 ─────────────────────────────────────────

const COMPLAINT_OPENERS: Array<{ keywords: string[]; opener: (name: string) => string }> = [
  {
    keywords: ['밥을 안', '밥 안', '먹지 않', '먹지않', '식욕', '사료를 안', '밥을 거부', '입맛'],
    opener: (name) => `${name}이(가) 밥을 잘 안 먹는다니 많이 걱정되셨겠어요. 언제부터 그런지, 다른 증상은 없는지 조금 더 여쭤볼게요.`,
  },
  {
    keywords: ['기침', '캑캑', '쌕쌕', '컹컹'],
    opener: (name) => `${name}이(가) 기침을 한다니 신경 쓰이셨겠어요. 어떤 상태인지 조금 더 파악해볼게요.`,
  },
  {
    keywords: ['구토', '토했', '토를', '토하', '토해'],
    opener: (name) => `${name}이(가) 토를 했군요. 어떤 상황인지 조금 더 여쭤볼게요.`,
  },
  {
    keywords: ['설사'],
    opener: (name) => `${name}의 설사 증상에 대해 조금 더 파악해볼게요.`,
  },
  {
    keywords: ['기생충', '충란', '기생충이'],
    opener: (name) => `${name}의 변에서 기생충이 발견됐군요. 많이 놀라셨겠어요. 몇 가지 더 여쭤볼게요.`,
  },
  {
    keywords: ['소변', '오줌', '혈뇨'],
    opener: (name) => `${name}의 소변 문제라면 빠르게 확인해보는 게 좋아요. 몇 가지 여쭤볼게요.`,
  },
  {
    keywords: ['기력', '기운', '축 처', '무기력', '힘이 없', '활기'],
    opener: (name) => `${name}이(가) 기운이 없다니 걱정되시겠어요. 어떤 상태인지 더 파악해볼게요.`,
  },
  {
    keywords: ['귀를 긁', '귀 긁', '귀에서', '귀 냄새', '머리를 흔'],
    opener: (name) => `귀 쪽이 불편한가 봐요. ${name}의 귀 상태를 조금 더 파악해볼게요.`,
  },
  {
    keywords: ['눈곱', '충혈', '눈을 비', '눈물', '눈이 뿌'],
    opener: (name) => `${name}의 눈 상태가 걱정되시는군요. 어떤 상태인지 더 자세히 여쭤볼게요.`,
  },
  {
    keywords: ['긁어', '긁고', '가려워', '가렵', '핥아', '핥고', '털이 빠', '탈모', '피부', '발진'],
    opener: (name) => `${name}이(가) 피부 쪽이 불편해 보이는군요. 어디를 긁는지, 어떻게 보이는지 조금 더 여쭤볼게요.`,
  },
  {
    keywords: ['절뚝', '다리를 절', '절름', '계단을 못', '다리를 들'],
    opener: (name) => `${name}이(가) 다리가 불편해 보이는군요. 어떤 다리인지, 언제 심해지는지 여쭤볼게요.`,
  },
  {
    keywords: ['입냄새', '구취', '잇몸', '치석', '이빨'],
    opener: (name) => `${name}의 구강 건강이 걱정되시는군요. 조금 더 여쭤볼게요.`,
  },
  {
    keywords: ['혹', '덩어리', '멍울', '종양'],
    opener: (name) => `${name}의 몸에서 혹을 발견하셨군요. 많이 놀라셨겠어요. 어떤 혹인지 조금 더 파악해볼게요.`,
  },
  {
    keywords: ['물을 많이', '물을 엄청', '체중이 줄', '살이 빠', '배가 볼록'],
    opener: (name) => `${name}의 몸에 변화가 생겼군요. 호르몬이나 대사 쪽 문제일 수 있어서 조금 더 여쭤볼게요.`,
  },
]

export function generateOpener(text: string, petName: string): string {
  const name = petName || '반려동물'

  // 복합 증상 조합을 개별 키워드보다 먼저 체크
  const hasVomit = ['구토', '토했', '토를', '토하', '토해'].some(kw => includesLiveKeyword(text, kw))
  const hasDiarrhea = includesLiveKeyword(text, '설사')
  if (hasVomit && hasDiarrhea) {
    return `${name}이(가) 구토와 설사를 동시에 하고 있군요. 두 증상이 함께 있으면 탈수가 빠르게 올 수 있어서 꼼꼼히 확인해볼게요.`
  }

  for (const { keywords, opener } of COMPLAINT_OPENERS) {
    if (keywords.some(kw => includesLiveKeyword(text, kw))) return opener(name)
  }
  return `${name}이(가) 그런 증상을 보이면 많이 걱정되셨겠어요. 상태를 자세히 파악할 수 있게 몇 가지 여쭤볼게요.`
}

const CHIEF_COMPLAINT_FIRST: Array<{ keywords: string[]; priorityId: string }> = [
  { keywords: ['밥을 안', '밥 안', '먹지 않', '먹지않', '식욕', '사료를 안', '입맛'], priorityId: 'dige_eat' },
  { keywords: ['구토', '토했', '토를'], priorityId: 'dige_freq' },
  { keywords: ['설사'], priorityId: 'dige_freq' },
  { keywords: ['소변을 못', '오줌을 못', '소변을 전혀'], priorityId: 'uri_output' },
  { keywords: ['기침', '캑캑'], priorityId: 'resp_effort' },
  { keywords: ['긁어', '긁고', '가려워', '핥아', '발바닥을 핥'], priorityId: 'skin_where' },
  { keywords: ['눈곱', '충혈', '눈을 비', '눈물'], priorityId: 'eye_look' },
  { keywords: ['귀를 긁', '귀 긁', '귀에서', '머리를 흔'], priorityId: 'ear_symptom' },
  { keywords: ['절뚝', '다리를 절', '다리를 들'], priorityId: 'ortho_leg' },
  { keywords: ['입냄새', '구취', '잇몸', '치석'], priorityId: 'dental_look' },
  { keywords: ['혹', '덩어리', '멍울'], priorityId: 'lump_where' },
  { keywords: ['물을 많이', '물을 엄청', '체중이 줄', '살이 빠', '배가 볼록'], priorityId: 'endo_symptom' },
]

export function reorderByChiefComplaint(text: string, questions: Question[]): Question[] {
  for (const { keywords, priorityId } of CHIEF_COMPLAINT_FIRST) {
    if (keywords.some(kw => includesLiveKeyword(text, kw))) {
      const idx = questions.findIndex(q => q.id === priorityId)
      if (idx > 0) {
        const reordered = [...questions]
        const [priority] = reordered.splice(idx, 1)
        reordered.unshift(priority)
        return reordered
      }
    }
  }
  return questions
}

// 결과 후 추가 질문 답변 (키워드 기반)
// 1868개의 고정 답변은 데이터가 커서(약 2MB) 번들에 그대로 넣으면 /chat 페이지의
// 클라이언트 JS가 크게 부풀어(측정 시 800KB+) 응급 상황에 급하게 여는 페이지 로딩이
// 느려진다. qa-db.json과 같은 방식으로 public JSON으로 분리해서 필요할 때만 불러온다.
type FollowUpHandler = { regex: RegExp; response: string }

let followUpHandlersCache: { handlers: FollowUpHandler[]; defaultResponse: string } | null = null
let followUpHandlersLoadPromise: Promise<{ handlers: FollowUpHandler[]; defaultResponse: string }> | null = null

async function loadFollowUpHandlers(): Promise<{ handlers: FollowUpHandler[]; defaultResponse: string }> {
  if (followUpHandlersCache) return followUpHandlersCache
  if (followUpHandlersLoadPromise) return followUpHandlersLoadPromise
  followUpHandlersLoadPromise = fetch('/followup-handlers.json')
    .then(r => r.json())
    .then((data: { handlers: { pattern: string; flags: string; response: string }[]; defaultResponse: string }) => {
      const handlers = data.handlers.map(h => ({ regex: new RegExp(h.pattern, h.flags), response: h.response }))
      const loaded = { handlers, defaultResponse: data.defaultResponse }
      followUpHandlersCache = loaded
      return loaded
    })
  return followUpHandlersLoadPromise
}

// 결과 화면 진입 시 미리 불러와두면, 사용자가 실제로 추가 질문을 입력했을 때
// fetch 대기 없이 바로 답할 수 있다.
export function preloadFollowUpHandlers(): void {
  loadFollowUpHandlers().catch(() => {})
}

// 트리거 패턴은 "포도 먹었" 처럼 단어 사이에 공백(\s*)만 있다고 가정하는데,
// 실제 문장은 "포도를 먹었는데"처럼 조사가 끼어 있는 경우가 훨씬 많아서 매칭이 안 됐다.
// 조사를 가볍게 제거한 버전도 함께 시도해서(원본 매칭 결과는 그대로 유지하면서) 매칭률을 높인다.
function stripParticlesForMatch(s: string): string {
  return s.replace(/([가-힣])(을|를|이|가|은|는|의|도)(?=\s|$)/g, '$1')
}

async function answerFollowUpRaw(text: string): Promise<string> {
  const { handlers, defaultResponse } = await loadFollowUpHandlers()
  const normalized = stripParticlesForMatch(text)
  let bestResponse: string | null = null
  let bestMatchLen = -1
  for (const h of handlers) {
    const m = h.regex.exec(text) ?? h.regex.exec(normalized)
    if (!m) continue
    if (m[0].length > bestMatchLen) {
      bestMatchLen = m[0].length
      bestResponse = h.response
    }
  }
  return bestResponse ?? defaultResponse
}


// 답변 맨 앞에 반려동물 이름을 넣은 공감 한 줄을 자연스럽게 얹어줘요
const EMPATHY_LEAD_INS: Array<(name: string) => string> = [
  (name) => `${name}이(가) 이런 증상을 보이면 많이 걱정되시죠. 관련 내용을 자세히 알려드릴게요.`,
  (name) => `${name} 때문에 마음이 편치 않으실 것 같아요. 하나씩 짚어드릴게요.`,
  (name) => `${name}을(를) 지켜보며 얼마나 신경 쓰이셨을지 알 것 같아요. 차근차근 설명드릴게요.`,
  (name) => `${name}이(가) 걱정되어 찾아보셨을 텐데, 도움이 될 만한 내용을 정리해드릴게요.`,
  (name) => `${name}의 상태가 궁금하실 텐데, 관련 정보를 꼼꼼히 안내해드릴게요.`,
  (name) => `이런 상황이면 ${name} 보호자님도 마음이 쓰이실 거예요. 참고하시면 좋을 내용이에요.`,
]

function hashText(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function personalizeAnswer(raw: string, petName?: string): string {
  if (!raw) return raw
  const name = petName?.trim() || '반려동물'
  const lines = raw.split('\n')
  if (lines.length === 0) return raw

  const leadIn = EMPATHY_LEAD_INS[hashText(lines[0]) % EMPATHY_LEAD_INS.length](name)
  const insertAt = lines[1] === '' ? 2 : 1
  const withLeadIn = [...lines]
  withLeadIn.splice(insertAt, 0, leadIn, '')
  return withLeadIn.join('\n')
}

// 결과 후 추가 질문 답변 — 반려동물 이름을 담은 공감 문장을 앞에 붙여서 안내해요
export async function answerFollowUp(text: string, petName?: string): Promise<string> {
  return personalizeAnswer(await answerFollowUpRaw(text), petName)
}
