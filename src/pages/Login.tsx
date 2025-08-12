import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("登录成功", { duration: 3000 });
    navigate("/apps");
  };

  return (
    <>
      <Helmet>
        <title>AIgents — 登录</title>
        <meta name="description" content="登录 AIgents 管理控制台" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <main className="min-h-screen grid place-items-center">
        <Card className="w-full max-w-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl">AIgents</CardTitle>
            <p className="text-sm text-muted-foreground">极简 Agent 管理面板</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">登录</Button>
              <p className="text-xs text-muted-foreground text-center">
                还没有账号？<Link to="#" className="underline ml-1">注册</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Login;
