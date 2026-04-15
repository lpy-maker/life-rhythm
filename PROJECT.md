# Life-Rhythm 项目文档

> 本文档记录了项目从构想、需求讨论、数据库设计、代码实现到部署上线的完整过程，供后续对话快速恢复上下文，也作为学习参考。

---

## 一、项目起点与定位

已有项目 `life-tracker`（位于 `/Users/lpy/Project/life-tracker`）是一个每日回顾的 Web 应用，使用飞书多维表格作为数据后端。

新的想法是：在每日回顾之外，还需要一个**今天要做什么、做了没有**的执行追踪系统。两者定位互补：

- **life-tracker**：每天结束，回顾今天发生了什么（向后看）
- **life-rhythm**：每天开始/进行中，执行计划好的事情（向今天看）

名称"rhythm"取生活节奏之意，契合习惯的周期性和日复一日的执行感。

---

## 二、需求讨论过程

### 2.1 初始内容梳理

重新整理了每日、每周、每月需要做的事情，按三大类（L1层级）划分：

**每天要做（BasicLife / Body / Brain）：**

```
BasicLife（L1）
├── Qt（L2）：分享（L3），阅读他人的（L3），应用（L3）
├── Pr（L2）：定时（L3），早起悔改感恩（L3），晚前悔改感恩（L3），ACTS（L3）
├── SM（L2）：默写（L3）
├── Br（L2）：Br-new阅读（L3）
└── Bs（L2）：查经阅读（L3），思考（L3），应用（L3）

Body（L1）
├── Sleep（L2）：早睡23点前（L3），早起6点半（L3）
└── Sport（L2）：室内运动（L3）

Brain（L1）
├── Improve（L2）：阅读RSS（L3）
├── Review（L2）：回顾今天的内容（L3），回顾之前的内容（L3）
└── Other（L2）：记录账单（L3）
```

**每周要做：**
- 联系弟兄&家人&他人
- 整理内务&卫生&形象
- 室外运动/健身2次
- 复盘本周生活
- 规划下周生活

**每月要做：**
- 账务统计
- 复盘本月生活
- 规划下月生活

### 2.2 缩写含义

| 缩写 | 全称 | 中文 |
|------|------|------|
| Qt | Quiet Time | 灵修 |
| Pr | Prayer | 祷告 |
| SM | Scripture Memory | 经文背诵 |
| Br-new | Bible Reading New Testament | 新约读经 |
| Br-old | Bible Reading Old Testament | 旧约读经 |
| Br-other | Bible Reading Other | 其他圣经阅读 |
| Bs | Bible Study | 查经 |

### 2.3 讨论中的关键问题与决策

**问题1：表的粒度怎么定？**

提出两种方案：
- 方案A：L2 作为列（Qt、Br、Pr 等各一列）
- 方案B：L3 作为列（Qt-Share、Qt-Read 等各一列）

**决定**：用 L2-L3 命名格式（如 `Qt-Share`）作为 L3 的 code，既保留层级信息，又避免不同 L2 下同名 L3 冲突。同时建一张自引用的 `categories` 表承载所有层级关系，而非分开三张平表。

**问题2：Pr 下"早起&晚前悔改感谢"要不要拆开？**

**决定**：拆成两个——Pr-Morning（早起悔改感恩）和 Pr-Night（晚前悔改感恩）。

**问题3：SM-背诵次数怎么处理？**

**决定**：删除次数字段，改为纯布尔值（做/没做）。L2 层级的 Qt、Br、Pr、SM、Bs 同样各自有一个"今天做了没"的布尔打卡字段。

**问题4：每周/每月任务的表结构？**

原始建议是宽表（横向扩展，新增习惯=新增列）：
```
month   | 账务统计 | 复盘本月 | 规划下月
2026-04 |   ✓    |   ✓    |   ✗
```

**问题**：每次新增习惯需要 `ALTER TABLE`（修改表结构），属于 DDL 变更，长期维护成本高。

