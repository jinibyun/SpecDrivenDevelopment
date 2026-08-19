"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  async function submit() {
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: signInError } = await authClient.signIn.email({ email, password });
      if (signInError) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setBusy(false);
    }
  }

  function openReset() {
    setResetEmail(email);
    setResetSent(false);
    setResetOpen(true);
  }

  return (
    <div className="w-full max-w-95 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="mb-6.5 flex items-center justify-center gap-2.5">
        <div className="h-6 w-6 rounded-[7px] bg-[#5B8CFF]" />
        <span className="text-[16px] font-bold tracking-tight">BookFlow</span>
      </div>

      <div className="rounded-3.5 border border-[#E4E4E7] bg-white px-7 py-7.5">
        <h1 className="mb-1.5 text-[19px] font-bold tracking-tight">관리자 로그인</h1>
        <p className="mb-6 text-[13.5px] text-[#71717A]">예약 현황을 관리하려면 로그인해주세요.</p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-[13px] font-semibold">이메일</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              placeholder="admin@bookflow.app"
              className="h-10.5 rounded-lg px-3.25 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-[13px] font-semibold">비밀번호</Label>
            <div className="relative flex">
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={reveal ? "text" : "password"}
                placeholder="••••••••"
                className="h-10.5 flex-1 rounded-lg pr-18.5 pl-3.25 text-sm"
              />
              <button
                type="button"
                onClick={() => setReveal((v) => !v)}
                className="absolute top-1.5 right-1.5 h-7.5 rounded-md px-2.5 text-xs font-semibold whitespace-nowrap text-[#71717A]"
              >
                {reveal ? "숨기기" : "보기"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              <span className="text-[13px] text-[#52525B]">로그인 상태 유지</span>
            </label>
            <button
              type="button"
              onClick={openReset}
              className="text-[13px] font-semibold whitespace-nowrap text-[#5B8CFF]"
            >
              비밀번호 찾기
            </button>
          </div>

          {error && (
            <div className="rounded-[10px] border border-[#FECDCA] bg-[#FFFBFA] px-3.25 py-2.75 text-[12.5px] text-[#B42318]">
              {error}
            </div>
          )}

          <Button
            type="button"
            disabled={busy}
            onClick={submit}
            className="mt-0.5 h-11 gap-2 rounded-lg bg-[#5B8CFF] text-sm font-semibold text-white hover:bg-[#5B8CFF]/90 disabled:bg-[#A9C2FF] disabled:opacity-100"
          >
            {busy && (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            <span>{busy ? "확인 중" : "로그인"}</span>
          </Button>
        </div>
      </div>

      <p className="mt-4.5 text-center text-xs text-[#A1A1AA]">계정 문의는 매장 관리자에게 연락해주세요.</p>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-90 rounded-3.5 p-6.5">
          {!resetSent ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-[17px] font-bold tracking-tight">비밀번호 찾기</DialogTitle>
                <DialogDescription className="text-[13px] text-[#71717A]">
                  가입하신 이메일로 재설정 링크를 보내드립니다.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reset-email" className="text-[13px] font-semibold">이메일</Label>
                <Input
                  id="reset-email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  inputMode="email"
                  placeholder="admin@bookflow.app"
                  className="h-10.5 rounded-lg px-3.25 text-sm"
                />
              </div>
              <div className="mt-1 flex gap-2">
                <Button type="button" variant="outline" onClick={() => setResetOpen(false)} className="h-10.5 flex-1 rounded-lg text-[13.5px] font-semibold">
                  닫기
                </Button>
                <Button type="button" onClick={() => setResetSent(true)} className="h-10.5 flex-[1.4] rounded-lg bg-[#5B8CFF] text-[13.5px] font-semibold text-white hover:bg-[#5B8CFF]/90">
                  재설정 링크 보내기
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-[#5B8CFF]/12 text-xl text-[#5B8CFF]">
                ✓
              </div>
              <DialogTitle className="mb-1.5 text-[17px] font-bold tracking-tight">메일을 보냈습니다</DialogTitle>
              <p className="mb-5.5 text-[13px] leading-relaxed text-[#71717A]">
                {resetEmail || "입력하신 주소"}로 재설정 링크를 보냈습니다. 10분 안에 확인해주세요.
              </p>
              <Button type="button" onClick={() => setResetOpen(false)} className="h-10.5 w-full rounded-lg bg-[#5B8CFF] text-[13.5px] font-semibold text-white hover:bg-[#5B8CFF]/90">
                확인
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
