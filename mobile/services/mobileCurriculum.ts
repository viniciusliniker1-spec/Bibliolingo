type MobileCurriculum = typeof import("../../src/content/catalog");

let curriculumPromise: Promise<MobileCurriculum> | null = null;

export function loadMobileCurriculum() {
  if (curriculumPromise) return curriculumPromise;
  const startedAt = globalThis.performance?.now?.() ?? Date.now();
  curriculumPromise = import("../../src/content/catalog")
    .then((catalog) => {
      const elapsed = (globalThis.performance?.now?.() ?? Date.now()) - startedAt;
      console.info("[BibliolingoPerf] curriculum_catalog_ms=" + Math.round(elapsed));
      return catalog;
    })
    .catch((error) => {
      curriculumPromise = null;
      throw error;
    });
  return curriculumPromise;
}
