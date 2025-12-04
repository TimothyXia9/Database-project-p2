### 项目目标

设计一个关系数据库系统,用于管理 Netflix 的网络剧集(Web Series)。这是两部分项目的第一部分:

-   **Part 1**: 数据库设计与实现(当前)
-   **Part 2**: Web 前端开发(后续)

---

## 核心实体与属性

### 1. 制片人 (Producer)

-   姓名 (name)
-   地址 (address)
-   电话号码 (phone number)
-   邮箱地址 (email address)

### 2. 制作公司 (Production House)

-   名称 (name)
-   地址 (address)
-   成立年份 (year established)

### 3. 网络剧集 (Web Series)

-   名称 (name)
-   剧集数 (number of episodes)
-   语言 (language)
-   字幕 (subtitle)
-   配音语言 (dubbing language)
-   发行国家 (country of release)
-   发行日期 (release date)
-   剧集类型 (type of web series)

### 4. 观众账户 (Viewer Account) - 扩展阶段新增

-   账户 ID (account id)
-   账户持有人全名 (full name)
-   完整地址 (full address, 包括国家名称)
-   开户日期 (date account was opened)
-   月服务费 (monthly service charge)

### 5. 观众反馈 (Feedback) - 扩展阶段新增

-   反馈文本 (feedback text)
-   评分 (rating: 1-5 分)
-   反馈日期 (feedback date)

---

## 业务规则详解

### 试点阶段业务规则

#### 合同管理

-   Netflix 为每部网络剧创建**一年期合同**(从合同日期起算)
-   合同可以**逐年续约**(从上一合同到期日起)
-   Netflix 按**单集**向制作公司收费
-   续约时**费用可调整**

#### 剧集特性

-   一部剧集可以配**一种或多种配音语言**
-   一部剧集可以有**一个或多个字幕**
-   一部剧集可以在**一个或多个国家**发行
-   剧集类型包括:
    -   Comedy(喜剧)
    -   Drama(剧情)
    -   Romance(浪漫)
    -   History(历史)
    -   Scientific(科幻)
    -   Animation(动画)
    -   Food(美食)
    -   Travel(旅行)
    -   Animal Planet(动物)
    -   Action(动作)
    -   Thriller(惊悚)
    -   Crime(犯罪)
    -   等等

#### 制片人与制作公司关系

-   一个制片人可以关联**多个制作公司**
-   一个制作公司可以关联**多个制片人**
-   关系类型: **多对多 (Many-to-Many)**

#### 试点范围限制

-   **仅限美国发行的网络剧**
-   但制作公司和制片人可以来自国外

### 需要记录的剧集详细信息

#### 播出时间表 (Schedule)

-   剧集的开始日期和时间
-   剧集的结束日期和时间
-   时间表可以根据需要**随时调整**

#### 观看数据

-   **总观看人数** (Total number of viewers)

#### 技术状况

-   **技术中断记录** (Technical Interruption)
    -   记录为: Yes 或 No

---

## 扩展阶段业务规则 (GHW1 后)

### 范围扩展

-   从**仅美国**扩展到**全球发行**
-   需要记录**发行国家名称**
-   网络剧集与国家关系:
    -   一部剧集可以在**多个国家**发行
    -   一个国家可以有**多部剧集**发行
    -   关系类型: **多对多 (Many-to-Many)**

### 观众账户系统

-   存储观众账户详细信息
-   包含完整地址(含国家信息)
-   记录开户日期和月费信息

### 观众反馈系统

-   观众可以对**多部网络剧**提供反馈
-   但对**每部剧集只能写一次反馈**
-   反馈内容包括:
    -   文字反馈
    -   评分(1-5 分,从低到高)
    -   反馈日期
