import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Lock, ExternalLink, ShieldAlert, FolderPlus, Plus, Edit, Trash2, Key, LogOut, BarChart3, Database, Globe, Users, Megaphone, Settings } from "lucide-react";
import { toast } from "sonner";

export default function PublicHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: divulgacoes = [], isLoading, refetch } = trpc.alianca.list.useQuery();

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

  const grupos = useMemo(() => filteredDivulgacoes.filter(x => x.type === "grupo"), [filteredDivulgacoes]);
  const canais = useMemo(() => filteredDivulgacoes.filter(x => x.type === "canal"), [filteredDivulgacoes]);
  const sites = useMemo(() => filteredDivulgacoes.filter(x => x.type === "site"), [filteredDivulgacoes]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      {/* Header */}
      <header className="h-[78px] px-[6%] flex items-center justify-between border-b border-[#292929] bg-[#050505]/88 backdrop-blur-[15px] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-[48px] h-[48px] flex items-center justify-center rounded-[14px] bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] font-black text-lg shadow-[0_0_30px_rgba(139,92,246,.25)]">
            155
          </div>
          <div>
            <h2 className="font-bold text-[17px]">Aliança 155</h2>
            <span className="text-[#969696] text-[11px] block mt-[3px]">Central de Divulgações</span>
          </div>
        </div>

        <button
          onClick={() => {
            window.location.href = "/admin";
          }}
          className="px-[17px] py-[12px] rounded-[11px] bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] text-white font-bold transition hover:-translate-y-0.5 hover:brightness-110 shadow-[0_8px_25px_rgba(139,92,246,.15)] flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Painel Admin
        </button>
      </header>

      {/* Main Content */}
      <main className="w-[min(1200px,92%)] mx-auto py-[70px] flex-1">
        <div className="text-center max-w-[850px] mx-auto mb-[50px]">
          <span className="inline-block px-[13px] py-[8px] rounded-[30px] border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#c4b5fd] text-[11px] font-bold tracking-[.7px]">
            ⚡ ALIANÇA 155
          </span>
          <h1 className="text-[54px] leading-[1.05] font-extrabold my-[22px]">
            Central de Divulgações <span className="text-[#a78bfa]">Oficial</span>
          </h1>
          <p className="text-[#969696] text-[17px] leading-[1.6]">
            Encontre os melhores grupos, canais e sites recomendados pela nossa comunidade.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_190px] gap-[10px] mb-[50px]">
          <div className="relative">
            <Search className="absolute left-[15px] top-[50%] -translate-y-1/2 w-5 h-5 text-[#969696]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔎 Pesquisar por nome ou link..."
              className="w-full pl-[48px] pr-[15px] py-[15px] bg-[#0d0d0d] text-white border border-[#292929] rounded-[12px] outline-none focus:border-[#8b5cf6]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-[15px] bg-[#0d0d0d] text-white border border-[#292929] rounded-[12px] outline-none focus:border-[#8b5cf6]"
          >
            <option value="all">Todas as categorias</option>
            <option value="grupo">Grupos</option>
            <option value="canal">Canais</option>
            <option value="site">Sites</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
          </div>
        ) : filteredDivulgacoes.length === 0 ? (
          <div className="text-center py-20 bg-[#111111] border border-[#292929] rounded-[18px]">
            <p className="text-[#969696] text-lg">Nenhuma divulgação encontrada.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Grupos */}
            {(filterType === "all" || filterType === "grupo") && grupos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-[17px]">
                  <h2 className="text-[21px] font-bold flex items-center gap-2">👥 Grupos</h2>
                  <span className="text-[#aaa] bg-[#171717] border border-[#292929] rounded-[30px] px-[10px] py-[5px] text-[12px]">
                    {grupos.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[18px]">
                  {grupos.map((item) => (
                    <DivulgacaoCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Canais */}
            {(filterType === "all" || filterType === "canal") && canais.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-[17px]">
                  <h2 className="text-[21px] font-bold flex items-center gap-2">📣 Canais</h2>
                  <span className="text-[#aaa] bg-[#171717] border border-[#292929] rounded-[30px] px-[10px] py-[5px] text-[12px]">
                    {canais.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[18px]">
                  {canais.map((item) => (
                    <DivulgacaoCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Sites */}
            {(filterType === "all" || filterType === "site") && sites.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-[17px]">
                  <h2 className="text-[21px] font-bold flex items-center gap-2">🌐 Sites</h2>
                  <span className="text-[#aaa] bg-[#171717] border border-[#292929] rounded-[30px] px-[10px] py-[5px] text-[12px]">
                    {sites.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[18px]">
                  {sites.map((item) => (
                    <DivulgacaoCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#292929] py-8 text-center text-[#969696] text-sm">
        <p>Aliança 155 © {new Date().getFullYear()} — Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function DivulgacaoCard({ item }: { item: { id: number; title: string; description: string | null; type: string; link: string; image: string | null } }) {
  const typeLabels: Record<string, string> = {
    grupo: "Grupo",
    canal: "Canal",
    site: "Site",
  };

  return (
    <div className="overflow-hidden bg-gradient-to-br from-[#151515] to-[#0d0d0d] border border-[#292929] rounded-[18px] transition hover:-translate-y-1 hover:border-[#8b5cf6]/45 hover:shadow-[0_15px_40px_rgba(0,0,0,.3)] flex flex-col justify-between">
      <div>
        <div className="h-[160px] bg-[#080808] flex items-center justify-center overflow-hidden">
          {item.image ? (
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-[65px] h-[65px] rounded-[18px] bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-black text-white text-lg">
              155
            </div>
          )}
        </div>
        <div className="p-[18px]">
          <span className="inline-block px-[9px] py-[5px] rounded-[20px] bg-[#8b5cf6]/12 text-[#bca9ff] text-[10px] font-bold mb-[10px]">
            {typeLabels[item.type] || item.type}
          </span>
          <h3 className="text-[17px] font-bold mb-[8px] line-clamp-1">{item.title}</h3>
          <p className="text-[#969696] leading-[1.5] text-[13px] min-height-[40px] mb-[16px] line-clamp-2">
            {item.description || "Nenhuma descrição informada."}
          </p>
        </div>
      </div>
      <div className="px-[18px] pb-[18px]">
        <a
          href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-[12px] rounded-[11px] bg-[#222] hover:bg-[#8b5cf6] text-white font-bold transition flex items-center justify-center gap-2 text-sm"
        >
          Acessar Link <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
