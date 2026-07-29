import { pipeline, type FeatureExtractionPipeline, type Tensor } from "@huggingface/transformers";

// Runs entirely off the main thread - model download, WASM/WebGPU
// initialization, and inference are all measurably main-thread-blocking
// (verified: a cold model load produced a single ~7 second blocking task),
// so this must never execute in the page's own JS thread.

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_ID);
  }
  return extractorPromise;
}

interface EmbedRequest {
  id: number;
  texts: string[];
}

// Typed narrowly against just what's used, to avoid pulling in the
// WebWorker lib globally (this project's tsconfig targets "dom", and mixing
// "dom" + "webworker" libs project-wide causes conflicting global types).
interface WorkerScope {
  onmessage: ((event: MessageEvent<EmbedRequest>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
}

const workerSelf = self as unknown as WorkerScope;

workerSelf.onmessage = async (event) => {
  const { id, texts } = event.data;
  try {
    const extractor = await getExtractor();
    const output = (await extractor(texts, {
      pooling: "mean",
      normalize: true,
    })) as Tensor;

    const hiddenSize = output.dims[output.dims.length - 1];
    const data = output.data as Float32Array;

    const vectors: Float32Array[] = [];
    for (let i = 0; i < texts.length; i++) {
      vectors.push(data.slice(i * hiddenSize, (i + 1) * hiddenSize));
    }

    // Transfer the underlying buffers back rather than structured-cloning
    // them, avoiding an extra copy of the (small but nonzero) vector data.
    workerSelf.postMessage(
      { id, vectors },
      vectors.map((v) => v.buffer),
    );
  } catch (err) {
    workerSelf.postMessage({
      id,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
