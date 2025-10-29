'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { Eye, EyeOff, Mail, Lock, Sparkles, Target, LogIn } from 'lucide-react'

interface LoginPageProps {
  onLogin: (email: string, password: string) => void
  onSwitchToSignup: () => void
}

export function LoginPage({ onLogin, onSwitchToSignup }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || isLoading) return
    setIsLoading(true)
    // 로딩 시뮬레이션(실서비스에서는 API 연동)
    setTimeout(() => {
      onLogin(email, password)
      setIsLoading(false)
    }, 1000)
  }

  const emailInvalid = !email
  const passwordInvalid = !password

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -left-4 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/60 rounded-lg" />

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              억제력
            </h1>
            <p className="text-lg text-gray-600 mb-6">목표 달성을 위한 개인 관리 시스템</p>

            <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-4 border border-blue-200/50">
              <p className="text-sm text-gray-600">
                다시 만나서 반가워요! ✨
                <br />
                로그인하여 목표 달성 여정을 계속하세요
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="flex items-center text-sm font-semibold text-gray-700 mb-3"
                >
                  <Mail className="w-4 h-4 mr-2 text-blue-500" />
                  이메일
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    autoComplete="email"
                    className="w-full h-12 pl-4 pr-4 bg-white/70 border-2 border-gray-200 focus:border-blue-400 rounded-xl text-base backdrop-blur-sm transition-all duration-300 hover:border-gray-300"
                    required
                    aria-invalid={emailInvalid ? true : undefined}
                  />
                  {!!email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="flex items-center text-sm font-semibold text-gray-700 mb-3"
                >
                  <Lock className="w-4 h-4 mr-2 text-purple-500" />
                  비밀번호
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    autoComplete="current-password"
                    className="w-full h-12 pl-4 pr-12 bg-white/70 border-2 border-gray-200 focus:border-purple-400 rounded-xl text-base backdrop-blur-sm transition-all duration-300 hover:border-gray-300"
                    required
                    aria-invalid={passwordInvalid ? true : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="relative w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-semibold shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border-0"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>로그인 중...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>로그인</span>
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>

            {/* Switch to Signup */}
            <div className="text-center pt-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-lg blur" />
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="relative bg-white/60 backdrop-blur-sm rounded-lg px-6 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 hover:bg-white/80 border border-white/30"
                >
                  계정이 없으신가요? <span className="text-blue-600 font-semibold">회원가입하기</span>
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
              <p className="text-xs text-gray-400 mt-2">목표를 향한 여정에 함께하세요</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Floating Quote */}
      <div className="absolute bottom-8 left-8 right-8 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 rounded-xl blur" />
          <div className="relative bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <p className="text-sm italic text-gray-600 mb-1">성공은 매일의 작은 습관에서 시작됩니다</p>
            <p className="text-xs text-gray-500">- 억제력과 함께 -</p>
          </div>
        </div>
      </div>
    </div>
  )
}