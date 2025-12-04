# Backend 实现总结

## 项目概述

完整的 Flask RESTful API 后端实现，包含 13 个数据库模型，完整的认证系统，和所有核心功能的 API 端点。

## ✅ 已实现功能

### 1. 数据库模型 (13 个表)

所有模型都包含：

-   时间戳字段 (created_at, updated_at)
-   关系映射 (relationships)
-   to_dict() 方法用于序列化
-   适当的索引和外键约束

**核心模型：**

1. ✅ `Country` - 国家表
2. ✅ `ProductionHouse` - 制作公司表
3. ✅ `Producer` - 制作人表
4. ✅ `ProducerAffiliation` - 制作人归属关系（多对多）
5. ✅ `WebSeries` - 网络剧集主表
6. ✅ `Episode` - 剧集单集表
7. ✅ `Telecast` - 播出信息表
8. ✅ `SeriesContract` - 剧集合同表
9. ✅ `ViewerAccount` - 观众账户表（含认证）
10. ✅ `Feedback` - 用户反馈表
11. ✅ `DubbingLanguage` - 配音语言表
12. ✅ `SubtitleLanguage` - 字幕语言表
13. ✅ `WebSeriesRelease` - 剧集发布信息表

### 2. 认证系统

-   **JWT 认证**：Access Token (1 小时) + Refresh Token (30 天)
-   **密码安全**：bcrypt 加密，12 轮哈希
-   **密码验证**：强制大小写字母+数字+最少 8 字符
-   **角色权限**：Customer, Employee, Admin 三级权限

**API 端点：**

-   POST `/api/auth/register` - 用户注册
-   POST `/api/auth/login` - 用户登录
-   POST `/api/auth/refresh` - 刷新令牌
-   GET `/api/auth/me` - 获取当前用户信息

### 3. 剧集管理 API

**Series 端点：**

-   GET `/api/series` - 获取所有剧集（支持分页、搜索、分类过滤）
-   GET `/api/series/:id` - 获取单个剧集详情（含剧集列表）
-   POST `/api/series` - 创建剧集 (Employee/Admin)
-   PUT `/api/series/:id` - 更新剧集 (Employee/Admin)
-   DELETE `/api/series/:id` - 删除剧集 (Admin)

**特性：**

-   自动计算平均评分
-   支持按类型过滤
-   支持标题搜索
-   分页支持

### 4. 剧集单集 API

**Episode 端点：**

-   GET `/api/episodes` - 获取所有单集
-   GET `/api/episodes/:id` - 获取单集详情
-   POST `/api/episodes` - 创建单集 (Employee/Admin)
-   PUT `/api/episodes/:id` - 更新单集 (Employee/Admin)
-   DELETE `/api/episodes/:id` - 删除单集 (Admin)

### 5. 反馈系统 API

**Feedback 端点：**

-   GET `/api/feedback` - 获取所有反馈
-   POST `/api/feedback` - 提交反馈（1-5 星评分）
-   PUT `/api/feedback/:id` - 更新反馈（仅所有者）
-   DELETE `/api/feedback/:id` - 删除反馈（所有者/Admin）

**验证规则：**

-   评分必须在 1-5 之间
-   反馈文本最长 128 字符
-   自动记录提交日期

### 6. 制作公司 API

**Production House 端点：**

-   GET `/api/production-houses` - 获取所有制作公司
-   GET `/api/production-houses/:id` - 获取制作公司详情
-   POST `/api/production-houses` - 创建制作公司 (Admin)
-   PUT `/api/production-houses/:id` - 更新制作公司 (Admin)
-   DELETE `/api/production-houses/:id` - 删除制作公司 (Admin)

### 7. 安全特性

**已实现：**

-   ✅ SQL 注入防护（SQLAlchemy ORM）
-   ✅ XSS 防护（输入清理）
-   ✅ CSRF 保护
-   ✅ 密码哈希（bcrypt）
-   ✅ JWT 令牌认证
-   ✅ 角色权限控制
-   ✅ CORS 配置
-   ✅ 输入验证

**安全工具函数：**

