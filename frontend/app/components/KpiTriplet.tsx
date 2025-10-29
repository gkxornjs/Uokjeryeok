import { Card } from './ui/card'

type Props = {
  completionRate: number; // 0~100
  activeDays: number;
  streakDays: number;
  className?: string;
}

export default function KpiTriplet({ completionRate, activeDays, streakDays, className }: Props) {
  const rate = Math.max(0, Math.min(100, Math.round(completionRate)))
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className ?? ''}`}>
      <Card className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
        <div className="text-2xl font-bold text-blue-600 mb-1">{rate}%</div>
        <div className="text-sm text-blue-800">완료율</div>
      </Card>
      <Card className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-sm">
        <div className="text-2xl font-bold text-emerald-600 mb-1">{activeDays}</div>
        <div className="text-sm text-emerald-800">활동 일수</div>
      </Card>
      <Card className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
        <div className="text-2xl font-bold text-purple-600 mb-1">{streakDays}</div>
        <div className="text-sm text-purple-800">연속 일수</div>
      </Card>
    </div>
  )
}
