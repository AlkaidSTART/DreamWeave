import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { GenerationJob, StoredImage, StoredJob } from "@/lib/types";

const DB_NAME = "dreamweave";
const DB_VERSION = 1;

interface DreamweaveDB extends DBSchema {
  jobs: {
    key: string;
    value: StoredJob;
    indexes: {
      "by-created-at": string;
      "by-status": string;
    };
  };
  images: {
    key: string;
    value: StoredImage;
    indexes: {
      "by-job-id": string;
    };
  };
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

async function openDatabase(): Promise<IDBPDatabase<DreamweaveDB>> {
  return openDB<DreamweaveDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("jobs")) {
        const jobStore = database.createObjectStore("jobs", { keyPath: "id" });
        jobStore.createIndex("by-created-at", "createdAt");
        jobStore.createIndex("by-status", "status");
      }
      if (!database.objectStoreNames.contains("images")) {
        const imageStore = database.createObjectStore("images", { keyPath: "id" });
        imageStore.createIndex("by-job-id", "jobId");
      }
    },
  });
}

async function withDB<T>(callback: (database: IDBPDatabase<DreamweaveDB>) => T): Promise<T> {
  if (!isBrowser()) {
    throw new Error("IndexedDB 仅在浏览器环境中可用");
  }
  const database = await openDatabase();
  try {
    return await callback(database);
  } finally {
    database.close();
  }
}

function buildStoredJob(job: GenerationJob): StoredJob {
  return {
    ...job,
    results: job.results.map((result) => ({
      ...result,
      jobId: job.id,
    })),
  };
}

export async function saveJob(job: GenerationJob): Promise<StoredJob> {
  const stored = buildStoredJob(job);
  return withDB(async (database) => {
    await database.put("jobs", stored);
    return stored;
  });
}

export async function getJobFromDB(jobId: string): Promise<StoredJob | undefined> {
  return withDB((database) => database.get("jobs", jobId));
}

export async function listJobsFromDB(
  limit = 50,
  offset = 0,
): Promise<StoredJob[]> {
  return withDB(async (database) => {
    const allJobs = await database.getAllFromIndex("jobs", "by-created-at");
    return allJobs.reverse().slice(offset, offset + limit);
  });
}

export async function saveImage(
  jobId: string,
  imageId: string,
  blob: Blob,
  metadata: Omit<StoredImage, "id" | "jobId" | "blob" | "objectUrl">,
): Promise<StoredImage> {
  const storedImage: StoredImage = {
    ...metadata,
    id: imageId,
    jobId,
    blob,
    objectUrl: URL.createObjectURL(blob),
  };

  return withDB(async (database) => {
    await database.put("images", storedImage);
    return storedImage;
  });
}

export async function getImageFromDB(imageId: string): Promise<StoredImage | undefined> {
  return withDB(async (database) => {
    const image = await database.get("images", imageId);
    if (image?.blob && !image.objectUrl) {
      image.objectUrl = URL.createObjectURL(image.blob);
    }
    return image;
  });
}

export async function getImagesByJobId(jobId: string): Promise<StoredImage[]> {
  return withDB(async (database) => {
    const images = await database.getAllFromIndex("images", "by-job-id", jobId);
    return images.map((image) => {
      if (image.blob && !image.objectUrl) {
        image.objectUrl = URL.createObjectURL(image.blob);
      }
      return image;
    });
  });
}

export async function deleteJobFromDB(jobId: string): Promise<void> {
  return withDB(async (database) => {
    const images = await database.getAllFromIndex("images", "by-job-id", jobId);
    await Promise.all([
      database.delete("jobs", jobId),
      ...images.map((image) => database.delete("images", image.id)),
    ]);
  });
}

export async function updateJobInDB(
  jobId: string,
  updates: Partial<Omit<StoredJob, "id" | "results">>,
): Promise<StoredJob | undefined> {
  return withDB(async (database) => {
    const existing = await database.get("jobs", jobId);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await database.put("jobs", updated);
    return updated;
  });
}
