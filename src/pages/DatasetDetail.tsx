import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";

import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ChevronLeft,
  Download,
  MoreVertical,
  Search,
  ChevronDown,
  FileDown,
  ClipboardCopy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import SessionDetailPanel from "@/components/dataset/SessionDetailPanel";

// Types
interface SessionRow {
  id: string;
  timestamp: string;
  agent: string;
  messages: number;
  tokens: number;
  duration: string;
  status: "completed" | "failed" | "processing";
}

const sampleSessions: SessionRow[] = [
  {
    id: "sess_abc123def456",
    timestamp: "10:23 AM",
    agent: "客服助手",
    messages: 12,
    tokens: 1245,
    duration: "2m 15s",
    status: "completed",
  },
  {
    id: "sess_def456ghi789",
    timestamp: "09:45 AM",
    agent: "销售助手",
    messages: 8,
    tokens: 892,
    duration: "1m 08s",
    status: "processing",
  },
  {
    id: "sess_ghi789jkl012",
    timestamp: "09:12 AM",
    agent: "客服助手",
    messages: 15,
    tokens: 2103,
    duration: "3m 31s",
    status: "failed",
  },
];

const DatasetDetail = () => {
  const navigate = useNavigate();
  const { id, datasetId } = useParams<{ id: string; datasetId: string }>();

  // UI State
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<SessionRow | null>(null);
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const sessions = useMemo(() => {
    // 简单前端过滤（示例）
    return sampleSessions.filter((s) => {
      const matchSearch = search
        ? s.id.toLowerCase().includes(search.toLowerCase()) ||
          s.agent.includes(search)
        : true;
      const matchAgent = agent ? (agent === "all" ? true : s.agent === agent) : true;
      const matchStatus = status ? (status === "all" ? true : s.status === status) : true;
      return matchSearch && matchAgent && matchStatus;
    });
  }, [search, agent, status]);

  const exportAction = (label: string) => () => {
    toast.success(`${label} 已开始导出`, { duration: 2500 });
  };

  return (
    <>
      <Helmet>
        <title>AIgents — 数据集详情</title>
        <meta name="description" content="查看与分析交互数据集，支持筛选、导出与会话展开。" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <AppHeader
        leftSlot={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" /> 返回
            </Button>
            <h1 className="text-lg font-semibold">数据集 #{datasetId}</h1>
          </div>
        }
      />

      <main className="container pt-20 pb-16 space-y-6 animate-fade-in">
        {/* Page Title + Export */}

        {/* Filters */}
        <section className="py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Select onValueChange={setAgent}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Agents" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="客服助手">客服助手</SelectItem>
                <SelectItem value="销售助手">销售助手</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Last 7 days" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed ✓</SelectItem>
                <SelectItem value="failed">Failed ✗</SelectItem>
                <SelectItem value="processing">Processing ◐</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="md:ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" /> 导出 <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>导出选项</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportAction("导出当前页 CSV")}>导出当前页（CSV）</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAction("导出全部 CSV")}>导出全部（CSV）</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAction("导出当前页 JSON")}>导出当前页（JSON）</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAction("导出全部 JSON")}>导出全部（JSON）</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportAction("导出分析报告 PDF")}>导出分析报告（PDF）</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        {/* Table */}
        {sessions.length === 0 ? (
          <Card className="text-center py-16">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-lg font-medium">No sessions found</div>
            <div className="text-sm text-muted-foreground mt-1">Start testing your agents to see dataset here</div>
            <div className="mt-4">
              <Link to={`/apps/${id}/test`}>
                <Button>Go to Test Chat</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <section className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="h-12 border-b-2 border-border">
                  <TableHead className="w-[180px] font-semibold">Session ID</TableHead>
                  <TableHead className="w-[140px] font-semibold">Timestamp</TableHead>
                  <TableHead className="w-[160px] font-semibold">Agent</TableHead>
                  <TableHead className="text-center w-[90px] font-semibold">Msgs</TableHead>
                  <TableHead className="text-right w-[90px] font-semibold">Tokens</TableHead>
                  <TableHead className="text-right w-[90px] font-semibold">Duration</TableHead>
                  <TableHead className="text-center w-[100px] font-semibold">Status</TableHead>
                  <TableHead className="text-center w-[100px] font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((r) => (
                  <>
                    <TableRow
                       key={r.id}
                       className="h-12 transition-colors hover:bg-muted/60 border-b border-border/40"
                     >
                      <TableCell className="font-mono text-sm" title={r.id}>
                        {r.id.slice(0, 12)}
                      </TableCell>
                      <TableCell className="text-muted-foreground" title={r.timestamp}>
                        {r.timestamp}
                      </TableCell>
                      <TableCell>{r.agent}</TableCell>
                      <TableCell className="text-center">{r.messages}</TableCell>
                      <TableCell className="text-right">{r.tokens.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{r.duration}</TableCell>
                      <TableCell className="text-center">
                        {r.status === "completed" && (
                          <span className="text-green-600">✓ Completed</span>
                        )}
                        {r.status === "failed" && (
                          <span className="text-destructive">✗ Failed</span>
                        )}
                        {r.status === "processing" && (
                          <span className="text-amber-500">◐ Processing</span>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelected(r); setDetailOpen(true); }}>
                                <ExternalLink className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(r.id); toast.success("Session ID 已复制"); }}>
                                <ClipboardCopy className="h-4 w-4 mr-2" /> Copy Session ID
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={exportAction("导出该会话 JSON")}>
                                <FileDown className="h-4 w-4 mr-2" /> Export Session
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toast.success("删除成功", { duration: 2000 })}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>

                  </>
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        {/* Pagination */}
        <section className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm">← Previous</Button>
          <div className="text-sm text-muted-foreground">Page 1 of 10</div>
          <Button variant="outline" size="sm">Next →</Button>
        </section>
      </main>

      <Dialog open={detailOpen} onOpenChange={(o) => { if (!o) { setDetailOpen(false); setSelected(null); } }}>
        <DialogContent className="max-w-5xl p-0 max-h-[85vh] overflow-y-auto">
          {selected && (
            <SessionDetailPanel session={selected} onClose={() => { setDetailOpen(false); setSelected(null); }} />
          )}
        </DialogContent>
      </Dialog>

    </>
  );
};

export default DatasetDetail;
