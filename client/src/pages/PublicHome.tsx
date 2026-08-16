import { useState, useMemo, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Search, ExternalLink, Users, Megaphone, Globe, Sparkles, Loader2, Lock, UserPlus, Music, Play, Pause, Send, ShieldAlert, Phone, MessageCircle, Eye, Activity, Crown, Star, Bot, CheckCircle, Zap, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function PublicHome() {
  const [activeTab, setActiveTab] = useState<"all" | "grupo" | "canal" | "site" | "recrutamento" | "equipe" | "alugarBot">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Recrutamento form state
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [motivacao, setMotivacao] = useState("");

  // Metrics state
  const [totalVisitas, setTotalVisitas] = useState<number | null>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<number | null>(null);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: divulgacoes = [], isLoading: listLoading } = trpc.alianca.list.useQuery();
  const { data: settings = {} } = trpc.alianca.getSettings.useQuery();
  const { data: equipe = [], isLoading: equipeLoading } = trpc.alianca.listEquipe.useQuery();
  const { data: planosBot = [], isLoading: planosLoading } = trpc.alianca.listBotPlanos.useQuery();

  const pingMutation = trpc.alianca.pingVisit.useMutation({
    onSuccess: (data) => {
      setTotalVisitas(data.totalVisitas);
      setUsuariosOnline(data.usuariosOnline);
    }
  });

  const heartbeatMutation = trpc.alianca.heartbeat.useMutation({
    onSuccess: (data) => {
      setUsuariosOnline(data.usuariosOnline);
    }
  });

  useEffect(() => {
    let sessionId = sessionStorage.getItem("alianca_session_id");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem("alianca_session_id", sessionId);
    }

    pingMutation.mutate({ sessionId });

    const interval = setInterval(() => {
      heartbeatMutation.mutate({ sessionId });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
      planos: planosBot.length,
    };
  }, [divulgacoes, equipe, planosBot]);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      videoId = urlParams.get("v") || "";
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/shorts/")) {
      videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`;
    }
    return null;
  };

  const youtubeEmbed = useMemo(() => {
    return settings.site_music_url ? getYouTubeEmbedUrl(settings.site_music_url) : null;
  }, [settings.site_music_url]);

  const toggleMusic = () => {
    if (youtubeEmbed) {
      setIsPlaying(!isPlaying);
      return;
    }
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

  const handleWhatsAppSolicitacao = (planoNome: string, preco: string) => {
    const rawNum = settings.bot_rental_whatsapp;
    if (!rawNum || rawNum.trim() === "") {
      toast.error("O número de WhatsApp para aluguel não está configurado no painel administrativo.");
      return;
    }
    const cleanNum = rawNum.replace(/\D/g, "");
    if (cleanNum.length < 8) {
      toast.error("O número de WhatsApp configurado parece inválido.");
      return;
    }
    const mensagem = encodeURIComponent(`Olá! Gostaria de solicitar a locação do plano "${planoNome}" (R$ ${preco}) da Aliança 155.`);
    const url = `https://wa.me/${cleanNum}?text=${mensagem}`;
    window.open(url, "_blank");
  };

  // Dynamic custom styles
  const bgStyle = settings.site_bg_image
    ? { backgroundImage: `linear-gradient(to bottom, rgba(5,5,5,0.9), rgba(5,5,5,0.95)), url(${settings.site_bg_image})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundColor: settings.color_bg || "#050505" };

  return (
    <div
      className="min-h-screen flex flex-col font-sans relative"
      style={{
        ...bgStyle,
        color: settings.color_text_main || "#ffffff",
      }}
    >
      {/* Hidden audio element */}
      {settings.site_music_url && !youtubeEmbed && (
        <audio ref={audioRef} src={settings.site_music_url} loop preload="none" />
      )}

      {youtubeEmbed && isPlaying && (
        <div className="hidden">
          <iframe
            src={youtubeEmbed}
            className="w-0 h-0"
            allow="autoplay"
            title="Trilha Sonora YouTube"
          ></iframe>
        </div>
      )}

      {/* Navbar */}
      <header
        className="border-b backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          borderColor: settings.color_card_border || "#222222",
          backgroundColor: `${settings.color_card_bg || "#0d0d0d"}ee`,
        }}
      >
        <div className="flex items-center gap-3">
          {settings.site_logo ? (
            <img src={settings.site_logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover border" style={{ borderColor: settings.color_card_border || "#292929" }} />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg"
              style={{ background: `linear-gradient(to bottom right, ${settings.color_primary || "#8b5cf6"}, ${settings.color_primary_hover || "#7c3aed"})` }}
            >
              155
            </div>
          )}
          <div>
            <span className="font-bold text-base block tracking-wide">{settings.site_title || "Aliança 155"}</span>
            <span className="text-xs block" style={{ color: settings.color_text_muted || "#969696" }}>{settings.site_subtitle || "Central de Divulgações"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl text-xs border" style={{ backgroundColor: settings.color_card_bg || "#111", borderColor: settings.color_card_border || "#222" }}>
            <div className="flex items-center gap-1.5" style={{ color: settings.color_text_muted || "#969696" }}>
              <Eye className="w-3.5 h-3.5" style={{ color: settings.color_primary || "#8b5cf6" }} />
              <span>Visitas: <strong style={{ color: settings.color_text_main || "#fff" }}>{totalVisitas !== null ? totalVisitas : "..."}</strong></span>
            </div>
            <div className="w-[1px] h-3.5" style={{ backgroundColor: settings.color_card_border || "#333" }}></div>
            <div className="flex items-center gap-1.5" style={{ color: settings.color_text_muted || "#969696" }}>
              <Activity className="w-3.5 h-3.5 text-[#22c55e] animate-pulse" />
              <span>Online: <strong style={{ color: settings.color_text_main || "#fff" }}>{usuariosOnline !== null ? usuariosOnline : "1"}</strong></span>
            </div>
          </div>

          {settings.site_music_url && (
            <button
              onClick={toggleMusic}
              className="px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2"
              style={{
                backgroundColor: settings.color_button_bg || "#141414",
                borderColor: settings.color_card_border || "#292929",
                color: settings.color_accent || "#c4b5fd"
              }}
              title={isPlaying ? "Pausar Trilha Sonora" : "Tocar Trilha Sonora"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 animate-pulse" style={{ color: settings.color_primary || "#8b5cf6" }} /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlaying ? "Pausar Música" : (settings.site_music_title || "Trilha Sonora")}</span>
            </button>
          )}

          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2"
            style={{
              backgroundColor: settings.color_button_bg || "#141414",
              borderColor: settings.color_card_border || "#292929",
              color: settings.color_accent || "#c4b5fd"
            }}
          >
            <Lock className="w-3.5 h-3.5" /> {settings.admin_btn_text || "Painel Admin"}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-14 md:py-20 text-center max-w-4xl mx-auto space-y-6">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider border"
          style={{
            backgroundColor: `${settings.color_primary || "#8b5cf6"}15`,
            borderColor: `${settings.color_primary || "#8b5cf6"}40`,
            color: settings.color_accent || "#c4b5fd"
          }}
        >
          <Sparkles className="w-3.5 h-3.5" /> {settings.hero_badge || "ALIANÇA 155"}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
          {settings.hero_title_main || "Central de Divulgações"}{" "}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${settings.color_primary || "#8b5cf6"}, ${settings.color_accent || "#c4b5fd"})` }}>
            {settings.hero_title_accent || "Oficial"}
          </span>
        </h1>

        <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: settings.color_text_muted || "#969696" }}>
          {settings.hero_description || "Encontre os melhores grupos, canais e sites recomendados pela nossa comunidade."}
        </p>

        {/* Mobile Metrics view */}
        <div className="flex md:hidden items-center justify-center gap-4 px-4 py-2 rounded-xl text-xs max-w-xs mx-auto border" style={{ backgroundColor: settings.color_card_bg || "#111", borderColor: settings.color_card_border || "#222" }}>
          <div className="flex items-center gap-1.5" style={{ color: settings.color_text_muted || "#969696" }}>
            <Eye className="w-3.5 h-3.5" style={{ color: settings.color_primary || "#8b5cf6" }} />
            <span>Visitas: <strong style={{ color: settings.color_text_main || "#fff" }}>{totalVisitas !== null ? totalVisitas : "..."}</strong></span>
          </div>
          <div className="w-[1px] h-3.5" style={{ backgroundColor: settings.color_card_border || "#333" }}></div>
          <div className="flex items-center gap-1.5" style={{ color: settings.color_text_muted || "#969696" }}>
            <Activity className="w-3.5 h-3.5 text-[#22c55e] animate-pulse" />
            <span>Online: <strong style={{ color: settings.color_text_main || "#fff" }}>{usuariosOnline !== null ? usuariosOnline : "1"}</strong></span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        {activeTab !== "recrutamento" && activeTab !== "equipe" && activeTab !== "alugarBot" && (
          <div className="pt-4 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: settings.color_text_muted || "#969696" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por nome ou link..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none transition text-sm shadow-inner backdrop-blur border"
                style={{
                  backgroundColor: settings.color_card_bg || "#111111",
                  borderColor: settings.color_card_border || "#262626",
                  color: settings.color_text_main || "#fff"
                }}
              />
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setActiveTab("all")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 border"
            style={activeTab === "all" ? {
              backgroundColor: settings.color_primary || "#8b5cf6",
              color: "#fff",
              borderColor: settings.color_primary || "#8b5cf6",
              boxShadow: `0 4px 20px ${settings.color_primary || "#8b5cf6"}50`
            } : {
              backgroundColor: settings.color_card_bg || "#111111",
              color: settings.color_text_muted || "#969696",
              borderColor: settings.color_card_border || "#262626"
            }}
          >
            Todos ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab("grupo")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 border"
            style={activeTab === "grupo" ? {
              backgroundColor: settings.color_primary || "#8b5cf6",
              color: "#fff",
              borderColor: settings.color_primary || "#8b5cf6",
              boxShadow: `0 4px 20px ${settings.color_primary || "#8b5cf6"}50`
            } : {
              backgroundColor: settings.color_card_bg || "#111111",
              color: settings.color_text_muted || "#969696",
              borderColor: settings.color_card_border || "#262626"
            }}
          >
            Grupos ({counts.grupo})
          </button>
          <button
            onClick={() => setActiveTab("canal")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 border"
            style={activeTab === "canal" ? {
              backgroundColor: settings.color_primary || "#8b5cf6",
              color: "#fff",
              borderColor: settings.color_primary || "#8b5cf6",
              boxShadow: `0 4px 20px ${settings.color_primary || "#8b5cf6"}50`
            } : {
              backgroundColor: settings.color_card_bg || "#111111",
              color: settings.color_text_muted || "#969696",
              borderColor: settings.color_card_border || "#262626"
            }}
          >
            Canais ({counts.canal})
          </button>
          <button
            onClick={() => setActiveTab("site")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 border"
            style={activeTab === "site" ? {
              backgroundColor: settings.color_primary || "#8b5cf6",
              color: "#fff",
              borderColor: settings.color_primary || "#8b5cf6",
              boxShadow: `0 4px 20px ${settings.color_primary || "#8b5cf6"}50`
            } : {
              backgroundColor: settings.color_card_bg || "#111111",
              color: settings.color_text_muted || "#969696",
              borderColor: settings.color_card_border || "#262626"
            }}
          >
            Sites ({counts.site})
          </button>
          <button
            onClick={() => setActiveTab("equipe")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 border"
            style={activeTab === "equipe" ? {
              backgroundColor: settings.color_primary || "#8b5cf6",
              color: "#fff",
              borderColor: settings.color_primary || "#8b5cf6",
              boxShadow: `0 4px 20px ${settings.color_primary || "#8b5cf6"}50`
            } : {
              backgroundColor: settings.color_card_bg || "#111111",
              color: settings.color_text_muted || "#969696",
              borderColor: settings.color_card_border || "#262626"
            }}
          >
            Equipe ({counts.equipe})
          </button>
          <button
            onClick={() => setActiveTab("alugarBot")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 border"
            style={activeTab === "alugarBot" ? {
              backgroundColor: "#22c55e",
              color: "#fff",
              borderColor: "#22c55e",
              boxShadow: "0 4px 20px rgba(34, 197, 94, 0.4)"
            } : {
              backgroundColor: settings.color_card_bg || "#111111",
              color: "#4ade80",
              borderColor: settings.color_card_border || "#262626"
            }}
          >
            <Bot className="w-4 h-4" /> Alugar Bot
          </button>
          <button
            onClick={() => setActiveTab("recrutamento")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 border"
            style={activeTab === "recrutamento" ? {
              backgroundColor: settings.color_primary || "#8b5cf6",
              color: "#fff",
              borderColor: settings.color_primary || "#8b5cf6",
              boxShadow: `0 4px 20px ${settings.color_primary || "#8b5cf6"}50`
            } : {
              backgroundColor: settings.color_card_bg || "#111111",
              color: settings.color_text_muted || "#969696",
              borderColor: settings.color_card_border || "#262626"
            }}
          >
            Recrutamento
          </button>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pb-24">
        {activeTab === "equipe" ? (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black mb-2">Equipe de Donos e Administradores</h2>
              <p className="text-sm" style={{ color: settings.color_text_muted || "#969696" }}>Conecte-se diretamente com os responsáveis pela gestão da Aliança 155 via WhatsApp ou Telegram.</p>
            </div>

            {equipeLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: settings.color_primary || "#8b5cf6" }} /></div>
            ) : equipe.length === 0 ? (
              <div className="text-center py-20 border rounded-3xl p-8 max-w-lg mx-auto" style={{ backgroundColor: settings.color_card_bg || "#0d0d0d", borderColor: settings.color_card_border || "#222" }}>
                <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-[#555]" />
                <h3 className="text-lg font-bold mb-1">Nenhum membro cadastrado</h3>
                <p className="text-sm" style={{ color: settings.color_text_muted || "#969696" }}>O administrador ainda não cadastrou os donos e admins no painel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipe.map((membro) => (
                  <div
                    key={membro.id}
                    className="border rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 transition hover:-translate-y-1"
                    style={{
                      backgroundColor: settings.color_card_bg || "#0d0d0d",
                      borderColor: settings.color_card_border || "#222",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {membro.foto ? (
                        <img src={membro.foto} alt={membro.nome} className="w-16 h-16 rounded-2xl object-cover border border-[#333] shadow-md" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#222] flex items-center justify-center font-black text-xl text-white shadow-md">
                          {membro.nome.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span
                          className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
                          style={{
                            backgroundColor: `${settings.color_primary || "#8b5cf6"}20`,
                            borderColor: `${settings.color_primary || "#8b5cf6"}40`,
                            color: settings.color_accent || "#c4b5fd"
                          }}
                        >
                          {membro.cargo}
                        </span>
                        <h3 className="font-extrabold text-lg text-white mt-1.5">{membro.nome}</h3>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${membro.numeroContato}?text=${encodeURIComponent(`Olá ${membro.nome}, vim através do site da Aliança 155.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg hover:brightness-110"
                      style={{ background: "linear-gradient(to bottom right, #22c55e, #15803d)", color: "#fff" }}
                    >
                      <Phone className="w-4 h-4" /> Conversar no WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "alugarBot" ? (
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40 uppercase tracking-widest">
                Automação para Grupos e Canais
              </span>
              <h2 className="text-3xl md:text-4xl font-black">Alugue a Bot Oficial da Aliança 155</h2>
              <p className="text-sm max-w-xl mx-auto" style={{ color: settings.color_text_muted || "#969696" }}>
                Escolha o plano ideal para gerenciar sua comunidade com moderação inteligente, anti-flood, boas-vindas automáticas e comandos exclusivos.
              </p>
            </div>

            {planosLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#22c55e" }} /></div>
            ) : planosBot.length === 0 ? (
              <div className="text-center py-20 border rounded-3xl p-8" style={{ backgroundColor: settings.color_card_bg || "#0d0d0d", borderColor: settings.color_card_border || "#222" }}>
                <Bot className="w-12 h-12 mx-auto mb-3 text-[#555]" />
                <h3 className="text-lg font-bold mb-1">Nenhum plano disponível no momento</h3>
                <p className="text-sm" style={{ color: settings.color_text_muted || "#969696" }}>O administrador cadastrará os planos de aluguel em breve.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {planosBot.map((plano) => (
                  <div
                    key={plano.id}
                    className="border rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6 transition hover:scale-[1.02]"
                    style={{
                      backgroundColor: settings.color_card_bg || "#0d0d0d",
                      borderColor: settings.color_card_border || "#222",
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 uppercase">
                          {plano.duracaoDias} Dias
                        </span>
                        <span className="text-2xl font-black text-[#4ade80]">R$ {plano.preco}</span>
                      </div>

                      <h3 className="text-xl font-black text-white mb-2">{plano.nome}</h3>
                      <p className="text-xs mb-6" style={{ color: settings.color_text_muted || "#969696" }}>{plano.descricao}</p>

                      <div className="space-y-2.5 pt-4 border-t border-[#222]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b5cf6] block mb-2">Recursos Inclusos:</span>
                        {plano.recursos.split(",").map((rec, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-[#ddd]">
                            <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
                            <span>{rec.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleWhatsAppSolicitacao(plano.nome, plano.preco)}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:brightness-110"
                      style={{
                        background: "linear-gradient(to bottom right, #22c55e, #15803d)",
                        color: "#fff",
                      }}
                    >
                      <MessageCircle className="w-4 h-4" /> Solicitar pelo WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "recrutamento" ? (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#8b5cf6]/20 text-[#bca9ff] border border-[#8b5cf6]/40 uppercase tracking-widest">
                Faça Parte da Equipe
              </span>
              <h2 className="text-3xl font-black">Recrutamento de Membros</h2>
              <p className="text-sm" style={{ color: settings.color_text_muted || "#969696" }}>
                Preencha o formulário abaixo para se candidatar a uma vaga na nossa comunidade ou equipe de divulgação.
              </p>
            </div>

            <form
              onSubmit={handleRecrutamentoSubmit}
              className="border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur"
              style={{
                backgroundColor: settings.color_card_bg || "#0d0d0d",
                borderColor: settings.color_card_border || "#222",
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1.5">Seu Nome / Apelido *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos 155"
                  className="w-full p-3.5 border rounded-xl outline-none text-sm bg-[#111] border-[#262626] text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Seu WhatsApp ou Telegram (com DDD) *</label>
                <input
                  type="text"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full p-3.5 border rounded-xl outline-none text-sm bg-[#111] border-[#262626] text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Sua Experiência (Grupos, Canais, Moderação) *</label>
                <textarea
                  value={experiencia}
                  onChange={(e) => setExperiencia(e.target.value)}
                  placeholder="Conte um pouco sobre o que você já fez ou gerencia..."
                  className="w-full p-3.5 border rounded-xl outline-none text-sm bg-[#111] border-[#262626] text-white min-h-[90px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Por que quer entrar na Aliança 155? *</label>
                <textarea
                  value={motivacao}
                  onChange={(e) => setMotivacao(e.target.value)}
                  placeholder="Sua motivação..."
                  className="w-full p-3.5 border rounded-xl outline-none text-sm bg-[#111] border-[#262626] text-white min-h-[90px]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitRecrutamentoMutation.isPending}
                className="w-full py-4 rounded-xl font-bold text-sm text-white transition hover:brightness-110 flex items-center justify-center gap-2 shadow-lg"
                style={{
                  background: `linear-gradient(to bottom right, ${settings.color_primary || "#8b5cf6"}, #5b21b6)`,
                }}
              >
                {submitRecrutamentoMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />} Enviar Inscrição para Análise
              </button>
            </form>
          </div>
        ) : (
          <div>
            {listLoading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: settings.color_primary || "#8b5cf6" }} />
              </div>
            ) : filteredDivulgacoes.length === 0 ? (
              <div className="text-center py-20 border rounded-3xl p-8 max-w-lg mx-auto" style={{ backgroundColor: settings.color_card_bg || "#0d0d0d", borderColor: settings.color_card_border || "#222" }}>
                <Megaphone className="w-12 h-12 mx-auto mb-3 text-[#555]" />
                <h3 className="text-lg font-bold mb-1">Nenhuma divulgação encontrada</h3>
                <p className="text-sm" style={{ color: settings.color_text_muted || "#969696" }}>Tente buscar por outro termo ou selecione outra categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDivulgacoes.map((item) => {
                  const p = item.prioridade || "normal";
                  const isPremium = p === "premium";
                  const isVip = p === "vip";

                  const cardStyle = isPremium
                    ? {
                        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(13, 13, 13, 0.95) 60%)",
                        borderColor: "rgba(245, 158, 11, 0.4)",
                        boxShadow: "0 0 25px rgba(245, 158, 11, 0.15)"
                      }
                    : isVip
                    ? {
                        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(13, 13, 13, 0.95) 60%)",
                        borderColor: "rgba(139, 92, 246, 0.4)",
                        boxShadow: "0 0 20px rgba(139, 92, 246, 0.15)"
                      }
                    : {
                        backgroundColor: settings.color_card_bg || "#0d0d0d",
                        borderColor: settings.color_card_border || "#222",
                      };

                  const badgeBg = isPremium
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : isVip
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    : "bg-[#1f1f1f] text-[#aaa] border-[#333]";

                  const badgeText = isPremium ? "⭐ PREMIUM" : isVip ? "👑 VIP" : item.type.toUpperCase();

                  return (
                    <div
                      key={item.id}
                      className="border rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 transition duration-300 hover:-translate-y-1 hover:border-[#8b5cf6]"
                      style={cardStyle}
                    >
                      <div className="flex items-start gap-4">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-16 h-16 rounded-2xl object-cover border border-[#333] shadow-md shrink-0" />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white shadow-md shrink-0"
                            style={{ background: `linear-gradient(to bottom right, ${settings.color_primary || "#8b5cf6"}, #5b21b6)` }}
                          >
                            155
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${badgeBg}`}>
                              {badgeText}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-lg text-white truncate">{item.title}</h3>
                        </div>
                      </div>

                      <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: settings.color_text_muted || "#969696" }}>
                        {item.description || "Sem descrição informada."}
                      </p>

                      <a
                        href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 px-4 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:brightness-110"
                        style={{
                          background: isPremium
                            ? "linear-gradient(to bottom right, #f59e0b, #d97706)"
                            : isVip
                            ? "linear-gradient(to bottom right, #8b5cf6, #7c3aed)"
                            : (settings.color_button_bg || "#171717"),
                          color: "#fff",
                          border: isPremium || isVip ? "none" : "1px solid #333"
                        }}
                      >
                        Acessar {item.type} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 text-center text-xs backdrop-blur mt-auto"
        style={{
          borderColor: settings.color_card_border || "#222222",
          backgroundColor: `${settings.color_card_bg || "#0d0d0d"}ee`,
          color: settings.color_text_muted || "#777",
        }}
      >
        <p>{settings.footer_text || "Aliança 155 — Todos os direitos reservados."}</p>
      </footer>
    </div>
  );
}
