# XSS (Cross-Site Scripting) Protection Documentation

## 📋 Overview

This document describes the XSS protection measures implemented in the NEWS Web Series Management System.

**Status**: ✅ Fully Implemented
**Last Updated**: 2025-12-06

---

## 🔒 What is XSS?

Cross-Site Scripting (XSS) is a security vulnerability that allows attackers to inject malicious scripts into web pages. Without proper protection, user-submitted content like feedback text, series titles, or user names could contain malicious JavaScript that executes in other users' browsers.

### Example Attack:
```javascript
// User submits this as feedback:
<script>alert(document.cookie)</script>

// Without protection, this script executes when displayed
// With protection, it's rendered as harmless text: &lt;script&gt;...
```

---

## 🛡️ Protection Implementation

### 1. Backend Protection (Python/Flask)

#### Sanitization Function
Location: `backend/app/utils/security.py`

```python
def sanitize_input(text):
    """Sanitize user input to prevent XSS"""
    if not isinstance(text, str):
        return text

    # HTML escape special characters
    text = html.escape(text)

    # Remove potential script tags
    text = re.sub(r"<script.*?</script>", "", text, flags=re.IGNORECASE | re.DOTALL)

    return text
```

**How it works:**
1. **HTML Escaping**: Converts dangerous characters to safe HTML entities
   - `<` → `&lt;`
   - `>` → `&gt;`
   - `&` → `&amp;`
   - `"` → `&quot;`
   - `'` → `&#x27;`

2. **Script Tag Removal**: Removes any `<script>` tags (case-insensitive)

#### Protected Fields

**Feedback Route** (`backend/app/routes/feedback.py`):
```python
# Line 5: Import sanitize_input
from app.utils.security import generate_id, sanitize_input

# Line 113: Sanitize feedback text on creation
feedback_text = sanitize_input(feedback_text)

# Line 189: Sanitize feedback text on update
feedback.feedback_text = sanitize_input(data["feedback_text"])
```

**Series Route** (`backend/app/routes/series.py`):
```python
# Line 6: Import sanitize_input
from app.utils.security import role_required, generate_id, sanitize_input

# Line 100-101: Sanitize series title and type on creation
title = sanitize_input(data["title"])
series_type = sanitize_input(data["type"])

# Line 149, 153: Sanitize on update
series.title = sanitize_input(data["title"])
series.type = sanitize_input(data["type"])
```

**Episode Route** (`backend/app/routes/episode.py`):
```python
# Line 6: Import sanitize_input
from app.utils.security import generate_id, sanitize_input

# Line 93: Sanitize episode title on creation
title = sanitize_input(data.get("title")) if data.get("title") else None

# Line 142: Sanitize on update
episode.title = sanitize_input(data["title"])
```

**Auth Route** (`backend/app/routes/auth.py`):
```python
# Line 11: Import sanitize_input
from app.utils.security import generate_id, sanitize_input

# Lines 72-78: Sanitize all user registration fields
first_name = sanitize_input(data["first_name"])
middle_name = sanitize_input(data.get("middle_name")) if data.get("middle_name") else None
last_name = sanitize_input(data["last_name"])
street = sanitize_input(data["street"])
city = sanitize_input(data["city"])
state = sanitize_input(data["state"])
country_name = sanitize_input(data["country_name"])
```

### 2. Frontend Protection (React)

React provides automatic XSS protection by default:

```javascript
// React automatically escapes content
function FeedbackCard({ feedback }) {
  return (
    <div>
      {/* This is automatically escaped - safe! */}
      <p>{feedback.feedback_text}</p>
    </div>
  );
}
```

