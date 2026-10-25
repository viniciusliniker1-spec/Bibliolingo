import type { ContentLayer } from "../types/content";

export const CONTENT_LAYER_LABELS: Record<ContentLayer, string> = {
  "biblical-text": "Texto bíblico",
  history: "Contexto histórico",
  theology: "Interpretação",
  application: "Aplicação"
};

export function contentLayerLabel(layer: ContentLayer) {
  return CONTENT_LAYER_LABELS[layer];
}
