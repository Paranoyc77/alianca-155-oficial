import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { LayoutDashboard, Megaphone, Users, Globe, Settings, LogOut, Plus, Search, ExternalLink, Edit, Trash2, Key, AlertTriangle, X, Loader2, Menu, AlertCircle, FileText, CheckCircle2, Image as ImageIcon, Music, UserCheck, ShieldAlert, Phone, Eye, Activity } from "lucide-react";
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
  });

  const utils = trpc.useUtils();

  const { data: divulgacoes = [], isLoading: listLoading, error: listError } = trpc.alianca.list.useQuery();
  const { data: settings = {} } = trpc.alianca.getSettings.useQuery();
  const { data: inscricoes = [] } = trpc.alianca.listRecrutamento.useQuery();
  const { data: equipe = [] } = trpc.alianca.listEquipe.useQuery();
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
      toast.success("Configurações do site salvas com sucesso!");
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
      <aside className="hidden lg:flex flex-col w-72 bg-[#0d0d0d] border-r border-[#1f1f1f] p-6 shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            155
          </div>
          <div>
            <span className="font-bold text-base block tracking-wide">Painel Admin</span>
            <span className="text-xs text-[#969696] block">Gerenciamento Total</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "dashboard" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button
            onClick={() => setActiveSection("equipeAdmin")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "equipeAdmin" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white hover:bg-[#171717]"}`}
          >
            <ShieldAlert className="w-4 h-4" /> Donos e Admins ({equipe.length})
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
            Bem-vindo ao painel administrativo da Aliança 155.
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
          {/* Global Error Banner */}
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
                    <span className="text-sm text-[#969696]">Donos e Admins</span>
                    <ShieldAlert className="w-5 h-5 text-[#3b82f6]" />
                  </div>
                  <div className="text-3xl font-black">{equipe.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Inscrições Recrutamento</span>
                    <UserCheck className="w-5 h-5 text-[#22c55e]" />
                  </div>
                  <div className="text-3xl font-black">{inscricoes.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#969696]">Canais & Sites</span>
                    <Globe className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div className="text-3xl font-black">{divulgacoes.filter(x => x.type !== "grupo").length}</div>
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

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-3">
                  <h3 className="font-bold text-lg">Grupos Cadastrados</h3>
                  <p className="text-3xl font-black text-[#8b5cf6]">{divulgacoes.filter(x => x.type === "grupo").length}</p>
                  <p className="text-xs text-[#969696]">Grupos ativos na listagem pública da comunidade.</p>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-3">
                  <h3 className="font-bold text-lg">Canais Parceiros</h3>
                  <p className="text-3xl font-black text-[#3b82f6]">{divulgacoes.filter(x => x.type === "canal").length}</p>
                  <p className="text-xs text-[#969696]">Canais de divulgação e avisos oficiais.</p>
                </div>
                <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-3">
                  <h3 className="font-bold text-lg">Sites Indicados</h3>
                  <p className="text-3xl font-black text-[#f59e0b]">{divulgacoes.filter(x => x.type === "site").length}</p>
                  <p className="text-xs text-[#969696]">Websites recomendados pela Aliança.</p>
                </div>
              </div>
            </div>
          )}

          {/* EQUIPE (DONOS E ADMINS) */}
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

          {/* EDITAR IMAGENS DO SITE */}
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
                  <p className="text-xs text-[#777] mt-1">Cole o link direto da imagem da logo.</p>
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
                  <p className="text-xs text-[#777] mt-1">Deixe em branco para usar o fundo dark padrão.</p>
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

          {/* EDITAR MÚSICA DO SITE */}
          {activeSection === "editMusic" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Gerenciar Música de Fundo</h1>
                <p className="text-sm text-[#969696]">Configure a trilha sonora do site usando um link direto de áudio (.mp3/.wav) ou um link do YouTube (watch, youtu.be, shorts).</p>
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
                    placeholder="Ex: https://www.youtube.com/watch?v=XXXXX ou https://exemplo.com/musica.mp3"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                  />
                  <p className="text-xs text-[#8b5cf6] mt-1.5">Suporta links do YouTube (ex: youtube.com/watch?v=... ou youtu.be/...) e links diretos de áudio.</p>
                </div>

                {siteForm.site_music_url && (
                  <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#292929] space-y-3">
                    <span className="text-xs font-bold text-[#bca9ff]">Teste / Visualização do Player:</span>
                    {siteForm.site_music_url.includes("youtube.com") || siteForm.site_music_url.includes("youtu.be") ? (
                      <div className="text-xs text-[#22c55e] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Link do YouTube identificado com sucesso!
                      </div>
                    ) : (
                      <audio controls src={siteForm.site_music_url} className="w-full h-10 accent-[#8b5cf6]" />
                    )}
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
              </div>

              {inscricoes.length === 0 ? (
                <div className="text-center py-20 bg-[#111111] border border-[#292929] rounded-2xl p-8">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-[#555]" />
                  <h3 className="text-lg font-bold mb-1">Nenhuma inscrição recebida</h3>
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
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Editar Textos e Identidade</h1>
                <p className="text-sm text-[#969696]">Personalize títulos, subtítulos, selo hero, descrição e rodapé do site.</p>
              </div>

              <form onSubmit={handleSaveSiteSettings} className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Título do Site (Aba do Navegador)</label>
                    <input
                      type="text"
                      value={siteForm.site_title}
                      onChange={(e) => setSiteForm({ ...siteForm, site_title: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subtítulo / Descrição da Logo</label>
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
                    <label className="block text-sm font-medium mb-1.5">Selo Hero (Badge)</label>
                    <input
                      type="text"
                      value={siteForm.hero_badge}
                      onChange={(e) => setSiteForm({ ...siteForm, hero_badge: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
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
                    <label className="block text-sm font-medium mb-1.5">Palavra Colorida (Accent)</label>
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
                    <label className="block text-sm font-medium mb-1.5">Texto do Botão Admin</label>
                    <input
                      type="text"
                      value={siteForm.admin_btn_text}
                      onChange={(e) => setSiteForm({ ...siteForm, admin_btn_text: e.target.value })}
                      className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Texto do Rodapé</label>
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
                    {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Salvar Textos do Site
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LISTA DE DIVULGAÇÕES */}
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
                  {filteredItems.map((item) => (
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
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#bca9ff]">
                            {item.type}
                          </span>
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
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONFIGURAÇÕES & SEGURANÇA */}
          {activeSection === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Configurações & Senha</h1>
                <p className="text-sm text-[#969696]">Altere sua senha de acesso ao painel ou limpe todos os dados do sistema na zona de perigo.</p>
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

              {/* Zona de Perigo */}
              <div className="p-6 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/30 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-[#f87171]">
                  <AlertTriangle className="w-5 h-5" /> Zona de Perigo
                </h2>
                <p className="text-sm text-[#ccc]">
                  Limpar todos os dados do banco de dados apagará todas as divulgações, inscrições de recrutamento, equipe e métricas. Esta ação não pode ser desfeita.
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

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-sm">
          <div className="w-72 bg-[#0d0d0d] border-r border-[#1f1f1f] p-6 flex flex-col justify-between">
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
                  onClick={() => { setActiveSection("equipeAdmin"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeSection === "equipeAdmin" ? "bg-[#8b5cf6] text-white" : "text-[#969696] hover:text-white"}`}
                >
                  <ShieldAlert className="w-4 h-4" /> Donos e Admins ({equipe.length})
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

      {/* Modal Criar / Editar Divulgação */}
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
                  placeholder="Breve descrição da divulgação..."
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

      {/* Modal Criar / Editar Membro da Equipe */}
      {isEquipeModalOpen && editingEquipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-[#292929] w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingEquipe.id ? "Editar Membro da Equipe" : "Adicionar Membro da Equipe"}</h2>
              <button onClick={() => setIsEquipeModalOpen(false)} className="p-2 rounded-full hover:bg-[#222] text-[#969696] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipe} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nome do Membro *</label>
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
                  <label className="block text-sm font-medium mb-1.5">Cargo / Função *</label>
                  <input
                    type="text"
                    value={editingEquipe.cargo}
                    onChange={(e) => setEditingEquipe({ ...editingEquipe, cargo: e.target.value })}
                    placeholder="Ex: Dono ou Administrador"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Número de Contato / WhatsApp *</label>
                  <input
                    type="text"
                    value={editingEquipe.numeroContato}
                    onChange={(e) => setEditingEquipe({ ...editingEquipe, numeroContato: e.target.value })}
                    placeholder="Ex: 5511999999999 ou @usuario"
                    className="w-full p-3 bg-[#0d0d0d] text-white border border-[#292929] rounded-xl outline-none focus:border-[#8b5cf6] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">URL da Foto de Perfil</label>
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
    </div>
  );
}
