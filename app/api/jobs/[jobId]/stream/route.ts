import { getJobByIdAndUser } from "@/lib/job-store";
import { getQueuePosition } from "@/src/queue/imageQueue";
import { createClient } from "@/lib/supabase/server";

function encodeEvent(event: string, data: object) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(encodeEvent("error", { error: "请先登录" }), {
      status: 401,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const { jobId } = await params;

  if (!(await getJobByIdAndUser(jobId, user.id))) {
    return new Response(encodeEvent("error", { error: "任务不存在" }), {
      status: 404,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let previousProgress = -1;
      let previousStatus = "";
      let previousQueuePosition = -1;

      const interval = setInterval(async () => {
        const job = await getJobByIdAndUser(jobId, user.id);
        if (!job) {
          controller.enqueue(encoder.encode(encodeEvent("error", { error: "任务不存在" })));
          clearInterval(interval);
          controller.close();
          return;
        }

        const progressChanged = job.progress !== previousProgress;
        const statusChanged = job.status !== previousStatus;

        if (progressChanged || statusChanged) {
          previousProgress = job.progress;
          previousStatus = job.status;
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

        if (job.status === "pending" || job.status === "processing") {
          try {
            const queueInfo = await getQueuePosition(jobId);
            if (queueInfo.position !== previousQueuePosition) {
              previousQueuePosition = queueInfo.position;
              controller.enqueue(
                encoder.encode(encodeEvent("queue", queueInfo)),
              );
            }
          } catch (error) {
            console.error("[stream] 获取队列位置失败:", error);
          }
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
      }, 500);

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