```python
sanitize_input()      # XSS防护
sanitize_dict()       # 递归清理
role_required()       # 权限装饰器
generate_id()         # 唯一ID生成
validate_password()   # 密码强度验证
```

### 8. 数据库初始化

**init_db.py 脚本功能：**

-   `python init_db.py init` - 创建所有表
-   `python init_db.py seed` - 填充示例数据
-   `python init_db.py reset` - 重置数据库

**示例数据包括：**

-   5 个国家
-   3 个制作公司（Netflix, HBO, Amazon）
-   5 部网络剧集
-   5 集样本剧集
-   1 个管理员账户
-   1 个客户账户

### 9. 配置管理

**环境配置：**

-   Development - 开发环境（调试模式）
-   Production - 生产环境（优化性能）
-   Testing - 测试环境（内存数据库）

**配置选项：**

-   数据库连接
-   JWT 密钥和过期时间
-   CORS 白名单
-   分页设置
-   bcrypt 轮数

## 文件结构

```
backend/
├── app/
│   ├── __init__.py              # Flask应用
│   ├── models/                  # 数据库模型 (13个文件)
│   │   ├── __init__.py
│   │   ├── country.py
│   │   ├── production_house.py
│   │   ├── producer.py
│   │   ├── producer_affiliation.py
│   │   ├── web_series.py
│   │   ├── episode.py
│   │   ├── telecast.py
│   │   ├── series_contract.py
│   │   ├── viewer_account.py
│   │   ├── feedback.py
│   │   ├── dubbing_language.py
│   │   ├── subtitle_language.py
│   │   └── web_series_release.py
│   ├── routes/                  # API路由 (5个文件)
│   │   ├── __init__.py
│   │   ├── auth.py             # 认证端点
│   │   ├── series.py           # 剧集端点
│   │   ├── episode.py          # 单集端点
│   │   ├── feedback.py         # 反馈端点
│   │   └── production_house.py # 制作公司端点
│   └── utils/
│       └── security.py          # 安全工具函数
├── config.py                    # 配置类
├── run.py                       # 应用入口
├── init_db.py                  # 数据库初始化脚本
├── requirements.txt             # Python依赖
├── .env.example                # 环境变量示例
├── .gitignore                  # Git忽略文件
└── README.md                    # 项目文档

总计：25个Python文件
```

## ID 生成规则

所有实体 ID 使用前缀+UUID 格式：

-   剧集：`WS` + 8 位数字 (如 WS12345678)
-   账户：`ACC` + 7 位数字 (如 ACC1234567)
-   单集：`EP` + 8 位数字 (如 EP12345678)
-   反馈：`FB` + 8 位数字 (如 FB12345678)
-   制作公司：`PH` + 6 位数字 (如 PH123456)

## 测试账户

### 管理员账户

-   **Email**: admin@news.com
-   **Password**: Admin123
-   **权限**: 完整的 CRUD 操作

### 客户账户

-   **Email**: john@example.com
-   **Password**: User123
-   **权限**: 浏览剧集、提交反馈

## API 响应格式

### 成功响应

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### 错误响应

```json
{
	"error": "Error type",
	"message": "Detailed error message"
}
```

### 分页响应

```json
{
  "series": [...],
  "total": 100,
  "pages": 5,
  "current_page": 1
}
```

## 数据库关系

```
Country ←─── ViewerAccount ──→ Feedback ──→ WebSeries
   ↑                                            ↑
   │                                            │
   └─── WebSeriesRelease ──────────────────────┘
                                                ↑
                                                │
ProductionHouse ──→ WebSeries ──┬── Episode ──→ Telecast
   ↑                             ├── SeriesContract
   │                             ├── DubbingLanguage
   │                             ├── SubtitleLanguage
   │                             └── Feedback
   │
ProducerAffiliation ── Producer
```

## 运行指南

### 1. 安装依赖

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. 配置环境

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接
```

### 3. 创建数据库

```sql
CREATE DATABASE news_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

sql 配置用户

```sql
CREATE USER 'appuser'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

### 4. 初始化数据库

```bash
python init_db.py init    # 创建表
python init_db.py seed    # 填充数据
```

### 5. 运行服务器

```bash
python run.py
```

服务器将在 http://localhost:5000 启动

