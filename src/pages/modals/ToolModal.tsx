import { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Tool = { id?: string; name?: string; method?: string; endpoint?: string; desc?: string };

type Props = { children: ReactNode; tool?: Tool };

const ToolModal = ({ children, tool }: Props) => {
  const [open, setOpen] = useState(false);

  const onSave = () => {
    toast.success("保存成功", { duration: 3000 });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tool ? "编辑工具" : "新建工具"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>名称</Label><Input defaultValue={tool?.name} /></div>
          <div className="space-y-2"><Label>端点 URL</Label><Input defaultValue={tool?.endpoint} placeholder="https://api.example.com/xxx" /></div>
          <div className="space-y-2"><Label>方法</Label>
            <Select defaultValue={tool?.method || "GET"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2"><Label>描述</Label><Textarea rows={3} defaultValue={tool?.desc} /></div>
          <div className="space-y-2 md:col-span-2"><Label>JSON Schema</Label><Textarea rows={6} placeholder={'{\n  "type": "object"\n}'} /></div>
          <div className="space-y-2 md:col-span-2"><Label>请求头（key:value 每行一条）</Label><Textarea rows={3} placeholder="Authorization: Bearer xxx" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={onSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ToolModal;
