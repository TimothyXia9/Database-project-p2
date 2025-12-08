# Database Project Part II - Requirements

## 📋 Table of Contents
1. [General Description](#general-description)
2. [Core Requirements](#core-requirements)
3. [Technical Requirements](#technical-requirements)
4. [Security Requirements](#security-requirements)
5. [Documentation Requirements](#documentation-requirements)
6. [SQL Query Requirements](#sql-query-requirements)
7. [Extra Credit Opportunities](#extra-credit-opportunities)
8. [Demo Requirements](#demo-requirements)

---

## 🎯 General Description

Create a **web-based user interface** for the database schema designed in Part I.

### Key Features Required:
- User registration and login
- CRUD operations (Create, Insert, Update, Read, Delete)
- **Multiple user types** with different authorization levels:
  - Customers (viewers)
  - Employees (content managers)
  - Admins (full access)

### Design Freedom:
- Choose your own look and feel
- Add useful features beyond basic requirements
- Design a neat and functional system
- Can revise Part I database design as needed

---

## 🛠️ Core Requirements

### 1. Web Interface
- ✅ All operations via standard web browser
- ✅ Server-side program connects to database
- ✅ Calls stored procedures or sends queries
- ✅ Returns results as web pages

### 2. Technology Stack
**Allowed Frameworks:**
- PHP
- Java
- Django
- Python (Flask/FastAPI)
- Ruby on Rails

**Backend Database:**
- ✅ Relational database (MySQL recommended)
- ✅ Based on Part I schema with improvements

---

## 🔒 Security Requirements

### 1. Password Security
- ✅ **MUST** encrypt passwords before storing
- ✅ Use strong hashing algorithms (bcrypt, argon2)

### 2. SQL Injection Prevention
**Required Measures:**
- ✅ Use stored procedures
- ✅ Use prepared statements
- ✅ Sanitize all user inputs
- ✅ Never concatenate user input into query strings

### 3. Cross-Site Scripting (XSS) Prevention
**Required Measures:**
- ✅ Sanitize all user inputs
- ✅ Use functions like `htmlspecialchars` (PHP)
- ✅ Escape output in templates
- ✅ Use Content Security Policy headers

### 4. API Design
- ✅ RESTful API design **recommended**

### 5. Transaction Management
**Required:**
- ✅ Appropriate transactions for concurrent users
- ✅ Deadlock prevention mechanisms
- ✅ ACID compliance

---

## 📝 Documentation Requirements

Your project documentation **MUST** include:

### 1. Cover Page
- [ ] Course name and section
- [ ] Team member names and Student IDs
- [ ] Submission date

### 2. Table of Contents
- [ ] Complete ToC with page numbers

### 3. Executive Summary (~1 page)
**Must Include:**
- [ ] Business case description
- [ ] Approach to business solution
- [ ] Business performance improvements
- [ ] Logical and Relational Model design
- [ ] Assumptions made in design

### 4. Technical Details
- [ ] Software used
- [ ] Programming languages
- [ ] Database system (MySQL, PostgreSQL, etc.)

### 5. Database Schema
- [ ] DDL file content (from Data Modeler)
- [ ] List of all tables
- [ ] Total number of records in each table

### 6. Application Screenshots
- [ ] User sessions
- [ ] Different pages/menus
- [ ] Key features demonstration

### 7. Security Features
- [ ] Detailed explanation of implemented security measures
- [ ] Password encryption method
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Transaction handling

### 8. Lessons Learned
**Reflection on:**
- [ ] What you learned from the project
- [ ] What went well
- [ ] What didn't go well
- [ ] Constraints faced (time, coordination, etc.)

---

## 🔍 SQL Query Requirements

You **MUST** provide **6 SQL queries** demonstrating:

### Q1: Table Joins
- ✅ **At least 3 tables** in join
- Example: Join web_series, episode, feedback

### Q2: Multi-row Subquery
- ✅ Subquery returns multiple rows
- Example: `WHERE series_id IN (SELECT ...)`

### Q3: Correlated Subquery
- ✅ Subquery references outer query
- Example: `WHERE rating > (SELECT AVG(rating) WHERE ...)`

### Q4: SET Operator Query
- ✅ Use UNION, INTERSECT, or EXCEPT
- Example: Combine results from multiple queries

### Q5: Inline View or WITH Clause
- ✅ Use Common Table Expression (CTE)
- Example: `WITH top_series AS (...) SELECT ...`

### Q6: TOP-N/BOTTOM-N Query
- ✅ Get top or bottom N records
- Example: Top 10 rated series

### For Each Query, Submit:
- **A1)** The SELECT query
- **A2)** Query results (screenshot or data)
- **A3)** Business question it answers

**Requirements for all queries:**
- ✅ Proper column aliases
- ✅ Built-in functions (COUNT, AVG, SUM, etc.)
- ✅ Appropriate sorting (ORDER BY)

---

## 🌟 Extra Credit Opportunities (Up to 6%)

Extra credit is **up to 6% of Part II score**.

**Note:** Extra credit applies to Part II only. If you exceed 100 points, overflow applies to prior assignments/exams.

### Option 1: Advanced Architecture
**Implementation:**
- ✅ Cache (Redis, Memcached)
- ✅ Containers (Docker, Kubernetes)
- ✅ Serverless architecture
- ✅ High availability and scalability

**Documentation Required:**
- [ ] Architecture diagram
- [ ] Performance comparison
- [ ] Scalability demonstration

### Option 2: Database Indexing
**Requirements:**
- ✅ Build correct indexes for high-frequency queries
- ✅ **Show HOW and WHY** you built the index
- ✅ **Demonstrate performance improvement**
- ✅ Document experiment/analysis process

**Must Include:**
- [ ] Before/after query performance
- [ ] EXPLAIN ANALYZE output
- [ ] Performance metrics and graphs

### Option 3: Data Visualization
**Implementation:**
- ✅ Interesting graphs/charts
- ✅ Data analysis dashboards
- ✅ Interactive visualizations

**Examples:**
- Series popularity trends
- User engagement metrics
- Rating distributions

### Option 4: Advanced Security
**Features:**
- ✅ Password reset with security checks
- ✅ Stored procedures for data operations
- ✅ User-defined functions
- ✅ History tables (audit trails)
- ✅ Login attempt tracking

---

## 🎤 Demo Requirements

### When & Where
- ✅ End of semester
- ✅ Remote demo via Zoom
- ✅ Register for time slots (first-come-first-serve)

### Requirements
- ✅ **ALL team members MUST be present**
- ✅ NO show = 0 points
- ✅ Must be able to access your system
- ✅ Can run locally on laptop (share screen)
- ✅ Or use cloud-based deployment

### What to Demo
1. **System functionality**
   - User registration/login
   - CRUD operations
   - Different user roles
   - Security features

2. **Source code**
   - Be able to show and explain code
   - Demonstrate security measures
   - Explain architecture decisions

3. **Database**
   - Show database schema
   - Demonstrate queries
   - Show stored procedures
   - Explain indexing strategy

4. **Sample data**
   - Input interesting test data
   - Demonstrate realistic use cases

### Grading Criteria
- ✅ Feature completeness
- ✅ System attractiveness and convenience
- ✅ Documentation quality (**IMPORTANT!**)
- ✅ Architecture appropriateness
- ✅ Proper use of RDBMS features

---

## ✅ Quick Checklist

### Core Requirements
- [ ] Web interface working
- [ ] User registration/login
- [ ] CRUD operations for all entities
- [ ] Role-based access control
- [ ] RESTful API
- [ ] Password encryption
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Transaction management
- [ ] MySQL database

### Documentation
- [ ] Executive summary
- [ ] Technical details
- [ ] DDL file
- [ ] Table list with record counts
- [ ] Application screenshots
- [ ] Security features explanation
- [ ] Lessons learned
- [ ] 6 SQL queries with results and business purpose

### Extra Credit (Optional)
- [ ] Caching implementation
- [ ] Containerization (Docker)
- [ ] Database indexing with analysis
- [ ] Data visualization
- [ ] Advanced security features

### Demo Preparation
- [ ] All team members available
- [ ] System accessible and working
- [ ] Sample data loaded
- [ ] Can explain source code
- [ ] Can demonstrate all features

---

## 📞 Contact

For technical questions, contact the TAs.

---

**Last Updated:** 2025-12-06
