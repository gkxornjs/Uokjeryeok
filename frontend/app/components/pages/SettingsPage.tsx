'use client'

import { useEffect, useState } from 'react'
import { User, Palette, Edit, Mail, IdCard } from 'lucide-react'
import { Card } from '../ui/card'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'

/** 온보딩 데이터 타입(다른 파일에서 export 중이면 거기서 import 해도 됨) */
type OnboardingData = {
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | string
  ageGroup: '10s' | '20s' | '30s' | '40s' | '50s' | string
  occupation: string
  primaryGoals: string[]
}

interface SettingsPageProps {
  currentUser?: {
    name: string
    email: string
    onboardingCompleted?: boolean
    onboardingData?: OnboardingData
    
  } | null
  onEditProfile?: () => void
}

/** 테마 포커스(액센트) 팔레트 */
const ACCENT_SWATCHES = ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F97316'] as const

export function SettingsPage({ currentUser, onEditProfile }: SettingsPageProps) {
  /* ─────────────── Theme: Dark / Accent ─────────────── */
  const [isDark, setIsDark] = useState(false)
  const [accent, setAccent] = useState<string>(ACCENT_SWATCHES[0])

  // 초기값 로드 (localStorage → document 반영)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const useDark = savedTheme
      ? savedTheme === 'dark'
      : document.documentElement.classList.contains('dark')
    setIsDark(useDark)
    document.documentElement.classList.toggle('dark', useDark)

    const savedAccent = localStorage.getItem('accent') || ACCENT_SWATCHES[0]
    setAccent(savedAccent)
    applyAccent(savedAccent)
  }, [])

  const applyAccent = (hex: string) => {
    // globals.css에서 --primary 를 참조하고 있으므로 여기에 주입
    const root = document.documentElement
    root.style.setProperty('--primary', hex)
    // 필요 시 ring도 함께 조정
    root.style.setProperty('--ring', hex)
    // 대비용 전경색 간단 처리(밝은 색이면 검정, 어두우면 흰색)
    try {
      const c = hex.replace('#', '')
      const r = parseInt(c.substring(0, 2), 16)
      const g = parseInt(c.substring(2, 4), 16)
      const b = parseInt(c.substring(4, 6), 16)
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
      root.style.setProperty('--primary-foreground', luminance > 160 ? '#000000' : '#ffffff')
    } catch {}
  }

  const toggleDark = (checked: boolean) => {
    setIsDark(checked)
    document.documentElement.classList.toggle('dark', checked)
    localStorage.setItem('theme', checked ? 'dark' : 'light')
  }

  const pickAccent = (hex: string) => {
    setAccent(hex)
    localStorage.setItem('accent', hex)
    applyAccent(hex)
  }

  /* ─────────────── Helpers for labels ─────────────── */
  const getGenderLabel = (gender: string) =>
    ({ male: '남성', female: '여성', other: '기타', 'prefer-not-to-say': '선택 안함' } as const)[gender] || gender

  const getAgeLabel = (age: string) =>
    ({ '10s': '10대', '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대 이상' } as const)[age] || age

  const getOccupationLabel = (occupation: string) =>
    ({
      'high-school-student': '🎓 고등학생',
      'university-student': '📚 대학생 (학부)',
      'graduate-student': '🎯 대학원생',
      'job-seeker': '🔍 취업준비생',
      'office-worker': '💼 직장인 (일반 회사원)',
      'public-servant': '🏛 공무원',
      teacher: '👩‍🏫 교육직 (교사/교수 등)',
      medical: '⚕️ 의료진 (의사/간호사 등)',
      engineer: '💻 개발자/엔지니어',
      designer: '🎨 디자이너',
      marketer: '📢 마케터',
      sales: '🤝 영업직',
      freelancer: '🌟 프리랜서',
      entrepreneur: '🚀 창업가/사업가',
      consultant: '📊 컨설턴트',
      researcher: '🔬 연구원',
      artist: '🎭 예술가/작가',
      homemaker: '🏠 주부/주부',
      retired: '🌅 은퇴자',
      other: '기타',
    } as const)[occupation] || occupation

  const getGoalLabels = (goals: string[]) => {
    const map = {
      study: '📚 학업 및 시험 준비',
      'self-development': '🌱 자기계발 및 성장',
      health: '💪 건강 및 운동',
      work: '💼 업무 및 커리어',
      financial: '💰 재무 및 재테크',
      hobby: '🎨 취미 및 여가',
    } as const
    return goals.map((g) => map[g as keyof typeof map] || g)
  }

  const od = currentUser?.onboardingData

  return (
    <main className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">설정</h1>
        <p className="text-muted-foreground mt-1">프로필과 앱 설정을 관리하세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 프로필 카드 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">프로필 정보</h3>
            </div>
            <Button variant="outline" size="sm" onClick={onEditProfile}>
              <Edit className="w-4 h-4 mr-2" />
              수정
            </Button>
          </div>

          <div className="space-y-6">
            {/* 계정 기본 정보 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                <Mail className="w-4 h-4" />
                <span>계정 정보</span>
              </div>
              <div className="grid grid-cols-1 gap-3 pl-6">
                <div>
                  <Label className="text-sm font-medium">이름</Label>
                  <p className="text-sm text-muted-foreground mt-1">{currentUser?.name || '사용자'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">이메일</Label>
                  <p className="text-sm text-muted-foreground mt-1">{currentUser?.email || '-'}</p>
                </div>
              </div>
            </div>

            {/* 개인 정보(온보딩 완료 시) */}
            {od && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                  <IdCard className="w-4 h-4" />
                  <span>개인 정보</span>
                </div>
                <div className="space-y-3 pl-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">성별</Label>
                      <p className="text-sm text-muted-foreground mt-1">{getGenderLabel(od.gender)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">연령대</Label>
                      <p className="text-sm text-muted-foreground mt-1">{getAgeLabel(od.ageGroup)}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">직업/상황</Label>
                    <p className="text-sm text-muted-foreground mt-1">{getOccupationLabel(od.occupation)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">주요 목표</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getGoalLabels(od.primaryGoals || []).map((goal, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 화면/테마 설정 */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">화면 설정</h3>
          </div>

          <div className="space-y-6">
            {/* 다크 모드 */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">다크 모드</Label>
                <p className="text-xs text-muted-foreground mt-1">어둡거나 밝은 테마 선택</p>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleDark} />
            </div>

            {/* 테마 색상 */}
            <div>
              <Label className="text-sm font-medium">테마 색상</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">원하는 액센트 색상을 선택하세요</p>
              <div className="flex space-x-3">
                {ACCENT_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => pickAccent(hex)}
                    className={`w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${
                      accent === hex ? 'border-blue-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: hex }}
                    aria-label={`Accent ${hex}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
