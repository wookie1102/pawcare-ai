import BottomNav from '@/components/navigation/BottomNav'
import AppTopBar from '@/components/AppTopBar'
import AlarmProvider from '@/components/AlarmProvider'
import AlarmToast from '@/components/AlarmToast'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AlarmProvider>
      <div className="min-h-screen bg-gray-50">
        <AppTopBar />
        <AlarmToast />
        <main className="pt-12 pb-20">{children}</main>
        <BottomNav />
      </div>
    </AlarmProvider>
  )
}