**最终决定：竖表结构**（定义表 + 记录表分离）：
```
定义表：id | name | active        ← 新增习惯只插一行
记录表：id | task_id | month | done  ← 完成情况按月记录
```

**问题5：多出来一张计划表是做什么的？**

提出需要一张独立的 `daily_plan` 表，存放"今天该读哪章/做什么"的内容安排（由自己手动填入）。

**这与打卡表的区别：**
- `daily_plan`（计划表）：**今天要读什么内容**，如"马太福音5章、创世记1章"，是内容日历
- `daily_log`（打卡表）：**今天做了没有**，是行为记录

主页逻辑：读取 `daily_plan` 展示今日内容 → 完成后在 `daily_log` 勾选。

---

## 三、最终数据库设计

### 3.1 数据库选型

选择 **Supabase 免费套餐**（PostgreSQL 托管服务）。

| 方案 | 费用 | 优点 | 缺点 |
|------|------|------|------|
| 本机搭建 | 免费 | 完全掌控 | 关机无法访问、硬件故障风险 |
| 购买 VPS | 约50-80元/年 | 全天在线、数据自控 | 需要自己运维 |
| Supabase | 免费 | 零运维、性能好、数据可导出 | 数据在第三方服务器 |

选择理由：数据全是文本，500MB 免费额度远够用；查询性能是纯数据库级别；数据随时可完整导出；零运维成本。

### 3.2 七张表结构

