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
const DENTAL_KW = ['입냄새', '구취', '이빨', '잇몸', '치석', '이를 못', '씹기', '치아', '이가 흔들', '입 안', '이빨이', '입에서 냄새']
const LUMP_KW = ['혹', '덩어리', '멍울', '종양', '부어올', '혹이', '만져져', '유선', '멍이', '혹을 발견', '뭔가 만져', '혹 같은', '자궁축농증', '비장', '음부에서 고름', '배가 딱딱하게']
const ENDOCRINE_KW = ['물을 많이', '물을 엄청', '다음증', '소변이 많', '체중이 줄', '살이 빠', '배가 볼록', '복부가 팽', '쿠싱', '당뇨', '갑상선', '물을 너무', '살이 너무 빠']

const EMERGENCY_KW = [
  '파랗', '청색', '보라색', '숨을 못', '경련', '발작', '의식 없', '쓰러', '소변을 전혀',
  '피가 많이', '다리가 마비', '뒷다리가 마비', '뒷다리를 못 써', '뒷다리를 전혀',
  '눈이 뒤로', '움직이지 못', '눈이 돌출', '다리를 전혀 못', '갑자기 못 걸어',
  '혹이 터졌', '눈이 빠져',
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
      urgencySignals: ['오늘 갑자기 시작됐어요'],
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
      urgencySignals: ['오늘부터예요', '어제부터예요'],
    },
  ],
  digestive: [
    {
      id: 'dige_onset',
      system: 'digestive',
      text: '증상이 언제부터 시작됐나요?',
      options: ['오늘 갑자기 시작됐어요', '어제부터예요', '2~3일 됐어요', '1주일 이상이에요'],
      urgencySignals: ['오늘 갑자기 시작됐어요'],
    },
    {
      id: 'dige_freq',
      system: 'digestive',
      text: '구토나 설사를 얼마나 자주 하나요?',
      options: ['한 번만 했어요', '하루 1~2회', '하루 3~5회', '하루 6회 이상'],
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
      urgencySignals: ['오늘 갑자기 생겼어요'],
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
      urgencySignals: ['오늘 갑자기'],
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
    // 주 증상은 전체 질문, 부가 증상은 최대 6개 (기존 3개에서 확대)
    const limit = sys === primary ? Infinity : 6
    for (const q of QUESTION_BANKS[sys].slice(0, limit)) {
      if (!seen.has(q.id)) { seen.add(q.id); questions.push(q) }
    }
  }

  // 일반 질문은 항상 뒤에 4개 추가
  for (const q of QUESTION_BANKS.general.slice(0, 4)) {
    if (!seen.has(q.id)) { seen.add(q.id); questions.push(q) }
  }

  // 구토 + 설사 동시: 탈수 체크 질문을 맨 앞에
  if (symptomText && systems.includes('digestive')) {
    const hasVomit = ['구토', '토했', '토를', '토해'].some(kw => symptomText.includes(kw))
    const hasDiarrhea = symptomText.includes('설사')
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
  // urgencySignals 누적 체크 (2개 이상이면 emergency)
  let urgencyCount = 0
  for (const q of questions) {
    const ans = answers[q.id]
    if (ans && q.urgencySignals?.includes(ans)) urgencyCount++
  }
  if (urgencyCount >= 2) return 'emergency'
  if (urgencyCount === 1) return 'caution'

  // 혈변/혈토/복부 통증/흑색변/고열 등은 emergency 수준으로 상향
  const emergencyFromAnswers = [
    '구토에 피가 보여요', '대변에 피가 섞여요',
    '검은색이에요 (타르 같아요)',
    '많이 아파해요', '배가 빵빵하게 부풀어 있어요',
    '하루 6회 이상',
    '거의 움직이지 않아요', '쓰러져 있어요',
    '쓰러지거나 일어나지 못해요',
    '뜨겁게 느껴져요',
  ]
  if (Object.values(answers).some(a => emergencyFromAnswers.includes(a))) return 'emergency'

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

    // 원인에 따른 구체적 응급 안내
    if (ans['dige_blood'] === '구토에 피가 보여요' || ans['dige_stool_color'] === '검은색이에요 (타르 같아요)') {
      emergLines.push('[주요 소견] 상부 소화관 출혈 가능성 — 혈액검사 + 위장관 초음파/내시경 필요')
    } else if (ans['dige_blood'] === '대변에 피가 섞여요') {
      emergLines.push('[주요 소견] 하부 소화관 출혈 가능성 — 신체검사 + 혈액검사 + 대장 평가 필요')
    } else if (ans['dige_abdomen'] === '배가 빵빵하게 부풀어 있어요') {
      emergLines.push('[주요 소견] 복부 팽창 — 위확장·염전(GDV) 또는 복수 가능성 배제 필요')
    } else if (ans['dige_fever'] === '뜨겁게 느껴져요') {
      emergLines.push('[주요 소견] 발열 + 소화기 증상 — 감염성 장염(파보 포함) 가능성 확인 필요')
    } else if (ans['resp_gum'] === '파랗거나 보라색이에요') {
      emergLines.push('[주요 소견] 청색증 — 산소 공급 저하 상태. 산소 치료가 즉시 필요해요.')
    }

    emergLines.push('', '이동 중에는:')
    emergLines.push('• 조용하고 따뜻하게 유지해주세요')
    emergLines.push('• 억지로 먹이거나 마시게 하지 마세요')
    emergLines.push('• 전화로 미리 병원에 도착 시간을 알려주세요')
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
    const eat = ans['dige_eat']
    const onset = ans['dige_onset']
    const vitality = ans['dige_vitality']
    const fever = ans['dige_fever']

    // 구토 패턴 분석
    if (vomitTiming === '빈속에(공복에) 토해요') {
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
      lines.push('  → babungee: "IBD는 질병이 아니라 증후군이에요. 췌장염과 동반되는 경우가 많아 복합 검사(내시경 + 조직 생검)가 필요해요."')
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

    // 만성 구토 패턴 — babungee: 체중 감소 + 만성 구토 = 기저 질환 신호
    if (onset === '1주일 이상이에요' && (vitality === '많이 축 처지고 무기력해요' || eat === '거의 안 먹어요')) {
      lines.push('• 만성 구토 + 무기력/식욕부진: babungee 원칙 — "만성 구토는 기저 질환(신부전, 심부전, 종양)의 신호일 수 있어요. 단순 위장약으로 덮기 전에 기저 원인 검사가 우선이에요."')
    }

    if (cause === '뭔가를 삼켰을 수 있어요') {
      lines.push('• 이물 섭취 가능성: 방사선 촬영으로 이물 위치 및 장 폐색 여부 확인이 필요해요.')
    }
    if (freq === '하루 3~5회' && (eat === '거의 안 먹어요' || eat === '아무것도 안 먹어요')) {
      lines.push('• 잦은 구토/설사 + 식욕 저하: 급성 위장염 가능성이 높아요.')
    }
    if (onset === '오늘 갑자기 시작됐어요') {
      lines.push('• 급성 발병: 식이성 원인, 이물, 감염 등을 감별해야 해요.')
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
      lines.push('  → babungee: "기관지 협착은 저절로 좋아지지 않아요. 심해지면 기침보다 호흡 장애가 먼저 와요. 수면 중 호흡수 체크가 중요해요."')
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
      lines.push('  → babungee 원칙: "CRE랑 고혈압 먼저 — BUN은 나중"')
    }
  }

  if (systems.includes('neurological')) {
    const type = ans['neuro_type']
    const duration = ans['neuro_duration']
    const after = ans['neuro_after']
    const first = ans['neuro_first']
    const meds = ans['neuro_meds']

    if (type === '한쪽으로 기울거나 빙빙 돌아요 (전정)') {
      lines.push('• 전정 증상 (머리 기울기, 안구진탕, 빙빙 돌기): 말초성(내이 문제) 또는 중추성(뇌 문제) 전정 질환 감별이 필요해요.')
      lines.push('  → 안구진탕 방향이 빠른 면: 말초성이면 1~2주 내 자연 개선 가능, 중추성이면 MRI 필요.')
      lines.push('• babungee 원칙 — 머리 기울어짐 검사 순서:')
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
    if (meds === '항경련제 복용 중이에요') {
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

    lines.push('• babungee 원칙: 디스크든 슬개골이든 정형외과 질환의 기본은 방사선 촬영이에요. 보충제(관절 영양제)만으로 관절염이 개선되거나 진행이 멈추지는 않아요.')

    if (leg === '뒷다리 한쪽' && onset === '서서히 심해졌어요') {
      lines.push('• 뒷다리 점진적 파행: 슬개골 탈구(소형견 특히 많음) 또는 고관절 이형성 가능성이에요. 방사선으로 단계 확인이 먼저예요.')
    }
    if (leg === '다리보다 허리·등이 문제인 것 같아요') {
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
    if (onset === '다쳤어요 (낙하·사고)') {
      lines.push('• 외상: 골절 및 인대 파열 여부를 방사선으로 즉시 확인해야 해요. 내부 출혈 가능성도 배제가 필요해요.')
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
    lines.push('• babungee 원칙: 혹이 발견되면 크기나 느낌에 관계없이 세침흡인세포검사(FNA)를 먼저 받는 것을 강력히 권장해요.')
  }

  if (systems.includes('endocrine')) {
    const symptom = ans['endo_symptom']
    const weightPeriod = ans['endo_weight_period']
    const appetite = ans['endo_appetite']
    const urine = ans['endo_urine']
    const other = ans['endo_other']

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
    if (other === '복부가 팽창했어요') {
      lines.push('• 복부 팽창: 쿠싱 또는 복강 내 액체 축적 가능성 — 초음파 검사 권장.')
    }
  }

  if (systems.includes('dental')) {
    const look = ans['dental_look']
    const eat = ans['dental_eat']
    const gumColor = ans['dental_gum_color']
    const mouthOpen = ans['dental_mouth_open']
    const duration = ans['dental_duration']
    const systemic = ans['dental_systemic']

    if (look === '이빨이 흔들려요') {
      lines.push('• 동요치(흔들리는 이빨): 치주 질환 말기 또는 외상 — 발치가 필요한 경우가 많아요.')
    }
    if (mouthOpen === '코나 눈 아래가 부어있어요') {
      lines.push('• 얼굴 부종(코·눈 아래): 치근 농양이 주변으로 퍼진 가능성 — 즉시 진료 필요. 항생제 + 발치 치료가 필요해요.')
    }
    if (mouthOpen === '턱 아래나 뺨이 부어있어요') {
      lines.push('• 턱·뺨 부종: 치근 주위 농양 가능성 — 치과 방사선 촬영으로 확인 필요.')
    }
    if (duration === '무마취 스케일링만 받았어요') {
      lines.push('• 무마취 스케일링: 치아 표면만 청소하며 잇몸 아래 치주 병변은 확인·치료가 불가능해요. 전신마취 하의 정식 치과 처치가 필요해요.')
    }
    if (eat === '밥 먹기 힘들어해요' || eat === '한쪽으로만 씹어요') {
      lines.push('• 식이 영향 동반: 구강 통증이 식욕에 영향을 주고 있어요. 치과 치료 후 개선되는 경우가 많아요.')
    }
    if (systemic === '심장병이 있어요' || systemic === '신부전이 있어요' || systemic === '둘 다 있어요') {
      lines.push('• 기저 질환 + 치과 질환: 치주 질환은 심장병·신부전을 악화시킬 수 있어요. 국소마취 병행으로 전신마취 부담을 줄이는 방법을 담당의와 상의하세요.')
    }
    lines.push('• babungee 원칙: 육안 검사만으로는 치과 진단이 불완전해요. 치과 방사선 촬영(전신마취 하)이 필수예요.')
    lines.push('  → "치아 방사선 사진을 찍는 병원이 아니라면 일단 믿고 거르시길 바랍니다." — babungee')
    lines.push('• 습식 vs 건식 사료: babungee: "치석은 음식 종류보다 음식 형태가 더 중요해요. 이빨 사이에 음식물이 남는 것이 치주 질환의 핵심 원인이에요."')
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
    if (look === '오래됐는데 점점 심해져요' || onset === '오래됐는데 점점 심해져요') {
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
    if (behave === '계속 감고 있어요') {
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

  // 심장 + 신장 동반 감지 — babungee의 심장-신장 악순환 원칙
  if (systems.includes('respiratory') && systems.includes('urinary')) {
    lines.push('⚠️ 심장+신장 복합 주의: 심장약(이뇨제·혈관확장제)은 심장에 도움이 되지만 신장 혈류를 줄여 신장에 부담을 줄 수 있어요.')
    lines.push('  → babungee 원칙: "심장을 위한 약이 신장에 해롭다고 약을 끊으면 안 돼요. 두 장기의 균형을 전문의와 함께 조율해야 해요."')
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
    lines.push('▶ 발작이 일어나는 동안: 억지로 잡거나 입안에 손을 넣지 마세요. 주변 위험물만 치워주세요.')
    lines.push('▶ 발작이 5분 이상 지속되면 즉시 응급 병원으로 이동하세요.')
    lines.push('▶ 다음 발작 시 스마트폰으로 영상 촬영 — 병원 진단에 매우 중요해요.')
    if (ans['neuro_meds'] === '항경련제 복용 중이에요') {
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
    if (look === '눈이 부어있거나 돌출됐어요' || pain === '많이 아파해요 (피해요)' || behave === '계속 감고 있어요') {
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
    if (ans['dige_cause'] === '뭔가를 삼켰을 수 있어요') info.push('삼켰을 가능성이 있는 물건 종류')
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
    if (ans['ortho_onset'] === '갑자기 못 쓰게 됐어요' || ans['ortho_leg'] === '다리보다 허리·등이 문제인 것 같아요') {
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
    if (ans['neuro_meds'] === '항경련제 복용 중이에요') {
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
      '【먼저 의학적 원인을 배제해야 해요】',
      'babungee: "발을 깨물거나 핥는 행동의 1차 원인을 찾는 것이 중요해요. 가벼운 상처부터 호르몬 질환까지 원인이 매우 다양해요."',
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
      'babungee: "근본 원인보다 먼저 2차 감염(피부궤양, 화농)이 생기지 않도록 관리하는 것이 중요해요."',
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
      '【수의사 babungee의 조언】',
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
  return messages[type]
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
    keywords: ['구토', '토했', '토를'],
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
    keywords: ['기력', '축 처', '무기력', '힘이 없', '활기'],
    opener: (name) => `${name}이(가) 기력이 없다니 걱정되시겠어요. 어떤 상태인지 더 파악해볼게요.`,
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
  const hasVomit = ['구토', '토했', '토를', '토해'].some(kw => text.includes(kw))
  const hasDiarrhea = text.includes('설사')
  if (hasVomit && hasDiarrhea) {
    return `${name}이(가) 구토와 설사를 동시에 하고 있군요. 두 증상이 함께 있으면 탈수가 빠르게 올 수 있어서 꼼꼼히 확인해볼게요.`
  }

  for (const { keywords, opener } of COMPLAINT_OPENERS) {
    if (keywords.some(kw => text.includes(kw))) return opener(name)
  }
  return `${name}의 증상을 조금 더 파악해볼게요. 몇 가지 여쭤볼게요.`
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
    if (keywords.some(kw => text.includes(kw))) {
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
export function answerFollowUp(text: string): string {
  if (/타이레놀|아스피린|이부프로펜|인간\s*약|사람\s*약|진통제/.test(text)) {
    return [
      '⚠️ 절대 사람용 약을 주지 마세요!',
      '',
      '타이레놀(아세트아미노펜), 아스피린, 이부프로펜은 반려동물에게 심각한 독성을 일으켜요. 특히 고양이에게는 소량으로도 치명적이에요.',
      '통증이 의심되면 반드시 수의사에게 처방받은 동물용 약만 사용하세요.',
    ].join('\n')
  }

  if (/기생충|구충약|구충제|심장사상충약|벼룩약|진드기약/.test(text)) {
    return [
      '🐛 기생충 관련 안내',
      '',
      '【대변에서 기생충이 발견됐다면】',
      '반드시 수의사에게 검사 및 처방을 받아야 해요. 기생충 종류에 따라 필요한 약이 다르기 때문에 임의로 판단하면 안 돼요.',
      '',
      '【기생충 종류에 따른 대응】',
      '• 회충·구충: 처방받은 구충제 복용 필요',
      '• 촌충(편충): 특정 구충제만 효과 있어서 반드시 수의사 처방 필요',
      '• 콕시듐·지아르디아: 항원충제 처방 필요 (일반 구충제 효과 없음)',
      '',
      '【집에서 절대 하지 말아야 할 것】',
      '• 사람용 구충제 먹이기 (독성 위험)',
      '• 약국에서 산 구충제를 수의사 확인 없이 주기',
      '',
      '⚠️ 기생충이 확인됐다면 지켜보지 말고 병원에 가세요. 기생충은 스스로 없어지지 않아요.',
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

  if (/심장약|피모벤단|라식스|이뇨제|아피나|베탁솔|아테놀롤|포르테코르|실데나필/.test(text)) {
    return [
      '💊 심장약 복용 안내',
      '',
      '【심장약은 임의로 중단하지 마세요】',
      '피모벤단(베트메딘), 이뇨제(라식스), 혈압약 등 심장약은 의사 지시 없이 줄이거나 끊으면 폐수종이 급격히 재발할 수 있어요.',
      '',
      '【복용 중 주의사항】',
      '• 매일 정해진 시간에 규칙적으로 복용',
      '• 심장약 + 이뇨제를 함께 먹는 경우 수분·전해질 변화 주의',
      '• 식욕이 갑자기 없어지거나 기력이 크게 떨어지면 즉시 병원',
      '',
      '【모니터링 핵심 — babungee 원칙】',
      '• 수면 중 호흡수를 매일 같은 시간에 측정하세요 (정상: 분당 30회 이하)',
      '• 30회 초과 → 2일 연속이면 병원, 40회 이상이면 즉시 응급',
    ].join('\n')
  }

  if (/스테로이드|프레드니솔론|덱사메타손|스테로이드를\s*끊|스테로이드\s*부작용/.test(text)) {
    return [
      '💊 스테로이드 관련 안내',
      '',
      '【스테로이드는 절대 갑자기 끊으면 안 돼요】',
      '장기 복용 후 갑작스럽게 중단하면 부신이 코르티솔을 못 만들어 부신 위기가 올 수 있어요. 반드시 수의사 지시에 따라 점진적으로 줄여야 해요.',
      '',
      '【흔한 부작용】',
      '• 식욕 과다 증가 (특히 고용량)',
      '• 음수량·소변량 증가 (일시적)',
      '• 장기 복용 시 쿠싱 유사 증상 (복부 팽창, 탈모)',
      '• 간 수치 상승 (ALKP 증가)',
      '',
      '【병원 방문이 필요한 경우】',
      '스테로이드 복용 중에 구토·식욕부진이 새로 생기거나, 갑자기 많이 처지면 즉시 수의사와 상의하세요.',
    ].join('\n')
  }

  if (/항경련제|페노바르비탈|포타슘브로마이드|KBr|간닐|졸로프트|가바펜틴|발작약/.test(text)) {
    return [
      '💊 항경련제(발작약) 관련 안내',
      '',
      '【항경련제는 임의로 중단·감량하지 마세요】',
      '갑자기 끊으면 반동 발작(리바운드 발작)이 더 심하게 올 수 있어요. 용량 변경은 반드시 혈중 약물 농도 검사 후 수의사가 결정해요.',
      '',
      '【부작용이 생겼을 때】',
      '• 페노바르비탈: 처음 2~4주간 졸림·비틀거림은 정상 적응 반응이에요',
      '• 4주 후에도 비틀거리거나 뒷다리 약화가 지속되면 재검사 필요',
      '• KBr: 다리가 굳는 느낌(브롬 중독)이 생기면 수의사에게 즉시 알리세요',
      '',
      '【모니터링】',
      '혈중 농도 검사는 보통 투약 후 3개월 시점이 기준이에요. 재발 없이 안정적이어도 정기 혈액 검사는 필요해요.',
    ].join('\n')
  }

  if (/신부전|CRE|SDMA|크레아티닌|신장약|아조딜|인제어|신장\s*관리|콩팥/.test(text)) {
    return [
      '🫘 신부전(만성 신장 질환) 관리 안내',
      '',
      '【핵심 모니터링 지표 — babungee 원칙】',
      '"CRE(크레아티닌)랑 고혈압 먼저 확인 — BUN은 나중"',
      '• CRE: 신기능의 직접 지표 (개 정상: 0.5~1.5 mg/dL)',
      '• SDMA: CRE보다 민감한 조기 지표 (14 이하 정상)',
      '• BUN: 단백질 섭취·탈수에도 영향받아 단독으론 판단 어려움',
      '',
      '【집에서 관리할 것】',
      '• 신선한 물을 항상 풍부하게 제공 (습식 사료도 도움)',
      '• 하루 음수량·소변량을 ml로 기록',
      '• 고인(高燐) 음식 피하기: 내장류, 뼈, 유제품',
      '• 처방 신장 사료 유지',
      '',
      '【즉시 병원 가야 할 신호】',
      '• 갑자기 밥을 전혀 안 먹을 때',
      '• 소변이 하루에 거의 나오지 않을 때 (핍뇨/무뇨)',
      '• 구토가 하루 3회 이상 생길 때',
    ].join('\n')
  }

  if (/인지장애|치매|밤에\s*짖|새벽에\s*짖|노령견\s*증상|서클링|멍하니/.test(text)) {
    return [
      '🧠 노령견 인지장애(치매) 관리 안내',
      '',
      '【수의사 babungee의 조언】',
      '"치매 강아지는 이제 막 태어난 아기처럼 돌봐주세요. 보호자 자신도 우울해지지 않도록 마음 건강을 챙기는 게 중요해요."',
      '',
      '【야간 짖음 대처법】',
      '• 낮에 충분한 활동으로 에너지 소모',
      '• 자기 전 짧은 산책',
      '• 약한 조명을 켜두기 (방향감각 도움)',
      '• 심하면 수의사에게 약물(메라토닌, 셀레길린) 상담',
      '',
      '【잠자리 전 서클링(빙빙 돌기)】',
      '노령견이 자기 전에 빙빙 도는 것은 자연스러운 본능 행동이에요. 전정 증상이나 인지장애 서클링과는 구별이 필요해요.',
      '→ 걷다가 갑자기 도는 것: 전정 문제 가능성',
      '→ 자기 전에만 도는 것: 정상 행동일 가능성이 높아요',
      '',
      '【병원에서 확인할 것】',
      '혈액검사(갑상선, 신장, 혈당)로 신체 질환 먼저 배제 후 인지장애 진단해요.',
    ].join('\n')
  }

  if (/자궁축농증|pyometra|자궁에\s*고름|음부에서\s*분비|자궁이\s*부어/.test(text)) {
    return [
      '🔴 자궁축농증(Pyometra) 안내',
      '',
      '【자궁축농증이란?】',
      '자궁에 세균이 감염되어 고름이 차는 질환이에요. 중성화 수술을 하지 않은 암컷에서 발생하며, 생리 후 4~8주 내에 자주 나타나요.',
      '',
      '【증상】',
      '• 음부에서 고름/분비물 (개방성)',
      '• 갑자기 많이 마시고 소변이 많아짐',
      '• 복부 팽창, 식욕부진, 기력 저하',
      '• 폐쇄성(분비물 없음)은 진단이 더 어렵고 더 위험해요',
      '',
      '【치료】',
      '• 수술적 절제(자궁난소 적출)가 가장 확실한 치료예요',
      '• 번식을 유지해야 하는 경우 비수술적 호르몬 치료 옵션도 있어요 (전문의 상담 필수)',
      '',
      '⚠️ 자궁축농증은 빠르게 패혈증으로 진행될 수 있어요. 의심 증상이 있으면 즉시 병원에 가세요.',
    ].join('\n')
  }

  if (/IBD|염증성\s*장\s*질환|만성\s*장염|과민성\s*장/.test(text)) {
    return [
      '🫁 IBD(염증성 장 질환) 안내',
      '',
      '【IBD란?】',
      'babungee: "IBD는 질병이 아니라 증후군이에요." 장 점막에 만성 염증이 지속되는 상태로, 구토·설사·체중 감소가 반복되는 것이 특징이에요.',
      '',
      '【특징적인 패턴】',
      '• 수주~수개월에 걸쳐 반복되는 구토·설사',
      '• 반응성 나쁜 식욕부진',
      '• 체중 감소 동반',
      '• 만성 췌장염과 동반되는 경우 많음 (삼중 질환: IBD + 췌장염 + 담관염)',
      '',
      '【진단】',
      '• 혈액검사 + 복부 초음파 (장벽 두께 측정)',
      '• 확진: 내시경 + 조직 생검 (가장 정확)',
      '',
      '【관리】',
      '• 단백질 가수분해 처방 사료 또는 신단백질 식이',
      '• 필요 시 스테로이드 + 면역억제제',
      '• 영구 관리가 필요한 만성 질환이에요',
    ].join('\n')
  }

  if (/빈혈|혈소판|IMHA|ITP|면역매개|헤마토크리트|PCV/.test(text)) {
    return [
      '🩸 빈혈/혈소판감소증 안내',
      '',
      '【잇몸 모세혈관 충전 시간(CRT) 확인법】',
      '잇몸을 손가락으로 살짝 누른 후 붉은 색으로 돌아오는 시간을 재세요.',
      '• 2초 이내: 정상',
      '• 2초 이상: 순환 저하 또는 빈혈 신호 → 빨리 병원에 가세요',
      '',
      '【면역매개성 빈혈(IMHA)의 경우】',
      '• 스테로이드 + 필요 시 면역억제제가 1차 치료예요',
      '• 수혈이 필요한 경우 급격히 악화될 수 있어요',
      '',
      '【혈소판감소증(ITP)의 경우】',
      '• 면역매개성이면 혈소판이 반감기가 짧아 가장 먼저 영향받아요',
      '• 스테로이드가 우선 처방이에요',
      '',
      '⚠️ 잇몸이 하얗거나 창백하고 기력이 없으면 즉시 병원에 가세요.',
    ].join('\n')
  }

  if (/고혈압|혈압.*높|혈압\s*수치|암로디핀|amlodipine|에날라프릴|enalapril|수축기\s*혈압/.test(text)) {
    return [
      '💉 고혈압(전신 고혈압) 안내',
      '',
      '【동물에서 고혈압의 주요 원인】',
      '• 신부전 (가장 흔함) — CRE 상승과 함께 혈압 관리가 핵심이에요',
      '• 갑상선 기능항진증 (고양이) — 빈맥 동반',
      '• 쿠싱 증후군 (부신피질기능항진증)',
      '• 당뇨',
      '',
      '【혈압 기준 (개/고양이)】',
      '• 정상: 수축기 <160mmHg',
      '• 주의: 160~179mmHg',
      '• 위험: ≥180mmHg → 즉시 치료 필요 (망막 출혈·박리 위험)',
      '',
      '【고혈압과 신장·눈 합병증】',
      '• 고혈압성 망막 박리: 갑자기 시력 잃음 → 즉시 병원',
      '• 신장 혈관 압력 증가 → 신장 기능 악화 악순환',
      '',
      '【치료약】',
      '• 암로디핀 (칼슘 채널 차단제): 고양이 1차 선택약, 개에서도 사용',
      '• 에날라프릴/베나실 (ACE 억제제): 단백뇨 동반 시 신장 보호 효과',
      '• 두 약을 병용하는 경우도 있어요',
      '',
      '⚠️ 혈압은 집에서 측정하기 어렵기 때문에 정기 병원 측정이 필요해요. 신부전 관리 중이라면 3개월마다 혈압 체크를 권장해요.',
    ].join('\n')
  }

  if (/부정맥|arrhythmia|심전도|홀터|holter|미주신경|빈맥|서맥/.test(text)) {
    return [
      '❤️ 부정맥 안내',
      '',
      '【부정맥이란?】',
      '심장 박동이 불규칙하거나 너무 빠르거나(빈맥) 너무 느린(서맥) 상태예요.',
      '',
      '【원인 분류 (babungee)】',
      '▶ 심장성 원인:',
      '• 확장성/비대성 심근병증',
      '• 승모판 폐쇄부전 (판막 누출)',
      '• 선천성 심장 결함',
      '',
      '▶ 비심장성 원인:',
      '• 위 팽창·뒤집힘(GDV), 췌장염',
      '• 빈혈, 저혈당, 전해질 이상(저마그네슘혈증)',
      '• 신경계 질환, 내분비 질환(갑상선, 부신)',
      '• 약물·독소 중독',
      '',
      '【진단】',
      '• 심전도(ECG): 부정맥 유형 분류 필수',
      '• 홀터 모니터: 24시간 기록 — 간헐적 부정맥 포착에 중요',
      '• 심장 초음파: 구조적 이상 확인',
      '• 미주신경성 부정맥: 심장 자체보다는 미주신경 과활성 → 예후 비교적 좋음',
      '',
      '【치료 목표】',
      '• 부정맥 자체 치료와 원인 질환 치료를 병행해야 해요',
      '• 수술이 필요한 경우 부정맥이 있으면 마취 위험도가 올라가요 — 마취과 전문의와 사전 상의 필요',
      '',
      '⚠️ 실신(기절)이 동반된 부정맥은 즉시 응급 심전도 검사가 필요해요.',
    ].join('\n')
  }

  if (/담낭|담석|담즙|gallbladder|담관|담낭\s*슬러지|담낭\s*질환|ALT|AST|ALP|간수치|간\s*질환/.test(text)) {
    return [
      '🫙 담낭/간 질환 안내',
      '',
      '【담낭 슬러지 vs 담석 구별】',
      'babungee: "담석인지, 담낭벽 비후인지, 담낭 슬러지 흡착인지 구별이 필요해요."',
      '• 슬러지: 중력에 따라 위치가 바뀌는 게 보이면 슬러지예요',
      '• 담석: 중력을 거슬러 위에 붙어 있으면 진짜 담석 가능성이 높아요',
      '',
      '【잘못된 상식 교정】',
      'babungee: "담낭 담즙 정체는 지방을 공급하지 않아야 해결되는 것이 아닙니다. 적절한 지방 제공은 담즙의 정상 분비를 원활하게 해줘요."',
      '• 저지방 사료가 항상 정답이 아니에요 — 담당의와 상의하세요',
      '• babungee: "어떠한 사료·보조제도 이미 생긴 담석을 녹이기는 어려워요."',
      '',
      '【간수치(ALT·AST·ALP) 해석】',
      '• ALT/AST 상승: 간세포 손상 신호 — 원인(지방간, 염증, 종양, 약물)을 찾아야 해요',
      '• ALP(ALKP) 상승: 담즙 정체 또는 쿠싱 신호일 수 있어요',
      '• GGT 상승: 담즙 정체 또는 담관세포 염증을 시사해요',
      '',
      '【담낭 점액류(담낭염)의 경우】',
      '• 내과적 치료로 안정화 후 수술 시기를 논의해요',
      '• 담낭이 파열되기 전 수술이 예후가 훨씬 좋아요',
      '',
      '⚠️ 황달(잇몸·흰자위가 노랗게 변함), 구토+식욕부진+복통이 동반되면 즉시 병원에 가세요.',
    ].join('\n')
  }

  if (/비만세포종|MCT|mast cell|비만\s*세포/.test(text)) {
    return [
      '🔬 비만세포종(MCT, Mast Cell Tumor) 안내',
      '',
      '【특징】',
      '• 개에서 가장 흔한 피부 종양 중 하나예요',
      '• 피부에 생기는 경우가 많지만 장기(비장, 장)에도 발생 가능해요',
      '• 겉모습만으로는 다른 종양과 구별하기 어려워요 → FNA(세침흡인세포검사) 필수',
      '',
      '【주의: 탈과립 반응】',
      '• 비만세포종을 건드리거나 자극하면 히스타민이 분비(탈과립)되어 갑자기 빨개지거나 부을 수 있어요',
      '• 심한 경우 위궤양, 저혈압, 쇼크까지 가능 → 건드리지 말고 바로 병원에 가세요',
      '',
      '【등급(Grade)】',
      '• 저등급: 수술로 완전 절제 시 예후가 좋아요',
      '• 고등급: 전이 가능성이 높아 항암 치료 병행이 필요해요',
      '',
      '【치료】',
      '• 1차: 수술적 절제 (충분한 마진 확보가 핵심)',
      '• 스테로이드(GC): 수술 전 종양 축소 또는 수술 불가 시 단독 치료 — 반응률 20~70%',
      '• 수술 전 GC 사용 시 종양이 사라질 수 있으므로 반드시 종양 위치를 미리 표시해두세요',
      '',
      '⚠️ FNA 없이 비만세포종이라고 단정 짓는 것은 위험해요 — 다른 종양일 수 있어요.',
    ].join('\n')
  }

  if (/쿠싱|부신피질기능항진|쿠싱증후군|트릴로스탄|베토릴|LDDST|쿠싱약/.test(text)) {
    return [
      '🔬 쿠싱 증후군(부신피질기능항진증) 안내',
      '',
      '【증상 특징】',
      '• 물을 엄청 많이 마시고 소변량 증가 (다음다뇨)',
      '• 배만 볼록하게 나옴 (복부 팽창, 간 비대)',
      '• 탈모 + 피부가 얇아지고 검게 변함',
      '• 식욕 과다, 헐떡거림, 근육 약화',
      '',
      '【진단】',
      '• babungee: "쿠싱을 확진하는 단일 검사는 없다고 차라리 믿는 것이 좋아요."',
      '• 기본: 혈액검사 (ALKP 상승이 특징적), 소변 검사 (비중 저하)',
      '• 확진: LDDST(저용량 덱사메타손 억제 검사) — 가장 권장되는 검사예요',
      '• 부신 초음파: 크기로 PDH(뇌하수체성) vs ADH(부신성) 감별',
      '',
      '【치료】',
      '• 1차 약: 트릴로스탄(베토릴) — FDA 유일 승인 약물',
      '• 쿠싱약 복용 중 갑자기 축 처지고 식욕부진 → 부신 위기 가능, 즉시 병원 방문',
      '',
      '【주의】',
      '• 스테로이드 장기 복용으로 인한 "의인성 쿠싱"도 있어요 — 스테로이드를 임의로 끊으면 안 돼요',
      '• 갑상선기능저하증과 증상이 겹치므로 T4 수치도 함께 확인해요',
    ].join('\n')
  }

  if (/폐고혈압|실데나필|타다라필|PH\b|폐혈압|폐동맥고혈압/.test(text)) {
    return [
      '🫁 폐고혈압(Pulmonary Hypertension) 안내',
      '',
      '【폐고혈압이란?】',
      'babungee: "폐고혈압은 증상이지 원인이 아닙니다." 폐 혈관 저항이 높아져 심장에 과부하가 걸리는 상태예요.',
      '',
      '【원인】',
      '• 심장 질환(승모판 폐쇄부전 등) — 가장 흔함',
      '• 기관지 질환(만성 기관지염, 기관지 협착)',
      '• 사상충 감염',
      '• 혈전 등',
      '',
      '【증상】',
      '• 실신(기절) — babungee: "실신의 가장 흔한 원인은 부정맥과 폐고혈압이에요"',
      '• 호흡 곤란, 헐떡거림',
      '• 기침, 운동 불내성',
      '',
      '【치료 약물】',
      '• 실데나필(폐고혈압 직접 치료)',
      '• babungee: "타다라필이 긴 작용 시간과 비용 면에서 더 매력적일 수 있어요"',
      '• 기저 원인 치료가 병행돼야 해요',
      '',
      '⚠️ 심장 초음파로 심실 비대 정도와 혈역학적 이상을 확인하는 것이 필수예요.',
    ].join('\n')
  }

  if (/수액|링거|정맥|IV/.test(text)) {
    return [
      '💧 수액(IV) 치료 안내',
      '',
      '【수액이 필요한 상황】',
      '• 탈수가 심한 경우 (피부 탄력 감소, 잇몸 건조)',
      '• 구토·설사가 지속돼 음수가 불가능한 경우',
      '• 신부전 관리 중 수분 보충',
      '• 수술 전후 전해질 유지',
      '',
      '【주의사항】',
      '• 심장병이 있는 경우: 수액 과부하로 폐수종 유발 가능 → 반드시 담당의와 조율 필요',
      '• 신부전 + 심장병 동반 시: 수액 양과 속도 조절이 매우 중요해요',
      '',
      '입원 또는 통원 수액 중 집에서 변화가 생기면 병원에 바로 연락하세요.',
    ].join('\n')
  }

  // ── 췌장염 ──────────────────────────────────────────────────────
  if (/췌장염|췌장\s*수치|리파아제|PLI/.test(text)) {
    return [
      '🫀 췌장염 안내',
      '',
      '췌장염은 경증부터 생명을 위협하는 중증까지 스펙트럼이 넓어요.',
      '',
      '【핵심 원칙】',
      '• 췌장염의 가장 중요한 치료는 충분한 수액 공급이에요. 탈수가 오면 빠르게 나빠져요.',
      '• 지방을 무조건 제한하는 것이 답이 아니에요. 양질의 단백질과 저지방 식단으로 접근해야 해요.',
      '• 구토·식욕부진이 이틀 이상 지속되면 입원 수액 처치가 필요해요.',
      '• 스테로이드는 면역매개성 췌장염에서 활용하지만 임의로 사용하면 악화될 수 있어요.',
      '',
      '【즉시 병원이 필요한 신호】',
      '• 구토가 하루 3회 이상 + 식욕 완전 소실',
      '• 복부를 만지면 심하게 아파해요',
      '• 노란 눈(황달) 또는 잇몸이 노래요',
      '• 축 처지고 거의 움직이지 않아요',
      '',
      '【집에서 할 수 있는 것】',
      '• 12~24시간 금식 후 소량씩 부드러운 음식으로 재개',
      '• 물은 충분히 마실 수 있게 해주세요',
      '• 지방 함량 낮은 처방식이나 닭가슴살·흰살생선 소량',
      '',
      '췌장염은 재발이 잦아요. 한 번 앓은 경우 지방 높은 간식·사람 음식은 최대한 피해주세요.',
    ].join('\n')
  }

  // ── 림프종 / 항암 ────────────────────────────────────────────────
  if (/림프종|림프마|림포마|항암|화학요법|CHOP|빈크리스틴|독소루비신/.test(text)) {
    return [
      '🎗 림프종(림프마) 및 항암치료 안내',
      '',
      '림프종은 개·고양이에서 가장 흔한 혈액암 중 하나예요.',
      '',
      '【진단에서 중요한 점】',
      '• 림프절이 크다고 무조건 림프종은 아니에요. 반응성 림프절 종대일 수도 있어요.',
      '• 확진은 세침흡인세포검사(FNA) 또는 조직검사로 해야 해요.',
      '• B세포/T세포 분류에 따라 예후와 항암 반응이 달라요.',
      '',
      '【항암 중 주의사항】',
      '• 면역이 억제된 상태이므로 다른 동물 접촉·외부 산책 제한이 중요해요.',
      '• 기회감염(평상시엔 무해한 균에 의한 감염)이 생길 수 있어요.',
      '• 구토·설사·무기력이 항암 부작용으로 나타날 수 있어요. 심하면 즉시 병원에 연락하세요.',
      '',
      '【예후】',
      '• B세포 림프종 + CHOP 항암: 중앙 생존기간 약 12~18개월 (개)',
      '• T세포 림프종: 예후가 더 나쁜 편이에요',
      '• 고양이 소세포 림프종: 클로람부실+스테로이드로 수년 관리 가능한 경우도 있어요',
      '',
      '진단 후 치료 선택지(항암 여부, 약물 선택)는 종류·병기·전신 상태를 종합해 수의 종양 전문의와 상의하세요.',
    ].join('\n')
  }

  // ── 폐수종 ───────────────────────────────────────────────────────
  if (/폐수종|폐부종|폐에 물|폐에물/.test(text)) {
    return [
      '🫁 폐수종 안내',
      '',
      '폐수종은 폐에 물이 차는 응급 상태예요. 심장병이 가장 흔한 원인이에요.',
      '',
      '【즉시 병원이 필요한 신호】',
      '• 입을 벌리고 숨 쉬거나, 배까지 움직여 숨 쉬어요',
      '• 잇몸이 파랗거나 보라색이에요 → 지금 당장 응급실',
      '• 누워있지 못하고 앉아서 숨 쉬려 해요',
      '• 수면 중 호흡수 분당 40회 이상',
      '',
      '【이뇨제(라식스/퓨로세미드)에 대해】',
      '이뇨제는 폐에 찬 물을 소변으로 빼내는 약이에요. 임의로 증량·중단하지 말고 수의사 지시를 따르세요.',
      '심장병이 있는 경우 수액을 과다하게 맞으면 폐수종을 유발할 수 있어요.',
      '',
      '【집에서 모니터링】',
      '• 수면 중 호흡수를 매일 같은 시간에 체크하세요 (정상: 분당 30회 이하)',
      '• 호흡수가 갑자기 10회 이상 늘었다면 병원에 연락하세요',
      '• 기침이 늘거나 밤에 갑자기 깨면 주의 신호예요',
      '',
      '폐수종은 반복 재발하는 경우가 많아요. 이뇨제 용량과 주기를 담당 수의사와 지속적으로 조율하는 것이 중요해요.',
    ].join('\n')
  }

  // ── 발작 심층 안내 (항경련제 핸들러와 별도) ────────────────────
  if (/발작|경련|뇌전증|간질|간질약|발작이\s*(또|다시|반복)/.test(text)) {
    return [
      '⚡ 발작·경련 심층 안내',
      '',
      '【발작 자체는 보기에 무섭지만】',
      '특발성 발작(원인 불명)의 경우 발작 자체보다 약물 부작용이 더 문제가 될 수 있어요.',
      '하루 2회 이상 or 1회 10분 이상 지속될 때 약물 개입을 고려해요.',
      '가볍고 빈도 낮은 발작이라면 약 없이 관찰하는 것도 선택지예요.',
      '',
      '【항경련제 복용 중이라면】',
      '• 절대 임의로 중단·감량하지 마세요 → 반동 발작이 더 심해져요',
      '• 페노바르비탈: 6개월마다 혈중 농도·간수치 확인 필수',
      '• 스테로이드와 항경련제를 동시에 쓰면 어느 약이 효과 있는지 파악이 어려워요',
      '',
      '【발작 중 집에서 할 것】',
      '• 주변에 부딪힐 물건 치우기',
      '• 입에 손가락 넣지 않기 (물립니다)',
      '• 영상 촬영 (진단에 매우 중요)',
      '• 5분 이상 지속되면 즉시 병원으로',
      '',
      '【원인 파악이 중요해요】',
      '발작 원인은 특발성(뇌전증), 간 질환, 저혈당, 독성물질, 뇌종양 등 다양해요.',
      '특히 노령 동물에서 처음 발생하면 원인 검사(혈액, 영상)가 필수예요.',
    ].join('\n')
  }

  // ── 간수치 / 간 질환 ────────────────────────────────────────────
  if (/간수치|ALT|AST|ALP|ALKP|간 수치|간염|간 질환|간암|간종양|담관/.test(text)) {
    return [
      '🫀 간수치 및 간 질환 안내',
      '',
      '【수치별 해석】',
      '• ALT: 간세포 손상 지표 (200 이하는 경증, 1000 이상은 중증)',
      '• ALP(ALKP): 담도계 이상 또는 스테로이드 영향',
      '• AST: 간+근육 손상 지표',
      '',
      '【중요한 원칙】',
      '수치가 높다고 무조건 간 질환은 아니에요. 스테로이드 복용, 근육 손상, 쿠싱증후군에서도 올라가요.',
      '원인을 찾지 않고 간 보조제만 먹이는 것은 근본 해결이 아니에요.',
      '',
      '【즉시 병원이 필요한 신호】',
      '• 눈/잇몸/피부가 노랗게 변했어요 (황달)',
      '• 배가 빵빵하게 부풀었어요 (복수)',
      '• 발작이나 의식 혼란이 생겼어요 (간성뇌증)',
      '• 구토·식욕부진이 며칠째 지속돼요',
      '',
      '【담낭·담도 문제와 동반되는 경우】',
      '간수치 상승 + ALP 상승 조합은 담낭 질환(담석, 담낭염)을 의심해야 해요.',
      '초음파 검사로 담낭 상태를 확인하는 것이 중요해요.',
      '',
      '간 질환은 원인에 따라 치료법이 완전히 달라요. 혈액검사만으로는 불충분하고 초음파, 경우에 따라 조직검사까지 필요해요.',
    ].join('\n')
  }

  // ── 피하수액 (집에서 놓는 경우) ─────────────────────────────────
  if (/피하수액|피하\s*수액|집에서\s*수액|SQ수액|subcutaneous/.test(text)) {
    return [
      '💧 피하수액 안내',
      '',
      '피하수액은 신부전, 만성질환 관리에 자주 사용돼요. 집에서 놓는 경우 알아야 할 것들이에요.',
      '',
      '【집에서 놓을 때 핵심】',
      '• 매번 새 바늘 사용 + 손 위생이 감염 예방의 핵심이에요',
      '• 알코올 소독은 오히려 불필요해요 - 동물 스트레스만 높여요',
      '• 수액이 들어갈 때 동물이 불편해 보이면 주사 위치나 속도를 바꿔보세요',
      '• 같은 부위에 반복하지 말고 등 좌우를 번갈아 사용하세요',
      '',
      '【주의사항】',
      '• 심장병이 있다면 수액 양을 줄이거나 간격을 늘려야 할 수 있어요 (폐수종 위험)',
      '• 피하수액 양과 주기는 수의사와 지속적으로 조율하세요',
      '• 주사 부위에 혹이나 발적이 생기면 병원에 알리세요',
      '',
      '【언제 양을 조절해야 하나요?】',
      '숨이 빨라지거나 기침이 늘면 수액이 과다할 수 있어요. 즉시 수의사에게 연락하세요.',
      '먹는 양·음수량이 줄었다면 수액을 늘려야 할 수 있어요.',
    ].join('\n')
  }

  // ── 인수치 / 인흡착제 ────────────────────────────────────────────
  if (/인\s*수치|인흡착|알마겔|렌지아렌|이포스파민|인\s*관리|고인산|phosphorus/.test(text)) {
    return [
      '💊 인(P) 수치 및 인흡착제 안내',
      '',
      '신부전 관리에서 인 수치 조절은 매우 중요해요.',
      '',
      '【왜 인 수치가 중요한가요?】',
      '인이 높으면 신장 손상이 빠르게 진행돼요. 신부전 고양이/강아지의 생존기간에 직접 영향을 줘요.',
      '',
      '【인흡착제 종류와 특징】',
      '• 알마겔(수산화알루미늄): 가장 흔히 쓰임, 식사와 함께 투여',
      '• 렌지아렌(란타넘): 효과 좋지만 비쌈',
      '• 이포스파민(세벨라머): 칼슘 없어 고칼슘혈증 위험 없음',
      '',
      '【핵심 원칙】',
      '• 인흡착제는 반드시 식사와 함께 줘야 효과가 있어요',
      '• 사료 변경이 우선이에요 - 신장 처방식으로 먼저 바꾸세요',
      '• 인 수치 목표: 개 2.5~5.0 mg/dL, 고양이 2.5~5.0 mg/dL',
      '',
      '【인흡착제를 시작한다면】',
      '용량은 수의사가 혈액검사 결과를 보고 결정해요. 임의로 양을 늘리면 저인산혈증이 생길 수 있어요.',
    ].join('\n')
  }

  // ── 복수 ─────────────────────────────────────────────────────────
  if (/복수|배에\s*물|배에물|흉수|흉막삼출/.test(text)) {
    return [
      '🫧 복수·흉수 안내',
      '',
      '복수는 배에 물이 차는 것, 흉수는 가슴에 물이 차는 것이에요.',
      '',
      '【원인】',
      '• 심장병 (울혈성 심부전)',
      '• 간 질환 (간경변, 저알부민혈증)',
      '• 신장 질환',
      '• FIP (고양이전염성복막염)',
      '• 종양',
      '',
      '【복수를 없애는 방법】',
      '복수는 저절로 빠지는 경우가 드물어요. 수의사에게 복수 천자(직접 제거)를 요청할 수 있어요.',
      '이뇨제가 도움이 되는 경우도 있어요. 단, 심장병에서는 이뇨제를 쓰지만 간부전에서는 신중해야 해요.',
      '',
      '【babungee 원칙】',
      '"국내 수의사들이 폐수종에는 이뇨제를 잘 쓰지만 복수에서는 충분히 활용하지 못하는 경우가 많아요. 적극적으로 복수 천자와 이뇨제 사용을 수의사와 상의하세요."',
      '',
      '복수가 계속 차오르거나, 숨이 가빠지거나, 밥을 못 먹으면 즉시 병원에 가야 해요.',
    ].join('\n')
  }

  // ── 심잡음 / ACVIM 병기 ─────────────────────────────────────────
  if (/심잡음|ACVIM|B1|B2|C단계|D단계|심장\s*잡음|MVD|승모판/.test(text)) {
    return [
      '❤️ 심잡음 및 ACVIM 병기 안내',
      '',
      '개의 가장 흔한 심장병은 승모판막질환(MVD)이에요.',
      '',
      '【ACVIM 병기】',
      '• A: 위험군이지만 현재 심장병 없음 (소형견, 카발리에 등)',
      '• B1: 심잡음 있음, 심비대 없음 → 약 불필요',
      '• B2: 심잡음 + 심비대 시작 → 피모벤단 시작 권장',
      '• C: 심부전 증상 있음 → 다약제 치료',
      '• D: 치료 저항성 심부전',
      '',
      '【B1에서 B2로 넘어가는 시점이 중요해요】',
      '6개월마다 심장 초음파로 심비대 진행을 확인하고, B2 기준(LVIDDN >1.7 또는 LA/Ao >1.6)에 도달하면 피모벤단을 시작해야 해요.',
      '',
      '【집에서 모니터링】',
      '• 수면 중 호흡수 매일 체크 (정상: 30회 이하)',
      '• 갑자기 기침이 늘거나, 밤에 깨거나, 힘들어 보이면 병원',
      '',
      '심잡음이 있어도 B1이라면 당장 약 없이 관찰해요. 불필요한 약 복용은 오히려 해로울 수 있어요.',
    ].join('\n')
  }

  // ── HCM (고양이 비대성 심근병증) ───────────────────────────────
  if (/HCM|비대성\s*심근|심근\s*비대|고양이\s*심장|심초|심장\s*초음파|혈전\s*예방|클로피도그렐/.test(text)) {
    return [
      '🐱 고양이 HCM(비대성심근병증) 안내',
      '',
      '고양이에서 가장 흔한 심장병이에요.',
      '',
      '【HCM의 특징】',
      '• 심근이 두꺼워지면서 혈액을 효율적으로 내보내지 못해요',
      '• 무증상으로 발견되는 경우가 많아요 (건강검진)',
      '• 혈전 생성(동맥혈전색전증)이 큰 위험이에요 → 갑자기 뒷다리를 못 쓰면 응급',
      '',
      '【혈전 예방약 기준】',
      '좌심방이 많이 커진 경우(LA/Ao >1.5~1.6) 클로피도그렐 처방을 고려해요.',
      '아직 기준이 명확히 확립되지 않아 수의사마다 의견이 다를 수 있어요.',
      '',
      '【모니터링 주기】',
      '• 경증: 6~12개월마다 심장 초음파',
      '• 중등증 이상: 3~6개월마다',
      '• 수면 중 호흡수 주 1~2회 체크',
      '',
      '【babungee 원칙】',
      '"HCM은 진행 속도가 개체마다 달라요. 증상이 없어도 정기적인 초음파 모니터링이 핵심이에요."',
    ].join('\n')
  }

  // ── TCC / 방광암 ─────────────────────────────────────────────────
  if (/TCC|방광암|이행세포암|방광\s*종양|piroxicam|피록시캄/.test(text)) {
    return [
      '🔬 방광 이행세포암(TCC) 안내',
      '',
      '강아지에서 가장 흔한 방광 종양이에요.',
      '',
      '【증상】',
      '• 혈뇨, 빈뇨, 배뇨 곤란 → 방광염과 구분 어려움',
      '• 방광염 치료를 해도 반응 없으면 TCC 의심',
      '',
      '【진단】',
      '• 초음파: 방광 내 종양 확인',
      '• BRAF 돌연변이 소변 검사로 비침습적 진단 가능',
      '• 세포검사/조직검사로 확진',
      '',
      '【치료 선택지】',
      '• 피록시캄(Piroxicam): NSAID 계열, TCC에 종양 억제 효과 있음. 가장 기본적 치료',
      '• 항암화학요법 (미톡산트론, 빈블라스틴 등)',
      '• 요도 스텐트: 폐색이 있을 때',
      '',
      '【예후】',
      '치료 없이 중앙 생존기간 약 4~6개월. 피록시캄 단독 시 약 6개월. 항암 병행 시 조금 더 길어질 수 있어요.',
      '',
      '방광 폐색이 생기면 응급이에요. 소변을 아예 못 보면 즉시 병원으로 가세요.',
    ].join('\n')
  }

  // ── 수혈 / 빈혈 심층 ────────────────────────────────────────────
  if (/수혈|수혈이\s*(필요|가능)|헤마토크리트|PCV|빈혈\s*(심|치료|수혈)/.test(text)) {
    return [
      '🩸 수혈 안내',
      '',
      '수혈은 PCV(헤마토크리트)가 심각하게 낮을 때 고려해요.',
      '',
      '【수혈 고려 기준】',
      '• 개: PCV 20% 이하 (증상 있으면 25% 이하)',
      '• 고양이: PCV 15% 이하',
      '',
      '【수혈 시 주의사항】',
      '신부전 + 심장병이 동반된 경우 수혈로 인해 폐수종이 유발될 수 있어요.',
      '아주 천천히, 주의 깊게 모니터링하면서 진행해야 해요.',
      '',
      '【수혈 대안】',
      '• 에리스로포이에틴 유사제 (다베포에틴): 신부전 빈혈에 사용',
      '• 조혈 자극제는 효과가 나타나는 데 수 주 걸려요',
      '',
      '수혈 여부와 방법은 현재 수치, 증상, 동반 질환을 종합해 수의사가 결정해야 해요.',
    ].join('\n')
  }

  // ── 완화치료 / 말기 / 호스피스 ─────────────────────────────────
  if (/완화|말기|호스피스|여명|이제\s*(얼마|어떻게)|안락사|보내줄|마지막/.test(text)) {
    return [
      '🕊 완화치료 및 말기 관리 안내',
      '',
      '어려운 시간을 보내고 계시는군요. 진심으로 위로드려요.',
      '',
      '【babungee의 말】',
      '"종양이든, 신부전이든, 심장질환이든 결국 어느 시점에는 사용하던 약을 하나씩 빼야 하는 시점이 생겨요. 이때부터는 치료보다 편안함에 집중해야 해요."',
      '',
      '【완화치료의 핵심】',
      '1. 통증 관리 - 적절한 진통제 처방이 가장 중요해요',
      '2. 최소한의 영양 공급 - 식욕자극제, 구토억제제 활용',
      '3. 수분 공급 - 피하수액은 신부전뿐 아니라 여러 상황에서 도움돼요',
      '4. 그루밍 도움 - 스스로 못 할 때 부드럽게 도와주세요',
      '5. 스트레스 최소화 - 불필요한 병원 방문보다 집에서의 편안함이 우선',
      '',
      '【지금 당장 할 수 있는 것에 집중하세요】',
      '먼 미래를 걱정하기보다 오늘 배변패드를 갈아주고, 좋아하는 음식을 조금 더 챙겨주는 것이 중요해요.',
      '',
      '안락사는 고통이 심하고 삶의 질이 현저히 떨어질 때 선택할 수 있는 인도적인 방법이에요. 수의사와 솔직하게 상의하세요.',
    ].join('\n')
  }

  // ── 노령동물 케어 (고령견/고령묘/노견/노묘) ──────────────────────
  if (/노령|고령|노견|노묘|14살|15살|16살|17살|18살|노화|시니어\s*(강아지|고양이|견|묘)/.test(text)) {
    return [
      '🐾 노령동물 케어 안내',
      '',
      '노령 반려동물은 젊을 때와 다른 접근이 필요해요.',
      '',
      '【babungee의 핵심 조언】',
      '"4~5살이 지나면 먹는 양으로 체중을 늘리는 건 어려워요. 체중보다는 근육이 줄지 않도록 유지하는 것이 더 중요해요."',
      '',
      '【노령 반려동물 기본 관리】',
      '✅ 정기 혈액검사 (6개월마다): 신장·간·갑상선·혈구 수치 체크',
      '✅ 단백질 공급 유지: 양질의 단백질을 소량씩 자주(4~5시간 간격)',
      '✅ 체중 모니터링: 갑작스러운 감소는 신호',
      '✅ 관절 보호: 미끄럼 방지 매트, 낮은 계단',
      '✅ 구강 관리: 잇몸병은 신장·심장에 영향',
      '',
      '【자주 생기는 노령 질환】',
      '• 신장병 (CKD): 물 많이 마시면 체크',
      '• 심장병: 기침·호흡 빠름 주의',
      '• 갑상선기능저하: 무기력, 체중증가',
      '• 인지장애증후군: 밤에 짖음, 배회, 방향감각 상실',
      '• 관절염: 계단 거부, 뻣뻣한 움직임',
      '• 종양: 몸 어디에든 혹이 생길 수 있음',
      '',
      '【병원 타이밍】',
      '노령 동물은 증상이 빨리 진행돼요. 이상 발견 즉시 검사를 권장해요.',
      '',
      '어떤 증상이나 부분이 가장 걱정되시나요?',
    ].join('\n')
  }

  // ── 항생제 관련 질문 ──────────────────────────────────────────────
  if (/항생제|암피실린|아목시실린|독시사이클린|마프로플록|엔로플록|클린다마이신|메트로니다졸|항균제|세팔렉신/.test(text)) {
    return [
      '💊 항생제 관련 안내',
      '',
      '항생제는 수의사의 지시에 따라 정확하게 사용해야 해요.',
      '',
      '【항생제 사용 원칙】',
      '1. 처방된 기간 끝까지 복용: 증상이 나아도 중단하면 내성균이 생겨요',
      '2. 임의로 용량 조절하지 않기',
      '3. 다른 동물에게 쓰던 항생제 공유하지 않기',
      '',
      '【항생제 복용 시 주의사항】',
      '• 구토, 심한 설사, 식욕 완전 상실 → 수의사에게 알리기',
      '• 항생제는 유산균(프로바이오틱스)을 함께 복용하면 장 부담을 줄여줘요',
      '• 음식과 같이 먹어야 하는 것, 공복에 먹어야 하는 것이 다를 수 있어요',
      '',
      '【"재발" vs "치료 실패"】',
      '증상이 다시 나타났다고 해서 항생제가 안 들은 것은 아닐 수 있어요.',
      '"재발이라기 보다는 위치상 완전 절제가 안 된 것으로 추정"처럼 근본 원인이 남아 있는 경우가 흔해요.',
      '재배양 검사(배양 및 감수성 검사)를 통해 맞는 항생제를 찾는 것도 중요해요.',
      '',
      '【내성균 주의】',
      '같은 항생제를 반복 사용하면 내성이 생길 수 있어요.',
      '반복 감염이라면 배양 검사로 맞는 항생제를 새로 처방받는 것을 고려하세요.',
    ].join('\n')
  }

  // ── 당뇨 / 혈당 / 인슐린 ─────────────────────────────────────────
  if (/당뇨|혈당|인슐린|혈당\s*(측정|조절|높|낮)|저혈당|고혈당|DM\b/.test(text)) {
    return [
      '🍬 당뇨 관리 안내',
      '',
      '반려동물 당뇨는 꾸준한 관리로 안정적으로 유지할 수 있어요.',
      '',
      '【인슐린 투여 핵심】',
      '• 반드시 밥을 먹은 후에 인슐린 투여 (공복 투여는 저혈당 위험)',
      '• 밥을 거부할 경우: 반 용량만 투여하거나 수의사에게 연락',
      '• 인슐린은 냉장 보관 (얼리지 않기), 개봉 후 28~30일 이내 사용',
      '',
      '【혈당 모니터링】',
      '• 집에서 혈당 측정이 가능하면: 귀 가장자리 또는 발바닥 살짝 찔러 채혈',
      '• 목표 혈당: 개 100~250mg/dL, 고양이 150~300mg/dL (수의사 기준 따르기)',
      '• 혈당 곡선(Glucose curve): 12시간 동안 2~4시간마다 측정해 최적 용량 설정',
      '',
      '【저혈당 긴급 증상】',
      '⚠️ 떨림, 비틀거림, 발작, 의식 저하 → 즉시 잇몸에 꿀이나 시럽 바르고 병원으로',
      '',
      '【식이 관리】',
      '• 고단백 저탄수화물 사료 권장 (특히 고양이)',
      '• 매일 같은 시간에 같은 양 급여 (혈당 안정화)',
      '• 간식은 최대한 제한, 당분 높은 음식 금지',
      '',
      '【정기 검사】',
      '• 프럭토사민(Fructosamine) 검사: 2~3주 평균 혈당을 반영해요',
      '• 처음 안정될 때까지 2주마다, 안정 후 3개월마다 검사',
    ].join('\n')
  }

  // ── 갑상선기능저하 (개) ───────────────────────────────────────────
  if (/갑상선\s*(기능\s*저하|저하|수치|약|치료)|T4\s*(낮|수치)|TSH\s*(높|수치)|갑기저|레보티록신|솔록신/.test(text)) {
    return [
      '🦋 갑상선기능저하증 안내 (개)',
      '',
      '갑상선기능저하증은 잘 관리하면 정상적인 삶을 살 수 있어요.',
      '',
      '【babungee의 핵심 말씀】',
      '"쿠싱과 다르게 T4와 TSH 정도만 검사하면 확진 가능해요."',
      '"최초 한달 약물 처치 후 용량 재설정, 이후 6개월간 반복하는 과정이 가장 중요해요."',
      '',
      '【주요 증상】',
      '• 무기력, 운동 기피',
      '• 체중 증가 (먹는 양은 그대로인데)',
      '• 털 빠짐, 피부 두꺼워짐, 쥐 꼬리 모양 탈모',
      '• 추위를 많이 탐',
      '',
      '【진단】',
      '• T4 + TSH 검사가 기본이에요',
      '• T4가 낮고 TSH가 높으면 갑상선기능저하증',
      '• 재검에서 정상이라도 증상이 있으면 다시 검사 고려',
      '',
      '【치료 – 레보티록신 투약】',
      '• 하루 1~2회 경구 투여',
      '• 투약 시작 1개월 후 수치 재확인 → 용량 조절',
      '• 이후 6개월간 모니터링 반복',
      '• 치료 효과: 수주 내 무기력 개선, 수개월 내 피부·털 회복',
      '',
      '【다른 질환과의 연관성】',
      '치료하면 다른 대사성 질환 진행 속도를 늦추는 데도 도움이 돼요.',
      '쿠싱증이 동반된 경우 쿠싱 치료와 병행하면 재발 가능성도 낮아져요.',
    ].join('\n')
  }

  // ── 디스크 / IVDD / 추간판 / 척수 ────────────────────────────────
  if (/디스크|IVDD|추간판|척수\s*(손상|압박|문제)|허리\s*(디스크|통증)|목디스크|흉추|요추|하반신\s*(마비|약화)|뒷다리\s*(마비|약화|끌림)/.test(text)) {
    return [
      '🦴 디스크(IVDD) 안내',
      '',
      '추간판 질환(IVDD)은 빠른 대처가 회복에 큰 영향을 미쳐요.',
      '',
      '【즉시 병원이 필요한 신호】',
      '🚨 뒷다리를 전혀 못 쓰거나 끌면 → 24~48시간 내 수술 여부 결정이 중요해요',
      '🚨 소변을 못 보거나 대변 실금 → 신경 손상 가능성, 즉시 방문',
      '',
      '【단계별 증상】',
      '• 1단계: 통증만 있음 (등을 만지면 움츠림)',
      '• 2단계: 휘청거림, 뒷다리 약화',
      '• 3단계: 걷지 못하지만 통증 감각 있음',
      '• 4단계: 걷지 못하고 통증 감각 없음',
      '• 5단계: 방광·직장 기능 상실',
      '',
      '【보존 치료 (1~2단계)】',
      '• 절대 안정 (케이지 안정) 4~8주: 가장 중요해요',
      '• 소염진통제(스테로이드 또는 NSAID)',
      '• 이 기간 점프, 계단, 격렬한 활동 완전 금지',
      '',
      '【수술 치료 (3~5단계 또는 보존 치료 실패)】',
      '• 빠를수록 회복 예후가 좋아요',
      '• MRI로 정확한 압박 위치 확인 후 수술 결정',
      '',
      '【집에서 관리 시 주의사항】',
      '• 안고 내려놓을 때 등이 꺾이지 않게 받쳐주세요',
      '• 소파·침대 오르내리기 금지 (계단 설치)',
      '• 배변 유도: 못 가리면 수건으로 복부 마사지',
    ].join('\n')
  }

  // ── 분리불안 ──────────────────────────────────────────────────────
  if (/분리불안|혼자\s*(있을때|두면|놔두면|놓으면)\s*(짖|울|난리|자해|파괴)|외출\s*(후|하면)\s*(짖|울|난리|대소변|흥분)|혼자있기/.test(text)) {
    return [
      '🏠 분리불안 관리 안내',
      '',
      '분리불안은 훈련과 환경 조절로 많이 개선할 수 있어요.',
      '',
      '【분리불안의 주요 증상】',
      '• 외출 전부터 과도한 흥분 또는 불안',
      '• 혼자 있을 때 짖기, 울기, 파괴 행동',
      '• 혼자 있을 때만 대소변 실수',
      '• 보호자가 돌아왔을 때 과도하게 반응',
      '',
      '【훈련 원칙】',
      '1. 출퇴근을 무감정하게: 나갈 때·올 때 과도한 인사 금지',
      '2. 짧은 외출부터 연습: 처음엔 30초, 1분, 5분으로 늘려가기',
      '3. 혼자 있을 때 보상: 나갈 때만 주는 특별 간식·장난감',
      '4. 출발 신호 무력화: 열쇠·가방·신발 만지는 행동을 미리 반복',
      '',
      '【환경 조절】',
      '• TV나 라디오 켜두기 (조용한 것보다 나음)',
      '• 입었던 옷을 놔두기 (보호자 냄새)',
      '• 콩 장난감(KONG)에 간식 채워 두기',
      '• 창문 차단: 바깥 자극이 불안을 증폭시킬 수 있음',
      '',
      '【약물 보조 (심한 경우)】',
      '• 수의사 처방 항불안제: 클로미프라민, 플루옥세틴 등',
      '• 보조제: 지에스티(Zylkene), 어댑틸(Adaptil) 페로몬 디퓨저',
      '• 약은 훈련과 함께 사용해야 효과적이에요',
      '',
      '【전문가 도움】',
      '심한 자해나 탈출 시도는 수의 행동 전문가 상담을 권장해요.',
    ].join('\n')
  }

  // ── 방광결석 / 요로결석 / 신결석 ─────────────────────────────────
  if (/결석|방광결석|요로결석|신장결석|신결석|방광돌|스트루바이트|옥살산칼슘|칼슘옥살레이트/.test(text)) {
    return [
      '🫧 방광·요로결석 안내',
      '',
      '결석의 종류에 따라 치료와 예방 방법이 달라요.',
      '',
      '【babungee 설명: 결석의 종류】',
      '1. 스트루바이트(Struvite): 요로 감염의 결과로 생기는 경우가 많아요',
      '2. 옥살산칼슘(Calcium Oxalate): 높은 혈중 칼슘, 간 질환, 영양 불균형으로 발생',
      '3. 요산염(Urate): 특정 품종(달마시안 등) 또는 간 질환과 관련',
      '',
      '【치료 방법】',
      '• 스트루바이트: 처방식으로 녹일 수 있어요 (수개월 소요)',
      '• 옥살산칼슘·요산염: 처방식으로 녹지 않아요 → 수술 또는 내시경 제거',
      '• 작은 결석이 배출 중일 때: 충분한 수분 공급, 소변 자주 볼 기회',
      '',
      '【즉시 병원 신호】',
      '🚨 소변을 전혀 못 봄 → 방광 폐색 응급',
      '🚨 혈뇨 + 고통스러운 표정',
      '🚨 배를 만지면 심하게 아파함',
      '',
      '【식이 관리 (결석 예방)】',
      '• 물 많이 마시게 하기: 음수량 증가가 핵심',
      '• 습식사료 활용: 건식보다 수분 섭취 유리',
      '• 결석 종류에 맞는 처방식 사료 사용',
      '• 마그네슘·인·칼슘 함량이 높은 음식 제한',
      '',
      '현재 결석 크기와 위치, 종류가 파악됐나요?',
    ].join('\n')
  }

  // ── 탈수 심층 ─────────────────────────────────────────────────────
  if (/탈수\s*(심|증상|심해|정도|있|됐|될|인가|인지)|탈수\s*(여부|확인|체크)|탈수\s*(때문에|로\s*인해)|탈수\s*(치료|수액)\s*(?!관련)/.test(text)) {
    return [
      '💧 탈수 확인 및 관리 안내',
      '',
      '탈수는 다양한 질환의 결과로 나타나고, 방치하면 빠르게 악화될 수 있어요.',
      '',
      '【집에서 탈수 확인하는 법】',
      '1. 피부 탄력 테스트: 목덜미 피부를 살짝 잡아 올렸다 놓기 → 즉시 돌아오면 정상, 천천히 돌아오면 탈수',
      '2. 잇몸 수분: 손가락으로 잇몸 누른 후 떼기 → 2초 내 핑크색 돌아오면 정상',
      '3. 잇몸이 끈적하거나 건조하면 탈수 신호',
      '',
      '【탈수 정도별 대응】',
      '• 경증(5% 이하): 물 충분히 공급, 경구 전해질 용액',
      '• 중등도(5~10%): 수의사 방문 권장, 피하수액 가능',
      '• 중증(10% 이상): 즉시 정맥 수액 치료 필요',
      '',
      '【탈수 위험 상황】',
      '• 반복적인 구토·설사',
      '• 신부전으로 음수량 감소',
      '• 더운 환경 + 활동',
      '• 식욕 부진으로 음식·물 거부',
      '',
      '【피하수액(가정 주사) 가이드】',
      '신부전이나 만성 탈수가 있는 경우 집에서 피하수액이 처방되기도 해요.',
      '• 보통 250~500mL를 등 쪽 피하에 주입',
      '• 위치는 어깨뼈 사이 느슨한 피부',
      '• 주입 속도: 10분에 100mL 정도가 편안해요',
      '• 응어리(물주머니)가 생기는 건 정상 — 수 시간 내 흡수돼요',
    ].join('\n')
  }

  // ── 호중구 감소 / 백혈구 / WBC ───────────────────────────────────
  if (/호중구\s*(감소|낮|수치)|호중구감소|WBC\s*(낮|감소)|백혈구\s*(낮|감소|수치)|면역억제|G-CSF|필그라스팀/.test(text)) {
    return [
      '🧬 호중구 감소증(Neutropenia) 안내',
      '',
      '호중구는 세균·감염을 막는 면역세포예요. 수치가 낮으면 감염 위험이 높아져요.',
      '',
      '【주요 원인】',
      '• 항암 화학요법(가장 흔한 원인)',
      '• 심한 감염(바이러스, 세균)',
      '• 골수 질환',
      '• 면역매개 질환 또는 일부 약물 부작용',
      '',
      '【호중구 수치 해석】',
      '• 정상: 3,000~12,000/μL',
      '• 주의: 1,000~2,000/μL → 감염 위험 증가',
      '• 위험: 500/μL 이하 → 감염 시 생명 위협',
      '',
      '【항암 치료 중 주의사항】',
      '⚠️ 발열(39.5°C 이상) + 호중구 감소 → 즉시 병원 응급 방문',
      '• 이 상태를 "호중구 감소성 열(Febrile Neutropenia)"이라고 해요',
      '• 예방적 항생제가 처방될 수 있어요',
      '',
      '【집에서 관리】',
      '• 다른 동물과 격리 (교차 감염 위험)',
      '• 날음식, 생고기, 오염 가능성 있는 식재료 피하기',
      '• 상처가 생기지 않도록 주의',
      '• G-CSF(필그라스팀) 주사가 처방되면 정해진 시간에 투여',
      '',
      '다음 혈액 검사는 언제 예정인가요?',
    ].join('\n')
  }

  // ── 알레르기 / 아토피 ────────────────────────────────────────────
  if (/아토피|음식\s*(알레르기|알러지)|알레르기\s*(피부|반응|검사|치료)|사이토포인트|아포퀠|오클라시티닙|두필루맙|피부\s*(알레르기|과민)/.test(text)) {
    return [
      '🌿 알레르기·아토피 관리 안내',
      '',
      '반려동물 알레르기는 완치보다 "관리"가 목표예요.',
      '',
      '【알레르기 유형】',
      '1. 환경성 알레르기(아토피): 꽃가루, 집먼지진드기, 곰팡이',
      '2. 음식 알레르기: 특정 단백질(소고기, 닭고기, 유제품 등)',
      '3. 벼룩 알레르기 피부염(FAD): 벼룩 1~2마리에도 심하게 반응',
      '',
      '【음식 알레르기 진단 – 단백질 배제 식이시험】',
      '• 12주 동안 먹어본 적 없는 새 단백질만 급여',
      '• 이 기간 간식·영양제도 모두 바꿔야 해요',
      '• 증상 개선 → 원래 음식 재급여 시 재발 → 음식 알레르기 확진',
      '',
      '【사료 바꿀 때 주의】',
      '"한번에 바꾸면 거부해요. 기존 사료 80 : 새 사료 20부터 시작해서 점차 비율을 늘리세요."',
      '',
      '【약물 치료】',
      '• 아포퀠(오클라시티닙): 가려움증 빠른 조절, 경구 복용',
      '• 사이토포인트: 주사, 효과 4~8주 지속',
      '• 스테로이드: 효과 좋지만 장기 사용 시 부작용 주의',
      '',
      '【집에서 관리】',
      '• 발 씻기: 산책 후 집먼지진드기·꽃가루 제거',
      '• 오메가-3 지방산 보충: 피부 장벽 강화',
      '• 집먼지진드기 관리: 침구 자주 세탁, 공기청정기',
      '• 목욕: 2주에 1회 (너무 자주 하면 피부 장벽 손상)',
    ].join('\n')
  }

  // ── 슬개골 탈구 ──────────────────────────────────────────────────
  if (/슬개골|슬개골\s*(탈구|수술|관리|재발)|무릎\s*(뼈|통증|탈구)|슬개골\s*(1기|2기|3기|4기|1도|2도|3도|4도)/.test(text)) {
    return [
      '🦴 슬개골 탈구 안내',
      '',
      '슬개골 탈구는 소형견에게 흔하며, 단계에 따라 치료 방향이 달라요.',
      '',
      '【단계별 설명】',
      '• 1기: 손으로 밀었을 때만 탈구, 스스로 돌아옴 — 대부분 수술 불필요',
      '• 2기: 걷다가 한쪽 다리를 들고 걸음 — 증상·활동량 따라 수술 고려',
      '• 3기: 항상 탈구 상태, 억지로 넣을 수 있음 — 수술 권장',
      '• 4기: 항상 탈구, 손으로도 안 들어감 — 수술 필수',
      '',
      '【수술 시기 판단】',
      '• 어릴 때 수술하면 뼈 변형을 막을 수 있어요',
      '• 3기 이상이면 나이와 관계없이 수술을 고려해요',
      '• 2기라도 통증·보행 이상이 있으면 수술이 삶의 질을 높여요',
      '',
      '【수술 후 관리】',
      '• 케이지 안정 4~8주: 이 기간이 가장 중요해요',
      '• 재활운동: 수중 트레드밀, 물리치료',
      '• 체중 관리: 과체중은 관절에 부담',
      '',
      '【수술하지 않을 경우 관리】',
      '• 미끄럽지 않은 바닥 (카펫, 매트)',
      '• 계단·소파 오르내리기 제한',
      '• 글루코사민·콘드로이틴 보충제',
      '• 체중 감량이 가장 효과적인 보존 치료예요',
    ].join('\n')
  }

  // ── 백내장 / 녹내장 / 안압 ───────────────────────────────────────
  if (/백내장|녹내장|안압|수정체\s*(혼탁|제거)|눈\s*(뿌옇|흐려|시력|안보이|실명)|포도막염|눈물\s*(막힘|관)/.test(text)) {
    return [
      '👁️ 눈 질환 안내 (백내장·녹내장)',
      '',
      '눈 질환은 빨리 발견할수록 시력 보존 가능성이 높아요.',
      '',
      '【백내장】',
      '증상: 눈이 뿌옇거나 하얗게 변함, 어두운 곳에서 더 잘 부딪힘',
      '',
      '• 초기~중기: 점안제로 진행 속도를 늦출 수 있어요',
      '• 진행된 경우: 수술(초음파수정체유화술)로 시력 회복 가능',
      '• 백내장이 심해지면 수정체 유래 포도막염이 생길 수 있어요',
      '• 포도막염은 녹내장으로 진행될 수 있으므로 타이밍이 중요해요',
      '',
      '【babungee의 말】',
      '"수술 성공률이 높은 시기는: 전신 건강이 양호하고, 염증(포도막염)이 생기기 전이에요."',
      '"성공률이 극히 낮아지는 상황은 염증이 심해지거나 수술 후 녹내장이 올 때예요."',
      '',
      '【녹내장】',
      '증상: 눈이 부어 보임, 충혈, 빛을 피함, 두통처럼 눈 주변 통증',
      '',
      '🚨 안압 상승은 빠르게 진행되면 24~72시간 내 실명 가능 → 즉시 병원',
      '• 안압강하제 점안: 도르졸라미드, 브린졸라미드 등',
      '• 안압이 조절 안 되면 레이저 치료 또는 수술',
      '',
      '【집에서 할 수 있는 것】',
      '• 점안약 정해진 시간에 투여 (빠뜨리면 안압 급등)',
      '• 충혈·분비물·눈 크기 변화 매일 체크',
      '• 눈을 비비지 않도록 넥카라 착용',
    ].join('\n')
  }

  // ── 구강염 / 치주염 / 치석 / 잇몸 심층 ──────────────────────────
  if (/구강염|치주염|치은염|잇몸\s*(염증|출혈|붓|내려앉|뼈)|치석\s*(심|제거|쌓|스케일)|무마취\s*스케일|잇몸\s*병|치아\s*(흔들|빠지|뿌리)/.test(text)) {
    return [
      '🦷 구강·치주 질환 안내',
      '',
      '치주 질환은 신장·심장 질환과 연관된 전신 질환이에요.',
      '',
      '【babungee의 핵심 말씀】',
      '"기저질환이 있어도 치과 질환의 악화는 기저질환을 더욱 악화시켜요."',
      '"기저질환이 없다면 치과 치료를 망설일 이유가 없어요."',
      '"무마취 스케일링은 비추예요 — 잇몸 아래(치은연하) 병소를 해결할 수 없어요."',
      '',
      '【마취 스케일링이 필요한 경우】',
      '• 치석이 잇몸 아래로 침착된 경우',
      '• 치근 흡수, 치아 흔들림',
      '• 구강 내 통증으로 밥을 못 먹는 경우',
      '• 구취가 매우 심한 경우',
      '',
      '【마취 위험이 걱정될 때】',
      '• 마취 전 혈액검사 + 흉부X-ray로 위험도 평가',
      '• 심장병·신장병이 있어도 적절한 모니터링 하에 마취 가능',
      '• 수술 전 항생제 투여로 균혈증 예방',
      '',
      '【일상 관리】',
      '• 양치: 매일 → 주 3회 이상이 기본',
      '• 효소 함유 치약 사용 (사람 치약은 금지)',
      '• 덴탈 껌·사료 보조: 양치를 대체하진 않아요',
      '• 고양이 구강 흡수성 치주염(FORL): 고양이 치아 통증 원인 1위',
      '',
      '다음 스케일링 예약은 되어 있나요?',
    ].join('\n')
  }

  // ── FIP (고양이전염복막염) ────────────────────────────────────────
  if (/FIP|고양이\s*전염\s*복막염|복막염\s*(고양이|fip)|GS-441|GS441|몰누피라비르|코로나\s*바이러스\s*(고양이|변이)|삼출형|비삼출형|복수\s*(고양이\s*복막염|FIP)/.test(text)) {
    return [
      '🐱 FIP(고양이전염복막염) 안내',
      '',
      'FIP는 이전에 불치병이었지만 현재는 치료제로 완치 사례가 늘고 있어요.',
      '',
      '【FIP란?】',
      '고양이 코로나바이러스가 변이를 일으켜 면역계를 공격하는 질환이에요.',
      '• 삼출형(습식): 복수·흉수가 차는 형태 — 진행이 빠름',
      '• 비삼출형(건식): 눈·신경·장기에 육아종이 생기는 형태',
      '',
      '【진단】',
      '• 혈액검사: 알부민/글로불린 비율(A:G ratio) < 0.8이면 의심',
      '• 복수/흉수 검사: 리발타 검사(Rivalta test), 단백질 농도',
      '• PCR 검사, 조직 생검으로 확진',
      '',
      '【치료 – GS-441524 항바이러스제】',
      '• 현재 가장 효과적인 치료제예요',
      '• 삼출형: 약 12주 투약, 비삼출형: 더 긴 기간 필요',
      '• 84일 이상 투약 후 84일 무투약 모니터링 기간',
      '• 가격이 높지만 완치율이 상당히 높아요',
      '',
      '【치료 중 모니터링】',
      '• 2~4주마다 혈액검사 (간수치, 알부민, A:G ratio)',
      '• 체중 증가, 활동량 회복이 좋은 지표예요',
      '',
      '담당 수의사와 GS-441524 투약 프로토콜을 상의해 보세요.',
    ].join('\n')
  }

  // ── BNP / NT-proBNP / 심장 마커 ────────────────────────────────
  if (/BNP|NT-proBNP|proBNP|NTproBNP|심장\s*(마커|수치|바이오마커|혈액\s*검사)|카르디아|cardias/.test(text)) {
    return [
      '❤️ BNP·NT-proBNP 심장 마커 안내',
      '',
      'BNP 계열 마커는 심장에 가해지는 압박(스트레스)을 측정하는 혈액검사예요.',
      '',
      '【BNP vs NT-proBNP】',
      '• NT-proBNP: 개·고양이 심장 기능 평가에 많이 사용',
      '• 수치가 높을수록 심장에 부담이 크다는 의미예요',
      '',
      '【ACVIM 단계별 해석 (개 MMVD 기준)】',
      '• B1단계: 심잡음 있지만 심장 크기 정상 → 투약 권장되지 않음',
      '• B2단계: 심잡음 + 심장 비대 → 피모벤단 투약 시작 고려',
      '• C단계: 심부전 증상 발현 → 적극적 치료',
      '',
      '【babungee 설명】',
      '"B1 단계에서는 심장약 투여가 장기 생존에 이득이 있다는 근거가 없어요."',
      '"3~6개월마다 청진·흉부X-ray·심초음파로 경과를 관찰하세요."',
      '"저염식, 체중 관리, 적절한 운동이 진행 억제에 도움이 돼요."',
      '',
      '【NT-proBNP 검사 권장 시점】',
      '• 심잡음이 새로 발견됐을 때',
      '• 기침·호흡 이상이 있을 때',
      '• 기존 심장병 모니터링 (3~6개월 간격)',
      '',
      '현재 심초음파(에코) 검사도 받으셨나요?',
    ].join('\n')
  }

  // ── 캣플루 / 상부호흡기 감염 ─────────────────────────────────────
  if (/캣플루|고양이\s*감기|상부\s*호흡기|허피스\s*(바이러스|감염)|칼리시\s*(바이러스|감염)|고양이\s*(콧물|재채기|눈곱)\s*(심|계속|반복)|라이신/.test(text)) {
    return [
      '🤧 고양이 상부호흡기 감염(캣플루) 안내',
      '',
      '캣플루의 가장 흔한 원인은 헤르페스바이러스(FHV-1)와 칼리시바이러스(FCV)예요.',
      '',
      '【주요 증상】',
      '• 재채기, 콧물, 눈곱, 눈물',
      '• 발열, 식욕부진',
      '• 구강 궤양 (칼리시바이러스)',
      '• 심하면 각막궤양 (헤르페스)',
      '',
      '【babungee의 말】',
      '"재채기는 상부호흡기의 이물질을 배출하는 방어기작이에요."',
      '"반복적인 재채기는 치주 질환의 신호일 수 있으니 구강 검진도 받아보세요."',
      '',
      '【치료 원칙】',
      '• 항바이러스제: 헤르페스에 팜시클로버 등',
      '• 이차 세균감염 예방: 항생제',
      '• 라이신(L-Lysine): 헤르페스 바이러스 억제 보조',
      '• 눈 분비물: 생리식염수로 부드럽게 닦기',
      '• 식욕 저하 시: 습식 사료, 따뜻하게 데워 향 강화',
      '',
      '【헤르페스 바이러스 특성】',
      '감염 후 신경절에 잠복하다가 스트레스·면역 저하 시 재발해요.',
      '완전한 박멸은 어렵지만 재발 주기와 강도를 줄일 수 있어요.',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 입 안을 전혀 안 먹음 + 발열 3일 이상',
      '🚨 각막이 뿌옇거나 눈을 계속 감음 → 각막궤양 확인 필요',
    ].join('\n')
  }

  // ── IMHA / 면역매개 용혈성 빈혈 / 자가면역 ─────────────────────
  if (/IMHA|면역매개\s*(용혈|빈혈)|자가면역\s*(질환|빈혈|혈소판)|면역\s*(억제|매개)\s*(약|치료)|황달\s*(빈혈|면역)|마이코플라즈마/.test(text)) {
    return [
      '🔴 면역매개 질환 안내 (IMHA 등)',
      '',
      '면역매개 질환은 면역계가 자신의 세포를 공격하는 자가면역 상태예요.',
      '',
      '【IMHA (면역매개 용혈성 빈혈)】',
      '면역계가 자신의 적혈구를 파괴하는 질환이에요.',
      '• 증상: 심한 무기력, 창백하거나 노란 잇몸(황달), 호흡 빠름',
      '• 혈액검사: PCV 급감, 쿰스(Coombs) 양성',
      '• 치료: 고용량 스테로이드 (프레드니솔론), 필요 시 면역억제제 추가',
      '',
      '【babungee 의견】',
      '"스테로이드에 반응하지 않으면 다른 형태의 면역억제제가 필요해요."',
      '"단백뇨 여부도 확인해야 해요 (신장의 면역복합체 침착 가능성)."',
      '',
      '【IMTP (면역매개 혈소판 감소증)】',
      '• 증상: 피부 점출혈(붉은 점), 멍, 혈뇨, 혈변',
      '• 혈소판 < 50,000/μL → 출혈 위험',
      '• 치료: 스테로이드, 비타민K, 필요 시 수혈',
      '',
      '【치료 중 주의사항】',
      '• 스테로이드 임의 중단 금지 → 반동성 악화 위험',
      '• 감량은 수의사 지시에 따라 천천히',
      '• 감염 차단: 면역 억제 상태에서 감염은 치명적',
      '',
      '빠른 진단과 치료 시작이 예후에 가장 중요해요.',
    ].join('\n')
  }

  // ── 혈소판 감소 / 출혈 경향 ──────────────────────────────────────
  if (/혈소판\s*(감소|낮|수치|부족)|PLT\s*(낮|감소|수치)|출혈\s*(점|경향|잘됨)|피멍|점출혈|자반증|혈소판\s*< ?[0-9]/.test(text)) {
    return [
      '🩺 혈소판 감소·출혈 경향 안내',
      '',
      '혈소판은 출혈을 멈추게 하는 혈액세포예요. 수치가 낮으면 출혈 위험이 높아져요.',
      '',
      '【혈소판 수치 해석】',
      '• 정상: 150,000~400,000/μL',
      '• 주의: 50,000~100,000 → 출혈 위험 증가',
      '• 위험: 50,000 이하 → 자연 출혈 가능',
      '• 응급: 20,000 이하 → 뇌출혈 등 생명 위협',
      '',
      '【주요 원인】',
      '• 면역매개(IMTP): 가장 흔한 원인',
      '• 쿠싱증후군 동반 출혈: 혈관 확장, 응고인자 변화',
      '• 항암 치료 부작용',
      '• 에를리키아·바베시아 감염 (틱 매개)',
      '• 파종성혈관내응고(DIC): 응급',
      '',
      '【babungee의 말】',
      '"쿠싱의 경우 혈액응고인자와 섬유소용해 능력 변화 + 정맥혈관 확장으로 출혈에 불리하게 작용해요."',
      '',
      '【즉시 병원 신호】',
      '🚨 잇몸·눈의 흰자에 작은 붉은 점(점출혈)',
      '🚨 혈뇨·혈변·코피',
      '🚨 배에 피멍이 번짐',
      '🚨 갑작스러운 극도의 무기력',
      '',
      '혈소판이 낮아진 원인을 찾는 것이 치료의 핵심이에요.',
    ].join('\n')
  }

  // ── 만성·반복 구토 ────────────────────────────────────────────────
  if (/구토\s*(반복|매일|계속|매번|반복적|만성|지속)|매일\s*구토|반복적인\s*구토|구토가\s*(계속|멈추지|안\s*멈)/.test(text)) {
    return [
      '🤢 만성·반복 구토 안내',
      '',
      '구토가 반복된다면 원인 파악이 먼저예요.',
      '',
      '【babungee의 핵심 조언】',
      '"반복 구토와 설사는 그 자체로 체액 손실을 일으켜요. 원인 파악 전에 탈수 예방이 우선이에요."',
      '"닭고기 끓인 물 등으로 수분과 최소한의 영양소를 보충하면서 활력 징후를 살피세요."',
      '',
      '【원인별 구분】',
      '● 식이성: 과식, 급하게 먹음, 음식 변경, 이물질 섭취',
      '● 소화기: 위염, IBD, 위궤양, 췌장염',
      '● 간·신장: 간부전, 신부전 (요독증)',
      '● 내분비: 쿠싱, 당뇨, 갑상선',
      '● 기생충: 회충, 구충 등',
      '● 중독: 식물, 약물, 독성 물질',
      '',
      '【집에서 먼저 할 것】',
      '• 12~24시간 절식 (물은 조금씩 유지)',
      '• 이후 블랜드 식이: 삶은 닭가슴살 + 흰 쌀밥 소량',
      '• 3~4일 후 기존 사료로 천천히 전환',
      '',
      '【병원이 필요한 경우】',
      '🚨 혈액이나 커피색 물질이 나옴',
      '🚨 24시간 안에 5회 이상',
      '🚨 무기력·복부 통증·발열 동반',
      '🚨 이물질(뼈, 장난감, 끈)을 삼킨 것으로 의심',
      '',
      '구토할 때 내용물이 어떤 색이고, 언제(식후·공복) 하나요?',
    ].join('\n')
  }

  // ── 비만 / 체중 관리 / 다이어트 ─────────────────────────────────
  if (/비만|과체중|살\s*(찌|빼|줄여|너무\s*많이)|다이어트|체중\s*(감량|조절|관리)|BCS\s*[5-9]|체지방/.test(text)) {
    return [
      '⚖️ 반려동물 체중 관리 안내',
      '',
      '비만은 관절, 심장, 당뇨, 호흡기에 모두 영향을 미쳐요.',
      '',
      '【babungee의 핵심 조언】',
      '"체중 감량은 2~3개월 기준으로 서서히 진행해야 해요."',
      '"4~5살 이상이면 먹는 양으로 체중 증가는 어려워요. 근육 유지에 집중하세요."',
      '',
      '【목표 체중 계산】',
      '• BCS(체형점수) 5/9를 목표로 해요',
      '• 현재 체중의 80~85% 기준으로 칼로리 계산',
      '• 처음 목표: 1개월에 1~2% 감량 (너무 빠르면 간 지방증 위험)',
      '',
      '【식이 조절】',
      '• 처방 다이어트 사료 또는 칼로리 제한 사료',
      '• 하루 급여량을 3~4회로 나눠서 (포만감 유지)',
      '• 간식은 하루 칼로리의 10% 이내',
      '• 사람 음식, 특히 지방·당분 높은 음식 금지',
      '',
      '【운동】',
      '• 개: 하루 30분 이상 산책 (관절 문제 없을 때)',
      '• 고양이: 하루 2~3회, 5~10분 놀이 (낚싯대, 레이저포인터)',
      '• 관절염 있는 경우: 수중 트레드밀, 수영이 부담 적어요',
      '',
      '【동반 질환 주의】',
      '비만이 심한 경우 간 지방증(지방간), 호흡곤란, 열사병 위험도 있어요.',
      '2~3개월 후 체중을 재측정해 목표를 재설정하세요.',
    ].join('\n')
  }

  // ── 예방접종 / 백신 ──────────────────────────────────────────────
  if (/예방접종|백신|접종\s*(시기|일정|주기|종류)|DHPPL|종합\s*백신|광견병\s*(백신|접종)|코로나\s*(백신|접종)|보르데텔라|켄넬코프|FVRCP|FeLV/.test(text)) {
    return [
      '💉 예방접종 안내',
      '',
      '백신 접종은 반려동물 건강의 기본이에요.',
      '',
      '【개 기본 접종 (Core)】',
      '• DHPPL (종합 5종): 홍역·파보·간염·파라인플루엔자·렙토스피라',
      '  - 8, 12, 16주령 3회 기초, 이후 1년마다 추가',
      '• 광견병: 12~16주령, 1년 후 추가, 이후 1~3년마다',
      '',
      '【개 선택 접종 (Non-core)】',
      '• 켄넬코프(보르데텔라): 합숙훈련소·미용실 이용 시',
      '• 코로나 장염: 선택적',
      '• 인플루엔자: 고위험군',
      '',
      '【고양이 기본 접종 (Core)】',
      '• FVRCP (3종): 헤르페스·칼리시·범백혈구감소증',
      '  - 8, 12, 16주령, 이후 1년 추가, 성묘 후 3년마다',
      '• 광견병: 실내·외 여부에 따라',
      '',
      '【고양이 선택 접종】',
      '• FeLV (백혈병): 외출 고양이에게 권장',
      '• FIV (에이즈): 국내 사용 제한적',
      '',
      '【접종 후 주의사항】',
      '• 당일 목욕·격렬한 운동 피하기',
      '• 접종 후 15~30분 병원 대기 (과민반응 모니터링)',
      '• 얼굴 붓기·두드러기·구토 → 즉시 병원',
      '',
      '중성화 수술 후에도 기본 접종 일정은 그대로 유지해요.',
    ].join('\n')
  }

  // ── 쿠싱증후군 심층 ──────────────────────────────────────────────
  if (/쿠싱\s*(증후군|약|치료|수치|PDH|ADH|트릴로스탄|리소드렌|미토탄|ACTH|코티솔)/.test(text)) {
    return [
      '🔬 쿠싱증후군(부신피질기능항진증) 심층 안내',
      '',
      '쿠싱증후군은 코티솔 과다 분비로 생기는 내분비 질환이에요.',
      '',
      '【babungee의 핵심 조언】',
      '"쿠싱약(트릴로스탄·미토탄)은 가급적 오전 중에, 잠에서 깨면 복용하세요 (공복 무관)."',
      '"비상용 스테로이드를 항상 보관하고 있어야 해요 — 응급 시 체내 스테로이드 보충이 필요해요."',
      '',
      '【주요 증상 (확인용)】',
      '• 물을 많이 마시고 소변을 많이 봄',
      '• 배가 처지거나 올챙이 배',
      '• 좌우 대칭 탈모',
      '• 피부가 얇아지고 석회화 반점',
      '• 무기력, 호흡 빠름',
      '',
      '【PDH vs ADH】',
      '• PDH (뇌하수체 의존형): 전체의 85~90%, 트릴로스탄으로 치료',
      '• ADH (부신 의존형): 부신 종양, 수술 또는 미토탄',
      '',
      '【치료 모니터링】',
      '• ACTH 자극 검사: 투약 4~6시간 후, 치료 시작 후 4주·3개월·6개월',
      '• 코티솔 목표: 1~5 μg/dL (투약 후)',
      '• 과도한 억제 증상: 무기력, 식욕 완전 상실 → 즉시 수의사 연락',
      '',
      '【동반 관리】',
      '당뇨, 고혈압, 혈전증이 동반될 수 있어요. 종합 검사가 필요해요.',
    ].join('\n')
  }

  // ── 영양/보충제 ───────────────────────────────────────────────────
  if (/오메가[-\s]*3|피쉬오일|글루코사민|콘드로이틴|코큐텐|CoQ10|비타민[CE]|아연|셀레늄|프로바이오틱|유산균\s*(보충|급여)|영양제\s*(추천|필요|좋은)/.test(text)) {
    return [
      '💊 반려동물 영양보충제 안내',
      '',
      '보충제는 "도움이 될 수 있지만" 완치·예방 효과를 과신하지 않는 게 좋아요.',
      '',
      '【근거 있는 보충제】',
      '• 오메가-3 (피쉬오일): 피부·관절·심장·신장 건강에 도움',
      '  - 개: EPA+DHA 20~55mg/kg/일, 고양이: 20~40mg/kg/일',
      '  - 반드시 중금속 검사된 제품 선택',
      '• 글루코사민+콘드로이틴: 관절염 진행 지연 (효과는 개체마다 달라요)',
      '• 프로바이오틱스: 항생제 복용 중, 소화기 문제 시 유익',
      '• CoQ10 (코큐텐): 심장병 동반 시 항산화 보조',
      '',
      '【주의가 필요한 경우】',
      '• 비타민D·칼슘: 과다 시 결석·독성 가능 — 임의 보충 주의',
      '• 사람용 보충제: 사람에게 안전해도 반려동물에게 위험할 수 있어요',
      '• 신장병: 인 함량 높은 제품 피하기',
      '',
      '【식욕 부진 시 기호성 향상】',
      '• 닭고기 육수, 참치 물(소량), 습식 사료 혼합',
      '• 인 함량 확인 후 신장병 동물에게는 주의',
      '',
      '어떤 목적으로 보충제를 찾으시는지 알려주시면 더 구체적으로 안내드릴게요!',
    ].join('\n')
  }

  // ── 전염병 / 켄넬코프 / 파보 / 홍역 ────────────────────────────
  if (/켄넬코프|파보|파르보|홍역\s*(바이러스|개)|디스템퍼|렙토스피라|지아르디아|전염병\s*(예방|치료|격리)|격리\s*(필요|해야)/.test(text)) {
    return [
      '🦠 전염병 안내',
      '',
      '전염병은 빠른 진단과 격리가 핵심이에요.',
      '',
      '【켄넬코프 (기관기관지염)】',
      '• 원인: 보르데텔라 + 바이러스 복합 감염',
      '• 증상: 거위 울음 같은 기침, 역류 구역질',
      '• 치료: 항생제, 기침 억제제',
      '• 전파: 호흡기 분비물 — 다른 개와 격리 필요',
      '',
      '【파보바이러스 (파르보)】',
      '• 증상: 심한 혈변, 구토, 무기력, 급격한 체중 감소',
      '• 예후: 빠른 치료가 없으면 치사율 높음',
      '🚨 새끼 강아지에서 혈변 + 구토 → 즉시 응급',
      '• 바이러스는 환경에서 수개월 생존 → 소독 중요',
      '',
      '【홍역 (디스템퍼)】',
      '• 증상: 발열, 콧물, 눈곱 → 신경 증상(발작·경련)',
      '• 예방접종이 최선, 치료는 증상 완화가 주목표',
      '',
      '【렙토스피라】',
      '• 물·흙·쥐 오줌을 통해 전파',
      '• 급성 신부전·간부전 유발 가능',
      '• 사람에게도 전파되는 인수공통전염병',
      '',
      '【격리 지침】',
      '• 전염병 의심 시 다른 동물과 즉시 격리',
      '• 배설물·분비물 오염된 곳 소독 (파르보: 락스 1:30 희석)',
    ].join('\n')
  }

  // ── 갑상선기능항진증 (고양이) ────────────────────────────────────
  if (/갑상선\s*기능\s*항진|갑항|메티마졸|methimazole|방사성\s*요오드|갑상선\s*(항진|수치\s*높|T4\s*높)/.test(text)) {
    return [
      '🐱 고양이 갑상선기능항진증 안내',
      '',
      '고양이에게 매우 흔한 내분비 질환이에요. 치료 반응이 좋아요.',
      '',
      '【주요 증상】',
      '• 체중 감소인데 오히려 식욕이 왕성함',
      '• 활동성 증가, 안절부절, 공격적 성향',
      '• 과도한 발성(밤에 울기)',
      '• 구토, 설사',
      '• 심박수 증가 (빈맥)',
      '',
      '【babungee의 설명】',
      '"갑상선기능항진 같은 호르몬 과잉 질환은 심장을 빠르게 해요."',
      '"이 경우 빈맥은 갑상선 질환을 교정하면 함께 좋아질 수 있어요."',
      '"방치하면 심장 기능 저하, 신장 손상, 심한 경우 심정지까지 가능해요."',
      '',
      '【치료 옵션 3가지】',
      '1. 메티마졸(약물): 가장 흔히 사용, 매일 복용, 부작용 모니터링 필요',
      '2. 방사성 요오드(I-131): 완치율 높음, 격리 기간 필요 (비용은 약물보다 낮을 수 있음)',
      '3. 수술적 갑상선 절제: 마취 위험이 있어 노령 고양이에겐 주의',
      '',
      '【모니터링】',
      '• 메티마졸 투약 시작 후 2~4주에 혈액검사 (T4, 신장 수치)',
      '• 주의: 갑상선 치료 후 신장 기능이 오히려 나빠 보이는 경우가 있어요',
      '  (이전에 갑상선 항진이 신장을 "과보상"하고 있었기 때문이에요)',
      '',
      '약을 시작한 지 얼마나 됐나요?',
    ].join('\n')
  }

  // ── 복수·흉수 ─────────────────────────────────────────────────────
  if (/복수\s*(있|찼|빼|제거|천자|차오|저절로)|흉수\s*(있|찼|빼|제거)|배에\s*물\s*(찼|차)|배가\s*(빵빵|부어|부풀)/.test(text)) {
    return [
      '💧 복수·흉수 안내',
      '',
      '복수나 흉수는 증상이 아니라 다른 질환의 결과예요.',
      '',
      '【babungee의 말】',
      '"수의사에게 천자를 통해 복수 제거를 적극 요구하세요."',
      '"사용할 수 있는 이뇨제도 사용해야 해요."',
      '"복수는 그 자체로 상당한 제약과 고통을 수반하고 추가 문제를 유발할 수 있어요."',
      '',
      '【원인별 구분】',
      '• 간 질환 (간경변, 담낭 문제): 알부민 낮아져 복수 발생',
      '• 심장병 (우심부전): 체액이 복강에 고임',
      '• 저알부민혈증 (PLE, 신장 질환)',
      '• 종양 (복강 내): 악성 삼출물',
      '• FIP (고양이): 단백질 농도 높은 황색 복수',
      '',
      '【천자(Abdominocentesis)의 역할】',
      '• 압박 완화로 호흡·식욕 개선',
      '• 복수 분석으로 원인 파악 가능',
      '• 하지만 원인 치료 없이는 계속 차오름',
      '',
      '【이뇨제 치료】',
      '• 푸로세마이드(Furosemide) + 스피로노락톤 병용',
      '• 신장 수치·전해질 모니터링 필수',
      '',
      '【긴급 신호】',
      '🚨 호흡 곤란 + 복부 급격히 커짐 → 즉시 병원',
      '',
      '복수 원인이 무엇인지 알고 계신가요?',
    ].join('\n')
  }

  // ── 고양이 요로막힘 / FLUTD / 방광염 ────────────────────────────
  if (/요도\s*(막힘|폐색|카테터)|FLUTD|고양이\s*(소변|오줌)\s*(못|막힘|안보|폐색)|방광\s*경련|방광염\s*(고양이|반복)|핍뇨|무뇨/.test(text)) {
    return [
      '🐱 고양이 요로계 질환(FLUTD·요도막힘) 안내',
      '',
      '고양이의 요도막힘은 수시간 내 생명을 위협하는 응급이에요.',
      '',
      '【응급 신호】',
      '🚨 소변을 전혀 못 봄 + 화장실에 자주 들어감 → 즉시 응급 병원',
      '🚨 배에 힘주는데 소변 안 나옴',
      '🚨 고통스럽게 웅크림, 울음',
      '',
      '【FLUTD 원인들】',
      '• 특발성 방광염(FIC): 가장 흔함 — 스트레스, 수분 부족과 관련',
      '• 방광결석',
      '• 요도 플러그 (수컷 고양이에서 흔함)',
      '• 세균성 방광염 (암컷에 더 흔함)',
      '',
      '【카테터 시술 후 관리】',
      '• 퇴원 후 물을 충분히 마시게 하기',
      '• 습식사료로 수분 섭취 증가',
      '• 처방 사료(결석·방광염용) 지속',
      '• 재발 가능성이 높아요 — 증상 재발 시 즉시 병원',
      '',
      '【재발 예방】',
      '• 물 섭취량 늘리기: 흐르는 물(분수형 급수기)',
      '• 스트레스 줄이기: 화장실 개수 충분히, 환경 변화 최소화',
      '• 습식사료 위주 급여',
      '• 페로몬 디퓨저(Feliway) 사용 고려',
      '',
      '지금 소변을 조금이라도 보고 있나요?',
    ].join('\n')
  }

  // ── 단백뇨 / 저알부민 / 단백질누설증 ────────────────────────────
  if (/단백뇨|단백질\s*(누설|손실)|PLE|알부민\s*(낮|감소|부족)|저알부민|요단백|UPC\s*(높|비율)/.test(text)) {
    return [
      '🔬 단백뇨·저알부민혈증 안내',
      '',
      '단백질이 소변이나 소화관으로 새어나가면 부종·복수가 생길 수 있어요.',
      '',
      '【원인 분류】',
      '• 신성 단백뇨: 신장에서 단백질을 걸러내지 못함 (사구체신염, CKD)',
      '• PLE (단백질 누설 장질환): 장에서 단백질 흡수 불량 또는 누출',
      '• 간 합성 저하: 간부전으로 알부민 생산 감소',
      '',
      '【babungee의 조언】',
      '"단백뇨 여부를 확인하려면 뇨 검사에서 단백질 농도를 체크해야 해요."',
      '"면역 복합체가 신장에 침착된 경우 스테로이드에 반응하지 않으면 다른 면역억제제가 필요해요."',
      '',
      '【UPC (뇨단백/크레아티닌 비율) 기준】',
      '• < 0.2: 정상',
      '• 0.2~0.5: 경계',
      '• > 0.5: 단백뇨 (치료 필요)',
      '',
      '【치료 방향】',
      '• 신장성: ACE억제제(베나제프릴, 에나라프릴) → 단백질 누출 감소',
      '• PLE: 저지방 고소화성 처방식, 스테로이드(면역매개인 경우)',
      '• 저알부민 심한 경우: 콜로이드 수액, 신선냉동혈장',
      '',
      '알부민 수치가 얼마나 나왔나요?',
    ].join('\n')
  }

  // ── 방사선 치료 ───────────────────────────────────────────────────
  if (/방사선\s*(치료|병원|조사|치료\s*센터)|RT\b|방사선\s*(종양|암|뇌종양)|정위\s*방사선|SBRT|방사성\s*요오드/.test(text)) {
    return [
      '☢️ 방사선 치료 안내',
      '',
      '반려동물 방사선 치료는 국내에도 점차 시설이 늘고 있어요.',
      '',
      '【방사선 치료가 필요한 경우】',
      '• 수술로 완전 제거가 어려운 종양',
      '• 뇌종양, 비강 종양, 구강 종양',
      '• 수술 후 잔존 종양 제거',
      '',
      '【방사성 요오드(I-131) — 고양이 갑상선항진 치료】',
      'babungee의 말: "방사성 요오드 치료는 방사선 치료와 다르게 훨씬 저렴할 수 있어요."',
      '• 완치율 95% 이상',
      '• 입원 격리 기간(방사성 물질 배출 동안) 필요 — 보통 1~2주',
      '• 서울·수도권 일부 병원에서 시행 중',
      '',
      '【외부 방사선 치료(RT)】',
      '• 보통 10~20회 세션, 매일 또는 격일 방문',
      '• 매 세션마다 전신마취 필요',
      '• 부작용: 피부 발적, 점막 손상 (구강·눈 주변)',
      '• 부작용 관리: 보습제, 항구토제, 스테로이드 국소',
      '',
      '【고려사항】',
      '• 비용이 높고 전문 시설이 제한적이에요',
      '• 항암 치료와 병행 여부, 치료 목표(완치 vs 완화)를 수의사와 상의하세요',
      '',
      '어떤 종양에 방사선 치료를 고려하고 계신가요?',
    ].join('\n')
  }

  // ── 종양 수술 후 / 절제 후 관리 ──────────────────────────────────
  if (/수술\s*(후|뒤)\s*(관리|회복|케어|봉합|상처)|절제\s*(후|수술)|종양\s*제거\s*(후|수술)|봉합\s*(부위|선|실)|수술\s*부위\s*(붓|빨|열|염증|터)/.test(text)) {
    return [
      '🏥 수술·절제 후 회복 안내',
      '',
      '수술 후 관리가 회복 속도에 큰 영향을 미쳐요.',
      '',
      '【기본 수술 후 관리】',
      '• 넥카라 착용: 봉합 부위 핥지 않도록 (최소 2주)',
      '• 절식 후 점진적 식이: 마취 후 소화가 쉬운 음식부터',
      '• 활동 제한: 케이지 안정, 계단 오르내리기 금지',
      '',
      '【수술 후 구토】',
      '"수술 후 구토는 마취 부작용으로 흔해요."',
      '"소화가 쉬운 것을 소량씩 자주 주세요. 오래 지속되면 수의사에게 연락하세요."',
      '',
      '【봉합 부위 체크 (매일)】',
      '✅ 정상: 약간의 부종, 분홍빛 피부',
      '⚠️ 주의: 삼출물(투명하거나 약간 분홍빛)',
      '🚨 즉시 병원: 화농성 분비물(노란/초록), 봉합선 벌어짐, 봉합 부위 발열·심한 부종',
      '',
      '【항생제·진통제 복용】',
      '• 처방 기간 끝까지 복용',
      '• 통증 신호: 움츠림, 먹지 않음, 만지면 회피',
      '• 임의로 사람 진통제(이부프로펜, 아세트아미노펜) 절대 금지',
      '',
      '【재발 모니터링 (종양 수술 후)】',
      '• 절제 마진이 충분하지 않은 경우 재발 가능성',
      '• 수술 후 조직검사 결과 확인 필수',
      '• 1~3개월 후 재검 예약',
    ].join('\n')
  }

  // ── TCC / 방광암 ──────────────────────────────────────────────────
  if (/TCC|방광암|이행세포암|방광\s*(종양|암|암종)|방광\s*(폴립|혹)|NSAID\s*(방광|암)|피록시캄|방광\s*내시경/.test(text)) {
    return [
      '🫧 방광 종양(TCC/이행세포암) 안내',
      '',
      '방광 종양은 소형견에서 드물지 않고, 맞춤 치료로 진행을 늦출 수 있어요.',
      '',
      '【babungee의 말】',
      '"수술적 제거가 어려운 경우 다양한 치료 옵션이 있어요."',
      '"적극적 항암, 현상유지, 진행 억제 중 현명한 선택이 필요해요."',
      '',
      '【주요 증상】',
      '• 혈뇨, 잦은 배뇨 시도, 소변 줄기 약해짐',
      '• 소변 시 통증, 세균성 방광염과 증상 유사',
      '',
      '【진단】',
      '• 초음파: 방광 내 종괴 확인',
      '• 소변 세포검사 또는 방광 내시경 생검으로 확진',
      '',
      '【치료 옵션】',
      '1. 피록시캄(NSAID): 단독 또는 항암제와 병용 — COX-2 억제로 종양 진행 억제',
      '2. 항암 화학요법: 비누크리스틴, 시스플라틴(신장 기능 양호 시)',
      '3. 수술: 방광 삼각부에 위치한 경우 완전 제거 어려움',
      '4. 방사선 치료: 일부 센터에서 가능',
      '',
      '【소변 막힘 주의】',
      '🚨 방광암이 요도 입구를 막으면 응급이에요',
      '소변을 못 본다면 즉시 응급 병원으로',
      '',
      '지금 어떤 증상이 있고, 진단은 어떻게 받으셨나요?',
    ].join('\n')
  }

  // ── 고관절 이형성 / 엉덩이 관절 ─────────────────────────────────
  if (/고관절\s*(이형성|탈구|수술|이상)|엉덩이\s*(관절|통증)|HD\b|FHO|THR|대퇴골\s*(두|두부)|앉기\s*(힘들|거부|어려)/.test(text)) {
    return [
      '🦴 고관절 이형성 안내',
      '',
      '고관절 이형성은 대형견에서 흔하며 조기 발견이 중요해요.',
      '',
      '【증상】',
      '• 뒷다리 절뚝거림, 특히 운동 후',
      '• 앉는 자세가 불안정하거나 양쪽으로 벌어짐',
      '• 계단 오르내리기 거부',
      '• 근육 발달 좌우 비대칭',
      '',
      '【보존 치료】',
      '• 체중 관리: 가장 효과적인 방법',
      '• 저충격 운동: 수영, 수중 트레드밀',
      '• 항염증제(NSAID), 통증 관리',
      '• 글루코사민·오메가-3 보충제',
      '',
      '【수술 옵션】',
      '• TPO/DPO: 어릴 때(5~8개월) — 관절 형태 교정',
      '• FHO (대퇴골두 절제술): 작은 견종에 효과적',
      '• THR (전체 고관절 치환술): 완전한 관절 기능 회복 가능',
      '',
      '【일상 관리】',
      '• 미끄럼 방지 바닥',
      '• 소파·침대 낮은 계단 또는 경사대 설치',
      '• 추운 날 더 통증 심해지므로 보온 유지',
    ].join('\n')
  }

  // ── 고양이 CKD 관리 심층 ─────────────────────────────────────────
  if (/고양이\s*(신부전|신장병|CKD|크레아틴|크레아티닌)|묘\s*(신부전|신장)|고양이\s*(IRIS\s*(1|2|3|4)단계|신장\s*수치)/.test(text)) {
    return [
      '🐱 고양이 만성신부전(CKD) 관리 안내',
      '',
      '고양이 CKD는 IRIS 단계에 따라 관리 방법이 달라요.',
      '',
      '【IRIS 단계 및 크레아티닌 기준】',
      '• Stage 1: < 1.6 mg/dL — 초기, 음수량 증가에 집중',
      '• Stage 2: 1.6~2.8 mg/dL — 신장 처방식 시작 고려',
      '• Stage 3: 2.9~5.0 mg/dL — 적극적 관리, 인흡착제, 피하수액',
      '• Stage 4: > 5.0 mg/dL — 심각 단계, 집중 치료',
      '',
      '【핵심 관리】',
      '• 수분 섭취 증가: 분수형 급수기, 습식사료 필수',
      '• 신장 처방식: 저인·저단백·저나트륨',
      '• 인흡착제: 알매딘, 렌벨라 — 인 수치 < 4.5mg/dL 목표',
      '• 피하수액: 집에서 시행 가능, 통상 250~500mL/회',
      '• 혈압 관리: 고혈압은 신장 악화 가속 → 암로디핀',
      '',
      '【모니터링 주기】',
      '• Stage 1~2: 6개월마다',
      '• Stage 3: 3개월마다',
      '• Stage 4: 1개월 이하',
      '',
      '【고양이 CKD 특이사항】',
      '• 고양이는 개보다 구토·식욕부진이 더 심해요',
      '• 마레조산(Maropitant) 구역질 완화에 효과적',
      '• 저칼륨혈증: 근육 약화, 목 처짐 → 칼륨 보충 필요',
    ].join('\n')
  }

  // ── 병원 선택 / 전문과목 / 2차병원 ──────────────────────────────
  if (/어느\s*병원|병원\s*(추천|선택|2차|전문|대학|대형)|2차\s*병원|전문\s*(병원|수의사)|대학병원\s*(수의|동물)|심장\s*전문|안과\s*전문|종양\s*(전문|내과)/.test(text)) {
    return [
      '🏥 병원 선택 안내',
      '',
      '증상 또는 질환에 따라 적합한 병원 유형이 달라요.',
      '',
      '【동네 1차 동물병원】',
      '• 정기 건강검진, 예방접종, 일상 질환',
      '• 경증 질환, 만성 질환 모니터링',
      '',
      '【2차·전문 병원을 고려할 때】',
      '• 희귀하거나 복잡한 진단이 필요한 경우',
      '• MRI, CT, 내시경 등 특수 장비 필요',
      '• 전문과: 심장내과, 신경과, 종양내과, 안과, 정형외과',
      '• 치료 반응이 없거나 1차 병원에서 진단이 안 나올 때',
      '',
      '【babungee의 조언】',
      '"질문을 정확하게 잘 할 수 있게 되면 어떤 병원에서도 더 나은 서비스를 받을 수 있어요."',
      '',
      '【수의대 부속 동물병원】',
      '• 서울대, 건국대, 충남대, 전북대 등',
      '• 복잡한 케이스, 교육 목적 → 다양한 전문의 접근 가능',
      '• 대기시간이 길 수 있어요',
      '',
      '【응급 상황 시】',
      '가장 가까운 24시간 응급 병원으로 우선 방문하는 것이 중요해요.',
      '병원 수준보다 빠른 처치가 먼저예요.',
    ].join('\n')
  }

  // ── 열사병 / 일사병 / 과열 ──────────────────────────────────────
  if (/열사병|일사병|과열|체온\s*(높|올라|40|41|42)|더위\s*(먹|탄|중독)|뜨거운\s*(날씨|차)/.test(text)) {
    return [
      '🌡️ 열사병(과열) 응급 처치 안내',
      '',
      '🚨 열사병은 수 분~수 시간 내 생명을 위협할 수 있어요.',
      '',
      '【즉시 할 것 (병원 이동 전)】',
      '1. 즉시 시원한 곳으로 이동 (그늘, 에어컨)',
      '2. 젖은 수건으로 발바닥, 겨드랑이, 목 부분 덮기',
      '3. 선풍기 바람으로 증발 냉각 (얼음은 금지 — 혈관 수축)',
      '4. 의식 있으면 물을 조금씩 핥게 해주기',
      '5. 즉시 병원으로 이동 (이동 중에도 냉각 유지)',
      '',
      '【하지 말 것】',
      '❌ 얼음 직접 접촉 — 혈관 수축으로 오히려 위험',
      '❌ 찬물에 몸 전체 담그기',
      '❌ 강제로 물 먹이기 (흡인 위험)',
      '',
      '【열사병 후 합병증 (babungee)】',
      '"심하면 응고 장애, 장출혈도 가능해요."',
      '"염증 수치가 높게 나올 수 있어 항생제 치료가 필요할 수 있어요."',
      '',
      '【고위험군】',
      '• 단두종(퍼그, 불독, 페르시안): 호흡 효율이 낮아 특히 위험',
      '• 비만, 노령, 심장병 동반',
      '• 더운 차 안에 혼자 있을 때 (20분 내 치명적 수준)',
      '',
      '지금 체온이 얼마나 되나요? (38.5°C 초과면 응급)',
    ].join('\n')
  }

  // ── 독성 음식 / 식물 심층 ────────────────────────────────────────
  if (/포도\s*(먹었|섭취|독|중독)|마카다미아|양파\s*(먹|독)|초콜릿\s*(먹|독|중독)|자일리톨|커피\s*(?:원두|먹)|아보카도|리크|부추\s*(독|먹)|독성\s*(식물|음식|물질)/.test(text)) {
    return [
      '⚠️ 반려동물 독성 음식·식물 안내',
      '',
      '아래 음식들은 절대 먹이지 마세요.',
      '',
      '【즉시 응급인 것들】',
      '• 자일리톨 (무설탕 껌·사탕): 저혈당 + 간부전 — 30분 내 증상',
      '• 초콜릿·코코아: 심박 이상, 발작 가능',
      '• 포도·건포도: 신부전 (양이 적어도 위험)',
      '• 마카다미아 너트: 신경·근육 독성',
      '• 양파·파·마늘·부추: 적혈구 파괴 (하인츠체 빈혈)',
      '',
      '⚠️ 섭취 직후라면: 즉시 동물병원으로 — 구토 유도가 가능한 시간이 있어요',
      '',
      '【24시간 내 나타나는 증상들】',
      '• 자일리톨: 구토, 무기력, 발작',
      '• 포도: 구토, 설사, 무뇨(소변 감소)',
      '• 양파류: 창백한 잇몸, 무기력, 적갈색 소변',
      '• 초콜릿: 흥분, 구토, 빈맥, 발작',
      '',
      '【위험 식물 (삼킨 경우)】',
      '• 릴리(백합): 고양이에게 치명적인 신부전',
      '• 디기탈리스(폭스글로브): 심장 독성',
      '• 아이비, 포인세티아: 소화기 자극',
      '• 알로에: 설사, 구토',
      '',
      '얼마나, 언제 먹었는지 알고 계신가요?',
    ].join('\n')
  }

  // ── 항암 부작용 관리 ──────────────────────────────────────────────
  if (/항암\s*(부작용|후|중|반응|주사|약|치료)|화학\s*요법\s*(부작용|후)|항암\s*(구토|설사|식욕|피로|탈모)/.test(text)) {
    return [
      '💊 항암 치료 중 부작용 관리 안내',
      '',
      '항암 부작용은 약의 종류와 개체마다 달라요.',
      '',
      '【babungee의 말】',
      '"경구 항암제는 부작용을 많이 개선했지만, 정맥주사 항암제는 부작용이 심한 대신 암세포를 죽이는 힘이 강해요."',
      '"매 회차 항암 후 치료 효과와 부작용을 같이 비교해 보세요."',
      '',
      '【흔한 부작용 및 대응】',
      '● 구역·구토: 항구토제(마레조산), 소량씩 자주 급여',
      '● 식욕부진: 따뜻한 음식, 기호성 높은 습식 사료',
      '● 설사: 블랜드 식이(닭+쌀), 프로바이오틱스',
      '● 피로·무기력: 무리한 운동 금지, 충분한 휴식',
      '● 구강 궤양: 연한 음식, 차가운 물로 헹굼',
      '',
      '【즉시 병원이 필요한 부작용】',
      '🚨 혈변·혈뇨',
      '🚨 39.5°C 이상 발열 + 무기력',
      '🚨 24시간 동안 물을 전혀 안 마심',
      '🚨 심한 호흡곤란',
      '',
      '【호중구 감소 (면역 저하) 기간】',
      '• 항암 후 7~14일이 가장 위험한 시기예요',
      '• 이 기간 다른 동물과 접촉 제한',
      '• 발열 즉시 병원 (감염 위험)',
      '',
      '몇 차 항암이고, 어떤 약을 사용 중인가요?',
    ].join('\n')
  }

  // ── 세균성 방광염 / 요로 감염 ────────────────────────────────────
  if (/방광염\s*(세균|재발|반복|치료|만성)|요로\s*(감염|염)|세균\s*(방광|요로)|소변\s*(냄새|탁한|걸쭉)|소변\s*배양|소변\s*검사\s*(결과|나쁨)/.test(text)) {
    return [
      '🔬 세균성 방광염(요로감염) 안내',
      '',
      '반복되는 방광염은 원인 파악이 중요해요.',
      '',
      '【babungee의 핵심 조언】',
      '"대부분의 감염 원인균은 환경에 늘 있어요. 면역이나 환경 요인이 변할 때 문제를 일으키죠."',
      '"항생제만으로 완전 해결이 안 되는 경우, 근본 원인(해부학적 이상, 면역 문제)을 찾아야 해요."',
      '',
      '【주요 증상】',
      '• 자주 소변 보려고 하지만 소량만 나옴',
      '• 소변에 피 (혈뇨), 탁하거나 냄새 심함',
      '• 배뇨 시 통증 (웅크리며 울거나 화장실 앞에서 멈춤)',
      '',
      '【진단】',
      '• 소변검사 (요침사): 세균, WBC, 혈액 확인',
      '• 소변 배양 및 감수성 검사: 맞는 항생제 선택',
      '• 초음파: 방광벽 두께, 결석 여부 확인',
      '',
      '【치료】',
      '• 항생제: 배양 결과에 맞는 것 선택 (1~2주)',
      '• 재발성이면: 더 긴 항생제 코스 또는 예방적 항생제',
      '• 수분 섭취 증가: 방광을 자주 비우는 것이 도움',
      '',
      '【재발 예방】',
      '• 물 섭취 늘리기',
      '• 여성 개체: 음부 주변 청결 유지',
      '• 비뇨기 처방식 또는 크랜베리 추출물 보조',
      '',
      '소변 배양 검사를 받아 본 적 있나요?',
    ].join('\n')
  }

  // ── 관절염 심층 / 골관절염 ───────────────────────────────────────
  if (/관절염|골관절염|퇴행성\s*관절|OA\b|관절\s*(통증|아픔|약|치료|염증|주사)|관절\s*(보호|건강)|리마드릴|메타캄|가바펜틴\s*관절/.test(text)) {
    return [
      '🦴 관절염(골관절염) 심층 안내',
      '',
      '관절염은 완치보다 통증 관리와 진행 억제가 목표예요.',
      '',
      '【주요 증상】',
      '• 아침에 일어날 때 뻣뻣해 보임',
      '• 계단 오르내리기 주저',
      '• 특정 다리를 들거나 절뚝거림',
      '• 점프나 눕기를 피함',
      '• 추운 날 더 심해짐',
      '',
      '【약물 치료】',
      '• NSAID (멜록시캄, 카프로펜): 가장 효과적인 진통제',
      '  - 장기 복용 시 신장·간 모니터링 필수',
      '• 가바펜틴: 신경병증성 통증에 추가',
      '• 트라마돌: 중등도~중증 통증',
      '• 관절 내 주사(스테로이드 또는 PRP): 단기 효과',
      '',
      '【비약물 관리】',
      '• 체중 감량: 가장 효과적 (체중 1kg 감소 = 관절 부담 4kg 감소)',
      '• 수중 재활: 관절에 부담 없이 근력 강화',
      '• 레이저 치료: 통증·염증 완화',
      '• 침 치료: 일부 케이스에서 효과',
      '• 오메가-3: 항염증 효과',
      '',
      '【집에서 환경 조절】',
      '• 미끄럼 방지 매트',
      '• 낮은 밥그릇, 높이가 낮은 화장실',
      '• 소파·침대 경사대 설치',
      '• 발 아래 따뜻한 매트 (따뜻할수록 통증 감소)',
    ].join('\n')
  }

  // ── 마취 위험·준비 ────────────────────────────────────────────────
  if (/마취\s*(위험|부작용|전|준비|걱정|무서|안전|기저질환)/.test(text)) {
    return [
      '😴 마취 위험성 및 사전 준비 안내',
      '',
      '마취는 충분한 사전 평가로 위험을 크게 줄일 수 있어요.',
      '',
      '【babungee의 말】',
      '"기저질환이 없다면 치과·수술 마취를 망설일 이유가 없어요."',
      '"기저질환이 있어도 충분한 상담과 모니터링 하에 적절한 마취를 한다면 안전할 수 있어요."',
      '',
      '【마취 전 필수 검사】',
      '• 혈액검사: 신장·간 기능, 혈구 수',
      '• 흉부X-ray: 심폐 이상 여부',
      '• 심전도(ECG): 부정맥 확인',
      '• 심장병 의심 시: 심초음파',
      '',
      '【마취 위험도를 높이는 요인】',
      '• 노령 동물 (고령 자체는 절대 금기 아님)',
      '• 비만',
      '• 단두종 (퍼그, 불독): 기도 좁아 주의',
      '• 심장병, 신장병 동반',
      '• 빈혈',
      '',
      '【마취 후 주의사항】',
      '"마취 후 거위 소리 같은 기침: 기도삽관으로 목 안이 일시적으로 부은 것으로, 시간이 지나면 사라져요."',
      '• 완전히 깨어날 때까지 혼자 두지 않기',
      '• 당일 음식은 완전히 깨어난 후 소량만',
      '• 비틀거림·과도한 침: 마취 잔류 효과 — 12~24시간 내 사라져요',
      '',
      '어떤 수술이나 처치를 앞두고 계신가요?',
    ].join('\n')
  }

  // ── 식욕 부진 심층 ────────────────────────────────────────────────
  if (/밥을?\s*(안\s*먹|거부|먹지\s*않|못\s*먹)|식욕\s*(없|부진|감소|저하)|밥\s*(거부|통|\s*안\s*먹|안\s*먹으)/.test(text)) {
    return [
      '🍽️ 식욕 부진 안내',
      '',
      '식욕 부진의 원인은 매우 다양해요.',
      '',
      '【원인 분류 (집에서 확인)】',
      '• 구강·치아 통증: 씹기 피함, 음식 흘림',
      '• 소화기 문제: 구토·설사 동반',
      '• 신장·간 문제: 무기력 동반, 물 많이 마심',
      '• 통증: 어딘가 아프면 식욕 감소',
      '• 스트레스: 환경 변화 후 갑자기 안 먹음',
      '• 사료 변경: 갑작스러운 변경 후 거부',
      '',
      '【집에서 먼저 시도할 것】',
      '1. 음식 따뜻하게 데우기 (향이 올라와서 식욕 자극)',
      '2. 습식 사료 또는 닭가슴살 삶은 것 소량 제공',
      '3. 손으로 먹여보기 (스트레스 관련이면 효과)',
      '4. 먹는 양은 적어도 물은 마시고 있는지 확인',
      '',
      '【병원이 필요한 경우】',
      '🚨 48시간 이상 완전히 안 먹음',
      '🚨 물도 안 마심',
      '🚨 구토·설사 동반',
      '🚨 무기력, 체온 이상',
      '🚨 고양이가 48시간 이상 안 먹으면 → 지방간 위험 (즉시 병원)',
      '',
      '【병원에서 처방받을 수 있는 것】',
      '• 식욕자극제: 미르타자핀 (고양이: 귀에 바르는 제형)',
      '• 구역질 억제제: 마레조산',
      '• 강제 급여: 주사기로 먹이는 방법 안내',
      '',
      '마지막으로 밥을 먹은 게 언제이고, 다른 증상은 없나요?',
    ].join('\n')
  }

  // ── 두드러기 / 피부 발진 / 알레르기 반응 ────────────────────────
  if (/두드러기|피부\s*(발진|부어|부풀|빨개|울긋불긋|혹|뽀루지)|알레르기\s*(반응|쇼크)|아나필락시스|접종\s*후\s*(얼굴|눈|부어)|주사\s*후\s*(붓|부어)/.test(text)) {
    return [
      '🔴 피부 발진·두드러기·알레르기 반응 안내',
      '',
      '알레르기 반응 정도에 따라 대응이 달라요.',
      '',
      '【즉각 응급 (아나필락시스)】',
      '🚨 접종·약물 후 수 분~1시간 내 얼굴 붓기, 구토, 창백한 잇몸, 실신',
      '→ 즉시 응급 병원 — 에피네프린 처치가 필요할 수 있어요',
      '',
      '【일반 두드러기】',
      '• 특정 음식, 벌레 물림, 접촉 알레르기',
      '• 얼굴·눈 주변 부종, 온몸에 혹 같은 발진',
      '• 경증: 항히스타민제(클로르페니라민, 세티리진)',
      '• 중등도 이상: 스테로이드 단기 사용',
      '',
      '【심초음파 후 피부 문제 (babungee)】',
      '"제모기에 의한 열상일 수 있어요. 젤 알레르기보다 제모 과정 확인을 권장해요."',
      '',
      '【접종 후 알레르기 예방】',
      '• 접종 후 15~30분 병원 대기',
      '• 이전 알레르기 반응이 있었다면 반드시 의료진에게 알리기',
      '• 다음 접종 시 전처치(항히스타민제)를 고려할 수 있어요',
      '',
      '【집에서 관찰할 것】',
      '발진 외에 호흡이 가빠지거나 무기력하면 즉시 응급 방문이 필요해요.',
    ].join('\n')
  }

  // ── 약 먹이기 / 투약 방법 ────────────────────────────────────────
  if (/약\s*(먹이는|먹이기|어떻게|방법|거부|뱉|토해|숨겨|삼키지)/.test(text)) {
    return [
      '💊 약 먹이는 방법 안내',
      '',
      '거부하는 반려동물에게 약 먹이는 실용적인 팁이에요.',
      '',
      '【알약/캡슐 먹이는 법】',
      '1. 간식 속에 숨기기: 치즈, 참치, 닭가슴살 속에 넣기',
      '2. 필 포켓(Pill Pocket): 약 전용 간식',
      '3. 직접 투여: 입을 열어 혀 뒤쪽에 놓고 입 다물게 한 후 목 쓸어내리기',
      '4. 캡슐을 열어 습식 사료에 섞기 (가루 종류에 따라 다름 — 먼저 확인)',
      '',
      '【액체 약 먹이는 법】',
      '• 주사기로 입 옆쪽에 조금씩 넣기',
      '• 너무 빠르면 기도로 넘어갈 수 있으니 천천히',
      '',
      '【약 종류별 주의사항】',
      '• 공복 복용 필수인 약: 음식과 함께 주면 효과 감소',
      '• 식후 복용 권장 약: 위장 보호 목적',
      '• 항생제: 시간 간격을 지켜서 복용 (12시간 간격이면 12시간 유지)',
      '• 스테로이드: 갑자기 중단 금지',
      '',
      '【약을 토하는 경우】',
      '• 투여 직후(30분 내) 토했다면 → 반 용량만 재투여 가능',
      '• 확실하지 않으면 수의사에게 연락',
      '',
      '어떤 약을 먹이는 게 어려우신가요?',
    ].join('\n')
  }

  // ── 혈액검사 해석 ────────────────────────────────────────────────
  if (/혈액검사\s*(결과|수치|해석|봐주세요|이게\s*뭔|어떻게\s*봐야)|ALT|AST|BUN|크레아티닌|크레아틴|혈구\s*수치|CBC\s*결과|WBC\s*높|ALT\s*높|ALT\s*수치/.test(text)) {
    return [
      '🔬 혈액검사 결과 해석 안내',
      '',
      '검사 수치 하나보다 전체적인 맥락이 중요해요.',
      '',
      '【주요 수치 빠른 안내】',
      '● ALT (간세포 손상): 정상 10~100 U/L / 높으면 간 손상, 지방간 의심',
      '● AST (간·근육): ALT보다 비특이적',
      '● BUN (신장·단백질 대사): 정상 7~25 mg/dL / 높으면 신장 문제 또는 탈수',
      '● 크레아티닌 (신장): 개 0.5~1.5 / 고양이 0.8~2.4 mg/dL',
      '● SDMA: 초기 신장 손상에 더 민감한 지표',
      '● WBC (백혈구): 정상 6~17 K/μL / 높으면 염증·감염, 낮으면 면역억제',
      '● PCV/헤마토크리트: 정상 37~55% / 낮으면 빈혈',
      '● 알부민: 정상 2.5~3.5 g/dL / 낮으면 간·신장·장 문제',
      '',
      '【babungee의 말】',
      '"BUN/Cre 수치만으로 신장 이상을 판단하기 전에 전해질 불균형, 음이온 갭도 종합 평가해야 해요."',
      '',
      '【검사 결과 활용법】',
      '• 단일 수치보다 추세(이전 vs 현재 비교)가 더 중요',
      '• 임상 증상과 함께 해석해야 해요',
      '• 결과가 걱정된다면 담당 수의사에게 구체적으로 물어보세요',
      '',
      '어떤 수치가 정상 범위를 벗어났나요?',
    ].join('\n')
  }

  // ── 후두마비 / 기침 심층 ─────────────────────────────────────────
  if (/후두마비|후두\s*(마비|기능|수술|타이백)|역구역\s*(기침|소리)|거위\s*(소리|울음|기침)|흡인\s*(위험|폐렴|기도)|식사\s*중\s*(기침|사레)/.test(text)) {
    return [
      '🎵 후두마비 안내',
      '',
      '후두마비는 후두가 제대로 열리지 않아 호흡이 어려워지는 질환이에요.',
      '',
      '【babungee의 말】',
      '"독세핀(항우울제 계열)이 일부 후두마비에서 효과를 나타낸 연구보고가 있어요."',
      '"경증은 항생제·항염증제·진정제로 관리 가능해요."',
      '"수술(타이백)은 후두 기능을 회복시키진 않지만 삶의 질을 매우 효과적으로 개선해요."',
      '"갑상선기능저하나 쿠싱과 연관될 수 있어요 — 함께 검사해야 해요."',
      '',
      '【주요 증상】',
      '• 운동 후 거위 소리 또는 쉰 목소리 기침',
      '• 더운 날 쉽게 헐떡임',
      '• 사레 걸림, 식사 중 기침',
      '• 운동 불내성 (산책 중 멈춤)',
      '',
      '【치료 방법】',
      '• 보존 치료: 흥분 최소화, 더운 환경 피하기, 체중 감량',
      '• 수술(편측 성대화음 고정술/타이백): 중증에 적용',
      '',
      '【수술 후 주의】',
      '• 흡인 폐렴: 수술 후 음식·물 사래 위험 증가',
      '• 높이 있는 그릇에서 급여 (목을 약간 위로)',
      '• 과도한 흥분 자제',
      '',
      '언제부터 증상이 있었고, 심해지고 있나요?',
    ].join('\n')
  }

  // ── 배변 훈련 / 대소변 실수 ──────────────────────────────────────
  if (/배변\s*(훈련|패드|실수|가리기|못가림)|화장실\s*(훈련|사용|거부|엉뚱한|밖에서)|대소변\s*(실수|못가림)|소변\s*(자꾸|실수|못가림)/.test(text)) {
    return [
      '🏠 배변 훈련 / 대소변 실수 안내',
      '',
      '배변 실수는 행동 문제와 건강 문제를 함께 확인해야 해요.',
      '',
      '【먼저 건강 문제 배제하기】',
      '• 갑자기 실수가 생겼다면: 방광염, 당뇨, 신부전 가능성',
      '• 노령에서 새로 생겼다면: 인지장애, 관절 통증으로 화장실 접근이 어려운 경우',
      '• 소변을 자주 조금씩 본다면: 방광 문제 확인 필요',
      '',
      '【배변 훈련 기본 원칙 (강아지)】',
      '1. 패드 위치는 항상 동일하게',
      '2. 식사 후 15~30분, 기상 직후, 놀이 후 → 즉시 패드로 유도',
      '3. 성공하면 즉시 칭찬·간식 (행동과 보상 사이 3초 이내)',
      '4. 실수는 조용히 치우기 — 혼내면 숨어서 하거나 더 불안해해요',
      '5. 냄새 제거 필수: 전용 효소 세정제 사용 (냄새 남으면 재방문)',
      '',
      '【고양이 화장실 거부】',
      '• 화장실 수: 고양이 수 + 1개 규칙',
      '• 크기: 충분히 넓게 (몸 길이 1.5배)',
      '• 모래: 고양이마다 선호 다름 → 2종 동시 제공해 선택하게',
      '• 위치: 조용한 곳, 밥그릇과 멀리',
      '',
      '실수가 최근에 갑자기 시작됐나요, 아니면 원래부터 훈련이 안 된 건가요?',
    ].join('\n')
  }

  // ── 동물 보호자 심리 / 보호자 감정 지원 ─────────────────────────
  if (/힘들어|너무\s*걱정|너무\s*무서|잠을\s*못\s*(자|잠)|밤새\s*울|우울|지쳐|포기\s*(하고\s*싶|할\s*것|하고\s*싶)|아이가\s*(아파|죽을|가면|가고)|슬프|감당\s*(이\s*안|할\s*수\s*없)|혼자\s*이런\s*(상황|일)/.test(text)) {
    return [
      '💙 보호자분의 마음을 위한 안내',
      '',
      '많이 힘드시겠어요. 이 감정은 당연한 거예요.',
      '',
      '사랑하는 반려동물이 아픈 것을 지켜보는 건 정말 고된 일이에요.',
      '잠 못 자고 걱정하고, 뭘 더 해줄 수 있을지 찾아다니는 것 — 그게 다 사랑이에요.',
      '',
      '【지금 상황을 조금 더 잘 견디는 법】',
      '• 모든 걸 혼자 해결하려 하지 않아도 돼요',
      '• 수의사에게 솔직하게 물어보는 것이 도움이 돼요',
      '• "내가 뭘 잘못했나"는 생각은 잠깐 내려놓으세요',
      '• 오늘 할 수 있는 것에만 집중해보세요',
      '',
      '【babungee의 말】',
      '"먼 미래를 걱정하기보다 오늘 배변패드를 갈아주고, 좋아하는 음식을 조금 더 챙겨주는 것이 중요해요."',
      '',
      '궁금한 것이 있으면 하나씩 물어봐주세요.',
      '조금이라도 도움이 되고 싶어요.',
    ].join('\n')
  }

  // ── 피하수액 방법 / 집에서 수액 ──────────────────────────────────
  if (/피하수액\s*(방법|집에서|어떻게|혼자|무서|찌르기|주사기)|집에서\s*(수액|피하수액)|수액\s*(집에서|혼자|주는\s*방법)/.test(text)) {
    return [
      '💉 집에서 피하수액 주는 방법 안내',
      '',
      '피하수액은 수의사에게 교육받은 후 집에서 할 수 있어요.',
      '',
      '【준비물】',
      '• 처방받은 링거액 (보통 하트만액 또는 생리식염수)',
      '• 수액 세트 (IV set), 주사바늘 (23~25G)',
      '• 알코올 솜',
      '',
      '【단계별 방법】',
      '1. 수액백을 높은 곳에 걸기 (중력으로 흐름)',
      '2. 수액 세트 연결 후 공기 제거',
      '3. 주사 부위: 어깨뼈 사이 느슨한 피부 (목 뒤쪽)',
      '4. 알코올로 닦은 후 피부를 살짝 집어 올려 45°로 찌르기',
      '5. 클램프 열어 수액 흘려보내기',
      '6. 보통 250~500mL, 10분 내외 소요',
      '7. 완료 후 바늘 제거, 살짝 눌러주기',
      '',
      '【주의사항】',
      '• 응어리(물주머니): 정상 — 수 시간 내 흡수돼요',
      '• 공기 방울이 들어가지 않도록 주의',
      '• 부은 곳이 딱딱하거나 빨개지면 감염 가능성 → 병원',
      '• 사용한 바늘은 날카로운 용기에 안전하게 폐기',
      '',
      '처음 하신다면 병원에서 한 번 시범을 보여달라고 요청하세요.',
    ].join('\n')
  }

  // ── 신부전 말기 / 크레아티닌 높음 ───────────────────────────────
  if (/크레아티닌\s*([5-9]|1[0-9]|[5-9]\.\d)|신부전\s*(말기|4기|IRIS\s*4|심각|어떻게)|신장\s*(망가|너무\s*안좋|수치가\s*(매우|너무|엄청)\s*높)/.test(text)) {
    return [
      '🏥 신부전 말기 관리 안내',
      '',
      '크레아티닌이 매우 높은 상태에서도 삶의 질을 유지하는 데 집중할 수 있어요.',
      '',
      '【이 단계에서 목표】',
      '"완치보다는 남은 시간 동안 편안하게, 통증 없이 지내는 것이 우선이에요."',
      '',
      '【지금 할 수 있는 것들】',
      '• 피하수액: 집에서 규칙적으로 → 탈수 완화, 독소 희석',
      '• 구역질·식욕부진: 마레조산, 미르타자핀 처방',
      '• 인 수치 관리: 인흡착제 (렌벨라, 알매딘) 지속',
      '• 혈압 관리: 고혈압이 신장 악화 가속 → 암로디핀',
      '• 빈혈: 다베포에틴(에리스로포이에틴 유사체) 또는 수혈',
      '',
      '【병원 방문보다 집에서 편안함이 우선인 시점도 있어요】',
      '"종양이든, 신부전이든 어느 시점에는 사용하던 약을 하나씩 빼야 해요."',
      '"통증을 줄여주고 증상을 완화하는 처치에 집중하세요."',
      '',
      '【지금 당장 병원이 필요한 경우】',
      '🚨 소변을 전혀 못 봄 (완전 무뇨)',
      '🚨 경련 또는 의식 저하',
      '🚨 입에서 암모니아 냄새 + 구토 반복 (요독증)',
      '',
      '지금 어떤 증상이 가장 힘드신가요? 집에서 무엇을 하고 있는지 알려주세요.',
    ].join('\n')
  }

  // ── 고양이 행동 문제 ──────────────────────────────────────────────
  if (/고양이\s*(공격|무는|할퀴|밤에\s*울|야간\s*발성|영역\s*표시|스프레이|집을\s*어지럽|물건\s*밀어|선반|올라|화장실\s*밖에)/.test(text)) {
    return [
      '🐱 고양이 행동 문제 안내',
      '',
      '고양이의 문제 행동에는 건강·환경·심리적 원인이 있어요.',
      '',
      '【밤에 울기/발성】',
      '• 노령 고양이: 인지장애 (치매) 가능성 → 신경학적 검사',
      '• 갑상선기능항진: 불안, 과도한 발성 → 갑상선 검사',
      '• 발정 (미중성화): 중성화 후 거의 해결',
      '• 환경 스트레스: 새 가족, 이사, 다른 동물',
      '',
      '【공격성】',
      '• 놀이 공격: 어릴 때 손으로 많이 놀아줘서 생김 → 장난감으로만',
      '• 통증 공격: 만지면 아파서 무는 경우 → 건강 검진',
      '• 공포 공격: 어떤 상황에서 공격하는지 패턴 파악',
      '',
      '【스프레이(소변 영역 표시)】',
      '• 중성화로 대부분 해결 (중성화 전이라면 우선 시행)',
      '• 이미 중성화된 경우: 스트레스 원인 찾기',
      '• 새 고양이 도입, 창문으로 외부 고양이 보임 등',
      '• 페로몬 디퓨저(Feliway): 영역 안정감 부여',
      '',
      '【화장실 밖 배변】',
      '• 화장실 개수·청결·위치·모래 종류 확인',
      '• 갑자기 생겼다면: 방광염·결석 검사 먼저',
      '',
      '어떤 행동이 언제부터 시작됐나요?',
    ].join('\n')
  }

  // ── 진드기 / 벼룩 / 외부기생충 ──────────────────────────────────
  if (/진드기|벼룩|옴\s*(진드기)?|개선충|귀\s*진드기|외부\s*기생충|브라베토|넥스가드|심파리카|방어\s*(약|제)|기생충\s*(예방|제거)/.test(text)) {
    return [
      '🦟 외부기생충 (진드기·벼룩) 관리 안내',
      '',
      '외부기생충은 예방이 가장 효과적이에요.',
      '',
      '【babungee의 말】',
      '"진드기·벼룩에 물렸다고 항상 심각한 전염병이 생기는 건 아니에요."',
      '"하지만 물린 후 수일 내 식욕부진·발열·무기력이 생기면 수의사를 방문하세요."',
      '',
      '【진드기 발견 시】',
      '1. 세밀 핀셋으로 최대한 피부 가까이 잡기',
      '2. 돌리지 말고 수직으로 천천히 잡아당기기',
      '3. 제거 후 알코올로 소독',
      '4. 제거한 진드기는 밀봉해서 버리기',
      '• 2~4주 내 이상 증상 관찰 (에를리키아, 바베시아)',
      '',
      '【예방약 종류】',
      '• 경구: 넥스가드(3개월), 브라베토(3개월), 심파리카(1개월)',
      '• 스팟온(피부 점적): 프론트라인, 애드보킷',
      '• 월 1회 정기적 투여가 중요해요',
      '',
      '【벼룩 감염 시】',
      '• 집 전체 처리 필요: 소파, 침구, 카펫',
      '• 환경 스프레이 + 동물 치료 동시에',
      '• 벼룩 알은 6개월 이상 생존 — 지속적 관리 필요',
      '',
      '현재 예방약을 사용하고 있나요?',
    ].join('\n')
  }

  // ── 고양이 변비 / 결장 문제 ──────────────────────────────────────
  if (/변비\s*(고양이|심한|만성)|거대결장|고양이\s*(변비|대변|대변\s*못)|락툴로스|관장|변\s*(못\s*봄|안\s*봄|안\s*나옴|3일|4일|5일)/.test(text)) {
    return [
      '🐱 고양이 변비·거대결장 안내',
      '',
      '고양이는 변비가 만성화되면 거대결장으로 진행할 수 있어요.',
      '',
      '【경고 신호】',
      '🚨 3일 이상 대변 못 봄 + 구토 또는 무기력',
      '🚨 배변 시도하지만 아무것도 안 나옴',
      '',
      '【집에서 먼저 시도】',
      '• 수분 증가: 습식사료, 물그릇 여러 곳에 배치',
      '• 락툴로스 (시럽): 수의사 처방 후 — 대변을 부드럽게',
      '• 운동 증가: 장 운동 자극',
      '• 식이 섬유: 플실리엄 허스크 (물과 함께)',
      '',
      '【병원 치료】',
      '• 관장: 집에서 무리하게 시도하지 마세요 — 직장 손상 위험',
      '• 수동 제거: 전신마취 후 진행',
      '• 거대결장 심한 경우: 수술(결장 절제술) 고려',
      '',
      '【만성 변비 예방】',
      '• 습식사료 위주 급여 (수분 섭취)',
      '• 락툴로스 장기간 관리',
      '• 정기적 체크: 2~4주마다 대변 상태 확인',
      '• 스트레스 관리 (화장실 환경 최적화)',
      '',
      '마지막으로 대변을 본 게 언제였나요?',
    ].join('\n')
  }

  // ── 다견/다묘 가정 관리 ───────────────────────────────────────────
  if (/다견|다묘|여러\s*마리|두\s*마리\s*(이상|키우)|새\s*(강아지|고양이)\s*(입양|도입|왔)|싸움|영역\s*(다툼|싸움)|사이가\s*(나쁨|안좋)/.test(text)) {
    return [
      '🐾 다견·다묘 가정 관리 안내',
      '',
      '여러 마리를 키울 때는 자원 분리와 점진적 도입이 핵심이에요.',
      '',
      '【새 동물 도입 단계】',
      '1주: 냄새 교환만 (서로 쓴 수건 교환)',
      '2주: 문 사이로 냄새·소리만 교환 (보지는 못하게)',
      '3주: 케이지 또는 문 열고 짧은 만남 (감독 하에)',
      '4주+: 점진적으로 함께하는 시간 늘리기',
      '',
      '【자원 분리 원칙】',
      '• 밥그릇·물그릇: 각자 따로, 거리 두고',
      '• 화장실: 고양이 수 + 1개',
      '• 숨을 수 있는 공간: 각자의 피신처 필요',
      '',
      '【싸움이 있을 때】',
      '• 쫓기는 동물이 숨을 수 있는 공간 필수',
      '• 먹이·장난감 주변 싸움: 영역 개념 있는 동물 → 순서 정해주기',
      '• 싸움 중 맨손 개입 금지 (물려요)',
      '• 페로몬 디퓨저: 갈등 완화에 도움',
      '',
      '【의료적 주의사항】',
      '• 전염병: 새 동물 입양 시 건강검진·예방접종 먼저',
      '• 격리 기간: 2주 관찰 후 합류 권장',
      '',
      '어떤 상황에서 갈등이 생기나요?',
    ].join('\n')
  }

  // ── 단두종 / 연구개 / 협착콧구멍 ───────────────────────────────
  if (/단두종|연구개\s*(과장|수술|비대)|협착\s*콧구멍|BOAS|퍼그|불독|시추|페르시안\s*(호흡|코)|프렌치불독\s*(호흡|코)|헐떡임\s*(심|과도|자주)/.test(text)) {
    return [
      '🐽 단두종 호흡기 증후군(BOAS) 안내',
      '',
      '퍼그, 불독, 시추, 프렌치불독 등 납작코 품종에게 흔한 문제예요.',
      '',
      '【BOAS 주요 특징】',
      '• 협착 콧구멍: 좁아서 호흡이 어려움',
      '• 과장된 연구개: 기도를 막아 코골이·역구역질',
      '• 기관 협착: 기도 자체가 좁음',
      '',
      '【증상】',
      '• 운동 후 과도한 헐떡임, 쉽게 지침',
      '• 수면 중 심한 코골이',
      '• 역구역질 (거위 소리)',
      '• 더운 환경에서 급격히 나빠짐',
      '• 파란 잇몸 (심할 때) → 즉시 응급',
      '',
      '【관리 방법】',
      '• 체중 관리: 비만은 BOAS 증상을 크게 악화시켜요',
      '• 더운 환경 피하기: 에어컨 항상 사용',
      '• 흥분 최소화',
      '• 하네스 사용: 목줄은 기도 압박 위험',
      '',
      '【수술 (BOAS 교정)】',
      '• 협착 콧구멍 확장 + 과장된 연구개 단축',
      '• 1~2세에 하면 평생 예후에 도움',
      '• 교정 후 생활 질이 크게 개선돼요',
      '',
      '지금 운동 중 또는 더울 때 증상이 어느 정도인가요?',
    ].join('\n')
  }

  // ── 지방종 / 지방 덩어리 / 혹 ───────────────────────────────────
  if (/지방종|지방\s*(덩어리|혹)|피부\s*(혹이|종양|덩어리)\s*(말랑|물렁|부드)|물렁\s*(혹|종|덩어리)|혹\s*(말랑|물렁|커지지|작아)|새로\s*생긴\s*혹/.test(text)) {
    return [
      '🔍 지방종·피부 혹 안내',
      '',
      '피부나 피부 아래 혹을 발견했을 때 모두 위험한 건 아니에요.',
      '',
      '【지방종(Lipoma)의 특징】',
      '• 말랑말랑하고 움직임',
      '• 피부 위가 아닌 피부 아래(피하)',
      '• 대부분 양성, 비교적 천천히 자람',
      '• 중성화 후, 노령에서 더 흔함',
      '',
      '【수술이 필요한 경우】',
      '• 급격히 커짐 (1개월에 눈에 띄게)',
      '• 움직임을 방해함 (관절 근처)',
      '• 피부가 헐거나 분비물이 나옴',
      '• 딱딱하거나 경계가 불분명',
      '• 조직검사에서 악성으로 나온 경우',
      '',
      '【비만세포종과의 구별】',
      '• 비만세포종: 만지면 빨개지거나 사이즈가 변함',
      '• 주변 피부가 붓거나 가려워함',
      '• 말랑하지 않고 딱딱하거나 불규칙',
      '',
      '【babungee의 접근】',
      '"모든 혹을 수술할 필요는 없어요. 하지만 새로 생겼거나 변화가 있다면 반드시 조직검사나 세침흡인검사(FNA)를 해야 해요."',
      '',
      '혹이 생긴 지 얼마나 됐고, 크기나 모양이 변하고 있나요?',
    ].join('\n')
  }

  // ── 구강 약물 (스테로이드 장기) ──────────────────────────────────
  if (/스테로이드\s*(장기|계속|오래|줄이기|감량|중단|끊기|부작용)|프레드니솔론\s*(줄이|감량|오래|중단|끊)|덱사메타손\s*(장기|부작용)/.test(text)) {
    return [
      '💊 스테로이드 장기 복용·감량 안내',
      '',
      '스테로이드는 임의로 중단하면 위험해요.',
      '',
      '【babungee의 핵심 말씀】',
      '"스테로이드 임의 중단 시 체내 스테로이드가 적절한 수준 이하로 내려갈 수 있어 응급 상황이 될 수 있어요."',
      '"비상용 스테로이드를 항상 보관해야 해요."',
      '',
      '【스테로이드 장기 복용 부작용】',
      '• 다음다뇨(물 많이 마시고 소변 많이 봄)',
      '• 체중 증가, 근육 감소',
      '• 간 효소 상승 (스테로이드성 간병증)',
      '• 쿠싱증후군 유사 증상',
      '• 면역억제 → 감염 취약',
      '• 당뇨 유발 (특히 고양이)',
      '',
      '【감량 방법 (반드시 수의사 지도 하에)】',
      '• 갑자기 끊지 말고 2~4주에 걸쳐 천천히 줄이기',
      '• 용량 감소 시 원래 증상 재발 여부 모니터링',
      '• 증상 재발 시 감량 속도 늦추기',
      '',
      '【최소 필요 용량 유지】',
      '완전히 끊을 수 없는 질환(면역매개, 애디슨병 등)에서는 부작용 최소 용량을 장기 유지해요.',
      '',
      '현재 스테로이드 용량과 복용 기간이 어떻게 되나요?',
    ].join('\n')
  }

  // ── 고양이 신경 / 전정 장애 ──────────────────────────────────────
  if (/고양이\s*(어지러움|기울기|머리\s*기울|균형|빙빙\s*돎|안진|눈\s*흔들|전정\s*(이상|장애|질환))|개\s*(머리\s*기울|어지러워|전정)/.test(text)) {
    return [
      '🌀 전정 장애(어지러움) 안내',
      '',
      '갑자기 머리를 기울이고 빙빙 도는 증상은 전정계 이상이에요.',
      '',
      '【주요 증상】',
      '• 갑작스러운 머리 기울기 (Head tilt)',
      '• 균형 잡기 어려움, 빙빙 돎',
      '• 안진 (눈이 좌우로 빠르게 움직임)',
      '• 구토, 식욕 저하',
      '',
      '【원인 분류】',
      '● 말초성 (예후 좋음): 중이염, 내이염, 노령성 전정 증후군',
      '● 중추성 (예후 불확실): 뇌종양, 뇌염, 뇌경색',
      '',
      '【노령성 전정 증후군 (고양이·노령견)】',
      '• 원인 불명, 갑작스럽게 발생',
      '• 대부분 2~3주 내 자연 호전',
      '• 지지 치료: 구역질 완화, 안전한 환경 유지',
      '• MRI 없이 증상으로 구분하기 어려워 초기엔 전문 검사 권장',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 처음 발생 (원인 파악 필요)',
      '🚨 의식 변화, 발작 동반',
      '🚨 5일 이상 개선 없음',
      '',
      '언제 증상이 처음 생겼고, 지금 나아지고 있나요?',
    ].join('\n')
  }

  // ── 입양 초기 / 새 아이 데려왔을 때 ─────────────────────────────
  if (/입양\s*(후|했는데|했어요|초기)|새\s*(강아지|고양이|아이)\s*(왔어요|데려왔|입양|첫날)|처음\s*(며칠|주)\s*(동안|에|는)|입양\s*(첫날|일주일)/.test(text)) {
    return [
      '🐾 새 가족 입양 초기 안내',
      '',
      '처음 집에 온 반려동물은 2~4주 적응 기간이 필요해요.',
      '',
      '【첫 1~2주: 공간 제한으로 시작】',
      '• 한 방 또는 작은 공간에서 시작 (넓으면 오히려 불안)',
      '• 화장실, 밥그릇, 잠자리 위치 일정하게',
      '• 과도한 스킨십 자제 (아이 페이스에 맞추기)',
      '• 아이가 먼저 다가올 때까지 기다리기',
      '',
      '【필수 건강 체크】',
      '• 입양 후 1주 내 기본 건강검진 (분변검사, 구충)',
      '• 기존 예방접종 내역 확인',
      '• 미완료 접종 일정 계획 수립',
      '',
      '【흔한 초기 문제와 대응】',
      '• 입양 후 며칠 설사: 환경 스트레스 + 사료 변경 가능 → 블랜드 식이',
      '• 안 먹음: 정상 적응 반응 — 24~48시간은 지켜볼 수 있어요',
      '• 숨어 있음: 강제로 꺼내지 마세요, 혼자 나올 때까지 기다리기',
      '• 첫날 밤 울음: 타월로 감싸거나 심장 박동 소리 음원 틀어두기',
      '',
      '【다른 동물이 있는 경우】',
      '격리 후 점진적으로 만나게 해주세요. 최소 2주 격리 후 냄새 교환부터 시작해요.',
    ].join('\n')
  }

  // ── 호흡 문제 / 빠른 호흡 심층 ──────────────────────────────────
  if (/호흡\s*(횟수|수|빠른|빨라|빠름|빠르|이상|어려움|힘듦|관찰)|분당\s*호흡|RR\b|분당\s*\d{2,3}번|숨\s*(빨리|자주|가쁘게|힘들게)/.test(text)) {
    return [
      '🫁 호흡 이상 관찰 안내',
      '',
      '호흡 횟수와 패턴은 중요한 건강 지표예요.',
      '',
      '【정상 호흡수 (안정 시)】',
      '• 개: 분당 15~30회',
      '• 고양이: 분당 20~30회',
      '• 수면 중 호흡수: 분당 30회 미만이 정상',
      '',
      '【집에서 호흡 측정법】',
      '1. 아이가 완전히 안정되거나 자는 상태',
      '2. 가슴이 올라갔다 내려오는 것을 1회로 카운트',
      '3. 30초 × 2 = 분당 호흡수',
      '4. 매일 같은 시간대에 측정해서 기록',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 분당 40회 이상 (안정 상태에서)',
      '🚨 복부까지 사용해서 숨쉬는 모습',
      '🚨 잇몸이 파랗거나 회색빛',
      '🚨 입을 벌리고 숨쉬는 고양이',
      '',
      '【수면 시 호흡 모니터링 (심장병 관리 중)】',
      '심장약 복용 중이면 수면 중 호흡수를 매일 재는 것을 권장해요.',
      '• 분당 30회 이상이 2~3일 연속되면 즉시 수의사 연락',
      '• 이뇨제 용량 조절이 필요할 수 있어요',
    ].join('\n')
  }

  // ── 눈 분비물 / 눈 증상 ──────────────────────────────────────────
  if (/눈\s*(눈곱|분비물|충혈|빨개|붓|부음|가려움|깜빡|감고|뜨기\s*힘들|초록|노란|점액)|각막\s*(궤양|혼탁|상처|긁힘)/.test(text)) {
    return [
      '👁️ 눈 증상 안내',
      '',
      '눈 증상은 원인에 따라 대응이 달라요.',
      '',
      '【눈곱 종류로 원인 추측】',
      '• 투명 또는 묽은 눈물: 자극성, 알레르기',
      '• 흰색 점액성: 건성각결막염(KCS), 역속눈썹',
      '• 노란/초록 고름: 세균 감염, 즉시 병원',
      '• 혈성(붉은): 외상, 녹내장',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 눈을 계속 감거나 눈 주변을 긁음 (각막 통증)',
      '🚨 눈이 갑자기 뿌옇게 변함',
      '🚨 한쪽 눈이 다른 쪽보다 커 보임 (녹내장 가능성)',
      '🚨 고름성 분비물 + 충혈',
      '',
      '【집에서 관리】',
      '• 생리식염수에 적신 거즈로 눈곱 제거 (안에서 바깥 방향)',
      '• 처방받지 않은 눈약 임의 사용 금지',
      '• 넥카라 착용: 긁지 않도록',
      '',
      '【건성각결막염(KCS)】',
      '• 눈물 분비 부족 → 점액성 눈곱 지속',
      '• 시클로스포린 안약으로 치료 (평생 관리)',
      '',
      '눈 증상이 언제부터 생겼고, 양쪽 다 그런가요?',
    ].join('\n')
  }

  // ── 심부전 응급 / 급성 폐수종 ────────────────────────────────────
  if (/심부전\s*(응급|악화|갑자기|위기)|급성\s*폐수종|폐수종\s*(갑자기|응급|위기)|숨\s*(못쉬|가빠|빨라)\s*(갑자기|갑작스럽게)|기침\s*(심하게|갑자기\s*심|응급)/.test(text)) {
    return [
      '🚨 심부전 응급·급성 폐수종 안내',
      '',
      '급성 호흡곤란은 즉각적인 처치가 필요해요.',
      '',
      '🚨 지금 호흡이 매우 빠르고 힘들어 보인다면 → 즉시 응급 병원',
      '',
      '【병원 이동 중 할 것】',
      '• 에어컨 최대, 창문 열어 시원하게',
      '• 흥분하지 않도록 조용하고 안정적으로',
      '• 눕히지 말고 앉히거나 세워두기 (폐에 액체가 있을 때 누우면 악화)',
      '• 이동 중 절대 먹이거나 마시게 하지 않기',
      '',
      '【병원에서 받게 되는 처치】',
      '• 산소 공급 (산소 케이지)',
      '• 이뇨제(푸로세마이드) 즉시 주사 → 폐에 고인 물 빼내기',
      '• 흉부 X-ray로 폐수종 확인',
      '• 혈압 안정화',
      '',
      '【이 상황이 반복된다면】',
      '• 현재 이뇨제 용량이 충분한지 검토 필요',
      '• 수면 중 호흡수 매일 측정 (분당 30회 이상이면 연락)',
      '• 저염식이와 체중 유지',
      '• 피모벤단·에날라프릴·스피로노락톤 등 심장약 조합 재평가',
    ].join('\n')
  }

  // ── 애디슨병 / 부신기능저하 ──────────────────────────────────────
  if (/애디슨|부신\s*(기능\s*저하|저하증|기능부전)|저코티솔|ACTH\s*(자극\s*반응\s*없|기저\s*낮)|부신\s*(위기|응급)|저나트륨.*고칼륨/.test(text)) {
    return [
      '🔬 애디슨병(부신기능저하증) 안내',
      '',
      '애디슨병은 쿠싱증후군과 반대로 부신호르몬이 부족한 질환이에요.',
      '',
      '【주요 증상 (애디슨 위기)】',
      '🚨 갑작스러운 허탈, 극도의 무기력',
      '🚨 구토·설사 반복',
      '🚨 저혈압, 서맥',
      '🚨 저나트륨 + 고칼륨 혈증 (혈액검사에서 전형적 패턴)',
      '',
      '【진단】',
      '• ACTH 자극 검사: 투약 전·후 코티솔 반응 없음 → 확진',
      '• 전해질 비율: Na:K < 27:1 → 강력 의심',
      '',
      '【치료】',
      '• 응급 시: 정맥 수액 + 고용량 스테로이드',
      '• 장기 관리: 미네랄로코르티코이드 (DOCP 주사, 플루드로코르티손)',
      '  + 경구 프레드니솔론',
      '',
      '【주의사항 (쿠싱 약 복용 중)】',
      '"쿠싱약이 과도하게 부신을 억제하면 애디슨 위기가 올 수 있어요."',
      '"비상용 스테로이드를 항상 보관하고, 응급 시 즉시 투여하세요."',
      '',
      '스트레스(수술, 이동, 병원 방문) 시 임시로 용량을 늘려야 할 수 있어요.',
    ].join('\n')
  }

  // ── 뇌종양 / 뇌염 / 신경 증상 ───────────────────────────────────
  if (/뇌\s*(종양|암|염증|뇌염|MRI|이상)|신경\s*(증상|이상|악화)|두개강\s*내|뇌압\s*(상승|높)|갑자기\s*(쓰러|실신|의식)|원인\s*(불명|불분명)\s*(발작|경련)/.test(text)) {
    return [
      '🧠 뇌 질환·신경 증상 안내',
      '',
      '신경 증상은 원인을 정확히 파악하는 것이 중요해요.',
      '',
      '【신경 증상의 종류】',
      '• 발작·경련: 뇌 전기 활동 이상',
      '• 머리 기울기: 전정계 이상 (귀 또는 뇌)',
      '• 의식 변화: 멍한 상태, 무반응',
      '• 보행 이상: 원을 그리며 돎, 한 방향으로만 쓰러짐',
      '• 시력 이상: 물체에 부딪힘',
      '',
      '【MRI가 필요한 경우】',
      '• 2회 이상 발작 (원인 불명)',
      '• 항경련제에 반응 없는 발작',
      '• 신경 증상이 진행성으로 악화',
      '• 뇌종양·뇌염 의심',
      '',
      '【뇌종양 vs 뇌염 차이】',
      '• 뇌종양: 서서히 진행, 한쪽 편중 증상 많음',
      '• GME/면역매개 뇌염: 빠르게 진행, 스테로이드에 반응',
      '• 감염성 뇌염: 발열 동반',
      '',
      '【치료 원칙】',
      '• 뇌염(면역매개): 스테로이드 + 면역억제제',
      '• 뇌종양: 방사선 치료, 스테로이드(뇌압 감소)',
      '• 증상 관리: 항경련제, 뇌압 강하제',
      '',
      '신경 증상이 처음 나타난 시기와 현재 변화를 알려주세요.',
    ].join('\n')
  }

  // ── 췌장염 심층 ───────────────────────────────────────────────────
  if (/췌장염\s*(심한|만성|급성|재발|관리|식이)|지방\s*(사료|음식|급여)\s*(췌장|위험)|췌장\s*(수치|효소|리파제|아밀라제)|췌장\s*(좋은\s*사료|처방)/.test(text)) {
    return [
      '🫁 췌장염 심층 관리 안내',
      '',
      '췌장염은 식이 관리가 가장 중요해요.',
      '',
      '【급성 췌장염 증상】',
      '• 갑작스러운 구토 + 복통 (배를 만지면 아파함)',
      '• 구부정한 자세 (기도 자세)',
      '• 식욕 완전 상실, 무기력',
      '• 혈액검사: 리파제(Lipase) 상승',
      '',
      '【치료 원칙】',
      '• 초기: 절식 (보통 12~24시간) + 수액 처치',
      '• 이후: 저지방 처방식으로 점진적 급여',
      '• 통증 관리: 부프레노르핀, 부토르파놀',
      '• 구역질 억제: 마레조산',
      '',
      '【만성 췌장염 식이 원칙】',
      '• 지방 함량: 건물 기준 10% 이하',
      '• 고섬유질: 소화를 돕고 췌장 자극 최소화',
      '• 소량씩 자주: 한 번에 많이 먹으면 췌장 부담',
      '• 사람 음식(특히 지방질): 절대 금지',
      '',
      '【만성화 방지】',
      '• 트리글리세리드(중성지방) 수치 관리',
      '• 비만은 최대 위험 인자 → 체중 감량',
      '• 스테로이드 사용 제한 (췌장 자극)',
      '',
      '현재 어떤 사료를 먹이고 있나요? 지방 함량이 얼마나 되나요?',
    ].join('\n')
  }

  // ── 간 질환 / 간수치 심층 ────────────────────────────────────────
  if (/간\s*(수치|효소)\s*(높|상승|이상)|ALT\s*\d{3,}|간\s*(질환|문제|나쁨|나빠|기능|검사)|간\s*(처방식|사료|관리)|간\s*병원|간경변|간부전/.test(text)) {
    return [
      '🩺 간 질환 심층 안내',
      '',
      '간 수치가 높다고 모두 즉각적인 치료가 필요한 건 아니에요.',
      '',
      '【ALT vs ALP 이해】',
      '• ALT: 간세포 손상 지표 — 직접적인 간 문제',
      '• ALP: 담도계·부신·뼈 관련 — 비특이적 상승도 흔함',
      '  (쿠싱증후군에서 ALP가 엄청 올라가는 경우 많음)',
      '',
      '【ALT 수치별 해석】',
      '• 정상 상한의 2배 이하: 경계, 관찰',
      '• 2~5배: 중등도 손상, 원인 파악 필요',
      '• 5배 이상: 심각한 간 손상, 즉각 처치',
      '',
      '【원인 감별에 필요한 추가 검사】',
      '• 담즙산(Bile acids): 간 기능 평가',
      '• 복부 초음파: 간 크기·구조, 담낭 문제',
      '• 코발라민(B12): 간과 장 흡수 연관',
      '',
      '【간 보호 치료】',
      '• SAMe (S-아데노실메티오닌): 간세포 보호',
      '• 실리마린(밀크시슬): 항산화',
      '• 우르소데옥시콜산(UDCA): 담즙 흐름 개선',
      '',
      '【식이 관리】',
      '• 단백질: 완전히 제한하지 않되 과도하지 않게',
      '• 간성 뇌증이 있으면: 식물성 단백질 선호',
      '• 구리 제한 (달마시안, 베들링턴테리어): 구리 저함량 처방식',
    ].join('\n')
  }

  // ── 종양학 기본 / 암 진단 후 ─────────────────────────────────────
  if (/암\s*(진단|확인|판정|받았|나왔|걸렸)|종양\s*(악성|확진|조직검사|결과)|악성\s*(종양|암|결과)|암\s*(어떻게\s*해야|치료|앞으로)|앞으로\s*(얼마나|어떻게)/.test(text)) {
    return [
      '🎗️ 암(악성종양) 진단 후 안내',
      '',
      '암 진단을 받으셨군요. 먼저 차분하게 정보를 모아봐요.',
      '',
      '【먼저 확인할 것들】',
      '• 종양의 종류(세포 유형)',
      '• 원발 위치와 전이 여부 (X-ray, CT, 초음파)',
      '• 병기(Stage)',
      '• 수술적 절제 가능 여부',
      '',
      '【치료 옵션 (종양에 따라 다름)】',
      '1. 수술: 완전 절제가 가능하면 가장 좋음',
      '2. 항암 화학요법: 림프종, 비만세포종 등에 효과',
      '3. 방사선 치료: 수술 불가능한 위치',
      '4. 팔리에이티브(완화) 치료: 삶의 질 유지 목표',
      '',
      '【babungee의 말】',
      '"적극적 개입, 현상유지, 진행속도 억제 중 현명한 선택이 필요해요."',
      '"난치성 질환이라도 완화치료를 소홀히 하는 것은 수의사의 직무유기예요."',
      '',
      '【예후를 결정하는 요소】',
      '• 종양 종류가 가장 중요 (림프종 vs 골육종 vs 비만세포종 등 예후 차이 큼)',
      '• 발견 시기 (조기 발견일수록)',
      '• 전이 여부',
      '• 전신 건강 상태',
      '',
      '어떤 종양 진단을 받으셨나요? 위치와 종류가 어떻게 되나요?',
    ].join('\n')
  }

  // ── 고양이 구내염 / FCV 관련 ─────────────────────────────────────
  if (/고양이\s*구내염|고양이\s*(입안|구강|잇몸)\s*(염증|궤양|빨개|아픔)|FCGS|stomatitis\s*(고양이|feline)|구강흡수성\s*치주염|FORL/.test(text)) {
    return [
      '😿 고양이 구내염(FCGS) 안내',
      '',
      '고양이 구내염은 통증이 심하고 치료가 어려운 질환이에요.',
      '',
      '【주요 증상】',
      '• 입냄새가 매우 심함',
      '• 먹고 싶어하지만 아파서 못 먹음',
      '• 발로 입 주변을 자꾸 긁음',
      '• 침을 흘림, 구강 출혈',
      '• 급격한 체중 감소',
      '',
      '【원인과 치료의 어려움】',
      '고양이 구내염의 가장 효과적인 치료는 이빨을 빼는 것이에요.',
      '특히 어금니(premolar·molar) 발치 후 60~80%에서 증상 개선이 돼요.',
      '',
      '【FORL (구강흡수성 치주염)】',
      '• 고양이 치통 원인 1위',
      '• 치근이 서서히 흡수되면서 극심한 통증',
      '• X-ray로만 확인 가능',
      '• 치료: 해당 치아 발치',
      '',
      '【항생제·스테로이드 한계】',
      '약물은 일시적으로 증상을 완화할 수 있지만, 완치가 아니에요.',
      '장기적으로는 발치가 가장 효과적인 치료예요.',
      '',
      '【발치 후 관리】',
      '• 부드러운 음식 1~2주',
      '• 이빨 없어도 고양이는 잘 먹어요 — 걱정 마세요',
      '• 발치 후에도 재발할 수 있으므로 정기 구강 검진 필요',
    ].join('\n')
  }

  // ── 고양이 비만 특이사항 / 지방간 ───────────────────────────────
  if (/고양이\s*(굶기|다이어트|살\s*빼|체중\s*감량)|지방간\s*(고양이|hepatic\s*lipidosis)|고양이\s*(밥\s*안먹|식욕\s*없)\s*(며칠|오래|3일|4일|5일)/.test(text)) {
    return [
      '⚠️ 고양이 지방간(Hepatic Lipidosis) 주의 안내',
      '',
      '고양이는 48~72시간 이상 안 먹으면 지방간이 생길 수 있어요.',
      '',
      '【특히 위험한 상황】',
      '• 다이어트로 급격히 먹이를 줄인 경우',
      '• 스트레스 (이사, 가족 변화) 후 식욕 저하',
      '• 다른 질환으로 식욕 저하 2~3일 지속',
      '',
      '【지방간 증상】',
      '• 황달 (잇몸·눈 흰자가 노랗게)',
      '• 구토',
      '• 무기력',
      '• 완전히 식욕 없음',
      '',
      '【지방간 예방·치료 원칙】',
      '고양이 다이어트는 절대로 급격하게 하면 안 돼요.',
      '• 감량 속도: 한 달에 현재 체중의 1% 이하',
      '• 48시간 이상 안 먹으면 강제 급여 또는 영양 튜브 고려',
      '• 병원 치료: 정맥 수액 + 식욕자극제 + 영양 지원',
      '',
      '【강제 급여 방법 (수의사 지시 하에)】',
      '• 주사기로 입 옆쪽에 소량씩 천천히',
      '• 페이스트형 영양식 (힐스 a/d 등)',
      '• 식욕자극제: 미르타자핀 귀 제제',
      '',
      '마지막으로 밥을 먹은 게 언제인가요?',
    ].join('\n')
  }

  // ── 유선종양 / 유방암 ────────────────────────────────────────────
  if (/유선\s*(종양|암|혹|덩어리)|유방\s*(암|종양|혹)|젖\s*(몽우리|혹)|타목시펜/.test(text)) {
    return [
      '🎗️ 유선종양(유방암) 안내',
      '',
      '유선종양은 암컷 강아지·고양이에게 흔한 종양이에요.',
      '',
      '【중성화와의 관계】',
      '• 첫 발정 전 중성화: 유선종양 발생 위험 0.5%',
      '• 첫 발정 후~2번째 발정 전: 8%',
      '• 2번째 발정 이후: 26%',
      '→ 어릴 때 중성화가 가장 효과적인 예방이에요',
      '',
      '【악성 vs 양성 구별】',
      '• 양성: 경계가 뚜렷하고 부드러움, 천천히 자람',
      '• 악성: 빠르게 커짐, 주변 조직에 고정됨, 피부 침습',
      '• 조직검사(FNA 또는 절제 후 병리)가 확진',
      '',
      '【치료】',
      '• 수술이 표준 치료',
      '• 타목시펜: 사람 유방암 약 → 반려동물에서 자궁축농증 부작용 위험',
      '• 전이 여부 확인: 흉부 X-ray (폐 전이), 주변 림프절',
      '',
      '【수술 후 관리】',
      '• 조직검사 결과 확인 (절제 마진)',
      '• 악성이면 항암 치료 병행 여부 수의사와 상의',
      '• 반대쪽 유선도 정기 모니터링',
      '',
      '혹이 얼마나 크고, 얼마나 됐나요?',
    ].join('\n')
  }

  // ── 신생아 강아지·고양이 케어 ────────────────────────────────────
  if (/신생아|갓\s*태어난|태어난\s*지\s*(며칠|일주일|2주|1주)|어미\s*(없|죽|버린|떠난)|손으로\s*(키우|분유|젖병)|인공\s*포유|분유\s*(먹이|강아지|새끼)/.test(text)) {
    return [
      '🍼 신생아·어린 강아지·고양이 케어 안내',
      '',
      '어미 없이 키우는 신생아는 세심한 관리가 필요해요.',
      '',
      '【온도 관리 (가장 중요)】',
      '• 0~2주: 29~32°C 유지 (저체온은 사망 위험)',
      '• 2~4주: 24~27°C',
      '• 보온 방법: 핫팩(수건으로 감싸기), 히팅 패드',
      '• 한쪽은 시원하게 두어 스스로 조절할 수 있게',
      '',
      '【분유 급여】',
      '• 전용 강아지/고양이 분유 사용 (소·양 우유 금지)',
      '• 2~3시간마다 급여',
      '• 1회 양: 체중 1kg당 약 1mL (점진적으로 늘리기)',
      '• 너무 빨리 주면 흡인 위험 → 천천히',
      '',
      '【배변 유도】',
      '• 수유 후 따뜻한 면봉/거즈로 항문·생식기 자극',
      '• 3~4주까지 스스로 배변 못 해요',
      '',
      '【병원이 필요한 경우】',
      '🚨 울음을 멈추지 않음',
      '🚨 분유를 2회 연속 거부',
      '🚨 배가 빵빵하거나 설사',
      '🚨 몸이 차가움',
      '',
      '현재 몇 일 됐고, 어미가 없는 이유가 뭔가요?',
    ].join('\n')
  }

  // ── 중독 / 이물질 삼킴 ───────────────────────────────────────────
  if (/이물질\s*(삼켰|먹었|삼킴|삽킴|먹어버)|뭔가\s*(삼켰|먹었)|장난감\s*(삼켜|먹어|파편)|뼈\s*(삼켜|먹어|걸린)|이물\s*(삼킨|먹은|제거)/.test(text)) {
    return [
      '⚠️ 이물질 삼킴 긴급 안내',
      '',
      '이물질 종류와 크기에 따라 대응이 달라요.',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 날카로운 이물질 (바늘, 뼈 조각, 금속)',
      '🚨 끈·실·낚싯줄 (장 감김 위험)',
      '🚨 삼킨 후 구토·무기력·복통 발생',
      '🚨 삼킨 지 1시간 이내 (구토 유도 가능 시간)',
      '',
      '【집에서 절대 하지 말 것】',
      '❌ 구토 유도 시도 (날카로운 이물질이면 더 위험)',
      '❌ 식빵이나 음식 먹여서 밀어내기',
      '❌ 끈이나 실이 밖으로 나와 있을 때 당기기',
      '',
      '【관찰하면서 기다려도 되는 경우】',
      '• 둥글고 작은 것 (구슬, 단추 등) — 단, 계속 관찰',
      '• 배변에서 나왔는지 확인 (1~3일)',
      '• 배변을 제대로 보고, 구토·복통이 없을 때',
      '',
      '【병원에서 할 수 있는 처치】',
      '• X-ray·초음파로 이물질 위치 확인',
      '• 내시경으로 제거 (위장 내)',
      '• 수술 (장 폐색, 내시경 불가능한 경우)',
      '',
      '무엇을, 얼마나 삼킨 것 같나요?',
    ].join('\n')
  }

  // ── 설사 심층 ─────────────────────────────────────────────────────
  if (/설사\s*(심|계속|반복|만성|혈|점액|묽|물|3일|4일|5일|일주일)|피\s*(섞인|있는|나오는)\s*설사|혈변|점액\s*설사/.test(text)) {
    return [
      '💧 설사 심층 안내',
      '',
      '설사는 원인에 따라 대응이 달라요.',
      '',
      '【설사 종류로 원인 추측】',
      '• 묽은 노란색 설사: 소장 문제, 식이 변화',
      '• 소량씩 자주 + 점액: 대장 문제',
      '• 혈변 (선홍색): 대장 출혈, 자극, 파보 의심',
      '• 흑색 타르변: 상부 소화관 출혈 → 즉시 병원',
      '• 점액 많음: IBD, 기생충',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 혈변 + 무기력',
      '🚨 흑색 타르 변',
      '🚨 새끼 강아지 혈변 (파보 가능성)',
      '🚨 5회 이상/일 + 탈수 증상',
      '🚨 발열 동반',
      '',
      '【집에서 관리 (경증)】',
      '• 12~24시간 절식 (물은 유지)',
      '• 블랜드 식이 시작: 삶은 닭가슴살 + 흰쌀밥 (3~4일)',
      '• 닭고기 끓인 물로 수분 보충',
      '• 프로바이오틱스 (포티플로라, 프로바이오플러스)',
      '',
      '【만성·재발 설사 (IBD 가능성)】',
      '• 저알레르기 처방식 시험 (8~12주)',
      '• 코발라민(B12) 수치 확인 (흡수 불량 지표)',
      '• 조직검사(내시경)로 IBD 확진',
    ].join('\n')
  }

  // ── 코 관련 증상 / 비강 ──────────────────────────────────────────
  if (/코\s*(피|출혈|혈액|막힘|분비물|콧물|고름|역재채기)|비강\s*(종양|폴립|염증|출혈)|코피|역재채기\s*(반복|심한|계속)/.test(text)) {
    return [
      '👃 코 증상 안내',
      '',
      '코 증상은 원인에 따라 경증부터 심각한 것까지 다양해요.',
      '',
      '【역재채기(Reverse Sneezing)】',
      '• 소형견·단두종에서 흔함',
      '• 코와 목이 연결되는 부분에 자극으로 발생',
      '• 대부분 30~60초 내 저절로 멈춤',
      '• 관리: 콧등을 살짝 막아 비호흡 유도, 차분하게',
      '',
      '【코피(비출혈)】',
      '🚨 한쪽 코에서만 코피: 비강 종양, 폴립 가능성',
      '🚨 양쪽 코 + 잇몸 출혈: 혈소판 감소, 응고 장애 의심',
      '• 즉각 처치: 얼음 팩을 콧등에 대기, 목 굽히지 않게',
      '• 지혈이 5분 내 안 되면 즉시 병원',
      '',
      '【콧물 종류별 의미】',
      '• 투명 묽은 콧물: 알레르기, 자극',
      '• 노란/초록 콧물: 세균 감염',
      '• 혈성 분비물: 외상, 종양',
      '',
      '【비강 종양 주의 신호】',
      '• 한쪽 코만 막힘',
      '• 얼굴 비대칭',
      '• 코 주변 뼈가 변형됨',
      '• 코 분비물이 한쪽에서만 지속',
      '',
      '코피가 몇 번 있었고, 양쪽 다 나왔나요?',
    ].join('\n')
  }

  // ── 소변 색·양 이상 ───────────────────────────────────────────────
  if (/소변\s*(색|색깔|빨간|붉은|진한|황색|주황|갈색|탁한|냄새|양이|많이|적게|자주|못봄|안봄|못봐)|혈뇨|농뇨|빌리루빈뇨/.test(text)) {
    return [
      '🚽 소변 이상 안내',
      '',
      '소변 색깔과 양은 중요한 건강 신호예요.',
      '',
      '【소변 색깔 해석】',
      '• 연한 노란색: 정상',
      '• 진한 노란색: 수분 부족, 탈수 가능성',
      '• 주황색: 빌리루빈 (간 문제, 황달)',
      '• 붉은색·혈뇨: 방광염, 결석, 외상, 드물게 종양',
      '• 갈색: 적혈구 파괴 (용혈성 빈혈), 심한 근육 손상',
      '• 탁한 흰색: 세균성 감염, 농뇨',
      '',
      '【소변 양·빈도 이상】',
      '• 자주 조금씩: 방광염, 방광 결석',
      '• 많이 자주: 당뇨, 신부전, 쿠싱 → 물도 많이 마심',
      '• 소변 못 봄: 요도 막힘 (고양이 수컷·소형견) → 응급',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 소변을 전혀 못 봄',
      '🚨 혈뇨 + 고통스러운 표정',
      '🚨 갈색/검은색 소변',
      '🚨 잇몸이 노란색 (황달) + 짙은 소변',
      '',
      '【집에서 확인】',
      '흰 배변패드에 소변을 받아두면 색을 쉽게 확인할 수 있어요.',
      '사진을 찍어 수의사에게 보여주는 것도 좋아요.',
    ].join('\n')
  }

  // ── 약 부작용 일반 ────────────────────────────────────────────────
  if (/약\s*(부작용|이상반응|맞지않는|합지않는|효과없는)|NSAID\s*부작용|스테로이드\s*(부작용|이상)|약\s*(먹고|먹은\s*후|먹으니)\s*(구토|설사|이상|졸음|무기력)/.test(text)) {
    return [
      '⚕️ 약 부작용 안내',
      '',
      '약 부작용이 의심되면 임의로 중단하기 전에 수의사와 상의하세요.',
      '',
      '【NSAID (소염진통제) 부작용】',
      '• 구토, 설사, 식욕 저하',
      '• 심한 경우: 위궤양, 신장·간 손상',
      '• 장기 복용 시 정기 혈액검사 필요',
      '• 공복 투여 시 위장 부담 증가',
      '',
      '【스테로이드 부작용 (용량 의존적)】',
      '• 다음다뇨, 식욕 증가',
      '• 췌장염, 당뇨 유발 가능 (고양이)',
      '• 면역억제 → 감염 취약',
      '• 장기: 근육 약화, 피부 얇아짐',
      '',
      '【항생제 부작용】',
      '• 구토, 설사 (위장 자극)',
      '• 프로바이오틱스와 함께 복용하면 완화',
      '• 피부 발진 → 약물 알레르기 가능성',
      '',
      '【약 중단 판단 기준】',
      '• 경증 구토/설사: 음식과 함께 먹이거나 용량 조절 시도',
      '• 심한 증상 또는 새로운 이상 증상: 즉시 수의사 연락',
      '• 스테로이드·항경련제: 임의 중단 절대 금지',
      '',
      '어떤 약을 복용 중이고, 어떤 증상이 생겼나요?',
    ].join('\n')
  }

  // ── 반려동물 보험 / 의료비 ───────────────────────────────────────
  if (/보험|의료비\s*(비싼|걱정|부담)|치료비\s*(비싼|어떻게|부담)|펫보험|동물보험|의료\s*보험/.test(text)) {
    return [
      '💰 반려동물 의료비·보험 안내',
      '',
      '반려동물 의료비는 미리 준비하는 것이 좋아요.',
      '',
      '【펫보험 기본 사항】',
      '• 가입 가능 나이: 보험사마다 다름 (보통 8주~8세 이내)',
      '• 보장 내용: 입원비, 수술비, 통원비 (상품마다 다름)',
      '• 대기 기간: 가입 후 약 30일이 지나야 보장',
      '• 기존 질환은 보장 제외인 경우가 많아요',
      '',
      '【보험 선택 시 확인사항】',
      '• 자기부담률: 보통 20~30%',
      '• 연간 한도액',
      '• 특정 질환 제외 여부 (선천성, 유전성 질환)',
      '• 치과 처치 포함 여부',
      '',
      '【보험 없이 의료비 관리】',
      '• 적금 형태로 월 5~10만원 적립',
      '• 예방 비용이 치료 비용보다 훨씬 저렴 (예방접종, 정기검진)',
      '• 대학 병원·교육 병원: 일반 병원보다 저렴한 경우 있음',
      '',
      '【현재 치료비 고민이 있다면】',
      '• 수의사에게 솔직하게 예산을 말하고 치료 우선순위를 함께 정하기',
      '• 완화치료 위주로 전환하는 것도 하나의 선택지예요',
      '',
      '현재 어떤 치료를 앞두고 있나요?',
    ].join('\n')
  }

  // ── 다음다뇨 / 물 많이 마심 ─────────────────────────────────────
  if (/물\s*(많이|자꾸|엄청)\s*(마시|마셔|마심)|다음\s*다뇨|소변\s*많이|물\s*(먹는\s*양|음수량)\s*(늘었|증가|많아)/.test(text)) {
    return [
      '💧 다음다뇨(물 많이 마시고 소변 많이 봄) 안내',
      '',
      '갑자기 물 섭취량이 크게 늘었다면 반드시 검사가 필요해요.',
      '',
      '【주요 원인】',
      '• 신부전(CKD): 가장 흔한 원인',
      '• 당뇨: 고혈당으로 삼투성 이뇨',
      '• 쿠싱증후군: 코티솔 과다',
      '• 자궁축농증 (암컷): 열이 동반될 수 있음',
      '• 간부전: 빌리루빈 상승',
      '• 고칼슘혈증',
      '• 요붕증(DI): 드물지만 항이뇨 호르몬 이상',
      '',
      '【집에서 음수량 측정법】',
      '• 아침에 신선한 물 일정량을 담고',
      '• 24시간 후 남은 양을 측정',
      '• 개: 체중 1kg당 50~100mL가 정상',
      '  (예: 10kg 개 → 500~1000mL)',
      '• 이 이상이면 다음다뇨로 판단',
      '',
      '【필요한 검사】',
      '• 혈액검사: BUN, 크레아티닌, 혈당, ALT, 칼슘, 코티솔',
      '• 요검사: 요비중, 당뇨 여부',
      '• 복부 초음파: 신장 크기, 자궁, 부신',
      '',
      '언제부터 물을 많이 마시기 시작했고, 다른 증상은 있나요?',
    ].join('\n')
  }

  // ── 기침 심층 / 만성 기침 ────────────────────────────────────────
  if (/기침\s*(만성|두달|3개월|계속|반복|오래|매일|심한|혈|피가\s*섞인)|만성\s*기침|기침이\s*(안\s*낫|안\s*멈|멈추지|계속)/.test(text)) {
    return [
      '🫁 만성·반복 기침 안내',
      '',
      '기침이 2주 이상 지속된다면 원인을 찾아야 해요.',
      '',
      '【원인별 분류】',
      '● 심장성: 심부전으로 폐에 물이 차 기침 → 밤·누울 때 더 심함',
      '● 기관지/폐: 기관지염, 폐렴, 종양 → 운동 후 심함',
      '● 감염성: 켄넬코프, 디스템퍼, 마이코플라즈마',
      '● 기생충: 심장사상충 → 야외 노출 이력 있으면 확인',
      '● 역류: 식도 역류 → 식사 후 기침',
      '● 후두/기관 문제: 후두마비, 기관 허탈',
      '',
      '【기관 허탈 (소형견)】',
      '• 영향 품종: 포메라니안, 요크셔 테리어, 치와와, 말티즈',
      '• 증상: 거위 소리 기침 (특히 흥분하거나 줄 당길 때)',
      '• 목줄 대신 하네스 사용 권장',
      '• 체중 감량이 가장 효과적',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 기침 중 파란 잇몸',
      '🚨 혈액 섞인 기침',
      '🚨 호흡 곤란 동반',
      '',
      '기침이 언제, 어떤 상황에서 주로 하나요?',
    ].join('\n')
  }

  // ── 고양이 고혈압 / 눈 출혈 ─────────────────────────────────────
  if (/고양이\s*(고혈압|혈압|눈\s*출혈|눈\s*빨개|망막|시력\s*(갑자기|갑작스럽게)|눈\s*속\s*피)|망막\s*(박리|출혈|이상)|갑작스러운\s*실명/.test(text)) {
    return [
      '🐱 고양이 고혈압·망막 출혈 안내',
      '',
      '고양이 고혈압은 망막 박리로 갑자기 실명을 일으킬 수 있어요.',
      '',
      '【응급 신호】',
      '🚨 갑자기 잘 못 봄, 물건에 부딪힘',
      '🚨 눈 안이 빨개짐 (전방 출혈)',
      '🚨 눈동자가 한쪽이 크거나 빛에 반응 없음',
      '',
      '【원인】',
      '• 신장병(CKD): 고혈압 가장 흔한 원인',
      '• 갑상선기능항진: 심박수 증가 → 혈압 상승',
      '• 원발성 고혈압 (드물게)',
      '',
      '【혈압 기준 (개·고양이)】',
      '• 정상: 140/90 미만',
      '• 전고혈압: 140~159 / 90~99',
      '• 고혈압: 160~179',
      '• 심한 고혈압: 180 이상 → 즉각 처치',
      '',
      '【치료 - 암로디핀】',
      '• 고양이 고혈압 1차 약물',
      '• 효과 빠름 (24시간 내 수치 하강)',
      '• 망막 출혈 초기라면 치료 후 시력 일부 회복 가능',
      '',
      '【주의】',
      '한번 박리된 망막은 회복이 어려워요. 빠른 치료가 시력 보존의 관건이에요.',
    ].join('\n')
  }

  // ── 심장사상충 ────────────────────────────────────────────────────
  if (/심장사상충|사상충\s*(감염|양성|치료|예방)|Dirofilaria|이미티사이드|이벡틴\s*(사상충)/.test(text)) {
    return [
      '🦟 심장사상충 안내',
      '',
      '심장사상충은 예방이 가장 중요해요.',
      '',
      '【심장사상충이란?】',
      '• 모기가 매개하는 기생충 — 혈관과 폐동맥, 심장에 서식',
      '• 개에서 주로 심각한 증상 (고양이는 드물게)',
      '',
      '【감염 증상 (개)】',
      '• 초기: 운동 불내성, 가벼운 기침',
      '• 중기: 기침 심화, 호흡 곤란',
      '• 말기: 심부전, 폐출혈 → 위험',
      '',
      '【치료 (이미티사이드 주사)】',
      '• 치료 중 활동 제한이 매우 중요',
      '• 죽는 사상충이 혈관을 막을 수 있어요',
      '• 치료 후 4~6주: 운동 완전 금지, 흥분 최소화',
      '• 치료비가 높고 위험하므로 예방이 훨씬 좋아요',
      '',
      '【예방약】',
      '• 매월 1회 경구 또는 피부 점적 (하트가드, 밀베마이신 등)',
      '• 4월~11월이 주요 예방 시기 (지역마다 다름)',
      '• 이미 감염된 경우: 구충제만 주면 위험 → 먼저 검사',
      '',
      '현재 예방약을 정기적으로 먹이고 있나요?',
    ].join('\n')
  }

  // ── 비뇨기·생식기 / 전립선 ───────────────────────────────────────
  if (/전립선\s*(비대|비대증|염증|종양|문제)|수컷\s*(소변\s*(어려움|힘들|줄기)|전립선)|BPH/.test(text)) {
    return [
      '🔬 전립선 문제 안내',
      '',
      '전립선 비대는 중성화하지 않은 수컷 개에서 흔해요.',
      '',
      '【전립선 비대(BPH)】',
      '• 노령 수컷 개의 대부분에서 발생',
      '• 증상: 소변 줄기 약해짐, 대변 어려움 (전립선이 직장 압박)',
      '• 분비물이 소변 방울처럼 떨어짐',
      '',
      '【치료의 핵심】',
      '• 중성화: 가장 효과적 — 수 주 내 전립선 크기 감소',
      '• 이미 중성화된 경우 + 전립선 문제: 종양 또는 감염 의심',
      '',
      '【전립선 농양·감염】',
      '• 발열, 통증, 배뇨 어려움',
      '• 항생제 + 경우에 따라 수술적 배농',
      '',
      '【전립선 종양】',
      '• 전립선암은 드물지만 중성화된 개에서도 생김',
      '• 증상이 BPH와 유사 → 초음파·조직검사로 감별',
      '',
      '중성화 수술을 받은 개인가요?',
    ].join('\n')
  }

  // ── 관절 천자 / 흉수 / 복수 천자 ────────────────────────────────
  if (/천자|흡입\s*(관절|흉수|복수)|흉수\s*제거|관절\s*(액|주사|천자)|관절\s*(검사|결과)/.test(text)) {
    return [
      '🔬 천자(체액 흡입 검사) 안내',
      '',
      '천자는 체액을 채취해 원인을 파악하는 중요한 검사예요.',
      '',
      '【천자 종류】',
      '● 복강 천자 (Abdominocentesis): 복수 분석·제거',
      '● 흉강 천자 (Thoracocentesis): 흉수 분석·제거',
      '● 관절 천자 (Arthrocentesis): 관절액 분석',
      '● 심낭 천자 (Pericardiocentesis): 심낭 삼출 제거',
      '',
      '【복수 분석에서 알 수 있는 것】',
      '• 리발타 검사 양성 → FIP 강력 의심',
      '• 단백질 농도: 누출성 vs 삼출성 구분',
      '• 세포 분석: 세균 감염 vs 종양 vs 만성 염증',
      '',
      '【관절 천자】',
      '• 면역매개 다발성 관절염 vs 세균 감염 감별',
      '• 중성구 많음 → 세균성',
      '• 소형 단핵구 → 면역매개',
      '',
      '【천자 후 주의】',
      '• 처치 부위 청결 유지',
      '• 발열·부종 발생 시 병원 연락',
      '• 복수·흉수는 원인 치료 없이는 재축적',
    ].join('\n')
  }

  // ── 빠른 호흡 / 복부 호흡 ────────────────────────────────────────
  if (/복부\s*(호흡|움직임)|배로\s*숨|배\s*(보고\s*숨|썼다|위로|아래로)\s*(내려|올라)|역설적\s*호흡|숨\s*(배가|배로)/.test(text)) {
    return [
      '🚨 복부 호흡 (노력성 호흡) 긴급 안내',
      '',
      '배를 이용해서 숨을 쉬는 모습은 심각한 호흡 곤란의 신호예요.',
      '',
      '🚨 즉시 응급 병원으로 이동하세요.',
      '',
      '【정상 호흡과의 차이】',
      '• 정상: 가슴만 가볍게 움직임',
      '• 비정상: 배까지 크게 움직이며 호흡',
      '• 구강 호흡(입으로 숨쉬기) — 고양이에서 특히 응급',
      '',
      '【원인】',
      '• 폐수종 (심부전, 흡인 폐렴)',
      '• 기흉 (폐 공기 누출)',
      '• 흉수 (흉강에 액체)',
      '• 횡격막 탈장',
      '• 심낭 삼출',
      '',
      '【이동 중 주의사항】',
      '• 눕히지 말고 세워서 이동',
      '• 에어컨으로 시원하게',
      '• 흥분시키지 않기',
      '• 즉시 산소 처치가 가장 중요해요',
    ].join('\n')
  }

  // ── 품종별 유전질환 ───────────────────────────────────────────────
  if (/품종\s*(질환|문제|특이)|유전\s*(질환|병)|도베르만\s*(심장|DCM)|복서\s*(심장|심근증)|코커스파니엘\s*(신장|눈)|말라뮤트\s*(다발|신경)|달마시안\s*(청각|요산)|웰시코기\s*(디스크|척수)/.test(text)) {
    return [
      '🧬 품종별 주의 질환 안내',
      '',
      '품종에 따라 취약한 질환이 달라요.',
      '',
      '【소형견】',
      '• 포메라니안·치와와·요크셔: 기관 허탈, 슬개골 탈구',
      '• 말티즈·비숑: 누루관 막힘, 슬개골 탈구',
      '• 닥스훈트: 추간판 질환(IVDD) — 긴 척추 주의',
      '',
      '【중·대형견】',
      '• 골든리트리버: 심근증(DCM), 림프종 빈발',
      '• 도베르만: 확장성 심근증(DCM) — 초음파 정기 검진',
      '• 라브라도: 비만 경향, 고관절 이형성, 엘보이형성',
      '• 로트와일러: 골육종, 고관절 이형성',
      '',
      '【고양이】',
      '• 메인쿤·라그돌: 비후성 심근증(HCM) — HCM 유전자 검사 권장',
      '• 스코티시폴드: 귀·관절 기형 (골연골이형성)',
      '• 페르시안: 다낭성 신장병(PKD) — 유전자 검사 가능',
      '• 버만·히말라얀: 다낭성 신장병',
      '',
      '【단두종 공통 주의】',
      '퍼그, 불독, 프렌치불독, 시추, 페르시안 → BOAS (호흡기 증후군)',
      '더운 환경, 과도한 운동, 비만이 증상을 악화시켜요.',
      '',
      '어떤 품종이고 어떤 증상이 있나요?',
    ].join('\n')
  }

  // ── 전해질 이상 / 나트륨·칼륨 ──────────────────────────────────
  if (/나트륨\s*(낮|높|이상|수치)|칼륨\s*(낮|높|이상|수치)|저나트륨|고칼륨|저칼륨|전해질\s*(불균형|이상|수치)|Na\s*(낮|높)|K\s*(낮|높)/.test(text)) {
    return [
      '🔬 전해질 이상(나트륨·칼륨) 안내',
      '',
      '전해질 불균형은 다양한 질환의 결과이자 위험 신호예요.',
      '',
      '【나트륨(Na) 이상】',
      '● 저나트륨 (< 140 mEq/L):',
      '  - 원인: 구토·설사·수액 과다·애디슨병·심부전',
      '  - 증상: 무기력, 혼돈, 심하면 발작',
      '● 고나트륨 (> 155 mEq/L):',
      '  - 원인: 심한 탈수, 요붕증',
      '  - 증상: 극심한 갈증, 신경 증상',
      '',
      '【칼륨(K) 이상】',
      '● 저칼륨 (< 3.5 mEq/L):',
      '  - 원인: 이뇨제, 구토·설사, 인슐린 치료, 폐수종 이뇨',
      '  - 증상: 근육 약화, 목 처짐 (고양이), 부정맥',
      '● 고칼륨 (> 5.5 mEq/L):',
      '  - 원인: 신부전, 요도막힘, 애디슨병',
      '  - 증상: 서맥, 심장 부정맥 위험',
      '',
      '【babungee의 말】',
      '"폐수종 후 이뇨제로 저칼륨이 올 수 있어요."',
      '"저칼륨과 고칼륨 사이에서 전환되기도 하므로 혈액검사로 확인이 필수예요."',
      '',
      '전해질 이상이 나온 검사지를 수의사와 함께 해석하는 것이 중요해요.',
    ].join('\n')
  }

  // ── 산책·운동 관리 ────────────────────────────────────────────────
  if (/산책\s*(하루|일일|얼마나|시간|횟수|거부|힘들|못해)|운동\s*(양|횟수|필요|거부)|산책\s*(어떻게|적당한|충분한)/.test(text)) {
    return [
      '🚶 산책·운동 관리 안내',
      '',
      '적절한 운동은 반려동물의 건강과 행동 모두에 중요해요.',
      '',
      '【나이별 운동량 기준 (개)】',
      '• 강아지 (< 1세): 과도한 운동 금지 — 관절 발달 중',
      '  - 5분 × 나이(개월) × 2회/일 (예: 3개월 = 15분)',
      '• 성견: 하루 30~60분 (품종에 따라 다름)',
      '• 노령견: 짧게 자주, 평지 위주',
      '',
      '【품종별 운동 필요량】',
      '● 고강도: 보더콜리, 허스키, 달마시안 — 1~2시간/일 이상',
      '● 중강도: 리트리버, 스패니얼 — 1시간/일',
      '● 저강도: 불독, 퍼그, 시추, 말티즈 — 20~30분/일',
      '',
      '【운동 시 주의사항】',
      '• 관절염: 저충격 운동 (수영, 평지 걷기)',
      '• 심장병: 수면 중 호흡수 모니터링하며 운동량 조절',
      '• 더울 때: 아침·저녁 시원한 시간대에',
      '• 단두종: 과도한 운동 = 과열 위험',
      '',
      '【산책 거부 원인】',
      '• 관절·근육 통증',
      '• 발바닥 화상 (뜨거운 아스팔트)',
      '• 발바닥 이상 (갈라짐, 이물질)',
      '• 공포나 두려움 (특정 장소·소리)',
      '',
      '산책을 거부하게 된 게 갑자기 시작된 건가요?',
    ].join('\n')
  }

  // ── 집에서 응급 처치 기본 ────────────────────────────────────────
  if (/응급\s*(처치|키트|방법)|CPR|심폐소생|기도막힘|하임리히|질식|의식\s*(없|잃|없어졌)/.test(text)) {
    return [
      '🚨 반려동물 응급 처치 기본 안내',
      '',
      '응급 시 당황하지 않도록 미리 알아두세요.',
      '',
      '【의식이 없을 때 (CPR)】',
      '1. 반응 확인: 이름 부르고, 발바닥 꼬집기',
      '2. 호흡 확인: 가슴 움직임 10초 관찰',
      '3. 심장 확인: 왼쪽 앞다리 접히는 부위 뒤쪽 심장 박동',
      '',
      '【심폐소생술 (CPR) 순서】',
      '• 옆으로 눕히기 (오른쪽이 아래)',
      '• 가슴 압박: 흉곽 가장 넓은 부위, 빠르게 100~120회/분',
      '• 인공호흡: 30:2 비율 (압박 30회 후 숨 2번)',
      '• 입을 닫고 코 끝에 숨 불어넣기',
      '',
      '【기도막힘 (하임리히)】',
      '• 소형견: 거꾸로 들어 등 두드리기',
      '• 대형견: 옆구리 압박법',
      '• 이물질이 보이면 손가락으로 제거 (안 보이면 맹목적 삽입 금지)',
      '',
      '【응급 키트 준비물】',
      '• 체온계 (직장 체온용)',
      '• 주사기 (물·약 투여용)',
      '• 생리식염수, 알코올 솜',
      '• 붕대, 지혈 패드',
      '• 전화번호: 가까운 24시 응급 동물병원',
      '',
      '항상 가장 가까운 응급 병원 번호를 저장해 두세요.',
    ].join('\n')
  }

  // ── 체온 측정 / 발열 ──────────────────────────────────────────────
  if (/체온\s*(재|측정|높|낮|이상|방법)|발열\s*(여부|있는|확인|몇도)|열\s*(나는|있는|측정|몇도)/.test(text)) {
    return [
      '🌡️ 체온 측정 및 발열 안내',
      '',
      '반려동물 체온은 항문(직장)으로 정확하게 측정해요.',
      '',
      '【정상 체온】',
      '• 개: 38.0~39.2°C',
      '• 고양이: 38.1~39.2°C',
      '',
      '【체온 측정 방법】',
      '1. 체온계 끝에 바셀린 또는 윤활제 바르기',
      '2. 꼬리를 살짝 들어올리고 항문에 1~2cm 삽입',
      '3. 10~30초 후 읽기 (디지털 체온계)',
      '',
      '【체온별 대응】',
      '• 37.5°C 이하: 저체온 → 따뜻하게, 즉시 병원',
      '• 38.0~39.2°C: 정상',
      '• 39.3~39.9°C: 가벼운 발열 → 관찰, 물 충분히',
      '• 40°C 이상: 발열 → 수의사 연락',
      '• 41°C 이상: 응급 → 즉시 병원',
      '',
      '【발열 원인】',
      '• 감염 (세균, 바이러스)',
      '• 염증성 질환',
      '• 열사병',
      '• 면역매개 질환',
      '• 드물게: 약물 반응, 종양',
      '',
      '【해열제 주의】',
      '❌ 이부프로펜, 아세트아미노펜(타이레놀) — 반려동물에게 독성, 절대 금지',
      '발열 시 수분 공급 + 환경 온도를 낮추는 것이 우선이에요.',
    ].join('\n')
  }

  // ── 귀 질환 심층 ─────────────────────────────────────────────────
  if (/귀\s*(염증|세균|효모|말라세지아|외이염|중이염|수술|폴리프|용종|세정|소리|이상한\s*소리)|귀\s*(가려움|긁음|냄새|분비물|진물|땅에\s*대고)/.test(text)) {
    return [
      '👂 귀 질환 심층 안내',
      '',
      '귀 질환은 재발이 잦으므로 근본 원인 파악이 중요해요.',
      '',
      '【외이염 주요 원인】',
      '• 말라세지아(효모): 갈색 蠟 같은 분비물, 달콤한 냄새',
      '• 세균: 황색 또는 초록 분비물, 고름',
      '• 귀 진드기: 검은 커피 찌꺼기 같은 분비물 (새끼 또는 고양이)',
      '• 알레르기: 외이도 자주 붉어짐, 반복 감염',
      '',
      '【귀 세정 방법】',
      '1. 귀 세정액을 귀 안에 넉넉히 떨어뜨리기',
      '2. 귀 입구를 부드럽게 마사지 (소리 나면 OK)',
      '3. 강아지가 머리를 흔들게 두기',
      '4. 면봉은 귀 입구 바깥쪽만 사용 (깊이 넣으면 위험)',
      '',
      '【수술이 필요한 경우】',
      '• 만성 외이염으로 귀 안이 두꺼워지고 좁아진 경우',
      '• 중이염으로 진행된 경우',
      '• 귀 용종(폴리프)',
      '',
      '【중이염 신호】',
      '• 머리를 흔들다가 갑자기 멈추고 방향감각 잃음',
      '• 머리 기울기',
      '• 청각 손실',
      '',
      '귀 문제가 반복해서 재발하나요?',
    ].join('\n')
  }

  // ── 고양이 음수 증가법 ────────────────────────────────────────────
  if (/고양이\s*(물\s*(안\s*마시|거부|조금|적게|늘리는|많이\s*마시게)|음수량|수분\s*(부족|늘리기|섭취))/.test(text)) {
    return [
      '💧 고양이 음수량 늘리는 방법 안내',
      '',
      '고양이는 원래 수분 섭취량이 적어요. 특히 신장병에서 음수 증가가 핵심이에요.',
      '',
      '【효과적인 방법들】',
      '1. 분수형 급수기: 흐르는 물을 선호하는 고양이 본능 활용',
      '2. 여러 곳에 물그릇: 각 방마다 배치',
      '3. 습식사료 도입: 건식의 10% vs 습식의 80% 수분',
      '4. 참치 물(소량): 신장병 없는 경우, 기호성 향상',
      '5. 닭 육수 (무염, 무양파): 물에 소량 섞기',
      '6. 물그릇 재질 변경: 스테인리스 or 도자기 (플라스틱 냄새 싫어하는 경우)',
      '7. 물 온도: 실온보다 약간 차갑게 좋아하는 경우 많음',
      '',
      '【하지 말 것】',
      '• 밥그릇 바로 옆에 물그릇 두기 (냄새 교차 싫어함)',
      '• 오래된 물 방치 (매일 교체)',
      '',
      '【하루 목표 음수량】',
      '• 건식 위주: 체중 1kg당 40~60mL',
      '• 습식 위주: 자연스럽게 섭취',
      '',
      '현재 어떻게 물을 주고 있나요? 건식사료 위주인가요?',
    ].join('\n')
  }

  // ── 약물 상호작용 / 복수약 ───────────────────────────────────────
  if (/약\s*(같이|여러\s*(개|가지)|복수|함께\s*먹어도|상호작용|섞어도)|약\s*(순서|간격|먹이는\s*순서)|NSAID\s*(스테로이드|같이)/.test(text)) {
    return [
      '💊 약물 복용 순서 및 상호작용 안내',
      '',
      '여러 약을 함께 먹일 때 주의해야 할 것들이 있어요.',
      '',
      '【절대 함께 쓰면 안 되는 조합】',
      '⚠️ NSAID + 스테로이드: 위장 출혈·궤양 위험 → 수의사 판단 없이 병용 금지',
      '⚠️ 두 가지 NSAID 동시 복용: 신장·위장 독성',
      '',
      '【시간 간격이 필요한 경우】',
      '• 인흡착제 (렌벨라·알매딘) + 다른 약: 2~3시간 간격',
      '  → 흡착제가 다른 약도 흡착할 수 있어요',
      '• 항생제 + 유산균: 최소 1~2시간 간격',
      '',
      '【babungee의 말】',
      '"레나메진 같은 흡착제는 비특이적으로 뭔가를 결합해요. 약과 같이 복용하면 약효가 떨어질 수 있어 시간 차를 두어야 해요."',
      '',
      '【공복 vs 식후 복용】',
      '• 피모벤단: 공복 복용 권장 (단, 다른 약이 많으면 식후로)',
      '• 스테로이드: 식후 또는 함께 급여',
      '• 항생제: 종류마다 다름 (처방 시 확인)',
      '• 쿠싱약(트릴로스탄): 아침 기상 시 공복 무관',
      '',
      '현재 어떤 약을 복용 중인지 알려주시면 더 구체적으로 안내해 드릴게요.',
    ].join('\n')
  }

  // ── 고관절 치환 / 재활 ───────────────────────────────────────────
  if (/재활\s*(치료|운동|센터|물리치료|수중|트레드밀)|물리\s*치료\s*(강아지|고양이|개)|수중\s*트레드밀|레이저\s*치료\s*(관절|통증|근육)/.test(text)) {
    return [
      '🏊 재활 치료 안내',
      '',
      '재활 치료는 수술 후 회복과 만성 통증 관리에 큰 도움이 돼요.',
      '',
      '【재활 치료의 종류】',
      '● 수중 트레드밀 (Underwater Treadmill):',
      '  - 관절에 부담 없이 근력 강화',
      '  - 관절염, 수술 후, 신경 질환에 효과적',
      '',
      '● 레이저 치료 (Low-level laser therapy):',
      '  - 염증 감소, 통증 완화, 치유 촉진',
      '  - 수술 부위, 관절염, 근육 통증에 사용',
      '',
      '● 전기 자극 치료 (TENS/NMES):',
      '  - 신경·근육 자극으로 근육 재교육',
      '  - 신경 마비 회복에 사용',
      '',
      '● 도수 치료:',
      '  - 관절 가동 범위 회복',
      '  - 근육 이완, 마사지',
      '',
      '【집에서 하는 재활 운동】',
      '• 수건 기립 훈련: 뒷다리 아래 수건으로 지지하면서 서기 연습',
      '• 균형판(밸런스 패드): 조심스럽게 올라서게 해 균형 감각 향상',
      '• 10분 평지 걷기: 관절 자극 최소화하며 근육 유지',
      '',
      '재활 치료는 어떤 질환이나 수술 후 고려하시는 건가요?',
    ].join('\n')
  }

  // ── 통증 인식 / 통증 관리 ────────────────────────────────────────
  if (/통증\s*(인식|느끼는|어떻게|표현|숨기는|신호|확인|있는지)|아픈\s*(신호|표현|모르겠)|고통\s*(스러운|신호|표현)/.test(text)) {
    return [
      '😿 반려동물 통증 인식 안내',
      '',
      '반려동물은 통증을 숨기는 경향이 있어요. 미묘한 신호를 알아채야 해요.',
      '',
      '【통증 신호 체크리스트】',
      '✅ 활동량 감소, 운동 거부',
      '✅ 평소보다 더 많이 잠',
      '✅ 만지면 움츠리거나 으르렁거림',
      '✅ 특정 부위를 자꾸 핥거나 씹음',
      '✅ 식욕 감소',
      '✅ 자세 변화 (등을 구부림, 배를 바닥에 대고)',
      '✅ 걸음걸이 변화',
      '✅ 눈이 가늘게 떠짐 (눈 찡그림)',
      '✅ 귀가 뒤로 젖혀짐',
      '',
      '【고양이 특이 통증 신호】',
      '• 얼굴 표정: 눈 가늘게 뜨기, 수염이 앞으로 모아짐',
      '• 귀가 납작하게 눌림',
      '• 화장실에 잘 못 감 (관절 통증)',
      '• 그루밍을 못 함 (통증 부위에 접근 못 함)',
      '',
      '【통증 관리 원칙】',
      '• 모든 수술·처치 후 진통 관리는 기본',
      '• 만성 통증 동물에서 통증이 줄면 활동량·식욕이 돌아와요',
      '• NSAID, 가바펜틴, 트라마돌 등 다양한 진통제 조합 가능',
      '',
      '어떤 상황에서 아파 보이는 것 같나요?',
    ].join('\n')
  }

  // ── 고양이 신장 처방식 거부 ──────────────────────────────────────
  if (/신장\s*(처방식|사료)\s*(거부|안먹|못먹|싫어|배합)|신장\s*(사료\s*바꾸기|처방식\s*어떻게)|renal\s*(사료|처방식)\s*(거부|안\s*먹)/.test(text)) {
    return [
      '🐱 신장 처방식 거부 해결 방법 안내',
      '',
      '신장 처방식은 신부전 고양이에게 중요하지만 기호성이 낮아요.',
      '',
      '【단계적 전환법】',
      '1주차: 기존 사료 90% + 신장 처방식 10%',
      '2주차: 기존 70% + 처방식 30%',
      '3주차: 기존 50% + 처방식 50%',
      '4주차: 기존 20% + 처방식 80%',
      '5주 이후: 처방식 100%',
      '',
      '【거부 시 보완책】',
      '• 따뜻하게 데우기 (냄새 강화)',
      '• 위에 소량의 닭 육수 (무염·무양파) 뿌리기',
      '• 형태 변경: 건식만 거부하면 같은 브랜드 습식으로',
      '• 신장 처방식 브랜드 변경 (힐스 k/d, 로얄캐닌 Renal, 퓨리나 NF 등)',
      '',
      '【먹이 일반 음식 vs 굶기기】',
      '"고양이는 48시간 이상 안 먹으면 지방간이 올 수 있어요."',
      '"처방식을 거부하면 억지로 굶기지 말고, 일반 저인 사료를 임시로 사용하면서 서서히 전환하세요."',
      '',
      '【현실적 타협점】',
      '완벽한 처방식이 불가능한 경우: 일반 사료 중 저인 제품 선택 + 인흡착제 병용이 더 현명한 선택일 수 있어요.',
    ].join('\n')
  }

  // ── 고양이 무기력 / 숨기 ────────────────────────────────────────
  if (/고양이\s*(숨어|구석에|안나와|어둠|침대\s*밑|혼자|조용히|무기력|기력\s*없|힘이\s*없|움직이지\s*않)/.test(text)) {
    return [
      '🐱 고양이 숨기·무기력 안내',
      '',
      '고양이가 숨는 것은 불편하거나 아픈 신호일 수 있어요.',
      '',
      '【숨기의 의미】',
      '• 정상: 스트레스, 낯선 환경, 방문객',
      '• 주의: 24시간 이상 지속, 평소와 다른 장소',
      '• 위험: 식욕·음수 저하 동반, 무반응, 체온 저하',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 48시간 이상 밥을 안 먹음',
      '🚨 부르거나 자극해도 반응 없음',
      '🚨 호흡이 빠르거나 복부 호흡',
      '🚨 잇몸이 창백하거나 파랗거나 노랗게 변함',
      '',
      '【집에서 확인할 것】',
      '• 마지막으로 밥 먹은 시간',
      '• 소변·대변 최근 여부',
      '• 만졌을 때 통증 반응 (움츠림)',
      '• 체온 (직장 체온계로 38~39.2°C가 정상)',
      '',
      '【환경 스트레스 vs 신체 질환 구별】',
      '• 스트레스성: 특정 사건(이사, 손님) 이후 발생, 먹이 주면 먹음',
      '• 신체 질환: 점진적 악화, 먹이를 줘도 안 먹음, 만지면 반응',
    ].join('\n')
  }

  // ── 개 공격성 ──────────────────────────────────────────────────────
  if (/개\s*(공격|무는|물었|공격성|짖으며\s*달려들|으르렁|다른\s*개\s*(공격|못만나))|공격적인\s*(강아지|개)|리쉬\s*반응성/.test(text)) {
    return [
      '🐕 개 공격성 관리 안내',
      '',
      '공격성은 두려움·통증·영역·자원 보호 등 원인이 다양해요.',
      '',
      '【공격성 유형 파악】',
      '● 두려움 공격: 귀가 뒤로, 꼬리 내림 → 겁먹은 상태에서 방어',
      '● 통증 공격: 특정 부위 만질 때만 → 건강 검진 먼저',
      '● 자원 보호: 음식·장난감 주변에서만',
      '● 영역 공격: 집 안이나 산책 중 자기 영역에서',
      '● 리쉬 반응성: 목줄 상태에서만 → 제어 본능',
      '',
      '【즉시 할 것】',
      '• 공격 유발 상황 최대한 피하기 (관리 우선)',
      '• 개에게 처벌하지 않기 → 공격성 악화',
      '• 입마개 훈련: 물림 예방 + 이동 필요 시',
      '',
      '【훈련 접근법 (Counter-conditioning)】',
      '• 두려운 자극 멀리서 → 간식 연결 → 거리 서서히 줄이기',
      '• 전문 행동 수의사 또는 행동 교정 전문가 추천',
      '',
      '【약물 보조 (심한 경우)】',
      '• 플루옥세틴, 클로미프라민: 불안·공격성 감소',
      '• 트라조돈: 상황적 불안 (병원 방문 전 등)',
      '• 약은 훈련과 병행해야 효과적이에요',
    ].join('\n')
  }

  // ── 일상 예방 / 정기 검진 ────────────────────────────────────────
  if (/정기\s*(검진|검사|건강검진)|건강검진\s*(주기|얼마나|언제|몇\s*살부터)|예방\s*(검사|관리|주기)|혈액검사\s*(언제|주기|얼마마다)/.test(text)) {
    return [
      '📅 정기 건강검진 안내',
      '',
      '예방은 치료보다 훨씬 저렴하고 효과적이에요.',
      '',
      '【연령별 권장 검진 주기】',
      '● 1~6세 (성견·성묘): 1년에 1회',
      '  - 기본 신체검사, 혈액검사, 요검사, 분변검사',
      '  - 예방접종 스케줄 확인',
      '',
      '● 7~9세 (중년): 1년에 2회',
      '  - 위 항목 + 흉부 X-ray, 복부 초음파',
      '  - 혈압 측정 추가',
      '',
      '● 10세 이상 (노령): 6개월마다',
      '  - 신장·간·갑상선·심장 집중 모니터링',
      '  - 인지장애 평가',
      '',
      '【검진 전 준비】',
      '• 공복 상태로 방문 (혈액·요검사 결과에 영향)',
      '• 분변은 당일 신선한 것 지참',
      '• 평소 복용 중인 약 목록 작성',
      '• 최근 이상 증상 메모',
      '',
      '【신장·간·당뇨·갑상선 조기 발견 효과】',
      '초기 발견 시 치료 효과가 훨씬 좋아요.',
      'SDMA 검사: 신장 기능을 기존보다 훨씬 이른 시기에 감지 가능',
      '',
      '마지막 정기검진이 언제였나요?',
    ].join('\n')
  }

  // ── 신경·척수 손상 후 재활 ───────────────────────────────────────
  if (/척수\s*(손상|회복|재활)|신경\s*(손상|회복|재생)|하반신\s*(마비\s*후|회복|재활)|배뇨\s*(유도|마사지|표현|인공)|방광\s*(마사지|짜주기|배뇨)/.test(text)) {
    return [
      '🦴 척수 손상·하반신 마비 후 재활 안내',
      '',
      '척수 손상 후 회복은 시간이 걸리지만 포기하지 마세요.',
      '',
      '【회복 예후 기준】',
      '• 통증 감각 있음 + 걷지 못함: 회복 가능성 높음',
      '• 통증 감각 없음: 회복 불확실, 하지만 일부 회복 사례 있음',
      '• 수술 후 빠를수록 예후 좋음',
      '',
      '【집에서 배뇨 관리 (방광 마비 시)】',
      '• 방광 수동 배뇨: 배 아래 방광 부위를 부드럽게 압박',
      '• 수의사에게 방법 배운 후 시행 (방광 파열 위험)',
      '• 4~6시간마다 실시',
      '• 오염 방지: 배변패드 자주 교체, 피부 청결 유지',
      '',
      '【재활 운동】',
      '• 수동 관절 운동(ROM): 각 관절을 부드럽게 구부리고 펴기',
      '• 지지 보행: 수건으로 허리를 받쳐 걷기 연습',
      '• 수중 트레드밀: 부력으로 체중 부담 줄이며 근육 운동',
      '',
      '【욕창 예방】',
      '• 2시간마다 체위 변경',
      '• 메모리폼 등 압력 분산 패드',
      '• 빨간 점·피부 벗겨짐 즉시 확인',
    ].join('\n')
  }

  // ── 고양이 HCM / 비후성 심근증 ──────────────────────────────────
  if (/HCM|비후성\s*심근증|고양이\s*(심장\s*(비대|두꺼워)|심근증|심장병)|메인쿤\s*심장|라그돌\s*심장/.test(text)) {
    return [
      '❤️ 고양이 비후성 심근증(HCM) 안내',
      '',
      '고양이 심장병 중 가장 흔한 유형이에요.',
      '',
      '【HCM이란?】',
      '좌심실 벽이 두꺼워져 혈액을 제대로 뿜어내지 못하는 질환이에요.',
      '',
      '【위험 품종】',
      '• 메인쿤, 라그돌: 유전적으로 발생 빈도 높음 → HCM 유전자 검사 권장',
      '• 페르시안, 아비시니안, 스코티시폴드',
      '',
      '【증상】',
      '• 무증상으로 오래 지내다 갑자기 발현',
      '• 호흡 곤란, 입으로 숨쉬기',
      '• 무기력, 뒷다리 마비 (대동맥 색전증)',
      '• 급사 가능성',
      '',
      '🚨 고양이가 입으로 숨쉬거나 뒷다리를 갑자기 못 쓴다면 즉시 응급',
      '',
      '【대동맥 색전증(ATE)】',
      '• HCM 합병증 — 혈전이 대동맥을 막아 뒷다리 마비',
      '• 극심한 통증, 양쪽 뒷다리가 차갑고 보라색',
      '• 생존율 낮지만 빠른 처치로 일부 회복',
      '',
      '【치료 및 관리】',
      '• 아테놀롤: 심박수 감소',
      '• 혈전 예방: 클로피도그렐 (고양이 아스피린 대안)',
      '• 폐수종 동반 시: 푸로세마이드',
      '',
      '심초음파(에코) 정기 검사가 가장 중요해요. 얼마나 자주 받으셨나요?',
    ].join('\n')
  }

  // ── 과호흡 / 패닉 / 스트레스 호흡 ───────────────────────────────
  if (/과호흡|패닉\s*(호흡|발작)|스트레스\s*(호흡|헐떡|반응)|병원에서\s*(떨림|헐떡|과호흡)|차\s*(타면|이동)\s*(헐떡|숨|호흡)/.test(text)) {
    return [
      '😰 스트레스·패닉 호흡 안내',
      '',
      '병원이나 이동 중 과호흡은 공포 반응이에요.',
      '',
      '【단계별 접근】',
      '1. 안전한 공간 제공: 이동장 내 숨을 수 있게',
      '2. 목소리: 낮고 차분하게',
      '3. 눈 마주침 피하기: 과호흡 중 눈을 피하면 더 안정될 수 있어요',
      '4. 시원한 환경: 에어컨 틀기',
      '',
      '【이동장 긍정 연습】',
      '• 집에서 이동장을 열어두고 자연스럽게 드나들게',
      '• 이동장 안에 좋아하는 수건·장난감',
      '• 이동장에서 밥 먹게 하면 더 빨리 익숙해져요',
      '',
      '【차 이동 시】',
      '• 공복 상태에서 이동 (멀미 예방)',
      '• 이동장은 창문이 안 보이게 (시각 자극 차단)',
      '• 짧은 드라이브부터 시작해 차에 익숙하게',
      '',
      '【수의사에게 처방받을 수 있는 것】',
      '• 가바펜틴: 이동·병원 방문 전 1~2시간 전 투여',
      '• 트라조돈: 상황적 불안',
      '• 페로몬 스프레이(어댑틸/Feliway): 이동장에 미리 뿌려두기',
      '',
      '병원 방문이나 이동이 언제 있나요?',
    ].join('\n')
  }

  // ── 고양이 토혈 / 혈변 ────────────────────────────────────────────
  if (/고양이\s*(피\s*토|토혈|혈변|피\s*섞인\s*구토|피가\s*나오는\s*구토)|개\s*(피\s*토|토혈\s*응급)/.test(text)) {
    return [
      '🚨 토혈·혈변 긴급 안내',
      '',
      '피가 섞인 구토나 혈변은 원인에 따라 응급도가 달라요.',
      '',
      '【즉시 응급인 경우】',
      '🚨 선홍색 피가 많이 나옴',
      '🚨 흑색 타르처럼 구토 (상부 소화관 출혈)',
      '🚨 무기력 + 창백한 잇몸 + 혈변',
      '🚨 강아지가 혈변 + 구토 (파보 의심)',
      '',
      '【비교적 관찰 가능한 경우】',
      '• 소량의 선홍색 줄 (구토 자극으로 식도 미세 출혈)',
      '• 한 번 있고 다른 증상 없음',
      '• 대변에 약간의 점액과 혈액 (대장 자극)',
      '',
      '【원인 감별】',
      '• 위염·위궤양: 공복 구토 후 피',
      '• IBD: 반복적 혈변',
      '• 종양: 나이 많은 경우, 점진적 악화',
      '• NSAID 부작용: 약 복용 시작 후 발생',
      '• 혈소판 감소: 잇몸·피부 출혈 동반',
      '',
      '지금 몇 번 있었고, 다른 증상(무기력, 식욕, 잇몸 색)은 어떤가요?',
    ].join('\n')
  }

  // ── 설치 접종 / 타 지역 이동 ────────────────────────────────────
  if (/해외\s*(이동|반출|입국|가져가기)|타\s*지역\s*(이동|이사)|비행기\s*(태우기|이동)|항공\s*(이동|반출)|광견병\s*(항체|검사)/.test(text)) {
    return [
      '✈️ 반려동물 이동·해외 반출 안내',
      '',
      '해외 이동은 최소 3~6개월 전부터 준비가 필요해요.',
      '',
      '【기본 준비사항】',
      '1. 마이크로칩 삽입 (ISO 규격 15자리)',
      '2. 광견병 예방접종 (마이크로칩 삽입 후)',
      '3. 광견병 항체 검사: FAVN Test (일부 국가 필수)',
      '4. 건강증명서: 수의사 발급 → 공수의 확인 → APHIS 인증',
      '',
      '【국가별 차이】',
      '• 미국·캐나다: 광견병 접종 증명 + 건강증명서',
      '• 호주·뉴질랜드: 광견병 항체검사 필수, 격리기간 있음',
      '• 일본·영국: 세부 요구사항 다름 → 해당 대사관 확인 필수',
      '',
      '【항공 이동 주의사항】',
      '• 항공사마다 규정 다름 (기내 vs 화물)',
      '• 기내 반입: 소형견·고양이 (이동장 포함 특정 무게 이하)',
      '• 단두종은 화물 거부 항공사 많음',
      '• 이동 전 비행기 적합성 건강증명서 필요',
      '',
      '어느 나라로 이동하실 예정인가요? 구체적인 요건을 안내해 드릴게요.',
    ].join('\n')
  }

  // ── 임신·출산 ─────────────────────────────────────────────────────
  if (/임신\s*(강아지|고양이|개|묘)|출산\s*(준비|전|후|어떻게|도움)|만삭|분만|제왕절개|새끼\s*(낳|출산|태어)/.test(text)) {
    return [
      '🍼 임신·출산 안내',
      '',
      '반려동물 임신과 출산은 꼼꼼한 준비가 필요해요.',
      '',
      '【임신 기간】',
      '• 개: 약 58~65일 (평균 63일)',
      '• 고양이: 약 60~67일 (평균 63일)',
      '',
      '【출산 징후 (D-1~2)】',
      '• 체온 저하: 37~38°C (정상보다 1°C 낮아짐)',
      '• 식욕 감소, 불안해함',
      '• 둥지 만들기 행동',
      '• 유즙 분비 시작',
      '',
      '【출산 준비】',
      '• 조용하고 따뜻한 출산 박스 준비',
      '• 세균이 없는 깨끗한 수건, 신문지',
      '• 소독된 가위, 실 (탯줄 처리)',
      '• 24시간 동물병원 연락처',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 강한 진통 30분 이상 지속인데 새끼 안 나옴',
      '🚨 초록/검정 분비물 (정상은 약간의 초록) + 새끼 안 나옴',
      '🚨 마지막 새끼 후 2시간 내 이상 분비물',
      '',
      '【출산 후 주의】',
      '• 어미 체온 정상 확인',
      '• 모든 새끼 태반 배출 확인',
      '• 수유 확인 (첫 12시간 내 초유 중요)',
    ].join('\n')
  }

  // ── 중성화 시기 · 효과 ────────────────────────────────────────────
  if (/중성화\s*(시기|나이|효과|언제|해야|안해도|득실|장점|단점)|중성화\s*(수컷|암컷)\s*(몇\s*개월|몇\s*살)|난소\s*자궁\s*적출|고환\s*제거/.test(text)) {
    return [
      '✂️ 중성화 수술 안내',
      '',
      '중성화는 건강과 행동 모두에 영향을 미쳐요.',
      '',
      '【권장 시기 (일반적)】',
      '• 소형견: 6~8개월령',
      '• 대형견: 12~18개월령 (뼈 성장 완료 후)',
      '• 고양이: 4~6개월령 (첫 발정 전)',
      '',
      '【중성화의 이점】',
      '✅ 암컷: 유선종양·자궁축농증·난소종양 예방',
      '✅ 수컷: 전립선 비대, 고환 종양, 회음부 탈장 예방',
      '✅ 행동: 방황, 마킹, 발정 울음 감소',
      '✅ 인구 조절',
      '',
      '【주의사항】',
      '• 일부 대형견: 너무 이른 중성화 → 관절 이형성 위험 증가',
      '• 수컷 고양이 이른 중성화: 요도 발달 지연 가능성',
      '• 비만 위험 증가 → 식이 관리 필요',
      '• 요실금 (암컷 개): 에스트로겐 감소로 드물게 발생',
      '',
      '【중성화 후 관리】',
      '• 수술 후 7~10일 절개 부위 주의',
      '• 넥카라 착용',
      '• 1주 내 활동 제한',
      '• 음식 양 10~15% 줄이기 (대사 저하)',
    ].join('\n')
  }

  // ── 냄새 문제 / 악취 ─────────────────────────────────────────────
  if (/냄새\s*(심한|이상한|나쁜)|악취|항문낭\s*(냄새|짜기|짜야|터짐)|구취\s*(심한|이상한)|귀\s*냄새|발\s*냄새/.test(text)) {
    return [
      '👃 냄새 관련 안내',
      '',
      '반려동물의 냄새 원인은 다양해요.',
      '',
      '【항문낭 (Anal Glands) 관련】',
      '• 항문낭 가득 찼을 때: 바닥에 엉덩이 끌기, 항문 주변 핥기',
      '• 물고기 냄새 같은 불쾌한 냄새',
      '• 2~4주마다 또는 필요 시 짜주기 (미용실·동물병원)',
      '• 항문낭 파열: 한쪽 항문 옆이 부어오름 → 즉시 병원',
      '',
      '【구취 (입냄새) 원인】',
      '• 치주 질환: 가장 흔함 → 스케일링 필요',
      '• 신부전: 암모니아·요독 냄새',
      '• 당뇨: 달콤한 냄새',
      '• 구강 종양',
      '',
      '【귀 냄새】',
      '• 달콤한 효모 냄새: 말라세지아 감염',
      '• 고름 냄새: 세균 감염',
      '• 지저분한 파·커피 냄새: 귀 진드기',
      '',
      '【발 냄새】',
      '• 약간의 냄새는 정상 (정상 피부균)',
      '• 심한 냄새: 발바닥 효모 감염 (특히 발가락 사이 빨간색)',
      '• 알레르기로 발을 자꾸 핥으면 악화',
      '',
      '어떤 냄새가 가장 문제인가요?',
    ].join('\n')
  }

  // ── 피부 곰팡이 / 링웜 ───────────────────────────────────────────
  if (/링웜|피부\s*(곰팡이|진균)|백선|dermatophyte|그레이하운드\s*(피부|곰팡이)|털\s*(빠진\s*원형|빠지는\s*원형|원형\s*탈모)/.test(text)) {
    return [
      '🍄 피부 곰팡이(링웜/피부사상균) 안내',
      '',
      '링웜은 사람에게도 전파되는 인수공통전염병이에요.',
      '',
      '【증상】',
      '• 원형 탈모, 경계가 뚜렷한 비늘성 피부',
      '• 가려울 수도 있고 안 가려울 수도 있어요',
      '• 피부가 빨갛게 되거나 딱지',
      '',
      '【진단】',
      '• 우드 램프(Wood\'s lamp): 일부 유형에서 형광',
      '• 피부 배양 검사: 확진 (2~4주 소요)',
      '• DTM(피부사상균 배지): 빨간색으로 변하면 양성',
      '',
      '【치료】',
      '• 국소 항진균제: 클로트리마졸, 미코나졸 샴푸',
      '• 전신 항진균제: 이트라코나졸 (심한 경우)',
      '• 치료 기간: 최소 6주 이상',
      '• 환경 소독: 바닥, 침구, 장난감 소독',
      '',
      '【사람 감염 예방】',
      '• 동물 접촉 후 손 씻기',
      '• 밀접 접촉 제한 (치료 중)',
      '• 사람도 증상(원형 발진) 있으면 피부과 방문',
      '',
      '모든 접촉 동물을 함께 검사하는 것을 권장해요.',
    ].join('\n')
  }

  // ── 각막 궤양 / 눈 상처 ──────────────────────────────────────────
  if (/각막\s*(궤양|상처|긁힘|손상|천공|녹아|흐릿|뿌옇)|플루오레세인|눈\s*(계속\s*감|통증|긁음|비빔)|눈\s*(찡그림|찌푸림)/.test(text)) {
    return [
      '👁️ 각막 궤양 안내',
      '',
      '각막 궤양은 빠른 치료가 중요한 안과 응급이에요.',
      '',
      '【증상】',
      '• 눈을 자꾸 감거나 찡그림',
      '• 눈물·분비물 증가',
      '• 발로 눈 긁기',
      '• 각막이 흐리거나 뿌옇게 변함',
      '• 빛에 민감',
      '',
      '【즉시 병원 신호】',
      '🚨 위 증상 중 하나라도 있으면 당일 방문 권장',
      '각막 궤양은 24시간 내 급격히 진행할 수 있어요.',
      '',
      '【진단 - 플루오레세인 검사】',
      '• 녹색 형광 염색약을 눈에 떨어뜨려 궤양 확인',
      '• 궤양 부위가 초록색으로 형광 발생',
      '',
      '【치료】',
      '• 항생제 안약: 2차 세균 감염 예방',
      '• 아트로핀 안약: 통증 완화 (동공 산대)',
      '• 넥카라: 눈 긁지 않도록',
      '• 깊은 궤양: 결막판술, 각막이식 필요',
      '',
      '【단두종 주의 (퍼그·시추)】',
      '눈이 돌출된 품종은 외상·건조증으로 각막 궤양이 잦아요.',
      '정기적으로 인공눈물을 넣어주는 것이 예방에 도움돼요.',
    ].join('\n')
  }

  // ── 파행 / 절뚝거림 ──────────────────────────────────────────────
  if (/절뚝\s*(거림|이는|임)|파행|다리\s*(들고\s*(걸음|다님)|절어|절뚝|아픈|이상)|한\s*쪽\s*다리\s*(못쓰|들어|절어)/.test(text)) {
    return [
      '🦿 절뚝거림·파행 안내',
      '',
      '절뚝거림은 통증의 위치를 파악하는 것이 먼저예요.',
      '',
      '【전다리 vs 뒷다리】',
      '● 앞다리 절음:',
      '  - 주관절(엘보) 이형성, OCD (연골 분리)',
      '  - 어깨 통증, 앞발 외상',
      '  - 목·경추 디스크 (앞다리 힘 약해짐)',
      '',
      '● 뒷다리 절음:',
      '  - 슬개골 탈구 (소형견 → 갑자기 다리 들기)',
      '  - 고관절 이형성 (대형견 → 앉을 때 좌우 불균형)',
      '  - 요추·흉추 디스크 (뒷다리 전체 약화)',
      '  - ACL 파열 (갑작스러운 절음, 큰 개에서 흔함)',
      '',
      '【즉시 병원이 필요한 경우】',
      '🚨 다리를 아예 못 씀 (3도 파행)',
      '🚨 갑자기 발생한 뒷다리 마비',
      '🚨 붓기·열감이 심한 관절',
      '',
      '【집에서 확인】',
      '• 어느 다리인지, 걸을 때 vs 안정 시 차이',
      '• 발바닥·발가락 사이 이물질·상처',
      '• 만졌을 때 통증 반응 위치',
      '',
      '어느 다리이고, 언제부터 시작됐나요?',
    ].join('\n')
  }

  // ── 항암 중 감염 / 응급 ──────────────────────────────────────────
  if (/항암\s*(중|후)\s*(열|발열|감염|응급)|화학요법\s*(발열|응급)|항암\s*후\s*(체온|열이|응급)|호중구\s*감소성\s*열/.test(text)) {
    return [
      '🚨 항암 중 발열 응급 안내',
      '',
      '항암 치료 중 발열은 즉각적인 대응이 필요해요.',
      '',
      '🚨 항암 치료 후 39.5°C 이상 발열 → 즉시 응급 병원',
      '',
      '【왜 위험한가?】',
      '항암 치료 후 7~14일은 호중구(면역세포)가 가장 낮아요.',
      '이 시기의 발열은 호중구 감소성 열(Febrile Neutropenia)이며',
      '면역력이 거의 없는 상태에서 세균 감염이 진행될 수 있어요.',
      '',
      '【병원에서 받게 되는 처치】',
      '• 즉각적인 혈액검사 (WBC, 호중구 수)',
      '• 정맥 항생제 (광범위 스펙트럼)',
      '• 수액 처치',
      '• 가능하면 혈액 배양 검사',
      '',
      '【집에서 준비할 것】',
      '• 항암 치료 일정 기록 (마지막 치료 날짜)',
      '• 담당 수의사·응급 병원 번호',
      '• 귀가 후 당일 체온 측정 루틴',
      '',
      '지금 체온이 얼마나 되나요? 마지막 항암이 언제였나요?',
    ].join('\n')
  }

  // ── 비만세포종 심층 ───────────────────────────────────────────────
  if (/비만세포종\s*(등급|grade|치료|재발|항암|수술\s*후|경과)|mast\s*cell\s*(tumor|grade)|비만세포종\s*(타입|type|고등급|저등급)/.test(text)) {
    return [
      '🔬 비만세포종 심층 안내',
      '',
      '비만세포종은 등급에 따라 치료 전략이 완전히 달라요.',
      '',
      '【등급 시스템】',
      '● 구 분류 (Patnaik):',
      '  - Grade 1: 저악성, 완전 절제 시 완치 가능',
      '  - Grade 2: 중간 (예후 다양)',
      '  - Grade 3: 고악성, 전이율 높음',
      '',
      '● 새 이분법 (Kiupel 2011):',
      '  - Low grade: 예후 좋음',
      '  - High grade: 공격적, 항암 치료 필요',
      '',
      '【치료 전 검사】',
      '• 지역 림프절 세침흡인(FNA)',
      '• 복부 초음파 (비장·간 전이)',
      '• 흉부 X-ray',
      '• C-kit(KIT) 유전자 돌연변이 검사 → 팔리파닙 사용 여부 결정',
      '',
      '【치료 옵션】',
      '• 수술: 1~2cm 이상 절제 마진',
      '• 방사선: 불완전 절제 후 보조',
      '• 항암: 로무스틴(CCNU) + 빈블라스틴',
      '• 팔리파닙(Palladia): KIT 돌연변이 있으면 효과적',
      '',
      '현재 등급이 어떻게 나왔고, 수술은 완전 절제됐나요?',
    ].join('\n')
  }

  // ── 다발성 장기 부전 ──────────────────────────────────────────────
  if (/다발성\s*(장기\s*부전|기관\s*부전|이상)|여러\s*장기\s*(안좋|이상|부전)|MODS|MOF\b|간\s*신장\s*(모두|둘다\s*안좋)/.test(text)) {
    return [
      '🏥 다발성 장기 부전 안내',
      '',
      '여러 장기가 동시에 안 좋은 경우 원인을 찾아 치료해야 해요.',
      '',
      '【다발성 장기 부전의 흔한 원인】',
      '• 패혈증 (심한 감염으로 인한 전신 염증)',
      '• 심부전 → 신장·간으로 혈류 감소',
      '• DIC (파종성 혈관내 응고) — 복합 부전의 마지막 단계',
      '• 쇼크 (출혈, 아나필락시스)',
      '',
      '【각 장기 손상 순서 (혈류 부족 시)】',
      '1. 신장: 가장 민감 → BUN/Cre 상승',
      '2. 간: ALT/ALP 상승',
      '3. 폐: 호흡 부전',
      '4. 심장: 부정맥, 심부전',
      '',
      '【치료 원칙】',
      '• 근본 원인 치료가 최우선',
      '• 수액으로 조직 관류 유지',
      '• 각 장기별 지지 치료',
      '• 입원 집중 치료가 필요한 경우',
      '',
      '【예후 인식】',
      '다발성 장기 부전은 예후가 나쁠 수 있어요.',
      '치료 목표 (완치 vs 완화)를 수의사와 솔직하게 상의하세요.',
    ].join('\n')
  }

  // ── 사마귀 / 바이러스성 유두종 ───────────────────────────────────
  if (/사마귀|유두종|papilloma|구강\s*(사마귀|혹)\s*(개|강아지)|강아지\s*(사마귀|유두종)|젊은\s*(개|강아지)\s*(사마귀|혹)/.test(text)) {
    return [
      '🦠 바이러스성 유두종(사마귀) 안내',
      '',
      '강아지 구강 사마귀는 대부분 자연 치유돼요.',
      '',
      '【특징】',
      '• 원인: 개 유두종 바이러스(CPV)',
      '• 흔히 입 주변, 구강 내, 눈꺼풀에 발생',
      '• 1살 미만 어린 강아지에서 자주 발생',
      '• 특징: 콜리플라워처럼 울퉁불퉁한 모양',
      '',
      '【예후】',
      '• 대부분 2~3개월 내 자연 소실',
      '• 면역력 생기면 없어져요',
      '',
      '【치료가 필요한 경우】',
      '• 먹기 어려울 정도로 큰 구강 사마귀',
      '• 세균 2차 감염 (악취, 출혈)',
      '• 수개월 지나도 없어지지 않음',
      '• 개수가 너무 많음',
      '',
      '【전파 주의】',
      '• 다른 개에게 전파 가능 (직접 접촉)',
      '• 치유 전까지 다른 개와 분리 권장',
      '• 사람에게는 전파되지 않아요',
      '',
      '얼마나 됐고, 어디에 얼마나 나 있나요?',
    ].join('\n')
  }

  // ── 부신 종양 / PDH vs ADH ──────────────────────────────────────
  if (/부신\s*(종양|암|adenoma|adenocarcinoma)|PDH|ADH\b|뇌하수체\s*(종양|의존|의존형)|부신\s*(의존형|크기|비대)/.test(text)) {
    return [
      '🔬 부신 종양 (쿠싱 원인) 심층 안내',
      '',
      '쿠싱증후군의 원인에 따라 치료가 달라요.',
      '',
      '【PDH (뇌하수체 의존형 - 85~90%)】',
      '• 뇌하수체에 작은 종양 → ACTH 과다 분비 → 부신 과활성화',
      '• 양쪽 부신이 모두 커짐',
      '• 치료: 트릴로스탄 (가장 흔함) 또는 미토탄',
      '',
      '【ADH (부신 의존형 - 10~15%)】',
      '• 부신 자체에 종양',
      '• 한쪽 부신만 비대',
      '• 치료: 가능하면 수술(부신절제술), 또는 트릴로스탄',
      '• 부신 종양이 악성인 경우 예후 불량',
      '',
      '【감별 진단】',
      '• Low-dose dexamethasone suppression test (LDDST)',
      '• ACTH 농도 측정',
      '• 복부 초음파: 부신 크기·형태',
      '• CT: 뇌하수체 종양 크기 (MRI가 더 정확)',
      '',
      '【수술 고려 (ADH)】',
      '• 복강경 부신절제술 가능한 병원 제한적',
      '• 마취 위험·수술 중 출혈 위험 있어요',
      '• 수술 전후 코티솔 보충 필수',
      '',
      'ACTH 검사와 초음파 결과를 알고 계신가요?',
    ].join('\n')
  }

  // ── 비장 질환 / 비장 종양 ────────────────────────────────────────
  if (/비장\s*(종양|혹|절제|제거|문제|비대|출혈|파열)|spleen\s*(tumor|mass|rupture|removal)|HSA\b|혈관육종/.test(text)) {
    return [
      '🔴 비장 질환·종양 안내',
      '',
      '비장 혹은 발견 즉시 추가 검사가 필요해요.',
      '',
      '【비장 혹의 원인 (개)】',
      '• 비장 혈관육종(HSA): 가장 위험 — 전이 빠름',
      '• 결절성 과형성: 양성, 수술 후 좋음',
      '• 비장 혈종: 혈액으로 채워진 덩어리 (출혈 위험)',
      '',
      '【검사로 악성 vs 양성 구분이 어려운 이유】',
      '초음파나 X-ray만으로는 양성·악성 구별이 거의 불가능해요.',
      '절제 후 조직검사가 확진의 유일한 방법이에요.',
      '',
      '【응급 - 비장 출혈/파열】',
      '🚨 갑작스러운 허탈, 창백한 잇몸, 복부 팽만',
      '→ 즉시 응급 수술 필요',
      '→ 이동 중: 스트레스 최소화, 흥분 금지',
      '',
      '【비장 절제 후 예후】',
      '• 양성: 수술 후 완치',
      '• 혈관육종: 중앙 생존 기간 1~2개월 (항암 포함 4~6개월)',
      '• 항암 프로토콜: Doxorubicin 기반',
      '',
      '비장 혹이 얼마나 크고, 혈액검사에서 이상은 없었나요?',
    ].join('\n')
  }

  // ── 골육종 / 뼈 종양 ─────────────────────────────────────────────
  if (/골육종|뼈\s*(종양|암|통증)|osteosarcoma|다리\s*(종양|뼈\s*암)|뼈\s*(부어|부음|덩어리)|앞다리\s*(부어|통증)/.test(text)) {
    return [
      '🦴 골육종(뼈 종양) 안내',
      '',
      '골육종은 대형견에서 가장 흔한 악성 뼈 종양이에요.',
      '',
      '【위험 품종·특징】',
      '• 골든리트리버, 로트와일러, 그레이트 데인 등 대형견',
      '• 앞다리 아래(요골 원위부)에서 가장 흔함',
      '• 진단 시 90%에서 이미 폐 미세전이',
      '',
      '【증상】',
      '• 특정 다리의 점진적 절음',
      '• 관절 부근 부종, 만지면 통증',
      '• 뼈가 약해져 병리적 골절 위험',
      '',
      '【진단】',
      '• X-ray: 뼈의 "sun burst 패턴", 뼈 피질 파괴',
      '• 흉부 X-ray: 전이 여부',
      '• 조직검사: 확진',
      '',
      '【치료 옵션】',
      '• 표준: 절단(amputation) + 항암 (cisplatin/doxorubicin) → 중앙 생존 1년',
      '• 사지 보존 수술: 일부 가능, 높은 재발 위험',
      '• 완화 치료: 방사선 치료(통증 관리) + NSAID → 수명 3~5개월',
      '',
      '【통증 관리 (수술 전/완화)】',
      '가바펜틴 + NSAID 병용으로 통증을 크게 줄일 수 있어요.',
    ].join('\n')
  }

  // ── 멀미 / 이동 스트레스 ─────────────────────────────────────────
  if (/멀미|차\s*(멀미|타면\s*구토|타고\s*나서\s*구토)|이동\s*(구토|스트레스)|드라이브\s*(구토|멀미)/.test(text)) {
    return [
      '🚗 멀미·이동 스트레스 안내',
      '',
      '반려동물 멀미는 훈련과 약물로 크게 개선할 수 있어요.',
      '',
      '【멀미의 원인】',
      '• 전정계 과민: 귀의 균형 감각 과자극',
      '• 불안: 차에 대한 부정적 경험',
      '• 어릴 때 차 경험 부족',
      '',
      '【즉시 도움되는 것들】',
      '• 공복 이동: 최소 2시간 전부터 금식',
      '• 이동장: 창문이 안 보이게',
      '• 환기: 시원하게 유지',
      '• 짧은 이동부터 익숙하게 하기',
      '',
      '【훈련 (점진적 둔감화)】',
      '1. 차 앞에서 간식 (차 = 좋은 것 연결)',
      '2. 멈춰있는 차 안에서 간식',
      '3. 엔진 켜고 안에서 간식',
      '4. 아주 짧게(1분) 이동 → 좋은 보상',
      '→ 점차 이동 시간 늘리기',
      '',
      '【약물 도움 (수의사 처방)】',
      '• 세레니아(마레조산): 이동 전 1시간 복용 → 멀미 효과',
      '• 가바펜틴: 불안+멀미 동시 조절',
      '• 스코폴라민 패치: 사람 약이지만 소형견에 일부 사용',
      '',
      '얼마나 이동하면 구토하나요?',
    ].join('\n')
  }

  // ── 경련 발작 심층 ────────────────────────────────────────────────
  if (/발작\s*(심한|자주|군발|cluster|반복|3분\s*이상|5분\s*이상)|군발\s*발작|발작\s*(몇\s*분|지속시간|얼마나)/.test(text)) {
    return [
      '🧠 발작 심층 안내 (군발·지속 발작)',
      '',
      '발작이 자주 오거나 오래 지속된다면 치료 강화가 필요해요.',
      '',
      '【즉시 응급인 경우】',
      '🚨 발작이 5분 이상 지속 (간질 지속증)',
      '🚨 24시간 내 3회 이상 발작 (군발 발작)',
      '🚨 발작 사이에 의식이 회복되지 않음',
      '',
      '【집에서 발작 중 할 것】',
      '• 주변 가구·날카로운 물건 치우기',
      '• 시간 측정 시작',
      '• 만지지 않기 (물릴 수 있어요)',
      '• 어둡게, 조용하게',
      '• 발작 영상 찍기 (수의사 진단에 도움)',
      '',
      '【응급 약 (집에서 처방 받는 경우)】',
      '• 디아제팜(발륨) 직장 투여: 발작 2분 이상 지속 시',
      '• 미다졸람 비강 투여: 더 편리한 대안',
      '',
      '【항경련제 종류】',
      '• 페노바비탈(루미날): 가장 오래된 약, 효과적, 간 수치 모니터링',
      '• 칼륨브로마이드(KBr): 2차 선택 또는 병용',
      '• 레베티라세탐(케프라): 내약성 좋음, 부작용 적음',
      '',
      '발작 빈도가 얼마나 되고, 지속 시간은 어느 정도인가요?',
    ].join('\n')
  }

  // ── 비뇨기 감염 예방 / 요로계 건강 ──────────────────────────────
  if (/요로\s*(건강|예방|관리)|방광\s*(건강|예방|관리)|UTI\s*예방|크랜베리\s*(강아지|고양이|반려동물)/.test(text)) {
    return [
      '🫧 요로계 건강 관리 및 예방 안내',
      '',
      '요로 감염·결석의 예방은 수분 관리가 핵심이에요.',
      '',
      '【예방의 핵심: 수분 섭취 증가】',
      '• 물을 자주 마실수록 방광을 자주 씻어줘요',
      '• 분수형 급수기, 여러 곳에 물그릇 배치',
      '• 습식사료 비율 늘리기',
      '',
      '【배뇨 기회 늘리기】',
      '• 소변 오래 참으면 세균 번식',
      '• 개: 4~6시간마다 배뇨 기회 제공',
      '• 고양이: 청결한 화장실 유지',
      '',
      '【크랜베리 보조제】',
      '• 세균이 방광 벽에 붙는 것을 억제 (PACs 성분)',
      '• 일부 연구에서 재발성 UTI 감소 효과',
      '• 단, 이미 감염된 경우 항생제 대체 불가',
      '• 신장 결석 중 옥살산칼슘 있는 경우 주의',
      '',
      '【스트레스 관리 (고양이 FIC)】',
      '고양이 특발성 방광염은 스트레스가 주요 원인이에요.',
      '• 화장실 개수·위치·청결 최적화',
      '• 페로몬 디퓨저 (Feliway)',
      '• 일정한 루틴 유지',
      '',
      '방광염이 얼마나 자주 재발하나요?',
    ].join('\n')
  }

  // ── 노령 인지장애 심층 ────────────────────────────────────────────
  if (/인지\s*장애\s*(심한|악화|진행|증상|치료)|CDS\s*(심한|악화)|강아지\s*(치매\s*심한|치매\s*진행)|밤에\s*울음\s*(심한|매일)/.test(text)) {
    return [
      '🧠 노령 인지장애 심층 관리 안내',
      '',
      '인지장애(치매)는 완치가 없지만 진행을 늦추고 삶의 질을 유지할 수 있어요.',
      '',
      '【주요 증상 (DISHA 기준)】',
      '• D (Disorientation): 집 안에서 방향 잃음, 멍한 시선',
      '• I (Interaction): 가족 알아보지 못함, 반응 감소',
      '• S (Sleep): 낮에 자고 밤에 깨서 울거나 배회',
      '• H (House soiling): 알던 곳에서 대소변 실수',
      '• A (Activity): 반복 행동, 목적 없이 돌아다님',
      '',
      '【약물 치료】',
      '• 셀레질린(Anipryl): 도파민 분해 억제, 인지 개선',
      '• 프로펜토필린: 뇌 혈류 개선',
      '• 멜라토닌: 수면 주기 개선 (야간 울음에 도움)',
      '',
      '【환경 조절】',
      '• 밤에 낮은 조도의 등 켜두기 (방향감각 유지)',
      '• 가구 배치 바꾸지 않기',
      '• 루틴 유지: 같은 시간에 밥, 산책, 수면',
      '• 야간 울음: 별도 공간 제공, TV·라디오 소리',
      '',
      '【영양 보충】',
      '• DHA(오메가-3): 신경 보호',
      '• 산화 방지 음식 (블루베리, 당근)',
      '• 인지장애 전용 처방식: Hill\'s b/d',
    ].join('\n')
  }

  // ── 혈청 단백질 / 저알부민 원인별 ──────────────────────────────
  if (/알부민\s*(2\.[0-9]|1\.[0-9]|[0-9]\.[0-9])\s*(g\/dL|이하|미만)|저알부민\s*(원인|왜|어디서)|globulin\s*(높|낮)/.test(text)) {
    return [
      '🔬 저알부민혈증 원인별 심층 안내',
      '',
      '알부민이 낮은 이유에 따라 접근이 달라요.',
      '',
      '【알부민 정상 범위】',
      '• 정상: 2.5~3.5 g/dL',
      '• 2.0 이하: 부종·복수 위험',
      '• 1.5 이하: 심각한 저알부민',
      '',
      '【원인 3가지 구분】',
      '',
      '1️⃣ 간에서 알부민 합성 부족 (간부전)',
      '   - 다른 간 수치(ALT, ALP) 상승 동반',
      '   - 담즙산 검사로 간 기능 평가',
      '',
      '2️⃣ 신장으로 알부민 손실 (단백뇨/사구체신염)',
      '   - 소변에서 단백질 검출',
      '   - UPC 비율로 확인',
      '',
      '3️⃣ 장에서 알부민 손실 (PLE — 단백질누설장증)',
      '   - 소화기 증상(설사, 체중감소) 동반',
      '   - 소장 내시경·조직검사로 진단',
      '',
      '【알부민 낮을 때 부종이 생기는 이유】',
      '혈관 내 삼투압이 낮아져 액체가 조직·복강으로 빠져나가요.',
      '',
      '【치료 방향】',
      '• 원인 치료가 가장 중요',
      '• 즉각 교정: 신선냉동혈장(FFP), 콜로이드 수액',
      '• 영양: 고단백 식이 (PLE 제외)',
    ].join('\n')
  }

  // ── 구강 종양 / 편평상피암 ───────────────────────────────────────
  if (/구강\s*(종양|암|편평|암종)|입\s*(안\s*(종양|암|혹))|편평상피\s*(암|암종|carcinoma)|구강\s*(흑색종|melanoma)|혀\s*(종양|암)/.test(text)) {
    return [
      '🦷 구강 종양 안내',
      '',
      '구강 종양은 조기 발견이 치료 성공률을 크게 높여요.',
      '',
      '【고양이 구강 종양 주의】',
      '• 편평상피암(SCC): 고양이 구강 종양 중 가장 흔함',
      '• 예후 불량 (1년 생존율 10% 미만)',
      '• 매우 빠르게 침습적으로 성장',
      '',
      '【개 구강 종양 유형】',
      '• 악성흑색종(Melanoma): 전이 빠름 → 진단 즉시 전이 확인',
      '• 편평상피암: 침습적이나 흑색종보다 느림',
      '• 섬유육종: 주변 조직 침습',
      '',
      '【증상 (조기 발견 포인트)】',
      '• 한쪽으로 음식 씹음',
      '• 과도한 침 또는 구취 갑자기 심해짐',
      '• 출혈, 얼굴 부종',
      '• 이빨이 느슨해짐',
      '',
      '【진단 및 병기 검사】',
      '• 조직검사: 확진',
      '• 흉부 X-ray: 폐 전이',
      '• 경부 림프절 초음파·FNA: 전이 여부',
      '• CT: 뼈 침습 범위 확인',
      '',
      '【치료】',
      '• 수술 (최대한 넓게 절제)',
      '• 방사선 치료 보조',
      '• 흑색종 백신 (USDA 승인, 국내 제한적)',
    ].join('\n')
  }

  // ── 위장관 폐색 / 장 폐색 ────────────────────────────────────────
  if (/장\s*(폐색|막힘|폐쇄)|위장관\s*(폐색|막힘)|이물질\s*(장\s*막힘|장\s*폐색|수술)|intussusception|장중첩|끈\s*(삼켰|먹었|걸렸)/.test(text)) {
    return [
      '🚨 위장관 폐색 응급 안내',
      '',
      '위장관 폐색은 즉각적인 수술이 필요한 응급 상황이에요.',
      '',
      '【응급 신호】',
      '🚨 구토가 계속되는데 음식이 아닌 노란/초록 담즙만 나옴',
      '🚨 이물질 삼킨 후 24시간 이상 대변 없음',
      '🚨 복부 팽만 + 통증 + 무기력',
      '🚨 끈·실이 입 또는 항문에 걸려있음',
      '',
      '【끈·실 삼켰을 때 특별 주의】',
      '• 절대 당기지 마세요 (장이 감여 절단 위험)',
      '• 항문에 나와있어도 당기지 마세요',
      '• 즉시 응급 병원',
      '',
      '【진단】',
      '• X-ray: 가스 패턴, 이물질 위치',
      '• 초음파: 폐색 부위, 운동성',
      '• 조영검사: 폐색 여부 확인',
      '',
      '【장중첩(Intussusception)】',
      '• 장 일부가 안으로 접혀 들어가는 상태',
      '• 주로 파보 등 심한 설사 후 발생',
      '• 소시지 모양의 복부 덩어리 촉진',
      '• 즉각 수술 필요',
    ].join('\n')
  }

  // ── 신경독 / 독소 노출 ───────────────────────────────────────────
  if (/독소\s*(노출|먹었|섭취)|쥐약\s*(먹었|노출)|살충제\s*(노출|먹었|중독)|에탄올\s*중독|납\s*중독|독극물/.test(text)) {
    return [
      '☠️ 독소 노출 응급 안내',
      '',
      '독소 노출이 의심되면 즉시 행동해야 해요.',
      '',
      '【즉시 할 것】',
      '1. 동물을 독소에서 분리',
      '2. 노출된 피부·털: 물로 씻어내기',
      '3. 즉시 응급 동물병원 연락',
      '4. 제품 이름·성분 정보 가져가기',
      '5. 증상이 없어도 즉시 방문 (독소 작용 지연 가능)',
      '',
      '【쥐약 (로덴티사이드) — 특히 위험】',
      '• 항응고제 계열: 출혈이 1~5일 후 발생 (즉시 치료해야)',
      '• 비타민K1 치료 (수주~수개월 필요)',
      '• 증상 없어도 섭취 확인되면 즉시 처치',
      '',
      '【살충제 (유기인산염·카바메이트)】',
      '• 침 과다, 눈물, 발한, 근육 떨림, 발작',
      '• 아트로핀 주사 응급 처치',
      '',
      '【집에서 구토 유도 — 사전 확인 필수】',
      '• 독소 섭취 30분 내, 의식 명료한 경우만',
      '• 수의사 또는 독성 센터에 먼저 문의 (일부 독소는 구토 금지)',
      '• 3% 과산화수소 1mL/kg (최대 45mL) — 개만 가능, 고양이 금지',
    ].join('\n')
  }

  // ── 임상시험 / 최신 치료 ─────────────────────────────────────────
  if (/임상\s*시험|임상\s*연구|최신\s*치료|새로운\s*치료|CAR-T|면역\s*항암|면역\s*체크포인트|단클론\s*항체/.test(text)) {
    return [
      '🔬 최신 치료법 안내',
      '',
      '반려동물 종양학은 빠르게 발전하고 있어요.',
      '',
      '【최신 트렌드】',
      '● 면역 항암제 (Immunotherapy):',
      '  - 사람 PD-1 차단제와 유사한 개 버전 개발 중',
      '  - 일부 대학 병원에서 임상 참여 가능',
      '',
      '● 단클론 항체 (Monoclonal antibody):',
      '  - 개 흑색종 백신: USDA 승인, 일부 병원 시행',
      '  - Cytopoint (아토피): 이미 상용화',
      '',
      '● 팔리파닙 (Palladia):',
      '  - 반려동물 전용 분자 표적 항암제',
      '  - 비만세포종, 일부 다른 종양에 효과',
      '',
      '【임상시험 참여 방법】',
      '• 국내 수의과대학 부속 동물병원 (서울대, 건국대, 충남대 등)',
      '• 미국 Morris Animal Foundation, Veterinary Cancer Society',
      '• 비용이 무료이거나 일부 지원되는 경우도 있어요',
      '',
      '【현실적 기대】',
      '"완치보다 생존 기간 연장, 삶의 질 유지가 현실적 목표예요."',
      '새로운 치료법이 효과 있어도 모든 개체에게 동일하지 않아요.',
    ].join('\n')
  }

  // ── 기관지 확장증 / 만성 폐질환 ────────────────────────────────
  if (/기관지\s*(확장|확장증)|만성\s*(폐|기관지)\s*질환|기침\s*(혈액|피|혈담)|만성\s*폐렴|기관지\s*(염|천식)/.test(text)) {
    return [
      '🫁 만성 폐·기관지 질환 안내',
      '',
      '만성 기관지 질환은 완치보다 관리가 목표예요.',
      '',
      '【기관지 확장증 (Bronchiectasis)】',
      '• 기관지가 영구적으로 넓어진 상태',
      '• 원인: 반복 감염, IBD 관련, 선천성',
      '• 증상: 만성 습한 기침, 가래, 가끔 혈담',
      '• 치료: 항생제, 기관지 확장제, 기도 청결술',
      '',
      '【고양이 기관지 천식】',
      '• 증상: 반복적인 기침 발작, 복부 호흡',
      '• 유발: 먼지, 향수, 담배 연기, 꽃가루',
      '• 치료: 흡입 스테로이드 (AeroKat 마스크), 기관지 확장제',
      '• 응급 시: 덱사메타손 주사',
      '',
      '【집에서 관리】',
      '• 공기청정기: 알레르겐 감소',
      '• 가습기: 건조한 공기 완화',
      '• 향수·방향제·담배 연기 완전 차단',
      '• 스트레스 최소화',
      '',
      '【즉시 병원】',
      '🚨 기침 중 입이 벌어지거나 파래짐',
      '🚨 혈담이 많이 나옴',
    ].join('\n')
  }

  // ── 발바닥 문제 ───────────────────────────────────────────────────
  if (/발바닥\s*(갈라짐|건조|딱딱|화상|궤양|상처|핥음|빨간|염증)|발\s*(사이\s*(빨간|핥음|빠지|염증)|가락)|발가락\s*(사이|염증|빨간)/.test(text)) {
    return [
      '🐾 발바닥 문제 안내',
      '',
      '발바닥 문제는 종류에 따라 다양한 원인이 있어요.',
      '',
      '【발바닥 갈라짐·건조】',
      '• 원인: 건조한 환경, 영양 부족, 갑상선기능저하증',
      '• 관리: 발바닥 전용 보습제(뮤스텔라, 베트릭스)',
      '• 산책 후 발 씻고 건조 후 보습',
      '',
      '【발가락 사이 빨간색·핥음】',
      '• 원인: 알레르기(식이 또는 환경), 효모 감염',
      '• 증상: 발가락 사이 갈색 얼룩(침 착색), 빨간 피부',
      '• 치료: 항진균 샴푸, 알레르기 원인 제거',
      '• 귀 감염이 동시에 있으면 알레르기 강력 의심',
      '',
      '【발바닥 화상 (뜨거운 아스팔트)】',
      '• 발을 들고 걷거나 걷기 거부',
      '• 발바닥이 빨갛거나 물집',
      '• 서늘한 아스팔트 확인: 5초 손등 테스트',
      '• 여름 산책은 이른 아침·저녁에',
      '',
      '【발바닥 궤양 (노령·신경장애)】',
      '• 누워 있는 노령 동물에서 발생',
      '• 욕창 예방: 2시간마다 체위 변경, 쿠션',
      '',
      '발바닥에 어떤 증상이 있나요?',
    ].join('\n')
  }

  // ── 개 피부 농피증 심층 / 재발성 ─────────────────────────────────
  if (/농피증\s*(재발|만성|심한|반복|치료)|피부\s*(세균\s*(감염|농피증)|농양|깊은)/.test(text)) {
    return [
      '🔬 피부 농피증 심층 안내',
      '',
      '재발성 농피증은 근본 원인을 찾는 것이 핵심이에요.',
      '',
      '【babungee의 핵심 조언】',
      '"대부분의 감염 원인균은 환경에 늘 있어요."',
      '"면역이나 환경적 요인이 변할 때 평소에 없던 피부 질환을 유발하게 돼요."',
      '"항생제만으로 완치가 안 되는 이유는 근본 원인(알레르기·호르몬)이 남아있기 때문이에요."',
      '',
      '【재발성 농피증의 흔한 근본 원인】',
      '• 알레르기 (환경성 또는 음식): 가장 흔함',
      '• 갑상선기능저하증: 면역 저하',
      '• 쿠싱증후군: 면역 억제',
      '• 스테로이드 장기 복용',
      '• 해부학적 이상 (피부 주름 많은 품종)',
      '',
      '【치료 접근】',
      '1. 배양 검사로 균 확인 → 맞는 항생제 선택',
      '2. 최소 4~6주 항생제 (표면 치유 후 2주 더)',
      '3. 근본 원인 치료 (알레르기 관리, 호르몬 교정)',
      '4. 항균 샴푸: 클로르헥시딘 2~4% 주 2회',
      '',
      '배양 검사를 받아보셨나요?',
    ].join('\n')
  }

  // ── 호르몬 검사 / 갑상선·부신 패널 ─────────────────────────────
  if (/호르몬\s*(검사|패널|검사\s*결과)|내분비\s*(검사|패널|이상)|쿠싱\s*검사|ACTH\s*자극\s*검사|덱사메타손\s*억압\s*검사|T4\s*검사/.test(text)) {
    return [
      '🔬 내분비·호르몬 검사 안내',
      '',
      '내분비 질환은 특정 검사로 진단해요.',
      '',
      '【갑상선 검사 (개)】',
      '• Total T4: 기본 선별 검사',
      '  - 낮으면 갑상선기능저하 의심',
      '  - 비갑상선 질환에서도 낮게 나올 수 있어요 (false low)',
      '• T4 + TSH: 확진에 가장 좋은 조합',
      '• Free T4: 비갑상선 질환 감별에 유용',
      '',
      '【쿠싱 검사】',
      '• LDDST (저용량 덱사메타손 억압): 선별 검사',
      '• ACTH 자극 검사: 치료 모니터링에 사용',
      '  - 투약 4시간 후 코티솔 1~5 μg/dL 목표',
      '• HDDS: PDH vs ADH 감별',
      '• 내인성 ACTH: 혈액 냉동 보관 필수',
      '',
      '【전당뇨·당뇨 관련】',
      '• 공복 혈당: 개 70~110, 고양이 70~150 mg/dL',
      '• 프럭토사민: 2~3주 평균 혈당',
      '• HbA1c 유사 역할 (개)',
      '',
      '【인슐린 검사】',
      '• 인슐린종(췌장 인슐린 분비 종양) 의심 시: 저혈당 중 혈당+인슐린 동시 측정',
      '',
      '어떤 증상으로 내분비 검사를 고려하고 계신가요?',
    ].join('\n')
  }

  // ── 섭식 장애 / 이식증 ───────────────────────────────────────────
  if (/이식증|돌\s*(먹음|씹음|삼킴)|흙\s*(먹음|삼킴)|변\s*(먹음|식분증)|식분증|풀\s*먹음|이물질\s*(씹음|먹음)/.test(text)) {
    return [
      '🌿 이식증(이상한 것 먹기) 안내',
      '',
      '강아지·고양이가 비식품을 먹는 행동은 다양한 원인이 있어요.',
      '',
      '【풀·잔디 먹기 (가장 흔함)】',
      '• 대부분 정상 행동 (소화 보조, 본능)',
      '• 구토가 뒤따르면 위장 불편감 해소 목적',
      '• 살충제 처리된 풀은 위험 → 화분 풀 제공 가능',
      '',
      '【변 먹기 (식분증)】',
      '• 어미 개가 새끼 배변 먹는 것은 정상',
      '• 어른 개의 식분증: 영양 결핍, 스트레스, 관심 끌기',
      '• 대응: 즉시 배변 치우기, 파인애플 소량 급여 (쓴맛 억제)',
      '',
      '【돌·흙·이물질 먹기 (진짜 이식증)】',
      '• 원인: 빈혈, 미네랄 결핍, 강박 장애, 심한 공복감',
      '• 장 폐색 위험 → 내시경·수술 필요 가능',
      '• 수의사 상담 + 혈액검사 권장',
      '',
      '【대응법】',
      '• 산책 중 먹지 못하게 주의',
      '• 입마개 훈련 고려',
      '• 급여량 충분히 (공복감 해소)',
      '• 환경 자극 풍부하게 (지루함 해소)',
    ].join('\n')
  }

  // ── 고양이 갑작스러운 마비 / 대동맥 색전증 ─────────────────────
  if (/고양이\s*(뒷다리\s*(갑자기|갑작스럽게)\s*(못\s*움직|마비|차가워|안\s*움직)|대동맥\s*색전|ATE\b)|뒷다리\s*(차갑|차가워|보라색|색|마비)\s*(고양이)/.test(text)) {
    return [
      '🚨 고양이 대동맥 색전증(ATE) 응급 안내',
      '',
      '고양이 뒷다리가 갑자기 못 움직이면 즉시 응급이에요.',
      '',
      '🚨 즉시 응급 병원으로 이동하세요.',
      '',
      '【대동맥 색전증이란?】',
      '심장(주로 HCM)에서 혈전이 생겨 대동맥을 막아',
      '뒷다리로 혈류가 차단되는 응급 상황이에요.',
      '',
      '【증상 (갑자기 발생)】',
      '• 뒷다리 1개 또는 2개를 못 씀',
      '• 뒷다리 발바닥이 차갑고 발톱 눌러도 흐르지 않음',
      '• 극심한 통증 (울거나 숨가뻐함)',
      '• 다리 피부가 파랗거나 보라색',
      '',
      '【이동 중 처치】',
      '• 따뜻하게 감싸기 (저체온 방지)',
      '• 다리를 억지로 움직이지 않기',
      '• 산소 상황이 되면 제공',
      '',
      '【병원 치료】',
      '• 통증 관리 (즉각적)',
      '• 혈전 용해제 (위험 있음 — 의사 판단)',
      '• 항혈전제: 클로피도그렐, 헤파린',
      '• HCM 관리 병행',
      '',
      '생존율은 낮지만 혈류가 회복되면 걸을 수 있어요.',
    ].join('\n')
  }

  // ── 수의사에게 잘 물어보는 방법 ─────────────────────────────────
  if (/수의사\s*(에게|한테)\s*(어떻게\s*물어|뭘\s*물어|잘\s*물어|질문)|병원에서\s*(어떻게|뭘\s*물어)|수의사\s*와\s*(대화|상담|소통)/.test(text)) {
    return [
      '💬 수의사에게 잘 물어보는 방법',
      '',
      '명확한 질문이 더 나은 의료 서비스를 받게 해줘요.',
      '',
      '【babungee의 말】',
      '"공부 많이 하셔서 질문을 정확하게 잘 할 수 있게 되면 서비스 받는 데 도움이 됩니다."',
      '',
      '【준비해갈 정보】',
      '• 증상이 시작된 날짜',
      '• 증상의 변화 (좋아짐/나빠짐/동일)',
      '• 현재 복용 중인 모든 약·보충제 목록',
      '• 마지막 검사 날짜와 결과',
      '• 먹는 사료 브랜드·양',
      '',
      '【꼭 물어볼 것들】',
      '• "이 증상의 원인으로 가장 가능성 높은 것은 무엇인가요?"',
      '• "지금 당장 필요한 검사와 나중에 해도 되는 것은 무엇인가요?"',
      '• "이 약은 무엇이고, 왜 처방하시나요?"',
      '• "집에서 어떤 것을 보고 연락해야 하나요?"',
      '• "다음 방문은 언제가 적당한가요?"',
      '',
      '【불만족스러울 때】',
      '• 궁금한 점은 그 자리에서 물어보세요',
      '• 설명이 이해되지 않으면 다시 설명을 요청하세요',
      '• 의심스러우면 2차 소견(second opinion)을 받아도 괜찮아요',
    ].join('\n')
  }

  // ── 식이 섬유 / 장 건강 ──────────────────────────────────────────
  if (/식이\s*(섬유|파이버)|프리바이오틱스|장\s*(건강|마이크로바이옴|세균총)|변비\s*(예방|개선)|장\s*(연동\s*운동|움직임)/.test(text)) {
    return [
      '🌿 장 건강 및 식이 섬유 안내',
      '',
      '장 건강은 전신 건강에 큰 영향을 미쳐요.',
      '',
      '【식이 섬유의 역할】',
      '• 수용성 섬유: 대변 수분 조절, 유익균 먹이',
      '• 불용성 섬유: 장 운동 촉진, 변비 예방',
      '',
      '【좋은 식이 섬유 급여원】',
      '• 익힌 고구마: 수용성+불용성 섬유 풍부',
      '• 익힌 호박: 변비·설사 모두에 도움',
      '• 플실리엄 허스크: 물과 함께 소량 (고양이에도 가능)',
      '• 칸(CAN) 섬유 보충제: 수의사 처방',
      '',
      '【과한 섬유가 나쁜 경우】',
      '• 신장병: 고섬유 = 인 과다 가능',
      '• IBD 특정 유형: 섬유 악화 가능',
      '• 체중이 많이 빠진 동물: 열량이 더 중요',
      '',
      '【프로바이오틱스 (유산균)】',
      '• 장 세균총 균형 유지',
      '• 항생제 복용 중: 시간 간격 두고 복용',
      '• 동물 전용: 포티플로라(Purina Pro Plan FortiFlora)',
      '• 사람 유산균: 종류에 따라 효과 미지수',
      '',
      '변비가 주 문제인가요, 설사가 주 문제인가요?',
    ].join('\n')
  }

  // ── 담낭·담도 심층 ────────────────────────────────────────────────
  if (/담낭\s*(슬러지|결석|제거|수술|담낭염|파열|점액류|폐색)|담도\s*(폐색|결석|암|종양)|황달\s*(담낭|담도)|담즙\s*(막힘|폐색)/.test(text)) {
    return [
      '🫁 담낭·담도 질환 심층 안내',
      '',
      '담낭 문제는 증상과 중증도가 다양해요.',
      '',
      '【담낭 슬러지 vs 결석】',
      '• 슬러지: 점액성 물질 → 관찰하면서 관리',
      '• 결석: 담석 → 크기·위치에 따라 수술 여부 결정',
      '',
      '【담낭 점액류 (Mucocele)】',
      '• 담낭 내 점액이 과도하게 축적',
      '• 방치 시 담낭 파열 → 응급 복막염',
      '• 예방적 담낭 절제 권장 (파열 위험 있을 때)',
      '',
      '【담낭 파열 응급 신호】',
      '🚨 갑작스러운 심한 복통',
      '🚨 구토 + 황달',
      '🚨 무기력, 허탈',
      '',
      '【담도 폐색】',
      '• 원인: 담석, 종양, 염증',
      '• 황달 + 진한 갈색 소변 + 창백한 대변',
      '• 즉각 처치: 수액, 항생제, 수술 고려',
      '',
      '【식이 관리】',
      '• 저지방 식이: 담낭 수축 자극 최소화',
      '• UDCA (우르소데옥시콜산): 담즙 흐름 개선',
      '',
      '초음파에서 어떤 소견이 나왔나요?',
    ].join('\n')
  }

  // ── 신장 이식 / 투석 (고양이 CKD 말기 옵션) ────────────────────
  if (/신장\s*(이식|투석)|혈액\s*투석|복막\s*투석|투석\s*(가능|여부|고려)/.test(text)) {
    return [
      '🏥 신장 이식·투석 안내',
      '',
      '반려동물의 신장 이식·투석은 국내에서 매우 제한적이에요.',
      '',
      '【혈액 투석 (Hemodialysis)】',
      '• 국내 일부 대학병원에서 가능',
      '• 급성 신부전 또는 독소 제거에 효과적',
      '• 만성 신부전 유지 투석은 비용·접근성 문제로 현실적 어려움',
      '',
      '【복막 투석 (Peritoneal Dialysis)】',
      '• 복강에 카테터 삽입해 투석액 교환',
      '• 집에서 가능하지만 교육 필요',
      '• 감염 위험이 있어 주의 필요',
      '',
      '【신장 이식 (고양이)】',
      '• 미국 일부 대학병원에서 성공 사례',
      '• 국내에서는 거의 불가능',
      '• 공여 고양이 건강 보장 필수 → 윤리적 이슈',
      '• 이식 후 평생 면역억제제 필요',
      '',
      '【현실적 대안】',
      '집에서 피하수액 + 의학적 관리 + 완화치료가 현재 가장 현실적인 방법이에요.',
      '말기 신부전이지만 편안한 삶의 질을 유지하는 것에 집중해요.',
      '',
      '현재 크레아티닌 수치와 IRIS 단계가 어떻게 되나요?',
    ].join('\n')
  }

  // ── 심낭 삼출 / 심장 주변 물 ─────────────────────────────────────
  if (/심낭\s*(삼출|액|물|제거|천자)|심장\s*주변\s*(물|삼출)|pericardial\s*(effusion|tap)|cardiac\s*tamponade/.test(text)) {
    return [
      '❤️ 심낭 삼출 안내',
      '',
      '심장 주변에 물이 차는 심낭 삼출은 응급이 될 수 있어요.',
      '',
      '【심낭 삼출이란?】',
      '심장을 둘러싼 심낭 공간에 액체가 고여 심장 압박이 생기는 상태예요.',
      '',
      '【심각성 (cardiac tamponade)】',
      '🚨 심한 경우 심장이 충분히 펌프질 못 해 쇼크',
      '• 갑작스러운 허탈, 창백한 잇몸, 호흡 곤란',
      '',
      '【원인 (개에서 흔한 것)】',
      '• 혈관육종(HSA): 가장 흔함 — 심장 자체에 종양',
      '• 양성 심낭 삼출 (특발성): 대형견',
      '• 중피종, 림프종',
      '',
      '【진단】',
      '• 심초음파: 심낭 내 액체 및 우심실 압박 확인',
      '• 심낭 천자 액 분석: 악성 세포 여부',
      '',
      '【치료】',
      '• 심낭 천자(Pericardiocentesis): 즉각 증상 완화',
      '• 재발성 삼출: 심낭절개술(Pericardiectomy) 고려',
      '• HSA가 원인이면: 항암 치료 병행 고려',
      '',
      '심초음파를 받아보셨나요?',
    ].join('\n')
  }

  // ── 고칼슘혈증 ────────────────────────────────────────────────────
  if (/고칼슘혈증|칼슘\s*(높|상승|수치\s*이상)|hypercalcemia|칼슘\s*(수치|이상)/.test(text)) {
    return [
      '🔬 고칼슘혈증 안내',
      '',
      '혈중 칼슘이 높다면 원인 파악이 중요해요.',
      '',
      '【정상 칼슘 범위】',
      '• 개: 9.0~11.5 mg/dL',
      '• 고양이: 8.0~11.0 mg/dL',
      '',
      '【주요 원인 (CHAMPS 기억법)】',
      '• C (Cancer/종양): 가장 흔함 — 림프종, 부갑상선 종양',
      '• H (Hyperpara): 부갑상선기능항진증',
      '• A (Addison): 애디슨병',
      '• M (Milk-alkali / 과다 섭취): 드물게',
      '• P (Poisoning): 비타민D 독성 (쥐약 일부)',
      '• S (Sarcoidosis/Steroid): 반려동물에서 드물게',
      '',
      '【증상】',
      '• 무기력, 식욕부진',
      '• 다음다뇨 (칼슘이 신장 손상)',
      '• 변비, 구토',
      '• 심한 경우: 발작, 신장 결석',
      '',
      '【진단 방향】',
      '• 이온화 칼슘 측정',
      '• PTH (부갑상선 호르몬)',
      '• 림프절 검사, 흉부·복부 영상',
      '',
      '원인을 찾아 치료하는 것이 핵심이에요.',
    ].join('\n')
  }

  // ── 고양이 행동 수직 공간 필요성 ────────────────────────────────
  if (/고양이\s*(수직\s*공간|선반|캣타워|캣워크|놀이|환경\s*풍부화|지루함|스트레칭)|실내\s*고양이\s*(운동|놀이|활동)/.test(text)) {
    return [
      '🐱 고양이 실내 환경 풍부화 안내',
      '',
      '실내 고양이는 충분한 자극이 없으면 스트레스와 비만이 생겨요.',
      '',
      '【수직 공간 제공 (가장 중요)】',
      '• 캣타워, 벽 선반: 높은 곳에 오르는 본능 충족',
      '• 창가 자리: 밖 구경할 수 있는 선반',
      '• 은신처: 닫힌 공간 (박스, 터널)',
      '',
      '【놀이 (하루 2~3회, 5~10분)】',
      '• 낚싯대 장난감: 사냥 본능 자극 (가장 효과적)',
      '• 레이저 포인터: 반드시 마지막에 실제 간식으로 마무리',
      '• 퍼즐 피더: 사료를 문제 풀며 먹게',
      '• 사냥-잡기-먹기 순서로 놀이 마무리',
      '',
      '【영역 표시 기회】',
      '• 긁기 기둥: 수직형과 수평형 모두',
      '• 기둥 위치: 고양이가 자주 다니는 동선에',
      '',
      '【다묘 가정 환경】',
      '• 고양이 수 + 1 이상의 자원 (화장실, 밥그릇, 숨을 곳)',
      '• 서로 피할 수 있는 동선 확보',
      '',
      '고양이가 몇 살이고, 현재 어떤 생활 환경인가요?',
    ].join('\n')
  }

  // ── 개 이별 애도 / 반려동물 사별 ────────────────────────────────
  if (/무지개\s*다리|하늘\s*(나라|로\s*갔)|떠났|세상\s*(을\s*떠나|을\s*떴)|안락사\s*(했|됐|후)|사별|슬픔|그리움|보내주었|보내고/.test(text)) {
    return [
      '🌈 반려동물을 보내고 나서',
      '',
      '정말 힘드시겠어요. 깊은 위로를 전드려요.',
      '',
      '반려동물과의 이별은 가족을 잃는 것만큼 슬픈 일이에요.',
      '그 슬픔은 당연한 것이에요. 억지로 빨리 이겨내려 하지 않아도 돼요.',
      '',
      '【슬픔의 단계】',
      '부정 → 분노 → 협상 → 우울 → 수용',
      '이 모든 감정이 자연스러워요. 순서도 달라도 괜찮아요.',
      '',
      '【지금 할 수 있는 것들】',
      '• 추억을 기록하거나 사진을 모아보기',
      '• 일상을 유지하면서 조금씩 회복하기',
      '• 슬픔을 이야기할 수 있는 사람 찾기',
      '• 동물을 키우는 커뮤니티에서 이야기 나누기',
      '',
      '【다음 반려동물을 맞이하는 것에 대해】',
      '준비가 됐을 때, 자신의 페이스에 맞게 결정하면 돼요.',
      '이 반려동물을 잊어서가 아니라, 더 많은 사랑을 줄 수 있기 때문에 괜찮아요.',
      '',
      '마음이 너무 힘들면 혼자 있지 말고, 가까운 사람에게 연락해보세요.',
    ].join('\n')
  }

  // ── 약 바꾸기 / 대체 약 / 약값 절감 ────────────────────────────
  if (/약\s*(바꿀|바꿔도|변경|대체|더\s*저렴한|제네릭|복제약)|약값\s*(비싼|절감|줄이기)|약\s*(동일\s*성분|비슷한)/.test(text)) {
    return [
      '💊 약 변경·대체약 안내',
      '',
      '약을 바꾸거나 줄이고 싶다면 수의사와 먼저 상의하세요.',
      '',
      '【제네릭(복제약) 사용 가능한 경우】',
      '• 사람 약의 제네릭을 동물에 사용하는 경우: 수의사 확인 필수',
      '• 동일 성분이라도 부형제·흡수율이 다를 수 있어요',
      '• 갑자기 바꾸면 혈중 농도 변화 가능',
      '',
      '【약값 줄이는 방법】',
      '• 대형 포장(90일치) 구매 시 단가 저렴',
      '• 사람 약국에서 구입 가능한 성분: 수의사에게 처방전 요청',
      '• 온라인 수의 약국: 처방 있으면 저렴하게 구입 가능',
      '',
      '【절대 임의 변경하면 안 되는 약】',
      '• 항경련제 (페노바비탈, 레베티라세탐)',
      '• 인슐린',
      '• 면역억제제',
      '• 갑상선·쿠싱 약',
      '',
      '【가격 대비 효과 고려】',
      '• 고가 신약 vs 구형 약: 효과 차이 없는 경우도 많아요',
      '• "좋은 약"보다 "맞는 약"이 더 중요해요',
      '',
      '어떤 약을 변경하고 싶으신가요?',
    ].join('\n')
  }

  // ── 식이성 / 처방식 전반 가이드 ─────────────────────────────────
  if (/처방\s*(식|사료|음식)\s*(종류|선택|추천|뭐가|어떤)|신장\s*처방식|심장\s*처방식|간\s*처방식|소화기\s*처방식|힐스|로얄캐닌|퓨리나 처방/.test(text)) {
    return [
      '🍽️ 처방식 선택 가이드',
      '',
      '질환에 맞는 처방식은 치료의 일부예요.',
      '',
      '【처방식이 필요한 주요 질환】',
      '● 신장병 (CKD): 저인·저단백·저나트륨',
      '   힐스 k/d, 로얄캐닌 Renal, 퓨리나 NF',
      '',
      '● 심장병: 저나트륨',
      '   힐스 h/d, 로얄캐닌 Cardiac',
      '',
      '● 간 질환: 저단백·저구리 (달마시안·웨스트하이랜드)',
      '   힐스 l/d, 로얄캐닌 Hepatic',
      '',
      '● 소화기 (IBD·만성설사): 고소화성·저지방',
      '   힐스 i/d, 로얄캐닌 GI, 퓨리나 EN',
      '',
      '● 췌장염: 저지방',
      '   힐스 i/d Low Fat, 로얄캐닌 Gastrointestinal Low Fat',
      '',
      '● 방광 결석(스트루바이트): 산성화 소변 유도',
      '   힐스 s/d (단기), c/d (유지)',
      '',
      '【처방식 효과 원리】',
      '의약품이 아니어서 복제 처방식은 의미가 없어요.',
      '성분 비율이 정밀하게 조정된 것이 효과의 핵심이에요.',
      '',
      '현재 어떤 질환으로 처방식을 찾고 계신가요?',
    ].join('\n')
  }

  // ── 망막 변성 / PRA (진행성 망막위축) ───────────────────────────
  if (/망막\s*(변성|위축|이상|검사)|PRA|진행성\s*망막\s*위축|시력\s*(서서히|점점)\s*(잃|없어|악화)|야맹증|어두운\s*(곳|데서)\s*(못\s*봄|잘\s*못봐|부딪|벽에)/.test(text)) {
    return [
      '👁️ 진행성 망막위축(PRA) 안내',
      '',
      '서서히 시력을 잃는 유전성 안과 질환이에요.',
      '',
      '【PRA란?】',
      '망막의 광수용체(rod/cone 세포)가 점진적으로 퇴화하는 유전 질환으로,',
      '어두운 곳에서 먼저 시력 저하(야맹증)가 오고 결국 완전 실명해요.',
      '',
      '【잘 걸리는 품종】',
      '• 개: 래브라도, 골든리트리버, 코커스파니엘, 아이리시 세터, 미니어처 푸들',
      '• 고양이: 아비시니안, 페르시안, 뱅갈',
      '',
      '【진행 순서】',
      '1️⃣ 야맹증 (어둠 속에서 부딪힘, 산책 시 주저함)',
      '2️⃣ 낮에도 시력 저하 (익숙한 집에서도 물건에 부딪힘)',
      '3️⃣ 완전 실명',
      '',
      '【진단】',
      '• 안과 전문의 검안경 검사',
      '• ERG (망막전도 검사): 망막 기능 평가',
      '• DNA 유전자 검사: 보인자 여부 확인 가능',
      '',
      '【치료】',
      '안타깝게도 현재까지 PRA를 치료하거나 늦추는 방법이 없어요.',
      '',
      '【실명 후에도 잘 살 수 있어요】',
      '• 집 구조 바꾸지 않기 (익숙한 환경 유지)',
      '• 후각·청각으로 소통',
      '• 산책 시 냄새 탐색 충분히 허용',
      '',
      '현재 어떤 증상이 나타나고 있나요?',
    ].join('\n')
  }

  // ── 고양이 hyperaldosteronism / 고알도스테론혈증 ──────────────
  if (/알도스테론|고알도\s*스테론|hyperaldosteronism|부신\s*(종양|고양이)|고양이\s*고혈압\s*(원인|왜)|저칼륨혈증\s*고양이/.test(text)) {
    return [
      '🔬 고양이 고알도스테론혈증 안내',
      '',
      '노령 고양이에서 고혈압·저칼륨증의 숨겨진 원인이에요.',
      '',
      '【알도스테론이란?】',
      '부신에서 분비되는 호르몬으로 나트륨 보존·칼륨 배설을 담당해요.',
      '과잉 분비되면: 고혈압 + 저칼륨혈증',
      '',
      '【증상】',
      '• 근육 약화 (칼륨 저하로 인한 다리 힘 빠짐)',
      '• 목이 아래로 처짐 (경부 복와 자세 — 저칼륨성 근병증)',
      '• 갑자기 시력 잃음 (고혈압으로 인한 망막 박리)',
      '• 심장 부정맥 위험',
      '',
      '【진단】',
      '• 혈중 칼륨 저하 확인',
      '• 혈압 측정: 수축기 160+ mmHg',
      '• 혈청 알도스테론 측정',
      '• 복부 초음파: 부신 크기 확인',
      '',
      '【원인】',
      '• 부신 종양 (편측 또는 양측)',
      '• 부신 증식 (hyperplasia)',
      '',
      '【치료】',
      '• 칼륨 보충 (먹는 약, 처방식)',
      '• 혈압 약 (amlodipine)',
      '• 스피로노락톤 (알도스테론 차단제)',
      '• 편측 부신 종양: 수술(부신절제술) 고려',
      '',
      '고혈압과 함께 근육이 약해진 증상이 있나요?',
    ].join('\n')
  }

  // ── 파행 (절뚝거림) 원인 및 등급 ───────────────────────────────
  if (/파행\s*(원인|등급|평가|심한|가벼운)|절뚝\s*(거림|이는|대는)|다리\s*(절어|저는|못\s*쓰는|들고)|절다|절룩|일어서기\s*(힘들|어려워|못해)/.test(text)) {
    return [
      '🦴 파행 (절뚝거림) 평가 안내',
      '',
      '파행의 정도와 원인을 파악해야 적절한 치료가 가능해요.',
      '',
      '【파행 등급】',
      '1등급: 운동 후에만 파행, 평상시 정상',
      '2등급: 항상 파행이지만 체중 지지 가능',
      '3등급: 파행이 심하고 체중 지지 불안정',
      '4등급: 해당 다리를 전혀 짚지 않음',
      '',
      '【앞다리 파행의 주요 원인】',
      '• 엘보 이형성증 (대형견 강아지)',
      '• 어깨 골연골증 (OCD)',
      '• 전완골 성장 불균형',
      '• 관절염',
      '',
      '【뒷다리 파행의 주요 원인】',
      '• 슬개골 탈구 (소형견 흔함)',
      '• 고관절 이형성증 (대형견)',
      '• IVDD 디스크 (척추)',
      '• 십자인대 파열 (CCL)',
      '• 대퇴골두 무혈성 괴사 (소형견)',
      '',
      '【집에서 확인할 점】',
      '□ 어느 다리가 문제인가요?',
      '□ 언제부터 시작됐나요?',
      '□ 운동 후 심해지나요, 아니면 기상 후?',
      '□ 만졌을 때 아파하나요?',
      '□ 외상이 있었나요?',
      '',
      '현재 어느 다리를 절고, 언제부터 시작됐나요?',
    ].join('\n')
  }

  // ── 비만세포종 등급·치료 심층 ────────────────────────────────────
  if (/비만\s*세포종\s*(등급|Grade|grade|Patnaik|Kiupel|치료|항암|수술\s*후|재발|예후)|MCT\s*(등급|치료|예후)/.test(text)) {
    return [
      '🎗️ 비만세포종 등급·치료 심층 안내',
      '',
      '비만세포종의 예후는 등급과 위치에 크게 달라요.',
      '',
      '【등급 체계】',
      '■ Patnaik 3등급 체계 (구분)',
      '• Grade 1: 피부에만 국한, 완치 가능성 높음',
      '• Grade 2: 중간, 예후 다양 — 세포 형태로 예후 판단',
      '• Grade 3: 고악성, 빠른 전이, 예후 불량',
      '',
      '■ Kiupel 2등급 체계 (현재 권장)',
      '• Low grade: 예후 양호, 수술로 완치 가능',
      '• High grade: 공격적 행동, 보조 치료 필요',
      '',
      '【완전 절제(clean margin) 여부가 핵심】',
      '• Clean margin: 수술만으로 완치 가능 (low grade)',
      '• Dirty margin: 재절제 또는 방사선 치료 추가',
      '',
      '【내장 비만세포종】',
      '• 내장(비장·간·소장): 훨씬 예후 불량',
      '• 비장 비만세포종: 고양이에서 흔함 (고양이 비장 종양 2위)',
      '',
      '【내과 치료 옵션】',
      '• Vinblastine + prednisolone: 고등급 표준 항암',
      '• Toceranib (Palladia): 표적 치료제 (KIT 돌연변이 양성)',
      '• 항히스타민: 위장관 보호',
      '',
      '【수술 후 모니터링】',
      '• 절제 부위 주기적 확인',
      '• 국소 림프절 크기 추적',
      '• 복부 초음파: 내장 전이 확인',
      '',
      '현재 등급 판정을 받으셨나요?',
    ].join('\n')
  }

  // ── 고양이 갑작스러운 실명 / 망막 박리 응급 ─────────────────────
  if (/고양이\s*(갑자기|갑작스럽게)\s*(실명|눈이|앞이\s*안\s*보이는|앞\s*못\s*봄)|망막\s*박리|고혈압\s*(눈|실명|망막)|갑자기\s*시력\s*(잃|없어|저하)/.test(text)) {
    return [
      '🚨 고양이 갑작스러운 실명 — 응급!',
      '',
      '고양이가 갑자기 시력을 잃었다면 즉시 병원으로 가세요!',
      '',
      '【가장 흔한 원인: 고혈압으로 인한 망막 박리】',
      '• 고양이 고혈압 → 망막 혈관 손상 → 망막 박리 → 실명',
      '• 24~48시간 내 치료하면 시력 회복 가능성 있어요',
      '',
      '【의심 신호】',
      '• 동공이 매우 커진 채 반응 없음 (빛 반사 없음)',
      '• 물건에 자꾸 부딪힘',
      '• 갑작스럽게 방향 감각 상실',
      '',
      '【고혈압의 원인 (치료하면 예방 가능)】',
      '• 만성 신부전: 고양이 고혈압 1위',
      '• 갑상선기능항진증',
      '• 고알도스테론혈증',
      '',
      '【응급 치료】',
      '• 혈압 약 (amlodipine) 즉시 투여',
      '• 망막 박리 확인 (안과 검사)',
      '• 원인 질환 동시 치료',
      '',
      '지금 동공 상태는 어떤가요? 빛을 비추면 반응이 있나요?',
    ].join('\n')
  }

  // ── X-ray 결과 해석 가이드 ───────────────────────────────────────
  if (/X.?ray\s*(결과|뭐라|해석)|엑스레이\s*(결과|뭐라|해석)|방사선\s*(사진|결과)\s*(어떻게|이해|해석)|VHS|척추\s*(간격|좁아짐)|골밀도\s*(낮|떨어|감소)/.test(text)) {
    return [
      '🩻 X-ray 결과 해석 가이드',
      '',
      'X-ray 결과를 직접 판독하는 것은 수의사의 전문 영역이지만,',
      '기본 개념을 알아두면 설명을 이해하는 데 도움이 돼요.',
      '',
      '【심장 크기 — VHS (Vertebral Heart Score)】',
      '• 개 정상: 8.5~10.5 vertebrae',
      '• 고양이 정상: 6.7~8.1 vertebrae',
      '• VHS 증가 = 심장 비대 (심장병 의심)',
      '',
      '【폐 음영】',
      '• 흰색 증가 = 액체, 염증, 종양 가능성',
      '• 어두운 패턴 = 기종, 공기 과다',
      '• 혈관 음영 진함 = 폐부종 또는 폐고혈압',
      '',
      '【척추 (디스크) 간격】',
      '• 디스크 공간 좁아짐 = 디스크 질환 의심',
      '• 척추뼈 흰 점 = 디스크 칼슘 침착',
      '',
      '【관절 변화】',
      '• 관절 공간 좁아짐 = 관절염 진행',
      '• 뼈 끝 돌기 (골극) = 퇴행성 관절 변화',
      '',
      '【복부 X-ray】',
      '• 장내 가스 과다 = 장 폐색, GDV 위험',
      '• 방광 흰 점 = 결석 (스트루바이트가 잘 보임)',
      '',
      '어떤 부위 X-ray 결과를 들으셨나요?',
    ].join('\n')
  }

  // ── 건식 vs 습식 사료 비교 ──────────────────────────────────────
  if (/건식\s*(vs|versus|비교|차이|아니면)\s*습식|습식\s*(vs|versus|비교|차이|아니면)\s*건식|캔\s*(사료|음식)\s*(vs|차이|비교)|건사료\s*습식|습식\s*건사료|사료\s*(종류|어떤\s*것|뭘\s*먹이)/.test(text)) {
    return [
      '🍽️ 건식 vs 습식 사료 비교',
      '',
      '두 가지 모두 장단점이 있어요. 질환과 개체에 맞게 선택해요.',
      '',
      '【건식 사료 (Dry Kibble)】',
      '장점:',
      '• 가격 저렴, 보관 편리',
      '• 에너지 밀도 높아 소량으로 충분한 칼로리',
      '',
      '단점:',
      '• 수분 함량 낮음 (10% 내외) — 음수량 부족 시 비뇨기 문제',
      '• 탄수화물 함량 비교적 높음',
      '',
      '【습식 사료 (Wet/Canned)】',
      '장점:',
      '• 수분 함량 높음 (70~80%) — 비뇨기 건강에 유리',
      '• 맛있어서 식욕 저하된 아이에게 효과적',
      '• 단백질·지방 비율 높고 탄수화물 낮음',
      '',
      '단점:',
      '• 가격 비쌈',
      '• 개봉 후 빨리 먹어야 함',
      '',
      '【추천 상황】',
      '• 신장병·방광염·비뇨기 문제: 습식 또는 혼합 강력 추천',
      '• 비만 관리: 저열량 건식',
      '• 식욕 저하: 습식으로 유도',
      '• 일반 건강한 경우: 둘 다 괜찮음',
      '',
      '현재 어떤 질환이나 고민으로 사료를 고민하시나요?',
    ].join('\n')
  }

  // ── 혈액형 / 수혈 전 검사 ────────────────────────────────────────
  if (/혈액형\s*(개|고양이|수혈)|수혈\s*(전|가능|부작용|반응|부적합)|교차\s*반응\s*검사|blood\s*type|DEA/.test(text)) {
    return [
      '🩸 반려동물 혈액형·수혈 안내',
      '',
      '수혈 전 혈액형 확인은 생명과 직결돼요.',
      '',
      '【개의 혈액형 (DEA 시스템)】',
      '• DEA 1.1 양성/음성이 가장 중요',
      '• DEA 1.1 음성 개 → 음성 혈액만 받아야 함',
      '• DEA 1.1 양성 수혈 시: 첫 수혈은 안전, 두 번째부터 반응 위험',
      '• 만능 공혈견: DEA 1.1 음성',
      '',
      '【고양이의 혈액형 (A/B/AB 시스템)】',
      '• A형: 가장 흔함 (95% 이상)',
      '• B형: 드문 편 — 일부 품종에 많음 (British Shorthair, Devon Rex)',
      '• AB형: 매우 드뭄',
      '⚠️ B형 고양이에게 A형 수혈 → 즉각적 치명적 반응',
      '',
      '【수혈 전 필수 검사】',
      '• 혈액형 검사 (Blood typing)',
      '• 교차 반응 검사 (Cross-matching): 가장 안전',
      '',
      '【수혈 부작용 징후】',
      '• 체온 상승, 구토, 안면 부종',
      '• 혈색뇨 (혈색소뇨증)',
      '• 쇼크 증상 (갑자기 허탈)',
      '',
      '수혈이 필요한 이유가 무엇인가요? (출혈? 빈혈? 수술 중?)',
    ].join('\n')
  }

  // ── 자궁축농증 (Pyometra) 심층 ──────────────────────────────────
  if (/자궁\s*(축농증|고름|pyometra|염증|적출|경부\s*열림|경부\s*닫힘)|자궁\s*(에서|에)\s*(고름|분비물|냄새)|중성화\s*안\s*한\s*(암컷|여아)/.test(text)) {
    return [
      '🚨 자궁축농증 안내',
      '',
      '자궁축농증은 중성화 안 된 암컷에게 생명을 위협하는 질환이에요.',
      '',
      '【자궁축농증이란?】',
      '자궁 내에 세균이 번식해 고름이 가득 차는 상태예요.',
      '발정 후 황체기(프로게스테론 높은 시기)에 잘 발생해요.',
      '',
      '【두 가지 유형】',
      '• Open type (개방형): 자궁경부 열려 있어 고름이 외부로 흘러나옴',
      '  → 증상 발견 빠름 (냄새나는 분비물)',
      '• Closed type (폐쇄형): 고름이 내부에 갇힘',
      '  → 매우 위험 (배가 불러오고 빠르게 쇼크)',
      '',
      '【증상】',
      '• 외음부에서 고름 분비물 (Open)',
      '• 배가 부풀어오름 (Closed)',
      '• 다음다뇨, 식욕부진, 무기력',
      '• 구토, 발열 또는 저온',
      '',
      '【치료】',
      '✅ 응급 수술 (난소자궁절제술): 완치 가능, 가장 권장',
      '⚠️ 약물 치료 (PGF2α): 번식용 개에서 예외적으로 사용, 재발률 높음',
      '',
      '【중요 포인트】',
      '발정 후 4~8주 내 발생하는 경우 많아요.',
      '증상 발견 즉시 병원 방문 — 폐쇄형은 수 일 내 사망 가능',
      '',
      '현재 분비물이 있나요, 없나요?',
    ].join('\n')
  }

  // ── 오줌 참기 / 배뇨 참는 습관 ─────────────────────────────────
  if (/오줌\s*(참기|참아|오래\s*참|못\s*싸게|하루\s*몇\s*번|배뇨\s*횟수)|소변\s*(참기|오래|하루\s*몇\s*번|횟수)|화장실\s*(자주|얼마나|몇\s*번)/.test(text)) {
    return [
      '🚽 배뇨 빈도 및 참기 관리',
      '',
      '오줌을 너무 오래 참는 것은 방광 건강에 좋지 않아요.',
      '',
      '【정상 배뇨 빈도】',
      '• 개: 하루 3~5회 (성견 기준)',
      '• 강아지·노령견: 4~6회 이상',
      '• 고양이: 하루 2~4회',
      '',
      '【오래 참으면 생기는 문제】',
      '• 방광 근육 약화 (만성 과팽창)',
      '• 세균 번식 시간 증가 → 방광염 위험',
      '• 요석 형성 위험 (소변이 농축될수록)',
      '',
      '【실제로 문제가 되는 경우】',
      '• 직장인이 8~10시간 외출하는 경우',
      '• 고양이 화장실이 마음에 안 들어 참는 경우',
      '',
      '【해결 방법】',
      '• 개: 펫시터, 자동 급수·급식, 점심 귀가',
      '• 고양이: 화장실 추가, 위치 변경, 모래 교체',
      '• 노령·방광 질환: 배변 패드 활용',
      '',
      '하루에 몇 번 화장실 기회를 주고 계신가요?',
    ].join('\n')
  }

  // ── 포도막염 / 눈 충혈·통증·빛 눈부심 ──────────────────────────
  if (/포도막염|눈\s*(충혈|통증|눈부심|빛\s*회피|뒤집어진|뿌예|탁해)|각막\s*(혼탁|부종|흰색|파란색)|홍채\s*(색\s*변|이상)/.test(text)) {
    return [
      '👁️ 포도막염 안내',
      '',
      '눈이 충혈되고 빛을 피한다면 포도막염일 수 있어요.',
      '',
      '【포도막염이란?】',
      '홍채·모양체·맥락막(포도막)에 염증이 생긴 상태예요.',
      '방치하면 녹내장, 백내장, 실명으로 이어질 수 있어요.',
      '',
      '【증상】',
      '• 눈 충혈',
      '• 빛을 피함 (광선공포증)',
      '• 눈물 과다 분비',
      '• 동공 불규칙하거나 수축',
      '• 각막이 뿌옇게 변함 (각막 부종)',
      '• 홍채 색 변화',
      '',
      '【원인 (고양이에서 흔한 것)】',
      '• FHV-1 (허피스 바이러스)',
      '• FIP (고양이 전염성 복막염)',
      '• 림프종',
      '• 고혈압 (신부전·갑상선항진증)',
      '• 톡소플라즈마',
      '',
      '【원인 (개에서 흔한 것)】',
      '• 렙토스피라, 브루셀라',
      '• 림프종',
      '• 렌즈 유발성 포도막염 (백내장 합병)',
      '',
      '【치료】',
      '• 원인에 따라 다름',
      '• 스테로이드 점안액 또는 전신 스테로이드',
      '• 동공 확장제 (통증 완화, 유착 방지)',
      '',
      '증상이 갑자기 나타났나요? 한쪽 눈인가요, 양쪽 눈인가요?',
    ].join('\n')
  }

  // ── 호산구성 질환 / 알레르기 염증 ───────────────────────────────
  if (/호산구\s*(증가|높음|질환|육아종|복합체)|호산구성\s*(염증|피부|장염|기관지염)|EGC|eosinophil|호산구성\s*궤양/.test(text)) {
    return [
      '🔬 호산구성 질환 안내',
      '',
      '호산구가 증가하면 알레르기나 기생충 감염을 의심해요.',
      '',
      '【호산구란?】',
      '알레르기 반응과 기생충 방어에 관여하는 백혈구의 일종이에요.',
      '정상보다 높으면 원인 파악이 중요해요.',
      '',
      '【고양이 호산구성 육아종 복합체 (EGC)】',
      '고양이에게 매우 흔한 알레르기 피부 반응이에요:',
      '• 무통성 궤양: 윗 입술에 궤양 (핥거나 긁지 않아도 생김)',
      '• 호산구성 플라크: 배·허벅지 안쪽 털 빠진 붉은 반점',
      '• 선형 육아종: 뒷다리·발에 길쭉한 황갈색 융기',
      '',
      '【개 호산구성 장염】',
      '• 만성 구토·설사',
      '• 혈변, 체중 감소',
      '• 음식 알레르기 또는 기생충이 원인',
      '',
      '【진단】',
      '• 혈액검사: 백혈구 감별계산 (호산구 % 확인)',
      '• 피부 생검 (조직검사)',
      '• 분변 기생충 검사',
      '• 알레르겐 회피 시험',
      '',
      '【치료】',
      '• 원인 제거 (알레르겐, 기생충)',
      '• 스테로이드: 염증 억제',
      '• 사이클로스포린: 반복 재발 시',
      '',
      '어디에서 발견된 증상인가요?',
    ].join('\n')
  }

  // ── 피부사상균증 (링웜) ──────────────────────────────────────────
  if (/피부사상균|링\s*웜|ringworm|백선|원형\s*(탈모|털빠짐|피부)|곰팡이\s*피부병|진균\s*감염\s*피부/.test(text)) {
    return [
      '🦠 피부사상균증 (링웜) 안내',
      '',
      '이름은 "링웜(ringworm)"이지만 기생충이 아닌 곰팡이 감염이에요.',
      '',
      '【피부사상균증이란?】',
      'Microsporum canis 등의 진균이 피부·털·발톱을 감염시켜요.',
      '반려동물과 사람 모두 감염 가능한 인수공통 질환이에요.',
      '',
      '【증상】',
      '• 원형 탈모 패치 (털 부러짐)',
      '• 비듬, 딱지',
      '• 경미한 가려움 (또는 가려움 없음)',
      '• 고양이: 종종 무증상 보균자 (새끼 고양이에서 많음)',
      '',
      '【진단】',
      '• Wood 램프 (자외선): 형광 녹색 빛 = 양성 (50% 정도에서만 양성)',
      '• 진균 배양: 가장 확실하지만 2~4주 소요',
      '• PCR: 빠르고 정확',
      '',
      '【치료】',
      '• 항진균 샴푸 (miconazole, chlorhexidine): 2~3회/주',
      '• 전신 항진균제 (itraconazole, terbinafine): 심한 경우',
      '• 환경 소독: 진공청소 + 희석 표백수 (1:10)',
      '',
      '【사람 예방】',
      '• 반려동물 만진 후 손 씻기',
      '• 의심 병변 접촉 시 장갑 착용',
      '',
      '원형 탈모 부위가 얼마나 되고, 얼마나 됐나요?',
    ].join('\n')
  }

  // ── 혈변 / 흑변 원인 구별 ───────────────────────────────────────
  if (/혈변\s*(원인|종류|차이|구별)|흑변\s*(원인|melena|메레나)|변\s*(피|빨간|검정|검게|타르)|항문\s*(출혈|피)|직장\s*출혈/.test(text)) {
    return [
      '🩸 혈변·흑변 구별 안내',
      '',
      '변에 피가 섞이면 위치에 따라 의미가 달라요.',
      '',
      '【선혈 (Hematochezia) — 빨간 피】',
      '• 출혈 위치: 대장, 직장, 항문',
      '• 변에 선명한 빨간 피가 묻거나 섞임',
      '• 원인: 대장염, 직장 폴립, 항문낭 파열, 기생충, 이물질',
      '',
      '【흑변 (Melena) — 검은 타르 같은 변】',
      '• 출혈 위치: 위, 소장 (소화된 혈액)',
      '• 변이 검고 끈적한 타르처럼 보임',
      '• 강한 냄새',
      '• 원인: 위궤양, 십이지장 궤양, 간 질환, NSAIDs 부작용',
      '',
      '【응급 신호】',
      '🚨 아래 증상 동반 시 즉시 병원:',
      '• 대량 출혈 (변이 온통 피)',
      '• 창백한 잇몸',
      '• 허탈, 실신',
      '• 구토 + 흑변 동시',
      '',
      '【경과 관찰 가능한 경우】',
      '• 소량의 선혈 + 대장염 증상',
      '• 평소 NSAIDs 투약 중이 아닌 경우',
      '• 활기차고 식욕 정상인 경우',
      '',
      '변의 색깔, 양, 냄새가 어떤가요?',
    ].join('\n')
  }

  // ── 면역억제제 (사이클로스포린·아자치오프린) 관리 ───────────────
  if (/사이클로스포린|아자치오프린|mycophenolate|면역\s*억제제\s*(사용|관리|부작용|모니터)|tacrolimus|레플루노마이드/.test(text)) {
    return [
      '💊 면역억제제 관리 안내',
      '',
      '면역억제제는 면역 매개 질환 치료의 핵심이에요.',
      '',
      '【주요 면역억제제】',
      '● 사이클로스포린 (Cyclosporine / Atopica)',
      '• 용도: 아토피, 면역매개 피부병, IBD, IMHA, IMT',
      '• 주의: 감염 위험 증가, 신독성 (고용량)',
      '• 모니터: 정기적 신장 수치, 혈중 농도 검사',
      '',
      '● 아자치오프린 (Azathioprine)',
      '• 개에서 주로 사용 (고양이에서 골수 독성 위험 높아 주의)',
      '• 용도: IBD, IMHA, 피부 면역 질환',
      '• 주의: 골수 억제 (CBC 주기 검사 필수)',
      '',
      '● Mycophenolate Mofetil (MMF)',
      '• 대안 선택지, 개·고양이 모두 사용',
      '• 구토·설사 부작용 흔함',
      '',
      '【면역억제 중 주의할 점】',
      '• 감염 징후 주시: 발열, 무기력, 식욕부진',
      '• 생백신 투여 금지 (면역억제 중)',
      '• 다른 동물·사람과 접촉 시 감염 전파 양방향 주의',
      '• 상처 치유 지연 가능',
      '',
      '어떤 질환으로 면역억제제를 사용 중이신가요?',
    ].join('\n')
  }

  // ── 동물병원 응급실 / 야간 응급 ─────────────────────────────────
  if (/응급실\s*(어디|위치|찾기)|야간\s*(응급|병원|진료)|24시간\s*(병원|동물병원)|응급\s*(병원\s*찾기|이송|어떻게)/.test(text)) {
    return [
      '🚨 동물 응급 병원 찾기',
      '',
      '즉각 조치가 필요한 응급 상황이라면 아래를 활용하세요.',
      '',
      '【응급 여부 판단】',
      '🚨 즉시 이동해야 하는 상황:',
      '• 의식 없음 / 쓰러짐',
      '• 호흡 곤란 (입 벌리고 헉헉)',
      '• 대량 출혈',
      '• 경련 5분 이상',
      '• 고양이 뒷다리 갑자기 마비',
      '• 배가 부풀고 구역질만 (개 GDV 의심)',
      '• 소변을 전혀 못 누는 수컷 고양이',
      '',
      '【야간·응급 병원 찾는 방법】',
      '1. 네이버·카카오맵: "24시간 동물병원 + 지역명" 검색',
      '2. 평소 다니던 병원에 전화 → 제휴 응급 병원 안내받기',
      '3. 대학 동물병원: 대부분 24시간 응급실 운영',
      '',
      '【대학 동물병원 (서울·수도권)】',
      '• 서울대 수의대 동물병원',
      '• 건국대 수의대 동물병원',
      '• 충남대 수의대 동물병원 (대전)',
      '• 전북대 수의대 동물병원 (전주)',
      '',
      '【이동 중 주의사항】',
      '• 흥분하지 않게 조용하고 따뜻하게 유지',
      '• 이동 중 물이나 음식 주지 않기',
      '• 가능하면 병원에 전화해 도착 예고',
      '',
      '현재 어떤 증상이 있나요?',
    ].join('\n')
  }

  // ── 백혈병 / 림프종 vs 림프절 비대 감별 ────────────────────────
  if (/림프절\s*(비대|부어|커진|커졌|만져짐|만져|딱딱)|림프\s*(암|종양|비대)|백혈병|림프종\s*(진단|검사|생검)|림프샘/.test(text)) {
    return [
      '🎗️ 림프절 비대 감별 안내',
      '',
      '림프절이 커지면 여러 원인 중 감별이 필요해요.',
      '',
      '【림프절 비대 원인】',
      '1. 반응성 림프절병증 (가장 흔함)',
      '   • 감염, 염증에 반응해 림프절이 커진 것',
      '   • 원인 치료하면 줄어듦',
      '',
      '2. 림프종 (Lymphoma)',
      '   • 개: 다발성 림프절 비대, 전신 증상 (무기력, 식욕 저하)',
      '   • 고양이: 소화기형 림프종 가장 흔함',
      '',
      '3. 전이성 종양',
      '   • 다른 부위 암이 림프절로 전이',
      '',
      '4. 육아종성 질환 (곰팡이, 마이코박테리아)',
      '',
      '【진단 방법】',
      '• 세침흡인검사 (FNA): 주삿바늘로 세포 채취 — 빠르고 비침습적',
      '• 림프절 생검: 조직검사 — 가장 정확',
      '• CBC, 화학 검사: 전신 상태 평가',
      '• 흉부·복부 영상: 내부 림프절 확인',
      '',
      '【림프종 치료 개요】',
      '• CHOP 항암 프로토콜: 빈크리스틴, 사이클로포스파마이드, 독소루비신, 프레드니솔론',
      '• 치료 반응율: 개 80~90% (완전관해), 평균 생존 12~14개월',
      '• 프레드니솔론 단독: 완화 치료 (2~3개월)',
      '',
      '어느 부위 림프절이 커졌나요?',
    ].join('\n')
  }

  // ── 구토 분류 (급성 vs 만성, 원인별) ──────────────────────────
  if (/구토\s*(원인|종류|분류|급성|만성|왜\s*하는|빈도|횟수)|토\s*(자꾸|계속|반복|매일|자주)|역류\s*(원인|vs\s*구토|차이)/.test(text)) {
    return [
      '🤢 구토 원인 분류 안내',
      '',
      '구토 종류와 빈도에 따라 원인이 달라요.',
      '',
      '【구토 vs 역류 구별】',
      '• 구토: 복근 수축 있음, 소화된 내용물 나옴',
      '• 역류: 힘 없이 나옴, 소화 안 된 음식, 식도 문제',
      '',
      '【급성 구토 (갑자기)】',
      '• 이물질 삼킴 (가장 흔함)',
      '• 급성 위장염 (세균, 바이러스)',
      '• 독성 물질 섭취',
      '• 췌장염 (지방 많은 음식 후)',
      '• 신부전·간부전 (독소 축적)',
      '',
      '【만성·반복 구토 (주 1회 이상)】',
      '• IBD (만성 염증성 장 질환)',
      '• 음식 과민증·알레르기',
      '• 헬리코박터 감염',
      '• 위 운동성 장애',
      '• 갑상선기능항진증 (고양이)',
      '',
      '【응급 구토 신호】',
      '🚨 즉시 병원:',
      '• 노란 담즙 + 복부 팽만 (GDV 의심)',
      '• 구토 + 혈변 또는 흑변',
      '• 8회 이상/일',
      '• 기운 없음 + 음수 불가',
      '',
      '구토가 시작된 게 언제부터이고, 하루에 몇 번 하나요?',
    ].join('\n')
  }

  // ── 수술 후 재활·물리치료 ────────────────────────────────────────
  if (/수술\s*후\s*(재활|물리\s*치료|운동|회복|걷기)|수술\s*(재활|복구|후유증)|TPLO\s*(재활|후|운동)|디스크\s*(수술\s*후|재활)/.test(text)) {
    return [
      '🏋️ 수술 후 재활·물리치료 안내',
      '',
      '수술 후 재활은 회복 속도를 크게 높여요.',
      '',
      '【수술 후 재활이 중요한 이유】',
      '• 근육 위축 방지',
      '• 관절 가동 범위 유지',
      '• 신경 회복 촉진 (디스크 수술 후)',
      '• 통증 감소',
      '',
      '【기간별 재활 단계】',
      '■ 1~2주 (초기)',
      '• 절대 안정: 케이지 레스트',
      '• ROM 운동 (수동적 관절 운동)',
      '• 온열 치료',
      '',
      '■ 2~6주 (중기)',
      '• 단거리 보행 (목줄 짧게)',
      '• 수중 트레드밀 (관절 부담 없는 운동)',
      '• 장애물 보행',
      '',
      '■ 6주 이후 (후기)',
      '• 점진적 운동 강도 증가',
      '• 수영 (TPLO 이후 특히 효과적)',
      '• 근력 강화',
      '',
      '【집에서 할 수 있는 재활】',
      '• 쿠션 걷기: 불균형 자극으로 코어 강화',
      '• 등 위에 손을 얹고 자세 교정',
      '• 핥게 해서 목 스트레칭 유도',
      '',
      '어떤 수술을 받으셨나요?',
    ].join('\n')
  }

  // ── 암 말기 완화 치료 (Palliative Care) ─────────────────────────
  if (/완화\s*(치료|케어|care)|말기\s*(암|종양|치료|관리)|호스피스\s*(치료|케어)|항암\s*포기\s*(후|하고)|치료\s*중단\s*(후|하면|결정)/.test(text)) {
    return [
      '🌿 말기 암 완화 치료 안내',
      '',
      '완화 치료는 "포기"가 아닌, 삶의 질 중심 치료예요.',
      '',
      '【완화 치료의 목표】',
      '치료보다 통증·불편함 없이 편안하게 지내는 것에 집중해요.',
      '적극적 치료를 하면서도 완화 치료를 병행할 수 있어요.',
      '',
      '【완화 치료의 핵심 요소】',
      '🔵 통증 관리',
      '• NSAIDs (멜록시캄, 카프로펜)',
      '• 오피오이드 (중등도~중증 통증)',
      '• 가바펜틴 (신경병성 통증)',
      '',
      '🔵 식욕 유지',
      '• 미르타자핀 (식욕 자극제)',
      '• 마로피탄트 (오심·구역 억제)',
      '• 맛있는 간식, 습식 전환',
      '',
      '🔵 정서적 지원',
      '• 평소 좋아하는 활동 유지',
      '• 포근한 잠자리, 주변 온기',
      '• 가족과 시간 보내기',
      '',
      '【삶의 질 평가 도구】',
      'HHHHHMM 척도 (Hurt, Hunger, Hydration, Hygiene, Happiness, Mobility, More good days):',
      '각 항목 0~10점, 총 35점 이하이면 안락사 고려 권유됨',
      '',
      '지금 가장 힘든 증상이 어떤 건가요?',
    ].join('\n')
  }

  // ── 배꼽 탈장 / 서혜부 탈장 ─────────────────────────────────────
  if (/배꼽\s*(탈장|혹|불룩|튀어나온)|서혜부\s*(탈장|혹)|탈장\s*(수술|교정|언제)|diaphragmatic\s*hernia|횡격막\s*탈장/.test(text)) {
    return [
      '🏥 탈장 안내',
      '',
      '탈장 종류에 따라 응급도가 달라요.',
      '',
      '【배꼽 탈장 (Umbilical Hernia)】',
      '• 배꼽 주변이 불룩 튀어나온 상태',
      '• 강아지·새끼 고양이에서 흔히 발견',
      '• 작고 부드러운 경우: 대개 저절로 닫히거나 중성화 수술 시 같이 교정',
      '• 딱딱하거나 커지면: 장기 감돈 위험 — 수술 필요',
      '',
      '【서혜부 탈장 (Inguinal Hernia)】',
      '• 사타구니 부위 불룩 튀어나옴',
      '• 중성화 안 된 암컷에서 더 흔함',
      '• 자궁·방광이 빠질 수 있어 위험도 높음',
      '• 수술 권장',
      '',
      '【횡격막 탈장 (Diaphragmatic Hernia)】',
      '• 외상(교통사고 등) 후 발생',
      '• 복부 장기가 흉강으로 이동 → 호흡 곤란',
      '• 응급 수술',
      '',
      '【응급 신호 (감돈 탈장)】',
      '🚨 탈장 부위가 딱딱하고 아파하면 즉시 병원',
      '혈액 공급이 막혀 장기 괴사 위험',
      '',
      '탈장 부위가 부드러운지, 딱딱한지 확인해보셨나요?',
    ].join('\n')
  }

  // ── 녹내장 (Glaucoma) ────────────────────────────────────────────
  if (/녹내장|안압\s*(높음|상승|이상|측정)|눈\s*(부음|붓고|커지고|커진)|glaucoma|공막\s*(충혈|붉음)/.test(text)) {
    return [
      '👁️ 녹내장 안내',
      '',
      '녹내장은 빠른 대응이 실명을 막는 핵심이에요.',
      '',
      '【녹내장이란?】',
      '안압이 상승해 시신경이 손상되는 질환이에요.',
      '개에서는 매우 빠르게 진행 (24~48시간 내 실명 가능).',
      '',
      '【증상】',
      '• 눈이 커 보임 (안구 확대)',
      '• 공막 충혈 (빨간 핏줄 눈에 띔)',
      '• 동공 확대, 각막 혼탁',
      '• 눈을 비비거나 통증 표현',
      '• 식욕 저하, 무기력 (두통과 유사한 증상)',
      '',
      '【분류】',
      '• 원발성: 유전적 소인 (개: 코커스파니엘, 차우차우, 바셋 하운드)',
      '• 속발성: 포도막염, 수정체 탈구, 종양이 원인',
      '',
      '【치료】',
      '■ 내과 (안압 낮추기)',
      '• Dorzolamide + timolol 점안액',
      '• Latanoprost (개에서 효과적)',
      '• 전신 약물: 만니톨 (급성 고압 시)',
      '',
      '■ 외과',
      '• 레이저 치료 (cyclophotocoagulation)',
      '• 이미 실명한 경우: 안구 내용물 적출 또는 의안 삽입',
      '',
      '안압이 얼마나 되는지 검사 결과가 있나요?',
    ].join('\n')
  }

  // ── 발·발바닥 관리 (발바닥 갈라짐, 발톱, 발 핥기) ───────────────
  if (/발바닥\s*(갈라짐|까짐|딱딱|건조|화상|핥기|닦기)|발\s*(핥기|씹기|냄새|이상)|발톱\s*(너무\s*긴|깎기|빠짐|부러짐|검은|뒤집힌)|상수리\s*발/.test(text)) {
    return [
      '🐾 발·발바닥 관리 안내',
      '',
      '발 문제는 증상에 따라 원인이 다양해요.',
      '',
      '【발바닥 갈라짐·건조】',
      '• 원인: 건조한 날씨, 뜨거운 아스팔트 화상, 영양 불균형',
      '• 관리: 무독성 반려동물용 보습제 (코코넛 오일, musher\'s secret)',
      '• ⚠️ 과도하게 갈라지면 과각화증 질환 가능성 → 검진',
      '',
      '【발을 반복적으로 핥거나 씹는 경우】',
      '• 알레르기 (음식·환경): 발 핥기의 가장 흔한 원인',
      '• 진균·세균 감염 (습한 발)',
      '• 지루한 경우 (행동적 원인)',
      '• 가시, 상처 등 이물질',
      '',
      '【발톱 관리】',
      '• 깎는 주기: 2~4주 (실내견은 더 자주)',
      '• 퀵 (혈관) 자르지 않도록 주의',
      '• 검은 발톱: 손전등 비추면 퀵 보임',
      '• 발톱이 부러지거나 뒤집히면 병원 처치 필요',
      '',
      '【여름철 발바닥 화상 예방】',
      '• 손등 7초 테스트: 7초 이상 댈 수 없으면 산책 금지',
      '• 이른 아침 / 저녁 산책으로 시간 조정',
      '',
      '발에 어떤 증상이 있나요?',
    ].join('\n')
  }

  // ── 복강경 수술 / 내시경 수술 ──────────────────────────────────
  if (/복강경\s*(수술|중성화|검사)|내시경\s*(수술|생검|제거)|최소\s*침습\s*(수술|방법)|laparoscopic|키홀\s*수술/.test(text)) {
    return [
      '🏥 복강경·최소침습 수술 안내',
      '',
      '복강경 수술은 회복이 빠르고 흉터가 작아요.',
      '',
      '【복강경 수술이란?】',
      '작은 구멍으로 카메라와 기구를 넣어 시행하는 수술이에요.',
      '기존 개복 수술보다 통증·회복 시간·감염 위험이 적어요.',
      '',
      '【반려동물에서 가능한 복강경 수술】',
      '• 복강경 중성화 (난소절제술): 국내 일부 병원',
      '• 복강경 생검: 간·비장·췌장·신장 조직 채취',
      '• 복강경 이물 제거: 위·장내 이물',
      '• 잠복고환 적출: 복강 내 고환 제거',
      '',
      '【장단점】',
      '장점:',
      '• 절개 부위 최소화',
      '• 회복 빠름 (1~2일 내 일상 복귀)',
      '• 감염 위험 감소',
      '• 내부 시야 확대',
      '',
      '단점:',
      '• 기술과 장비가 필요한 병원에서만 가능',
      '• 비용이 일반 수술보다 높음',
      '• 복잡한 수술은 개복 전환 필요할 수 있음',
      '',
      '【내시경 (소화관용)】',
      '• 위·십이지장 내시경: 이물 제거, 생검',
      '• 대장 내시경: 폴립, 종양 평가',
      '• 마취 필요',
      '',
      '어떤 수술 또는 검사를 고려 중이신가요?',
    ].join('\n')
  }

  // ── 고양이 하부 요로 질환 (FLUTD) 심층 ─────────────────────────
  if (/FLUTD|feline\s*(lower|urinary)|고양이\s*(방광염\s*반복|요로\s*질환|소변\s*이상)\s*(원인|자꾸|반복|왜)|고양이\s*오줌\s*(혈뇨|아픔|소리|금방)/.test(text)) {
    return [
      '🐱 고양이 하부 요로 질환 (FLUTD) 심층 안내',
      '',
      '고양이 FLUTD는 원인이 다양해 개별 접근이 필요해요.',
      '',
      '【FLUTD 원인 분류】',
      '1. 특발성 방광염 (FIC) — 65%',
      '   스트레스가 주 원인. 환경 개선이 핵심.',
      '',
      '2. 요로 결석 — 20%',
      '   스트루바이트(마그네슘 관련), 옥살산칼슘',
      '',
      '3. 요도 플러그 (수컷에서 막힘) — 10%',
      '   점액, 결정, 세포 찌꺼기가 요도를 막음',
      '',
      '4. 해부학적 이상, 종양, 감염 — 나머지',
      '',
      '【FIC (특발성 방광염) 관리 핵심】',
      '• 물 충분히 마시게: 분수형 급수기, 여러 곳에 그릇',
      '• 스트레스 줄이기: 새 가족, 이사, 다묘 갈등',
      '• 환경 풍부화: 수직 공간, 숨을 곳',
      '• 습식 사료 전환',
      '',
      '【요도 막힘 응급 신호 (수컷 고양이)】',
      '🚨 소변 자세를 잡지만 소변이 안 나오고 아파하면 즉시 병원',
      '24시간 내 치료 안 하면 신부전·사망',
      '',
      '마지막으로 소변을 제대로 본 게 언제인가요?',
    ].join('\n')
  }

  // ── 켄넬코프 / 개 기관기관지염 ──────────────────────────────────
  if (/켄넬\s*코프|kennel\s*cough|개\s*(기침\s*전염|컹컹\s*기침)|infectious\s*tracheobronchitis|보르데텔라|빳빳한\s*기침/.test(text)) {
    return [
      '🐕 켄넬코프 (개 전염성 기관기관지염) 안내',
      '',
      '여러 마리가 생활하는 공간에서 잘 퍼지는 기침 질환이에요.',
      '',
      '【원인】',
      '• 주 원인: Bordetella bronchiseptica (세균)',
      '• 바이러스 혼합: 개 인플루엔자, 파라인플루엔자, 아데노바이러스',
      '• 하나 이상이 복합 감염되는 경우 많음',
      '',
      '【증상】',
      '• 빳빳한 거위 소리 기침 (거위 울음 같은 소리)',
      '• 역구역질처럼 보이는 기침 (가래 배출 시도)',
      '• 코 분비물',
      '• 대부분 활기차고 식욕 유지',
      '',
      '【전염 경로】',
      '• 기침·재채기로 날아다니는 비말 감염',
      '• 감염 후 잠복 2~14일',
      '• 회복 후에도 3~4주간 전파 가능',
      '',
      '【치료】',
      '• 경증: 자연 회복 (2~3주), 안정과 수분 충분히',
      '• 세균성 의심: 독시사이클린, 아목시실린',
      '• 기침 억제제: 증상 완화',
      '• 합병증 주의: 폐렴으로 악화될 수 있음',
      '',
      '【예방 백신】',
      '• 보르데텔라 비내 접종 or 구강 접종 (주사보다 빠른 효과)',
      '• 펫숍, 훈련소, 위탁 전에 접종 권장',
      '',
      '최근 다른 개와 접촉이 있었나요?',
    ].join('\n')
  }

  // ── 반려동물 치과 마취 전·후 ─────────────────────────────────────
  if (/치과\s*(마취|수술\s*전후|스케일링\s*마취|진정)|스케일링\s*(마취|걱정|위험)|발치\s*(마취|수술|전후)|구강\s*(수술|마취|스케일)/.test(text)) {
    return [
      '🦷 치과 마취·스케일링 안내',
      '',
      '반려동물 치과 처치는 마취가 필수이며, 철저한 준비가 중요해요.',
      '',
      '【왜 마취가 필요한가?】',
      '무마취 스케일링은 보이는 부분만 제거하고,',
      '치아 뒤쪽·잇몸선 아래는 불가능해요.',
      '또한 기구가 닿는 충격으로 폐 이물질(흡인성 폐렴) 위험이 있어요.',
      '',
      '【마취 전 준비】',
      '• 마취 전 혈액 검사 (CBC, 화학 검사)',
      '• 고령이거나 질환이 있으면 심전도·흉부 X-ray 추가',
      '• 8~12시간 금식 (물은 대부분 허용)',
      '• 당뇨·간 질환 있으면 수의사에게 미리 알리기',
      '',
      '【마취 중 모니터링】',
      '• 산소포화도, 심박, 혈압, 체온',
      '• 수액 투여 (혈압 유지)',
      '',
      '【치과 처치 내용】',
      '• 치석 제거 (초음파 스케일러)',
      '• 치아 연마 (치석 재부착 방지)',
      '• 치주 검사 (각 치아별 치주 깊이)',
      '• 필요 시 발치',
      '',
      '【마취 후 집에서 주의사항】',
      '• 당일 소량 급식 (구역감 있을 수 있음)',
      '• 마취 후 기운 없는 것은 정상 (24시간 내)',
      '• 발치 부위: 딱딱한 사료 피하기 1주일',
      '',
      '마지막 스케일링은 언제였나요?',
    ].join('\n')
  }

  // ── 토끼·소동물 건강 (기니피그·햄스터·토끼) ─────────────────────
  if (/토끼\s*(건강|병원|먹이|이상|GI\s*stasis|위장|배불룩)|기니피그\s*(건강|괴혈병|비타민C|이상)|햄스터\s*(건강|종양|이상|습식꼬리)/.test(text)) {
    return [
      '🐰 소동물 (토끼·기니피그·햄스터) 건강 안내',
      '',
      '소동물은 증상을 숨기는 경향이 강해 관찰이 중요해요.',
      '',
      '【토끼 필수 지식】',
      '• GI Stasis (장 정체): 사망 원인 1위 — 12시간 이상 먹지 않으면 응급',
      '  증상: 변이 줄거나 없음, 배 불룩, 기운 없음',
      '• 먹이: 건초 무제한 (80%) + 채소 소량 + 전용 사료 소량',
      '• 과일·당근: 소량만 (당분 많음)',
      '',
      '【기니피그 필수 지식】',
      '• 비타민C 자체 합성 불가 → 반드시 섭취 필요',
      '  부족 시: 괴혈병 (이빨 흔들림, 출혈, 관절 통증)',
      '• 제공: 피망, 파슬리, 케일 (하루 1/4 피망이면 충분)',
      '• 3년마다 치아 과성장 문제 흔함',
      '',
      '【햄스터 필수 지식】',
      '• 습식꼬리증 (Wet Tail): 설사 + 항문 젖음 = 응급',
      '  이틀 내 사망 가능, 즉시 병원',
      '• 종양: 드워프 햄스터에서 1~2세부터 종양 흔함',
      '',
      '【소동물 공통 응급 신호】',
      '• 12시간 이상 먹지 않음',
      '• 눈을 감고 웅크림',
      '• 호흡 빨라짐',
      '• 경련',
      '',
      '어떤 소동물이고, 어떤 증상이 있나요?',
    ].join('\n')
  }

  // ── 브루셀라증 (Brucellosis) ──────────────────────────────────────
  if (/브루셀라\s*(증|감염|검사|양성)|brucellosis|brucella|번식\s*(견|개)\s*(검사|질환)|유산\s*(원인|개|강아지)/.test(text)) {
    return [
      '🦠 브루셀라증 안내',
      '',
      '브루셀라는 번식견뿐 아니라 사람에게도 전파되는 인수공통 질환이에요.',
      '',
      '【브루셀라증이란?】',
      'Brucella canis 세균 감염으로 생식기·척추·눈에 영향을 줘요.',
      '',
      '【감염 경로】',
      '• 감염 개의 분비물 (정액, 질 분비물, 유산물) 접촉',
      '• 교배를 통한 성적 전파',
      '• 사람: 감염 개의 분비물 직접 접촉, 드물지만 가능',
      '',
      '【증상】',
      '• 수컷: 고환 비대·통증, 불임',
      '• 암컷: 유산 (임신 40~55일), 사산, 불임',
      '• 공통: 척추 통증, 포도막염, 림프절 비대',
      '• 무증상 보균자도 흔함',
      '',
      '【진단】',
      '• RSAT (급속응집 검사): 선별검사',
      '• 혈액 배양: 확진 (느리지만 가장 정확)',
      '• PCR',
      '',
      '【치료 및 예후】',
      '• 완치 어려움: 세포 내 기생 세균이라 재발 많음',
      '• 독시사이클린 + 엔로플록사신 6~8주 이상',
      '• 번식 사용 불가 권고',
      '',
      '【중성화 권장】',
      '중성화하면 재발 위험 크게 감소. 완치 불가능한 경우가 많아 중성화 권고.',
      '',
      '교배를 준비 중이신가요, 아니면 검사 결과가 나왔나요?',
    ].join('\n')
  }

  // ── 고양이 FIV (고양이 면역결핍 바이러스) ────────────────────────
  if (/FIV|고양이\s*(면역\s*결핍|에이즈)|feline\s*immunodeficiency|FIV\s*(양성|감염|관리|수명)/.test(text)) {
    return [
      '🐱 고양이 FIV (고양이 면역결핍 바이러스) 안내',
      '',
      'FIV는 고양이 에이즈라고도 불리지만, 잘 관리하면 오래 살 수 있어요.',
      '',
      '【FIV란?】',
      '고양이 면역 시스템을 약화시키는 레트로바이러스예요.',
      '사람의 HIV와 유사하지만 사람에게는 전파되지 않아요.',
      '',
      '【전파 방법】',
      '• 주로 싸울 때 물림 (깊은 교상)',
      '• 성적 접촉 (드물게)',
      '• 수직 전파 (어미 → 새끼, 드물게)',
      '• 밥그릇 공유: 전파 위험 매우 낮음',
      '',
      '【증상】',
      '• 감염 초기: 일시적 발열, 림프절 비대 (수주 후 회복)',
      '• 잠복기: 수년간 무증상',
      '• 만성기: 면역 저하로 2차 감염 반복',
      '  (구내염, 상부호흡기, 피부 감염, 설사)',
      '',
      '【FIV 양성 고양이 관리】',
      '• 실내 전용으로 키우기 (감염 전파 방지, 2차 감염 예방)',
      '• 정기 검진: 6개월~1년마다',
      '• 스트레스 최소화',
      '• 생 음식·날 고기 피하기 (면역 저하로 식중독 위험)',
      '• 중성화 권장',
      '',
      '【수명 예후】',
      'FIV 양성이어도 적절히 관리하면 일반 고양이와 비슷한 수명 가능해요.',
      '',
      '현재 증상이 있나요?',
    ].join('\n')
  }

  // ── 개 십자인대 파열 (CCL/ACL) ─────────────────────────────────
  if (/십자인대\s*(파열|손상|끊어짐|수술|TPLO|TTA)|CCL|cranial\s*cruciate|전방\s*십자인대|후방\s*십자인대\s*(개)/.test(text)) {
    return [
      '🦴 개 십자인대 파열 (CCL) 안내',
      '',
      '십자인대 파열은 개 뒷다리 절뚝거림의 가장 흔한 원인 중 하나예요.',
      '',
      '【개의 십자인대 특성】',
      '사람의 ACL에 해당하는 cranial cruciate ligament (CCL).',
      '개는 무릎 관절 구조상 체중이 실리면 항상 전단력이 가해져,',
      '만성 퇴행 + 갑작스러운 파열이 함께 일어나는 경우가 많아요.',
      '',
      '【증상】',
      '• 갑작스러운 뒷다리 절뚝거림 (급성)',
      '• 서서히 악화되는 절뚝거림 (만성 퇴행)',
      '• 앉을 때 옆으로 다리를 펴는 자세 (Sit test)',
      '• 무릎 부종',
      '',
      '【진단】',
      '• Tibial Thrust 검사, Drawer 검사',
      '• X-ray: 관절 삼출액, 관절 내 미세 변화',
      '• MRI: 인대 상태 직접 확인',
      '',
      '【치료】',
      '■ 수술 (강력 권장 — 특히 20kg 이상)',
      '• TPLO (경골 고원 평준화 절골술): 현재 가장 많이 시행',
      '• TTA (경골 결절 전진술)',
      '',
      '■ 보존 치료 (소형견 일부)',
      '• 체중 감량, 항염증제, 재활 — 완치 아닌 관리',
      '• 관절염 진행 위험',
      '',
      '체중이 얼마나 되고, 어느 쪽 다리인가요?',
    ].join('\n')
  }

  // ── 수두엽 (Hydrocephalus) / 뇌실 확장 ─────────────────────────
  if (/수두증|수두엽|뇌실\s*(확장|크기|수두증)|hydrocephalus|뇌\s*(이상|물이\s*고인|이상\s*소견)\s*(소형|치와와|몰티즈)/.test(text)) {
    return [
      '🧠 수두증 (Hydrocephalus) 안내',
      '',
      '소형 견종 강아지에서 선천적으로 발생하기도 해요.',
      '',
      '【수두증이란?】',
      '뇌척수액(CSF)이 뇌실에 과다 축적돼 뇌를 압박하는 상태예요.',
      '',
      '【선천성 수두증이 흔한 품종】',
      '치와와, 몰티즈, 포메라니안, 잉글리시 불도그, 퍼그',
      '',
      '【증상】',
      '• 두개골이 비정상적으로 커 보임 (돔 모양)',
      '• 뇌문: 눈이 아래를 향함 (sunset sign)',
      '• 경련 발작',
      '• 인지 장애 (배변 훈련 어려움)',
      '• 보행 이상 (비틀거림)',
      '',
      '【진단】',
      '• MRI 또는 CT: 뇌실 크기 정확히 확인',
      '• 초음파: 숨구멍(전문) 열려 있는 경우 초음파로 확인 가능',
      '',
      '【치료】',
      '■ 내과: 뇌부종·뇌압 감소',
      '• 오메프라졸 (CSF 생산 감소)',
      '• 코르티코스테로이드 (부종 감소)',
      '',
      '■ 외과: VP shunt (심각한 경우)',
      '• 뇌실 → 복강으로 CSF 배출 관 삽입',
      '',
      '증상이 언제부터 나타났나요?',
    ].join('\n')
  }

  // ── 항문낭 (Anal Sac) 문제 ─────────────────────────────────────
  if (/항문낭\s*(짜기|분비물|막힘|파열|감염|질환|냄새)|항문\s*(주변\s*핥기|밀기|닦기|긁기|냄새|분비물)|스쿠팅|바닥\s*(항문|엉덩이)\s*(밀기|긁기)/.test(text)) {
    return [
      '🐾 항문낭 문제 안내',
      '',
      '바닥에 엉덩이를 밀거나 항문을 자꾸 핥는다면 항문낭 문제일 수 있어요.',
      '',
      '【항문낭이란?】',
      '항문 양쪽 (4시·8시 방향)에 위치한 작은 분비낭이에요.',
      '분비물이 배변 시 자연 배출되어야 하는데 막히면 문제가 생겨요.',
      '',
      '【증상】',
      '• 스쿠팅 (바닥에 엉덩이 끌며 밀기)',
      '• 항문 주변 핥기·씹기',
      '• 항문 주변 붓거나 붉어짐',
      '• 물고기 냄새 같은 강한 냄새',
      '',
      '【단계별 증상】',
      '1. 항문낭 과충만 (막힘): 불편함, 스쿠팅',
      '2. 항문낭염 (감염): 통증, 발열, 농이 나옴',
      '3. 항문낭 파열: 항문 옆에 구멍이 뚫림 — 즉시 병원',
      '',
      '【처치】',
      '• 충만 시: 병원에서 짜주기 (외부 또는 내부 방법)',
      '• 감염 시: 항생제, 세척',
      '• 반복 재발: 항문낭 절제술 고려',
      '',
      '【예방】',
      '• 비만이면 체중 감량 (항문낭 자연 배출 도움)',
      '• 고섬유 식이 (변이 딱딱하면 배출 더 잘 됨)',
      '',
      '항문 주변에 붓거나 구멍이 보이나요?',
    ].join('\n')
  }

  // ── 개 분리 불안 약물 치료 ──────────────────────────────────────
  if (/분리\s*불안\s*(약|약물|플루옥세틴|세르트랄린|항불안제|트라조돈|클로미프라민)|분리불안\s*(치료\s*약|약\s*먹이|SSRI)/.test(text)) {
    return [
      '💊 분리 불안 약물 치료 안내',
      '',
      '행동 수정과 약물 치료를 병행하는 것이 가장 효과적이에요.',
      '',
      '【약물 치료 대상】',
      '행동 수정만으로 개선이 안 되거나 중증 분리 불안에 권장해요.',
      '',
      '【주요 약물】',
      '● Fluoxetine (프로작)',
      '  • 가장 많이 사용되는 SSRI',
      '  • 효과 발현: 4~8주 (즉각 효과 없음)',
      '  • 장기 복용 가능',
      '',
      '● Clomipramine (클로미칼름)',
      '  • 삼환계 항우울제, 분리 불안 허가 약물',
      '  • 효과: 4~6주',
      '',
      '● Trazodone',
      '  • 상황적 불안에 단기 사용 (이사, 여행 전)',
      '  • 빠른 효과 (1~2시간)',
      '',
      '● Alprazolam (자낙스)',
      '  • 불안이 심할 때 일시적 사용',
      '  • 의존성 주의',
      '',
      '【행동 수정 병행 필수】',
      '약물만으로는 완치 안 됨. 반드시 탈감작 훈련 함께 진행.',
      '',
      '【부작용 모니터】',
      '• SSRI: 초기 식욕·활동 변화, 위장 증상',
      '• 갑자기 중단 금지',
      '',
      '현재 어떤 증상으로 약물 치료를 고려 중인가요?',
    ].join('\n')
  }

  // ── 백신 접종 부작용 / 과민반응 ────────────────────────────────
  if (/백신\s*(부작용|과민\s*반응|알레르기|쇼크|붓기|응급)|예방\s*접종\s*(이후\s*이상|후\s*증상|부작용)|접종\s*(부위\s*붓|얼굴\s*붓|얼굴\s*부어|기운\s*없|다음날)/.test(text)) {
    return [
      '💉 백신 접종 부작용 안내',
      '',
      '백신 후 이상 반응은 대부분 경미하지만, 과민반응은 즉시 대처해야 해요.',
      '',
      '【정상 반응 (24~48시간 내 회복)】',
      '• 접종 당일 기운 없음, 식욕 약간 저하',
      '• 접종 부위 통증·약간 붓기',
      '• 미열',
      '',
      '【경미한 과민반응 (수 시간 내)】',
      '• 얼굴 부종 (두드러기)',
      '• 눈 주변 붓기',
      '• 피부 두드러기·가려움',
      '→ 수의사에게 연락해 항히스타민 투여 여부 확인',
      '',
      '【심각한 아나필락시스 (응급)】',
      '🚨 접종 후 30분~1시간 내 발생 가능:',
      '• 갑작스러운 허탈, 창백한 잇몸',
      '• 구토·설사',
      '• 심한 호흡 곤란',
      '→ 즉시 병원 (에피네프린 투여 필요)',
      '',
      '【접종 후관리 팁】',
      '• 접종 후 15~30분 병원에서 대기 (아나필락시스 모니터)',
      '• 당일 격렬한 운동 피하기',
      '• 과거 과민반응 있었으면 반드시 수의사에게 알리기',
      '',
      '지금 어떤 증상이 나타나고 있나요?',
    ].join('\n')
  }

  // ── 콕시듐증 (Coccidiosis) / 장내 원충 ─────────────────────────
  if (/콕시듐|coccidiosis|원충\s*(감염|설사)|지아르디아\s*(이외|외에)|장내\s*기생충\s*(원충|설사)/.test(text)) {
    return [
      '🦠 콕시듐증 (Coccidiosis) 안내',
      '',
      '강아지와 새끼 고양이에서 설사를 일으키는 원충 감염이에요.',
      '',
      '【콕시듐이란?】',
      'Isospora 등의 장내 원충이 소장에 기생해 설사를 유발해요.',
      '새끼 동물이나 면역 저하된 경우 심각해질 수 있어요.',
      '',
      '【증상】',
      '• 묽은 설사 또는 혈변',
      '• 탈수',
      '• 식욕 저하, 체중 감소',
      '• 구토',
      '• 심한 경우: 생명 위협 (특히 새끼 강아지·고양이)',
      '',
      '【전파】',
      '• 오염된 분변을 통한 경구 감염',
      '• 어미가 보균자인 경우 새끼에게 전파',
      '',
      '【진단】',
      '• 분변 부유법: 오오시스트 확인',
      '• 항원 검사 키트',
      '',
      '【치료】',
      '• Ponazuril (파나쿠어와 다른 약): 1~3일 투약',
      '• Trimethoprim-sulfamethoxazole: 7~14일',
      '• 탈수 심하면 수액 치료',
      '',
      '【환경 관리】',
      '• 오오시스트는 일반 소독제에 내성 → 스팀 청소 효과적',
      '• 분변 즉시 제거',
      '',
      '강아지 나이가 몇 살이고, 설사가 어느 정도인가요?',
    ].join('\n')
  }

  // ── 개 노령 인지 기능 장애 (CDS / 치매) ─────────────────────────
  if (/노령\s*(치매|인지\s*기능|CDS|인지장애)|개\s*치매|밤에\s*(울부짖|짖어|배회|비명)|노견\s*(이상\s*행동|치매|배회|방향\s*감각)/.test(text)) {
    return [
      '🧠 개 인지 기능 장애 증후군 (CDS) 안내',
      '',
      '노령견이 밤에 울거나 배회한다면 치매 증상일 수 있어요.',
      '',
      '【CDS란?】',
      '사람의 알츠하이머와 유사한 뇌 퇴화로 행동·인지 변화가 나타나요.',
      '11세 이상 개의 약 50%에서 증상 나타남.',
      '',
      '【DISHAA 증상 체크리스트】',
      '□ D (Disorientation): 방향 감각 상실, 집 안에서 헤맴',
      '□ I (Interaction 변화): 사람·동물과 상호작용 감소 또는 증가',
      '□ S (Sleep 변화): 낮에 자고 밤에 울거나 배회',
      '□ H (House-soiling): 배변 훈련 무너짐',
      '□ A (Activity 변화): 무기력 또는 반복 행동',
      '□ A (Anxiety 증가): 불안, 예민함',
      '',
      '【진단】',
      '• 다른 질환 배제 (갑상선저하, 신부전, 통증, 청력 저하 등)',
      '• 행동 변화 설문',
      '',
      '【치료 및 관리】',
      '■ 약물',
      '• Anipryl (selegiline): 유일하게 허가된 CDS 약',
      '• Melatonin: 수면 패턴 개선',
      '',
      '■ 식이·영양 보조제',
      '• 오메가-3 (DHA): 뇌 건강',
      '• 항산화제 (비타민E, C)',
      '• 처방식: Hills b/d (Brain aging care)',
      '',
      '■ 환경',
      '• 규칙적인 생활 패턴 유지',
      '• 밤에 빛 밝혀두기',
      '• 장난감·냄새 자극',
      '',
      '밤에 울거나 배회하는 것이 언제부터 시작됐나요?',
    ].join('\n')
  }

  // ── 개 요로 막힘 (드문 경우) / 고양이 요로 막힘 비교 ────────────
  if (/개\s*(요로\s*막힘|소변\s*못\s*눔|소변\s*안\s*나옴)|수컷\s*개\s*(소변|오줌)\s*(안\s*나오|막힘|줄줄)|방광\s*결석\s*막힘/.test(text)) {
    return [
      '🚨 개 소변 막힘 응급 안내',
      '',
      '개에서 소변이 안 나온다면 즉시 병원으로 가세요.',
      '',
      '【개 vs 고양이 요로 막힘】',
      '• 고양이 (수컷): 요도가 좁아 플러그·결석으로 자주 막힘',
      '• 개 (수컷): 요도가 상대적으로 넓어 덜 흔하지만, 결석 또는 종양으로 막힘 가능',
      '',
      '【증상 (막힘)】',
      '• 소변 자세를 반복하지만 나오지 않음',
      '• 복통 (만지면 아파함)',
      '• 무기력, 식욕 없음',
      '• 구토',
      '• 배가 단단하게 부풀어오름',
      '',
      '【원인 (개에서)】',
      '• 방광·요도 결석 (칼슘 옥살산 결석 → X-ray에 잘 보임)',
      '• 요도 종양 (TCC — 전이성 방광암)',
      '• 전립선 비대 (중성화 안 된 수컷)',
      '',
      '【응급 처치】',
      '• 즉시 병원 → 카테터로 요도 개통',
      '• 24시간 이상 방치 시: 방광 파열, 요독증으로 사망',
      '',
      '지금 소변 자세를 취하고 있나요?',
    ].join('\n')
  }

  // ── 임신·출산 / 새끼 돌봄 ────────────────────────────────────────
  if (/임신\s*(기간|확인|징후|검사|개|고양이)|출산\s*(준비|징후|언제|이상)|분만\s*(진통|어려움|응급|난산)|새끼\s*(돌봄|몇마리|개월|수유)/.test(text)) {
    return [
      '🤱 임신·출산·새끼 돌봄 안내',
      '',
      '반려동물의 임신과 출산을 이해해두면 응급 상황에 대비할 수 있어요.',
      '',
      '【임신 기간】',
      '• 개: 약 63일 (57~68일)',
      '• 고양이: 약 65일 (63~67일)',
      '',
      '【임신 확인 방법】',
      '• 초음파: 25~30일에 태아 확인 가능 (심장 박동)',
      '• X-ray: 45일 이후 (뼈 형성)',
      '• 복부 촉진: 경험 있는 수의사',
      '',
      '【출산 전 징후】',
      '• 체온 1도 이상 떨어짐 (37도 이하)',
      '• 둥지 만들기 행동',
      '• 식욕 저하',
      '• 불안, 헐떡임',
      '',
      '【정상 출산 진행】',
      '• 새끼 간 간격: 보통 30분~1시간 이내',
      '⚠️ 2시간 이상 힘주는데 새끼 안 나오면 난산 응급',
      '',
      '【난산 응급 신호】',
      '🚨 즉시 병원:',
      '• 진통 30분 이상인데 새끼 미출산',
      '• 녹색 분비물이 새끼 없이 나옴',
      '• 어미가 지쳐 힘 못 줌',
      '',
      '【신생아 케어】',
      '• 모유 수유: 가능한 한 최대한 (초유 중요)',
      '• 체온 유지: 30~32도 환경',
      '• 배변 자극: 배·항문 닦아줌 (어미가 함)',
      '',
      '현재 몇 주차이고, 어떤 증상이 있나요?',
    ].join('\n')
  }

  // ── 폐렴 (개·고양이) ─────────────────────────────────────────────
  if (/폐렴\s*(증상|원인|치료|진단|개|고양이)|폐\s*(감염|염증|X.?ray)|흡인성\s*폐렴|폐\s*(이상\s*소견|음영|흰색)/.test(text)) {
    return [
      '🫁 폐렴 안내',
      '',
      '폐렴은 조기 치료가 중요해요.',
      '',
      '【폐렴 종류】',
      '■ 세균성 폐렴: 가장 흔함',
      '• 원인균: Bordetella, Pasteurella, E.coli 등',
      '• 원발성 또는 바이러스 감염 이후 2차 세균 감염',
      '',
      '■ 흡인성 폐렴: 음식·역류물 흡인',
      '• 위험 요소: 구토, 마취 후, 음수 장애',
      '• 단두종에서 흔함',
      '',
      '■ 진균성 폐렴: 면역 저하 동물',
      '',
      '【증상】',
      '• 기침 (습한 기침)',
      '• 빠른 호흡, 호흡 노력 증가',
      '• 발열',
      '• 무기력, 식욕 저하',
      '• 청색증 (산소 부족 → 잇몸 파랗게)',
      '',
      '【진단】',
      '• 흉부 X-ray: 폐 음영 증가 (뿌옇게)',
      '• CBC: 백혈구 증가 (감염 반응)',
      '• 기관지 세척액 배양',
      '',
      '【치료】',
      '• 항생제: 아목시실린-클라불라네이트, 독시사이클린',
      '• 산소 치료 (입원 중)',
      '• 기관지확장제, 네불라이저 치료',
      '• 흉부 물리치료 (쿠핑 마사지)',
      '',
      '호흡이 빠르거나 힘들어 보이나요?',
    ].join('\n')
  }

  // ── 개 기관 허탈 (Tracheal Collapse) ───────────────────────────
  if (/기관\s*(허탈|붕괴|협착|collaps)|거위\s*(기침|소리)|꽥꽥\s*(기침|소리)|기침\s*(소리\s*특이|거위|꽥꽥|반복)|기관지\s*(허탈|협착)/.test(text)) {
    return [
      '🐕 기관 허탈 (Tracheal Collapse) 안내',
      '',
      '거위 울음 같은 기침을 한다면 기관 허탈을 의심해요.',
      '',
      '【기관 허탈이란?】',
      '기관 (숨통)의 연골이 약해져 기도가 납작하게 눌리는 질환이에요.',
      '특히 흥분하거나 목줄을 당길 때 심해져요.',
      '',
      '【주로 걸리는 품종】',
      '요크셔 테리어, 포메라니안, 치와와, 몰티즈, 토이 푸들 (소형견)',
      '',
      '【증상】',
      '• 거위 소리 기침 (Goose honk 기침)',
      '• 흥분하거나 운동 후 악화',
      '• 더운 날씨에 악화',
      '• 심한 경우: 청색증, 실신',
      '',
      '【등급 (Grade 1~4)】',
      '• Grade 1~2: 기도 25~50% 허탈 — 내과 치료',
      '• Grade 3~4: 기도 75~100% 허탈 — 수술 고려',
      '',
      '【내과 치료】',
      '• 기관지확장제 (테오필린, 터부탈린)',
      '• 기침 억제제 (부토르파놀)',
      '• 스테로이드 (단기, 염증 시)',
      '• 체중 감량: 가장 효과적인 관리',
      '• 하네스 착용 (목줄 → 하네스로 전환 필수)',
      '',
      '【외과 치료】',
      '• 기관 스텐트 삽입 (내시경적)',
      '• 기관 연골 링 외부 고정',
      '',
      '목줄을 하네스로 바꿨나요?',
    ].join('\n')
  }

  // ── 개 코 분비물 / 비강 문제 ────────────────────────────────────
  if (/코\s*(분비물|콧물|피\s*섞인|피\s*코|딱지|흐르는\s*코|막힘|한쪽\s*코)|비강\s*(종양|이상|분비물|용종)|콧속\s*(혹|이상)/.test(text)) {
    return [
      '👃 코 분비물·비강 문제 안내',
      '',
      '코에서 분비물이 나온다면 분비물 특성으로 원인을 좁힐 수 있어요.',
      '',
      '【분비물 종류별 원인】',
      '● 맑은 콧물',
      '  • 바이러스성 감염 초기',
      '  • 알레르기',
      '  • 이물질',
      '',
      '● 노란·녹색 콧물 (화농성)',
      '  • 세균성 감염',
      '  • 비강 이물질 → 2차 감염',
      '  • 비강 아스페르길루스증 (곰팡이)',
      '',
      '● 피 섞인 분비물 (혈성)',
      '  • 비강 종양 (특히 한쪽 콧구멍)',
      '  • 외상',
      '  • 비강 이물질',
      '  • 혈액 응고 장애',
      '',
      '【한쪽 vs 양쪽 구분이 중요해요】',
      '• 한쪽 콧구멍만: 종양·이물질·용종 의심',
      '• 양쪽 콧구멍: 감염·알레르기 가능성',
      '',
      '【진단】',
      '• 비강 내시경 (rhinoscopy)',
      '• 비강 세포 검사 / 배양',
      '• CT: 비강 내부 정확한 평가',
      '',
      '코 분비물이 한쪽인가요, 양쪽인가요?',
    ].join('\n')
  }

  // ── 고양이 갑상선기능항진증 방사성 요오드 치료 ──────────────────
  if (/방사성\s*요오드|I-131|I131|갑상선\s*(방사성\s*치료|방사선\s*치료)|갑항\s*(방사성|방사선|치료\s*방법)|고양이\s*갑상선\s*(수술|방사선)/.test(text)) {
    return [
      '☢️ 고양이 갑상선기능항진증 — 방사성 요오드 치료 안내',
      '',
      '방사성 요오드(I-131)는 갑상선기능항진증의 가장 이상적인 완치 방법이에요.',
      '',
      '【I-131 치료란?】',
      '방사성 요오드를 주사하면 갑상선 조직에만 흡수되어',
      '과증식된 갑상선 세포를 파괴해요. 다른 조직 영향 최소화.',
      '',
      '【장점】',
      '• 완치율 95% 이상',
      '• 평생 약 복용 불필요 (일부는 갑상선저하로 보충 필요)',
      '• 수술 위험 없음',
      '• 1회 처치로 효과',
      '',
      '【단점·제한】',
      '• 방사성 격리 필요 (치료 후 2~4주)',
      '• 국내 시행 가능한 병원 제한적',
      '• 비용 (수십만~수백만 원)',
      '• 신부전이 숨어 있던 경우: 치료 후 신부전 나타날 수 있음',
      '',
      '【치료 전 신부전 가려내기 중요!】',
      'GFR 측정 (iohexol clearance 또는 SDMA)',
      '갑상선 약으로 먼저 갑상선 조절 → 신기능 재평가 후 결정',
      '',
      '【다른 치료 옵션 비교】',
      '• 약물 (메티마졸): 평생 복용, 부작용 있음',
      '• 수술: 완치 가능하지만 위험 있음',
      '• I-131: 완치율 최고, 비용·격리 부담',
      '',
      '신기능 검사(BUN, Creatinine, SDMA)를 해보셨나요?',
    ].join('\n')
  }

  // ── 허리 디스크 수술 vs 보존 치료 선택 ─────────────────────────
  if (/디스크\s*(수술\s*여부|수술\s*해야|수술\s*vs|보존\s*치료|언제\s*수술|수술\s*결정)|IVDD\s*(수술|치료\s*선택)|척추\s*(수술\s*여부|수술\s*해야)/.test(text)) {
    return [
      '🦴 디스크 수술 vs 보존 치료 선택 가이드',
      '',
      '디스크 치료법 선택은 신경 증상 등급이 핵심이에요.',
      '',
      '【신경 증상 등급 (Frankel Scale)】',
      '1등급: 통증만 (비틀거림 없음)',
      '2등급: 뒷다리 힘 약함 (보행 가능하지만 불안정)',
      '3등급: 보행 불가, 자발 배변 가능',
      '4등급: 보행 불가, 배변·배뇨 기능 상실',
      '5등급: 통증 감각 없음 (마비 완전)',
      '',
      '【보존 치료 선택 기준】',
      '• 1~2등급: 케이지 레스트 + 약물 (성공률 85~95%)',
      '• 단, 재발 빈번함 (재발 시 수술 강력 권고)',
      '',
      '【수술 선택 기준】',
      '• 3등급 이상: 수술 강력 권장',
      '• 4등급: 수술 후 60~80% 회복',
      '• 5등급: 빠를수록 좋음 — 48시간 내 수술하면 50%+ 회복',
      '  ⚠️ 48시간 지나면 회복률 급감',
      '',
      '【수술 방법】',
      '• Hemilaminectomy: 가장 흔한 흉추·요추 디스크 수술',
      '• Ventral Slot: 경추 디스크 수술',
      '',
      '【보존 치료 프로토콜】',
      '• 절대 케이지 레스트: 4~6주 (산책 금지)',
      '• NSAIDs 또는 스테로이드 (동시 사용 금지)',
      '• 가바펜틴 (통증·신경 안정)',
      '',
      '현재 걸을 수 있나요, 없나요?',
    ].join('\n')
  }

  // ── 신장 결석 / 요관 결석 (고양이·개) ──────────────────────────
  if (/신장\s*(결석|돌)|요관\s*(결석|돌|막힘)|ureteral\s*obstruction|요관\s*(폐색|폐쇄)|UO\s*(고양이|개)/.test(text)) {
    return [
      '🚨 신장·요관 결석 안내',
      '',
      '요관 결석은 한쪽 또는 양쪽 신장 기능을 갑자기 망가뜨릴 수 있어요.',
      '',
      '【신장 결석 vs 요관 결석】',
      '• 신장 결석 자체: 증상 없는 경우 많음 (우연 발견)',
      '• 요관 결석: 요관 막히면 급성 신부전 — 응급',
      '',
      '【고양이 요관 결석 (UO) — 매우 흔한 응급】',
      '• 원인: 옥살산 칼슘 결석 (고양이 신장 결석 80%)',
      '• 증상: 구토, 무기력, 식욕 저하, 신장 통증',
      '  (소변은 나올 수 있어서 방광 막힘과 혼동 주의)',
      '',
      '【치료 (고양이 UO)】',
      '■ 내과 (경미한 경우)',
      '• 수액 → 소변량 증가로 결석 자연 이동 유도',
      '• 성공률 낮음 (24~48시간 내 결정)',
      '',
      '■ 외과·시술',
      '• SUB (Subcutaneous Ureteral Bypass): 요관 우회 장치 삽입',
      '  → 고양이 UO 표준 치료로 자리잡음',
      '• 요관절개술: 결석 직접 제거',
      '',
      '【개 요관 결석】',
      '• 고양이보다 드물고, 크기가 크면 수술',
      '• 레이저 쇄석술 (체외충격파) 가능한 병원도 있음',
      '',
      '신장 수치 (BUN, Creatinine)가 어떻게 나왔나요?',
    ].join('\n')
  }

  // ── 행동 문제 — 고양이 공격성 ──────────────────────────────────
  if (/고양이\s*(공격성|공격\s*행동|무는|할퀴는|갑자기\s*공격|사람\s*공격|사냥\s*행동\s*사람)|고양이\s*(갑자기\s*무는|갑자기\s*할퀴)/.test(text)) {
    return [
      '🐱 고양이 공격성 관리 안내',
      '',
      '고양이 공격 행동은 종류에 따라 대처법이 달라요.',
      '',
      '【고양이 공격성 유형】',
      '■ 놀이 공격성 (가장 흔함, 특히 어린 고양이)',
      '• 사냥 본능이 사람 발·손에 향함',
      '• 해결: 충분한 장난감 놀이, 손·발로 직접 놀아주지 않기',
      '',
      '■ 공포 공격성',
      '• 겁먹거나 구석에 몰렸을 때',
      '• 눈 피하기, 낮은 자세 취하기, 선택지 주기',
      '',
      '■ 전이 공격성 (Redirected Aggression)',
      '• 창밖 고양이 보고 흥분 → 옆에 있는 사람을 공격',
      '• 흥분한 상태의 고양이에게 접근하지 않기',
      '',
      '■ 쓰다듬기 유발 공격성',
      '• 쓰다듬다가 갑자기 무는 행동',
      '• 고양이의 경고 신호 읽기: 꼬리 탁탁, 귀 뒤로',
      '• 허용 쓰다듬기 횟수 존중',
      '',
      '■ 통증 관련 공격성',
      '• 특정 부위 만지면 무는 경우 → 통증 원인 확인 먼저',
      '',
      '【공통 대처 원칙】',
      '• 절대 처벌하지 않기 (신뢰 무너짐)',
      '• 공격 직전 신호(꼬리, 귀, 동공) 읽기',
      '• 충분한 사냥 놀이 (하루 2~3회)',
      '',
      '어떤 상황에서 공격하나요?',
    ].join('\n')
  }

  // ── 중성화 수술 최적 시기 ───────────────────────────────────────
  if (/중성화\s*(언제|시기|몇\s*개월|몇\s*살|적절한\s*시기|빨리|최적)|중성화\s*수술\s*(나이|좋은\s*시기|권장|스케줄)/.test(text)) {
    return [
      '✂️ 중성화 수술 최적 시기 안내',
      '',
      '품종과 성별에 따라 최적 시기가 달라져요.',
      '',
      '【전통적 권장 (일반 소형견·고양이)】',
      '• 생후 6개월 (첫 발정 전)',
      '• 유선종양 예방 효과: 첫 발정 전 중성화 시 매우 낮은 위험',
      '',
      '【대형견 재고 논의】',
      '최근 연구에서 대형견 조기 중성화(6개월 미만)가',
      '골육종, 골관절염, 비만 위험 증가와 연관됨.',
      '• 골든리트리버: 수컷 1~2년, 암컷 첫 발정 후',
      '• 래브라도: 수컷 1년, 암컷 첫 발정 후',
      '',
      '【고양이】',
      '• 4~6개월이 일반적으로 권장',
      '• 첫 발정 전에 해야 유선종양 예방 효과 가장 큼',
      '',
      '【중성화의 장점】',
      '• 암컷: 유선종양, 자궁축농증, 난소종양 예방',
      '• 수컷: 전립선 비대, 고환 종양, 항문주위선종 예방',
      '• 유기동물 문제 감소',
      '',
      '【중성화의 단점/고려사항】',
      '• 비만 경향 증가 (열량 조절 필요)',
      '• 대형견 특정 정형외과 질환 위험 증가 가능',
      '• 무기력증: 일시적, 장기적으로 정상',
      '',
      '현재 몇 살이고, 어떤 품종인가요?',
    ].join('\n')
  }

  // ── 고양이 FeLV (고양이 백혈병 바이러스) ──────────────────────
  if (/FeLV|고양이\s*(백혈병|백혈병\s*바이러스)|feline\s*leukemia|FeLV\s*(양성|감염|예방|관리|수명)/.test(text)) {
    return [
      '🐱 고양이 백혈병 바이러스 (FeLV) 안내',
      '',
      'FeLV는 고양이에서 가장 위험한 전파성 바이러스 중 하나예요.',
      '',
      '【FeLV란?】',
      '레트로바이러스로 면역 억제와 종양(림프종·백혈병) 유발.',
      '',
      '【전파 경로】',
      '• 주로 감염 고양이의 침(그루밍, 밥그릇 공유)',
      '• 물림, 수혈',
      '• 어미 → 태아 (수직 전파 가능)',
      '',
      '【감염 결과 (3가지)】',
      '1. 완전 회복·바이러스 제거: 약 30~40% (면역 강한 경우)',
      '2. 잠복 감염: 바이러스 숨어 있다 재활성화 가능',
      '3. 진행성 감염: 면역 억제, 종양 발생 → 평균 2~3년 생존',
      '',
      '【증상】',
      '• 초기: 발열, 림프절 비대',
      '• 진행: 빈혈, 반복 감염, 체중 감소',
      '• 림프종 발생 (고양이 림프종 원인의 20%)',
      '',
      '【FeLV 양성 고양이 관리】',
      '• 실내 전용 (다른 고양이 전파 방지)',
      '• 6개월마다 혈액 검사·바이러스 모니터링',
      '• 예방접종 계속 유지',
      '• 스트레스 최소화',
      '',
      '【예방】',
      '• FeLV 백신 (고위험군 권장)',
      '• 외출 고양이·다묘 가정에 특히 중요',
      '',
      '현재 증상이 있나요?',
    ].join('\n')
  }

  // ── 수컷 고양이 중성화 후 요도 협착 ─────────────────────────────
  if (/요도\s*(협착|좁아짐|재막힘|반복\s*막힘)|perineal\s*urethrostomy|PU\s*(수술|시술)|요도\s*형성\s*수술|음경\s*절제/.test(text)) {
    return [
      '🏥 요도 협착·요도 형성 수술 (PU) 안내',
      '',
      '반복적으로 요도가 막히는 수컷 고양이에게 권장할 수 있는 수술이에요.',
      '',
      '【요도 협착이란?】',
      '요도가 좁아져 소변이 자주 막히는 상태예요.',
      '플러그·결석 제거 후에도 반복 발생하는 경우 발생해요.',
      '',
      '【PU (회음부 요도 형성술) 수술이란?】',
      '수컷 고양이의 좁은 원위부 요도(음경 끝)를 제거하고',
      '넓은 요도 부분을 외부로 개구 시켜 막힘을 예방해요.',
      '',
      '【수술 적응증】',
      '• 반복(2회 이상) 요도 막힘',
      '• 요도 협착 (흉터로 인한 구조적 협착)',
      '• 요도 결손 (외상)',
      '',
      '【수술 후 주의사항】',
      '• 수술 직후 피 섞인 소변 정상',
      '• 이 카라 착용 (핥기 방지 필수)',
      '• 수술 부위 젖지 않게 유지',
      '• 습식 사료 전환 권장',
      '',
      '【합병증】',
      '• 협착 재발 (드물게)',
      '• 요실금 (드물게)',
      '• 감염',
      '',
      '요도가 막힌 것이 이번이 몇 번째인가요?',
    ].join('\n')
  }

  // ── 고양이 변비 vs 거대결장 심층 ──────────────────────────────
  if (/거대\s*결장|megacolon|고양이\s*(변비\s*(심한|반복|만성)|변\s*(안\s*나오|못\s*싸|여러날))|관장\s*(고양이|필요|병원)/.test(text)) {
    return [
      '🐱 고양이 거대결장 안내',
      '',
      '만성 변비가 반복되면 거대결장으로 악화될 수 있어요.',
      '',
      '【거대결장이란?】',
      '결장이 늘어나 변이 고인 채 배출 능력을 잃어버리는 상태예요.',
      '만성 변비가 반복될수록 결장이 늘어나고 회복 어려워져요.',
      '',
      '【단계별 구분】',
      '1. 단순 변비 (Constipation): 초기 — 식이·수분 조절로 해결 가능',
      '2. 배변 곤란 (Obstipation): 약물 치료 필요',
      '3. 거대결장 (Megacolon): 심한 경우 수술 (대장 아전절제술)',
      '',
      '【증상】',
      '• 3일 이상 대변 없음',
      '• 화장실을 오래 앉아 있지만 배변 없음',
      '• 딱딱하고 건조한 소량 변 (또는 혈변)',
      '• 구토, 식욕 저하',
      '• 배 만지면 딱딱한 변 느껴짐',
      '',
      '【치료】',
      '■ 내과',
      '• 락툴로스 (osmotic laxative)',
      '• 미소프로스톨 (장 운동 자극)',
      '• 병원 관장 (심한 경우)',
      '• 수액 (탈수 교정)',
      '',
      '■ 외과 (심한 거대결장)',
      '• 대장 아전절제술 (subtotal colectomy)',
      '• 수술 후 설사 경향 → 이후 정상화',
      '',
      '마지막 배변이 언제였나요?',
    ].join('\n')
  }

  // ── 구강 종양 / 악성 흑색종 / 편평상피암 ───────────────────────
  if (/구강\s*(종양|암|흑색종|편평상피암|섬유육종)|입\s*(안\s*종양|혹|암)|잇몸\s*(종양|혹|검은색|이상)|흑색종\s*(구강|입)/.test(text)) {
    return [
      '🦷 구강 종양 안내',
      '',
      '구강 종양은 일찍 발견할수록 치료 예후가 좋아요.',
      '',
      '【개 구강 종양 (흔한 것)】',
      '1. 악성 흑색종 (Malignant Melanoma)',
      '   • 가장 흔한 개 구강 악성 종양',
      '   • 검거나 색소 없는 병변, 빠른 전이',
      '   • 예후 불량 (전이 속도 빠름)',
      '',
      '2. 편평상피암 (Squamous Cell Carcinoma, SCC)',
      '   • 잇몸·혀·편도에서 발생',
      '   • 국소 침습 강하나 전이는 느린 편',
      '',
      '3. 섬유육종 (Fibrosarcoma)',
      '   • 잇몸·구개 등에 발생',
      '   • 전이 적지만 국소 재발 많음',
      '',
      '【고양이 구강 종양】',
      '• SCC (편평상피암): 가장 흔함',
      '• 혀 아래, 잇몸에 주로 발생',
      '• 예후 매우 불량 (대부분 1년 미만)',
      '',
      '【조기 발견 신호】',
      '• 입 냄새 갑자기 심해짐',
      '• 한쪽으로만 씹음',
      '• 잇몸·입 안 이상한 혹 또는 색 변화',
      '• 침을 많이 흘림, 피 섞인 침',
      '',
      '【치료】',
      '• 수술 + 방사선 (+ 항암 — 흑색종)',
      '• 흑색종 백신 (개, 미국 허가) 면역 치료',
      '',
      '이상한 부위가 어디에 있나요?',
    ].join('\n')
  }

  // ── 위장관 이물 — 내시경 vs 수술 ───────────────────────────────
  if (/이물\s*(내시경|수술|제거\s*방법)|이물\s*(내시경으로|수술로)\s*(뺄|제거)|위장\s*이물\s*(치료|방법)|먹은\s*(것|물건)\s*(제거|어떻게)/.test(text)) {
    return [
      '🏥 이물 제거 — 내시경 vs 수술 선택 가이드',
      '',
      '이물 제거 방법은 위치와 종류에 따라 달라요.',
      '',
      '【내시경으로 제거 가능한 경우】',
      '• 식도 또는 위에 있는 이물',
      '• 날카롭지 않은 물체',
      '• 위에서 24~48시간 이상 지나지 않은 경우',
      '• 독성 물질이 아닌 경우',
      '',
      '【수술이 필요한 경우】',
      '• 소장·대장으로 이동한 이물',
      '• 날카로운 물체 (파열 위험)',
      '• 장 폐색 (장이 막힌 증상: 반복 구토, 복통)',
      '• 식도·위 천공 의심',
      '• 내시경으로 꺼내기 어려운 크기·모양',
      '',
      '【응급 신호 (즉시 병원)】',
      '🚨 이물 삼킨 후:',
      '• 구토가 계속되고 기운 없음',
      '• 배를 만지면 통증',
      '• 호흡 곤란 (식도 막힘 가능성)',
      '• 혈변, 흑변',
      '',
      '【X-ray가 보여주는 것】',
      '• 금속·뼈: 잘 보임',
      '• 고무·플라스틱: 잘 안 보임 → 바륨 조영 또는 초음파',
      '',
      '어떤 것을 먹었고, 언제 먹었나요?',
    ].join('\n')
  }

  // ── 피부 종양 종류 / 지방종 vs 악성 구별 ────────────────────────
  if (/피부\s*(종양|혹\s*종류|덩어리\s*종류)|지방종\s*(악성|구별|조직검사|언제\s*걱정)|혹\s*(지방|악성|양성\s*구별|종류)|lipoma/.test(text)) {
    return [
      '🔬 피부 종양 종류 및 구별 안내',
      '',
      '피부에 혹이 생기면 세침흡인검사(FNA)로 먼저 확인해요.',
      '',
      '【양성 종양】',
      '● 지방종 (Lipoma): 가장 흔한 피하 혹',
      '  • 부드럽고 이동 가능, 천천히 자람',
      '  • 노령 개에서 흔함',
      '  • 대부분 경과 관찰 (침습성 지방종은 수술)',
      '',
      '● 낭종 (Cyst): 피지·표피 낭종',
      '  • 내용물: 흰색 치즈 같은 물질',
      '  • 터지면 감염 위험 → 수술 제거 권장',
      '',
      '● 유두종 (Papilloma): 바이러스성 사마귀',
      '  • 어린 개 → 자연 회복 가능',
      '  • 입 안 유두종: 음식 먹기 힘들면 제거',
      '',
      '【악성 종양 (주의)】',
      '● 비만세포종: 크기 변하거나 붉어지거나 부어오름',
      '● 편평상피암: 흰 딱지·궤양 형태',
      '● 혈관주위육종: 빠르게 커지는 붉은 혹',
      '',
      '【걱정해야 하는 혹의 특징】',
      '• 빠르게 커짐 (1개월에 10% 이상)',
      '• 딱딱하게 고정됨',
      '• 궤양이 생기거나 출혈',
      '• 색이 검거나 붉음',
      '',
      '혹이 생긴 지 얼마나 됐고, 크기가 어떻게 변했나요?',
    ].join('\n')
  }

  // ── 신생아·어린 강아지 저혈당 응급 ─────────────────────────────
  if (/강아지\s*(저혈당|혈당\s*낮|저혈당\s*응급)|toy\s*(breed|품종)\s*(저혈당)|어린\s*(강아지|새끼)\s*(쓰러짐|경련|힘없어|저혈당)|puppy\s*hypoglycemia/.test(text)) {
    return [
      '🚨 어린 강아지 저혈당 응급 안내',
      '',
      '소형·토이 품종 어린 강아지에서 자주 발생하는 응급이에요.',
      '',
      '【저혈당 발생 이유】',
      '• 어린 강아지는 간의 글리코겐 저장 능력이 낮음',
      '• 밥을 굶거나 운동·스트레스 후 급격히 혈당 떨어짐',
      '• 특히 치와와, 요크셔 테리어, 포메라니안에서 흔함',
      '',
      '【증상】',
      '• 기운 없음, 떨림',
      '• 비틀거림, 경련',
      '• 쓰러짐, 의식 저하',
      '',
      '【집에서 즉시 할 수 있는 응급 처치】',
      '1. 꿀 또는 설탕물 (포도당 시럽)을 잇몸에 바르기',
      '2. 의식이 있으면 꿀을 핥게 하기',
      '3. 즉시 따뜻하게 유지 (저체온 동반 가능)',
      '4. 바로 병원 이동',
      '',
      '⚠️ 경련 중에는 억지로 입에 넣지 마세요 (흡인 위험)',
      '',
      '【예방】',
      '• 하루 4~5회 소량씩 급식',
      '• 공복 2시간 이상 피하기',
      '• 과도한 놀이·운동 후 간식 제공',
      '',
      '현재 의식이 있나요?',
    ].join('\n')
  }

  // ── 포도·건포도 중독 / 초콜릿 중독 / 자일리톨 ────────────────
  if (/포도\s*(먹었|먹은|중독|위험)|건포도\s*(먹었|먹은|위험)|초콜릿\s*(먹었|먹은|중독)|자일리톨\s*(먹었|먹은|중독|껌)/.test(text)) {
    return [
      '🚨 독성 식품 섭취 응급 안내',
      '',
      '개에서 특히 위험한 식품들이에요. 즉시 병원으로 가세요!',
      '',
      '【포도·건포도 (개에서 매우 위험)】',
      '🚨 소량도 신부전 유발 가능',
      '• 증상: 구토, 무기력, 복통, 소변 감소 (12~24시간 내)',
      '• 처치: 즉시 구토 유도 (병원에서) + 수액 치료',
      '• 주의: 안전 용량이 없음 — 어떤 양도 위험',
      '',
      '【초콜릿 (개·고양이 위험)】',
      '테오브로민 함량이 많을수록 위험:',
      '• 다크 초콜릿 > 밀크 초콜릿 > 화이트 초콜릿',
      '• 증상: 구토, 설사, 빠른 심박, 경련',
      '• 처치: 섭취 2시간 내 구토 유도 (병원)',
      '',
      '【자일리톨 (개에서 매우 위험)】',
      '🚨 껌·사탕·일부 약·땅콩버터에 포함',
      '• 저혈당 + 간 독성',
      '• 증상: 구토, 비틀거림, 발작 (30분~12시간 내)',
      '• 즉시 병원 — 진행 매우 빠름',
      '',
      '【구토 유도 주의】',
      '• 집에서 임의로 구토 유도하는 것 위험 (흡인성 폐렴)',
      '• 의식 없거나 경련 중: 구토 유도 금지',
      '• 병원에서 과산화수소 또는 아포몰핀으로 안전하게',
      '',
      '얼마나 먹었고, 먹은 지 얼마나 됐나요?',
    ].join('\n')
  }

  // ── 개 비뇨기 감염 / 방광염 반복 원인 ──────────────────────────
  if (/방광염\s*(반복|자꾸\s*재발|원인|왜\s*반복)|개\s*(요로\s*감염|방광염\s*원인)|UTI\s*(개|반복|재발)|소변\s*(냄새|탁함|혼탁)/.test(text)) {
    return [
      '🔬 개 방광염·요로 감염 반복 원인 안내',
      '',
      '방광염이 반복된다면 숨겨진 원인이 있을 수 있어요.',
      '',
      '【일반적 방광염 vs 반복성 방광염】',
      '• 일반 방광염: 항생제로 쉽게 해결',
      '• 반복성 (월 1회 이상 또는 치료 후 1개월 내 재발): 원인 탐색 필요',
      '',
      '【반복 방광염의 숨겨진 원인】',
      '1. 방광 결석: 결석이 세균 온상 역할',
      '2. 방광 종양 (TCC): 개 방광암 — 50세 이상 암컷에서',
      '3. 해부학적 이상: 외음부 함몰 (암컷), 요도 기형',
      '4. 쿠싱·당뇨: 면역 저하로 반복 감염',
      '5. 항생제 내성 세균: 배양·감수성 검사 필요',
      '',
      '【진단 방향】',
      '• 소변 배양·감수성 검사 (항생제 선택에 필수)',
      '• 방광 초음파: 결석·용종·종양 확인',
      '• X-ray: 결석 위치',
      '• 혈액 검사: 면역 저하 원인 배제',
      '',
      '【치료 원칙】',
      '• 배양 결과에 맞는 항생제 선택 (추측 금지)',
      '• 충분한 기간 (10~14일 이상)',
      '• 원인 질환 동시 치료',
      '',
      '방광염이 얼마나 자주 재발하나요?',
    ].join('\n')
  }

  // ── 위경련 / 위 운동성 장애 ─────────────────────────────────────
  if (/위\s*(경련|경련성|운동성\s*장애|motility|운동\s*기능)|역류성\s*식도염|GERD|식도\s*(역류|염증)|위산\s*(역류|과다)/.test(text)) {
    return [
      '🤢 위 운동성 장애·역류성 식도염 안내',
      '',
      '식후 역류나 반복 구역질은 위 운동성 문제일 수 있어요.',
      '',
      '【위 운동성 장애 (Gastroparesis)】',
      '• 위가 정상적으로 비워지지 않는 상태',
      '• 증상: 식후 구역질, 부풀어오름, 빠르게 배부름',
      '• 원인: 자율신경 손상, 갑상선저하증, 전해질 이상',
      '',
      '【역류성 식도염 (GERD)】',
      '• 위산이 식도로 역류해 염증',
      '• 증상: 공복 시 풀 핥기, 역구역질, 걸쭉한 노란 액 토함',
      '• 특히 아침 공복 시 역류 → "밥 주면 나아짐"',
      '',
      '【풀 핥기와 역류의 관계】',
      '역류성 식도염이 있으면 위가 불편해 풀을 뜯어 먹으려 해요.',
      '무작정 먹지 않게 하기보다 역류 원인 치료가 중요해요.',
      '',
      '【치료】',
      '• 오메프라졸 (PPI): 위산 억제',
      '• 마로피탄트 (Cerenia): 오심·구역 억제',
      '• 소량 자주 급식: 위 과팽창 방지',
      '• 식후 30분 운동 금지 (역류 유발)',
      '',
      '식사 후 바로 토하나요, 시간이 지나서 토하나요?',
    ].join('\n')
  }

  // ── 다리 마비·발 질질 끄는 증상 ────────────────────────────────
  if (/발\s*(질질\s*끎|질질\s*끌어|질질끌|뒷발\s*질질|나풀거림)|뒷다리\s*(마비|힘\s*없음|끔|끔끔|죽음)|너클링|knuckling/.test(text)) {
    return [
      '🚨 뒷다리 질질 끌기·너클링 안내',
      '',
      '발을 질질 끌거나 발등으로 걷는다면 신경 손상 신호예요.',
      '',
      '【너클링이란?】',
      '발바닥이 아닌 발등으로 걷는 행동. 위치 감각(고유수용성) 이상 신호.',
      '',
      '【원인별 분류】',
      '■ 척추 원인 (가장 흔함)',
      '• 디스크 탈출 (IVDD)',
      '• 척추 종양',
      '• 척추 외상',
      '• 퇴행성 척수증 (DM)',
      '',
      '■ 신경 원인',
      '• 다발성 신경병증',
      '• 종양이 신경 압박',
      '',
      '■ 뼈·관절 원인 (걸음은 이상하지만 감각 정상)',
      '• 관절염 (통증으로 발 디딤 회피)',
      '',
      '【퇴행성 척수증 (DM) — 특별히】',
      '• 게르만 셰퍼드, 코기, 복서에서 흔함',
      '• 서서히 진행, 통증 없음',
      '• 치료 없음 — 재활로 진행 늦춤',
      '',
      '【집에서 고유수용성 테스트】',
      '발등을 아래로 뒤집어 놓았을 때 즉시 바로 놓으면 정상,',
      '5초 이상 그대로면 고유수용성 이상 → 병원 방문',
      '',
      '언제부터 시작됐고, 양쪽인가요 한쪽인가요?',
    ].join('\n')
  }

  // ── 개 눈물 자국 / 눈물 과다 분비 ──────────────────────────────
  if (/눈물\s*(자국|얼룩|갈색|빨간|너무\s*많이|과다|epiphora)|눈물\s*자국\s*(없애기|빼기|원인)|epiphora|눈\s*(눈물\s*많이|흐름)/.test(text)) {
    return [
      '👁️ 눈물 자국·과다 분비 안내',
      '',
      '눈물 자국이 갈색·빨간색으로 착색되는 것은 포르피린 때문이에요.',
      '',
      '【눈물 자국 색 원인】',
      '• 포르피린 (porphyrin): 눈물·침에 포함된 색소',
      '• 공기와 접촉하면 갈색·빨간색으로 변색',
      '• 말티즈·시추·불독·퍼그 같은 흰 털 품종에서 두드러짐',
      '',
      '【눈물 과다 분비(epiphora)의 원인】',
      '• 비루관(눈물길) 막힘 또는 협착',
      '• 안검 내번/외번 (속눈썹이 눈 안쪽으로)',
      '• 이소성 섬모 (속눈썹이 각막 자극)',
      '• 알레르기 (꽃가루, 음식)',
      '• 결막염, 각막염',
      '',
      '【비루관 세척 (Nasolacrimal flush)】',
      '막힌 비루관을 세척하면 눈물 양 줄어들 수 있어요.',
      '',
      '【눈물 자국 관리】',
      '• 매일 따뜻한 물로 눈 주변 닦기',
      '• 눈 주변 털을 짧게 유지',
      '• 과도한 경우: 항생제 내포 사료 (Tylosin) — 장기 사용 주의',
      '• 식이 변경으로 일부 개선되는 경우 있음',
      '',
      '눈물 자국 외에 눈에 다른 증상이 있나요?',
    ].join('\n')
  }

  // ── 심잡음 (Heart Murmur) 발견 ──────────────────────────────────
  if (/심잡음\s*(발견|등급|grade|치료|언제\s*치료|의미|심각)|murmur|잡음\s*(심장|청진)|청진\s*(이상|잡음)/.test(text)) {
    return [
      '❤️ 심잡음 (Heart Murmur) 안내',
      '',
      '심잡음이 있다고 모두 위험한 것은 아니에요.',
      '',
      '【심잡음이란?】',
      '혈액이 비정상적으로 흐를 때 청진기로 들리는 소리예요.',
      '',
      '【심잡음 등급 (Grade 1~6)】',
      '• Grade 1~2: 경미, 증상 없음, 경과 관찰',
      '• Grade 3~4: 중간 정도, 심초음파 권장',
      '• Grade 5~6: 진동 느껴질 정도, 심장병 가능성 높음',
      '',
      '【개에서 흔한 원인】',
      '• DMVD (퇴행성 승모판 질환): 소형 노령견에서 가장 흔함',
      '• 심장 비대, 선천성 결손 (강아지)',
      '',
      '【고양이에서 흔한 원인】',
      '• HCM (비대성 심근병증)',
      '• 생리적 심잡음 (젊은 고양이에서 이상 없이 들리기도)',
      '',
      '【진단 추가 검사】',
      '• 심초음파 (Echo): 심장 구조·기능 가장 정확',
      '• 흉부 X-ray: 심장 크기, 폐 액체',
      '• BNP/NT-proBNP 혈액 검사: 심장 스트레스 표지자',
      '',
      '【치료 시작 기준 (DMVD)】',
      'ACVIM 가이드라인: B1단계(심장 비대 없음) 치료 불필요',
      'B2단계(심장 비대 있음): 피모벤단 시작',
      '',
      '심초음파를 받아보셨나요?',
    ].join('\n')
  }

  // ── 오메가-3 / 영양 보조제 심층 ────────────────────────────────
  if (/오메가.?3\s*(용량|효과|어느\s*것|좋은|EPA|DHA|추천)|fish\s*oil\s*(개|고양이)|영양\s*보조제\s*(어떤|추천|선택)/.test(text)) {
    return [
      '💊 오메가-3·영양 보조제 심층 안내',
      '',
      '오메가-3는 반려동물 영양 보조제 중 근거가 가장 탄탄해요.',
      '',
      '【오메가-3 (EPA/DHA)】',
      '• 효과: 항염증, 피부·털, 심장·신장 보호, 뇌 건강',
      '• 출처: 생선 기름 (어유)가 EPA/DHA 직접 공급으로 최고',
      '  (아마씨·식물 오일의 ALA는 변환율 낮아 효과 약함)',
      '• 용량 (개): 20~55 mg EPA+DHA/kg/일',
      '• 산패 확인: 냄새가 역하면 교체',
      '• 보관: 냉장 (유통기한 엄수)',
      '',
      '【관절에 도움이 되는 보조제】',
      '• 글루코사민 + 콘드로이틴: 관절 연골 지지',
      '• 유니세틴 (UC-II): 타입 II 콜라겐',
      '• 근거 수준: 오메가-3보다 약하지만 사용 많음',
      '',
      '【신장 보조제】',
      '• 오메가-3: CKD 진행 늦춤 효과',
      '• Azodyl (프로바이오틱스): 질소 결합 도움',
      '• Epakitin: 인 결합제',
      '',
      '【피부·모질 보조제】',
      '• 오메가-3 + 바이오틴',
      '• Vitamin E: 항산화',
      '',
      '【피해야 할 것】',
      '• 과용량 오메가-3: 혈소판 기능 저하 가능',
      '• 사람용 멀티비타민: 과량 비타민 A·D 독성 위험',
      '',
      '어떤 목적으로 보조제를 찾고 계신가요?',
    ].join('\n')
  }

  // ── 털 빠짐 (탈모) 원인 분류 ────────────────────────────────────
  if (/털\s*(빠짐|빠져|탈모|빠지는|엄청\s*빠|과하게\s*빠|많이\s*빠)|alopecia|탈모\s*(원인|검사|치료)|피부\s*탈모/.test(text)) {
    return [
      '🐾 탈모 (털 빠짐) 원인 분류 안내',
      '',
      '털이 많이 빠지면 원인에 따라 대처법이 달라요.',
      '',
      '【정상 털갈이 vs 비정상 탈모 구별】',
      '• 정상: 계절성 (봄·가을), 균일하게 빠짐',
      '• 비정상: 원형 탈모, 좌우 대칭 탈모, 피부 병변 동반, 특정 부위만',
      '',
      '【내분비 원인 (좌우 대칭 탈모)】',
      '• 갑상선저하증: 옆구리·엉덩이 대칭, 무기력 동반',
      '• 쿠싱증후군: 배 피부 얇아짐, 석회침착',
      '• 성호르몬 이상: 중성화 이후 개선되기도',
      '',
      '【피부 감염 원인】',
      '• 피부사상균 (링웜): 원형 탈모',
      '• 농피증: 모낭 주변 화농 후 탈모',
      '• 진드기·벼룩: 심한 가려움 + 탈모',
      '',
      '【알레르기 원인】',
      '• 음식·환경 알레르기: 긁어서 털 빠짐 (외상성 탈모)',
      '• 발·귀·배 등 탈모 동반',
      '',
      '【심인성】',
      '• 스트레스·강박 핥기 (OCD): 반복 핥는 부위 탈모',
      '',
      '탈모 위치가 어디고, 가려움증이 있나요?',
    ].join('\n')
  }

  // ── 반려동물 여행·이동 스트레스 ─────────────────────────────────
  if (/여행\s*(반려동물|데리고|데려가|고양이|개)|이동\s*(스트레스|차\s*멀미|비행기|케이지\s*적응)|차\s*멀미\s*(개|고양이)|비행기\s*(반려동물|규정|케이지)/.test(text)) {
    return [
      '✈️ 반려동물 여행·이동 스트레스 관리',
      '',
      '이동 스트레스는 미리 준비하면 크게 줄일 수 있어요.',
      '',
      '【차 멀미 (Motion Sickness)】',
      '• 개에서 고양이보다 흔함',
      '• 예방: 여행 12시간 전 금식',
      '• 약물: 마로피탄트 (Cerenia) — 공식 허가된 유일한 동물 멀미약',
      '• 차량 내 앞좌석보다 중간이 덜 흔들림',
      '',
      '【케이지 적응 훈련 (특히 고양이)】',
      '• 케이지를 평소에 열어두기 (익숙해지게)',
      '• 간식·장난감을 케이지 안에 넣기',
      '• 이동 당일 1~2시간 전 넣기',
      '• 페리웨이 합성 페로몬 (Feliway): 케이지 안에 뿌리기',
      '',
      '【비행기 이동 규정】',
      '• 기내 반입: 체중 7~8kg 이하 (항공사마다 다름)',
      '• 화물칸: 대형견 — 동물 스트레스 주의',
      '• 건강증명서 및 예방접종 기록 필요 (항공사·국가마다)',
      '',
      '【이동 중 응급 신호】',
      '• 심한 헐떡임 + 잇몸 색 변화 → 열사병',
      '• 경련 → 즉시 시원한 곳 이동 + 병원 연락',
      '',
      '얼마나 걸리는 이동을 계획하시나요?',
    ].join('\n')
  }

  // ── 개 십자인대 수술 후 회복 관리 ──────────────────────────────
  if (/TPLO\s*(수술\s*후|회복|재활|산책\s*언제|운동\s*언제|주의)|십자인대\s*(수술\s*후|회복\s*기간|산책|운동)|TTA\s*(수술\s*후|회복)/.test(text)) {
    return [
      '🦴 십자인대 수술 후 회복 가이드',
      '',
      'TPLO 수술 후 충분한 회복 기간이 재발 예방의 핵심이에요.',
      '',
      '【TPLO 수술 후 회복 일정】',
      '■ 수술 직후~2주',
      '• 절대 케이지 레스트',
      '• 화장실 때만 짧게 목줄 산책 (3~5분)',
      '• 실밥 제거: 10~14일',
      '• 수술 부위 핥지 않게 이 카라',
      '',
      '■ 2~6주',
      '• 짧은 목줄 보행 (10~15분) — 줄 짧게 유지',
      '• 달리기·점프 금지',
      '• 물리치료·수중 트레드밀 시작 (병원 지도 하에)',
      '',
      '■ 6~8주: X-ray로 뼈 아묾 확인 후 단계적 운동 증가',
      '',
      '■ 3~4개월: 달리기·점프 허용 (X-ray 확인 후)',
      '',
      '【집에서 주의사항】',
      '• 미끄러운 바닥 금지 → 카펫·요가매트 깔기',
      '• 소파·침대 점프 금지 (계단 이용)',
      '• 반대쪽 다리 과부하 주의 (CCL 파열 가능)',
      '',
      '【수술 후 응급 신호】',
      '• 수술 부위 심하게 붓거나 분비물',
      '• 발열',
      '• 수술한 다리를 완전히 들고 있음',
      '',
      '수술 후 며칠이 지났나요?',
    ].join('\n')
  }

  // ── 반려동물 보험 활용법 ────────────────────────────────────────
  if (/펫\s*보험\s*(청구|활용|어떻게|어디서|사용|가입 후)|반려동물\s*보험\s*(청구|어떻게\s*쓰|적용)/.test(text)) {
    return [
      '🏥 펫보험 활용법 안내',
      '',
      '가입 후 실제 청구 방법을 알아두세요.',
      '',
      '【청구 절차】',
      '1. 병원 진료 후 영수증·진단서·치료 확인서 수령',
      '2. 보험사 앱 또는 홈페이지에 서류 등록',
      '3. 심사 후 지급 (보통 3~7일)',
      '',
      '【챙겨야 하는 서류】',
      '• 진료비 영수증',
      '• 세부 내역서 (처치·약 내역)',
      '• 진단서 (병명 명시) — 보험사 요구 시',
      '',
      '【청구 시 주의사항】',
      '• 선천성 질환: 대부분 보장 제외',
      '• 기존 질환: 가입 전 증상이면 부담보 가능성',
      '• 예방 접종·건강검진: 보장 제외 (보통)',
      '• 면책 기간: 가입 후 30~60일 대기 기간',
      '',
      '【보험이 도움 되는 경우】',
      '• 외상·응급 치료',
      '• 수술 (정형외과, 신경계)',
      '• 항암 치료',
      '',
      '【알아두면 좋은 용어】',
      '• 자기 부담금: 본인이 내야 하는 비율 (20~30%)',
      '• 연간 한도: 1년에 보장받을 수 있는 최대 금액',
      '• 부담보 조건: 특정 질환은 보장 제외',
      '',
      '어떤 치료로 청구를 고려 중이신가요?',
    ].join('\n')
  }

  // ── 동물 호스피스 / 안락사 결정 ─────────────────────────────────
  if (/안락사\s*(결정|기준|언제|고민|생각)|호스피스\s*(동물|반려동물)|마지막\s*(결정|어떻게|시기|보내기)|존엄사\s*(동물|반려동물)/.test(text)) {
    return [
      '🌿 안락사 결정 안내',
      '',
      '매우 힘든 결정을 앞두고 계시군요. 진심으로 위로드려요.',
      '',
      '【안락사는 "포기"가 아니에요】',
      '고통에서 해방시켜 주는 마지막 사랑의 행위예요.',
      '수의사들도 "가장 어려운 결정이지만 용기있는 결정"이라고 해요.',
      '',
      '【삶의 질 평가 도구 — HHHHHMM 척도】',
      '각 항목 0~10점으로 평가 (10점이 최상):',
      '• H (Hurt): 통증이 조절되고 있나?',
      '• H (Hunger): 먹고 있나?',
      '• H (Hydration): 수분 상태는?',
      '• H (Hygiene): 위생·청결 유지되나?',
      '• H (Happiness): 기쁨을 느끼나?',
      '• M (Mobility): 혼자 이동 가능한가?',
      '• M (More good days): 좋은 날이 나쁜 날보다 많은가?',
      '',
      '총점 35점 이하가 지속되면 안락사를 고려할 시점이에요.',
      '',
      '【안락사 과정】',
      '• 진정제 투여 → 깊은 수면 상태',
      '• 고농도 마취제 정맥 투여 → 심장 멈춤',
      '• 고통 없이 수초~수분 내 평화롭게',
      '',
      '지금 가장 힘든 증상이 무엇인가요?',
    ].join('\n')
  }

  // ── 심장 사상충 예방약 종류 ─────────────────────────────────────
  if (/사상충\s*(예방약\s*종류|어떤\s*약|추천|선택|넥스가드|애드보킷|레볼루션|하트가드)|심장사상충\s*(예방\s*약물|치료\s*약|종류)/.test(text)) {
    return [
      '💊 심장 사상충 예방약 종류 안내',
      '',
      '예방약 선택은 기생충 스펙트럼과 동물 특성을 고려해요.',
      '',
      '【주요 사상충 예방약 (먹는 약)】',
      '● 하트가드 (Heartgard): 이버멕틴 기반',
      '  • 심장 사상충만 예방 (회충 일부)',
      '  • 콜리·쉽독 ABCB1 유전자 변이 주의',
      '',
      '● 넥스가드 스펙트라: 아폭솔라너 + 밀베마이신',
      '  • 사상충 + 벼룩·진드기 + 내부 기생충',
      '  • 개에서만 사용',
      '',
      '【바르는 약 (Spot-on)】',
      '● 레볼루션 (Revolution): 세라멕틴',
      '  • 개·고양이 모두 사용 가능',
      '  • 사상충 + 벼룩 + 일부 진드기 + 귀 진드기',
      '',
      '● 애드보킷: 이미다클로프리드 + 목시덱틴',
      '  • 사상충 + 벼룩 + 내부 기생충',
      '  • 고양이용 따로 있음',
      '',
      '【고양이 전용】',
      '• 레볼루션 고양이용',
      '• 브로드라인: 4중 복합 예방',
      '',
      '【접종 시기】',
      '• 매달 정해진 날 투약 (달력 표시 권장)',
      '• 홀수 달: 5월, 7월, 9월에 특히 중요 (모기 활동기)',
      '',
      '현재 어떤 예방약을 쓰고 계신가요?',
    ].join('\n')
  }

  // ── 항암 치료 결정 / 비용·효과 고려 ────────────────────────────
  if (/항암\s*(치료\s*결정|할지|말지|비용|효과|고민|어떻게\s*결정)|암\s*치료\s*(할지|말지|고민|결정)|화학\s*요법\s*(동물|반려동물)/.test(text)) {
    return [
      '🎗️ 항암 치료 결정 가이드',
      '',
      '항암 치료는 삶의 질과 비용·효과를 모두 고려해야 해요.',
      '',
      '【항암 치료 전 체크리스트】',
      '□ 암의 종류와 등급/병기는 무엇인가?',
      '□ 치료 목표: 완치 vs 기간 연장 vs 증상 완화?',
      '□ 치료 없이 예상 생존 기간은?',
      '□ 치료 시 예상 생존 기간 및 삶의 질은?',
      '□ 가족의 시간·비용 여건은?',
      '',
      '【항암 치료 반응이 좋은 암 (개)】',
      '• 림프종: 80~90% 관해, 평균 12~14개월 연장',
      '• 비만세포종 (low grade): 수술만으로 완치 많음',
      '• 골육종: 절단 + 항암으로 평균 10~14개월',
      '',
      '【항암 치료 효과 제한적인 암】',
      '• 구강 흑색종: 전이 빠름',
      '• 고양이 SCC (편평상피암): 예후 불량',
      '',
      '【항암 중 삶의 질 (사람보다 양호)】',
      '• 동물은 항암 부작용 사람보다 적음 (용량 조절)',
      '• 구토·식욕 저하 있지만 대부분 활동 유지',
      '• 탈모: 일부 품종에서만 (잘 생기지 않음)',
      '',
      '치료하지 않는 것도 하나의 선택이에요.',
      '완화 치료로 편안하게 지내는 것도 사랑이에요.',
      '',
      '어떤 암이고 현재 어떤 선택지를 제안받으셨나요?',
    ].join('\n')
  }

  // ── 피로·무기력 원인 감별 ──────────────────────────────────────
  if (/무기력\s*(원인|심한|갑자기|왜|감별)|기운\s*(없어요|없는|없음|갑자기)|피곤한\s*(것\s*같아|것처럼|모습)|활동량\s*(줄었|감소|급격히)/.test(text)) {
    return [
      '🔍 무기력·피로 원인 감별 안내',
      '',
      '무기력은 많은 질환의 공통 증상이라 원인 파악이 중요해요.',
      '',
      '【급성 무기력 (갑작스럽게) — 응급 가능성 높음】',
      '🚨 즉시 병원:',
      '• 심한 출혈·빈혈',
      '• 내부 장기 파열 (혈복막)',
      '• 심부전·폐부종',
      '• 심각한 감염·패혈증',
      '• 독소·중독',
      '',
      '【만성 무기력 (서서히 진행)】',
      '• 갑상선저하증: 무기력 + 체중 증가 + 추위 싫어함',
      '• 쿠싱증후군: 무기력 + 다음다뇨 + 배 볼록',
      '• 만성 신부전: 무기력 + 식욕 저하 + 구토',
      '• 심장병: 운동 불내성 + 기침',
      '• 빈혈: 무기력 + 창백한 잇몸',
      '• 암: 체중 감소 동반',
      '',
      '【연령별 주요 원인】',
      '• 강아지·어린 고양이: 감염, 기생충, 저혈당',
      '• 중년: 호르몬 이상, 간·신장',
      '• 노령: 심장병, CKD, 종양, 인지기능 저하',
      '',
      '무기력이 시작된 게 언제이고, 다른 증상이 있나요?',
    ].join('\n')
  }

  // ── 반려견 귀 혈종 ──────────────────────────────────────────────
  if (/귀\s*(혈종|부어|볼록|물집|멍울|부풀어)|aural\s*hematoma|이개\s*혈종/.test(text)) {
    return [
      '🐕 귀 혈종 안내',
      '',
      '귀가 갑자기 풍선처럼 부풀었다면 귀 혈종이에요.',
      '',
      '【귀 혈종이란?】',
      '귀 안쪽(이개) 연골과 피부 사이에 혈액이 고인 상태예요.',
      '머리 흔들기나 긁기로 귀 혈관이 터져 발생해요.',
      '',
      '【원인 (귀 흔들기·긁기의 원인 먼저 해결)】',
      '• 외이염 (귀 감염): 가장 흔한 원인',
      '• 귀 진드기',
      '• 알레르기로 귀 가려움',
      '',
      '【증상】',
      '• 귀 안쪽이 풍선처럼 부풀어 오름',
      '• 귀가 무거워 늘어짐',
      '• 통증 (만지면 아파함)',
      '',
      '【치료】',
      '■ 시술/수술 (배액 필요)',
      '• 주사기 흡인: 임시 방편 (재발률 높음)',
      '• 수술적 배액 + 봉합: 가장 효과적',
      '• 두툼한 귀 모양 보존하려면 빨리 치료해야 해요',
      '',
      '【주의】',
      '치료 없이 방치하면 흉터 조직이 생겨 귀가 쭈글쭈글하게 변형돼요.',
      '',
      '【원인 치료가 필수】',
      '귀 혈종 수술 후 외이염을 치료하지 않으면 재발해요.',
      '',
      '귀를 얼마나 자주 흔들거나 긁나요?',
    ].join('\n')
  }

  // ── 음식 알레르기 배제 식이 시험 ───────────────────────────────
  if (/배제\s*(식이|사료|시험)|elimination\s*diet|단일\s*(단백|탄수화물)\s*사료|새로운\s*단백질\s*(사료|시험)|hydrolyzed|가수분해\s*(단백|사료)/.test(text)) {
    return [
      '🍽️ 음식 알레르기 — 배제 식이 시험 안내',
      '',
      '식이 알레르기 확진을 위해 배제 식이 시험이 필요해요.',
      '',
      '【배제 식이 시험이란?】',
      '과거에 먹지 않은 단백질원과 탄수화물원으로만 8~12주 급식.',
      '증상이 개선되면 음식 알레르기 가능성 높음.',
      '',
      '【배제 식이 선택】',
      '■ 신규 단백질 식이 (Novel Protein Diet)',
      '• 기존 닭고기·소고기를 먹었다면: 오리·캥거루·사슴·연어 등',
      '• 탄수화물도 처음 먹는 것으로: 고구마, 완두콩',
      '',
      '■ 가수분해 단백질 식이 (Hydrolyzed Protein Diet)',
      '• 기존 단백질을 작게 쪼개 면역 반응 없게',
      '• 힐스 z/d, 로얄캐닌 Anallergenic 등',
      '',
      '【시험 중 절대 규칙 (지켜야 의미 있음)】',
      '• 사람 음식·간식 금지',
      '• 기존 사료 금지',
      '• 보조제도 배제 식이 외 모두 중단 (수의사 확인 후)',
      '• 최소 8주, 피부 증상은 12주 이상',
      '',
      '【시험 후 확인】',
      '증상 개선 → 기존 사료 재도전 → 증상 재발하면 알레르기 확진',
      '',
      '지금까지 주로 먹여온 단백질원이 무엇인가요?',
    ].join('\n')
  }

  // ── 개·고양이 눈꺼풀·각막 문제 ─────────────────────────────────
  if (/안검\s*(내번|외번|이상|이소성\s*섬모)|속눈썹\s*(각막\s*자극|이상|이소성)|각막\s*(궤양|긁힘|혼탁|손상|치료)|corneal\s*(ulcer|scratch)/.test(text)) {
    return [
      '👁️ 안검·각막 문제 안내',
      '',
      '눈 속 이물감이나 눈 비비기는 각막 손상을 의심해요.',
      '',
      '【안검 내번 (Entropion)】',
      '• 눈꺼풀이 안쪽으로 말려 속눈썹이 각막 자극',
      '• 잘 걸리는 품종: 차우차우, 샤페이, 잉글리시 불도그, 래브라도',
      '• 증상: 눈물 과다, 눈 비비기, 각막 혼탁',
      '• 치료: 수술 교정 필요',
      '',
      '【이소성 섬모 (Distichiasis/Ectopic Cilia)】',
      '• 결막·눈꺼풀 안쪽에서 비정상적 속눈썹이 자람',
      '• 각막을 반복적으로 자극',
      '• 치료: 냉동 치료 또는 전기분해로 제거',
      '',
      '【각막 궤양 (Corneal Ulcer)】',
      '• 각막 표면 손상: 긁힘, 이물질, 감염',
      '• 증상: 통증, 눈 감고 있음, 눈물 과다',
      '• 진단: 형광 염색 (손상 부위 녹색으로 염색됨)',
      '',
      '● 표재성 궤양: 항생제 점안액 + 통증 조절 → 대부분 회복',
      '● 심층 궤양 (심한 것): 수술 (결막판 수술, 각막 이식)',
      '',
      '【즉시 병원 신호】',
      '• 각막이 뿌옇게 변함 (각막 천공 위험)',
      '• 눈을 못 뜸 + 심한 통증',
      '',
      '눈에 형광 염색 검사를 받아보셨나요?',
    ].join('\n')
  }

  // ── 강아지 사회화 / 교육 시기 ───────────────────────────────────
  if (/사회화\s*(시기|교육|어떻게|중요성|기간)|강아지\s*(사회화|교육\s*시작|훈련\s*시기)|sensitivity\s*period|결정적\s*(시기|기간)/.test(text)) {
    return [
      '🐕 강아지 사회화 교육 안내',
      '',
      '사회화는 생후 3~14주가 결정적 시기예요.',
      '',
      '【사회화 결정적 시기】',
      '• 3~5주: 다른 개와 사회화 (어미·형제)',
      '• 5~12주 (가장 중요!): 사람·환경 사회화',
      '• 12~14주: 사회화 창이 서서히 닫힘',
      '',
      '【사회화 해야 할 것들】',
      '□ 다양한 사람: 남성, 여성, 어린이, 노인, 안경 쓴 사람, 모자 쓴 사람',
      '□ 다양한 소리: 청소기, 오토바이, 천둥, 아이 울음',
      '□ 다양한 표면: 잔디, 타일, 금속 바닥, 모래',
      '□ 다양한 환경: 차 이동, 엘리베이터, 사람 많은 곳',
      '□ 다른 동물: 고양이, 강아지, 조류',
      '',
      '【사회화 방법 (긍정 경험이 핵심)】',
      '• 새 자극 + 맛있는 간식 동시에',
      '• 무서워하면 뒤로 물러서서 천천히',
      '• 절대 억지로 접촉시키지 않기',
      '',
      '【예방접종 전 사회화】',
      '• 완전 접종 전이라도 집 안, 백신 맞은 개 친구, 깨끗한 환경에서 가능',
      '• 사회화 창보다 백신 완성이 늦어선 안 돼요',
      '',
      '현재 몇 주령이고, 어떤 사회화가 어렵게 느껴지나요?',
    ].join('\n')
  }

  // ── 고양이 화장실 문제 / 부적절 배변 ────────────────────────────
  if (/화장실\s*(안\s*가|거부|다른\s*곳에|문제|왜\s*안\s*가)|고양이\s*(아무\s*데서나|화장실\s*밖에서)\s*(배변|오줌|싸)|부적절\s*(배뇨|배변|배설)/.test(text)) {
    return [
      '🐱 고양이 부적절 배변 안내',
      '',
      '화장실 밖에서 배변한다면 의학적 원인부터 먼저 확인하세요.',
      '',
      '【의학적 원인 (먼저 배제)】',
      '• 방광염·요로 감염: 화장실에서 통증 기억 → 화장실 거부',
      '• 결석: 소변 시 통증',
      '• 변비: 대변 시 통증',
      '• 관절염: 화장실에 들어가기 힘든 경우 (입구 높음)',
      '→ 새로운 부적절 배변: 혈액·소변 검사 먼저',
      '',
      '【행동적 원인】',
      '■ 화장실 환경 문제',
      '• 모래가 마음에 안 들 때 (향이 강한 모래)',
      '• 화장실 너무 더러울 때 (하루 1~2회 청소 권장)',
      '• 화장실 위치 (소음, 세탁기 옆 등)',
      '',
      '■ 스트레스',
      '• 새 가족, 이사, 다른 고양이 갈등',
      '',
      '【해결 방법】',
      '• 화장실 수: 고양이 수 + 1',
      '• 크기: 고양이 몸 1.5배 이상 크게',
      '• 모래 깊이: 5cm 이상',
      '• 뚜껑 없는 화장실 시도 (밀폐형 싫어하는 고양이)',
      '',
      '언제부터, 어디서 배변하나요?',
    ].join('\n')
  }

  // ── 장폐색 / 장중첩 ─────────────────────────────────────────────
  if (/장\s*(폐색|폐쇄|막힘|중첩)|intussusception|장\s*(겹침|겹쳐)|소장\s*(막힘|폐색)/.test(text)) {
    return [
      '🚨 장폐색·장중첩 응급 안내',
      '',
      '장이 막히거나 겹쳤다면 즉시 병원으로 가야 해요.',
      '',
      '【장폐색이란?】',
      '소장이나 대장이 이물질, 종양, 유착으로 막히는 상태예요.',
      '',
      '【장중첩 (Intussusception)이란?】',
      '장의 일부가 옆 장관 안으로 쑥 들어가는 상태.',
      '어린 강아지, 기생충 또는 장염 후 발생하기도.',
      '',
      '【증상】',
      '• 반복 구토 (내용물 → 담즙 → 황록색 → 분변 냄새)',
      '• 복부 통증 (웅크림, 만지면 거부)',
      '• 복부 팽만',
      '• 배변 없음 또는 소량 혈변',
      '• 급격한 탈수·허탈',
      '',
      '【진단】',
      '• 복부 X-ray: 장 내 가스 패턴',
      '• 초음파: 장중첩 직접 확인 ("도넛 sign")',
      '',
      '【치료】',
      '• 응급 수술: 막힌 부위 제거 또는 장 절제',
      '• 장중첩: 수압 환납 (일부) 또는 수술',
      '',
      '언제부터 구토가 시작됐고, 배변이 있나요?',
    ].join('\n')
  }

  // ── 개 지루성 피부염 ─────────────────────────────────────────────
  if (/지루성\s*(피부염|피부|seborrhea)|기름진\s*(피부|털)|강한\s*(피부\s*냄새|몸\s*냄새)|seborrheic|각질\s*(많음|심한|엄청)/.test(text)) {
    return [
      '🐕 지루성 피부염 안내',
      '',
      '냄새가 심하고 기름지거나 각질이 많다면 지루성 피부염이에요.',
      '',
      '【지루성 피부염이란?】',
      '피지 분비가 비정상적으로 많거나 각질이 과다 생성되는 피부 상태예요.',
      '',
      '【두 가지 유형】',
      '• 지성 지루증: 기름지고 냄새 심함 — 카발리에 킹 찰스 스파니엘, 바셋 하운드',
      '• 건성 지루증: 비듬처럼 각질 — 아이리시 세터, 도베르만',
      '',
      '【원인】',
      '• 원발성: 유전적 피부 각화 이상',
      '• 속발성: 가장 흔함 — 알레르기, 갑상선저하증, 쿠싱, 세균/진균 감염',
      '',
      '【진단 포인트】',
      '속발성 원인을 먼저 배제해야 해요!',
      '기저 질환 치료하면 지루증 개선되는 경우 많아요.',
      '',
      '【치료】',
      '■ 약용 샴푸',
      '• 살리실산·황: 각질 제거',
      '• 염화 벤제토늄·클로르헥시딘: 세균 감염 시',
      '• 케토코나졸: 진균(맬라세지아) 과증식 시',
      '',
      '■ 전신 치료',
      '• 원인 질환 치료 (갑상선저하, 알레르기 등)',
      '• 오메가-3 보조제: 피부 장벽 강화',
      '',
      '냄새가 더 많은지, 각질이 더 많은지 어느 쪽인가요?',
    ].join('\n')
  }

  // ── 새 고양이 / 다묘 입양 ────────────────────────────────────────
  if (/새\s*(고양이|묘)\s*(입양|데려와|들어옴|소개)|다묘\s*(가정\s*소개|합사\s*방법|고양이\s*소개)|고양이\s*(합사|소개|새\s*고양이\s*오면)/.test(text)) {
    return [
      '🐱 다묘 가정 — 새 고양이 소개 방법',
      '',
      '고양이 합사는 서두르면 실패해요. 천천히 단계적으로!',
      '',
      '【왜 고양이 합사는 어려운가?】',
      '고양이는 영역 동물이에요. 냄새로 영역을 표시하고 낯선 고양이를 위협으로 느껴요.',
      '',
      '【단계별 소개법 (최소 2~4주)】',
      '',
      '1단계 (1~3일): 분리',
      '• 새 고양이: 별도 방에 격리',
      '• 서로의 냄새를 간식과 함께 맡게 (양말·수건 교환)',
      '',
      '2단계 (3~7일): 문 밑으로 교류',
      '• 문 아래 간격으로 서로 냄새 맡기',
      '• 밥그릇을 문 옆에 놓기 (좋은 경험 연결)',
      '',
      '3단계 (7~14일): 시각적 접촉',
      '• 문을 살짝 열거나 유리문으로 시각 접촉',
      '• 서로 위협하면 단계 후퇴',
      '',
      '4단계: 자유로운 공간 공유',
      '• 관리 하에 같은 공간 (탈출 경로 확보)',
      '• 충분한 자원: 밥그릇, 화장실, 수직 공간',
      '',
      '【실패 신호 vs 정상 반응】',
      '• 쉿 소리, 하악질: 정상 (점차 줄어야 함)',
      '• 극단적 도망, 식욕 완전 거부: 속도 늦추기',
      '',
      '지금 몇 단계에 있고, 어떤 반응이 일어나고 있나요?',
    ].join('\n')
  }

  // ── 반려동물 구취 / 구강 냄새 ──────────────────────────────────
  if (/구취|입\s*(냄새|악취)|구강\s*(냄새|악취)|halitosis|방귀같은\s*입\s*냄새/.test(text)) {
    return [
      '🦷 구취 원인 및 관리 안내',
      '',
      '구취는 단순 구강 문제 외에 전신 질환 신호일 수 있어요.',
      '',
      '【구취 원인 분류】',
      '■ 구강 원인 (가장 흔함)',
      '• 치주 질환 (치석, 잇몸 염증)',
      '• 치아 파절 또는 치수 노출',
      '• 구강 종양, 궤양',
      '',
      '■ 전신 원인',
      '• 신부전: 암모니아·요소 냄새 (소변 냄새)',
      '• 당뇨: 과일·아세톤 냄새',
      '• 간부전: 썩은 냄새 (간성 뇌증)',
      '• 위장 문제: 역류성 냄새',
      '',
      '【냄새 종류로 원인 추정】',
      '• 썩은 냄새 → 치주 질환 (가장 흔함)',
      '• 소변 냄새 → 신부전 의심',
      '• 달콤한/과일 냄새 → 당뇨성 케톤산혈증',
      '• 생선 냄새 → 항문낭 문제 (구취와 혼동)',
      '',
      '【집에서 관리】',
      '• 매일 양치질이 가장 효과적',
      '• 덴탈 추 (CET 허가 제품): 보조적',
      '• 구강 세정제: 일부 효과',
      '',
      '구취 외에 음식 먹는 방식 변화가 있나요?',
    ].join('\n')
  }

  // ── 개 갑작스러운 식욕 증가 / 허기 ─────────────────────────────
  if (/갑자기\s*(밥\s*(많이|엄청|너무)\s*먹|식욕\s*폭발|배고프|굶주린|무한\s*식욕)|식욕\s*(갑자기\s*증가|과다|늘어남)|polyphagia/.test(text)) {
    return [
      '🔍 갑작스러운 식욕 증가 원인 안내',
      '',
      '갑자기 밥을 많이 먹는다면 원인을 찾는 것이 중요해요.',
      '',
      '【정상 상황】',
      '• 성장기 강아지',
      '• 운동량 증가',
      '• 임신·수유',
      '',
      '【의학적 원인 (Polyphagia)】',
      '● 쿠싱증후군: 식욕 증가 + 다음다뇨 + 배 볼록',
      '● 당뇨: 식욕 증가 + 체중 감소 (인슐린 부족으로 포도당 이용 못 함)',
      '● 갑상선기능항진증 (고양이): 엄청 먹는데 살은 빠짐',
      '● 장 흡수 장애: 먹어도 영양소 흡수 안 됨 → 허기',
      '● 췌장 기능 부전 (EPI): 먹어도 소화가 안 됨 → 허기 + 체중 감소',
      '',
      '【약물 원인】',
      '• 스테로이드 복용: 식욕 자극이 부작용',
      '• 항경련제 일부: 식욕 증가',
      '',
      '【함께 확인할 것】',
      '□ 체중 변화가 있나요? (체중 감소 동반이면 더 중요)',
      '□ 물을 많이 마시나요?',
      '□ 소변 양이 늘었나요?',
      '□ 어떤 약을 먹고 있나요?',
      '',
      '식욕이 늘면서 체중은 변했나요?',
    ].join('\n')
  }

  // ── 고양이 어깨 혹 / 주사 부위 육종 ─────────────────────────────
  if (/고양이\s*(어깨\s*혹|목\s*뒤\s*혹|주사\s*부위|FISS|육종\s*주사)|feline\s*(injection|vaccine)\s*site\s*sarcoma|주사\s*(부위\s*혹|맞은\s*자리\s*혹)/.test(text)) {
    return [
      '🚨 고양이 주사 부위 육종 (FISS) 안내',
      '',
      '주사 부위에 생기는 혹은 매우 중요하게 봐야 해요.',
      '',
      '【FISS란?】',
      'Feline Injection Site Sarcoma — 주사 맞은 부위에 발생하는 악성 종양.',
      '빠르게 성장하고 국소 침습이 강하며, 전이 가능성 있어요.',
      '',
      '【의심 신호 (3-2-1 규칙)】',
      '• 3개월 이상 지속',
      '• 2cm 이상 크기',
      '• 1개월 내에 커짐',
      '→ 하나라도 해당하면 즉시 생검 필요',
      '',
      '【예방적 접종 위치】',
      '• 최근 권장: 허벅지 뒤쪽, 꼬리 아래 (절단 수술 시 대응 가능)',
      '• 어깨 사이(목덜미): FISS 발생 시 수술 어려워 권장 안 함',
      '',
      '【치료】',
      '• 광범위 수술 절제 (margin 확보 필수)',
      '• 방사선 치료 (재발 예방)',
      '• 항암 치료 (독소루비신)',
      '',
      '【예후】',
      '• 완전 절제 후 평균 생존 2~3년',
      '• 재발률 높아 지속 모니터 필요',
      '',
      '혹이 생긴 지 얼마나 됐고, 크기가 어떻게 변했나요?',
    ].join('\n')
  }

  // ── 혈소판 감소증 (면역 매개) / 출혈 경향 ───────────────────────
  if (/혈소판\s*(감소|낮음|수혈|부족)|ITP|immune\s*thrombocytopenia|출혈\s*(경향|멍|점상\s*출혈|자반)|petechiae|자반증/.test(text)) {
    return [
      '🔬 혈소판 감소증 안내',
      '',
      '혈소판이 낮으면 작은 상처에도 출혈이 멈추지 않아요.',
      '',
      '【혈소판 감소증이란?】',
      '혈소판이 정상 이하로 떨어져 지혈이 잘 안 되는 상태예요.',
      '정상 혈소판: 200,000~500,000/µL',
      '',
      '【원인 분류】',
      '■ 면역 매개 혈소판 감소증 (ITP, IMT) — 가장 흔함',
      '면역 시스템이 자신의 혈소판을 파괴',
      '',
      '■ 이차성 원인',
      '• 에를리키아·아나플라즈마 (진드기 매개)',
      '• 림프종',
      '• 골수 억제 (항암제, 에스트로겐)',
      '• DIC (파종성 혈관내 응고)',
      '',
      '【출혈 표현】',
      '• 점상 출혈 (petechiae): 잇몸·배에 작은 빨간 점',
      '• 코피, 혈뇨, 혈변',
      '• 피부 멍 (자반)',
      '',
      '【혈소판 수치와 출혈 위험】',
      '• 50,000 이하: 출혈 위험 증가',
      '• 30,000 이하: 자발 출혈 가능',
      '• 10,000 이하: 생명 위협',
      '',
      '【ITP 치료】',
      '• 스테로이드 (prednisolone): 1차 치료',
      '• 빈크리스틴: 혈소판 방출 자극',
      '• 사이클로스포린, 아자치오프린: 스테로이드 반응 없을 때',
      '• 혈소판 수혈: 수술 전 또는 심각한 출혈 시',
      '',
      '잇몸에 작은 빨간 점이 보이나요?',
    ].join('\n')
  }

  // ── 복막염 / 복강 감염 ──────────────────────────────────────────
  if (/복막염|복강\s*(감염|염증|오염)|peritonitis|위\s*(천공|파열)|장\s*(천공|파열)\s*(복막)/.test(text)) {
    return [
      '🚨 복막염 응급 안내',
      '',
      '복막염은 즉시 수술이 필요한 응급 상황이에요.',
      '',
      '【복막염이란?】',
      '복강 내 장기가 터지거나 감염으로 복막이 오염·감염된 상태예요.',
      '치료 없이 수 시간~수일 내 패혈증으로 사망 가능.',
      '',
      '【원인】',
      '• 위장관 천공: 이물·궤양·종양으로 위·장 파열',
      '• 자궁축농증 파열 (폐쇄형 pyometra)',
      '• 담낭·담도 파열',
      '• 외상 (교통사고로 내부 파열)',
      '• FIP (고양이 전염성 복막염): 바이러스성',
      '',
      '【증상】',
      '• 복부 통증 (만지면 근육 경직)',
      '• 구토, 무기력',
      '• 발열 또는 저온',
      '• 복부 팽만',
      '• 창백한 잇몸 (쇼크)',
      '',
      '【진단】',
      '• 복부 X-ray, 초음파',
      '• 복강 천자 (복수 검사): 세균성 액체 확인',
      '',
      '【치료】',
      '• 응급 수술: 원인 제거 + 복강 세척',
      '• 광범위 항생제 (정맥 투여)',
      '• 집중 수액·수혈',
      '',
      '배를 만지면 단단하게 굳어 있나요?',
    ].join('\n')
  }

  // ── 개 인지 훈련 / 노즈 워크 ──────────────────────────────────
  if (/노즈\s*워크|nosework|냄새\s*(찾기|훈련)|코\s*(훈련|이용한)|인지\s*(훈련|강화)|퍼즐\s*(장난감|사료|훈련)/.test(text)) {
    return [
      '🐽 노즈 워크 · 인지 훈련 안내',
      '',
      '코를 쓰는 활동은 신체 운동보다 훨씬 더 피로하게 해요.',
      '',
      '【노즈 워크란?】',
      '후각을 이용해 냄새를 찾는 활동이에요.',
      '개는 인간보다 후각이 10,000~100,000배 뛰어나 높은 만족감을 줘요.',
      '',
      '【효과】',
      '• 정신적 피로 (30분 노즈 워크 = 2시간 산책 효과)',
      '• 분리 불안, 파괴적 행동 감소',
      '• 자신감 향상',
      '• 노령견·수술 후 재활에도 가능',
      '',
      '【집에서 시작하는 방법】',
      '1. 간식 숨기기: 방 안에 간식을 숨겨 찾게 하기',
      '2. 머핀 팬: 공으로 덮어 어디 있는지 찾기',
      '3. 킁킁 담요: 간식을 담요에 싸서 찾기',
      '4. 종이 컵 게임: 3개 컵 중 간식 든 것 찾기',
      '',
      '【고급 노즈 워크 (공식 스포츠)】',
      '• 특정 냄새(바닐라, 아니스, 버치) 학습',
      '• 박스·차량·야외 등 다양한 장소 수색',
      '• 국내에서도 대회 있음',
      '',
      '【퍼즐 피더】',
      '사료를 그냥 주지 않고 풀어서 먹게:',
      '• Kong 장난감 (사료·간식 채움)',
      '• 스너플 매트 (잔디처럼 간식 숨김)',
      '• 레벨 1~5 퍼즐 장난감',
      '',
      '하루 운동량이 얼마나 되나요?',
    ].join('\n')
  }

  // ── 수유 중 암컷 / 젖이 안 나올 때 ─────────────────────────────
  if (/수유\s*(중\s*관리|어미|문제|모유\s*부족)|젖\s*(안\s*나와|부족|많이|막힘|유선염)|agalactia|mastitis\s*(개|고양이)/.test(text)) {
    return [
      '🤱 수유 관리·유선 문제 안내',
      '',
      '수유 중 어미와 새끼 모두 건강 상태를 잘 관찰해야 해요.',
      '',
      '【정상 수유】',
      '• 출산 직후 초유: 3~5일간 → 면역 항체 풍부 (필수!)',
      '• 수유 기간: 3~4주 (강아지·고양이 독립까지)',
      '',
      '【젖이 부족한 경우 (Agalactia)】',
      '• 원인: 스트레스, 영양 부족, 호르몬 이상',
      '• 징후: 새끼가 계속 울고, 체중이 늘지 않음',
      '• 해결: 어미 영양 공급 ↑, 새끼가 빨도록 자극',
      '• 인공 대체유 필요 시: 전용 밀크 리플레이서 (사람 우유 금지)',
      '',
      '【유선염 (Mastitis)】',
      '유선이 딱딱하고 뜨거워지며 통증 발생.',
      '• 증상: 어미가 수유 거부, 유두 발적·부종',
      '• 심한 경우: 농양, 패혈증 가능',
      '• 치료: 항생제, 온찜질, 심하면 유선 절제',
      '• 감염된 젖은 새끼에게 먹이지 않아야 함',
      '',
      '【새끼 체중 모니터링】',
      '• 정상: 하루 5~10% 체중 증가',
      '• 2일 연속 체중 안 늘면: 인공 수유 고려',
      '',
      '어미의 유선 상태가 어떤가요?',
    ].join('\n')
  }

  // ── 부신 기능 부전 (애디슨병) 위기 ─────────────────────────────
  if (/애디슨\s*(위기|쇼크|발작|응급)|addisonian\s*crisis|부신\s*(위기|응급|쇼크)|코르티솔\s*(위기|응급|갑자기\s*없어)/.test(text)) {
    return [
      '🚨 애디슨 위기 응급 안내',
      '',
      '애디슨 위기는 생명을 위협하는 응급 상황이에요.',
      '',
      '【애디슨 위기란?】',
      '부신에서 코르티솔·알도스테론이 갑자기 부족해지는 상태.',
      '진단 안 된 애디슨병 환자나 평소 용량보다 스트레스가 많을 때 발생.',
      '',
      '【발생 원인】',
      '• 진단 안 된 애디슨병 (혼수상태로 처음 발견)',
      '• 장기 스테로이드 복용 중 갑자기 중단',
      '• 심한 스트레스 (수술, 감염, 외상) — 스테로이드 용량 증가 필요',
      '',
      '【증상 (Addisonian Crisis)】',
      '• 갑작스러운 허탈, 쇼크',
      '• 심한 구토·설사',
      '• 저혈당',
      '• 저나트륨혈증, 고칼륨혈증',
      '• 심장 부정맥 (고칼륨으로)',
      '',
      '【응급 처치】',
      '1. 즉시 정맥 수액 (생리식염수 — 전해질 교정)',
      '2. 덱사메타손 정맥 투여 (빠른 코르티솔 보충)',
      '3. 혈당 모니터링',
      '4. 심전도 모니터링 (칼륨 위험)',
      '',
      '【평소 관리 (기존 환자)】',
      '• 스트레스 상황 시 스테로이드 용량 2~3배 일시 증량',
      '• "애디슨 환자" 목줄 태그 달아두기',
      '',
      '현재 어떤 증상이 있나요?',
    ].join('\n')
  }

  // ── 고양이 당뇨 혈당 조절 어려움 ───────────────────────────────
  if (/고양이\s*(당뇨\s*혈당|인슐린\s*조절|혈당\s*조절\s*어려|당뇨\s*관리)|고양이\s*인슐린\s*(양|용량|어렵|복잡)|당뇨\s*고양이\s*(관해|remission)/.test(text)) {
    return [
      '🔬 고양이 당뇨 혈당 조절 심층 안내',
      '',
      '고양이 당뇨는 잘 관리하면 인슐린 없이 관해(remission)가 가능해요!',
      '',
      '【고양이 당뇨의 특수성】',
      '고양이는 스트레스로 혈당이 크게 올라 (스트레스 고혈당).',
      '병원에서 측정한 혈당이 실제보다 높을 수 있어요.',
      '→ 집에서 혈당 측정이 중요 (귀·발바닥 채혈)',
      '',
      '【당뇨 관해 (Remission) — 고양이만의 특징】',
      '• 40~60%의 고양이가 적절 치료로 인슐린 불필요해질 수 있음',
      '• 조기 진단 + 저탄수화물 식이 + 인슐린 치료 → 관해 가능성 높음',
      '',
      '【혈당 조절이 어려운 이유】',
      '• 스트레스 고혈당',
      '• 감염·다른 질환 공존 (갑상선항진증, 췌장염)',
      '• 인슐린 부적절한 보관·사용',
      '• 식이 탄수화물 함량 높음',
      '',
      '【식이 관리 (핵심)】',
      '• 저탄수화물 고단백 습식: 탄수화물 10% 이하',
      '• 처방식: 힐스 m/d, 로얄캐닌 Diabetic',
      '• 건식보다 습식이 혈당 안정에 유리',
      '',
      '【인슐린 (고양이에서 주로 사용)】',
      '• Glargine (lantus): 관해율 가장 높음',
      '• PZI (ProZinc): 고양이 특화 허가 제품',
      '',
      '집에서 혈당을 측정하고 계신가요?',
    ].join('\n')
  }

  // ── 반려동물 피부 검사 종류 ─────────────────────────────────────
  if (/피부\s*(검사|진단\s*방법|검사\s*종류)|피부\s*(세포\s*검사|배양|스크래핑|피부\s*생검)|skin\s*(scraping|cytology|biopsy)/.test(text)) {
    return [
      '🔬 피부 검사 종류 안내',
      '',
      '피부 문제를 정확히 진단하려면 적절한 검사가 필요해요.',
      '',
      '【피부 세포 검사 (Cytology)】',
      '• 방법: 테이프 스트립, 면봉 채취, 세침흡인',
      '• 알 수 있는 것: 세균, 진균(말라세지아), 염증 세포',
      '• 빠르고 저렴 (즉석 결과)',
      '',
      '【피부 스크래핑 (Skin Scraping)】',
      '• 칼날로 피부 표면을 긁어 채취',
      '• 알 수 있는 것: 옴(sarcoptes), 모낭충(demodex)',
      '• 표재성 스크래핑: 옴 진단',
      '• 심층 스크래핑: 모낭충 진단',
      '',
      '【진균 배양 (Fungal Culture)】',
      '• 피부사상균(링웜) 배양 2~4주 소요',
      '• DTM 배지: 양성이면 붉게 변함',
      '',
      '【피부 생검 (Biopsy)】',
      '• 피부 조각을 채취해 조직병리 검사',
      '• 진단 어려운 피부 질환, 종양 의심 시',
      '• 가장 정확하지만 마취 필요',
      '',
      '【알레르기 검사】',
      '• 혈청 IgE 검사: 알레르겐 특이 항체',
      '• 피내 반응 검사: 여러 알레르겐 피부에 주입',
      '• 근거: 배제 식이 시험이 더 신뢰성 높음',
      '',
      '어떤 피부 증상으로 검사를 받으셨나요?',
    ].join('\n')
  }

  // ── 개 고관절 이형성증 관리 ─────────────────────────────────────
  if (/고관절\s*(이형성증\s*관리|dysplasia\s*관리|수술\s*vs|약물\s*치료|수영|재활)|CHD\s*(관리|치료)|엉덩이\s*(이형성|관절\s*이상)/.test(text)) {
    return [
      '🦴 고관절 이형성증 관리 안내',
      '',
      '고관절 이형성증은 조기 관리로 삶의 질을 크게 개선할 수 있어요.',
      '',
      '【고관절 이형성증이란?】',
      '고관절(엉덩이 관절)이 불완전하게 형성되어 조기 관절염 발생.',
      '대형견에서 주로 발생 (골든, 래브라도, 저먼 셰퍼드).',
      '',
      '【증상 (나이에 따라 다름)】',
      '• 어린 경우: 토끼 걸음 (뒷다리 함께 뛰는), 관절 느슨함',
      '• 성견: 관절염으로 서서히 절뚝거림, 운동 후 악화',
      '',
      '【내과 치료 (수술 안 할 경우)】',
      '• 체중 관리: 가장 효과적인 관리',
      '• NSAIDs: 통증·염증 조절',
      '• 관절 보조제: 오메가-3, 글루코사민',
      '• 재활: 수중 트레드밀, 수영 (관절 부담 없음)',
      '• 운동: 규칙적인 저강도 운동 (달리기보다 산책)',
      '',
      '【수술 옵션】',
      '■ 어린 강아지 (<1살): 교정 수술 (DPO/TPO)',
      '■ 성견: FHO (대퇴골두 절제술) — 소형·중형견',
      '■ 심한 경우: 전고관절 치환술 (비용 높음)',
      '',
      '몇 살이고, 어떤 증상이 있나요?',
    ].join('\n')
  }

  // ── 개·고양이 백내장 관리 / 수술 ──────────────────────────────
  if (/백내장\s*(수술|언제|심한|관리|진행|예방|눈\s*하얀)|cataract\s*(surgery|management)|눈이\s*(하얗게|뿌옇게|흐리게)/.test(text)) {
    return [
      '👁️ 백내장 관리·수술 안내',
      '',
      '백내장 진행 정도에 따라 관리 방법이 달라요.',
      '',
      '【백내장 진행 단계】',
      '1단계 (초기): 수정체 일부 혼탁, 시력 영향 적음',
      '2단계 (미성숙): 혼탁 진행, 시력 저하',
      '3단계 (성숙): 대부분 혼탁, 시력 크게 저하',
      '4단계 (과성숙): 수정체 융해 → 포도막염 위험',
      '',
      '【수술 적응증】',
      '• 2~3단계에서 수술이 가장 효과적',
      '• 4단계(과성숙)는 수술 합병증 증가',
      '• 당뇨성 백내장: 급격히 진행하므로 조기 수술 권장',
      '',
      '【수술 (Phacoemulsification)】',
      '• 초음파로 혼탁한 수정체 분쇄 후 흡인',
      '• 인공 수정체 삽입',
      '• 성공률 90% 이상 (포도막염 없는 경우)',
      '',
      '【수술 전 평가】',
      '• ERG (망막 기능 확인): 망막 기능 있어야 수술 의미',
      '• 초음파: 유리체·망막 이상 확인',
      '• 전신 건강 평가',
      '',
      '【수술 안 할 경우 관리】',
      '• 항산화 점안액 (근거 제한적이지만 시도 가능)',
      '• 포도막염 주시: 과성숙 시 염증 통증 발생',
      '',
      '현재 어느 단계까지 진행됐나요?',
    ].join('\n')
  }

  // ── 개 임신 중 약물 안전성 ──────────────────────────────────────
  if (/임신\s*(중\s*약물|중\s*약|상태에서\s*약|중\s*치료)|임신\s*개\s*(약|치료|약물)|수유\s*중\s*(약물|약|투약)/.test(text)) {
    return [
      '⚠️ 임신·수유 중 약물 안전성 안내',
      '',
      '임신·수유 중 약물은 반드시 수의사와 상의가 필요해요.',
      '',
      '【임신 중 피해야 하는 약물】',
      '🚫 절대 금지:',
      '• 메트로니다졸 (Metronidazole): 첫 분기 기형 유발',
      '• NSAIDs: 태반 발달 방해, 분만 지연',
      '• 아자치오프린: 골수 억제',
      '• 독시사이클린: 태아 뼈·치아 발달 영향',
      '• 테트라사이클린 계열',
      '• 항진균제 일부 (fluconazole)',
      '',
      '【임신 중 일반적으로 안전한 약물】',
      '• 아목시실린 (페니실린 계열): 세균 감염 시',
      '• 마로피탄트 (Cerenia): 구역·구토',
      '• 프레드니솔론 (단기·저용량): 염증 시 조심',
      '',
      '【예방 구충·기생충 약】',
      '• 벼룩·진드기 약: 제품마다 임신 안전성 다름',
      '• 이버멕틴: 일부 제품 금기',
      '• Pyrantel (파란텔): 비교적 안전',
      '',
      '【수유 중 주의】',
      '• 대부분 약물이 모유로 일부 이행',
      '• 새끼에 미치는 영향 평가 필요',
      '',
      '어떤 약이 필요한 상황인가요?',
    ].join('\n')
  }

  // ── 강아지 성격·기질 테스트 ─────────────────────────────────────
  if (/강아지\s*(성격|기질|테스트|평가|어떤\s*성격)|분양\s*(전\s*테스트|확인)|기질\s*(테스트|평가)|어떤\s*(성격\s*강아지|아이를\s*데려)/.test(text)) {
    return [
      '🐕 강아지 성격·기질 평가 안내',
      '',
      '분양 전에 아이의 기질을 이해하면 더 잘 맞는 강아지를 선택할 수 있어요.',
      '',
      '【기질 평가 항목 (Volhard Puppy Aptitude Test)】',
      '□ 사회성: 낯선 사람에게 다가가나요?',
      '□ 복종성: 등을 댔을 때 반응이 어떤가요?',
      '□ 호기심: 새 물건에 접근하나요, 피하나요?',
      '□ 소음 반응: 갑작스러운 소리에 어떻게 반응?',
      '□ 촉각 민감도: 발·귀 만질 때 반응?',
      '',
      '【기질별 적합한 보호자】',
      '● 순종적·낮은 독립심: 초보 보호자에게 적합',
      '● 독립적·강한 의지: 경험 있는 보호자, 훈련 필요',
      '● 에너지 높음: 활동적인 보호자, 넓은 공간',
      '● 예민·소심: 조용한 환경, 인내심 있는 보호자',
      '',
      '【품종 기질 참고】',
      '• 독립심 강한 품종: 시바이누, 차우차우',
      '• 훈련 잘 되는 품종: 골든리트리버, 래브라도, 보더 콜리',
      '• 활동량 높은 품종: 잭 러셀, 달마시안, 시베리안 허스키',
      '• 아파트 적합: 프렌치 불독, 퍼그, 말티즈',
      '',
      '어떤 생활 환경이고, 어떤 성격의 아이를 원하시나요?',
    ].join('\n')
  }

  // ── 방사선 치료 (방사선 요법) ───────────────────────────────────
  if (/방사선\s*(요법|치료|치료비|효과|부작용|횟수|종양)|방사선\s*치료\s*(가능|어디서|가격)|radiation\s*(therapy|oncology)/.test(text)) {
    return [
      '☢️ 반려동물 방사선 치료 안내',
      '',
      '방사선 치료는 수술이 어려운 종양이나 절제 후 잔존 종양에 효과적이에요.',
      '',
      '【방사선 치료가 유용한 경우】',
      '• 수술로 완전 제거 어려운 부위 종양 (코강, 뇌, 척추)',
      '• 절제 후 dirty margin (잔존 종양 세포)',
      '• 구강·비강 암 (SCC, 비만세포종, 비강 종양)',
      '• 림프종 (국소형)',
      '',
      '【치료 방식】',
      '■ 분할 조사 (Fractionated Radiation)',
      '• 소량을 15~20회에 나눠 조사',
      '• 매일 또는 격일 마취 필요',
      '• 목표: 정상 조직 보호 + 종양 파괴',
      '',
      '■ 정위 방사선 수술 (SRS/SBRT)',
      '• 고선량을 1~3회에 정밀 조사',
      '• 마취 횟수 적음',
      '• 뇌종양 등에 유용',
      '',
      '【부작용】',
      '• 조사 부위 피부 발적·탈모',
      '• 점막 염증 (구내 조사 시)',
      '• 눈 주변: 백내장 위험',
      '• 장기적: 방사선 괴사 (드물게)',
      '',
      '【국내 시행 가능 병원】',
      '서울대, 건국대, 충남대 수의대 병원 등 대형 시설 필요',
      '',
      '어떤 종양으로 방사선 치료를 고려하시나요?',
    ].join('\n')
  }

  // ── 개 갑상선 저하증 약 용량 조절 ─────────────────────────────
  if (/갑상선\s*(저하\s*약|약\s*용량|levothyroxine|T4\s*약|솔록신|레보티록신)\s*(용량|조절|얼마나|반응)|갑상선\s*저하\s*(치료\s*반응|약\s*효과|모니터)/.test(text)) {
    return [
      '💊 갑상선저하증 약물 용량 조절 안내',
      '',
      '레보티록신 용량은 혈중 T4 수치로 조정해요.',
      '',
      '【레보티록신 (Levothyroxine) 투약】',
      '• 표준 용량: 0.02 mg/kg, 하루 2회',
      '• 흡수가 사료와 함께 달라지므로 항상 같은 시간 (식전 또는 식후)',
      '',
      '【치료 효과 확인 (처음 4~8주 후)】',
      '• 투약 4~6시간 후 혈중 T4 측정 (peak 시점)',
      '• 목표 범위: 2.0~4.0 μg/dL',
      '• 너무 낮으면: 용량 25% 증량',
      '• 너무 높으면: 용량 25% 감량',
      '',
      '【치료 반응 시기】',
      '• 무기력·기운 개선: 2~4주',
      '• 피부·털 개선: 2~4개월',
      '• 체중 감소: 2~3개월',
      '',
      '【과잉 복용 (갑상선기능항진증) 징후】',
      '• 급격한 활동량 증가, 과호흡',
      '• 체중 감소, 식욕 증가',
      '• 부정맥',
      '',
      '【정기 모니터링】',
      '• 처음: 4~8주마다',
      '• 안정 후: 6개월~1년에 한 번',
      '',
      '현재 어떤 증상이 지속되고 있나요?',
    ].join('\n')
  }

  // ── 거북·파충류·특수 동물 의료 ──────────────────────────────────
  if (/거북\s*(건강|병원|질환)|파충류\s*(병원|건강|온도|UV)|도마뱀\s*(건강|먹이)|뱀\s*(건강|먹이)|이구아나|특수\s*동물\s*(병원|건강)/.test(text)) {
    return [
      '🦎 파충류·특수 동물 건강 안내',
      '',
      '파충류는 일반 동물병원이 아닌 특수 동물 전문 병원이 필요해요.',
      '',
      '【파충류 건강의 기본 (POTZ — 적정 온도 범위)】',
      '파충류는 변온 동물이에요. 온도가 잘못되면 모든 것이 망가져요.',
      '• 거북 (레드이어 슬라이더): 낮 25~30도, 바스킹 35도',
      '• 레오파드 게코: 낮 28~32도, 바스킹 35도, 밤 20~25도',
      '',
      '【필수 세팅 요소】',
      '• UV-B 조명: 거북·이구아나·도마뱀에 필수 (비타민D3 합성)',
      '  없으면 대사성 골 질환(MBD) — 뼈가 약해짐',
      '• 온도 그라디언트: 더운 쪽과 시원한 쪽 모두',
      '',
      '【흔한 질환】',
      '• 대사성 골 질환 (MBD): UV 부족, 칼슘 부족',
      '  → 다리 휘어짐, 턱 부드러워짐',
      '• 흰 점 무늬 (곰팡이): 적절한 습도 조절',
      '• 호흡기 감염: 콧물, 호흡 소리',
      '• 식욕 부진: 온도, 스트레스 가장 흔한 원인',
      '',
      '【국내 특수 동물 전문 병원】',
      '일반 동물병원에서 거부하거나 경험 없는 경우 많음.',
      '"특수동물 전문" 또는 "이국적 동물" 전문 병원 검색 권장.',
      '',
      '어떤 동물이고, 어떤 증상인가요?',
    ].join('\n')
  }

  // ── 비장 종양 / 비장 제거 ─────────────────────────────────────
  if (/비장\s*(종양|혹|제거|절제|비대|혈관육종)|spleen\s*(tumor|mass|removal)|비절제술|비장\s*(울퉁불퉁|커진)/.test(text)) {
    return [
      '🏥 비장 종양·비장 절제 안내',
      '',
      '비장에 혹이 생기면 즉시 평가가 필요해요.',
      '',
      '【비장 종양 종류 (개에서 흔한 것)】',
      '■ 혈관육종 (Hemangiosarcoma) — 악성, 가장 흔함',
      '• 비장 내 혈관에서 발생',
      '• 파열 전까지 무증상 → 갑작스러운 내출혈',
      '• 전이 빠름 (폐, 간, 심장)',
      '',
      '■ 결절성 과형성 / 혈종 — 양성',
      '• 비장에서 가장 흔한 양성 병변',
      '• 혈관육종과 초음파로 구별 어려움',
      '',
      '■ 비만세포종 (고양이에서 비장 종양 2위)',
      '',
      '【파열 시 응급 신호】',
      '🚨 갑작스러운 허탈, 창백한 잇몸, 복부 팽만',
      '→ 즉시 응급 수술 (비절제술)',
      '',
      '【수술 (비절제술, Splenectomy)】',
      '• 비장 전체 제거',
      '• 파열 시 응급, 종양 발견 시 예정 수술',
      '• 비장 없이도 정상 생활 가능',
      '',
      '【수술 후 예후 (혈관육종)】',
      '• 수술 단독: 평균 2~3개월',
      '• 수술 + 항암 (독소루비신): 평균 6개월',
      '',
      '초음파에서 어떤 소견이 나왔나요?',
    ].join('\n')
  }

  // ── 개 전립선 비대·낭종·전립선암 ─────────────────────────────
  if (/전립선\s*(비대|낭종|암|종양|문제)|prostatic\s*(hypertrophy|cyst|cancer)|중성화\s*(안\s*한|수컷|남자)\s*(전립선|소변)/.test(text)) {
    return [
      '🏥 개 전립선 질환 안내',
      '',
      '중성화 안 된 수컷에서 전립선 문제가 잦아요.',
      '',
      '【전립선 질환 종류】',
      '■ 양성 전립선 비대 (BPH) — 가장 흔함',
      '• 중성화 안 된 수컷에서 나이 들수록 진행',
      '• 증상: 배변 어려움, 리본처럼 납작한 대변, 혈뇨',
      '• 치료: 중성화 수술 → 대부분 개선',
      '',
      '■ 전립선 낭종',
      '• BPH 합병이나 단독으로 발생',
      '• 초음파에서 낭성 구조물',
      '• 주사 배액 또는 중성화로 관리',
      '',
      '■ 전립선 농양 (Prostatic Abscess)',
      '• 세균 감염으로 고름 차는 것',
      '• 증상: 발열, 배뇨 곤란, 복통',
      '• 즉시 항생제 + 배액 수술',
      '',
      '■ 전립선암 (Prostatic Adenocarcinoma)',
      '• 중성화 여부 관계없이 발생',
      '• 전이 빠름 (폐, 림프절, 뼈)',
      '• 예후 불량',
      '',
      '【진단】',
      '• 직장 내 촉진 (크기, 단단함)',
      '• 초음파: 내부 구조 확인',
      '• 전립선 세포 검사 (전립선 세척액 배양)',
      '',
      '배변이 힘들거나 소변 이상이 있나요?',
    ].join('\n')
  }

  // ── 혈액형 검사 / 유전자 검사 ──────────────────────────────────
  if (/유전자\s*(검사|패널|질환|결과)|DNA\s*(검사|질환|결과)|genetic\s*(testing|panel)|품종\s*(유전자|DNA\s*검사)|유전성\s*(질환\s*검사|검사)/.test(text)) {
    return [
      '🔬 반려동물 유전자 검사 안내',
      '',
      '유전자 검사로 숨겨진 유전 질환 위험을 미리 알 수 있어요.',
      '',
      '【유전자 검사의 활용】',
      '• 번식 전: 유전 질환 보인자 여부 확인',
      '• 구입·입양 전: 품종 특이 유전 질환 확인',
      '• 증상 원인 파악: 특정 유전 질환 확진',
      '',
      '【품종별 주요 검사 대상】',
      '■ 골든리트리버: PRA, Ichthyosis, Muscular Dystrophy',
      '■ 래브라도: EIC(운동 유발 허탈), CNM, HNPK',
      '■ 코기: DM(퇴행성 척수증), vWD',
      '■ 말리노이즈: GPRA',
      '■ 보더 콜리: CEA, TNS, NCL',
      '■ 닥스훈트: IVDD 관련 CDDY/CDPA',
      '',
      '【검사 방법】',
      '• 면봉으로 볼 안 점막 채취 또는 혈액',
      '• 국내 서비스: 일부 동물 유전자 검사 회사',
      '• 해외: Embark, Wisdom Panel (영어)',
      '',
      '【결과 해석】',
      '• Clear/Normal: 이상 없음',
      '• Carrier: 증상 없지만 자손에 전달 가능',
      '• Affected: 유전 질환 보유',
      '',
      '어떤 품종이고, 어떤 목적으로 검사를 고려하시나요?',
    ].join('\n')
  }

  // ── 강박 장애 / 반복 행동 (OCD-like) ──────────────────────────
  if (/강박\s*(행동|장애|핥기|씹기|빙글|꼬리)|반복\s*(행동|핥기|씹기|빙글|돌기)|꼬리\s*(쫓기|물기|빙글)|그림자\s*(쫓기|쫓아)|빛\s*(쫓기|쫓아)/.test(text)) {
    return [
      '🧠 강박 행동 (OCD) 관리 안내',
      '',
      '반복적인 행동이 일상을 방해한다면 개입이 필요해요.',
      '',
      '【개에서 흔한 강박 행동】',
      '• 꼬리 쫓기·물기',
      '• 그림자·빛 쫓기',
      '• 같은 길 반복 걷기 (trancing)',
      '• 과도한 핥기 (한 부위 집중)',
      '• 허공 물기 (fly biting)',
      '',
      '【고양이에서 흔한 강박 행동】',
      '• 털 과잉 그루밍 → 탈모',
      '• 양모증 (옷·천 씹어 먹기)',
      '• 과잉 울기',
      '',
      '【원인 및 촉발 요인】',
      '• 스트레스 (환경 변화, 다른 동물 갈등)',
      '• 운동 부족, 사회적 자극 부족',
      '• 유전적 소인 (도베르만: 옆구리 핥기)',
      '• 신경학적 요인 (fly biting)',
      '',
      '【관리 방법】',
      '• 행동 방해: 강박 행동 시작 전에 다른 활동으로 전환',
      '• 충분한 운동·자극 제공',
      '• 스트레스 요인 제거',
      '• 약물: 플루옥세틴 SSRI, 클로미프라민',
      '',
      '행동이 언제 시작됐고, 얼마나 자주 하나요?',
    ].join('\n')
  }

  // ── 고양이 심장 초음파·HCM 모니터링 ─────────────────────────────
  if (/HCM\s*(모니터|추적|초음파\s*주기|심장)|비대성\s*심근병증\s*(모니터|추적|검사\s*주기)|고양이\s*심초음파\s*(언제|주기|빈도|얼마나)/.test(text)) {
    return [
      '❤️ 고양이 HCM 모니터링 안내',
      '',
      'HCM은 진행 속도 추적을 위해 정기 심초음파가 필요해요.',
      '',
      '【HCM 심초음파 모니터링 주기】',
      '• 진단 초기: 3~6개월마다 추적',
      '• 안정적인 경우: 6~12개월마다',
      '• 약물 시작 후: 4~8주 후 재평가',
      '• 증상 변화 있을 때: 즉시 재검사',
      '',
      '【모니터링 핵심 파라미터】',
      '• 좌심실 벽 두께 (IVSd, LVPWd): 6mm 이상이면 경계선',
      '• 좌심방 크기 (LA:Ao 비율): 1.5 이상이면 비대',
      '• 좌심방 크기 증가 = 울혈성 심부전·ATE 위험 증가',
      '',
      '【LA 비율과 약물 시작 기준】',
      '• LA:Ao < 1.5: 약물 불필요 (경과 관찰)',
      '• LA:Ao 1.5~1.7: 클로피도그렐 시작 고려',
      '• LA:Ao > 1.8: 아테놀롤, 베나프릴 추가 고려',
      '• 울혈성 심부전: 퓨로세미드 즉시',
      '',
      '【집에서 호흡수 모니터】',
      '잠든 상태에서 1분간 호흡수 측정:',
      '• 정상: 25회 이하/분',
      '• 30회 이상 지속: 병원 방문',
      '• 40회 이상: 즉시 응급',
      '',
      '마지막 심초음파가 언제였나요?',
    ].join('\n')
  }

  // ── 혈액 응고 장애 / DIC ────────────────────────────────────────
  if (/DIC|파종성\s*혈관내\s*응고|응고\s*(장애|이상)|혈액\s*(응고\s*못|응고\s*이상|응고\s*검사)|PT\s*시간|APTT|platelet\s*count\s*(낮|떨어|없음)/.test(text)) {
    return [
      '🚨 혈액 응고 장애 / DIC 안내',
      '',
      '응고 장애는 생명을 위협하는 심각한 상태예요.',
      '',
      '【DIC (파종성 혈관내 응고)란?】',
      '혈관 내에서 과도한 응고가 일어나 혈전이 생기고,',
      '동시에 응고 인자가 고갈되어 출혈도 동반되는 역설적 상태.',
      '',
      '【DIC를 유발하는 원인 질환】',
      '• 패혈증·쇼크',
      '• 비장·간 혈관육종 파열',
      '• 중증 췌장염',
      '• 독소 (쥐약 — 특히 항응고제형)',
      '• 심한 외상, 열사병',
      '',
      '【증상】',
      '• 다부위 출혈 (잇몸, 코, 피부)',
      '• 피부 점상 출혈',
      '• 혈변·혈뇨',
      '• 동시에 혈전으로 인한 장기 부전',
      '',
      '【진단 검사】',
      '• PT/APTT 연장',
      '• Fibrinogen 감소',
      '• D-dimer 증가',
      '• 혈소판 감소',
      '',
      '【치료】',
      '• 원인 질환 즉시 치료',
      '• 신선동결혈장 (FFP): 응고 인자 보충',
      '• 헤파린 (논란 있지만 일부 사용)',
      '',
      '어떤 증상으로 DIC가 의심되나요?',
    ].join('\n')
  }

  // ── 개 위암 / 소화관 종양 ────────────────────────────────────────
  if (/위\s*(암|종양|선암|림프종)|소화관\s*(종양|암)|adenocarcinoma\s*(위|장)|위\s*(용종|폴립|혹)/.test(text)) {
    return [
      '🎗️ 개 위·소화관 종양 안내',
      '',
      '소화관 종양은 증상이 모호해 진단이 늦어지기 쉬워요.',
      '',
      '【개에서 흔한 소화관 종양】',
      '■ 위 선암 (Gastric Adenocarcinoma)',
      '• 드물지만 예후 불량',
      '• 포르투기즈 워터 독, 콜리에서 소인',
      '• 증상: 만성 구토, 체중 감소, 흑변',
      '',
      '■ 위장관 림프종',
      '• 만성 구토·설사·체중 감소',
      '• 소형 세포 림프종 (고양이에서 가장 흔한 소화관 종양)',
      '• 대형 세포 림프종: 예후 불량',
      '',
      '■ 위장관 간질 종양 (GIST)',
      '• 위·소장의 근육층에서 발생',
      '• 출혈·폐색 유발 가능',
      '',
      '【진단】',
      '• 내시경 + 생검: 가장 정확',
      '• 초음파: 벽 두께, 종양 위치',
      '• CT: 전이 여부',
      '',
      '【치료】',
      '• 국소 종양: 수술 절제',
      '• 림프종: 항암 치료 (CHOP 또는 CCNU)',
      '• 고양이 소형세포 림프종: 클로람부실 + 프레드니솔론 (비교적 좋은 예후)',
      '',
      '어떤 증상이 언제부터 있었나요?',
    ].join('\n')
  }

  // ── 비타민·미네랄 과잉 독성 ──────────────────────────────────────
  if (/비타민\s*(A|D|독성|과잉|너무\s*많이|중독)|미네랄\s*(과잉|독성)|칼슘\s*(과잉\s*보충|너무\s*많이)|인\s*(과잉|너무\s*많이)/.test(text)) {
    return [
      '⚠️ 비타민·미네랄 과잉 독성 안내',
      '',
      '"더 주면 더 좋다"는 생각이 오히려 해가 될 수 있어요.',
      '',
      '【비타민 A 과잉 (Hypervitaminosis A)】',
      '• 고양이에서 특히 위험 (간 과다 섭취 시)',
      '• 증상: 목과 앞다리 관절 강직, 척추 변형',
      '• 원인: 날 간, 비타민 A 보충제 과다',
      '',
      '【비타민 D 과잉 (Hypervitaminosis D)】',
      '• 증상: 고칼슘혈증 → 구토, 무기력, 신장 손상',
      '• 원인: 고용량 비타민D 보충제, 쥐약 일부',
      '',
      '【칼슘 과잉】',
      '• 성장기 대형견에서 특히 위험',
      '• 정형외과 발달 장애 유발',
      '• 현재 생식·사료에 이미 적절량 포함 → 추가 불필요',
      '',
      '【인(P) 과잉】',
      '• 신장 질환 악화',
      '• 일반 사료에서 과잉은 드물지만 신부전 환자는 제한 필요',
      '',
      '【사람 보충제를 반려동물에 주면 안 되는 이유】',
      '• 용량이 다름 (사람 기준 vs 동물 기준)',
      '• 추가 성분 독성 가능 (자일리톨, 특정 향신료)',
      '',
      '어떤 보충제를 얼마나 주고 계신가요?',
    ].join('\n')
  }

  // ── 고양이 인식표·칩 등록 ──────────────────────────────────────
  if (/마이크로칩\s*(등록|삽입|필요성|어디서)|인식\s*(표|칩|번호)|동물\s*(등록|번호)|외출\s*고양이\s*(미아|잃어버림\s*대비)/.test(text)) {
    return [
      '📋 동물 등록·마이크로칩 안내',
      '',
      '마이크로칩 등록은 잃어버렸을 때 찾을 수 있는 가장 확실한 방법이에요.',
      '',
      '【동물 등록 의무 (국내 법률)】',
      '• 개: 2개월 이상 모든 개 등록 의무',
      '• 고양이: 의무 아니지만 권장',
      '',
      '【마이크로칩이란?】',
      '쌀알 크기의 전자 칩을 피하에 삽입.',
      '스캐너로 15자리 고유 번호 확인 → 보호자 연락처 찾기 가능.',
      '',
      '【삽입 과정】',
      '• 주삿바늘로 피하 삽입 (고통 최소화)',
      '• 위치: 목 뒤 또는 어깨 사이',
      '• 마취 불필요 (검진 시 or 수술 시 같이 가능)',
      '',
      '【등록 방법 (국내)】',
      '• 동물병원에서 삽입 + 국가동물보호정보시스템 등록',
      '• 기존 칩 있으면 정보만 업데이트 가능',
      '• 인식표도 함께 착용 권장 (칩 스캔 기기 없는 경우 대비)',
      '',
      '【잃어버렸을 때】',
      '• 지역 동물보호센터 신고',
      '• 포털 "동물보호관리시스템" 실종 신고',
      '• SNS 지역 커뮤니티 공유',
      '',
      '칩 등록이 되어 있나요?',
    ].join('\n')
  }

  // ── 사료 원료 읽는 법 / 성분표 해석 ────────────────────────────
  if (/사료\s*(원료|성분표|보는\s*법|해석|읽는\s*법|좋은\s*사료\s*고르기)|사료\s*(첫\s*번째\s*성분|원재료|품질\s*확인)/.test(text)) {
    return [
      '🍽️ 사료 성분표 읽는 법',
      '',
      '성분표를 읽을 줄 알면 좋은 사료를 고를 수 있어요.',
      '',
      '【성분표 순서의 의미】',
      '원료는 중량 순으로 나열돼요 (많은 것이 앞에)',
      '• 첫 번째 성분이 단백질원이면 좋음',
      '  (닭고기, 소고기, 연어 등)',
      '• 첫 번째가 탄수화물 (옥수수, 밀)이면 단백질 함량 적을 수 있음',
      '',
      '【좋은 성분 신호】',
      '• 실제 고기 명시: "닭고기", "소고기" (meat meal도 괜찮음)',
      '• 오메가-3 출처 (연어 오일)',
      '• 명확한 탄수화물원 (고구마, 완두콩)',
      '',
      '【주의할 성분 신호】',
      '• 고기 부산물 (명확한 명시 없으면 품질 불명)',
      '• "Meat meal" 불명확 — "Chicken meal"은 괜찮음',
      '• 설탕·캐러멜: 기호성 위한 첨가물',
      '• 인공 보존제 (BHA, BHT, Ethoxyquin)',
      '',
      '【보증 성분 (Guaranteed Analysis)】',
      '• 조단백질, 조지방, 수분, 조회분, 조섬유',
      '• 건식 사료는 수분을 제거하고 비교 (건물 기준 계산)',
      '',
      '【사료 선택 기준 요약】',
      '• 첫 성분 = 고기 이름 명시',
      '• 브랜드의 자체 연구·AAFCO 인증',
      '• 아이에게 맞는 생애 단계',
      '',
      '현재 어떤 사료를 먹이고 있나요?',
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
