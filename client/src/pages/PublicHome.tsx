import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Search, ExternalLink, Users, Megaphone, Globe, Sparkles, Loader2, Lock } from "lucide-react";
import { Link } from "wouter";

export default function PublicHome() {
  const [activeTab, setActiveTab] = useState<"all" | "grupo" | "canal" | "site">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: divulgacoes = [], isLoading: listLoading } = trpc.alianca.list.useQuery();
  const { data: settings = {} } = trpc.alianca.getSettings.useQuery();

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
    };
  }, [divulgacoes]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#8b5cf6] selection:text-white">
      {/* Navbar */}
      <header className="border-b border-[#1f1f1f] bg-[#050505]/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#5b21b6] flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            155
          </div>
          <div>
            <span className="font-bold text-base block tracking-wide">{settings.site_title || "Aliança 155"}</span>
            <span className="text-xs text-[#969696] block">{settings.site_subtitle || "Central de Divulgações"}</span>
          </div>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#292929] text-xs font-bold transition flex items-center gap-2 text-[#bca9ff]"
        >
          <Lock className="w-3.5 h-3.5" /> {settings.admin_btn_text || "Painel Admin"}
        </Link>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 text-center max-w-4xl mx-auto space-y-6">
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
        <div className="pt-4 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por nome ou link..."
              className="w-full pl-11 pr-4 py-3.5 bg-[#111111] text-white border border-[#262626] rounded-2xl outline-none focus:border-[#8b5cf6] transition text-sm shadow-inner"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 ${activeTab === "all" ? "bg-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]" : "bg-[#111111] hover:bg-[#1a1a1a] text-[#969696] border border-[#262626]"}`}
          >
            Todos ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab("grupo")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 ${activeTab === "grupo" ? "bg-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]" : "bg-[#111111] hover:bg-[#1a1a1a] text-[#969696] border border-[#262626]"}`}
          >
            <Users className="w-4 h-4" /> Grupos ({counts.grupo})
          </button>
          <button
            onClick={() => setActiveTab("canal")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 ${activeTab === "canal" ? "bg-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]" : "bg-[#111111] hover:bg-[#1a1a1a] text-[#969696] border border-[#262626]"}`}
          >
            <Megaphone className="w-4 h-4" /> Canais ({counts.canal})
          </button>
          <button
            onClick={() => setActiveTab("site")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center gap-2 ${activeTab === "site" ? "bg-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]" : "bg-[#111111] hover:bg-[#1a1a1a] text-[#969696] border border-[#262626]"}`}
          >
            <Globe className="w-4 h-4" /> Sites ({counts.site})
          </button>
        </div>
      </section>

      {/* Grid Content */}
      <main className="max-w-7xl mx-auto px-6 pb-24 flex-1 w-full">
        {listLoading ? (
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
                className="group bg-[#0d0d0d] border border-[#222] hover:border-[#8b5cf6]/50 rounded-3xl p-6 transition duration-300 flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(139,92,246,0.1)] relative overflow-hidden"
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
      <footer className="border-t border-[#1f1f1f] py-8 text-center text-xs text-[#777] bg-[#050505]">
        <p>{settings.footer_text || "Aliança 155 — Todos os direitos reservados."}</p>
      </footer>
    </div>
  );
}
