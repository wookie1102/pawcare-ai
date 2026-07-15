export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🐾</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          서비스 점검 중입니다
        </h1>
        <p className="text-gray-500 text-base leading-relaxed mb-6">
          더 나은 서비스를 위해 시스템을 개선하고 있어요.<br />
          잠시 후 다시 접속해 주세요.
        </p>
        <div className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full">
          🔧 업데이트 작업 중
        </div>
      </div>
    </div>
  )
}
