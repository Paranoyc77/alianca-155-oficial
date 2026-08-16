import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { LayoutDashboard, Megaphone, Users, Globe, Settings, LogOut, Plus, Search, ExternalLink, Edit, Trash2, Key, AlertTriangle, X, Loader2, Menu, AlertCircle, FileText, CheckCircle2, Image as ImageIcon, Music, UserCheck, ShieldAlert, Phone, Eye, Activity, Palette, RotateCcw, Award, Crown, Star, Bot, CreditCard, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id?: number;
    title: string;
    description: string;
    type: "grupo" | "canal" | "site";
    link: string;
    image: string;
    prioridade: "normal" | "vip" | "premium";
  } | null>(null);

  // Equipe Modal state
  const [isEquipeModalOpen, setIsEquipeModalOpen] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<{
    id?: number;
    nome: string;
    cargo: string;
    foto: string;
    numeroContato: string;
  } | null>(null);

  // Bot Plano Modal state
  const [isBotPlanoModalOpen, setIsBotPlanoModalOpen] = useState(false);
  const [editingBotPlano, setEditingBotPlano] = useState<{
    id?: number;
    nome: string;
    descricao: string;
    preco: string;
    duracaoDias: number;
    recursos: string;
    ativo: number;
  } | null>(null);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Site settings forms state
  const [siteForm, setSiteForm] = useState({
    site_title: "Aliança 155",
    site_subtitle: "Central de Divulgações",
    hero_badge: "ALIANÇA 155",
    hero_title_main: "Central de Divulgações",
    hero_title_accent: "Oficial",
    hero_description: "Encontre os melhores grupos, canais e sites recomendados pela nossa comunidade.",
    footer_text: "Aliança 155 — Todos os direitos reservados.",
    admin_btn_text: "Painel Admin",
    site_logo: "",
    site_bg_image: "",
    site_music_url: "",
    site_music_title: "Trilha Sonora Oficial",
    bot_rental_whatsapp: "5511999999999",
    // Color tokens
    color_bg: "#050505",
    color_card_bg: "#0d0d0d",
    color_card_border: "#222222",
    color_text_main: "#ffffff",
    color_text_muted: "#969696",
    color_primary: "#8b5cf6",
    color_primary_hover: "#7c3aed",
    color_accent: "#c4b5fd",
    color_button_bg: "#171717",
  });

  const utils = trpc.useUtils();

  const { data: divulgacoes = [], isLoading: listLoading, error: listError } = trpc.alianca.list.useQuery();
  const { data: settings = {} } = trpc.alianca.getSettings.useQuery();
  const { data: inscricoes = [] } = trpc.alianca.listRecrutamento.useQuery();
  const { data: equipe = [] } = trpc.alianca.listEquipe.useQuery();
  const { data: planosBot = [] } = trpc.alianca.listBotPlanos.useQuery();
  const { data: alugueisBot = [] } = trpc.alianca.listBotAlugueis.useQuery();
  const { data: stats } = trpc.alianca.stats.useQuery();

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setSiteForm(prev => ({
        ...prev,
        ...settings,
      }));
    }
  }, [settings]);

  const createMutation = trpc.alianca.create.useMutation({
    onSuccess: () => {
      toast.success("Divulgação criada com sucesso!");
      setIsModalOpen(false);
      utils.alianca.list.invalidate();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao criar divulgação.")
  });

  const updateMutation = trpc.alianca.update.useMutation({
    onSuccess: () => {
      toast.success("Divulgação atualizada com sucesso!");
      setIsModalOpen(false);
      utils.alianca.list.invalidate();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao atualizar divulgação.")
  });

  const deleteMutation = trpc.alianca.delete.useMutation({
    onSuccess: () => {
      toast.success("Divulgação excluída com sucesso!");
      utils.alianca.list.invalidate();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao excluir divulgação.")
  });

  const createEquipeMutation = trpc.alianca.createEquipe.useMutation({
    onSuccess: () => {
      toast.success("Membro da equipe cadastrado!");
      setIsEquipeModalOpen(false);
      utils.alianca.listEquipe.invalidate();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao cadastrar membro.")
  });

  const updateEquipeMutation = trpc.alianca.updateEquipe.useMutation({
    onSuccess: () => {
      toast.success("Membro da equipe atualizado!");
      setIsEquipeModalOpen(false);
      utils.alianca.listEquipe.invalidate();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao atualizar membro.")
  });

  const deleteEquipeMutation = trpc.alianca.deleteEquipe.useMutation({
    onSuccess: () => {
      toast.success("Membro removido da equipe!");
      utils.alianca.listEquipe.invalidate();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao remover membro.")
  });

  const createBotPlanoMutation = trpc.alianca.createBotPlano.useMutation({
    onSuccess: () => {
      toast.success("Plano de bot criado com sucesso!");
      setIsBotPlanoModalOpen(false);
      utils.alianca.listBotPlanos.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao criar plano.")
  });

  const updateBotPlanoMutation = trpc.alianca.updateBotPlano.useMutation({
    onSuccess: () => {
      toast.success("Plano de bot atualizado!");
      setIsBotPlanoModalOpen(false);
      utils.alianca.listBotPlanos.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao atualizar plano.")
  });

  const deleteBotPlanoMutation = trpc.alianca.deleteBotPlano.useMutation({
    onSuccess: () => {
      toast.success("Plano removido!");
      utils.alianca.listBotPlanos.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao remover plano.")
  });

  const deleteBotAluguelMutation = trpc.alianca.deleteBotAluguel.useMutation({
    onSuccess: () => {
      toast.success("Aluguel removido!");
      utils.alianca.listBotAlugueis.invalidate();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao remover aluguel.")
  });

  const deleteRecrutamentoMutation = trpc.alianca.deleteRecrutamento.useMutation({
    onSuccess: () => {
      toast.success("Inscrição excluída!");
      utils.alianca.listRecrutamento.invalidate();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao excluir inscrição.")
  });

  const updateSettingsMutation = trpc.alianca.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      utils.alianca.getSettings.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao salvar configurações.")
  });

  const changePasswordMutation = trpc.alianca.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => toast.error(err.message || "Erro ao alterar senha.")
  });

  const clearAllMutation = trpc.alianca.clearAll.useMutation({
    onSuccess: () => {
      toast.success("Todos os dados foram limpos com sucesso.");
      utils.alianca.list.invalidate();
      utils.alianca.listRecrutamento.invalidate();
      utils.alianca.listEquipe.invalidate();
      utils.alianca.listBotPlanos.invalidate();
      utils.alianca.listBotAlugueis.invalidate();
      utils.alianca.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao limpar dados.")
  });

  const openCreateModal = () => {
    setEditingItem({
      title: "",
      description: "",
      type: "grupo",
      link: "",
      image: "",
      prioridade: "normal",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem({
      id: item.id,
      title: item.title,
      description: item.description || "",
      type: item.type,
      link: item.link,
      image: item.image || "",
      prioridade: item.prioridade || "normal",
    });
    setIsModalOpen(true);
  };

  const openEquipeCreateModal = () => {
    setEditingEquipe({
      nome: "",
      cargo: "Administrador",
      foto: "",
      numeroContato: "",
    });
    setIsEquipeModalOpen(true);
  };

  const openEquipeEditModal = (item: any) => {
    setEditingEquipe({
      id: item.id,
      nome: item.nome,
      cargo: item.cargo,
      foto: item.foto || "",
      numeroContato: item.numeroContato,
    });
    setIsEquipeModalOpen(true);
  };

  const openBotPlanoCreateModal = () => {
    setEditingBotPlano({
      nome: "",
      descricao: "",
      preco: "29.90",
      duracaoDias: 30,
      recursos: "Moderação automática,Anti-flood,Boas-vindas",
      ativo: 1,
    });
    setIsBotPlanoModalOpen(true);
  };

  const openBotPlanoEditModal = (plano: any) => {
    setEditingBotPlano({
      id: plano.id,
      nome: plano.nome,
      descricao: plano.descricao,
      preco: plano.preco,
      duracaoDias: plano.duracaoDias,
      recursos: plano.recursos,
      ativo: plano.ativo,
    });
    setIsBotPlanoModalOpen(true);
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
        prioridade: editingItem.prioridade,
      });
    } else {
      createMutation.mutate({
        title: editingItem.title,
        description: editingItem.description,
        type: editingItem.type,
        link: editingItem.link,
        image: editingItem.image,
        prioridade: editingItem.prioridade,
      });
    }
  };

  const handleSaveEquipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipe) return;
    if (!editingEquipe.nome || !editingEquipe.cargo || !editingEquipe.numeroContato) {
      toast.error("Preencha nome, cargo e contato.");
      return;
    }

    if (editingEquipe.id) {
      updateEquipeMutation.mutate({
        id: editingEquipe.id,
        nome: editingEquipe.nome,
        cargo: editingEquipe.cargo,
        foto: editingEquipe.foto,
        numeroContato: editingEquipe.numeroContato,
      });
    } else {
      createEquipeMutation.mutate({
        nome: editingEquipe.nome,
        cargo: editingEquipe.cargo,
        foto: editingEquipe.foto,
        numeroContato: editingEquipe.numeroContato,
      });
    }
  };

  const handleSaveBotPlano = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBotPlano) return;
    if (!editingBotPlano.nome || !editingBotPlano.preco || !editingBotPlano.duracaoDias) {
      toast.error("Preencha nome, preço e duração.");
      return;
    }

    if (editingBotPlano.id) {
      updateBotPlanoMutation.mutate({
        id: editingBotPlano.id,
        nome: editingBotPlano.nome,
        descricao: editingBotPlano.descricao,
        preco: editingBotPlano.preco,
        duracaoDias: Number(editingBotPlano.duracaoDias),
        recursos: editingBotPlano.recursos,
        ativo: editingBotPlano.ativo,
      });
    } else {
      createBotPlanoMutation.mutate({
        nome: editingBotPlano.nome,
        descricao: editingBotPlano.descricao,
        preco: editingBotPlano.preco,
        duracaoDias: Number(editingBotPlano.duracaoDias),
        recursos: editingBotPlano.recursos,
        ativo: editingBotPlano.ativo,
      });
    }
  };

  const handleSaveSiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(siteForm);
  };

  const resetColorsToDefault = () => {
    setSiteForm(prev => ({
      ...prev,
      color_bg: "#050505",
      color_card_bg: "#0d0d0d",
      color_card_border: "#222222",
      color_text_main: "#ffffff",
      color_text_muted: "#969696",
      color_primary: "#8b5cf6",
      color_primary_hover: "#7c3aed",
      color_accent: "#c4b5fd",
      color_button_bg: "#171717",
    }));
    toast.success("Cores restauradas para o padrão! Clique em 'Salvar Cores' para aplicar.");
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

  const filteredItems = useMemo(() => {
    return divulgacoes.filter(item => {
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesSearch = searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.link.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [divulgacoes, filterType, searchQuery]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-[#8b5cf6] selection:text-white">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0d0d0d] border-r border-[#1f1f1f] p-6 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            155
          </div>
          <div>
            <span className="font-bold text-base block tracking-wide">Painel Admin</span>
            <span className="text-xs text-[#969696] block">Gerenciamento Total</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1 pr-1">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "dashboard" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button
            onClick={() => setActiveSection("botRentalAdmin")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "botRentalAdmin" ? "bg-[#22c55e] text-white" : "text-[#4ade80] hover:text-white hover:bg-[#171717]"}`}
          >
            <Bot className="w-4 h-4" /> Aluguel de Bot ({alugueisBot.length})
          </button>
          <button
            onClick={() => setActiveSection("equipeAdmin")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "equipeAdmin" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <ShieldAlert className="w-4 h-4" /> Donos e Admins ({equipe.length})
          </button>
          <button
            onClick={() => setActiveSection("editColors")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editColors" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <Palette className="w-4 h-4" /> Cores do Site
          </button>
          <button
            onClick={() => setActiveSection("editImages")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editImages" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <ImageIcon className="w-4 h-4" /> Imagens do Site
          </button>
          <button
            onClick={() => setActiveSection("editMusic")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editMusic" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <Music className="w-4 h-4" /> Música do Site
          </button>
          <button
            onClick={() => setActiveSection("recrutamento")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "recrutamento" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <UserCheck className="w-4 h-4" /> Recrutamento ({inscricoes.length})
          </button>
          <button
            onClick={() => setActiveSection("editSite")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editSite" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <FileText className="w-4 h-4" /> Textos do Site
          </button>
          <button
            onClick={() => setActiveSection("divulgacoes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "divulgacoes" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <Megaphone className="w-4 h-4" /> Divulgações
          </button>
          <button
            onClick={() => setActiveSection("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "settings" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <Settings className="w-4 h-4" /> Configurações & Senha
          </button>
        </nav>

        <div className="pt-4 border-t border-[#1f1f1f]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-[#f87171] hover:bg-[#ef4444]/15 transition"
          >
            <LogOut className="w-4 h-4" /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="border-b border-[#1f1f1f] bg-[#0d0d0d]/90 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-[#171717] text-white hover:bg-[#222]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm">Aliança 155 Admin</span>
          </div>

          <div className="hidden lg:block text-sm text-[#969696]">
            Painel administrativo com controle total de conteúdo, imagens, música, cores e aluguel de bot.
          </div>

          <div className="flex items-center gap-3">
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
          {listError && (
            <div className="mb-6 p-4 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#f87171] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-sm">
                <strong>Erro de comunicação:</strong> {listError?.message || "Falha ao carregar dados."}
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
                    <span className="text-sm text-[#969696]">Total Divulgações</span>
                    <Megaphone className="w-5 h-5 text-[#8b5cf6]" />
                  </div>
                  <div className="text-3xl font-black">{divulgacoes.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Aluguéis de Bot</span>
                    <Bot className="w-5 h-5 text-[#22c55e]" />
                  </div>
                  <div className="text-3xl font-black">{alugueisBot.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Donos e Admins</span>
                    <ShieldAlert className="w-5 h-5 text-[#3b82f6]" />
                  </div>
                  <div className="text-3xl font-black">{equipe.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Inscrições Recrutamento</span>
                    <UserCheck className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div className="text-3xl font-black">{inscricoes.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Total de Visitas</span>
                    <Eye className="w-5 h-5 text-[#8b5cf6]" />
                  </div>
                  <div className="text-3xl font-black">{stats?.totalVisitas ?? 0}</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Usuários Online Agora</span>
                    <Activity className="w-5 h-5 text-[#22c55e] animate-pulse" />
                  </div>
                  <div className="text-3xl font-black">{stats?.usuariosOnline ?? 1}</div>
                </div>
              </div>
            </div>
          )}

          {/* ALUGUEL DE BOT ADMIN */}
          {activeSection === "botRentalAdmin" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Gerenciamento de Aluguel de Bot</h1>
                  <p className="text-sm text-[#969696]">Configure os planos de aluguel, o WhatsApp de atendimento e acompanhe os pedidos.</p>
                </div>
                <button
                  onClick={openBotPlanoCreateModal}
                  className="px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Criar Novo Plano
                </button>
              </div>

              {/* Configuração do WhatsApp de Aluguel */}
              <form onSubmit={handleSaveSiteSettings} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#22c55e]" /> Número de WhatsApp para Solicitações de Aluguel
                </h2>
                <p className="text-xs text-[#969696]">Quando o cliente clicar em alugar um plano na página pública, ele será direcionado para este número de WhatsApp com a mensagem pronta.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={siteForm.bot_rental_whatsapp}
                    onChange={(e) => setSiteForm({ ...siteForm, bot_rental_whatsapp: e.target.value })}
                    placeholder="Ex: 5511999999999 (apenas números com DDD e DDI)"
                    className="flex-1 p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#22c55e] text-sm"
                  />
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="px-5 py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold transition flex items-center justify-center gap-2 shrink-0"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Salvar WhatsApp
                  </button>
                </div>
              </form>

              {/* Planos Cadastrados */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#22c55e]" /> Planos Ativos no Site
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {planosBot.map((plano) => (
                    <div key={plano.id} className="p-5 rounded-2xl bg-[#111111] border border-[#292929] flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#4ade80] bg-[#22c55e]/20 px-2.5 py-0.5 rounded-full">
                            {plano.duracaoDias} Dias
                          </span>
                          <span className="text-lg font-black text-white">R$ {plano.preco}</span>
                        </div>
                        <h3 className="font-bold text-base text-white">{plano.nome}</h3>
                        <p className="text-xs text-[#969696] mt-1">{plano.descricao}</p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222]">
                        <button
                          onClick={() => openBotPlanoEditModal(plano)}
                          className="px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222] text-xs font-bold text-[#bca9ff] flex items-center gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja excluir o plano "${plano.nome}"?`)) {
                              deleteBotPlanoMutation.mutate({ id: plano.id });
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-xs font-bold text-[#f87171] flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aluguéis Ativos */}
              <div className="space-y-4 pt-6 border-t border-[#1f1f1f]">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#8b5cf6]" /> Histórico de Aluguéis Realizados ({alugueisBot.length})
                </h2>

                {alugueisBot.length === 0 ? (
                  <div className="text-center py-16 bg-[#111111] border border-[#292929] rounded-2xl p-8">
                    <Bot className="w-10 h-10 mx-auto mb-3 text-[#555]" />
                    <h3 className="text-base font-bold mb-1">Nenhum aluguel realizado ainda</h3>
                    <p className="text-xs text-[#969696]">Os pedidos que chegarem pelo WhatsApp poderão ser registrados ou acompanhados aqui.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alugueisBot.map((aluguel) => (
                      <div key={aluguel.id} className="p-5 rounded-2xl bg-[#111111] border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-base text-white">{aluguel.compradorNome}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30">
                              {aluguel.statusBot}
                            </span>
                          </div>
                          <p className="text-xs text-[#969696]">
                            Plano: <strong className="text-white">{aluguel.planoNome}</strong> | Bot/User: <strong className="text-[#8b5cf6]">{aluguel.botTokenOuUser}</strong> | Contato: {aluguel.compradorContato}
                          </p>
                          <p className="text-[11px] text-[#777]">
                            Expira em: {new Date(aluguel.expiresAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Deseja remover o registro de aluguel de ${aluguel.compradorNome}?`)) {
                                deleteBotAluguelMutation.mutate({ id: aluguel.id });
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-xs font-bold text-[#f87171] flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EQUIPE */}
          {activeSection === "equipeAdmin" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Donos e Administradores</h1>
                  <p className="text-sm text-[#969696]">Gerencie os nomes, fotos e números de contato que aparecem na aba de equipe do site.</p>
                </div>
                <button
                  onClick={openEquipeCreateModal}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white text-xs font-bold transition hover:brightness-110 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(139,92,246,.2)]"
                >
                  <Plus className="w-4 h-4" /> Adicionar Membro
                </button>
              </div>

              {equipe.length === 0 ? (
                <div className="text-center py-20 bg-[#111111] border border-[#292929] rounded-2xl p-8">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-[#555]" />
                  <h3 className="text-lg font-bold mb-1">Nenhum membro cadastrado</h3>
                  <p className="text-sm text-[#969696] mb-4">Clique no botão acima para adicionar o primeiro dono ou administrador.</p>
                  <button
                    onClick={openEquipeCreateModal}
                    className="px-4 py-2 bg-[#8b5cf6] text-white rounded-xl text-xs font-bold"
                  >
                    Adicionar Membro
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {equipe.map((membro) => (
                    <div key={membro.id} className="p-5 rounded-2xl bg-[#111111] border border-[#292929] flex flex-col justify-between space-y-4">
                      <div className="flex items-center gap-4">
                        {membro.foto ? (
                          <img src={membro.foto} alt={membro.nome} className="w-14 h-14 rounded-full object-cover border border-[#333]" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-[#222] flex items-center justify-center font-bold text-lg">
                            {membro.nome.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#bca9ff]">
                            {membro.cargo}
                          </span>
                          <h3 className="font-bold text-base text-white mt-1">{membro.nome}</h3>
                          <p className="text-xs text-[#969696] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-[#8b5cf6]" /> {membro.numeroContato}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222]">
                        <button
                          onClick={() => openEquipeEditModal(membro)}
                          className="px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222] text-xs font-bold text-[#bca9ff] flex items-center gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja remover ${membro.nome} da equipe?`)) {
                              deleteEquipeMutation.mutate({ id: membro.id });
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-xs font-bold text-[#f87171] flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDITOR DE CORES */}
          {activeSection === "editColors" && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Editor Completo de Cores do Site</h1>
                  <p className="text-sm text-[#969696]">Personalize cada detalhe da paleta de cores do site. Todas as alterações são aplicadas instantaneamente.</p>
                </div>
                <button
                  type="button"
                  onClick={resetColorsToDefault}
                  className="px-3 py-2 rounded-xl bg-[#1f1f1f] hover:bg-[#2a2a2a] text-xs font-bold text-[#ccc] flex items-center gap-1.5 border border-[#333]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restaurar Padrão
                </button>
              </div>

              <form onSubmit={handleSaveSiteSettings} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222] flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold mb-0.5">Cor de Fundo (Background)</label>
                      <span className="text-xs text-[#969696]">Fundo principal da página</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={siteForm.color_bg}
                        onChange={(e) => setSiteForm({ ...siteForm, color_bg: e.target.value })}
                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-[#333]"
                      />
                      <input
                        type="text"
                        value={siteForm.color_bg}
                        onChange={(e) => setSiteForm({ ...siteForm, color_bg: e.target.value })}
                        className="w-24 p-2 bg-[#171717] text-white text-xs border border-[#333] rounded-lg text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222] flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold mb-0.5">Fundo dos Cards</label>
                      <span className="text-xs text-[#969696]">Cor dos blocos e cartões</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={siteForm.color_card_bg}
                        onChange={(e) => setSiteForm({ ...siteForm, color_card_bg: e.target.value })}
                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-[#333]"
                      />
                      <input
                        type="text"
                        value={siteForm.color_card_bg}
                        onChange={(e) => setSiteForm({ ...siteForm, color_card_bg: e.target.value })}
                        className="w-24 p-2 bg-[#171717] text-white text-xs border border-[#333] rounded-lg text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222] flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold mb-0.5">Borda dos Cards</label>
                      <span className="text-xs text-[#969696]">Linhas delimitadoras</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={siteForm.color_card_border}
                        onChange={(e) => setSiteForm({ ...siteForm, color_card_border: e.target.value })}
                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-[#333]"
                      />
                      <input
                        type="text"
                        value={siteForm.color_card_border}
                        onChange={(e) => setSiteForm({ ...siteForm, color_card_border: e.target.value })}
                        className="w-24 p-2 bg-[#171717] text-white text-xs border border-[#333] rounded-lg text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222] flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold mb-0.5">Texto Principal</label>
                      <span className="text-xs text-[#969696]">Títulos e textos destacados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={siteForm.color_text_main}
                        onChange={(e) => setSiteForm({ ...siteForm, color_text_main: e.target.value })}
                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-[#333]"
                      />
                      <input
                        type="text"
                        value={siteForm.color_text_main}
                        onChange={(e) => setSiteForm({ ...siteForm, color_text_main: e.target.value })}
                        className="w-24 p-2 bg-[#171717] text-white text-xs border border-[#333] rounded-lg text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222] flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold mb-0.5">Texto Secundário / Muted</label>
                      <span className="text-xs text-[#969696]">Descrições e legendas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={siteForm.color_text_muted}
                        onChange={(e) => setSiteForm({ ...siteForm, color_text_muted: e.target.value })}
                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-[#333]"
                      />
                      <input
                        type="text"
                        value={siteForm.color_text_muted}
                        onChange={(e) => setSiteForm({ ...siteForm, color_text_muted: e.target.value })}
                        className="w-24 p-2 bg-[#171717] text-white text-xs border border-[#333] rounded-lg text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222] flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold mb-0.5">Cor Principal (Roxo Accent)</label>
                      <span className="text-xs text-[#969696]">Botões ativos e destaques</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={siteForm.color_primary}
                        onChange={(e) => setSiteForm({ ...siteForm, color_primary: e.target.value })}
                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-[#333]"
                      />
                      <input
                        type="text"
                        value={siteForm.color_primary}
                        onChange={(e) => setSiteForm({ ...siteForm, color_primary: e.target.value })}
                        className="w-24 p-2 bg-[#171717] text-white text-xs border border-[#333] rounded-lg text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222] flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold mb-0.5">Cor Principal Hover</label>
                      <span className="text-xs text-[#969696]">Tom ao passar o mouse</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={siteForm.color_primary_hover}
                        onChange={(e) => setSiteForm({ ...siteForm, color_primary_hover: e.target.value })}
                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-[#333]"
                      />
                      <input
                        type="text"
                        value={siteForm.color_primary_hover}
                        onChange={(e) => setSiteForm({ ...siteForm, color_primary_hover: e.target.value })}
                        className="w-24 p-2 bg-[#171717] text-white text-xs border border-[#333] rounded-lg text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222] flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold mb-0.5">Cor de Destaque / Acento</label>
                      <span className="text-xs text-[#969696]">Tons claros de gradiente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={siteForm.color_accent}
                        onChange={(e) => setSiteForm({ ...siteForm, color_accent: e.target.value })}
                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-[#333]"
                      />
                      <input
                        type="text"
                        value={siteForm.color_accent}
                        onChange={(e) => setSiteForm({ ...siteForm, color_accent: e.target.value })}
                        className="w-24 p-2 bg-[#171717] text-white text-xs border border-[#333] rounded-lg text-center font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="py-3 px-6 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold text-sm transition hover:brightness-110 flex items-center gap-2 shadow-lg"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />} Salvar Todas as Cores
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* EDITAR IMAGENS */}
          {activeSection === "editImages" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Gerenciar Imagens do Site</h1>
                <p className="text-sm text-[#969696]">Altere a Logo e a Imagem de Fundo (Background) do site em tempo real.</p>
              </div>

              <form onSubmit={handleSaveSiteSettings} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">URL da Logo do Site</label>
                  <input
                    type="text"
                    value={siteForm.site_logo}
                    onChange={(e) => setSiteForm({ ...siteForm, site_logo: e.target.value })}
                    placeholder="https://exemplo.com/logo.png"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  />
                </div>

                {siteForm.site_logo && (
                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#292929] flex items-center gap-4">
                    <img src={siteForm.site_logo} alt="Preview Logo" className="w-16 h-16 rounded-xl object-cover border border-[#333]" />
                    <span className="text-xs text-[#969696]">Pré-visualização da Logo atual</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1.5">URL da Imagem de Fundo (Background)</label>
                  <input
                    type="text"
                    value={siteForm.site_bg_image}
                    onChange={(e) => setSiteForm({ ...siteForm, site_bg_image: e.target.value })}
                    placeholder="https://exemplo.com/background.jpg"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  />
                </div>

                {siteForm.site_bg_image && (
                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#292929] space-y-2">
                    <span className="text-xs font-bold text-[#bca9ff]">Pré-visualização do Fundo:</span>
                    <div className="w-full h-32 rounded-xl bg-cover bg-center border border-[#333]" style={{ backgroundImage: `url(${siteForm.site_bg_image})` }}></div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="py-3 px-6 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold text-sm transition hover:brightness-110 flex items-center gap-2"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />} Salvar Imagens
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* EDITAR MÚSICA */}
          {activeSection === "editMusic" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Gerenciar Música de Fundo</h1>
                <p className="text-sm text-[#969696]">Configure a trilha sonora do site usando link direto de áudio ou link do YouTube.</p>
              </div>

              <form onSubmit={handleSaveSiteSettings} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Título da Trilha Sonora</label>
                  <input
                    type="text"
                    value={siteForm.site_music_title}
                    onChange={(e) => setSiteForm({ ...siteForm, site_music_title: e.target.value })}
                    placeholder="Ex: Trilha Sonora Oficial Aliança"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Link do YouTube ou Áudio (.mp3 / .wav)</label>
                  <input
                    type="text"
                    value={siteForm.site_music_url}
                    onChange={(e) => setSiteForm({ ...siteForm, site_music_url: e.target.value })}
                    placeholder="Ex: https://www.youtube.com/watch?v=XXXXX"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="py-3 px-6 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold text-sm transition hover:brightness-110 flex items-center gap-2"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />} Salvar Música
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* RECRUTAMENTO */}
          {activeSection === "recrutamento" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Inscrições de Recrutamento</h1>
                <p className="text-sm text-[#969696]">Candidatos que se inscreveram para entrar na comunidade.</p>
              </div>

              {inscricoes.length === 0 ? (
                <div className="text-center py-20 bg-[#111111] border border-[#292929] rounded-2xl p-8">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-[#555]" />
                  <h3 className="text-lg font-bold mb-1">Nenhuma inscrição recebida</h3>
                  <p className="text-sm text-[#969696]">Assim que novos membros preencherem o formulário no site, aparecerão aqui.</p>
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
                            title="Excluir"
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

          {/* EDITAR TEXTOS */}
          {activeSection === "editSite" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Editar Textos e Identidade</h1>
                <p className="text-sm text-[#969696]">Personalize títulos, subtítulos, selo hero, descrição e rodapé.</p>
              </div>

              <form onSubmit={handleSaveSiteSettings} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Título do Site</label>
                    <input
                      type="text"
                      value={siteForm.site_title}
                      onChange={(e) => setSiteForm({ ...siteForm, site_title: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subtítulo</label>
                    <input
                      type="text"
                      value={siteForm.site_subtitle}
                      onChange={(e) => setSiteForm({ ...siteForm, site_subtitle: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Selo Hero</label>
                    <input
                      type="text"
                      value={siteForm.hero_badge}
                      onChange={(e) => setSiteForm({ ...siteForm, hero_badge: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Título Principal</label>
                    <input
                      type="text"
                      value={siteForm.hero_title_main}
                      onChange={(e) => setSiteForm({ ...siteForm, hero_title_main: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Palavra Colorida</label>
                    <input
                      type="text"
                      value={siteForm.hero_title_accent}
                      onChange={(e) => setSiteForm({ ...siteForm, hero_title_accent: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Descrição Principal</label>
                  <textarea
                    value={siteForm.hero_description}
                    onChange={(e) => setSiteForm({ ...siteForm, hero_description: e.target.value })}
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm min-h-[90px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Texto Botão Admin</label>
                    <input
                      type="text"
                      value={siteForm.admin_btn_text}
                      onChange={(e) => setSiteForm({ ...siteForm, admin_btn_text: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Texto Rodapé</label>
                    <input
                      type="text"
                      value={siteForm.footer_text}
                      onChange={(e) => setSiteForm({ ...siteForm, footer_text: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="py-3 px-6 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold text-sm transition hover:brightness-110 flex items-center gap-2"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Salvar Textos
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DIVULGAÇÕES */}
          {activeSection === "divulgacoes" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Gerenciar Divulgações</h1>
                  <p className="text-sm text-[#969696]">Adicione, edite ou remova grupos, canais e sites exibidos na área pública.</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-[#111] border border-[#292929] text-white text-xs rounded-xl px-3 py-2.5 outline-none"
                  >
                    <option value="all">Todas as Categorias</option>
                    <option value="grupo">Grupos</option>
                    <option value="canal">Canais</option>
                    <option value="site">Sites</option>
                  </select>
                </div>
              </div>

              {listLoading ? (
                <div className="flex justify-center items-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-[#111111] border border-[#292929] rounded-2xl p-8">
                  <Megaphone className="w-12 h-12 mx-auto mb-3 text-[#555]" />
                  <h3 className="text-lg font-bold mb-1">Nenhuma divulgação encontrada</h3>
                  <p className="text-sm text-[#969696]">Clique em "Nova Divulgação" para começar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredItems.map((item) => {
                    const p = item.prioridade || "normal";
                    const badgeBg = p === "premium" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : p === "vip" ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-[#8b5cf6]/20 text-[#bca9ff] border-[#8b5cf6]/40";
                    const badgeText = p === "premium" ? "⭐ Premium" : p === "vip" ? "👑 VIP" : item.type;

                    return (
                      <div key={item.id} className="p-5 rounded-2xl bg-[#111111] border border-[#292929] flex flex-col justify-between space-y-4">
                        <div className="flex items-start gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-[#333] shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-bold text-sm shrink-0">
                              155
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                                {badgeText}
                              </span>
                            </div>
                            <h3 className="font-bold text-base text-white truncate mt-1">{item.title}</h3>
                            <p className="text-xs text-[#969696] truncate mt-0.5">{item.link}</p>
                          </div>
                        </div>

                        <p className="text-xs text-[#aaa] line-clamp-2">
                          {item.description || "Sem descrição"}
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222]">
                          <button
                            onClick={() => openEditModal(item)}
                            className="px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222] text-xs font-bold text-[#bca9ff] flex items-center gap-1.5"
                          >
                            <Edit className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Deseja excluir "${item.title}"?`)) {
                                deleteMutation.mutate({ id: item.id });
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-xs font-bold text-[#f87171] flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CONFIGURAÇÕES & SENHA */}
          {activeSection === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Configurações & Senha</h1>
                <p className="text-sm text-[#969696]">Altere sua senha de acesso ou limpe todos os dados na zona de perigo.</p>
              </div>

              <form onSubmit={handlePasswordChange} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-[#8b5cf6]">
                  <Key className="w-5 h-5" /> Alterar Senha do Painel
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Senha Atual</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="py-3 px-6 rounded-xl bg-[#8b5cf6] text-white font-bold text-sm transition hover:bg-[#7c3aed] flex items-center gap-2"
                  >
                    {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Atualizar Senha
                  </button>
                </div>
              </form>

              <div className="p-6 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/30 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-[#f87171]">
                  <AlertTriangle className="w-5 h-5" /> Zona de Perigo
                </h2>
                <p className="text-sm text-[#ccc]">
                  Limpar todos os dados apagará divulgações, inscrições, equipe, aluguéis de bot, métricas e configurações. Esta ação não pode ser desfeita.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.prompt('Para confirmar a exclusão TOTAL dos dados, digite "DELETAR":') === "DELETAR") {
                      clearAllMutation.mutate();
                    } else {
                      toast.error("Confirmação incorreta. Ação cancelada.");
                    }
                  }}
                  disabled={clearAllMutation.isPending}
                  className="py-3 px-6 rounded-xl bg-[#ef4444] text-white font-bold text-sm transition hover:bg-[#dc2626] flex items-center gap-2"
                >
                  {clearAllMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Limpar Todos os Dados
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-sm">
          <div className="w-72 bg-[#0d0d0d] border-r border-[#1f1f1f] p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-black text-white">
                    155
                  </div>
                  <span className="font-bold text-sm">Painel Admin</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#969696] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                <button
                  onClick={() => { setActiveSection("dashboard"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "dashboard" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white"}`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={() => { setActiveSection("botRentalAdmin"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "botRentalAdmin" ? "bg-[#22c55e] text-white" : "text-[#4ade80] hover:text-white"}`}
                >
                  <Bot className="w-4 h-4" /> Aluguel de Bot ({alugueisBot.length})
                </button>
                <button
                  onClick={() => { setActiveSection("equipeAdmin"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "equipeAdmin" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white"}`}
                >
                  <ShieldAlert className="w-4 h-4" /> Donos e Admins ({equipe.length})
                </button>
                <button
                  onClick={() => { setActiveSection("editColors"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editColors" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white"}`}
                >
                  <Palette className="w-4 h-4" /> Cores do Site
                </button>
                <button
                  onClick={() => { setActiveSection("editImages"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editImages" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white"}`}
                >
                  <ImageIcon className="w-4 h-4" /> Imagens do Site
                </button>
                <button
                  onClick={() => { setActiveSection("editMusic"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editMusic" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white"}`}
                >
                  <Music className="w-4 h-4" /> Música do Site
                </button>
                <button
                  onClick={() => { setActiveSection("recrutamento"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "recrutamento" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white"}`}
                >
                  <UserCheck className="w-4 h-4" /> Recrutamento ({inscricoes.length})
                </button>
                <button
                  onClick={() => { setActiveSection("editSite"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "editSite" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white"}`}
                >
                  <FileText className="w-4 h-4" /> Textos do Site
                </button>
                <button
                  onClick={() => { setActiveSection("divulgacoes"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "divulgacoes" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white"}`}
                >
                  <Megaphone className="w-4 h-4" /> Divulgações
                </button>
                <button
                  onClick={() => { setActiveSection("settings"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "settings" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white"}`}
                >
                  <Settings className="w-4 h-4" /> Configurações & Senha
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-[#1f1f1f]">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-[#f87171] bg-[#ef4444]/15"
              >
                <LogOut className="w-4 h-4" /> Sair do Painel
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Modal Divulgação */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-[#292929] w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingItem.id ? "Editar Divulgação" : "Nova Divulgação"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-[#222] text-[#969696] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Título *</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Ex: Comunidade Oficial"
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tipo *</label>
                  <select
                    value={editingItem.type}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  >
                    <option value="grupo">Grupo</option>
                    <option value="canal">Canal</option>
                    <option value="site">Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Prioridade *</label>
                  <select
                    value={editingItem.prioridade}
                    onChange={(e) => setEditingItem({ ...editingItem, prioridade: e.target.value as any })}
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm font-bold"
                  >
                    <option value="normal">Normal</option>
                    <option value="vip">👑 VIP</option>
                    <option value="premium">⭐ Premium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Link Externo *</label>
                <input
                  type="text"
                  value={editingItem.link}
                  onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                  placeholder="https://t.me/seubot"
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">URL da Imagem / Ícone</label>
                <input
                  type="text"
                  value={editingItem.image}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  placeholder="https://exemplo.com/icone.png"
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Descrição</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Breve descrição..."
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm min-h-[90px]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-[#222] text-xs font-bold text-[#bbb]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-xs font-bold text-white flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar Divulgação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Equipe */}
      {isEquipeModalOpen && editingEquipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-[#292929] w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingEquipe.id ? "Editar Membro" : "Adicionar Membro"}</h2>
              <button onClick={() => setIsEquipeModalOpen(false)} className="p-2 rounded-full hover:bg-[#222] text-[#969696] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipe} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nome *</label>
                <input
                  type="text"
                  value={editingEquipe.nome}
                  onChange={(e) => setEditingEquipe({ ...editingEquipe, nome: e.target.value })}
                  placeholder="Ex: Carlos 155"
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Cargo *</label>
                  <input
                    type="text"
                    value={editingEquipe.cargo}
                    onChange={(e) => setEditingEquipe({ ...editingEquipe, cargo: e.target.value })}
                    placeholder="Ex: Dono"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">WhatsApp / Telegram *</label>
                  <input
                    type="text"
                    value={editingEquipe.numeroContato}
                    onChange={(e) => setEditingEquipe({ ...editingEquipe, numeroContato: e.target.value })}
                    placeholder="Ex: 5511999999999"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">URL da Foto</label>
                <input
                  type="text"
                  value={editingEquipe.foto}
                  onChange={(e) => setEditingEquipe({ ...editingEquipe, foto: e.target.value })}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEquipeModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-[#222] text-xs font-bold text-[#bbb]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createEquipeMutation.isPending || updateEquipeMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-xs font-bold text-white flex items-center gap-2"
                >
                  {(createEquipeMutation.isPending || updateEquipeMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bot Plano */}
      {isBotPlanoModalOpen && editingBotPlano && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-[#292929] w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingBotPlano.id ? "Editar Plano de Bot" : "Novo Plano de Bot"}</h2>
              <button onClick={() => setIsBotPlanoModalOpen(false)} className="p-2 rounded-full hover:bg-[#222] text-[#969696] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBotPlano} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nome do Plano *</label>
                <input
                  type="text"
                  value={editingBotPlano.nome}
                  onChange={(e) => setEditingBotPlano({ ...editingBotPlano, nome: e.target.value })}
                  placeholder="Ex: Plano Mensal VIP"
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Preço (R$) *</label>
                  <input
                    type="text"
                    value={editingBotPlano.preco}
                    onChange={(e) => setEditingBotPlano({ ...editingBotPlano, preco: e.target.value })}
                    placeholder="Ex: 29.90"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Duração (Dias) *</label>
                  <input
                    type="number"
                    value={editingBotPlano.duracaoDias}
                    onChange={(e) => setEditingBotPlano({ ...editingBotPlano, duracaoDias: Number(e.target.value) })}
                    placeholder="Ex: 30"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Descrição *</label>
                <input
                  type="text"
                  value={editingBotPlano.descricao}
                  onChange={(e) => setEditingBotPlano({ ...editingBotPlano, descricao: e.target.value })}
                  placeholder="Ex: Acesso completo por 30 dias"
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Recursos (separados por vírgula) *</label>
                <textarea
                  value={editingBotPlano.recursos}
                  onChange={(e) => setEditingBotPlano({ ...editingBotPlano, recursos: e.target.value })}
                  placeholder="Moderação automática, Anti-flood, Boas-vindas"
                  className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm min-h-[90px]"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBotPlanoModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-[#222] text-xs font-bold text-[#bbb]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createBotPlanoMutation.isPending || updateBotPlanoMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-xs font-bold text-white flex items-center gap-2"
                >
                  {(createBotPlanoMutation.isPending || updateBotPlanoMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
