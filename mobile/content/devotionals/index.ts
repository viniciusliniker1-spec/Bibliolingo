import type { Devotional } from "../../domain/devotional";
import { parseDevotional } from "../../domain/devotional";
import seed from "./seed.json";

/** Devocionais que viajam dentro do app (funcionam offline, mesmo sem internet no dia). */
export const BUNDLED_DEVOTIONALS: Devotional[] = [parseDevotional(seed)].filter((item): item is Devotional => Boolean(item));
