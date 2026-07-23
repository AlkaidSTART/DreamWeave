import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { ResultView } from "@/components/result-view";
import { getJob } from "@/lib/api";
import { getGenerationSourceRoute } from "@/lib/generation-route";

interface ResultPageProps {
  params: Promise<{ jobId: string }>;
}

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${protocol}://${host}`;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { jobId } = await params;
  const baseUrl = await getBaseUrl();

  let job;
  try {
    job = await getJob(jobId, baseUrl);
  } catch {
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
