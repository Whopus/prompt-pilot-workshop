import { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Props = { children: ReactNode };

const NewAppModal = ({ children }: Props) => {
  const [open, setOpen] = useState(false);

  const onCreate = () => {
    toast.success("创建成功", { duration: 3000 });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新建应用</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>应用名称</Label>
            <Input placeholder="例如：客服助手" />
          </div>
          <div className="space-y-2">
            <Label>描述</Label>
            <Input placeholder="应用用途说明" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={onCreate}>创建</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppModal;
