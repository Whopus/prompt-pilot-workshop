import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  MoreVertical,
  X,
  Download,
  Plus,
  Image as ImageIcon,
  File as FileIcon,
  ChevronUp,
  ChevronDown,
  ClipboardCopy,
  ExternalLink,
  User as UserIcon,
  Bot,
  Wrench,
  CheckCircle2,
  Database,
} from "lucide-react";
import { toast } from "sonner";

// Local type (mirrors DatasetDetail type)
export interface SessionRow {
  id: string;
  timestamp: string;
  agent: string;
  messages: number;
  tokens: number;
  duration: string;
  status: "completed" | "failed" | "processing";
}

interface SessionDetailPanelProps {
  session: SessionRow;
  onClose?: () => void;
}

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="text-sm">
    <span className="text-muted-foreground">{label}: </span>
    <span className="font-medium">{value}</span>
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground">
    {children}
  </span>
);

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{children}</div>;
}

function Divider({ strong = false }: { strong?: boolean }) {
  return <div className={strong ? "h-px bg-border" : "h-px bg-border/50"} />;
}

export default function SessionDetailPanel({ session, onClose }: SessionDetailPanelProps) {
  const [editMode, setEditMode] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const statusText = useMemo(() => {
    if (session.status === "completed") return "Completed";
    if (session.status === "failed") return "Failed";
    return "Processing";
  }, [session.status]);

  const shortId = useMemo(() => session.id.slice(0, 16), [session.id]);

  const handleExport = () => toast.success("导出开始", { duration: 2000 });

  return (
    <section className="p-4">
      {/* Header */}
      <header className="flex items-center justify-between mt-2 mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold">Session Timeline: {shortId}</h3>
          <div className="flex items-center gap-2">
            <Label htmlFor="edit-mode" className="text-sm">Edit Mode</Label>
            <Switch id="edit-mode" checked={editMode} onCheckedChange={setEditMode} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close session detail">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <Divider strong />

      {/* Meta */}
      <div className="grid grid-cols-1 gap-1 py-3 md:grid-cols-2 mb-5 md:mb-7">
        <div className="flex flex-wrap items-center gap-3">
          <MetaRow label="Agent" value={session.agent || "-"} />
          <Pill>Model: GPT-4</Pill>
          <MetaRow label="Duration" value={session.duration} />
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <MetaRow label="Messages" value={String(session.messages)} />
          <MetaRow label="Tokens" value={session.tokens.toLocaleString()} />
          <Pill>Status: {statusText}</Pill>
        </div>
      </div>



      {/* Timeline container */}
      <div>
        {/* USER item 1 */}
        <TimelineItem time="10:23:45" role="USER" editable={editMode}>
          <BlockText title="Block 1: Text" editable={editMode} defaultValue="你好，我需要帮助处理订单 #12345" />
          {editMode && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Add Text</Button>
              <Button variant="outline" size="sm"><ImageIcon className="h-3.5 w-3.5 mr-1" /> Add Image</Button>
              <Button variant="outline" size="sm"><FileIcon className="h-3.5 w-3.5 mr-1" /> Add File</Button>
            </div>
          )}
        </TimelineItem>


        {/* ASSISTANT item */}
        <TimelineItem time="10:23:46" role="ASSISTANT" editable={editMode}>
          <BlockText
            title="Text"
            editable={editMode}
            defaultValue="好的，我来帮您查看该订单的状态。"
          />
        </TimelineItem>

        <Divider />

        {/* USER item 2 with multiple blocks */}
        <TimelineItem time="10:23:50" role="USER" editable={editMode}>
          <BlockText title="Block 1: Text" editable={editMode} defaultValue="这是我的收据" />
          <BlockImage title="Block 2: Image" editable={editMode} filename="receipt.jpg" />
          <BlockText title="Block 3: Text" editable={editMode} defaultValue="可以帮我处理退款吗？" />
          {editMode && (
            <div className="mt-2">
              <Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Add Block</Button>
            </div>
          )}
        </TimelineItem>

        <Divider />

        {/* TOOL_CALL */}
        <TimelineItem time="10:23:51" role="TOOL_CALL" editable={editMode}>
          <div className="text-sm font-medium">Function: get_order_status</div>
          <BlockCode
            title="Parameters"
            language="json"
            editable={editMode}
            defaultValue={`{\n  "order_id": "12345",\n  "include_details": true\n}`}
          />
          {editMode && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Re-run</Button>
              <Button variant="outline" size="sm">Edit Parameters</Button>
            </div>
          )}
        </TimelineItem>

        <Divider />

        {/* TOOL_RESPONSE */}
        <TimelineItem time="10:23:52" role="TOOL_RESPONSE" editable={editMode}>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Pill>✓ Success</Pill>
            <Pill>Duration: 245ms</Pill>
          </div>
          <BlockCode
            title="Response"
            language="json"
            editable={editMode}
            defaultValue={`{\n  "status": "shipped",\n  "tracking": "FDX123456789",\n  "eta": "2024-01-15"\n}`}
          />
          {editMode && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Mock Different Response</Button>
            </div>
          )}
        </TimelineItem>

        <Divider />

        {/* MCP_REQUEST */}
        <TimelineItem time="10:24:00" role="MCP_REQUEST" editable={editMode}>
          <div className="text-sm">Service: Database Query</div>
          <div className="text-sm">Operation: get_customer_history</div>
          <Pill>⏳ Awaiting Approval</Pill>
          <BlockCode
            title="Request"
            language="json"
            editable={editMode}
            defaultValue={`{\n  "customer_id": "cust_123",\n  "date_range": "last_30_days"\n}`}
          />
          {editMode && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Approve</Button>
              <Button variant="outline" size="sm">Deny</Button>
              <Button variant="outline" size="sm">Auto-Approve</Button>
            </div>
          )}
        </TimelineItem>

        <Divider />

        {/* MCP_APPROVAL */}
        <TimelineItem time="10:24:01" role="MCP_APPROVAL" editable={editMode}>
          <div className="text-sm">✅ APPROVED by system</div>
          <div className="text-xs text-muted-foreground">Note: Auto-approved for read-only</div>
        </TimelineItem>

        <Divider />

        {/* MCP_RESPONSE */}
        <TimelineItem time="10:24:02" role="MCP_RESPONSE" editable={editMode}>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Pill>✓ Success</Pill>
            <Pill>Records: 15</Pill>
          </div>
          <BlockCode
            title="Response"
            language="json"
            editable={editMode}
            defaultValue={`{\n  "orders": [\n    /* ... */\n  ],\n  "total_spent": 1234.56\n}`}
          />
          {editMode && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">View Full Data</Button>
              <Button variant="outline" size="sm">Export</Button>
            </div>
          )}
        </TimelineItem>
      </div>

      {/* Insert message */}
      <div className="mt-3">
        <Button variant="outline" size="sm">+ Insert Message Here</Button>
      </div>
    </section>
  );
}

