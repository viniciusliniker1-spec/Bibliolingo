import {
  CreateWebWorkerMLCEngine,
  type InitProgressReport,
  type MLCEngineInterface
} from "@mlc-ai/web-llm";

export const NOAH_MODEL = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

let engine: MLCEngineInterface | undefined;
let loading: Promise<MLCEngineInterface> | undefined;

export function supportsLocalNoah(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export function prepareLocalNoah(onProgress: (report: InitProgressReport) => void) {
  if (engine) return Promise.resolve(engine);
  if (!loading) {
    loading = CreateWebWorkerMLCEngine(
      new Worker(new URL("../features/noah/noah.worker.ts", import.meta.url), { type: "module" }),
      NOAH_MODEL,
      {
        initProgressCallback: onProgress,
        logLevel: "WARN"
      },
      { context_window_size: 2048 }
    ).then((loaded) => {
      engine = loaded;
      return loaded;
    }).catch((error) => {
      loading = undefined;
      throw error;
    });
  }
  return loading;
}

export function getLocalNoah() {
  return engine;
}
