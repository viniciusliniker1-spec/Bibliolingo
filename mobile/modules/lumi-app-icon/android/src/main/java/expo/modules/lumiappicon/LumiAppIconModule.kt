package expo.modules.lumiappicon

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Troca o ícone do app na tela inicial ligando um "activity-alias" e desligando os outros.
 * Os aliases são criados pelo plugin plugins/withLumiAppIcons.js e se chamam <pacote>.LumiIcon_<id>.
 */
class LumiAppIconModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val prefix: String
    get() = "${context.packageName}.LumiIcon_"

  private fun aliasNames(): List<String> {
    val info = context.packageManager.getPackageInfo(
      context.packageName,
      PackageManager.PackageInfoFlags.of((PackageManager.GET_ACTIVITIES or PackageManager.MATCH_DISABLED_COMPONENTS).toLong())
    )
    return info.activities.orEmpty().map { it.name }.filter { it.startsWith(prefix) }
  }

  private fun isEnabled(name: String): Boolean {
    val pm = context.packageManager
    return when (pm.getComponentEnabledSetting(ComponentName(context.packageName, name))) {
      PackageManager.COMPONENT_ENABLED_STATE_ENABLED -> true
      PackageManager.COMPONENT_ENABLED_STATE_DEFAULT -> name == "${prefix}neutra"
      else -> false
    }
  }

  override fun definition() = ModuleDefinition {
    Name("LumiAppIcon")

    Function("getIcon") {
      aliasNames().firstOrNull { isEnabled(it) }?.removePrefix(prefix)
    }

    Function("setIcon") { id: String ->
      val pm = context.packageManager
      val target = "$prefix$id"
      val names = aliasNames()
      if (!names.contains(target)) return@Function false
      if (isEnabled(target) && names.count { isEnabled(it) } == 1) return@Function true
      // Liga o novo antes de desligar os outros, para o app nunca ficar sem ícone.
      pm.setComponentEnabledSetting(ComponentName(context.packageName, target), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
      names.filter { it != target }.forEach {
        pm.setComponentEnabledSetting(ComponentName(context.packageName, it), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
      }
      true
    }
  }
}
