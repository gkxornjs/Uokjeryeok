'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Eye, EyeOff, Check, User, Mail, Lock, Sparkles, UserPlus, Shield, Heart } from 'lucide-react'

interface SignupPageProps {
  onSignup: (userData: SignupData) => void
  onSwitchToLogin: () => void
}

export interface SignupData {
  name: string
  email: string
  password: string
}

// 폼 필드 키 타입 (handleInputChange에서 안전하게 사용)
type FormField = 'name' | 'email' | 'password' | 'confirmPassword'

export function SignupPage({ onSignup, onSwitchToLogin }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: FormField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAgreementChange = (field: keyof typeof agreements, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [field]: checked }))
  }

  const isPasswordValid = formData.password.length >= 8
  const isPasswordMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ''
  const isFormValid =
    !!formData.name &&
    !!formData.email &&
    isPasswordValid &&
    isPasswordMatch &&
    agreements.terms &&
    agreements.privacy

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    // 실제 가입 API 연동 위치
    setTimeout(() => {
      onSignup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -left-4 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-lg bg-white/80 backdrop-blur-sm border-0 shadow-2xl shadow-emerald-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/60 rounded-lg" />

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              억제력 회원가입
            </h1>
            <p className="text-lg text-gray-600 mb-6">목표 달성의 여정을 시작하세요</p>

            <div className="bg-gradient-to-r from-emerald-50/50 to-blue-50/50 rounded-xl p-4 border border-emerald-200/50">
              <p className="text-sm text-gray-600">
                새로운 시작을 응원합니다! 🌟
                <br />
                함께 목표를 달성해나가요
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-emerald-500" />
                  이름
                </label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="이름을 입력하세요"
                    autoComplete="name"
                    className="w-full h-12 pl-4 pr-4 bg-white/70 border-2 border-gray-200 focus:border-emerald-400 rounded-xl text-base backdrop-blur-sm transition-all duration-300 hover:border-gray-300"
                    required
                    aria-invalid={!formData.name ? true : undefined}
                  />
                  {formData.name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-blue-500" />
                  이메일
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="이메일을 입력하세요"
                    autoComplete="email"
                    className="w-full h-12 pl-4 pr-4 bg-white/70 border-2 border-gray-200 focus:border-blue-400 rounded-xl text-base backdrop-blur-sm transition-all duration-300 hover:border-gray-300"
                    required
                    aria-invalid={!formData.email ? true : undefined}
                  />
                  {formData.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-purple-500" />
                  비밀번호
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="8자 이상 입력하세요"
                    autoComplete="new-password"
                    className="w-full h-12 pl-4 pr-12 bg-white/70 border-2 border-gray-200 focus:border-purple-400 rounded-xl text-base backdrop-blur-sm transition-all duration-300 hover:border-gray-300"
                    required
                    aria-invalid={!isPasswordValid ? true : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="flex items-center mt-3">
                    {isPasswordValid ? (
                      <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                        <Check className="h-4 w-4 mr-2" />
                        <span>비밀번호 조건 충족</span>
                      </div>
                    ) : (
                      <div className="flex items-center bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
                        <span>8자 이상 입력해주세요</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-rose-500" />
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    autoComplete="new-password"
                    className="w-full h-12 pl-4 pr-12 bg-white/70 border-2 border-gray-200 focus:border-rose-400 rounded-xl text-base backdrop-blur-sm transition-all duration-300 hover:border-gray-300"
                    required
                    aria-invalid={!isPasswordMatch ? true : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? '확인 비밀번호 숨기기' : '확인 비밀번호 보기'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="flex items-center mt-3">
                    {isPasswordMatch ? (
                      <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                        <Check className="w-4 h-4 mr-2" />
                        <span>비밀번호 일치</span>
                      </div>
                    ) : (
                      <div className="flex items-center bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
                        <span>비밀번호가 일치하지 않습니다</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-4 bg-gradient-to-r from-gray-50/50 to-gray-100/50 rounded-xl p-5 border border-gray-200/50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">약관 동의</h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={agreements.terms}
                    onCheckedChange={(c) => handleAgreementChange('terms', c === true)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    <span className="text-red-500 font-semibold">*</span> 서비스 이용약관에 동의합니다
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={agreements.privacy}
                    onCheckedChange={(c) => handleAgreementChange('privacy', c === true)}
                    className="mt-1"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-700 leading-relaxed">
                    <span className="text-red-500 font-semibold">*</span> 개인정보 처리방침에 동의합니다
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketing"
                    checked={agreements.marketing}
                    onCheckedChange={(c) => handleAgreementChange('marketing', c === true)}
                    className="mt-1"
                  />
                  <label htmlFor="marketing" className="text-sm text-gray-700 leading-relaxed flex items-center">
                    <Heart className="w-3 h-3 mr-1 text-pink-500" />
                    마케팅 정보 수신에 동의합니다 (선택)
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <Button
                  type="submit"
                  className="relative w-full h-14 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-xl text-lg font-semibold shadow-2xl shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 border-0"
                  disabled={!isFormValid || isLoading}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>가입 처리 중...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>회원가입</span>
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>

            {/* Switch to Login */}
            <div className="text-center pt-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-lg blur" />
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="relative bg-white/60 backdrop-blur-sm rounded-lg px-6 py-3 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-all duration-300 hover:bg-white/80 border border-white/30"
                >
                  이미 계정이 있으신가요? <span className="text-emerald-600 font-semibold">로그인하기</span>
                </button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200/50">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Sparkles className="w-3 h-3" />
                <span>© 2025 억제력. 모든 권리 보유.</span>
                <Sparkles className="w-3 h-3" />
              </div>
              <p className="text-xs text-gray-400 mt-2">새로운 시작을 축하합니다! 🎉</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Floating Quote */}
      <div className="absolute bottom-8 left-8 right-8 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 rounded-xl blur" />
          <div className="relative bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <p className="text-sm italic text-gray-600 mb-1">천 리 길도 한 걸음부터</p>
            <p className="text-xs text-gray-500">- 당신의 여정을 응원합니다 -</p>
          </div>
        </div>
      </div>
    </div>
  )
}