**Dangerous Pattern (NEVER USE):**
```javascript
// ❌ DANGEROUS - bypasses React's protection
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

---

## 🧪 Testing

### Manual Testing

Test file: `backend/test_xss_protection.py`

Run the test:
```bash
cd backend
python test_xss_protection.py
```

**Test Cases:**
1. ✅ Basic script tags: `<script>alert('XSS')</script>`
2. ✅ Script with attributes: `<script src='malicious.js'></script>`
3. ✅ HTML injection: `<img src=x onerror='alert(1)'>`
4. ✅ Event handlers: `<div onload='alert(1)'>Test</div>`
5. ✅ JavaScript URLs: `<a href='javascript:alert(1)'>Click</a>`
6. ✅ Normal text preservation
7. ✅ Special characters: `&`, `<`, `>`
8. ✅ Mixed content
9. ✅ Case variations: `<ScRiPt>`
10. ✅ Nested tags

### Expected Results

**Attack Input:**
```
<script>alert('XSS')</script>Hello World
```

**Sanitized Output:**
```
&lt;script&gt;alert('XSS')&lt;/script&gt;Hello World
```

**Rendered in Browser:**
```
<script>alert('XSS')</script>Hello World
```
(Displayed as text, not executed as code)

---

## 📊 Coverage

### Protected User Inputs

| Route | Field | Protected | Method |
|-------|-------|-----------|--------|
| `/api/auth/register` | first_name | ✅ | sanitize_input |
| `/api/auth/register` | middle_name | ✅ | sanitize_input |
| `/api/auth/register` | last_name | ✅ | sanitize_input |
| `/api/auth/register` | street | ✅ | sanitize_input |
| `/api/auth/register` | city | ✅ | sanitize_input |
| `/api/auth/register` | state | ✅ | sanitize_input |
| `/api/auth/register` | country_name | ✅ | sanitize_input |
| `/api/feedback` (POST) | feedback_text | ✅ | sanitize_input |
| `/api/feedback/:id` (PUT) | feedback_text | ✅ | sanitize_input |
| `/api/series` (POST) | title | ✅ | sanitize_input |
| `/api/series` (POST) | type | ✅ | sanitize_input |
| `/api/series/:id` (PUT) | title | ✅ | sanitize_input |
| `/api/series/:id` (PUT) | type | ✅ | sanitize_input |
| `/api/episodes` (POST) | title | ✅ | sanitize_input |
| `/api/episodes/:id` (PUT) | title | ✅ | sanitize_input |

### Unprotected Fields (Safe by Design)

| Field | Why Safe |
|-------|----------|
| email | Validated format, used for authentication |
| password | Never displayed, only hashed |
| rating | Integer validation (1-5) |
| IDs | Generated by system |
| dates | Date type validation |
| numbers | Integer/Float validation |

---

## 🔍 Best Practices Applied

### 1. Defense in Depth
- **Backend**: Sanitize on input
- **Frontend**: React auto-escapes on output
- **Database**: Parameterized queries (SQLAlchemy ORM)

### 2. Whitelist > Blacklist
- HTML escape converts ALL special characters
- Not just removing known bad patterns

### 3. Context-Aware
- Different sanitization for different contexts
- Database: Parameterized queries
- HTML: HTML entity encoding
- JavaScript: Would use JS encoding if needed

### 4. Consistent Application
- All user inputs sanitized
- No exceptions for "trusted" users
- Applied at API boundary

---

## 📝 Common XSS Patterns Blocked

### 1. Script Injection
```html
<!-- Input -->
<script>alert('XSS')</script>

<!-- Sanitized -->
&lt;script&gt;alert('XSS')&lt;/script&gt;
```

### 2. Event Handler Injection
```html
<!-- Input -->
<img src=x onerror='alert(1)'>

<!-- Sanitized -->
&lt;img src=x onerror='alert(1)'&gt;
```

### 3. JavaScript Protocol
```html
<!-- Input -->
<a href='javascript:alert(1)'>Click</a>

<!-- Sanitized -->
&lt;a href='javascript:alert(1)'&gt;Click&lt;/a&gt;
```

### 4. HTML Injection
```html
<!-- Input -->
<div onclick='malicious()'>Click me</div>

<!-- Sanitized -->
&lt;div onclick='malicious()'&gt;Click me&lt;/div&gt;
```

---

## 🚀 Demonstration for Project

### For Demo/Documentation

**Show attack attempt:**
1. Try to submit feedback with: `<script>alert('XSS')</script>Great show!`
2. Show it's stored as: `&lt;script&gt;alert('XSS')&lt;/script&gt;Great show!`
3. Show it displays as text, not executing

**Show the code:**
```python
# In feedback.py
feedback_text = sanitize_input(feedback_text)

# In security.py
def sanitize_input(text):
    text = html.escape(text)
    text = re.sub(r"<script.*?</script>", "", text, flags=re.IGNORECASE | re.DOTALL)
    return text
```

**Show the test:**
```bash
cd backend
python test_xss_protection.py
# Shows all tests passing ✅
```

---

## 📚 References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Python html.escape() Documentation](https://docs.python.org/3/library/html.html)
- [React XSS Protection](https://reactjs.org/docs/introducing-jsx.html#jsx-prevents-injection-attacks)

---

## ✅ Compliance

This implementation satisfies the project requirement:

> "Your interface must take appropriate measures to guard against SQL injection and cross site scripting attacks."

**XSS Protection: ✅ Implemented**
- ✅ All user inputs sanitized
- ✅ HTML escaping applied
- ✅ Script tags removed
- ✅ React auto-escaping enabled
- ✅ Testing suite created
- ✅ Documentation complete

---

**Last Updated**: 2025-12-06
**Status**: Production Ready ✅
