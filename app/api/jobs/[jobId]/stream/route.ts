import { getJobById } from "@/lib/job-store";

function encodeEvent(event: string, data: object) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  if (!getJobById(jobId)) {
    return new Response(encodeEvent("error", { error: "任务不存在" }), {
      status: 404,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let previousProgress = -1;

      const interval = setInterval(() => {
        const job = getJobById(jobId);
        if (!job) {
          controller.enqueue(encoder.encode(encodeEvent("error", { error: "任务不存在" })));
          clearInterval(interval);
          controller.close();
          return;
        }

        if (job.progress !== previousProgress || job.status !== "processing") {
          previousProgress = job.progress;
          controller.enqueue(
            encoder.encode(
              encodeEvent("progress", {
                progress: job.progress,
                status: job.status,
                results: job.results,
              }),
            ),
          );
        }

        if (job.status === "completed") {
          controller.enqueue(encoder.encode(encodeEvent("complete", job)));
          clearInterval(interval);
          controller.close();
        } else if (job.status === "failed") {
          controller.enqueue(
            encoder.encode(encodeEvent("error", { error: job.error || "生成失败" })),
          );
          clearInterval(interval);
          controller.close();
        }
      }, 400);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
