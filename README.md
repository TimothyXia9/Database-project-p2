# 网络剧集管理系统（NEWS）技术实现文档

## 技术栈选择：Flask/Django + React + MySQL

---

## 📋 目录

1. [项目架构](#项目架构)
2. [数据库 Schema 详解](#数据库schema详解)
3. [后端实现细节](#后端实现细节)
4. [前端实现细节](#前端实现细节)
5. [API 接口设计](#api接口设计)
6. [安全实现](#安全实现)

---

## 项目架构

### 整体架构

```
┌─────────────────┐
│   React 前端     │  (Port 3000)
│   - UI Components│
│   - State Mgmt   │
└────────┬────────┘
         │ HTTP/REST API
         ▼
┌─────────────────┐
│ Flask/Django    │  (Port 5000/8000)
│   - API Routes  │
│   - Auth        │
│   - Business    │
└────────┬────────┘
         │ SQL/ORM
         ▼
┌─────────────────┐
│   MySQL DB      │  (Port 3306)
│   - 13 Tables   │
│   - Procedures  │
└─────────────────┘
```

### 技术栈明细

#### 后端

-   **框架**: Flask (推荐) 或 Django
-   **ORM**: SQLAlchemy (Flask) 或 Django ORM
-   **认证**: Flask-JWT-Extended 或 Django REST Framework Token
-   **密码加密**: bcrypt
-   **数据验证**: marshmallow (Flask) 或 Django Serializers
-   **CORS**: Flask-CORS 或 Django-CORS-Headers

#### 前端

-   **框架**: React 18+
-   **路由**: React Router v6
-   **状态管理**: Redux Toolkit 或 Context API
-   **HTTP 客户端**: Axios
-   **UI 框架**: Material-UI (MUI) 或 Ant Design
-   **表单处理**: React Hook Form
-   **图表**: Recharts 或 Chart.js

#### 数据库

-   **RDBMS**: MySQL 8.0+
-   **迁移工具**: Alembic (Flask) 或 Django Migrations

---

## 数据库 Schema 详解

### ER 图概览

```
PRODUCTION_HOUSE ──┬── WEB_SERIES ──┬── EPISODE ── TELECAST
                   │                │
                   │                ├── SERIES_CONTRACT
                   │                │
                   │                ├── DUBBING_LANGUAGE
                   │                │
                   │                ├── SUBTITLE_LANGUAGE
                   │                │
                   │                └── FEEDBACK ── VIEWER_ACCOUNT ── COUNTRY
                   │                     │
                   └── PRODUCER_AFFILIATION ── PRODUCER

WEB_SERIES_RELEASE ── COUNTRY
```

### 表结构详解

#### 1. QTY_COUNTRY (国家/地区表)

```sql
CREATE TABLE qty_country (
    country_name VARCHAR(64) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**字段说明**:

-   `country_name`: 国家名称，主键

**业务用途**: 存储网络剧集发布的国家/地区信息

---

#### 2. QTY_PRODUCTION_HOUSE (制作公司表)

```sql
CREATE TABLE qty_production_house (
    house_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    year_established VARCHAR(10) NOT NULL,
    street VARCHAR(64) NOT NULL,
    city VARCHAR(64) NOT NULL,
    state VARCHAR(64) NOT NULL,
    nationality VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_nationality (nationality)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**字段说明**:

-   `house_id`: 制作公司 ID，主键
-   `name`: 公司名称
-   `year_established`: 成立年份
-   `street, city, state`: 地址信息
-   `nationality`: 国籍

---

#### 3. QTY_PRODUCER (制作人表)

```sql
CREATE TABLE qty_producer (
    producer_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(64) NOT NULL,
    middle_name VARCHAR(64),
    last_name VARCHAR(64) NOT NULL,
    phone BIGINT NOT NULL,
    street VARCHAR(64) NOT NULL,
    city VARCHAR(64) NOT NULL,
    state VARCHAR(32) NOT NULL,
    email VARCHAR(64) NOT NULL UNIQUE,
    nationality VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**字段说明**:

-   `producer_id`: 制作人 ID，主键
-   `email`: 邮箱，唯一约束
-   `phone`: 电话号码（使用 BIGINT 存储 10 位数字）

---

#### 4. QTY_PRODUCER_AFFILIATION (制作人归属关系表)

```sql
CREATE TABLE qty_producer_affiliation (
    producer_id VARCHAR(10),
    house_id VARCHAR(10),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (producer_id, house_id),
    FOREIGN KEY (producer_id) REFERENCES qty_producer(producer_id) ON DELETE CASCADE,
    FOREIGN KEY (house_id) REFERENCES qty_production_house(house_id) ON DELETE CASCADE,
    CHECK (end_date IS NULL OR end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**业务规则**:

-   多对多关系：制作人可以隶属于多个制作公司
-   `end_date` 为 NULL 表示当前仍在该公司工作

---

#### 5. QTY_WEB_SERIES (网络剧集主表)

```sql
CREATE TABLE qty_web_series (
    webseries_id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(64) NOT NULL,
    num_episodes INT NOT NULL DEFAULT 0,
    type VARCHAR(15) NOT NULL,
    house_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (house_id) REFERENCES qty_production_house(house_id) ON DELETE RESTRICT,
    INDEX idx_title (title),
    INDEX idx_type (type),
    INDEX idx_house (house_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**字段说明**:

-   `webseries_id`: 剧集 ID，主键
-   `type`: 剧集类型（如 Drama, Comedy, Thriller 等）
-   `num_episodes`: 总集数

---

#### 6. QTY_EPISODE (剧集单集表)

```sql
CREATE TABLE qty_episode (
    episode_id VARCHAR(10) PRIMARY KEY,
    episode_number VARCHAR(10) NOT NULL,
    title VARCHAR(64),
    webseries_id VARCHAR(10) NOT NULL,
    duration_minutes INT,
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (webseries_id) REFERENCES qty_web_series(webseries_id) ON DELETE CASCADE,
    INDEX idx_webseries (webseries_id),
    INDEX idx_episode_num (episode_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

#### 7. QTY_TELECAST (播出信息表)

```sql
CREATE TABLE qty_telecast (
    telecast_id VARCHAR(10) PRIMARY KEY,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    tech_interruption CHAR(1) NOT NULL DEFAULT 'N',
    total_viewers BIGINT NOT NULL DEFAULT 0,
    episode_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES qty_episode(episode_id) ON DELETE CASCADE,
    CHECK (start_date < end_date),
    CHECK (total_viewers >= 0),
    CHECK (tech_interruption IN ('Y', 'N')),
    INDEX idx_episode (episode_id),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**字段说明**:

-   `tech_interruption`: 技术中断标志（Y/N）
-   `total_viewers`: 观看人数

---

#### 8. QTY_SERIES_CONTRACT (剧集合同表)

```sql
CREATE TABLE qty_series_contract (
    contract_id VARCHAR(10) PRIMARY KEY,
    signed_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    charge_per_episode DECIMAL(7,2) NOT NULL,
    status VARCHAR(16) NOT NULL,
    webseries_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (webseries_id) REFERENCES qty_web_series(webseries_id) ON DELETE CASCADE,
    CHECK (charge_per_episode > 0),
    CHECK (start_date >= signed_date),
    CHECK (end_date >= start_date),
    CHECK (status IN ('Active', 'Expired', 'Terminated', 'Pending')),
    INDEX idx_webseries (webseries_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

#### 9. QTY_VIEWER_ACCOUNT (观众账户表)

```sql
CREATE TABLE qty_viewer_account (
    account_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    middle_name VARCHAR(30),
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    street VARCHAR(64) NOT NULL,
    city VARCHAR(64) NOT NULL,
    state VARCHAR(64) NOT NULL,
    country_name VARCHAR(64) NOT NULL,
    open_date DATE NOT NULL,
    monthly_service_charge DECIMAL(10,2) NOT NULL,
    account_type VARCHAR(20) NOT NULL DEFAULT 'Customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (country_name) REFERENCES qty_country(country_name),
    CHECK (account_type IN ('Customer', 'Employee', 'Admin')),
    INDEX idx_email (email),
    INDEX idx_type (account_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**新增字段**:

-   `email`: 登录用邮箱
-   `password_hash`: 加密后的密码
-   `account_type`: 账户类型（Customer/Employee/Admin）
-   `is_active`: 账户状态

---

#### 10. QTY_FEEDBACK (用户反馈表)

```sql
CREATE TABLE qty_feedback (
    feedback_id VARCHAR(10) PRIMARY KEY,
    rating INT NOT NULL,
    feedback_text VARCHAR(128) NOT NULL,
    feedback_date DATE NOT NULL,
    account_id VARCHAR(10) NOT NULL,
    webseries_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES qty_viewer_account(account_id) ON DELETE CASCADE,
    FOREIGN KEY (webseries_id) REFERENCES qty_web_series(webseries_id) ON DELETE CASCADE,
    CHECK (rating BETWEEN 1 AND 5),
    INDEX idx_webseries (webseries_id),
    INDEX idx_account (account_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

#### 11. QTY_DUBBING_LANGUAGE (配音语言表)

```sql
CREATE TABLE qty_dubbing_language (
    dubbing_language_id VARCHAR(10) PRIMARY KEY,
    language_name VARCHAR(20) NOT NULL,
    webseries_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webseries_id) REFERENCES qty_web_series(webseries_id) ON DELETE CASCADE,
    INDEX idx_webseries (webseries_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

#### 12. QTY_SUBTITLE_LANGUAGE (字幕语言表)

```sql
CREATE TABLE qty_subtitle_language (
    subtitle_language_id VARCHAR(10) PRIMARY KEY,
    language_name VARCHAR(20) NOT NULL,
    webseries_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webseries_id) REFERENCES qty_web_series(webseries_id) ON DELETE CASCADE,
    INDEX idx_webseries (webseries_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

#### 13. QTY_WEB_SERIES_RELEASE (剧集发布信息表)

```sql
CREATE TABLE qty_web_series_release (
    release_date DATE NOT NULL,
    webseries_id VARCHAR(10) NOT NULL,
    country_name VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (webseries_id, country_name),
    FOREIGN KEY (webseries_id) REFERENCES qty_web_series(webseries_id) ON DELETE CASCADE,
    FOREIGN KEY (country_name) REFERENCES qty_country(country_name),
    INDEX idx_release_date (release_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 后端实现细节

### 项目结构（Flask 示例）

```
backend/
├── app/
│   ├── __init__.py              # Flask应用初始化
│   ├── config.py                # 配置文件
│   ├── models/                  # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── series.py
│   │   ├── episode.py
│   │   ├── producer.py
│   │   └── ...
│   ├── routes/                  # API路由
│   │   ├── __init__.py
│   │   ├── auth.py             # 认证路由
│   │   ├── series.py           # 剧集路由
│   │   ├── episode.py          # 单集路由
│   │   ├── user.py             # 用户路由
│   │   └── ...
│   ├── schemas/                 # 数据验证Schema
│   │   ├── __init__.py
│   │   ├── user_schema.py
│   │   └── series_schema.py
│   ├── services/                # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   └── series_service.py
│   ├── utils/                   # 工具函数
│   │   ├── __init__.py
│   │   ├── security.py         # 安全相关
│   │   └── validators.py       # 验证器
│   └── extensions.py            # Flask扩展初始化
├── migrations/                  # 数据库迁移文件
├── tests/                       # 测试文件
├── requirements.txt             # Python依赖
└── run.py                       # 应用入口
```

### 核心代码实现

#### 1. Flask 应用初始化 (`app/__init__.py`)

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from .config import Config

# 初始化扩展
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
ma = Marshmallow()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 初始化扩展
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    CORS(app)

    # 注册蓝图
    from .routes import auth_bp, series_bp, episode_bp, user_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(series_bp, url_prefix='/api/series')
    app.register_blueprint(episode_bp, url_prefix='/api/episodes')
    app.register_blueprint(user_bp, url_prefix='/api/users')

    return app
```

#### 2. 配置文件 (`app/config.py`)

```python
import os
from datetime import timedelta

class Config:
    # 基本配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # 数据库配置
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://username:password@localhost:3306/news_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False  # 生产环境设为False

    # JWT配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # 分页配置
    ITEMS_PER_PAGE = 20

    # 安全配置
    BCRYPT_LOG_ROUNDS = 12

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True

class ProductionConfig(Config):
    DEBUG = False
    # 生产环境的其他配置
```

#### 3. 用户模型 (`app/models/user.py`)

```python
from app import db, bcrypt
from datetime import datetime

class ViewerAccount(db.Model):
    __tablename__ = 'qty_viewer_account'

    account_id = db.Column(db.String(10), primary_key=True)
    first_name = db.Column(db.String(30), nullable=False)
    middle_name = db.Column(db.String(30))
    last_name = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    street = db.Column(db.String(64), nullable=False)
    city = db.Column(db.String(64), nullable=False)
    state = db.Column(db.String(64), nullable=False)
    country_name = db.Column(db.String(64), db.ForeignKey('qty_country.country_name'))
    open_date = db.Column(db.Date, nullable=False)
    monthly_service_charge = db.Column(db.Numeric(10, 2), nullable=False)
    account_type = db.Column(db.String(20), nullable=False, default='Customer')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    feedbacks = db.relationship('Feedback', backref='viewer', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        """设置加密密码"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """验证密码"""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        """转换为字典（不包含密码）"""
        return {
            'account_id': self.account_id,
            'first_name': self.first_name,
            'middle_name': self.middle_name,
            'last_name': self.last_name,
            'email': self.email,
            'city': self.city,
            'state': self.state,
            'country_name': self.country_name,
            'account_type': self.account_type,
            'is_active': self.is_active,
            'open_date': self.open_date.isoformat() if self.open_date else None
        }

    def __repr__(self):
        return f'<ViewerAccount {self.email}>'
```

#### 4. 网络剧集模型 (`app/models/series.py`)

```python
from app import db
from datetime import datetime

class WebSeries(db.Model):
    __tablename__ = 'qty_web_series'

    webseries_id = db.Column(db.String(10), primary_key=True)
    title = db.Column(db.String(64), nullable=False, index=True)
    num_episodes = db.Column(db.Integer, nullable=False, default=0)
    type = db.Column(db.String(15), nullable=False, index=True)
    house_id = db.Column(db.String(10), db.ForeignKey('qty_production_house.house_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    episodes = db.relationship('Episode', backref='series', lazy='dynamic', cascade='all, delete-orphan')
    contracts = db.relationship('SeriesContract', backref='series', lazy='dynamic', cascade='all, delete-orphan')
    feedbacks = db.relationship('Feedback', backref='series', lazy='dynamic', cascade='all, delete-orphan')
    dubbing_languages = db.relationship('DubbingLanguage', backref='series', lazy='dynamic', cascade='all, delete-orphan')
    subtitle_languages = db.relationship('SubtitleLanguage', backref='series', lazy='dynamic', cascade='all, delete-orphan')
    releases = db.relationship('WebSeriesRelease', backref='series', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_episodes=False):
        data = {
            'webseries_id': self.webseries_id,
            'title': self.title,
            'num_episodes': self.num_episodes,
            'type': self.type,
            'house_id': self.house_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        if include_episodes:
            data['episodes'] = [ep.to_dict() for ep in self.episodes]

        return data

    def __repr__(self):
        return f'<WebSeries {self.title}>'
```

#### 5. 认证路由 (`app/routes/auth.py`)

```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import ViewerAccount
from app.schemas.user_schema import UserSchema, LoginSchema
from marshmallow import ValidationError
import uuid
from datetime import date

auth_bp = Blueprint('auth', __name__)
user_schema = UserSchema()
login_schema = LoginSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        # 验证输入数据
        data = login_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400

    # 检查邮箱是否已存在
    if ViewerAccount.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    # 创建新用户
    account_id = f"ACC{str(uuid.uuid4().int)[:7]}"
    new_user = ViewerAccount(
        account_id=account_id,
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        street=data.get('street', 'N/A'),
        city=data.get('city', 'N/A'),
        state=data.get('state', 'N/A'),
        country_name=data.get('country_name', 'USA'),
        open_date=date.today(),
        monthly_service_charge=9.99,
        account_type=data.get('account_type', 'Customer')
    )
    new_user.set_password(data['password'])

    try:
        db.session.add(new_user)
        db.session.commit()

        # 生成Token
        access_token = create_access_token(identity=account_id)
        refresh_token = create_refresh_token(identity=account_id)

        return jsonify({
            'message': 'User registered successfully',
            'user': new_user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'message': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400

        # 查找用户
        user = ViewerAccount.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401

        if not user.is_active:
            return jsonify({'error': 'Account is inactive'}), 403

        # 生成Token
        access_token = create_access_token(identity=user.account_id)
        refresh_token = create_refresh_token(identity=user.account_id)

        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200

    except Exception as e:
        return jsonify({'error': 'Login failed', 'message': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """刷新访问Token"""
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """获取当前用户信息"""
    current_user_id = get_jwt_identity()
    user = ViewerAccount.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200
```

#### 6. 剧集路由 (`app/routes/series.py`)

```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.series import WebSeries
from app.models.user import ViewerAccount
from sqlalchemy import or_

series_bp = Blueprint('series', __name__)

@series_bp.route('/', methods=['GET'])
def get_all_series():
    """获取所有剧集（支持分页和搜索）"""
    try:
        # 分页参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # 搜索参数
        search = request.args.get('search', '')
        series_type = request.args.get('type', '')

        # 构建查询
        query = WebSeries.query

        if search:
            query = query.filter(
                or_(
                    WebSeries.title.contains(search),
                    WebSeries.webseries_id.contains(search)
                )
            )

        if series_type:
            query = query.filter_by(type=series_type)

        # 执行分页查询
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'series': [s.to_dict() for s in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to fetch series', 'message': str(e)}), 500

@series_bp.route('/<series_id>', methods=['GET'])
def get_series(series_id):
    """获取单个剧集详情"""
    try:
        series = WebSeries.query.get(series_id)

        if not series:
            return jsonify({'error': 'Series not found'}), 404

        return jsonify({'series': series.to_dict(include_episodes=True)}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to fetch series', 'message': str(e)}), 500

@series_bp.route('/', methods=['POST'])
@jwt_required()
def create_series():
    """创建新剧集（仅员工权限）"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        # 权限检查
        if user.account_type not in ['Employee', 'Admin']:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.json

        # 生成ID
        import uuid
        series_id = f"WS{str(uuid.uuid4().int)[:8]}"

        new_series = WebSeries(
            webseries_id=series_id,
            title=data['title'],
            num_episodes=data.get('num_episodes', 0),
            type=data['type'],
            house_id=data['house_id']
        )

        db.session.add(new_series)
        db.session.commit()

        return jsonify({
            'message': 'Series created successfully',
            'series': new_series.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create series', 'message': str(e)}), 500

@series_bp.route('/<series_id>', methods=['PUT'])
@jwt_required()
def update_series(series_id):
    """更新剧集信息（仅员工权限）"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ['Employee', 'Admin']:
            return jsonify({'error': 'Unauthorized'}), 403

        series = WebSeries.query.get(series_id)
        if not series:
            return jsonify({'error': 'Series not found'}), 404

        data = request.json

        # 更新字段
        if 'title' in data:
            series.title = data['title']
        if 'num_episodes' in data:
            series.num_episodes = data['num_episodes']
        if 'type' in data:
            series.type = data['type']

        db.session.commit()

        return jsonify({
            'message': 'Series updated successfully',
            'series': series.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update series', 'message': str(e)}), 500

@series_bp.route('/<series_id>', methods=['DELETE'])
@jwt_required()
def delete_series(series_id):
    """删除剧集（仅管理员权限）"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != 'Admin':
            return jsonify({'error': 'Unauthorized'}), 403

        series = WebSeries.query.get(series_id)
        if not series:
            return jsonify({'error': 'Series not found'}), 404

        db.session.delete(series)
        db.session.commit()

        return jsonify({'message': 'Series deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete series', 'message': str(e)}), 500
```

#### 7. 数据验证 Schema (`app/schemas/user_schema.py`)

```python
from marshmallow import Schema, fields, validate, validates, ValidationError
import re

class UserSchema(Schema):
    account_id = fields.Str(dump_only=True)
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=30))
    middle_name = fields.Str(allow_none=True, validate=validate.Length(max=30))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=30))
    email = fields.Email(required=True)
    password = fields.Str(load_only=True, required=True, validate=validate.Length(min=8))
    street = fields.Str(validate=validate.Length(max=64))
    city = fields.Str(validate=validate.Length(max=64))
    state = fields.Str(validate=validate.Length(max=64))
    country_name = fields.Str(validate=validate.Length(max=64))
    account_type = fields.Str(validate=validate.OneOf(['Customer', 'Employee', 'Admin']))
    is_active = fields.Bool(dump_only=True)
    open_date = fields.Date(dump_only=True)

    @validates('password')
    def validate_password(self, value):
        """验证密码强度"""
        if len(value) < 8:
            raise ValidationError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', value):
            raise ValidationError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', value):
            raise ValidationError('Password must contain at least one digit')

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)
```

#### 8. 安全工具 (`app/utils/security.py`)

```python
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.user import ViewerAccount
import html
import re

def sanitize_input(text):
    """清理用户输入，防止XSS"""
    if not isinstance(text, str):
        return text

    # HTML转义
    text = html.escape(text)

    # 移除潜在的脚本标签
    text = re.sub(r'<script.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)

    return text

def sanitize_dict(data):
    """递归清理字典中的所有字符串"""
    if isinstance(data, dict):
        return {k: sanitize_dict(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_dict(item) for item in data]
    elif isinstance(data, str):
        return sanitize_input(data)
    else:
        return data

def role_required(allowed_roles):
    """装饰器：检查用户角色权限"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = ViewerAccount.query.get(current_user_id)

            if not user:
                return jsonify({'error': 'User not found'}), 404

            if user.account_type not in allowed_roles:
                return jsonify({'error': 'Insufficient permissions'}), 403

            return f(*args, **kwargs)

        return decorated_function
    return decorator

# 使用示例
# @role_required(['Admin', 'Employee'])
# def some_protected_route():
#     pass
```

---

## 前端实现细节

### 项目结构（React）

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/           # 可复用组件
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ErrorAlert.jsx
│   │   ├── series/
│   │   │   ├── SeriesCard.jsx
│   │   │   ├── SeriesList.jsx
│   │   │   ├── SeriesDetail.jsx
│   │   │   └── SeriesForm.jsx
│   │   └── auth/
│   │       ├── LoginForm.jsx
│   │       └── RegisterForm.jsx
│   ├── pages/                # 页面组件
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── SeriesListPage.jsx
│   │   ├── SeriesDetailPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/             # API服务
│   │   ├── api.js           # Axios配置
│   │   ├── authService.js
│   │   ├── seriesService.js
│   │   └── episodeService.js
│   ├── store/                # Redux Store
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── seriesSlice.js
│   │   │   └── uiSlice.js
│   │   └── middleware/
│   ├── hooks/                # 自定义Hooks
│   │   ├── useAuth.js
│   │   └── useDebounce.js
│   ├── utils/                # 工具函数
│   │   ├── validators.js
│   │   └── formatters.js
│   ├── styles/               # 样式文件
│   │   └── global.css
│   ├── App.jsx               # 主应用组件
│   ├── index.js              # 入口文件
│   └── routes.jsx            # 路由配置
├── package.json
└── .env                      # 环境变量
```

### 核心代码实现

#### 1. Axios 配置 (`src/services/api.js`)

```javascript
import axios from "axios";

// 创建Axios实例
const api = axios.create({
	baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// 请求拦截器 - 添加Token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("access_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 响应拦截器 - 处理Token过期
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Token过期，尝试刷新
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = localStorage.getItem("refresh_token");
				const response = await axios.post(
					`${process.env.REACT_APP_API_URL}/auth/refresh`,
					{},
					{
						headers: {
							Authorization: `Bearer ${refreshToken}`,
						},
					}
				);

				const { access_token } = response.data;
				localStorage.setItem("access_token", access_token);

				// 重试原请求
				originalRequest.headers.Authorization = `Bearer ${access_token}`;
				return api(originalRequest);
			} catch (refreshError) {
				// 刷新失败，清除Token并跳转登录
				localStorage.removeItem("access_token");
				localStorage.removeItem("refresh_token");
				window.location.href = "/login";
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export default api;
```

#### 2. 认证服务 (`src/services/authService.js`)

```javascript
import api from "./api";

const authService = {
	// 用户注册
	register: async (userData) => {
		try {
			const response = await api.post("/auth/register", userData);
			const { access_token, refresh_token, user } = response.data;

			// 存储Token
			localStorage.setItem("access_token", access_token);
			localStorage.setItem("refresh_token", refresh_token);
			localStorage.setItem("user", JSON.stringify(user));

			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},

	// 用户登录
	login: async (email, password) => {
		try {
			const response = await api.post("/auth/login", { email, password });
			const { access_token, refresh_token, user } = response.data;

			localStorage.setItem("access_token", access_token);
			localStorage.setItem("refresh_token", refresh_token);
			localStorage.setItem("user", JSON.stringify(user));

			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},

	// 用户登出
	logout: () => {
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
		localStorage.removeItem("user");
	},

	// 获取当前用户
	getCurrentUser: () => {
		const userStr = localStorage.getItem("user");
		return userStr ? JSON.parse(userStr) : null;
	},

	// 检查是否登录
	isAuthenticated: () => {
		return !!localStorage.getItem("access_token");
	},

	// 检查用户角色
	hasRole: (role) => {
		const user = authService.getCurrentUser();
		return user?.account_type === role;
	},
};

export default authService;
```

#### 3. 剧集服务 (`src/services/seriesService.js`)

```javascript
import api from "./api";

const seriesService = {
	// 获取所有剧集
	getAllSeries: async (params = {}) => {
		try {
			const response = await api.get("/series", { params });
			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},

	// 获取单个剧集
	getSeriesById: async (id) => {
		try {
			const response = await api.get(`/series/${id}`);
			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},

	// 创建剧集
	createSeries: async (seriesData) => {
		try {
			const response = await api.post("/series", seriesData);
			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},

	// 更新剧集
	updateSeries: async (id, seriesData) => {
		try {
			const response = await api.put(`/series/${id}`, seriesData);
			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},

	// 删除剧集
	deleteSeries: async (id) => {
		try {
			const response = await api.delete(`/series/${id}`);
			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},

	// 搜索剧集
	searchSeries: async (query) => {
		try {
			const response = await api.get("/series", {
				params: { search: query },
			});
			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},
};

export default seriesService;
```

#### 4. Redux Store 配置 (`src/store/store.js`)

```javascript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import seriesReducer from "./slices/seriesSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		series: seriesReducer,
		ui: uiReducer,
	},
});

export default store;
```

#### 5. 认证 Slice (`src/store/slices/authSlice.js`)

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

// 异步Thunks
export const login = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
	try {
		const data = await authService.login(email, password);
		return data;
	} catch (error) {
		return rejectWithValue(error);
	}
});

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
	try {
		const data = await authService.register(userData);
		return data;
	} catch (error) {
		return rejectWithValue(error);
	}
});

const initialState = {
	user: authService.getCurrentUser(),
	isAuthenticated: authService.isAuthenticated(),
	loading: false,
	error: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		logout: (state) => {
			authService.logout();
			state.user = null;
			state.isAuthenticated = false;
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Login
		builder.addCase(login.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(login.fulfilled, (state, action) => {
			state.loading = false;
			state.user = action.payload.user;
			state.isAuthenticated = true;
		});
		builder.addCase(login.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.error || "Login failed";
		});

		// Register
		builder.addCase(register.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(register.fulfilled, (state, action) => {
			state.loading = false;
			state.user = action.payload.user;
			state.isAuthenticated = true;
		});
		builder.addCase(register.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.error || "Registration failed";
		});
	},
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

#### 6. 登录页面 (`src/pages/LoginPage.jsx`)

```javascript
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, clearError } from "../store/slices/authSlice";
import { Container, Paper, TextField, Button, Typography, Box, Alert } from "@mui/material";

const LoginPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/dashboard");
		}
		return () => {
			dispatch(clearError());
		};
	}, [isAuthenticated, navigate, dispatch]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		dispatch(login(formData));
	};

	return (
		<Container maxWidth="sm">
			<Box sx={{ mt: 8 }}>
				<Paper elevation={3} sx={{ p: 4 }}>
					<Typography variant="h4" align="center" gutterBottom>
						登录
					</Typography>

					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					<form onSubmit={handleSubmit}>
						<TextField fullWidth label="邮箱" name="email" type="email" value={formData.email} onChange={handleChange} margin="normal" required />

						<TextField fullWidth label="密码" name="password" type="password" value={formData.password} onChange={handleChange} margin="normal" required />

						<Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }} disabled={loading}>
							{loading ? "登录中..." : "登录"}
						</Button>

						<Box sx={{ textAlign: "center" }}>
							<Typography variant="body2">
								还没有账户？{" "}
								<Link to="/register" style={{ textDecoration: "none" }}>
									立即注册
								</Link>
							</Typography>
						</Box>
					</form>
				</Paper>
			</Box>
		</Container>
	);
};

export default LoginPage;
```

#### 7. 剧集列表组件 (`src/components/series/SeriesList.jsx`)

```javascript
import React, { useState, useEffect } from "react";
import { Grid, Card, CardContent, CardMedia, CardActions, Typography, Button, TextField, Box, Pagination, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import seriesService from "../../services/seriesService";

const SeriesList = () => {
	const navigate = useNavigate();
	const [series, setSeries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchSeries();
	}, [page, searchQuery]);

	const fetchSeries = async () => {
		try {
			setLoading(true);
			const data = await seriesService.getAllSeries({
				page,
				per_page: 12,
				search: searchQuery,
			});
			setSeries(data.series);
			setTotalPages(data.pages);
		} catch (error) {
			console.error("Failed to fetch series:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e) => {
		setSearchQuery(e.target.value);
		setPage(1); // 重置到第一页
	};

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" mt={4}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<TextField fullWidth label="搜索剧集" variant="outlined" value={searchQuery} onChange={handleSearch} sx={{ mb: 3 }} />

			<Grid container spacing={3}>
				{series.map((item) => (
					<Grid item xs={12} sm={6} md={4} key={item.webseries_id}>
						<Card>
							<CardMedia component="img" height="200" image={`https://via.placeholder.com/300x200?text=${item.title}`} alt={item.title} />
							<CardContent>
								<Typography variant="h6" gutterBottom>
									{item.title}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									类型: {item.type}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									集数: {item.num_episodes}
								</Typography>
							</CardContent>
							<CardActions>
								<Button size="small" onClick={() => navigate(`/series/${item.webseries_id}`)}>
									查看详情
								</Button>
							</CardActions>
						</Card>
					</Grid>
				))}
			</Grid>

			{totalPages > 1 && (
				<Box display="flex" justifyContent="center" mt={4}>
					<Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
				</Box>
			)}
		</Box>
	);
};

export default SeriesList;
```

#### 8. 路由配置 (`src/routes.jsx`)

```javascript
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SeriesListPage from "./pages/SeriesListPage";
import SeriesDetailPage from "./pages/SeriesDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

// Protected Route组件
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
	const { isAuthenticated, user } = useSelector((state) => state.auth);

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (allowedRoles.length > 0 && !allowedRoles.includes(user?.account_type)) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
};

const AppRoutes = () => {
	return (
		<Routes>
			{/* Public Routes */}
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/series" element={<SeriesListPage />} />
			<Route path="/series/:id" element={<SeriesDetailPage />} />

			{/* Protected Routes */}
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<DashboardPage />
					</ProtectedRoute>
				}
			/>

			{/* Employee/Admin Only Routes */}
			<Route path="/admin/*" element={<ProtectedRoute allowedRoles={["Admin", "Employee"]}>{/* Admin routes here */}</ProtectedRoute>} />

			{/* 404 */}
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
};

export default AppRoutes;
```

---

## API 接口设计

### RESTful API 规范

#### 认证相关

| 方法 | 端点                 | 描述             | 认证          |
| ---- | -------------------- | ---------------- | ------------- |
| POST | `/api/auth/register` | 用户注册         | 否            |
| POST | `/api/auth/login`    | 用户登录         | 否            |
| POST | `/api/auth/refresh`  | 刷新 Token       | Refresh Token |
| GET  | `/api/auth/me`       | 获取当前用户信息 | 是            |

#### 剧集相关

| 方法   | 端点                       | 描述               | 认证 | 权限           |
| ------ | -------------------------- | ------------------ | ---- | -------------- |
| GET    | `/api/series`              | 获取剧集列表       | 否   | -              |
| GET    | `/api/series/:id`          | 获取剧集详情       | 否   | -              |
| POST   | `/api/series`              | 创建剧集           | 是   | Employee/Admin |
| PUT    | `/api/series/:id`          | 更新剧集           | 是   | Employee/Admin |
| DELETE | `/api/series/:id`          | 删除剧集           | 是   | Admin          |
| GET    | `/api/series/:id/episodes` | 获取剧集的所有单集 | 否   | -              |

#### 单集相关

| 方法   | 端点                | 描述         | 认证 | 权限           |
| ------ | ------------------- | ------------ | ---- | -------------- |
| GET    | `/api/episodes`     | 获取单集列表 | 否   | -              |
| GET    | `/api/episodes/:id` | 获取单集详情 | 否   | -              |
| POST   | `/api/episodes`     | 创建单集     | 是   | Employee/Admin |
| PUT    | `/api/episodes/:id` | 更新单集     | 是   | Employee/Admin |
| DELETE | `/api/episodes/:id` | 删除单集     | 是   | Admin          |

#### 反馈相关

| 方法   | 端点                | 描述         | 认证 | 权限        |
| ------ | ------------------- | ------------ | ---- | ----------- |
| GET    | `/api/feedback`     | 获取反馈列表 | 是   | -           |
| POST   | `/api/feedback`     | 创建反馈     | 是   | Customer    |
| PUT    | `/api/feedback/:id` | 更新反馈     | 是   | Owner       |
| DELETE | `/api/feedback/:id` | 删除反馈     | 是   | Owner/Admin |

#### 制作公司相关

| 方法   | 端点                         | 描述             | 认证 | 权限  |
| ------ | ---------------------------- | ---------------- | ---- | ----- |
| GET    | `/api/production-houses`     | 获取制作公司列表 | 否   | -     |
| GET    | `/api/production-houses/:id` | 获取制作公司详情 | 否   | -     |
| POST   | `/api/production-houses`     | 创建制作公司     | 是   | Admin |
| PUT    | `/api/production-houses/:id` | 更新制作公司     | 是   | Admin |
| DELETE | `/api/production-houses/:id` | 删除制作公司     | 是   | Admin |

### API 请求/响应示例

#### 1. 用户注册

**请求**:

```http
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "张",
  "last_name": "三",
  "email": "zhangsan@example.com",
  "password": "SecurePass123",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country_name": "USA"
}
```

**响应**:

```json
{
	"message": "User registered successfully",
	"user": {
		"account_id": "ACC1234567",
		"first_name": "张",
		"last_name": "三",
		"email": "zhangsan@example.com",
		"account_type": "Customer",
		"is_active": true
	},
	"access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
	"refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### 2. 获取剧集列表

**请求**:

```http
GET /api/series?page=1&per_page=20&search=drama&type=Drama
```

**响应**:

```json
{
	"series": [
		{
			"webseries_id": "WS12345678",
			"title": "Breaking Bad",
			"num_episodes": 62,
			"type": "Drama",
			"house_id": "PH001",
			"created_at": "2024-01-15T10:30:00Z"
		}
		// ... more series
	],
	"total": 150,
	"pages": 8,
	"current_page": 1
}
```

#### 3. 创建剧集

**请求**:

```http
POST /api/series
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "title": "Stranger Things",
  "type": "Sci-Fi",
  "num_episodes": 42,
  "house_id": "PH002"
}
```

**响应**:

```json
{
	"message": "Series created successfully",
	"series": {
		"webseries_id": "WS87654321",
		"title": "Stranger Things",
		"num_episodes": 42,
		"type": "Sci-Fi",
		"house_id": "PH002",
		"created_at": "2024-12-03T15:45:00Z"
	}
}
```

---

## 安全实现

### 1. SQL 注入防护

#### 使用 SQLAlchemy ORM（推荐）

```python
# ❌ 错误示例 - SQL注入漏洞
user_input = request.args.get('email')
query = f"SELECT * FROM qty_viewer_account WHERE email = '{user_input}'"
result = db.engine.execute(query)

# ✅ 正确示例 - 使用ORM
user_input = request.args.get('email')
result = ViewerAccount.query.filter_by(email=user_input).first()
```

#### 使用预编译语句

```python
from sqlalchemy import text

# ✅ 正确示例 - 预编译语句
user_input = request.args.get('email')
query = text("SELECT * FROM qty_viewer_account WHERE email = :email")
result = db.session.execute(query, {'email': user_input})
```

### 2. XSS 防护

#### 前端防护

```javascript
// 使用React的自动转义
const UserComment = ({ comment }) => {
	return <div>{comment}</div>; // React自动转义
};

// 如果必须使用HTML
import DOMPurify from "dompurify";

const SafeHTML = ({ html }) => {
	const sanitized = DOMPurify.sanitize(html);
	return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

#### 后端防护

```python
import html
from markupsafe import escape

@series_bp.route('/feedback', methods=['POST'])
@jwt_required()
def create_feedback():
    data = request.json

    # 清理用户输入
    feedback_text = escape(data.get('feedback_text', ''))

    # 或使用html.escape
    feedback_text = html.escape(data.get('feedback_text', ''))

    # ... 创建反馈
```

### 3. CSRF 防护

```python
from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)
    csrf.init_app(app)

    # 对于API端点，可以排除CSRF保护
    @csrf.exempt
    @app.route('/api/login', methods=['POST'])
    def login():
        pass
```

### 4. 密码加密

```python
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

# 加密密码
hashed = bcrypt.generate_password_hash('user_password').decode('utf-8')

# 验证密码
is_valid = bcrypt.check_password_hash(hashed, 'user_password')
```

### 5. JWT Token 安全

```python
from flask_jwt_extended import JWTManager, create_access_token

jwt = JWTManager()

# 配置
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # 生产环境使用环境变量
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# 生成Token
access_token = create_access_token(identity=user_id, fresh=True)
```

### 6. 输入验证

```python
from marshmallow import Schema, fields, validate, ValidationError

class SeriesSchema(Schema):
    title = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=64)
    )
    type = fields.Str(
        required=True,
        validate=validate.OneOf(['Drama', 'Comedy', 'Action', 'Thriller'])
    )
    num_episodes = fields.Int(
        validate=validate.Range(min=0)
    )

# 使用
schema = SeriesSchema()
try:
    data = schema.load(request.json)
except ValidationError as err:
    return jsonify({'errors': err.messages}), 400
```

### 7. 速率限制

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    pass
```

### 8. CORS 配置

```python
from flask_cors import CORS

# 生产环境配置
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://yourdomain.com"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

---

## 环境配置

### 后端 requirements.txt

```txt
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Bcrypt==1.0.1
Flask-JWT-Extended==4.6.0
Flask-CORS==4.0.0
Flask-Marshmallow==0.15.0
marshmallow-sqlalchemy==0.29.0
PyMySQL==1.1.0
python-dotenv==1.0.0
Flask-Limiter==3.5.0
```

### 前端 package.json

```json
{
	"name": "news-frontend",
	"version": "1.0.0",
	"dependencies": {
		"react": "^18.2.0",
		"react-dom": "^18.2.0",
		"react-router-dom": "^6.20.0",
		"@reduxjs/toolkit": "^2.0.0",
		"react-redux": "^9.0.0",
		"axios": "^1.6.0",
		"@mui/material": "^5.14.0",
		"@emotion/react": "^11.11.0",
		"@emotion/styled": "^11.11.0",
		"@mui/icons-material": "^5.14.0",
		"react-hook-form": "^7.48.0",
		"recharts": "^2.10.0",
		"dompurify": "^3.0.0"
	},
	"scripts": {
		"start": "react-scripts start",
		"build": "react-scripts build",
		"test": "react-scripts test"
	}
}
```

### 环境变量

#### 后端 (.env)

```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/news_db
```

#### 前端 (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 部署建议

### 本地开发

**后端**:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

**前端**:

```bash
cd frontend
npm install
npm start
```
