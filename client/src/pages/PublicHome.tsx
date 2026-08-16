import { useState, useMemo, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Search, ExternalLink, Users, Megaphone, Globe, Sparkles, Loader2, Lock, UserPlus, Music, Play, Pause, Send, ShieldAlert, Phone, MessageCircle, Eye, Activity, Crown, Star, Bot, CheckCircle, Zap, CreditCard, Clock } from "lucide-react";
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

  // Aluguel Bot form state
  const [selectedPlano, setSelectedPlano] = useState<any | null>(null);
  const [compradorNome, setCompradorNome] = useState("");
  const [compradorContato, setCompradorContato] = useState("");
  const [botTokenOuUser, setBotTokenOuUser] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastAluguelResult, setLastAluguelResult] = useState<any | null>(null);

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

  const alugarBotMutation = trpc.alianca.alugarBot.useMutation({
    onSuccess: (res) => {
      toast.success("Bot alugado e ativado com sucesso!");
      setLastAluguelResult(res);
      setIsSuccessModalOpen(true);
      setCompradorNome("");
      setCompradorContato("");
      setBotTokenOuUser("");
      setSelectedPlano(null);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao processar aluguel do bot.");
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

  const handleAluguelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlano || !compradorNome || !compradorContato || !botTokenOuUser) {
      toast.error("Selecione um plano e preencha todos os campos.");
      return;
    }
    alugarBotMutation.mutate({
      planoId: selectedPlano.id,
      compradorNome,
      compradorContato,
      botTokenOuUser,
    });
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
            <Users className="w-4 h-4" /> Grupos ({counts.grupo})
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
            <Megaphone className="w-4 h-4" /> Canais ({counts.canal})
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
            <Globe className="w-4 h-4" /> Sites ({counts.site})
          </button>
          <button
            onClick={() => setActiveTab("equipe")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 border"
            style={activeTab === "equipe" ? {
              background: `linear-gradient(to bottom right, ${settings.color_primary || "#8b5cf6"}, ${settings.color_primary_hover || "#7c3aed"})`,
              color: "#fff",
              borderColor: settings.color_primary || "#8b5cf6",
              boxShadow: `0 4px 20px ${settings.color_primary || "#8b5cf6"}50`
            } : {
              backgroundColor: settings.color_card_bg || "#111111",
              color: settings.color_accent || "#c4b5fd",
              borderColor: `${settings.color_primary || "#8b5cf6"}40`
            }}
          >
            <ShieldAlert className="w-4 h-4" /> Donos e Admins ({counts.equipe})
          </button>
          <button
            onClick={() => setActiveTab("alugarBot")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 border animate-pulse"
            style={activeTab === "alugarBot" ? {
              background: `linear-gradient(to bottom right, #22c55e, #15803d)`,
              color: "#fff",
              borderColor: "#22c55e",
              boxShadow: `0 4px 20px rgba(34,197,94,0.5)`
            } : {
              backgroundColor: settings.color_card_bg || "#111111",
              color: "#4ade80",
              borderColor: "#22c55e40"
            }}
          >
            <Bot className="w-4 h-4" /> Alugar Bot 🤖
          </button>
          <button
            onClick={() => setActiveTab("recrutamento")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 border"
            style={activeTab === "recrutamento" ? {
              background: `linear-gradient(to bottom right, ${settings.color_primary || "#8b5cf6"}, ${settings.color_primary_hover || "#7c3aed"})`,
              color: "#fff",
              borderColor: settings.color_primary || "#8b5cf6",
              boxShadow: `0 4px 20px ${settings.color_primary || "#8b5cf6"}50`
            } : {
              backgroundColor: settings.color_card_bg || "#111111",
              color: settings.color_accent || "#c4b5fd",
              borderColor: `${settings.color_primary || "#8b5cf6"}40`
            }}
          >
            <UserPlus className="w-4 h-4" /> Recrutamento
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 pb-24 flex-1 w-full">
        {activeTab === "alugarBot" ? (
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30">
                <Zap className="w-3.5 h-3.5" /> Ativação 100% Automática
              </div>
              <h2 className="text-3xl md:text-4xl font-black">Alugue a Bot Oficial para o seu Grupo</h2>
              <p className="text-sm" style={{ color: settings.color_text_muted || "#969696" }}>
                Moderação avançada, anti-flood, boas-vindas automáticas e comandos exclusivos ativos em segundos.
              </p>
            </div>

            {planosLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: settings.color_primary || "#8b5cf6" }} /></div>
            ) : planosBot.length === 0 ? (
              <div className="text-center py-20 border rounded-3xl p-8 max-w-lg mx-auto" style={{ backgroundColor: settings.color_card_bg || "#0d0d0d", borderColor: settings.color_card_border || "#222" }}>
                <Bot className="w-12 h-12 mx-auto mb-3 text-[#555]" />
                <h3 className="text-lg font-bold mb-1">Nenhum plano disponível</h3>
                <p className="text-sm" style={{ color: settings.color_text_muted || "#969696" }}>O administrador ainda não cadastrou os planos de aluguel de bot no painel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {planosBot.map((plano) => {
                  const isSelected = selectedPlano?.id === plano.id;
                  const recursosList = plano.recursos ? plano.recursos.split(",").map(r => r.trim()).filter(Boolean) : [];

                  return (
                    <div
                      key={plano.id}
                      className="border rounded-3xl p-6 transition duration-300 flex flex-col justify-between relative backdrop-blur shadow-lg"
                      style={{
                        backgroundColor: `${settings.color_card_bg || "#0d0d0d"}95`,
                        borderColor: isSelected ? (settings.color_primary || "#8b5cf6") : (settings.color_card_border || "#222"),
                        boxShadow: isSelected ? `0 0 25px ${settings.color_primary || "#8b5cf6"}40` : undefined
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30">
                            {plano.duracaoDias} Dias
                          </span>
                          <span className="text-2xl font-black text-white">R$ {plano.preco}</span>
                        </div>

                        <h3 className="font-bold text-xl mb-2 text-white">{plano.nome}</h3>
                        <p className="text-xs mb-6 leading-relaxed" style={{ color: settings.color_text_muted || "#969696" }}>
                          {plano.descricao}
                        </p>

                        <div className="space-y-2 mb-8">
                          {recursosList.map((rec, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs" style={{ color: settings.color_text_main || "#ddd" }}>
                              <CheckCircle className="w-4 h-4 text-[#22c55e] shrink-0" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPlano(plano)}
                        className="w-full py-3 px-4 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-2 shadow-md"
                        style={{
                          background: isSelected ? "linear-gradient(to bottom right, #22c55e, #15803d)" : (settings.color_button_bg || "#171717"),
                          color: isSelected ? "#fff" : (settings.color_text_main || "#fff"),
                        }}
                      >
                        {isSelected ? "Plano Selecionado ✓" : "Selecionar Plano"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Checkout Form */}
            {selectedPlano && (
              <div
                className="max-w-xl mx-auto border rounded-3xl p-8 shadow-2xl backdrop-blur space-y-6"
                style={{
                  backgroundColor: `${settings.color_card_bg || "#0d0d0d"}98`,
                  borderColor: settings.color_primary || "#8b5cf6"
                }}
              >
                <div className="flex items-center justify-between border-b border-[#222] pb-4">
                  <div>
                    <span className="text-xs text-[#8b5cf6] font-bold uppercase">Checkout Automático</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{selectedPlano.nome}</h3>
                  </div>
                  <span className="text-2xl font-black text-[#4ade80]">R$ {selectedPlano.preco}</span>
                </div>

                <form onSubmit={handleAluguelSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Seu Nome *</label>
                    <input
                      type="text"
                      value={compradorNome}
                      onChange={(e) => setCompradorNome(e.target.value)}
                      placeholder="Ex: Carlos 155"
                      className="w-full p-3.5 border rounded-xl outline-none text-sm bg-[#111] border-[#262626] text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Seu Contato (WhatsApp / Telegram) *</label>
                    <input
                      type="text"
                      value={compradorContato}
                      onChange={(e) => setCompradorContato(e.target.value)}
                      placeholder="Ex: (11) 99999-9999"
                      className="w-full p-3.5 border rounded-xl outline-none text-sm bg-[#111] border-[#262626] text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Username da Bot ou Token (ex: @SuaBot_bot) *</label>
                    <input
                      type="text"
                      value={botTokenOuUser}
                      onChange={(e) => setBotTokenOuUser(e.target.value)}
                      placeholder="Ex: @AliancaBot155_bot"
                      className="w-full p-3.5 border rounded-xl outline-none text-sm bg-[#111] border-[#262626] text-white"
                      required
                    />
                    <span className="text-[11px] text-[#969696] mt-1 block">A bot será provisionada e ativada automaticamente após a confirmação do pagamento.</span>
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPlano(null)}
                      className="px-5 py-3 rounded-xl bg-[#171717] text-xs font-bold text-[#bbb] hover:bg-[#222]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={alugarBotMutation.isPending}
                      className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white transition hover:brightness-110 flex items-center justify-center gap-2 shadow-lg"
                      style={{ background: "linear-gradient(to bottom right, #22c55e, #15803d)" }}
                    >
                      {alugarBotMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-4 h-4" />} Confirmar e Ativar Bot Agora
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : activeTab === "equipe" ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipe.map((membro) => {
                  const numLimpo = membro.numeroContato.replace(/\D/g, "");
                  const isUrl = membro.numeroContato.startsWith("http");
                  const whatsappUrl = isUrl ? membro.numeroContato : `https://wa.me/${numLimpo}`;
                  const telegramUrl = isUrl ? membro.numeroContato : `https://t.me/${membro.numeroContato.replace(/^@/, "")}`;

                  return (
                    <div
                      key={membro.id}
                      className="border rounded-3xl p-6 transition duration-300 flex flex-col items-center text-center shadow-lg backdrop-blur"
                      style={{
                        backgroundColor: `${settings.color_card_bg || "#0d0d0d"}95`,
                        borderColor: settings.color_card_border || "#222"
                      }}
                    >
                      {membro.foto ? (
                        <img src={membro.foto} alt={membro.nome} className="w-24 h-24 rounded-full object-cover border-2 mb-4 shadow-md" style={{ borderColor: settings.color_primary || "#8b5cf6" }} />
                      ) : (
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center font-black text-2xl mb-4 text-white shadow-md"
                          style={{ background: `linear-gradient(to bottom right, ${settings.color_primary || "#8b5cf6"}, ${settings.color_primary_hover || "#7c3aed"})` }}
                        >
                          {membro.nome.charAt(0)}
                        </div>
                      )}
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border"
                        style={{
                          backgroundColor: `${settings.color_primary || "#8b5cf6"}20`,
                          borderColor: `${settings.color_primary || "#8b5cf6"}40`,
                          color: settings.color_accent || "#c4b5fd"
                        }}
                      >
                        {membro.cargo}
                      </span>
                      <h3 className="font-bold text-xl mb-2" style={{ color: settings.color_text_main || "#fff" }}>{membro.nome}</h3>
                      <div className="mt-2 w-full pt-3 border-t flex items-center justify-center gap-2 text-sm" style={{ borderColor: settings.color_card_border || "#222", color: settings.color_text_muted || "#969696" }}>
                        <Phone className="w-4 h-4" style={{ color: settings.color_primary || "#8b5cf6" }} />
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
          <div
            className="max-w-2xl mx-auto border rounded-3xl p-8 shadow-2xl backdrop-blur"
            style={{
              backgroundColor: `${settings.color_card_bg || "#0d0d0d"}95`,
              borderColor: settings.color_card_border || "#222"
            }}
          >
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg"
                style={{ background: `linear-gradient(to bottom right, ${settings.color_primary || "#8b5cf6"}, ${settings.color_primary_hover || "#7c3aed"})` }}
              >
                <UserPlus className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black mb-2">Recrutamento de Membros</h2>
              <p className="text-sm" style={{ color: settings.color_text_muted || "#969696" }}>Preencha o formulário abaixo para se candidatar a fazer parte da nossa comunidade.</p>
            </div>

            <form onSubmit={handleRecrutamentoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Seu Nome / Apelido *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos 155"
                  className="w-full p-3.5 border rounded-xl outline-none text-sm"
                  style={{
                    backgroundColor: settings.color_card_bg || "#111",
                    borderColor: settings.color_card_border || "#262626",
                    color: settings.color_text_main || "#fff"
                  }}
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
                  className="w-full p-3.5 border rounded-xl outline-none text-sm"
                  style={{
                    backgroundColor: settings.color_card_bg || "#111",
                    borderColor: settings.color_card_border || "#262626",
                    color: settings.color_text_main || "#fff"
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Experiência ou Habilidades *</label>
                <textarea
                  value={experiencia}
                  onChange={(e) => setExperiencia(e.target.value)}
                  placeholder="Conte um pouco sobre sua experiência em grupos, moderação ou projetos..."
                  className="w-full p-3.5 border rounded-xl outline-none text-sm min-h-[100px]"
                  style={{
                    backgroundColor: settings.color_card_bg || "#111",
                    borderColor: settings.color_card_border || "#262626",
                    color: settings.color_text_main || "#fff"
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Por que quer entrar na Aliança 155? *</label>
                <textarea
                  value={motivacao}
                  onChange={(e) => setMotivacao(e.target.value)}
                  placeholder="Explique sua motivação..."
                  className="w-full p-3.5 border rounded-xl outline-none text-sm min-h-[100px]"
                  style={{
                    backgroundColor: settings.color_card_bg || "#111",
                    borderColor: settings.color_card_border || "#262626",
                    color: settings.color_text_main || "#fff"
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitRecrutamentoMutation.isPending}
                className="w-full py-4 rounded-xl text-white font-bold text-sm transition hover:brightness-110 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: `linear-gradient(to bottom right, ${settings.color_primary || "#8b5cf6"}, ${settings.color_primary_hover || "#7c3aed"})` }}
              >
                {submitRecrutamentoMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />} Enviar Inscrição
              </button>
            </form>
          </div>
        ) : listLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: settings.color_primary || "#8b5cf6" }} />
          </div>
        ) : filteredDivulgacoes.length === 0 ? (
          <div className="text-center py-24 border rounded-3xl p-8 max-w-lg mx-auto" style={{ backgroundColor: settings.color_card_bg || "#0d0d0d", borderColor: settings.color_card_border || "#222" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: settings.color_button_bg || "#171717", color: settings.color_text_muted || "#969696" }}>
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1">Nenhuma divulgação encontrada</h3>
            <p className="text-sm" style={{ color: settings.color_text_muted || "#969696" }}>Tente buscar por outro termo ou selecione outra categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDivulgacoes.map((item) => {
              const p = item.prioridade || "normal";
              const isPremium = p === "premium";
              const isVip = p === "vip";

              const cardStyle = isPremium
                ? {
                    backgroundColor: `${settings.color_card_bg || "#0d0d0d"}95`,
                    borderColor: "#f59e0b88",
                    boxShadow: "0 0 25px rgba(245, 158, 11, 0.2)"
                  }
                : isVip
                ? {
                    backgroundColor: `${settings.color_card_bg || "#0d0d0d"}95`,
                    borderColor: `${settings.color_primary || "#8b5cf6"}88`,
                    boxShadow: `0 0 20px ${settings.color_primary || "#8b5cf6"}25`
                  }
                : {
                    backgroundColor: `${settings.color_card_bg || "#0d0d0d"}90`,
                    borderColor: settings.color_card_border || "#222"
                  };

              return (
                <div
                  key={item.id}
                  className="group border rounded-3xl p-6 transition duration-300 flex flex-col justify-between relative overflow-hidden backdrop-blur shadow-md"
                  style={cardStyle}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition" style={{ backgroundColor: isPremium ? "rgba(245,158,11,0.15)" : `${settings.color_primary || "#8b5cf6"}10` }}></div>

                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-16 h-16 rounded-2xl object-cover shrink-0 border" style={{ borderColor: settings.color_card_border || "#2a2a2a" }} />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 text-white shadow-md"
                          style={{ background: isPremium ? "linear-gradient(to bottom right, #f59e0b, #d97706)" : `linear-gradient(to bottom right, ${settings.color_primary || "#8b5cf6"}, ${settings.color_primary_hover || "#7c3aed"})` }}
                        >
                          155
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                            style={{
                              backgroundColor: `${settings.color_primary || "#8b5cf6"}20`,
                              borderColor: `${settings.color_primary || "#8b5cf6"}40`,
                              color: settings.color_accent || "#c4b5fd"
                            }}
                          >
                            {item.type}
                          </span>
                          {isPremium && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Star className="w-3 h-3 fill-amber-300" /> Premium
                            </span>
                          )}
                          {isVip && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              <Crown className="w-3 h-3" /> VIP
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg truncate" style={{ color: settings.color_text_main || "#fff" }}>{item.title}</h3>
                      </div>
                    </div>

                    <p className="text-sm line-clamp-3 mb-6 leading-relaxed" style={{ color: settings.color_text_muted || "#969696" }}>
                      {item.description || "Sem descrição informada para esta divulgação."}
                    </p>
                  </div>

                  <a
                    href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-2 shadow-md"
                    style={{
                      backgroundColor: isPremium ? "#f59e0b" : (settings.color_button_bg || "#171717"),
                      color: isPremium ? "#000" : (settings.color_text_main || "#fff"),
                    }}
                    onMouseEnter={(e) => {
                      if (!isPremium) e.currentTarget.style.backgroundColor = settings.color_primary || "#8b5cf6";
                    }}
                    onMouseLeave={(e) => {
                      if (!isPremium) e.currentTarget.style.backgroundColor = settings.color_button_bg || "#171717";
                    }}
                  >
                    Acessar Agora <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Success Modal for Bot Aluguel */}
      {isSuccessModalOpen && lastAluguelResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#111111] border border-[#22c55e]/40 w-full max-w-md rounded-3xl p-8 space-y-6 text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 text-[#4ade80] flex items-center justify-center mx-auto border border-[#22c55e]/40 shadow-lg">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Bot Alugada com Sucesso!</h3>
              <p className="text-sm text-[#969696]">Seu pagamento foi aprovado e o sistema iniciou o provisionamento automático.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-[#222] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#969696]">Plano:</span>
                <strong className="text-white">{lastAluguelResult.planoNome}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#969696]">Status do Bot:</span>
                <strong className="text-[#4ade80]">ATIVO 🟢</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#969696]">Expira em:</span>
                <strong className="text-white">{new Date(lastAluguelResult.expiresAt).toLocaleDateString()}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setActiveTab("all");
              }}
              className="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-sm transition shadow-lg"
            >
              Concluir e Voltar ao Site
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs backdrop-blur" style={{ borderColor: settings.color_card_border || "#1f1f1f", backgroundColor: `${settings.color_card_bg || "#050505"}95`, color: settings.color_text_muted || "#777" }}>
        <p>{settings.footer_text || "Aliança 155 — Todos os direitos reservados."}</p>
      </footer>
    </div>
  );
}
