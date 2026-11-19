import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import agents from './copilot/agents'
import app from './copilot/app'
import chat from './copilot/chat'
import code from './copilot/code'
import composer from './copilot/composer'
import models from './copilot/models'
import plans from './copilot/plans'
import sessionLog from './copilot/session-log'
import skills from './copilot/skills'
import spaces from './copilot/spaces'
import workbench from './copilot/workbench'

/**
 * Copilot 页：聊天与输入框、模型与使用量、技能调用、工作台与附件、智能体任务与会话日志、空间、
 * 应用外壳与智能体首页、代码 / 拉取请求中的 Copilot 入口，以及订阅与试用页（/github-copilot/…）。
 * 停靠聊天面板与存储库页入口在各页面复用，整句放 static；含变量的正则仅在 Copilot 页生效。
 */
export default mergeDictionaries(
  chat,
  models,
  skills,
  workbench,
  agents,
  sessionLog,
  spaces,
  code,
  composer,
  app,
  plans
) satisfies PageDictionary
