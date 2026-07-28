import { pipeline, type FeatureExtractionPipeline, type Tensor } from "@huggingface/transformers";

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_ID);
  }
  return extractorPromise;
}

/**
 * Embeds a batch of texts in a single forward pass through a small
 * (~90MB, browser-cached after first load) sentence-embedding model.
 * Returns one L2-normalized vector per input text, in the same order.
 */
export async function embedBatch(texts: string[]): Promise<Float32Array[]> {
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
  return vectors;
}
