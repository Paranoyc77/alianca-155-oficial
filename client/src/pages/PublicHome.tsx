import { useState, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Search, ExternalLink, Users, Megaphone, Globe, Sparkles, Loader2, Lock, UserPlus, Music, Play, Pause, Send, ShieldAlert, Phone, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function PublicHome() {
  const [activeTab, setActiveTab] = useState<"all" | "grupo" | "canal" | "site" | "recrutamento" | "equipe">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Recrutamento form state
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [motivacao, setMotivacao] = useState("");

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: divulgacoes = [], isLoading: listLoading } = trpc.alianca.list.useQuery();
  const { data: settings = {} } = trpc.alianca.getSettings.useQuery();
  const { data: equipe = [], isLoading: equipeLoading } = trpc.alianca.listEquipe.useQuery();

  const submitRecrutamentoMutation = trpc.alianca.submitRecrutamento.useMutation({
    onSuccess: () => {
      toast.success("Inscrição enviada com sucesso! Entraremos em contato em breve.");
      setNome("");
      setContato("");
      setExperiencia("");
      setMotivacao("");
      setActiveTab("all");
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao enviar inscrição.");
    }
  });

  const filteredDivulgacoes = useMemo(() => {
    return divulgacoes.filter(item => {
      const matchesTab = activeTab === "all" || item.type === activeTab;
      const matchesSearch = searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.link.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [divulgacoes, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: divulgacoes.length,
      grupo: divulgacoes.filter(x => x.type === "grupo").length,
      canal: divulgacoes.filter(x => x.type === "canal").length,
      site: divulgacoes.filter(x => x.type === "site").length,
      equipe: equipe.length,
    };
  }, [divulgacoes, equipe]);

  const toggleMusic = () => {
    if (!audioRef.current || !settings.site_music_url) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        toast.error("Não foi possível reproduzir o áudio automaticamente.");
      });
    }
  };

  const handleRecrutamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !contato || !experiencia || !motivacao) {
      toast.error("Preencha todos os campos do formulário.");
      return;
    }
    submitRecrutamentoMutation.mutate({ nome, contato, experiencia, motivacao });
  };

  return (
    <div
      className="min-h-screen text-white flex flex-col font-sans selection:bg-[#8b5cf6] selection:text-white relative bg-[#050505]"
      style={settings.site_bg_image ? { backgroundImage: `linear-gradient(to bottom, rgba(5,5,5,0.9), rgba(5,5,5,0.95)), url(${settings.site_bg_image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
    >
      {/* Hidden audio element */}
      {settings.site_music_url && (
        <audio ref={audioRef} src={settings.site_music_url} loop preload="none" />
      )}

      {/* Navbar */}
      <header className="border-b border-[#1f1f1f] bg-[#050505]/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {settings.site_logo ? (
            <img src={settings.site_logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-[#292929]" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              155
            </div>
          )}
          <div>
            <span className="font-bold text-base block tracking-wide">{settings.site_title || "Aliança 155"}</span>
            <span className="text-xs text-[#969696] block">{settings.site_subtitle || "Central de Divulgações"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {settings.site_music_url && (
            <button
              onClick={toggleMusic}
              className="px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#292929] text-xs font-bold transition flex items-center gap-2 text-[#bca9ff]"
              title={isPlaying ? "Pausar Trilha Sonora" : "Tocar Trilha Sonora"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#8b5cf6] animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlaying ? "Pausar Música" : (settings.site_music_title || "Trilha Sonora")}</span>
            </button>
          )}

          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#292929] text-xs font-bold transition flex items-center gap-2 text-[#bca9ff]"
          >
            <Lock className="w-3.5 h-3.5" /> {settings.admin_btn_text || "Painel Admin"}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-14 md:py-20 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#bca9ff] text-xs font-bold tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> {settings.hero_badge || "ALIANÇA 155"}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
          {settings.hero_title_main || "Central de Divulgações"}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#c4b5fd]">
            {settings.hero_title_accent || "Oficial"}
          </span>
        </h1>

        <p className="text-[#969696] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {settings.hero_description || "Encontre os melhores grupos, canais e sites recomendados pela nossa comunidade."}
        </p>

        {/* Search & Filter Bar */}
        {activeTab !== "recrutamento" && activeTab !== "equipe" && (
          <div className="pt-4 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por nome ou link..."
                className="w-full pl-11 pr-4 py-3.5 bg-[#111111]/90 text-white border border-[#262626] rounded-2xl outline-none focus:border-[#8b5cf6] transition text-sm shadow-inner backdrop-blur"
              />
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 ${activeTab === "all" ? "bg-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]" : "bg-[#111111]/80 hover:bg-[#1a1a1a] text-[#969696] border border-[#262626]"}`}
          >
            Todos ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab("grupo")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 ${activeTab === "grupo" ? "bg-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]" : "bg-[#111111]/80 hover:bg-[#1a1a1a] text-[#969696] border border-[#262626]"}`}
          >
            <Users className="w-4 h-4" /> Grupos ({counts.grupo})
          </button>
          <button
            onClick={() => setActiveTab("canal")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 ${activeTab === "canal" ? "bg-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]" : "bg-[#111111]/80 hover:bg-[#1a1a1a] text-[#969696] border border-[#262626]"}`}
          >
            <Megaphone className="w-4 h-4" /> Canais ({counts.canal})
          </button>
          <button
            onClick={() => setActiveTab("site")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 ${activeTab === "site" ? "bg-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]" : "bg-[#111111]/80 hover:bg-[#1a1a1a] text-[#969696] border border-[#262626]"}`}
          >
            <Globe className="w-4 h-4" /> Sites ({counts.site})
          </button>
          <button
            onClick={() => setActiveTab("equipe")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 ${activeTab === "equipe" ? "bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)]" : "bg-[#111111]/80 hover:bg-[#1a1a1a] text-[#bca9ff] border border-[#8b5cf6]/40"}`}
          >
            <ShieldAlert className="w-4 h-4" /> Donos e Admins ({counts.equipe})
          </button>
          <button
            onClick={() => setActiveTab("recrutamento")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 ${activeTab === "recrutamento" ? "bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)]" : "bg-[#111111]/80 hover:bg-[#1a1a1a] text-[#bca9ff] border border-[#8b5cf6]/40"}`}
          >
            <UserPlus className="w-4 h-4" /> Recrutamento
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 pb-24 flex-1 w-full">
        {activeTab === "equipe" ? (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black mb-2">Equipe de Donos e Administradores</h2>
              <p className="text-sm text-[#969696]">Conecte-se diretamente com os responsáveis pela gestão da Aliança 155 via WhatsApp ou Telegram.</p>
            </div>

            {equipeLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" /></div>
            ) : equipe.length === 0 ? (
              <div className="text-center py-20 bg-[#0d0d0d] border border-[#222] rounded-3xl p-8 max-w-lg mx-auto">
                <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-[#555]" />
                <h3 className="text-lg font-bold mb-1">Nenhum membro cadastrado</h3>
                <p className="text-sm text-[#969696]">O administrador ainda não cadastrou os donos e admins no painel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipe.map((membro) => {
                  const numLimpo = membro.numeroContato.replace(/\D/g, "");
                  const isUrl = membro.numeroContato.startsWith("http");
                  const whatsappUrl = isUrl ? membro.numeroContato : `https://wa.me/${numLimpo}`;
                  const telegramUrl = isUrl ? membro.numeroContato : `https://t.me/${membro.numeroContato.replace(/^@/, "")}`;

                  return (
                    <div key={membro.id} className="bg-[#0d0d0d]/90 border border-[#222] hover:border-[#8b5cf6]/50 rounded-3xl p-6 transition duration-300 flex flex-col items-center text-center shadow-lg backdrop-blur">
                      {membro.foto ? (
                        <img src={membro.foto} alt={membro.nome} className="w-24 h-24 rounded-full object-cover border-2 border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.3)] mb-4" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-black text-2xl mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                          {membro.nome.charAt(0)}
                        </div>
                      )}
                      <span className="px-3 py-1 rounded-full bg-[#8b5cf6]/20 text-[#bca9ff] text-xs font-bold uppercase tracking-wider mb-2">
                        {membro.cargo}
                      </span>
                      <h3 className="font-bold text-xl text-white mb-2">{membro.nome}</h3>
                      <div className="mt-2 w-full pt-3 border-t border-[#222] flex items-center justify-center gap-2 text-sm text-[#969696]">
                        <Phone className="w-4 h-4 text-[#8b5cf6]" />
                        <span>{membro.numeroContato}</span>
                      </div>

                      <div className="mt-4 w-full grid grid-cols-2 gap-2">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-[#25d366]/20 hover:bg-[#25d366]/30 text-[#4ade80] font-bold text-xs transition flex items-center justify-center gap-1.5 border border-[#25d366]/30"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                        <a
                          href={telegramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-[#38bdf8] font-bold text-xs transition flex items-center justify-center gap-1.5 border border-[#0088cc]/30"
                        >
                          <Send className="w-3.5 h-3.5" /> Telegram
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === "recrutamento" ? (
          <div className="max-w-2xl mx-auto bg-[#0d0d0d]/95 border border-[#222] rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center mx-auto mb-4 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <UserPlus className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black mb-2">Recrutamento de Membros</h2>
              <p className="text-sm text-[#969696]">Preencha o formulário abaixo para se candidatar a fazer parte da nossa comunidade.</p>
            </div>

            <form onSubmit={handleRecrutamentoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Seu Nome / Apelido *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos 155"
                  className="w-full p-3.5 bg-[#111] text-white border border-[#262626] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Contato (Telegram, Discord ou WhatsApp) *</label>
                <input
                  type="text"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  placeholder="Ex: @seousuario ou (11) 99999-9999"
                  className="w-full p-3.5 bg-[#111] text-white border border-[#262626] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Experiência ou Habilidades *</label>
                <textarea
                  value={experiencia}
                  onChange={(e) => setExperiencia(e.target.value)}
                  placeholder="Conte um pouco sobre sua experiência em grupos, moderação ou projetos..."
                  className="w-full p-3.5 bg-[#111] text-white border border-[#262626] rounded-xl outline-none focus:border-[#8b5cf6] text-sm min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Por que quer entrar na Aliança 155? *</label>
                <textarea
                  value={motivacao}
                  onChange={(e) => setMotivacao(e.target.value)}
                  placeholder="Explique sua motivação..."
                  className="w-full p-3.5 bg-[#111] text-white border border-[#262626] rounded-xl outline-none focus:border-[#8b5cf6] text-sm min-h-[100px]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitRecrutamentoMutation.isPending}
                className="w-full py-4 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold text-sm transition hover:brightness-110 flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(139,92,246,0.3)]"
              >
                {submitRecrutamentoMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />} Enviar Inscrição
              </button>
            </form>
          </div>
        ) : listLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
          </div>
        ) : filteredDivulgacoes.length === 0 ? (
          <div className="text-center py-24 bg-[#0d0d0d] border border-[#222] rounded-3xl p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#171717] flex items-center justify-center mx-auto mb-4 text-[#969696]">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1">Nenhuma divulgação encontrada</h3>
            <p className="text-sm text-[#969696]">Tente buscar por outro termo ou selecione outra categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDivulgacoes.map((item) => (
              <div
                key={item.id}
                className="group bg-[#0d0d0d]/90 border border-[#222] hover:border-[#8b5cf6]/50 rounded-3xl p-6 transition duration-300 flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(139,92,246,0.1)] relative overflow-hidden backdrop-blur"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full blur-2xl group-hover:bg-[#8b5cf6]/10 transition"></div>

                <div>
                  <div className="flex items-start gap-4 mb-4">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-[#2a2a2a]" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-black text-lg shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        155
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#8b5cf6]/15 text-[#bca9ff] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        {item.type}
                      </span>
                      <h3 className="font-bold text-lg text-white truncate">{item.title}</h3>
                    </div>
                  </div>

                  <p className="text-[#969696] text-sm line-clamp-3 mb-6 leading-relaxed">
                    {item.description || "Sem descrição informada para esta divulgação."}
                  </p>
                </div>

                <a
                  href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#171717] hover:bg-[#8b5cf6] text-white font-bold text-xs transition duration-200 flex items-center justify-center gap-2 group-hover:shadow-[0_4px_15px_rgba(139,92,246,0.3)]"
                >
                  Acessar Agora <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f1f1f] py-8 text-center text-xs text-[#777] bg-[#050505]/95">
        <p>{settings.footer_text || "Aliança 155 — Todos os direitos reservados."}</p>
      </footer>
    </div>
  );
}
