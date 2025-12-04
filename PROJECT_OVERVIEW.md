# NEWS - 网络剧集管理系统

完整的全栈 Web 应用，采用 Netflix 风格设计，用于管理网络剧集、用户和反馈。

## 🎯 项目概述

这是一个功能完整的网络剧集管理平台，包括：

-   **Netflix 风格前端** - React + Redux + Material-UI
-   **Flask RESTful API 后端** - Flask + SQLAlchemy + JWT
-   **MySQL 数据库** - 13 个关联表的完整数据模型

## ✨ 主要功能

### 用户功能

-   🔐 用户注册和登录（JWT 认证）
-   📺 浏览网络剧集（分类、搜索）
-   ⭐ 查看剧集详情和单集列表
-   💬 提交评分和反馈（1-5 星）
-   👤 个人中心和账户管理

### 管理功能

-   📊 剧集 CRUD 操作（Employee/Admin）
-   🎬 单集管理
-   🏢 制作公司管理（Admin）
-   👥 用户权限管理（Customer/Employee/Admin）

### 技术特性

-   🎨 Netflix 风格的 UI 设计
-   🔒 完整的安全措施（密码加密、JWT、XSS 防护）
-   📱 完全响应式设计
-   🚀 RESTful API 设计
-   💾 关系型数据库（13 个表）

## 📂 项目结构

```
database-project-p2/
├── frontend/              # React前端应用
│   ├── src/
│   │   ├── components/   # UI组件
│   │   ├── pages/        # 页面组件
│   │   ├── services/     # API服务
│   │   ├── store/        # Redux状态管理
│   │   └── styles/       # 样式文件
│   ├── package.json
│   └── README.md
│
├── backend/              # Flask后端API
│   ├── app/
│   │   ├── models/      # 数据库模型（13个）
│   │   ├── routes/      # API路由（5个）
│   │   └── utils/       # 工具函数
│   ├── config.py        # 配置
│   ├── run.py          # 应用入口
│   ├── init_db.py      # 数据库初始化
│   ├── requirements.txt
│   └── README.md
│
├── CLAUDE.md            # Claude Code指南
└── README.md            # 本文件
```

## 🛠️ 技术栈

### 前端

-   **React 18** - UI 框架
-   **Redux Toolkit** - 状态管理
-   **React Router v6** - 路由
-   **Axios** - HTTP 客户端
-   **Material-UI** - UI 组件库

### 后端

-   **Flask 3.0** - Web 框架
-   **SQLAlchemy** - ORM
-   **Flask-JWT-Extended** - JWT 认证
-   **Flask-Bcrypt** - 密码加密
-   **PyMySQL** - MySQL 连接器

### 数据库

-   **MySQL 8.0+** - 关系型数据库
-   **13 个关联表** - 完整的数据模型

## 🚀 快速开始

### 前置要求

-   Python 3.8+
-   Node.js 16+
-   MySQL 8.0+

### 1. 克隆项目

```bash
git clone <repository-url>
cd database-project-p2
```

### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库连接

# 创建MySQL数据库
mysql -u root -p
CREATE DATABASE news_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit

# 初始化数据库
python init_db.py init
python init_db.py seed

# 启动后端服务器
python run.py
```

后端将在 http://localhost:5000 运行

### 3. 前端设置

```bash
# 打开新终端，进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端将在 http://localhost:3000 运行

## 🔑 测试账户

### 管理员账户

-   **Email**: admin@news.com
-   **Password**: Admin123
-   **权限**: 完整的 CRUD 操作

### 客户账户

-   **Email**: john@example.com
-   **Password**: User123
-   **权限**: 浏览和反馈

## 📊 数据库架构

### 13 个核心表

1. **country** - 国家/地区
2. **production_house** - 制作公司
3. **producer** - 制作人
4. **producer_affiliation** - 制作人归属（多对多）
5. **web_series** - 网络剧集
6. **episode** - 剧集单集
7. **telecast** - 播出信息
8. **series_contract** - 剧集合同
9. **viewer_account** - 观众账户
10. **feedback** - 用户反馈
11. **dubbing_language** - 配音语言
12. **subtitle_language** - 字幕语言
13. **web_series_release** - 发布信息

### 关系图

