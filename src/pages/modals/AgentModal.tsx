import { ReactNode, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

type Agent = { id?: string; name?: string; model?: string; instruction?: string };

type Props = { children: ReactNode; agent?: Agent };

const mockTools = ["搜索", "翻译", "网页抓取", "数据库查询"];

const AgentModal = ({ children, agent }: Props) => {
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState<string[]>(mockTools);
  const [right, setRight] = useState<string[]>([]);
  const [temp, setTemp] = useState(0.7);
  const [topP, setTopP] = useState(0.9);

  useEffect(() => {
    if (agent) setRight(["搜索"]); // demo
  }, [agent]);

  const move = (from: string[], to: string[], setFrom: any, setTo: any, items: string[]) => {
    setFrom(from.filter(i => !items.includes(i)));
    setTo([...to, ...items.filter(i => !to.includes(i))]);
  };

  const [pickedLeft, setPickedLeft] = useState<string[]>([]);
  const [pickedRight, setPickedRight] = useState<string[]>([]);

  const onSave = () => {
    toast.success("保存成功", { duration: 3000 });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{agent ? "编辑 Agent" : "新建 Agent"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>名称</Label>
              <Input defaultValue={agent?.name} placeholder="例如：客服助手" />
            </div>
            <div className="space-y-2">
              <Label>模型</Label>
              <Select defaultValue={agent?.model || "gpt-4o"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                  <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
                  <SelectItem value="gpt-3.5">gpt-3.5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>指令</Label>
              <Textarea rows={6} placeholder="填写系统指令..." defaultValue={agent?.instruction} />
            </div>
          </div>

          <div className="space-y-3">
            <Label>工具选择</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="border rounded-md p-2 max-h-40 overflow-auto">
                {left.map(i => (
                  <div key={i} className={`px-2 py-1 cursor-pointer ${pickedLeft.includes(i) ? 'bg-muted' : ''}`} onClick={() => setPickedLeft(p => p.includes(i) ? p.filter(x=>x!==i) : [...p, i])}>{i}</div>
                ))}
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => move(left, right, setLeft, setRight, pickedLeft)}>→</Button>
                <Button variant="outline" size="sm" onClick={() => move(right, left, setRight, setLeft, pickedRight)}>←</Button>
              </div>
              <div className="border rounded-md p-2 max-h-40 overflow-auto">
                {right.map(i => (
                  <div key={i} className={`px-2 py-1 cursor-pointer ${pickedRight.includes(i) ? 'bg-muted' : ''}`} onClick={() => setPickedRight(p => p.includes(i) ? p.filter(x=>x!==i) : [...p, i])}>{i}</div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>温度（{temp.toFixed(2)}）</Label>
                <Slider value={[temp]} min={0} max={1} step={0.01} onValueChange={(v) => setTemp(v[0])} />
              </div>
              <div className="space-y-2">
                <Label>Top-P（{topP.toFixed(2)}）</Label>
                <Slider value={[topP]} min={0} max={1} step={0.01} onValueChange={(v) => setTopP(v[0])} />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={onSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgentModal;
