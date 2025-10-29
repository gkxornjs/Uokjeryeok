'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { saveOnboarding } from '../../lib/onboarding'
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label'
import { ChevronRight, ChevronLeft, Sparkles, Star, Zap, Target, Users, Heart } from 'lucide-react'

export interface OnboardingData {
  gender: string
  ageGroup: string
  occupation: string
  primaryGoals: string[]
}

interface OnboardingPageProps {
  onComplete: (data: OnboardingData) => void
  userName: string
}

const STEPS = [
  { id: 1, title: '기본 정보', description: '간단한 정보를 알려주세요', icon: Users },
  { id: 2, title: '목표 설정', description: '어떤 목표를 달성하고 싶으신가요?', icon: Target },
  { id: 3, title: '완료', description: '준비가 모두 끝났습니다!', icon: Star },
] as const

const GENDER_OPTIONS = [
  { value: 'male', label: '남성', icon: '👨' },
  { value: 'female', label: '여성', icon: '👩' },
  { value: 'other', label: '기타', icon: '🧑' },
  { value: 'prefer-not-to-say', label: '선택 안함', icon: '🤐' },
] as const

const AGE_OPTIONS = [
  { value: '10s', label: '10대', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { value: '20s', label: '20대', gradient: 'linear-gradient(135deg, #a855f7, #6366f1)' },
  { value: '30s', label: '30대', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
  { value: '40s', label: '40대', gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
  { value: '50s', label: '50대 이상', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
] as const

const OCCUPATION_OPTIONS = [
  { value: 'high-school-student', label: '🎓 고등학생' },
  { value: 'university-student', label: '📚 대학생 (학부)' },
  { value: 'graduate-student', label: '🎯 대학원생' },
  { value: 'job-seeker', label: '🔍 취업준비생' },
  { value: 'office-worker', label: '💼 직장인' },
  { value: 'public-servant', label: '🏛 공무원' },
  { value: 'teacher', label: '👩‍🏫 교육직' },
  { value: 'medical', label: '⚕️ 의료진' },
  { value: 'engineer', label: '💻 개발자/엔지니어' },
  { value: 'designer', label: '🎨 디자이너' },
  { value: 'marketer', label: '📢 마케터' },
  { value: 'sales', label: '🤝 영업직' },
  { value: 'freelancer', label: '🌟 프리랜서' },
  { value: 'entrepreneur', label: '🚀 창업가/사업가' },
  { value: 'consultant', label: '📊 컨설턴트' },
  { value: 'researcher', label: '🔬 연구원' },
  { value: 'artist', label: '🎭 예술가/작가' },
  { value: 'homemaker', label: '🏠 주부' },
  { value: 'retired', label: '🌅 은퇴자' },
  { value: 'other', label: '기타' },
] as const

const GOAL_OPTIONS = [
  {
    id: 'study',
    label: '📚 학업 및 시험 준비',
    description: '공부 계획과 학습 목표 달성',
    selectedBg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    selectedBorder: 'border-blue-400',
  },
  {
    id: 'self-development',
    label: '🌱 자기계발 및 성장',
    description: '새로운 기술과 지식 습득',
    selectedBg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
    selectedBorder: 'border-emerald-400',
  },
  {
    id: 'health',
    label: '💪 건강 및 운동',
    description: '건강한 생활습관과 운동 루틴',
    selectedBg: 'bg-gradient-to-r from-red-50 to-pink-50',
    selectedBorder: 'border-red-400',
  },
  {
    id: 'work',
    label: '💼 업무 및 커리어',
    description: '업무 효율성과 커리어 발전',
    selectedBg: 'bg-gradient-to-r from-purple-50 to-violet-50',
    selectedBorder: 'border-purple-400',
  },
  {
    id: 'financial',
    label: '💰 재무 및 재테크',
    description: '재정 관리와 투자 계획',
    selectedBg: 'bg-gradient-to-r from-amber-50 to-orange-50',
    selectedBorder: 'border-amber-400',
  },
  {
    id: 'hobby',
    label: '🎨 취미 및 여가',
    description: '취미 활동과 여가 시간 관리',
    selectedBg: 'bg-gradient-to-r from-cyan-50 to-blue-50',
    selectedBorder: 'border-cyan-400',
  },
] as const

export function OnboardingPage({ onComplete, userName }: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingData>({
    gender: '',
    ageGroup: '',
    occupation: '',
    primaryGoals: [],
  })

  const handleNext = () => currentStep < STEPS.length && setCurrentStep((s) => s + 1)
  const handlePrev = () => currentStep > 1 && setCurrentStep((s) => s - 1)
  
const handleComplete = async () => {
  // 1) 서버에 저장 (completed 플래그 포함)
  await saveOnboarding({ ...formData, completed: true })
  // 2) 기존 라우팅 로직 호출 (settings 또는 dashboard로 이동)
  onComplete(formData)
}
  const handleGoalToggle = (goalId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      primaryGoals: checked ? [...prev.primaryGoals, goalId] : prev.primaryGoals.filter((id) => id !== goalId),
    }))
  }

  const isStepValid = () => {
    if (currentStep === 1) return !!(formData.gender && formData.ageGroup && formData.occupation)
    if (currentStep === 2) return formData.primaryGoals.length > 0
    return true
  }

  const progress = (currentStep / STEPS.length) * 100
  const [occupationOpen, setOccupationOpen] = useState(false);
  const currentStepData = STEPS[currentStep - 1]
  const StepIcon = currentStepData.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-3xl bg-white/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/60 rounded-lg" />
        <div className="relative p-8">
          {/* 헤더/진행률 */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <StepIcon className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              환영합니다, {userName}님! 🎉
            </h1>
            <p className="text-lg text-gray-600 mb-6">{currentStepData.description}</p>

            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                {STEPS.map((step, i) => {
                  const Icon = step.icon
                  const isActive = i + 1 === currentStep
                  const isCompleted = i + 1 < currentStep
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-110'
                            : isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110'
                              : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs mt-2 ${isActive ? 'text-blue-600 font-medium' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                        {step.title}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* 진행 바 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">진행률</span>
                  <span className="text-blue-600 font-medium">
                    {currentStep}/{STEPS.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 단계 콘텐츠 */}
          <div className="min-h-[450px] mb-8">
            {currentStep === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    기본 정보를 알려주세요
                  </h2>
                  <p className="text-gray-600">몇 가지 간단한 정보만 입력해주시면 됩니다</p>
                </div>

                <div className="space-y-6">
                  {/* 성별 */}
                  <div>
                    <Label className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-pink-500" />
                      성별
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {GENDER_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          className={`relative p-4 border-2 rounded-xl transition-all duration-300 ${
                            formData.gender === opt.value
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          onClick={() => setFormData((prev) => ({ ...prev, gender: opt.value }))}
                        >
                          <div className="flex items-center justify-center space-x-3">
                            <span className="text-2xl">{opt.icon}</span>
                            <span className="font-medium">{opt.label}</span>
                          </div>
                          {formData.gender === opt.value && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full grid place-items-center">
                              <Sparkles className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 연령대 */}
                  <div>
                    <Label className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      연령대
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {AGE_OPTIONS.map((opt) => {
                        const active = formData.ageGroup === opt.value
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            className={`relative p-4 border-2 rounded-xl transition-all duration-300 ${
                              active ? 'border-transparent shadow-lg' : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                            style={{ background: active ? opt.gradient : undefined }}
                            onClick={() => setFormData((prev) => ({ ...prev, ageGroup: opt.value }))}
                          >
                            <span className={`font-medium ${active ? 'text-white' : 'text-gray-700'}`}>{opt.label}</span>
                            {active && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full grid place-items-center">
                                <Sparkles className="w-3 h-3 text-gray-700" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 직업 */}
                <div>
                <Label className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" /> 하시는 일
                </Label>

  {/* 필드 버튼: 클릭하면 모달 오픈 */}
  <button
    type="button"
    onClick={() => setOccupationOpen(true)}
    className="w-full h-14 text-left px-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 bg-white transition-colors"
  >
    {formData.occupation
      ? OCCUPATION_OPTIONS.find(o => o.value === formData.occupation)?.label ?? formData.occupation
      : '직업이나 상황을 선택해주세요'}
  </button>

  {/* 전체 오버레이 모달 */}
  <Dialog open={occupationOpen} onOpenChange={setOccupationOpen}>
    <DialogContent className="max-w-2xl w-[90%]">
      <DialogHeader>
        <DialogTitle>하시는 일을 선택하세요</DialogTitle>
      </DialogHeader>

      <div className="max-h-[60vh] overflow-y-auto space-y-1">
        {OCCUPATION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, occupation: opt.value }));
              setOccupationOpen(false);
            }}
            className={`w-full flex items-center justify-between rounded-lg border px-3 py-3 text-left transition-colors ${
              formData.occupation === opt.value
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{opt.label}</span>
            </span>
            {formData.occupation === opt.value && (
              <span className="text-blue-500 text-sm">선택됨</span>
            )}
          </button>
        ))}

        {/* 기타 직접 입력이 필요하면 아래 주석 해제해서 사용 */}
        {
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="기타 (직접 입력)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) {
                  setFormData(prev => ({ ...prev, occupation: `other:${v}` }));
                  setOccupationOpen(false);
                }
              }
            }}
          />
          <Button
            onClick={() => {
              const el = document.querySelector<HTMLInputElement>('input[placeholder="기타 (직접 입력)"]');
              const v = el?.value.trim();
              if (v) {
                setFormData(prev => ({ ...prev, occupation: `other:${v}` }));
                setOccupationOpen(false);
              }
            }}
          >
            확인
          </Button>
        </div>
        }
      </div>
    </DialogContent>
  </Dialog>
</div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    주요 목표를 선택해주세요
                  </h2>
                  <p className="text-gray-600">여러 개를 선택할 수 있습니다 ✨</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GOAL_OPTIONS.map((goal) => {
                    const selected = formData.primaryGoals.includes(goal.id)
                    return (
                      <button
                        type="button"
                        key={goal.id}
                        className={`relative text-left p-6 border-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                          selected ? `${goal.selectedBg} ${goal.selectedBorder} shadow-lg` : `border-gray-200 hover:border-gray-300 bg-white`
                        }`}
                        onClick={() => handleGoalToggle(goal.id, !selected)}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 grid place-items-center transition-all ${
                              selected ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-transparent' : 'border-gray-300'
                            }`}
                          >
                            {selected && <Sparkles className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-2">{goal.label}</div>
                            <div className="text-sm text-gray-600">{goal.description}</div>
                          </div>
                        </div>
                        {selected && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full grid place-items-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full animate-pulse" />
                  <div className="relative grid place-items-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                    <span className="text-4xl">🎯</span>
                  </div>
                </div>

                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  모든 준비가 완료되었습니다!
                </h2>

                <div className="text-gray-600 space-y-2">
                  <p className="text-lg">이제 억제력과 함께 목표를 달성해보세요.</p>
                  <p>언제든지 설정에서 정보를 수정할 수 있습니다.</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    선택하신 주요 목표
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {formData.primaryGoals.map((id) => {
                      const g = GOAL_OPTIONS.find((x) => x.id === id)
                      return (
                        <span key={id} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full font-medium border border-blue-200">
                          {g?.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

           {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>이전</span>
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg disabled:opacity-50 transform hover:scale-105 transition-all"
              >
                <span>다음</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all"
              >
                <span>시작하기</span>
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200/50 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <Heart className="w-4 h-4 mr-2 text-pink-500" />
              제공해주신 정보는 더 나은 서비스 제공을 위해서만 사용됩니다.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}