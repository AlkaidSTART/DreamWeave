import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { ResultView } from "@/components/result-view";
import { getJobByIdAndUser } from "@/lib/job-store";
import { getGenerationSourceRoute } from "@/lib/generation-route";
import { createClient } from "@/lib/supabase/server";

interface ResultPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { jobId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const job = await getJobByIdAndUser(jobId, user.id);

  if (!job) {
    notFound();
  }

  return (
    <PageShell
      title="生成结果"
      description="查看生成进度并下载你喜欢的图片"
      backHref={getGenerationSourceRoute(job.type)}
      className="pb-20"
    >
      <ResultView initialJob={job} />
    </PageShell>
  );
}
