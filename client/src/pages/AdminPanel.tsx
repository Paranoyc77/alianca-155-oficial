import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { LayoutDashboard, Megaphone, Users, Globe, Settings, LogOut, Plus, Search, ExternalLink, Edit, Trash2, Key, AlertTriangle, X, Loader2, Menu, AlertCircle, FileText, CheckCircle2, Image as ImageIcon, Music, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal State para Divulgações
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id?: number; title: string; description: string; type: "grupo" | "canal" | "site"; link: string; image: string } | null>(null);

  // Configurações globais do site state
  const { data: settings = {}, refetch: refetchSettings } = trpc.alianca.getSettings.useQuery();
  const { data: inscricoes = [], refetch: refetchInscricoes } = trpc.alianca.listRecrutamento.useQuery();

  const [siteForm, setSiteForm] = useState({
    site_title: "",
    site_subtitle: "",
    hero_badge: "",
    hero_title_main: "",
    hero_title_accent: "",
    hero_description: "",
    footer_text: "",
    admin_btn_text: "",
    site_logo: "",
    site_bg_image: "",
    site_music_url: "",
    site_music_title: "",
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setSiteForm({
        site_title: settings.site_title || "",
        site_subtitle: settings.site_subtitle || "",
        hero_badge: settings.hero_badge || "",
        hero_title_main: settings.hero_title_main || "",
        hero_title_accent: settings.hero_title_accent || "",
        hero_description: settings.hero_description || "",
        footer_text: settings.footer_text || "",
        admin_btn_text: settings.admin_btn_text || "",
        site_logo: settings.site_logo || "",
        site_bg_image: settings.site_bg_image || "",
        site_music_url: settings.site_music_url || "",
        site_music_title: settings.site_music_title || "",
      });
    }
  }, [settings]);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const utils = trpc.useUtils();
  const { data: stats, isLoading: statsLoading, error: statsError } = trpc.alianca.stats.useQuery();
  const { data: divulgacoes = [], isLoading: listLoading, error: listError } = trpc.alianca.list.useQuery();

  const logoutMutation = trpc.alianca.adminLogout.useMutation({
    onSuccess: () => {
      onLogout();
    },
    onError: () => {
      onLogout();
    }
  });

  const updateSettingsMutation = trpc.alianca.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações atualizadas com sucesso!");
      refetchSettings();
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteRecrutamentoMutation = trpc.alianca.deleteRecrutamento.useMutation({
    onSuccess: () => {
      toast.success("Inscrição removida.");
      refetchInscricoes();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const createMutation = trpc.alianca.create.useMutation({
    onSuccess: () => {
      toast.success("Divulgação criada com sucesso!");
      utils.alianca.list.invalidate();
      utils.alianca.stats.invalidate();
      closeModal();
    },
    onError: (err) => toast.error(err.message)
  });

  const updateMutation = trpc.alianca.update.useMutation({
    onSuccess: () => {
      toast.success("Divulgação atualizada com sucesso!");
      utils.alianca.list.invalidate();
      utils.alianca.stats.invalidate();
      closeModal();
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteMutation = trpc.alianca.delete.useMutation({
    onSuccess: () => {
      toast.success("Divulgação excluída.");
      utils.alianca.list.invalidate();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const changePasswordMutation = trpc.alianca.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => toast.error(err.message)
  });

  const clearAllMutation = trpc.alianca.clearAll.useMutation({
    onSuccess: () => {
      toast.success("Todos os dados foram limpos.");
      utils.alianca.list.invalidate();
      utils.alianca.stats.invalidate();
      refetchInscricoes();
    },
    onError: (err) => toast.error(err.message)
  });

  const filteredDivulgacoes = useMemo(() => {
    return divulgacoes.filter(item => {
      const matchesSearch = searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.link.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [divulgacoes, searchQuery, filterType]);

  const openCreateModal = () => {
    setEditingItem({ title: "", description: "", type: "grupo", link: "", image: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem({
      id: item.id,
      title: item.title,
      description: item.description || "",
      type: item.type,
      link: item.link,
      image: item.image || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editingItem.title || !editingItem.link) {
      toast.error("Preencha o título e o link.");
      return;
    }

    if (editingItem.id) {
      updateMutation.mutate({
        id: editingItem.id,
        title: editingItem.title,
        description: editingItem.description,
        type: editingItem.type,
        link: editingItem.link,
        image: editingItem.image,
      });
    } else {
      createMutation.mutate({
        title: editingItem.title,
        description: editingItem.description,
        type: editingItem.type,
        link: editingItem.link,
        image: editingItem.image,
      });
    }
  };

  const handleSaveSiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(siteForm);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos de senha.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As novas senhas não coincidem.");
      return;
    }
    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  const handleClearAll = () => {
    if (window.confirm("⚠️ ATENÇÃO: Deseja realmente excluir TODAS as divulgações e inscrições cadastradas? Esta ação não pode ser desfeita!")) {
      clearAllMutation.mutate();
    }
  };

  const navTitles: Record<string, string> = {
    dashboard: "Dashboard",
    editImages: "Gerenciar Imagens do Site",
    editMusic: "Gerenciar Música do Site",
    recrutamento: "Inscrições de Recrutamento",
    editSite: "Editar Textos do Site",
    divulgacoes: "Gerenciar Divulgações",
    grupos: "Grupos",
    canais: "Canais",
    sites: "Sites",
    config: "Configurações"
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0d0d0d] border-r border-[#292929]">
      <div className="p-6 flex items-center gap-3 border-b border-[#292929]">
        <div className="w-[42px] h-[42px] rounded-[12px] bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-black text-white">
          155
        </div>
        <div>
          <strong className="block text-[15px]">Aliança 155</strong>
          <small className="text-[#969696] text-[11px]">Painel Admin Avançado</small>
        </div>
      </div>

      <div className="px-4 py-3 text-[#555] text-[11px] font-bold tracking-wider">PRINCIPAL</div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <button
          onClick={() => { setActiveSection("dashboard"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "dashboard" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </button>
        <button
          onClick={() => { setActiveSection("editImages"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editImages" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
        >
          <ImageIcon className="w-4 h-4" /> Imagens do Site
        </button>
        <button
          onClick={() => { setActiveSection("editMusic"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editMusic" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
        >
          <Music className="w-4 h-4" /> Música do Site
        </button>
        <button
          onClick={() => { setActiveSection("recrutamento"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "recrutamento" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
        >
          <UserCheck className="w-4 h-4" /> Recrutamento ({inscricoes.length})
        </button>
        <button
          onClick={() => { setActiveSection("editSite"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editSite" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
        >
          <FileText className="w-4 h-4" /> Textos do Site
        </button>
        <button
          onClick={() => { setActiveSection("divulgacoes"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "divulgacoes" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
        >
          <Megaphone className="w-4 h-4" /> Divulgações
        </button>
        <button
          onClick={() => { setActiveSection("grupos"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "grupos" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
        >
          <Users className="w-4 h-4" /> Grupos
        </button>
        <button
          onClick={() => { setActiveSection("canais"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "canais" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
        >
          <Megaphone className="w-4 h-4" /> Canais
        </button>
        <button
          onClick={() => { setActiveSection("sites"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "sites" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
        >
          <Globe className="w-4 h-4" /> Sites
        </button>
      </nav>

      <div className="h-[1px] bg-[#292929] my-2"></div>

      <div className="px-4 py-3 text-[#555] text-[11px] font-bold tracking-wider">SISTEMA</div>
      <div className="px-3 pb-6 space-y-1">
        <button
          onClick={() => { setActiveSection("config"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "config" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
        >
          <Settings className="w-4 h-4" /> Configurações
        </button>
        <button
          onClick={() => logoutMutation.mutate()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-[#ef4444] hover:bg-[#ef4444]/10 transition"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      {/* Desktop Sidebar */}
      <aside className="w-[255px] fixed h-full z-40 hidden md:block">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-[280px] h-full bg-[#0d0d0d] z-50 flex flex-col">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-5 right-5 text-[#969696] hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[255px] flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="h-[78px] px-4 md:px-8 flex items-center justify-between border-b border-[#292929] bg-[#050505]/88 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-[#171717] border border-[#292929] md:hidden text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base md:text-lg font-bold">{navTitles[activeSection] || "Admin"}</h2>
              <span className="text-xs text-[#969696]">Painel Administrativo Aliança 155</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 md:px-4 py-2 rounded-xl bg-[#171717] border border-[#292929] text-xs font-bold hover:bg-[#222] transition flex items-center gap-2"
            >
              Ver site <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={openCreateModal}
              className="px-3 md:px-4 py-2 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white text-xs font-bold transition hover:brightness-110 flex items-center gap-2 shadow-[0_4px_15px_rgba(139,92,246,.2)]"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nova Divulgação</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 md:p-8 flex-1">
          {/* Global Error Banner */}
          {(statsError || listError) && (
            <div className="mb-6 p-4 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#f87171] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-sm">
                <strong>Erro de comunicação:</strong> {statsError?.message || listError?.message || "Falha ao carregar dados."}
              </div>
            </div>
          )}

          {/* DASHBOARD */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold">Visão Geral</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Total de Divulgações</span>
                    <Megaphone className="w-5 h-5 text-[#8b5cf6]" />
                  </div>
                  <div className="text-3xl font-black">{stats?.total || 0}</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Inscrições Recrutamento</span>
                    <UserCheck className="w-5 h-5 text-[#3b82f6]" />
                  </div>
                  <div className="text-3xl font-black">{inscricoes.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Canais Cadastrados</span>
                    <Megaphone className="w-5 h-5 text-[#22c55e]" />
                  </div>
                  <div className="text-3xl font-black">{stats?.canais || 0}</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Sites Cadastrados</span>
                    <Globe className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div className="text-3xl font-black">{stats?.sites || 0}</div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6]">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">Gerenciar Imagens</h3>
                  <p className="text-xs text-[#969696]">Altere a logo, fundo e imagens globais do site.</p>
                  <button
                    onClick={() => setActiveSection("editImages")}
                    className="w-full py-2.5 rounded-xl bg-[#1f1f1f] hover:bg-[#8b5cf6] text-white font-bold text-xs transition"
                  >
                    Editar Imagens
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6]">
                    <Music className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">Música de Fundo</h3>
                  <p className="text-xs text-[#969696]">Adicione ou altere a trilha sonora do site.</p>
                  <button
                    onClick={() => setActiveSection("editMusic")}
                    className="w-full py-2.5 rounded-xl bg-[#1f1f1f] hover:bg-[#8b5cf6] text-white font-bold text-xs transition"
                  >
                    Configurar Música
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6]">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">Recrutamento</h3>
                  <p className="text-xs text-[#969696]">Veja os novos membros inscritos pelo site.</p>
                  <button
                    onClick={() => setActiveSection("recrutamento")}
                    className="w-full py-2.5 rounded-xl bg-[#1f1f1f] hover:bg-[#8b5cf6] text-white font-bold text-xs transition"
                  >
                    Ver Inscrições ({inscricoes.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GERENCIAR IMAGENS DO SITE */}
          {activeSection === "editImages" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Gerenciar Imagens do Site</h1>
                <p className="text-sm text-[#969696]">Altere as URLs de imagem para o logotipo e plano de fundo (background) do site.</p>
              </div>

              <form onSubmit={handleSaveSiteSettings} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">URL da Logo (Ícone/Avatar do Topo)</label>
                  <input
                    type="text"
                    value={siteForm.site_logo}
                    onChange={(e) => setSiteForm({ ...siteForm, site_logo: e.target.value })}
                    placeholder="https://exemplo.com/logo.png (Deixe vazio para usar o padrão 155)"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  />
                  {siteForm.site_logo && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={siteForm.site_logo} alt="Preview Logo" className="w-12 h-12 rounded-xl object-cover border border-[#292929]" />
                      <span className="text-xs text-[#969696]">Pré-visualização da Logo</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">URL da Imagem de Fundo (Background)</label>
                  <input
                    type="text"
                    value={siteForm.site_bg_image}
                    onChange={(e) => setSiteForm({ ...siteForm, site_bg_image: e.target.value })}
                    placeholder="https://exemplo.com/background.jpg (Opcional)"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  />
                  {siteForm.site_bg_image && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={siteForm.site_bg_image} alt="Preview BG" className="w-24 h-12 rounded-xl object-cover border border-[#292929]" />
                      <span className="text-xs text-[#969696]">Pré-visualização do Fundo</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="py-3 px-6 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold text-sm transition hover:brightness-110 flex items-center gap-2"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Salvar Imagens
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* GERENCIAR MÚSICA DO SITE */}
          {activeSection === "editMusic" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Música de Fundo do Site</h1>
                <p className="text-sm text-[#969696]">Adicione um link direto de áudio (MP3, WAV) para tocar como trilha sonora na página pública.</p>
              </div>

              <form onSubmit={handleSaveSiteSettings} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Título da Música</label>
                  <input
                    type="text"
                    value={siteForm.site_music_title}
                    onChange={(e) => setSiteForm({ ...siteForm, site_music_title: e.target.value })}
                    placeholder="Ex: Trilha Sonora Oficial Aliança"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">URL do Arquivo de Áudio (.mp3 / .wav)</label>
                  <input
                    type="text"
                    value={siteForm.site_music_url}
                    onChange={(e) => setSiteForm({ ...siteForm, site_music_url: e.target.value })}
                    placeholder="https://exemplo.com/musica.mp3"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  />
                </div>

                {siteForm.site_music_url && (
                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#292929] space-y-2">
                    <span className="text-xs font-bold text-[#bca9ff]">Teste de Reprodução:</span>
                    <audio controls src={siteForm.site_music_url} className="w-full h-10 accent-[#8b5cf6]" />
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="py-3 px-6 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold text-sm transition hover:brightness-110 flex items-center gap-2"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />} Salvar Música do Site
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* RECRUTAMENTO (INSCRITOS) */}
          {activeSection === "recrutamento" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Inscrições de Recrutamento</h1>
                  <p className="text-sm text-[#969696]">Candidatos que se inscreveram para entrar na comunidade através do site.</p>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-[#8b5cf6]/20 text-[#bca9ff] text-xs font-bold">
                  {inscricoes.length} Candidatos
                </span>
              </div>

              {inscricoes.length === 0 ? (
                <div className="text-center py-20 bg-[#111111] border border-[#292929] rounded-2xl p-8">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-[#555]" />
                  <h3 className="text-lg font-bold mb-1">Nenhuma inscrição recebida ainda</h3>
                  <p className="text-sm text-[#969696]">Assim que novos membros preencherem o formulário na aba de recrutamento do site, eles aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inscricoes.map((item) => (
                    <div key={item.id} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">{item.nome}</h3>
                          <span className="text-xs text-[#8b5cf6] font-medium">Contato: {item.contato}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-[#3b82f6]/20 text-[#60a5fa] text-xs font-bold uppercase">
                            {item.status}
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Deseja excluir a inscrição de ${item.nome}?`)) {
                                deleteRecrutamentoMutation.mutate({ id: item.id });
                              }
                            }}
                            className="p-2 rounded-xl bg-[#ef4444]/20 text-[#f87171] hover:bg-[#ef4444]/30 transition"
                            title="Excluir Inscrição"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222]">
                          <strong className="block text-xs text-[#969696] mb-1 uppercase tracking-wider">Experiência</strong>
                          <p className="text-white whitespace-pre-wrap">{item.experiencia}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222]">
                          <strong className="block text-xs text-[#969696] mb-1 uppercase tracking-wider">Motivação</strong>
                          <p className="text-white whitespace-pre-wrap">{item.motivacao}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDITAR CONTEÚDO DO SITE (TEXTOS E IDENTIDADE) */}
          {activeSection === "editSite" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Editor de Textos do Site</h1>
                <p className="text-sm text-[#969696]">Altere todos os títulos, subtítulos, selos e rodapé exibidos na página pública em tempo real.</p>
              </div>

              <form onSubmit={handleSaveSiteSettings} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Nome do Site (Navbar)</label>
                    <input
                      type="text"
                      value={siteForm.site_title}
                      onChange={(e) => setSiteForm({ ...siteForm, site_title: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subtítulo (Navbar)</label>
                    <input
                      type="text"
                      value={siteForm.site_subtitle}
                      onChange={(e) => setSiteForm({ ...siteForm, site_subtitle: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Texto do Selo Hero (Topo)</label>
                    <input
                      type="text"
                      value={siteForm.hero_badge}
                      onChange={(e) => setSiteForm({ ...siteForm, hero_badge: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Texto do Botão Admin</label>
                    <input
                      type="text"
                      value={siteForm.admin_btn_text}
                      onChange={(e) => setSiteForm({ ...siteForm, admin_btn_text: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Título Principal (Hero)</label>
                    <input
                      type="text"
                      value={siteForm.hero_title_main}
                      onChange={(e) => setSiteForm({ ...siteForm, hero_title_main: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Título Destaque Roxo (Hero)</label>
                    <input
                      type="text"
                      value={siteForm.hero_title_accent}
                      onChange={(e) => setSiteForm({ ...siteForm, hero_title_accent: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Descrição / Subtítulo (Hero)</label>
                  <textarea
                    value={siteForm.hero_description}
                    onChange={(e) => setSiteForm({ ...siteForm, hero_description: e.target.value })}
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm min-h-[90px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Texto do Rodapé (Footer)</label>
                  <input
                    type="text"
                    value={siteForm.footer_text}
                    onChange={(e) => setSiteForm({ ...siteForm, footer_text: e.target.value })}
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="py-3 px-6 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold text-sm transition hover:brightness-110 flex items-center gap-2"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Salvar Textos do Site
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DIVULGACOES / GRUPOS / CANAIS / SITES */}
          {(activeSection === "divulgacoes" || activeSection === "grupos" || activeSection === "canais" || activeSection === "sites") && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-extrabold capitalize">
                  {activeSection === "divulgacoes" ? "Gerenciar Divulgações" : activeSection}
                </h1>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white text-sm font-bold transition hover:brightness-110 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Nova Divulgação
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="🔎 Pesquisar..."
                      className="w-full pl-11 pr-4 py-2.5 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  {activeSection === "divulgacoes" && (
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full p-2.5 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    >
                      <option value="all">Todos os tipos</option>
                      <option value="grupo">Grupos</option>
                      <option value="canal">Canais</option>
                      <option value="site">Sites</option>
                    </select>
                  )}
                </div>

                {listLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#8b5cf6]" /></div>
                ) : filteredDivulgacoes.filter(item => activeSection === "divulgacoes" || item.type === (activeSection === "grupos" ? "grupo" : activeSection === "canais" ? "canal" : "site")).length === 0 ? (
                  <div className="text-center py-16 text-[#969696] text-sm bg-[#0d0d0d] rounded-xl border border-[#292929]">
                    Nenhuma divulgação encontrada nesta categoria.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDivulgacoes
                      .filter(item => activeSection === "divulgacoes" || item.type === (activeSection === "grupos" ? "grupo" : activeSection === "canais" ? "canal" : "site"))
                      .map(item => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#0d0d0d] border border-[#292929] gap-4">
                          <div className="flex items-center gap-4">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-bold text-sm shrink-0">
                                155
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-base">{item.title}</h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#bca9ff] text-[10px] font-bold uppercase">
                                  {item.type}
                                </span>
                              </div>
                              <p className="text-[#969696] text-xs line-clamp-1">{item.description || "Sem descrição"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl bg-[#171717] hover:bg-[#222] text-xs font-bold transition flex items-center gap-1.5"
                            >
                              Link <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-3 py-2 rounded-xl bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#bca9ff] text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <Edit className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Deseja excluir esta divulgação?")) {
                                  deleteMutation.mutate({ id: item.id });
                                }
                              }}
                              className="px-3 py-2 rounded-xl bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#f87171] text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONFIGURAÇÕES */}
          {activeSection === "config" && (
            <div className="space-y-6 max-w-2xl">
              <h1 className="text-2xl md:text-3xl font-extrabold">Configurações de Segurança</h1>

              <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">🔐 Alterar Senha do Admin</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Senha atual</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Digite a senha atual"
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Nova senha (mínimo 6 caracteres)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirmar nova senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="py-3 px-6 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold text-sm transition hover:brightness-110 flex items-center gap-2"
                  >
                    {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Alterar Senha
                  </button>
                </form>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-[#ef4444]/40 space-y-4">
                <h3 className="text-lg font-bold text-[#ef4444] flex items-center gap-2">⚠️ Zona de Perigo</h3>
                <p className="text-sm text-[#969696]">Apagar permanentemente todas as divulgações e inscrições cadastradas no banco de dados.</p>
                <button
                  onClick={handleClearAll}
                  disabled={clearAllMutation.isPending}
                  className="py-3 px-6 rounded-xl bg-[#ef4444] text-white font-bold text-sm transition hover:brightness-110 flex items-center gap-2"
                >
                  {clearAllMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />} Limpar Todos os Dados
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal CRUD */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-[#111111] border border-[#292929] rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-5 right-5 text-[#969696] hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">{editingItem.id ? "Editar Divulgação" : "Nova Divulgação"}</h2>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Ex: Grupo Oficial Aliança"
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria (Tipo) *</label>
                  <select
                    value={editingItem.type}
                    onChange={(e: any) => setEditingItem({ ...editingItem, type: e.target.value })}
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  >
                    <option value="grupo">Grupo</option>
                    <option value="canal">Canal</option>
                    <option value="site">Site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Link de Acesso *</label>
                  <input
                    type="text"
                    value={editingItem.link}
                    onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                    placeholder="https://t.me/seulink"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL da Imagem (Opcional)</label>
                <input
                  type="text"
                  value={editingItem.image}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Descrição breve da divulgação..."
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm min-h-[90px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#292929]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-[#222] font-bold text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] font-bold text-sm transition hover:brightness-110 flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar Divulgação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