```
Country ←─── ViewerAccount ──→ Feedback ──→ WebSeries
   ↑                                            ↑
   │                                            │
   └─── WebSeriesRelease ──────────────────────┘
                                                ↑
ProductionHouse ──→ WebSeries ──┬── Episode ──→ Telecast
   ↑                             ├── SeriesContract
   │                             ├── DubbingLanguage
ProducerAffiliation              ├── SubtitleLanguage
   │                             └── Feedback
Producer
```

## 🔒 安全特性

-   ✅ **密码加密**: bcrypt 哈希（12 轮）
-   ✅ **JWT 认证**: Access Token + Refresh Token
-   ✅ **SQL 注入防护**: SQLAlchemy ORM
-   ✅ **XSS 防护**: 输入清理和转义
-   ✅ **CORS 配置**: 白名单控制
-   ✅ **角色权限**: 三级权限系统
-   ✅ **输入验证**: 服务器端和客户端双重验证

## 📡 API 端点示例

### 认证

```bash
# 注册
POST /api/auth/register
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country_name": "USA"
}

# 登录
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### 剧集

```bash
# 获取所有剧集（支持分页和搜索）
GET /api/series?page=1&per_page=20&search=stranger&type=Sci-Fi

# 获取单个剧集详情
GET /api/series/WS12345678

# 创建剧集（需要Employee/Admin权限）
POST /api/series
Authorization: Bearer <token>
{
  "title": "Stranger Things",
  "type": "Sci-Fi",
  "num_episodes": 42,
  "house_id": "PH001"
}
```

### 反馈

```bash
# 提交反馈
POST /api/feedback
Authorization: Bearer <token>
{
  "rating": 5,
  "feedback_text": "Amazing series!",
  "webseries_id": "WS12345678"
}
```

## 🎨 UI 截图说明

### 首页

-   Netflix 风格的 Hero 横幅
-   横向滚动剧集行（按分类）
-   响应式导航栏

### 剧集浏览页

-   网格布局展示所有剧集
-   分类过滤器
-   搜索功能
-   分页支持

### 剧集详情页

-   大背景图片
-   剧集信息和评分
-   分标签显示（剧集列表、详情、评论）
-   播放和收藏按钮

### 个人中心

-   用户信息卡片
-   统计数据
-   快捷导航

## 📝 开发指南

### 添加新功能

1. **后端**：

    - 在 `backend/app/models/` 添加模型
    - 在 `backend/app/routes/` 添加路由
    - 更新 `init_db.py` 添加示例数据

2. **前端**：
    - 在 `frontend/src/services/` 添加 API 服务
    - 在 `frontend/src/store/slices/` 添加 Redux slice
    - 在 `frontend/src/components/` 或 `pages/` 添加组件

### 数据库迁移

```bash
cd backend
flask db init
flask db migrate -m "Add new table"
flask db upgrade
```

## 🧪 测试

### 后端测试

```bash
cd backend
python -m pytest
```

### 前端测试

```bash
cd frontend
npm test
```

## 📦 部署

### 后端部署

1. 设置生产环境变量
2. 使用 Gunicorn 或 uWSGI
3. 配置 Nginx 反向代理
4. 使用 SSL 证书（Let's Encrypt）

### 前端部署

1. 构建生产版本：`npm run build`
2. 部署到静态托管（Netlify, Vercel, S3）
3. 配置环境变量

### Docker 部署

```bash
# 待添加 Docker Compose 配置
docker-compose up -d
```

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请提交 Issue。

---

## 📚 文档

-   [前端文档](frontend/README.md)
-   [后端文档](backend/README.md)
-   [Claude Code 指南](CLAUDE.md)

## 🎯 项目亮点

1. **完整的全栈实现** - 从数据库到 UI 的完整解决方案
2. **Netflix 风格设计** - 现代化、专业的用户界面
3. **安全优先** - 多层次的安全防护
4. **可扩展架构** - 模块化设计，易于扩展
5. **详细文档** - 完整的开发和部署文档
6. **示例数据** - 开箱即用的测试数据

## 🔄 版本历史

### v1.0.0 (当前版本)

-   ✅ 完整的前后端实现
-   ✅ 13 个数据库表
-   ✅ Netflix 风格 UI
-   ✅ JWT 认证系统
-   ✅ 角色权限管理
-   ✅ CRUD 操作完整实现

---

**开发时间**: 2024 年 12 月
**技术栈**: React + Flask + MySQL
**项目状态**: 完成并可运行
