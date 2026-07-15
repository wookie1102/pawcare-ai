import type { PetProfile } from './storage'

export type QuestionSystem = 'respiratory' | 'neurological' | 'urinary' | 'digestive' | 'skin' | 'eye' | 'ear' | 'orthopedic' | 'dental' | 'lump' | 'endocrine' | 'general'
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
const SKIN_KW = ['긁어', '긁고', '긁는', '긁음', '가려워', '가렵', '핥아', '핥고', '핥는', '털이 빠', '탈모', '발진', '피부', '두드러기', '비듬', '각질', '발바닥을 핥', '피부가 붉']
const EYE_KW = ['눈곱', '충혈', '눈을 비', '눈물이', '눈이 뿌', '백내장', '눈이 흐', '눈이 부어', '눈 분비물']
const EAR_KW = ['귀를 긁', '귀 긁', '귀에서', '외이염', '귀 냄새', '머리를 흔', '귀 분비물', '귀 안에', '귀가', '귀를 만져', '귀 쪽']
const ORTHOPEDIC_KW = ['절뚝', '다리를 절', '절름', '계단을 못', '앉았다 일어', '관절', '슬개골', '다리가 아', '걸음걸이', '다리를 들', '다리를 못', '다리가 이상', '뒷다리', '앞다리']
const DENTAL_KW = ['입냄새', '구취', '이빨', '잇몸', '치석', '이를 못', '씹기', '치아', '이가 흔들', '입 안', '이빨이', '입에서 냄새']
const LUMP_KW = ['혹', '덩어리', '멍울', '종양', '부어올', '혹이', '만져져', '유선', '멍이', '혹을 발견', '뭔가 만져', '혹 같은']
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
    },
    {
      id: 'resp_effort',
      system: 'respiratory',
      text: '호흡은 어떤 상태인가요?',
      options: ['조금 빠른 편이에요', '많이 헐떡거려요', '배까지 움직이며 숨 쉬어요', '입으로 숨 쉬어요'],
      emergencyTriggers: ['배까지 움직이며 숨 쉬어요', '입으로 숨 쉬어요'],
    },
    {
      id: 'resp_cough_type',
      system: 'respiratory',
      text: '기침이 어떤 형태인가요?',
      options: ['마른 기침이에요', '가래가 끓는 듯한 기침이에요', '기침 후 구토해요', '기침은 없고 호흡만 이상해요'],
    },
    {
      id: 'resp_when',
      system: 'respiratory',
      text: '호흡 증상이 언제 더 심해지나요?',
      options: ['밤이나 새벽에 심해요', '운동 후에 심해요', '항상 비슷해요', '자다가 갑자기 깨요'],
    },
    {
      id: 'resp_duration',
      system: 'respiratory',
      text: '이 증상이 얼마나 됐나요?',
      options: ['오늘 갑자기 시작됐어요', '2~3일 됐어요', '1~2주 됐어요', '1개월 이상이에요'],
      emergencyTriggers: ['오늘 갑자기 시작됐어요'],
    },
    {
      id: 'resp_nasal',
      system: 'respiratory',
      text: '코 분비물이나 재채기가 있나요?',
      options: ['맑은 콧물이 나요', '노랗거나 탁한 콧물이에요', '코피가 났어요', '없어요'],
      emergencyTriggers: ['코피가 났어요'],
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
    {
      id: 'neuro_after',
      system: 'neurological',
      text: '경련·발작 후 상태는 어떤가요?',
      options: ['바로 회복됐어요', '멍하거나 비틀거려요 (수분 내)', '몇 시간째 이상해요', '아직 회복 못 했어요'],
      emergencyTriggers: ['아직 회복 못 했어요'],
    },
    {
      id: 'neuro_first',
      system: 'neurological',
      text: '이런 증상이 처음인가요?',
      options: ['처음이에요', '이전에도 있었어요 (6개월 이상 전)', '최근 반복되고 있어요', '점점 잦아지고 있어요'],
      emergencyTriggers: ['점점 잦아지고 있어요'],
    },
  ],
  urinary: [
    {
      id: 'uri_output',
      system: 'urinary',
      text: '소변을 어떻게 보고 있나요?',
      options: ['소변을 아예 못 봐요', '찔끔씩 자주 시도해요', '소변에 피가 섞여요', '소변량이 많이 줄었어요'],
      emergencyTriggers: ['소변을 아예 못 봐요'],
    },
    {
      id: 'uri_color',
      system: 'urinary',
      text: '소변 색깔이 어떤가요?',
      options: ['노란색 (정상)', '빨갛거나 분홍색이에요', '갈색이나 진한 색이에요', '확인 못 했어요'],
      emergencyTriggers: ['빨갛거나 분홍색이에요', '갈색이나 진한 색이에요'],
    },
    {
      id: 'uri_pain',
      system: 'urinary',
      text: '소변 볼 때 통증 신호가 있나요?',
      options: ['울거나 끙끙거려요', '자세가 이상해 보여요', '배를 핥아요', '특별한 신호 없어요'],
      emergencyTriggers: ['울거나 끙끙거려요'],
    },
    {
      id: 'uri_duration',
      system: 'urinary',
      text: '이 증상이 얼마나 됐나요?',
      options: ['오늘부터예요', '어제부터예요', '2~3일 됐어요', '1주일 이상이에요'],
      emergencyTriggers: ['어제부터예요', '2~3일 됐어요'],
    },
    {
      id: 'uri_drink',
      system: 'urinary',
      text: '물은 평소보다 많이 마시나요?',
      options: ['평소보다 훨씬 많이 마셔요', '비슷하게 마셔요', '오히려 적게 마셔요', '잘 모르겠어요'],
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
      options: ['한 번만 했어요', '하루 1~2회', '하루 3~5회', '하루 6회 이상'],
    },
    {
      id: 'dige_vomit_timing',
      system: 'digestive',
      text: '구토가 언제 일어나나요? (구토가 없으면 마지막 선택)',
      options: ['밥 먹은 직후 바로 토해요', '밥 먹고 1시간 이상 지나서 토해요', '빈속에(공복에) 토해요', '구토는 없어요'],
    },
    {
      id: 'dige_vomit_type',
      system: 'digestive',
      text: '구토물이 어떻게 생겼나요? (구토가 없으면 마지막 선택)',
      options: ['먹은 음식이 나와요', '노랗거나 거품 같아요 (담즙)', '흰 거품이나 침이에요', '구토는 없어요'],
    },
    {
      id: 'dige_stool',
      system: 'digestive',
      text: '대변 상태는 어떤가요?',
      options: ['정상이에요', '묽거나 죽처럼 풀어져요', '물처럼 흘러요', '대변을 못 봤어요'],
    },
    {
      id: 'dige_stool_color',
      system: 'digestive',
      text: '대변 색깔이 어떤가요? (설사가 없으면 마지막 선택)',
      options: ['갈색 (정상)', '검은색이에요 (타르 같아요)', '선홍색 피가 섞여요', '노랗거나 회색이에요'],
    },
    {
      id: 'dige_blood',
      system: 'digestive',
      text: '구토물이나 대변에 피가 섞여 있나요?',
      options: ['둘 다 없어요', '구토에 피가 보여요', '대변에 피가 섞여요', '확인하기 어려워요'],
    },
    {
      id: 'dige_eat',
      system: 'digestive',
      text: '밥과 물을 먹고 있나요?',
      options: ['잘 먹고 마셔요', '물만 조금 마셔요', '거의 안 먹어요', '아무것도 안 먹어요'],
    },
    {
      id: 'dige_vitality',
      system: 'digestive',
      text: '구토/설사 후 기운이 어떻게 보이나요?',
      options: ['비교적 정상이에요', '조금 처져 있어요', '많이 축 처지고 무기력해요', '쓰러지거나 일어나지 못해요'],
      emergencyTriggers: ['쓰러지거나 일어나지 못해요'],
    },
    {
      id: 'dige_fever',
      system: 'digestive',
      text: '몸이 평소보다 뜨겁게 느껴지나요? (발열 확인)',
      options: ['체온이 정상이에요 (38~39℃)', '약간 따뜻한 것 같아요', '뜨겁게 느껴져요', '모르겠어요'],
    },
    {
      id: 'dige_cause',
      system: 'digestive',
      text: '최근에 바뀐 게 있었나요?',
      options: ['새로운 음식이나 간식을 줬어요', '뭔가를 삼켰을 수 있어요', '스트레스 상황이 있었어요', '특별히 바뀐 건 없어요'],
    },
    {
      id: 'dige_abdomen',
      system: 'digestive',
      text: '배를 살짝 눌러보면 어떻게 반응하나요?',
      options: ['아파하지 않아요', '약간 긴장하거나 피해요', '많이 아파해요', '배가 빵빵하게 부풀어 있어요'],
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
  skin: [
    {
      id: 'skin_where',
      system: 'skin',
      text: '주로 어디를 긁거나 핥나요?',
      options: ['얼굴·귀 주변', '배, 겨드랑이', '발바닥·발 사이', '등·꼬리 부근'],
    },
    {
      id: 'skin_look',
      system: 'skin',
      text: '피부 상태가 어떻게 보이나요?',
      options: ['빨갛게 부어있어요', '털이 빠지거나 벗겨져요', '딱지나 상처가 생겼어요', '겉으로는 정상이에요'],
      emergencyTriggers: ['딱지나 상처가 생겼어요'],
    },
    {
      id: 'skin_onset',
      system: 'skin',
      text: '증상이 언제부터, 어떻게 시작됐나요?',
      options: ['갑자기 시작됐어요', '특정 계절에만 심해요', '오래됐는데 점점 심해져요', '새 간식·사료 바꾼 뒤 시작됐어요'],
    },
    {
      id: 'skin_smell',
      system: 'skin',
      text: '피부나 털에서 냄새가 나나요?',
      options: ['퀴퀴하거나 기름진 냄새가 나요', '고름 냄새가 나요', '특별한 냄새 없어요', '잘 모르겠어요'],
      emergencyTriggers: ['고름 냄새가 나요'],
    },
  ],
  eye: [
    {
      id: 'eye_look',
      system: 'eye',
      text: '눈 상태가 어떻게 보이나요?',
      options: ['눈곱이 많이 껴요', '눈이 충혈됐어요', '눈이 뿌옇게 변했어요', '눈이 부어있거나 돌출됐어요'],
      emergencyTriggers: ['눈이 부어있거나 돌출됐어요'],
    },
    {
      id: 'eye_behave',
      system: 'eye',
      text: '눈을 어떻게 하나요?',
      options: ['계속 비벼요', '계속 감고 있어요', '눈물이 많이 나요', '평소와 비슷해요'],
      emergencyTriggers: ['계속 감고 있어요'],
    },
    {
      id: 'eye_discharge',
      system: 'eye',
      text: '눈 분비물이 있다면 어떤 색인가요?',
      options: ['맑거나 투명해요', '노랗거나 초록색이에요', '갈색이나 진해요', '없어요'],
      emergencyTriggers: ['노랗거나 초록색이에요'],
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
      emergencyTriggers: ['노랗거나 고름 같은 분비물'],
    },
    {
      id: 'ear_pain',
      system: 'ear',
      text: '귀 쪽을 만지면 아파하나요?',
      options: ['많이 아파해요 (피해요)', '약간 싫어해요', '괜찮아해요', '확인 못 했어요'],
      emergencyTriggers: ['많이 아파해요 (피해요)'],
    },
    {
      id: 'ear_duration',
      system: 'ear',
      text: '얼마나 됐나요?',
      options: ['오늘 처음이에요', '3~7일 됐어요', '2주 이상이에요', '자주 재발해요'],
      emergencyTriggers: ['2주 이상이에요'],
    },
  ],
  orthopedic: [
    {
      id: 'ortho_leg',
      system: 'orthopedic',
      text: '어떤 다리에 문제가 있나요?',
      options: ['앞다리 한쪽', '뒷다리 한쪽', '여러 다리', '다리보다 허리·등이 문제인 것 같아요'],
    },
    {
      id: 'ortho_onset',
      system: 'orthopedic',
      text: '증상이 어떻게 시작됐나요?',
      options: ['갑자기 못 쓰게 됐어요', '서서히 심해졌어요', '다쳤어요 (낙하·사고)', '오래된 증상이에요'],
      emergencyTriggers: ['갑자기 못 쓰게 됐어요', '다쳤어요 (낙하·사고)'],
    },
    {
      id: 'ortho_when',
      system: 'orthopedic',
      text: '언제 증상이 심해지나요?',
      options: ['항상 절어요', '운동·산책 후 심해요', '아침에 일어날 때 심해요', '앉았다 일어날 때만'],
    },
    {
      id: 'ortho_pain',
      system: 'orthopedic',
      text: '해당 부위를 만지면 어떻게 하나요?',
      options: ['많이 아파해요', '약간 싫어해요', '괜찮아해요', '확인 못 했어요'],
      emergencyTriggers: ['많이 아파해요'],
    },
    {
      id: 'ortho_weight',
      system: 'orthopedic',
      text: '다리에 체중을 실을 수 있나요?',
      options: ['전혀 못 써요', '살짝 짚긴 해요', '절뚝이지만 쓸 수 있어요', '거의 정상이에요'],
      emergencyTriggers: ['전혀 못 써요'],
    },
  ],
  dental: [
    {
      id: 'dental_look',
      system: 'dental',
      text: '입 안이나 치아 상태가 어떤가요?',
      options: ['입냄새가 심해요', '잇몸이 붓거나 빨개요', '치석이 많이 쌓였어요', '이빨이 흔들려요'],
      emergencyTriggers: ['이빨이 흔들려요'],
    },
    {
      id: 'dental_eat',
      system: 'dental',
      text: '밥 먹는 데 영향이 있나요?',
      options: ['밥 먹기 힘들어해요', '한쪽으로만 씹어요', '딱딱한 건 못 먹어요', '별로 영향 없어요'],
      emergencyTriggers: ['밥 먹기 힘들어해요'],
    },
    {
      id: 'dental_gum_color',
      system: 'dental',
      text: '잇몸 색깔이 어떤가요?',
      options: ['분홍색 (정상)', '빨갛거나 보라색이에요', '하얗거나 창백해요', '잘 모르겠어요'],
      emergencyTriggers: ['빨갛거나 보라색이에요'],
    },
    {
      id: 'dental_duration',
      system: 'dental',
      text: '마지막으로 스케일링을 받은 게 언제인가요?',
      options: ['1년 이내', '2~3년 됐어요', '한 번도 안 받았어요', '모르겠어요'],
    },
  ],
  lump: [
    {
      id: 'lump_where',
      system: 'lump',
      text: '혹이나 덩어리가 어디에 있나요?',
      options: ['피부 표면 (손으로 만져져요)', '유선 주변 (젖꼭지 근처)', '입·목 주변', '몸 안쪽인 것 같아요'],
    },
    {
      id: 'lump_feel',
      system: 'lump',
      text: '혹의 느낌이 어떤가요?',
      options: ['말랑하고 잘 움직여요', '딱딱하고 고정돼 있어요', '만지면 아파해요', '빠르게 커지고 있어요'],
      emergencyTriggers: ['빠르게 커지고 있어요', '만지면 아파해요'],
    },
    {
      id: 'lump_size',
      system: 'lump',
      text: '크기가 어느 정도인가요?',
      options: ['완두콩 크기 이하', '포도알 정도', '골프공 이상', '잘 모르겠어요'],
      emergencyTriggers: ['골프공 이상'],
    },
    {
      id: 'lump_when',
      system: 'lump',
      text: '언제 발견했나요?',
      options: ['오늘 처음 발견했어요', '1~2주 됐어요', '한 달 이상 됐어요', '오래됐는데 최근 변했어요'],
      emergencyTriggers: ['오래됐는데 최근 변했어요'],
    },
    {
      id: 'lump_surface',
      system: 'lump',
      text: '혹 표면이 어떻게 보이나요?',
      options: ['피부가 정상이에요', '피부가 변색됐어요', '궤양이나 상처가 있어요', '분비물이 나와요'],
      emergencyTriggers: ['궤양이나 상처가 있어요', '분비물이 나와요'],
    },
  ],
  endocrine: [
    {
      id: 'endo_symptom',
      system: 'endocrine',
      text: '어떤 변화가 가장 눈에 띄나요?',
      options: ['물을 엄청 많이 마셔요', '체중이 갑자기 빠졌어요', '배만 볼록하게 나왔어요', '털이 많이 빠지고 피부가 변했어요'],
    },
    {
      id: 'endo_weight_period',
      system: 'endocrine',
      text: '체중 변화가 얼마나 빠르게 일어났나요?',
      options: ['1~2주 안에 눈에 띄게', '한 달 정도에 걸쳐서', '3개월 이상 서서히', '잘 모르겠어요'],
      emergencyTriggers: ['1~2주 안에 눈에 띄게'],
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
      emergencyTriggers: ['소변량이 많이 늘었어요'],
    },
    {
      id: 'endo_other',
      system: 'endocrine',
      text: '다른 증상도 함께 있나요?',
      options: ['헐떡거리거나 호흡이 빨라요', '복부가 팽창했어요', '근육이 약해졌어요', '특별히 없어요'],
      emergencyTriggers: ['복부가 팽창했어요'],
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

  // 심장병이면 호흡기 문제가 없어도 호흡기 질문 앞에 추가
  if (profile?.conditions?.includes('심장병') && !sorted.includes('respiratory')) {
    sorted.unshift('respiratory')
  }

  const questions: Question[] = []
  const primary = sorted[0]
  for (const sys of sorted) {
    // 주 증상은 모든 질문, 부가 증상은 최대 3개
    const limit = sys === primary ? Infinity : 3
    questions.push(...QUESTION_BANKS[sys].slice(0, limit))
  }
  if (!systems.includes('general')) {
    questions.push(QUESTION_BANKS.general[0], QUESTION_BANKS.general[1])
  }

  // 구토 + 설사 동시 감지 시 탈수 체크 질문을 앞에 삽입
  if (symptomText && systems.includes('digestive')) {
    const hasVomit = ['구토', '토했', '토를', '토해'].some(kw => symptomText.includes(kw))
    const hasDiarrhea = symptomText.includes('설사')
    if (hasVomit && hasDiarrhea) {
      questions.unshift(...COMBINED_VOMIT_DIARRHEA_QUESTIONS)
    }
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

    if (gum === '창백하거나 흰색이에요') {
      lines.push('• 창백한 잇몸: 빈혈 또는 순환 장애 가능성 — 빠른 진료가 필요해요.')
    }
    if (effort === '많이 헐떡거려요' && when === '밤이나 새벽에 심해요') {
      lines.push('• 야간 호흡 곤란: 심부전이나 폐부종 가능성을 배제해야 해요.')
    }
    if (coughType === '기침 후 구토해요') {
      lines.push('• 기침 후 구토: 심한 기관지 자극 또는 역류 가능성이에요.')
    }
    if (coughType === '가래가 끓는 듯한 기침이에요') {
      lines.push('• 습성 기침: 하부 기도 감염이나 폐 문제를 고려해야 해요.')
    }
  }

  if (systems.includes('urinary')) {
    const output = ans['uri_output']
    const color = ans['uri_color']
    const pain = ans['uri_pain']
    const drink = ans['uri_drink']

    if (output === '찔끔씩 자주 시도해요') {
      lines.push('• 빈뇨·배뇨 곤란: 방광염 또는 요로결석 가능성이 높아요.')
    }
    if (color === '빨갛거나 분홍색이에요') {
      lines.push('• 혈뇨: 방광염, 결석, 종양 등 다양한 원인이 있어요. 소변 검사가 필수예요.')
    }
    if (pain === '울거나 끙끙거려요') {
      lines.push('• 배뇨 시 통증: 하부 요로 염증이나 결석에 의한 자극 신호예요.')
    }
    if (drink === '평소보다 훨씬 많이 마셔요') {
      lines.push('• 다음다뇨(물 많이 마시고 소변 많이): 신장 질환, 당뇨, 쿠싱 등 내분비 질환 감별이 필요해요.')
    }
  }

  if (systems.includes('orthopedic')) {
    const leg = ans['ortho_leg']
    const onset = ans['ortho_onset']
    const weight = ans['ortho_weight']

    if (leg === '뒷다리 한쪽' && onset === '서서히 심해졌어요') {
      lines.push('• 뒷다리 점진적 파행: 슬개골 탈구 또는 고관절 이형성 가능성이 있어요.')
    }
    if (weight === '전혀 못 써요') {
      lines.push('• 완전 파행: 골절, 인대 파열, 또는 척추 문제 가능성 — 빠른 방사선 촬영이 필요해요.')
    }
  }

  if (systems.includes('lump')) {
    const feel = ans['lump_feel']
    const surface = ans['lump_surface']
    const size = ans['lump_size']

    if (feel === '딱딱하고 고정돼 있어요') {
      lines.push('• 딱딱하고 고정된 혹: 악성 가능성을 배제하기 위해 세포 검사가 필요해요.')
    }
    if (surface === '궤양이나 상처가 있어요' || surface === '분비물이 나와요') {
      lines.push('• 표면 궤양 또는 분비물: 감염이나 악성 변환 가능성 — 즉시 확인이 필요해요.')
    }
    if (size === '골프공 이상') {
      lines.push('• 큰 크기의 혹: 크기 자체가 진단 우선순위를 높여요.')
    }
  }

  if (systems.includes('endocrine')) {
    const symptom = ans['endo_symptom']
    const weightPeriod = ans['endo_weight_period']

    if (symptom === '물을 엄청 많이 마셔요') {
      lines.push('• 다음다뇨: 당뇨, 쿠싱 증후군, 신부전의 주요 증상이에요. 혈액 + 소변 검사가 필요해요.')
    }
    if (symptom === '배만 볼록하게 나왔어요') {
      lines.push('• 복부 팽창: 부신 피질 기능 항진증(쿠싱) 또는 복강 내 종괴 가능성이에요.')
    }
    if (weightPeriod === '1~2주 안에 눈에 띄게') {
      lines.push('• 빠른 체중 감소: 심각한 내과 질환의 신호일 수 있어요.')
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
  if (systems.includes('orthopedic') && ans['ortho_weight'] === '전혀 못 써요') {
    lines.push('▶ 다리를 전혀 못 쓰는 경우 이동 시 안아서 이동하고 스스로 걷게 하지 마세요.')
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
    tests.push('혈액검사 (염증 수치 CRP, 췌장 수치 CPL, 신장·간 기능)')
    if (ans['dige_stool'] === '물처럼 흘러요' || ans['dige_freq'] === '하루 3~5회' || ans['dige_freq'] === '하루 6회 이상') {
      tests.push('복부 방사선 또는 초음파 (이물·장폐색 확인)')
    }
    if (ans['dige_blood'] === '구토에 피가 보여요' || ans['dige_blood'] === '대변에 피가 섞여요' || ans['dige_stool_color'] === '검은색이에요 (타르 같아요)') {
      tests.push('위장관 출혈 평가 (내시경 또는 초음파 우선)')
    }
  }

  if (systems.includes('respiratory')) {
    info.push('기침 영상(가능하다면 동영상 촬영)')
    tests.push('흉부 방사선 촬영', '필요 시 심장초음파')
  }

  if (systems.includes('urinary')) {
    info.push('소변 샘플 (아침 첫 소변을 깨끗한 용기에)')
    tests.push('소변 검사 (비중, 혈뇨, 결정)', '필요 시 방광 초음파')
  }

  if (systems.includes('orthopedic')) {
    info.push('절기 시작 시각, 외상 여부')
    tests.push('방사선 촬영 (골절·관절 이상 확인)')
  }

  if (systems.includes('lump')) {
    info.push('혹 발견 시기, 크기 변화 사진')
    tests.push('세침흡인세포검사(FNA) 또는 조직 생검')
  }

  if (systems.includes('endocrine')) {
    info.push('음수량·소변량 일간 기록, 체중 변화 추이')
    tests.push('혈액검사 (혈당, 코르티솔, 갑상선, 신장 기능)', '소변 검사')
  }

  if (info.length) lines.push('• 알릴 정보: ' + info.join(' / '))
  if (tests.length) lines.push('• 예상 검사: ' + tests.join(' / '))

  return lines
}

function buildRedFlags(systems: QuestionSystem[]): string[] {
  const common = [
    '• 잇몸이 파랗거나 보라색으로 변할 때',
    '• 경련·발작이 시작될 때',
    '• 완전히 쓰러져 일어나지 못할 때',
  ]
  const specific: Partial<Record<QuestionSystem, string[]>> = {
    digestive: ['• 구토나 설사에 선홍색 피가 다량 섞일 때', '• 배가 딱딱하게 부풀어 오를 때'],
    respiratory: ['• 입술·혀가 파랗게 변할 때', '• 앉은 채로 팔꿈치를 벌리고 숨 쉴 때'],
    urinary: ['• 12시간 이상 소변을 전혀 못 볼 때', '• 배를 만지면 비명을 지를 때'],
    orthopedic: ['• 갑자기 뒷다리를 전혀 못 쓰게 될 때', '• 척추 통증으로 움직임을 거부할 때'],
    lump: ['• 혹에서 피나 고름이 흘러나올 때', '• 하루 사이에 혹이 눈에 띄게 커질 때'],
    neurological: ['• 발작이 5분 이상 지속될 때', '• 발작 후 30분 이상 의식이 돌아오지 않을 때'],
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