function TimelineItem({
  time,
  role,
  children,
  editable,
}: {
  time: string;
  role: string;
  editable: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="grid grid-cols-[28px_1fr] gap-3 py-3">
      <div className="relative">
        <span className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-border/60" aria-hidden="true" />
        <span className="absolute left-1/2 -translate-x-1/2 top-2 z-10 grid h-5 w-5 place-items-center rounded-full border border-border bg-transparent text-primary">
          {role === "USER" && <UserIcon className="h-3.5 w-3.5" />}
          {role === "ASSISTANT" && <Bot className="h-3.5 w-3.5" />}
          {role === "TOOL_CALL" && <Wrench className="h-3.5 w-3.5" />}
          {role === "TOOL_RESPONSE" && <CheckCircle2 className="h-3.5 w-3.5" />}
          {role.startsWith("MCP") && <Database className="h-3.5 w-3.5" />}
          {!["USER","ASSISTANT","TOOL_CALL","TOOL_RESPONSE"].includes(role) && !role.startsWith("MCP") && (
            <UserIcon className="h-3.5 w-3.5" />
          )}
        </span>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{time}</span>
            <div className="text-sm font-semibold tracking-wide">{role}</div>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Block actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.success("打开详情")}>打开详情</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {navigator.clipboard.writeText(time + " " + role); toast.success("已复制");}}>
                  复制摘要
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" aria-label="Remove block" onClick={() => toast.success("已删除块") }>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3">{children}</div>
        {editable && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <ChevronUp className="h-3.5 w-3.5" /> Move Up
            <ChevronDown className="h-3.5 w-3.5" /> Move Down
          </div>
        )}
      </div>
    </article>
  );
}

function BlockText({ title, editable, defaultValue }: { title: string; editable: boolean; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <div className="rounded-md border bg-background">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <SectionTitle>{title}</SectionTitle>
        <Button variant="ghost" size="icon" aria-label="Delete text block" onClick={() => toast.success("删除文本块") }>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-3">
        {editable ? (
          <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{value}</p>
        )}
      </div>
    </div>
  );
}

function BlockImage({ title, editable, filename }: { title: string; editable: boolean; filename?: string }) {
  return (
    <div className="rounded-md border bg-background">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <SectionTitle>{title}</SectionTitle>
        <Button variant="ghost" size="icon" aria-label="Delete image block" onClick={() => toast.success("删除图片块") }>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-16 w-24 overflow-hidden rounded bg-muted">
            <img
              src="/placeholder.svg"
              alt="receipt image preview"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="text-sm text-muted-foreground">{filename ?? "image.jpg"}</div>
        </div>
        {editable && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Replace</Button>
            <Button variant="outline" size="sm">View</Button>
            <Button variant="outline" size="sm">Download</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function BlockCode({ title, editable, language, defaultValue }: { title: string; editable: boolean; language?: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <div className="rounded-md border bg-background">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <SectionTitle>{title}</SectionTitle>
        <Button variant="ghost" size="icon" aria-label="Delete code block" onClick={() => toast.success("删除代码块") }>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-3">
        {editable ? (
          <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={6} className="font-mono text-xs" />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-xs">{value}</pre>
        )}
      </div>
    </div>
  );
}
