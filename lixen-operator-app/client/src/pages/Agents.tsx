import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOperator, operatorGet } from "@/lib/operator";
import { PageHeader } from "@/components/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, FileText, FileCode, ExternalLink } from "lucide-react";
import type { CatalogItem } from "@shared/schema";

interface CatalogResp {
  source: { repo: string; root: string; note: string };
  categories: string[];
  items: CatalogItem[];
}

export default function Agents() {
  const { token } = useOperator();
  const t = token!;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [active, setActive] = useState<CatalogItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/catalog"],
    queryFn: () => operatorGet<CatalogResp>("/api/catalog", t),
  });

  const categories = ["All", ...(data?.categories ?? [])];
  const items = (data?.items ?? []).filter((it) => {
    const matchCat = cat === "All" || it.category === cat;
    const matchQ =
      !q ||
      it.title.toLowerCase().includes(q.toLowerCase()) ||
      it.summary.toLowerCase().includes(q.toLowerCase()) ||
      it.filename.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <>
      <PageHeader
        title="Agent Library"
        subtitle="Repo content organized: agents, workflows, templates, QA, config"
      />
      <div className="p-8 max-w-6xl space-y-6">
        {data?.source && (
          <div className="rounded-lg border border-card-border bg-card p-4 text-[13px] text-muted-foreground">
            Ingested from{" "}
            <a
              href={data.source.repo}
              target="_blank"
              rel="noreferrer"
              className="text-[#1E5BA8] underline inline-flex items-center gap-1"
              data-testid="link-source-repo"
            >
              {data.source.root} <ExternalLink className="h-3 w-3" />
            </a>{" "}
            — {data.source.note}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
              data-testid="input-search-catalog"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                data-testid={`filter-${c.replace(/\W+/g, "-").toLowerCase()}`}
                className={`text-[12.5px] px-3 py-1.5 rounded-md border transition-colors ${
                  cat === c
                    ? "bg-[#0D3070] text-white border-[#0D3070]"
                    : "bg-card text-muted-foreground border-card-border hover-elevate"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-[12px] text-muted-foreground" data-testid="text-result-count">
              {items.length} asset{items.length === 1 ? "" : "s"}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setActive(it)}
                  className="text-left bg-card border border-card-border rounded-lg p-4 hover-elevate"
                  data-testid={`card-asset-${it.id.replace(/\W+/g, "-")}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-[10px] bg-[#EBF2FA] text-[#1E5BA8]">
                      {it.category}
                    </Badge>
                    {it.kind === "yaml" ? (
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-medium text-[15px] leading-snug">{it.title}</h3>
                  <p className="text-[12.5px] text-muted-foreground mt-1.5 line-clamp-3">
                    {it.summary || "No summary available."}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <code className="text-[11px] text-muted-foreground truncate">{it.filename}</code>
                    {it.seeded && (
                      <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700">
                        seeded
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px] bg-[#EBF2FA] text-[#1E5BA8]">
                    {active.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">{active.kind}</Badge>
                  {active.seeded && (
                    <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">seeded</Badge>
                  )}
                </div>
                <DialogTitle>{active.title}</DialogTitle>
                <DialogDescription className="font-mono text-[11px]">{active.repoPath}</DialogDescription>
              </DialogHeader>
              <p className="text-[13px] text-foreground/90 leading-relaxed">
                {active.summary || "No summary available."}
              </p>
              {active.sections.length > 0 && (
                <div>
                  <p className="text-[12px] font-medium text-muted-foreground mb-1.5">Sections</p>
                  <div className="flex flex-wrap gap-1.5">
                    {active.sections.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-1 rounded bg-muted text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!active.seeded && (
                <p className="text-[11px] text-muted-foreground">
                  {active.lines} lines · {active.bytes.toLocaleString()} bytes
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