**表1：`categories`（分类层级，核心）**
```sql
CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,   -- 代码引用，如 qt-share
  name       TEXT NOT NULL,          -- 显示名称，如 Qt-分享
  level      TEXT NOT NULL CHECK (level IN ('L1', 'L2', 'L3')),
  parent_id  INTEGER REFERENCES categories(id),  -- 自引用，指向父级
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
设计要点：单张自引用表同时承载三个层级，通过 `parent_id` 关联父级。新增分类只需插一行，不改表结构。

**表2：`daily_plan`（每日内容计划）**
```sql
CREATE TABLE daily_plan (
  id       SERIAL PRIMARY KEY,
  date     DATE NOT NULL UNIQUE,
  qt       TEXT,    -- 灵修内容
  br_new   TEXT,    -- 新约读哪章，如 马太福音 5:1-12
  br_old   TEXT,    -- 旧约读哪章，如 创世记 1:1-31
  br_other TEXT,
  pr       TEXT,
  sm       TEXT,    -- 当天背诵经文
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**表3：`daily_log`（每日打卡，核心）**
```sql
CREATE TABLE daily_log (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  done        BOOLEAN NOT NULL DEFAULT FALSE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, category_id)  -- 同一天同一项只有一条记录
);
```
设计要点：L2 和 L3 的打卡记录统一存这张表，通过 `category_id` 区分。`UNIQUE (date, category_id)` 配合 `upsert` 实现"点击切换状态"而不会产生重复记录。

**表4+5：`weekly_task_def` + `weekly_task_log`（每周任务）**
```sql
CREATE TABLE weekly_task_def (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE weekly_task_log (
  id         SERIAL PRIMARY KEY,
  task_id    INTEGER NOT NULL REFERENCES weekly_task_def(id),
  week_start DATE NOT NULL,   -- 该周周一的日期
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (task_id, week_start)
);
```

**表6+7：`monthly_task_def` + `monthly_task_log`（每月任务）**

结构与每周任务相同，`week_start` 改为 `month TEXT`（格式 `YYYY-MM`，如 `2026-04`）。

### 3.3 初始数据

`categories` 表插入了32条初始记录（3个L1、11个L2、18个L3）。

`weekly_task_def` 插入5条：联系弟兄&家人&他人、整理内务&卫生&形象、室外运动/健身2次、复盘本周生活、规划下周生活。

`monthly_task_def` 插入3条：账务统计、复盘本月生活、规划下月生活。

---

## 四、技术选型

| 层级 | 选择 | 原因 |
|------|------|------|
| 框架 | Next.js 16（App Router）| 与已有 life-tracker 一致 |
| 语言 | TypeScript | 类型安全，减少运行时错误 |
| 样式 | Tailwind CSS | 快速布局，无需写 CSS 文件 |
| 组件库 | shadcn/ui | 高质量基础组件，代码直接在项目里，可完全定制 |
| 数据库 | Supabase（PostgreSQL）| 免费、零运维、数据可导出 |
| 部署 | Vercel | 与 Next.js 无缝集成，自动 CI/CD |

---

## 五、代码实现过程

### 5.1 项目初始化

```bash
# 创建 Next.js 项目
# --typescript：使用 TypeScript
# --tailwind：集成 Tailwind CSS
# --eslint：集成代码检查
# --app：使用 App Router（Next.js 新版路由方式）
# --no-src-dir：不创建 src 目录，文件放根目录
# --import-alias "@/*"：设置路径别名，代码中用 @/lib/xxx 代替 ../../lib/xxx
# --yes：所有选项使用默认值
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes

# 安装 Supabase JS 客户端
npm install @supabase/supabase-js

# 初始化 shadcn/ui（会自动检测项目配置）
npx shadcn@latest init --defaults

# 添加所需 UI 组件（Card卡片、Checkbox复选框、Badge角标、Separator分割线）
npx shadcn@latest add card checkbox badge separator
```

**遇到问题**：`create-next-app` 报错"目录里有文件冲突（`PROJECT.md`）"。
**解决方案**：先把 `PROJECT.md` 移到 `/tmp/` 临时目录，初始化完再移回来。

### 5.2 文件结构

```
life-rhythm/
├── app/
│   ├── globals.css         # 全局样式（shadcn 生成）
│   ├── layout.tsx          # 根布局：设置页面标题、字体
│   └── page.tsx            # 主页（今日视图，服务端组件）
├── components/
│   ├── check-item.tsx      # 打卡复选框组件（客户端）
│   └── ui/                 # shadcn 组件（card/checkbox/badge/separator）
├── lib/
│   ├── actions.ts          # Server Actions：读写 Supabase 的函数
│   ├── supabase.ts         # Supabase 客户端初始化
│   └── types.ts            # TypeScript 类型定义
├── supabase/
│   └── schema.sql          # 建表 SQL + 初始数据（在 Supabase 执行）
├── .env.local              # 本地环境变量（不提交 git，含 Supabase 密钥）
└── .env.local.example      # 环境变量模板（提交 git，供参考）
```

### 5.3 关键代码说明

**`lib/supabase.ts`** — 创建 Supabase 客户端：
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```
读取环境变量，`!` 是 TypeScript 的"非空断言"，表示"我确定这个值存在"。整个项目共用这一个 client 实例。

**`lib/types.ts`** — TypeScript 类型定义：
对应数据库每张表定义一个 interface，让编辑器能自动补全字段名，并在类型不匹配时报错。

**`lib/actions.ts`** — Server Actions（服务端函数）：
```ts
'use server'  // 声明这是服务端代码，不会打包到浏览器

// 获取所有分类（用于构建 L1→L2→L3 树）
export async function getCategories() { ... }

// 获取某天所有打卡记录
export async function getDailyLogs(date: string) { ... }

// 获取某天的内容计划
export async function getDailyPlan(date: string) { ... }

// 切换打卡状态（核心操作）
export async function toggleDailyLog(date, categoryId, currentDone) {
  await supabase.from('daily_log').upsert(
    { date, category_id: categoryId, done: !currentDone },
    { onConflict: 'date,category_id' }  // 已存在则更新，不存在则插入
  )
  revalidatePath('/')  // 告诉 Next.js 刷新主页数据缓存
}
```

**`components/check-item.tsx`** — 客户端打卡组件：
```ts
'use client'  // 声明这是客户端组件，处理用户交互

export function CheckItem({ date, categoryId, label, done }) {
  const [isPending, startTransition] = useTransition()
  // useTransition：让 UI 在等待服务器响应时保持可交互，不卡顿

  return (
    <Checkbox
      checked={done}
      onCheckedChange={() => {
        startTransition(() => toggleDailyLog(date, categoryId, done))
        // startTransition 把这个操作标记为"非紧急"，React 会优先处理其他 UI 更新
      }}
      disabled={isPending}  // 等待期间禁用，防止重复点击
    />
  )
}
```

**`app/page.tsx`** — 主页（服务端组件）：

关键函数 `buildTree()`：把数据库返回的扁平数组，按 `parent_id` 关系组装成嵌套树结构，供页面渲染。

关键函数 `calcProgress()`：统计每个 L1 下 L3 项的完成数/总数，显示为角标（如 `3/7`）。

### 5.4 Next.js 服务端/客户端组件的区别

这是 Next.js App Router 的核心概念，本项目实际用到了两种：

| | 服务端组件 | 客户端组件 |
|---|---|---|
| 声明方式 | 默认，不需要声明 | 文件顶部写 `'use client'` |
| 能做什么 | 直接查数据库、调后端 API | 处理点击事件、useState、useEffect |
| 不能做什么 | 监听用户事件 | 直接访问数据库 |
| 本项目中 | `page.tsx`（读取 Supabase 数据）| `check-item.tsx`（处理点击打卡）|

---

## 六、Supabase 配置

### 6.1 建表流程

进入 Supabase SQL Editor（`https://supabase.com/dashboard/project/{项目ID}/sql/new`），粘贴 `supabase/schema.sql` 全部内容，点击 Run 执行。

### 6.2 Row Level Security（RLS）

Supabase 默认开启 RLS，anon key 无法读写任何表。需要执行：

```sql
-- 第一步：为每张表开启 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_task_def ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_task_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_task_def ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_task_log ENABLE ROW LEVEL SECURITY;

-- 第二步：添加策略（个人项目，暂时全部放开）
CREATE POLICY "allow all" ON categories FOR ALL USING (true) WITH CHECK (true);
-- ...每张表都要加
```

**为什么要这样**：Supabase 的安全模型默认拒绝所有访问，必须明确声明哪些操作被允许。个人项目暂时全放开，未来加用户登录后可以改为"只允许本人数据"。

### 6.3 环境变量

```bash
# .env.local（本地开发用）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

`NEXT_PUBLIC_` 前缀表示这个变量会暴露给浏览器端。Supabase 的 anon key 本来就是公开的（权限靠 RLS 控制），所以可以这样用。`.env.local` 被 `.gitignore` 排除，不会提交到 git。

---

## 七、Vercel 部署

### 7.1 安装 Vercel CLI

```bash
npm install -g vercel
# -g 表示全局安装，安装后在任何目录都能用 vercel 命令
```

### 7.2 登录 Vercel

```bash
vercel login
# 会提示选择登录方式（GitHub / Email 等）
# 登录后凭证保存在本机，后续命令自动使用
```

### 7.3 首次部署（遇到问题）

```bash
vercel --yes
# --yes：所有配置问题自动用默认值，不交互式询问
# 自动检测到 Next.js 项目，链接到 Vercel 账号下的新项目
```

**遇到问题**：构建失败，报错 `supabaseUrl is required`。

**原因**：`.env.local` 被 `.gitignore` 排除，不会上传到 Vercel。Vercel 构建时读不到环境变量，Supabase 客户端初始化失败。

**解决方案**：用 CLI 单独添加环境变量到 Vercel：
```bash
echo "https://xxx.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJ..." | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# 格式：echo "值" | vercel env add 变量名 环境
# 环境可以是 production（生产）/ preview（预览）/ development（开发）
```

### 7.4 重新部署成功

```bash
vercel --prod
# --prod：明确部署到生产环境，更新正式域名
# 不加 --prod：部署到预览环境，生成一个临时测试 URL
```

**`vercel` 和 `vercel --prod` 的区别：**
- `vercel`：预览部署，URL 形如 `life-rhythm-abc123.vercel.app`，用于测试
- `vercel --prod`：生产部署，更新固定域名 `life-rhythm-phi.vercel.app`

---

## 八、GitHub 配置与自动部署

### 8.1 为什么要接 GitHub

| | CLI 直传（Vercel CLI 部署）| GitHub → Vercel |
|---|---|---|
| 部署触发 | 手动跑 `vercel --prod` | `git push` 自动触发 |
| 代码备份 | 只在本机 | GitHub 上有完整历史 |
| 协作 | 只能自己操作 | 可多人协作 |
| 回滚 | Vercel 控制台手动操作 | 可回滚到任意 commit |
| 风险 | 本机损坏代码丢失 | 代码永久安全 |

### 8.2 安装 GitHub CLI

```bash
brew install gh
# brew 是 Mac 的包管理器（类似 npm，但管理系统级工具）
# gh 是 GitHub 官方命令行工具
```

### 8.3 登录 GitHub

```bash
gh auth login
```

交互式选择流程：
1. **Where do you use GitHub?** → `GitHub.com`
2. **Protocol?** → `HTTPS`
3. **Authenticate Git with your GitHub credentials?** → `Yes`（让 git 命令也用同一套凭证）
4. **How to authenticate?** → `Login with a web browser`

然后：
- CLI 显示一个一次性验证码（如 `30AF-BB73`）
- 自动打开浏览器，在 GitHub 页面输入这个验证码
- 完成后 CLI 显示 `✓ Authentication complete`

**为什么不用密码**：GitHub 早已禁止用账号密码通过命令行操作，必须用 OAuth token 或设备码（Device Flow），浏览器授权是最安全的方式。

### 8.4 创建仓库并推送（一条命令完成）

```bash
gh repo create life-rhythm \
  --public \                               # 公开仓库（改 --private 则私有）
  --description "每日习惯打卡与生活节奏追踪" \   # 仓库描述
  --source=. \                             # 以当前目录为源码
  --remote=origin \                        # 自动设置远程地址名为 origin
  --push                                   # 立即推送代码
```

这一条命令同时完成了三件事：
1. 在 GitHub 账号下创建 `life-rhythm` 仓库
2. 给本地 git 配置远程地址（`git remote add origin https://...`）
3. 推送代码（`git push`）

### 8.5 关联 Vercel 与 GitHub

```bash
vercel git connect https://github.com/lpy-maker/life-rhythm
# 告诉 Vercel 这个项目对应哪个 GitHub 仓库
# 之后每次 push 到 GitHub，Vercel 自动触发构建
```

---

## 九、日常工作流

配置完成后，以后修改代码只需三步：

```bash
git add .                        # 暂存所有改动
git commit -m "描述改了什么"      # 提交到本地 git
git push                         # 推送到 GitHub → Vercel 自动构建部署
```

构建完成后（约30-60秒），线上版本自动更新。

---

## 十、重要地址

| 用途 | 地址 |
|------|------|
| 线上应用 | https://life-rhythm-phi.vercel.app |
| GitHub 仓库 | https://github.com/lpy-maker/life-rhythm |
| Vercel 控制台 | https://vercel.com/lpys-projects-9d34d837/life-rhythm |
| Supabase 控制台 | https://supabase.com/dashboard/project/dgjusgdqvhcpojknhsat |
| Supabase SQL Editor | https://supabase.com/dashboard/project/dgjusgdqvhcpojknhsat/sql/new |

---

## 十一、后续开发规划

| 阶段 | 内容 |
|------|------|
| 当前完成 | 项目初始化、数据库建表、今日打卡视图、Vercel+GitHub 部署 |
| 下一步 | 每周/每月任务模块、daily_plan 内容录入页面 |
| 后续 | 统计模块（完成率、连续天数）、与 life-tracker 合并 |

**暂缓事项：** 飞书数据迁移、移动端优化、通知提醒功能
