import { Helmet } from "react-helmet-async";
import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Edit, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

const DatasetDetail = () => {
  const navigate = useNavigate();
  const { id, datasetId } = useParams<{ id: string; datasetId: string }>();

  const records = [
    { key: "question", value: "如何重置密码？" },
    { key: "answer", value: "在设置-安全中选择重置密码，按照提示完成。" },
    { key: "tags", value: "账号,安全,密码" },
  ];

  return (
    <>
      <Helmet>
        <title>AIgents — 数据集详情</title>
        <meta name="description" content="查看与管理数据集详情、筛选与编辑数据。" />
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="text-muted-foreground">所属应用</div>
              <div className="text-foreground">#{id}</div>
            </div>
            <div className="space-y-2">
              <div className="text-muted-foreground">数据集ID</div>
              <div className="text-foreground">{datasetId}</div>
            </div>
            <div className="space-y-2">
              <div className="text-muted-foreground">操作</div>
              <div className="flex gap-2">
                <Button size="sm">新增条目</Button>
                <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" />编辑设置</Button>
                <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 mr-1" />删除数据集</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">数据预览与筛选</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="搜索关键词…" />
              <Input placeholder="标签过滤（逗号分隔）" />
              <div className="flex md:justify-end gap-2">
                <Button variant="outline" size="sm">重置</Button>
                <Button size="sm">查询</Button>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>字段</TableHead>
                    <TableHead>值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.key}</TableCell>
                      <TableCell className="text-muted-foreground">{r.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Link to={`/apps/${id}/history`}>
                <Button variant="outline" size="sm">返回数据集列表</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default DatasetDetail;
