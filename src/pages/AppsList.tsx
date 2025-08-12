import { Helmet } from "react-helmet-async";
import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusDot from "@/components/common/StatusDot";
import { Link } from "react-router-dom";
import NewAppModal from "@/pages/modals/NewAppModal";

const sampleApps = [
  { id: "1", name: "客服助手", agents: 4, tools: 6, mcps: 2, datasets: 3, status: "active" as const },
  { id: "2", name: "分析机器人", agents: 2, tools: 3, mcps: 1, datasets: 1, status: "idle" as const },
  { id: "3", name: "内容生成", agents: 3, tools: 5, mcps: 2, datasets: 4, status: "active" as const },
  { id: "4", name: "监控预警", agents: 1, tools: 2, mcps: 0, datasets: 2, status: "error" as const },
];

const AppsList = () => {
  return (
    <>
      <Helmet>
        <title>AIgents — 我的应用</title>
        <meta name="description" content="查看和管理你的 AI 应用列表" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <AppHeader />
      <main className="container pt-20 pb-16 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">我的应用</h1>
          <NewAppModal>
            <Button>新建</Button>
          </NewAppModal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleApps.map((app) => (
            <Card key={app.id} className="shadow-none hover:bg-accent/30 transition-colors duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                <CardTitle className="text-base font-semibold">{app.name}</CardTitle>
                <StatusDot status={app.status} />
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground p-4 pt-0">
                <div className="flex items-center justify-between py-0.5">
                  <span>Agents</span>
                  <span className="text-foreground font-medium">{app.agents}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span>Tools</span>
                  <span className="text-foreground font-medium">{app.tools}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span>MCPs</span>
                  <span className="text-foreground font-medium">{app.mcps ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span>Datasets</span>
                  <span className="text-foreground font-medium">{app.datasets ?? 0}</span>
                </div>
                <div className="mt-3 rounded-md p-2.5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-foreground/90">今日：会话 12 · Token 45k</div>
                    <div className="text-foreground/90 text-right">总计：会话 12 · Token 45k</div>
                  </div>
                </div>
                <div className="pt-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/apps/${app.id}/agents`}>进入</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 border rounded-md p-4 text-sm text-muted-foreground">
          今日统计：会话 12 · Token 45k · 错误 0
        </div>
      </main>
    </>
  );
};

export default AppsList;
