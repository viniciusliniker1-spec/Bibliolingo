import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { syncAppIcon } from "./appIcon";

export const APP_ICON_TASK = "bibliolingo-app-icon";

/** Precisa ser definida no carregamento do app (index.ts) para rodar também em segundo plano. */
export function defineAppIconTask() {
  if (TaskManager.isTaskDefined(APP_ICON_TASK)) return;
  TaskManager.defineTask(APP_ICON_TASK, async () => {
    try {
      await syncAppIcon();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

/** Verifica o ícone a cada 12 horas (o sistema decide a hora exata), mesmo com o app fechado. */
export async function registerAppIconTask() {
  try {
    if (await TaskManager.isTaskRegisteredAsync(APP_ICON_TASK)) return;
    await BackgroundTask.registerTaskAsync(APP_ICON_TASK, { minimumInterval: 12 * 60 });
  } catch {
    // Sem tarefa em segundo plano, o ícone muda a cada vez que o app é aberto e fechado.
  }
}
