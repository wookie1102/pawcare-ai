export default function LegalDisclaimer({ extra }: { extra?: string }) {
  return (
    <div className="px-4 pb-4 pt-2">
      <p className="text-[10px] text-gray-400 text-center leading-relaxed">
        본 서비스는 진료를 대체하지 않으며 병원 방문 시점을 안내하는 서비스입니다.
        {extra && (
          <>
            <br />
            {extra}
          </>
        )}
      </p>
    </div>
  )
}
