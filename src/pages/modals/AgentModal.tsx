import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

import { toast } from "sonner";

// --- Types ---

type Agent = {
  id?: string;
  name?: string;
  model?: string;
  instruction?: string;
  description?: string;
};

type Props = { children: ReactNode; agent?: Agent };

type Tool = {
  id: string;
  name: string;
  api: string;
  description: string;
};

type MCP = {
  id: string;
  name: string;
  description: string;
};

// --- Mock Data ---

const allTools: Tool[] = [
  { id: "search", name: "搜索", api: "GET /search", description: "通用网页搜索能力" },
  { id: "translate", name: "翻译", api: "POST /translate", description: "多语言互译" },
  { id: "scrape", name: "网页抓取", api: "POST /scrape", description: "抓取网页并提取正文" },
  { id: "db", name: "数据库查询", api: "POST /db/query", description: "执行受限的只读 SQL" },
];

const allMCPs: MCP[] = [
  { id: "notion", name: "Notion MCP", description: "读取团队知识库" },
  { id: "github", name: "GitHub MCP", description: "读取代码仓库只读信息" },
  { id: "slack", name: "Slack MCP", description: "发送/读取频道消息（需授权）" },
];

const modelOptions = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-turbo", label: "GPT-4-Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5-Turbo" },
  { value: "claude-3", label: "Claude-3" },
  { value: "custom", label: "Custom" },
];

const templates: Record<string, string> = {
  "客服模板": `你是一名专业的客服助手。\n- 用简洁友好的语气回复\n- 主动提供相关帮助链接\n- 必要时引导用户提交工单`,
  "销售助手模板": `你是一名销售助理。\n- 了解客户需求\n- 推荐合适的产品套餐\n- 记录销售线索`,
  "技术支持模板": `你是技术支持工程师。\n- 复现问题\n- 提供详细操作步骤\n- 标注环境与版本信息`,
};

// --- Component ---

