import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = trpc.alianca.login.useMutation({
    onSuccess: () => {
      onLoginSuccess();
    },
    onError: (err) => {
      setErrorMsg("❌ " + (err.message || "Senha incorreta."));
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg("❌ Digite a senha.");
      return;
    }
    setErrorMsg("");
    loginMutation.mutate({ password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-[20px] bg-[#050505] text-white">
      <div className="w-[min(420px,100%)] p-[35px] rounded-[22px] bg-[rgba(17,17,17,.96)] border border-[#292929] shadow-[0_30px_90px_rgba(0,0,0,.6)] text-center relative">
        <a
          href="/"
          className="absolute top-[20px] left-[20px] text-[#969696] hover:text-white transition flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </a>

        <div className="w-[78px] h-[78px] mx-auto mb-[22px] rounded-[22px] bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-black text-2xl shadow-[0_0_35px_rgba(139,92,246,.3)]">
          155
        </div>

        <h1 className="text-[25px] font-bold mb-[8px]">Painel Administrativo</h1>
        <p className="text-[#969696] text-sm mb-[28px]">Área restrita da Aliança 155</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium mb-[8px]">Senha do administrador</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full p-[14px] bg-[#0d0d0d] text-white border border-[#292929] rounded-[11px] outline-none focus:border-[#8b5cf6]"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-[14px] rounded-[11px] bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold transition hover:brightness-115 flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(139,92,246,.2)]"
          >
            {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "🔐 Entrar no painel"}
          </button>

          {errorMsg && <div className="text-[#f87171] text-sm font-medium text-center">{errorMsg}</div>}
        </form>
      </div>
    </div>
  );
}
