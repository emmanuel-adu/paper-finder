// The actual model work happens in embedder.worker.ts, off the main thread -
// a cold model load measurably blocked the main thread for ~7 seconds when
// run in-page, freezing all input (typing, clicking, everything) for the
// duration. This file just manages the worker and speaks its request/
// response protocol; embedBatch's signature is unchanged so callers
// (rerank.ts) don't need to know a worker is involved.

interface PendingRequest {
  resolve: (vectors: Float32Array[]) => void;
  reject: (error: Error) => void;
}

interface EmbedResponse {
  id: number;
  vectors?: Float32Array[];
  error?: string;
}

let worker: Worker | null = null;
let nextRequestId = 0;
const pending = new Map<number, PendingRequest>();

function getWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(new URL("./embedder.worker.ts", import.meta.url));

  worker.onmessage = (event: MessageEvent<EmbedResponse>) => {
    const { id, vectors, error } = event.data;
    const request = pending.get(id);
    if (!request) return;
    pending.delete(id);

    if (error) {
      request.reject(new Error(error));
    } else {
      request.resolve(vectors ?? []);
    }
  };

  worker.onerror = () => {
    for (const [id, request] of pending) {
      request.reject(new Error("Embedding worker failed to run"));
      pending.delete(id);
    }
  };

  return worker;
}

/**
 * Embeds a batch of texts in a single forward pass through a small
 * (~90MB, browser-cached after first load) sentence-embedding model,
 * running entirely in a background Web Worker. Returns one L2-normalized
 * vector per input text, in the same order.
 */
export function embedBatch(texts: string[]): Promise<Float32Array[]> {
  return new Promise((resolve, reject) => {
    const id = nextRequestId++;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, texts });
  });
}