const AgentModal = ({ children, agent }: Props) => {
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState(agent?.name || "");
  const [model, setModel] = useState(agent?.model || modelOptions[0].value);
  const [description, setDescription] = useState(agent?.description || "");
  const [instructions, setInstructions] = useState(agent?.instruction || "");

  const [temperature, setTemperature] = useState(0.7); // 0 - 2
  const [topP, setTopP] = useState(1.0); // 0 - 1
  const [maxTokens, setMaxTokens] = useState<number>(2048);

  // Advanced
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [responseFormat, setResponseFormat] = useState("auto");
  const [toolResources, setToolResources] = useState("{}");
  const [toolResourcesError, setToolResourcesError] = useState<string | null>(null);

  // Tools state (with search and selection)
  const [availableTools, setAvailableTools] = useState<Tool[]>(allTools);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [toolSearch, setToolSearch] = useState("");
  const [pickedAvailableToolIds, setPickedAvailableToolIds] = useState<string[]>([]);
  const [pickedSelectedToolIds, setPickedSelectedToolIds] = useState<string[]>([]);

  // MCP state
  const [availableMCPs, setAvailableMCPs] = useState<MCP[]>(allMCPs);
  const [selectedMCPs, setSelectedMCPs] = useState<MCP[]>([]);
  const [mcpSearch, setMcpSearch] = useState("");
  const [pickedAvailableMcpIds, setPickedAvailableMcpIds] = useState<string[]>([]);
  const [pickedSelectedMcpIds, setPickedSelectedMcpIds] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize when editing
  useEffect(() => {
    if (agent) {
      setSelectedTools([allTools[0]]); // demo preset
      setSelectedMCPs([]);
    }
  }, [agent]);

  // Change tracking
  useEffect(() => {
    setHasChanges(true);
  }, [name, model, description, instructions, temperature, topP, maxTokens, responseFormat, toolResources, selectedTools, selectedMCPs]);

  // Filtered lists
  const filteredAvailableTools = useMemo(
    () => availableTools.filter((t) => t.name.toLowerCase().includes(toolSearch.toLowerCase())),
    [availableTools, toolSearch]
  );
  const filteredAvailableMCPs = useMemo(
    () => availableMCPs.filter((m) => m.name.toLowerCase().includes(mcpSearch.toLowerCase())),
    [availableMCPs, mcpSearch]
  );

  // Validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name || name.trim().length < 3) e.name = "名称至少 3 个字符";
    if (!model) e.model = "请选择模型";
    try {
      JSON.parse(toolResources || "{}");
      setToolResourcesError(null);
    } catch (err) {
      setToolResourcesError("JSON 无效");
      e.toolResources = "JSON 无效";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Transfer helpers
  const moveTools = (ids: string[], from: Tool[], to: Tool[], setFrom: any, setTo: any) => {
    if (!ids.length) return;
    const moving = from.filter((t) => ids.includes(t.id));
    setFrom(from.filter((t) => !ids.includes(t.id)));
    setTo([...to, ...moving.filter((m) => !to.some((x: Tool) => x.id === m.id))]);
    setPickedAvailableToolIds([]);
    setPickedSelectedToolIds([]);
  };
  const moveAllTools = (dir: "toSelected" | "toAvailable") => {
    if (dir === "toSelected") {
      setSelectedTools((prev) => [...prev, ...availableTools.filter((t) => !prev.some((x) => x.id === t.id))]);
      setAvailableTools([]);
    } else {
      setAvailableTools((prev) => [...prev, ...selectedTools.filter((t) => !prev.some((x) => x.id === t.id))]);
      setSelectedTools([]);
    }
    setPickedAvailableToolIds([]);
    setPickedSelectedToolIds([]);
  };

  const moveMCPs = (ids: string[], from: MCP[], to: MCP[], setFrom: any, setTo: any) => {
    if (!ids.length) return;
    const moving = from.filter((m) => ids.includes(m.id));
    setFrom(from.filter((m) => !ids.includes(m.id)));
    setTo([...to, ...moving.filter((m) => !to.some((x: MCP) => x.id === m.id))]);
    setPickedAvailableMcpIds([]);
    setPickedSelectedMcpIds([]);
  };
  const moveAllMCPs = (dir: "toSelected" | "toAvailable") => {
    if (dir === "toSelected") {
      setSelectedMCPs((prev) => [...prev, ...availableMCPs.filter((m) => !prev.some((x) => x.id === m.id))]);
      setAvailableMCPs([]);
    } else {
      setAvailableMCPs((prev) => [...prev, ...selectedMCPs.filter((m) => !prev.some((x) => x.id === m.id))]);
      setSelectedMCPs([]);
    }
    setPickedAvailableMcpIds([]);
    setPickedSelectedMcpIds([]);
  };

  const onInsertTemplate = (key: keyof typeof templates) => {
    const text = templates[key];
    setInstructions((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const onSave = async () => {
    if (!validate()) {
      toast.error("请修正表单错误后再保存");
      return;
    }
    setIsSaving(true);
    try {
      // TODO: 接入后端 API（创建/更新 Agent）
      await new Promise((r) => setTimeout(r, 600));
      toast.success("保存成功", { duration: 2000 });
      setOpen(false);
      setHasChanges(false);
    } catch (e) {
      toast.error("保存失败，请稍后重试");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!agent) return;
    const ok = window.confirm("确定要删除该 Agent 吗？该操作不可撤销。");
    if (!ok) return;
    // TODO: 调用删除 API
    toast.success("已删除 Agent");
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (open && !next) {
      // closing
      if (hasChanges) {
        const ok = window.confirm("有未保存的更改，确认关闭？");
        if (!ok) return;
      }
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto scrollbar-thin-dark">
        <DialogHeader>
          <DialogTitle>{agent ? "配置 Agent" : "新建 Agent"}</DialogTitle>
          <DialogDescription className="sr-only">
            配置智能体的基础信息、指令、参数与工具集成
          </DialogDescription>
        </DialogHeader>

        {/* Basic Information */}
        <section className="space-y-4 pt-2">
          <h3 className="text-sm font-medium text-muted-foreground pb-2 border-b">基础信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Agent 名称</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 100))}
                placeholder="例如：客服助手"
                maxLength={100}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>模型</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.model && (
                <p className="text-xs text-destructive">{errors.model}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>描述</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="帮助他人理解该 Agent 的职责"
                maxLength={500}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>系统指令</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onInsertTemplate("客服模板")}>
                    客服模板
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onInsertTemplate("销售助手模板")}>
                    销售助手模板
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onInsertTemplate("技术支持模板")}>
                    技术支持模板
                  </Button>
                </div>
              </div>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="输入详细的系统指令..."
                rows={8}
                className="font-mono"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>建议包含角色、风格、边界等细节</span>
                <span>{instructions.length.toLocaleString()} 字符</span>
              </div>
            </div>
          </div>
        </section>




        {/* Parameters */}
        <section className="space-y-5 mt-6">
          <h3 className="text-sm font-medium text-muted-foreground pb-2 border-b">高级参数</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>温度（创造力）</Label>
                <Input
                  className="w-20 h-8"
                  type="number"
                  value={temperature}
                  min={0}
                  max={2}
                  step={0.1}
                  onChange={(e) => setTemperature(Math.max(0, Math.min(2, Number(e.target.value) || 0)))}
                />
              </div>
              <Slider value={[temperature]} min={0} max={2} step={0.1} onValueChange={(v) => setTemperature(v[0])} />
              <p className="text-xs text-muted-foreground">更低更专注，更高更有创造性</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Top-P（聚焦）</Label>
                <Input
                  className="w-20 h-8"
                  type="number"
                  value={topP}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(e) => setTopP(Math.max(0, Math.min(1, Number(e.target.value) || 0)))}
                />
              </div>
              <Slider value={[topP]} min={0} max={1} step={0.05} onValueChange={(v) => setTopP(v[0])} />
              <p className="text-xs text-muted-foreground">控制输出多样性</p>
            </div>
            <div className="space-y-2">
              <Label>响应格式</Label>
              <Select value={responseFormat} onValueChange={setResponseFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="json_object">JSON Object</SelectItem>
                  <SelectItem value="json_schema">JSON Schema</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>最大响应 Tokens</Label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Math.max(1, Math.min(4096, Number(e.target.value) || 1)))}
                min={1}
                max={4096}
              />
              <p className="text-xs text-muted-foreground">每次响应的最大长度</p>
            </div>
          </div>
        </section>




        {/* Tools & Integrations */}
        <section className="space-y-4 mt-6">
          <h3 className="text-sm font-medium text-muted-foreground pb-2 border-b">工具与集成</h3>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
            <div className="space-y-2">
              <Input placeholder="搜索可用工具" value={toolSearch} onChange={(e) => setToolSearch(e.target.value)} />
              <div className="border rounded-md p-2 h-56 overflow-auto scrollbar-thin-dark">
                {filteredAvailableTools.map((t) => (
                  <label key={t.id} className="block px-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={pickedAvailableToolIds.includes(t.id)}
                      onChange={(e) =>
                        setPickedAvailableToolIds((prev) =>
                          e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                        )
                      }
                    />
                    <div className="inline-block align-top">
                      <div className="font-medium text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">API: {t.api}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => moveTools(pickedAvailableToolIds, availableTools, selectedTools, setAvailableTools, setSelectedTools)}>→</Button>
                <Button variant="outline" size="sm" onClick={() => moveTools(pickedSelectedToolIds, selectedTools, availableTools, setSelectedTools, setAvailableTools)}>←</Button>
                <Button variant="outline" size="sm" onClick={() => moveAllTools("toSelected")}>⇒</Button>
                <Button variant="outline" size="sm" onClick={() => moveAllTools("toAvailable")}>⇐</Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">已选择工具</span>
              </div>
              <div className="border rounded-md p-2 h-56 overflow-auto scrollbar-thin-dark">
                {selectedTools.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    暂时没有配置任何工具
                  </div>
                ) : (
                  selectedTools.map((t, idx) => (
                    <label key={t.id} className="block px-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={pickedSelectedToolIds.includes(t.id)}
                        onChange={(e) =>
                          setPickedSelectedToolIds((prev) =>
                            e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                          )
                        }
                      />
                      <div className="inline-block align-top">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-xs">{idx + 1}</span>
                          {t.name}
                        </div>
                        <div className="text-xs text-muted-foreground">API: {t.api}</div>
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        

        {/* MCPs */}
        <section className="space-y-4 mt-6">
          <h3 className="text-sm font-medium text-muted-foreground pb-2 border-b">MCP 服务</h3>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
            <div className="space-y-2">
              <Input placeholder="搜索 MCP" value={mcpSearch} onChange={(e) => setMcpSearch(e.target.value)} />
              <div className="border rounded-md p-2 max-h-56 overflow-auto scrollbar-thin-dark">
                {filteredAvailableMCPs.map((m) => (
                  <label key={m.id} className="block px-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={pickedAvailableMcpIds.includes(m.id)}
                      onChange={(e) =>
                        setPickedAvailableMcpIds((prev) =>
                          e.target.checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)
                        )
                      }
                    />
                    <div className="inline-block align-top">
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => moveMCPs(pickedAvailableMcpIds, availableMCPs, selectedMCPs, setAvailableMCPs, setSelectedMCPs)}>→</Button>
                <Button variant="outline" size="sm" onClick={() => moveMCPs(pickedSelectedMcpIds, selectedMCPs, availableMCPs, setSelectedMCPs, setAvailableMCPs)}>←</Button>
                <Button variant="outline" size="sm" onClick={() => moveAllMCPs("toSelected")}>⇒</Button>
                <Button variant="outline" size="sm" onClick={() => moveAllMCPs("toAvailable")}>⇐</Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">已选择 MCP</span>
              </div>
              <div className="border rounded-md p-2 max-h-56 overflow-auto scrollbar-thin-dark">
                {selectedMCPs.map((m, idx) => (
                  <label key={m.id} className="block px-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={pickedSelectedMcpIds.includes(m.id)}
                      onChange={(e) =>
                        setPickedSelectedMcpIds((prev) =>
                          e.target.checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)
                        )
                      }
                    />
                    <div className="inline-block align-top">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-xs">{idx + 1}</span>
                        {m.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{m.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            {agent && (
              <Button variant="destructive" onClick={onDelete} disabled={isSaving}>
                删除
              </Button>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (hasChanges) {
                  const ok = window.confirm("有未保存的更改，确认关闭？");
                  if (!ok) return;
                }
                setOpen(false);
              }}
              disabled={isSaving}
            >
              取消
            </Button>
            <Button onClick={onSave} disabled={isSaving || Object.keys(errors).length > 0}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentModal;
