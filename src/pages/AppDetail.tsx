import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Copy, RefreshCw, Edit, Trash2, Send } from "lucide-react";
import StatusDot from "@/components/common/StatusDot";
import AgentModal from "@/pages/modals/AgentModal";
import ToolModal from "@/pages/modals/ToolModal";
import { toast } from "sonner";

const tabList = ["agents", "tools", "mcps", "history", "test", "settings"] as const;

type TabKey = typeof tabList[number];

const AppDetail = () => {
  const navigate = useNavigate();
  const { id, tab } = useParams<{ id: string; tab?: TabKey }>();
  const currentTab: TabKey = (tab && tabList.includes(tab)) ? (tab as TabKey) : "agents";
  return (
    <>
      <Helmet>
        <title>AIgents — 应用详情</title>
        <meta name="description" content="管理应用的 Agents、Tools、MCPs、历史、测试与设置" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <AppHeader
        leftSlot={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" /> 返回
            </Button>
            <h1 className="text-lg font-semibold">应用 #{id}</h1>
          </div>
        }
      />
      <main className="container pt-20 pb-16 space-y-6 animate-fade-in">


        <Tabs value={currentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {tabList.map((t) => (
              <TabsTrigger key={t} value={t} asChild>
                <NavLink to={`/apps/${id}/${t}`} end className={({ isActive }) => isActive ? "font-medium" : ""}>
                  {({ isActive }) => ({
                    agents: "Agents",
                    tools: "Tools",
                    mcps: "MCPs",
                    history: "历史",
                    test: "测试",
                    settings: "设置",
                  }[t])}
                </NavLink>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {currentTab === "agents" && <AgentsSection />}
        {currentTab === "tools" && <ToolsSection />}
        {currentTab === "mcps" && <McpsSection />}
        {currentTab === "history" && <HistorySection />}
        {currentTab === "test" && <TestSection />}
        {currentTab === "settings" && <SettingsSection />}
      </main>
    </>
  );
};

const AgentsSection = () => {
  const items = [
    { id: "a1", name: "客服助手", instruction: "请礼貌回答用户问题…", tools: 3, mcps: 1, usage: { calls: 12, tokens: 4500 }, status: "active" as const },
    { id: "a2", name: "内容生成", instruction: "生成简洁风格内容…", tools: 2, mcps: 0, usage: { calls: 5, tokens: 2100 }, status: "idle" as const },
  ];

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => (
          <Card key={it.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">{it.name}</CardTitle>
              <StatusDot status={it.status} />
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <div className="text-muted-foreground">指令</div>
                <div className="line-clamp-2">{it.instruction}</div>
              </div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">工具</span><span>{it.tools}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">MCPs</span><span>{it.mcps}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">使用统计</span>
                <span>今日 {it.usage.calls} 次 · {Math.round(it.usage.tokens / 100) / 10}k tokens</span>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2">
              <AgentModal agent={it}>
                <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" />编辑</Button>
              </AgentModal>
              <ConfirmDelete>
                <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 mr-1" />删除</Button>
              </ConfirmDelete>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-40">
        <AgentModal>
          <Button size="lg" className="shadow-lg">新增xx</Button>
        </AgentModal>
      </div>
    </section>
  );
};

const ToolsSection = () => {
  const items = [
    { id: "t1", name: "搜索", method: "GET", endpoint: "/api/search", desc: "调用搜索引擎" },
    { id: "t2", name: "翻译", method: "POST", endpoint: "/api/translate", desc: "多语言翻译" },
  ];
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-end">
        <ToolModal>
          <Button size="sm">新增</Button>
        </ToolModal>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => (
          <Card key={it.id}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{it.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <div className="flex items-center justify-between"><span>方法</span><span className="text-foreground">{it.method}</span></div>
              <div className="flex items-center justify-between"><span>端点</span><span className="text-foreground">{it.endpoint}</span></div>
              <div><span>描述</span><div className="text-foreground">{it.desc}</div></div>
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2">
              <ToolModal tool={it}>
                <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" />编辑</Button>
              </ToolModal>
              <ConfirmDelete>
                <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 mr-1" />删除</Button>
              </ConfirmDelete>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

const McpsSection = () => {
  const items = [
    { id: "m1", name: "文件服务", url: "https://mcp.example.com", mode: "自动审批", desc: "提供文件读取能力" },
  ];
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm">新增</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => (
          <Card key={it.id}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{it.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <div className="flex items-center justify-between"><span>MCP URL</span><span className="text-foreground">{it.url}</span></div>
              <div className="flex items-center justify-between"><span>审批模式</span><span className="text-foreground">{it.mode}</span></div>
              <div><span>描述</span><div className="text-foreground">{it.desc}</div></div>
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" />编辑</Button>
              <ConfirmDelete>
                <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 mr-1" />删除</Button>
              </ConfirmDelete>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

const HistorySection = () => {
  const rows = [
    { id: "c1", time: "2025-08-12 10:20", agent: "客服助手", msgs: 6, tokens: 1540, status: "成功", detail: [
      { role: 'user', text: '你好' },
      { role: 'assistant', text: '你好！有什么可以帮您？' },
    ] },
  ];
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="space-y-4">
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select>
            <SelectTrigger><SelectValue placeholder="选择 Agent" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="support">客服助手</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" />
          <Input type="date" />
          <Select>
            <SelectTrigger><SelectValue placeholder="状态筛选" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="fail">失败</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>会话ID</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>消息数</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <>
                <TableRow key={r.id} className="cursor-pointer" onClick={() => setOpen(open === r.id ? null : r.id)}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.time}</TableCell>
                  <TableCell>{r.agent}</TableCell>
                  <TableCell>{r.msgs}</TableCell>
                  <TableCell>{r.tokens}</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
                {open === r.id && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="space-y-2">
                        {r.detail.map((m, i) => (
                          <div key={i} className={`text-sm ${m.role === 'user' ? 'text-foreground' : 'text-muted-foreground'}`}>{m.role}: {m.text}</div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
};

const TestSection = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'tool'; text: string }[]>([
    { role: 'assistant', text: '你好，我是测试助手。' },
    { role: 'user', text: '帮我查询一下天气' },
    { role: 'tool', text: '调用 weather-api: city=Shanghai' },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput("");
  };

  return (
    <section className="space-y-4">
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select>
            <SelectTrigger className="md:col-span-1"><SelectValue placeholder="选择 Agent" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="support">客服助手</SelectItem>
            </SelectContent>
          </Select>
          <Input value="session-001" readOnly className="md:col-span-1" />
          <div className="md:col-span-1 flex justify-end">
            <Button variant="outline" size="sm">清空</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`${m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
            {m.role === 'tool' ? (
              <div className="max-w-[80%] border rounded-md px-3 py-2 bg-callout text-foreground">
                工具调用：{m.text}
              </div>
            ) : (
              <div className={`max-w-[80%] border rounded-md px-3 py-2 ${m.role === 'user' ? 'bg-background' : 'bg-muted'}`}>
                {m.text}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="输入消息..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
        <Button onClick={send}><Send className="h-4 w-4 mr-1" />发送</Button>
      </div>
    </section>
  );
};

const SettingsSection = () => {
  return (
    <section className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>名称</Label><Input placeholder="应用名称" /></div>
          <div className="space-y-2"><Label>状态</Label><div className="flex items-center gap-3"><Switch /><span className="text-sm text-muted-foreground">启用</span></div></div>
          <div className="space-y-2 md:col-span-2"><Label>描述</Label><Input placeholder="应用描述" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">API Key</CardTitle></CardHeader>
        <CardContent className="pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">API Key</span>
            <span className="font-mono">sk-************************</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText("sk-************************"); toast.success("已复制 API Key", { duration: 3000 }); }}>
              <Copy className="h-4 w-4 mr-1" /> 复制
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" /> 重新生成
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">API 配置</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>限流 (req/s)</Label><Input type="number" defaultValue={5} /></div>
          <div className="space-y-2"><Label>超时 (ms)</Label><Input type="number" defaultValue={120000} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base text-destructive">危险区域</CardTitle></CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">删除应用</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除？</AlertDialogTitle>
                <AlertDialogDescription>此操作不可撤销。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => toast.success('已删除', { duration: 3000 })}>删除</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>保存</Button>
      </div>
    </section>
  );
};

const ConfirmDelete: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确认删除？</AlertDialogTitle>
        <AlertDialogDescription>删除后不可恢复。</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction onClick={() => toast.success('删除成功', { duration: 3000 })}>删除</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default AppDetail;
