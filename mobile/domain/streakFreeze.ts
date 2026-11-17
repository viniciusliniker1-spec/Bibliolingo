/**
 * Congelar a ofensiva: um dia perdido pode ser “salvo” com moedas Lumi.
 *
 * Vale para 1 ou 2 dias seguidos sem estudar, e só enquanto a ofensiva ainda existe
 * (o último estudo foi anteontem ou três dias atrás). Depois de congelar, o último
 * dia de estudo passa a ser ontem: estudar hoje continua a sequência normalmente.
 */
import { toLocalDateKey } from "../../src/domain/streak";
import { daysBetweenKeys } from "./lumiMood";
import { EMPTY_WALLET, walletBalance, type LumiFreeze, type LumiWalletState, type WalletProgress } from "./lumiWallet";

export const FREEZE_PRICE_PER_DAY = 30;
export const FREEZE_MAX_DAYS = 2;

export interface FreezeProgress extends WalletProgress {
  streak: number;
  lastStudyDate?: string;
}

export interface FreezeOffer {
  /** Dias perdidos que seriam cobertos. */
  days: string[];
  price: number;
  balance: number;
  affordable: boolean;
  streak: number;
}

function addDays(key: string, amount: number) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return toLocalDateKey(date);
}

/** Proposta de congelamento para hoje, ou undefined se não houver o que salvar. */
export function freezeOffer(progress: FreezeProgress, now = new Date()): FreezeOffer | undefined {
  if (!progress.lastStudyDate || progress.streak < 1) return undefined;
  const today = toLocalDateKey(now);
  const gap = daysBetweenKeys(progress.lastStudyDate, today);
  const missed = gap - 1;
  if (missed < 1 || missed > FREEZE_MAX_DAYS) return undefined;
  const days = Array.from({ length: missed }, (_, index) => addDays(progress.lastStudyDate!, index + 1));
  const price = days.length * FREEZE_PRICE_PER_DAY;
  const balance = walletBalance(progress);
  return { days, price, balance, affordable: balance >= price, streak: progress.streak };
}

export type FreezeResult =
  | { ok: true; wallet: LumiWalletState; lastStudyDate: string; freeze: LumiFreeze }
  | { ok: false; reason: "nothing" | "insufficient"; missing?: number };

/** Gasta as moedas e devolve a carteira e o novo “último dia de estudo” (ontem). */
export function applyFreeze(progress: FreezeProgress, now = new Date()): FreezeResult {
  const offer = freezeOffer(progress, now);
  if (!offer) return { ok: false, reason: "nothing" };
  if (!offer.affordable) return { ok: false, reason: "insufficient", missing: offer.price - offer.balance };
  const wallet = progress.lumiWallet ?? EMPTY_WALLET;
  const freeze: LumiFreeze = { at: now.toISOString(), price: offer.price, dates: offer.days };
  return {
    ok: true,
    freeze,
    wallet: { ...wallet, freezes: [...(wallet.freezes ?? []), freeze] },
    lastStudyDate: offer.days[offer.days.length - 1]
  };
}

/** Dias salvos por congelamento (para o calendário mostrar que não foram perdidos). */
export function frozenDates(wallet: LumiWalletState | undefined): Set<string> {
  return new Set((wallet?.freezes ?? []).flatMap((freeze) => freeze.dates));
}
