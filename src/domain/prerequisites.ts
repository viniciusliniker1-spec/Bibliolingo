export type PrerequisiteGraph = Readonly<Record<string, readonly string[]>>;

/**
 * Dependências explícitas da trilha de Grego, derivadas da progressão curricular
 * publicada. Não são inferidas por semelhança textual e não alteram desbloqueios.
 */
export const CURATED_PREREQUISITES: PrerequisiteGraph = {
  "greek-cases": ["greek-alphabet"],
  "greek-sounds": ["greek-alphabet"],
  "greek-diacritics": ["greek-alphabet"],
  "greek-vowels": ["greek-sounds"],
  "greek-diphthongs": ["greek-vowels"],
  "greek-consonants": ["greek-sounds"],
  "greek-syllables": ["greek-vowels", "greek-consonants"],
  "greek-articles": ["greek-alphabet"],
  "greek-nouns": ["greek-alphabet"],
  "greek-verbs": ["greek-alphabet"],
  "greek-prepositions": ["greek-alphabet"],
  "greek-gender-number": ["greek-nouns"],
  "greek-nominative": ["greek-gender-number"],
  "greek-genitive-dative": ["greek-nominative"],
  "greek-accusative": ["greek-nominative"],
  "greek-person": ["greek-verbs"],
  "greek-aspect": ["greek-verbs"],
  "greek-voice": ["greek-verbs"],
  "greek-mood": ["greek-verbs"],
  "greek-word-order": ["greek-cases", "greek-person"],
  "greek-agreement": ["greek-gender-number", "greek-person"],
  "greek-clauses": ["greek-agreement"],
  "greek-parsing": ["greek-cases", "greek-verbs"],
  "greek-john-one": ["greek-parsing", "greek-word-order"],
  "greek-ephesians": ["greek-parsing", "greek-clauses"],
  "greek-translation": ["greek-john-one", "greek-ephesians"],
  "greek-participles": ["greek-aspect", "greek-cases"],
  "greek-infinitives": ["greek-verbs", "greek-clauses"],
  "greek-subordination": ["greek-clauses"],
  "greek-exegesis": ["greek-translation", "greek-subordination"]
};

export interface PrerequisiteValidation {
  valid: boolean;
  cycles: string[][];
  unknownConceptIds: string[];
  selfReferences: string[];
}

export function validatePrerequisiteGraph(
  graph: PrerequisiteGraph,
  knownConceptIds: ReadonlySet<string>
): PrerequisiteValidation {
  const unknown = new Set<string>();
  const selfReferences: string[] = [];
  Object.entries(graph).forEach(([conceptId, prerequisites]) => {
    if (!knownConceptIds.has(conceptId)) unknown.add(conceptId);
    prerequisites.forEach((prerequisiteId) => {
      if (!knownConceptIds.has(prerequisiteId)) unknown.add(prerequisiteId);
      if (prerequisiteId === conceptId) selfReferences.push(conceptId);
    });
  });

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const cycles: string[][] = [];
  const visit = (conceptId: string) => {
    if (visiting.has(conceptId)) {
      const start = stack.indexOf(conceptId);
      cycles.push([...stack.slice(start), conceptId]);
      return;
    }
    if (visited.has(conceptId)) return;
    visiting.add(conceptId);
    stack.push(conceptId);
    (graph[conceptId] ?? []).forEach(visit);
    stack.pop();
    visiting.delete(conceptId);
    visited.add(conceptId);
  };
  Object.keys(graph).forEach(visit);

  return {
    valid: unknown.size === 0 && selfReferences.length === 0 && cycles.length === 0,
    cycles,
    unknownConceptIds: [...unknown].sort(),
    selfReferences: [...new Set(selfReferences)].sort()
  };
}
