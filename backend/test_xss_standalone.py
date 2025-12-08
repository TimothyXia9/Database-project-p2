"""
Standalone XSS Protection Test
Tests sanitize_input function without importing Flask app
"""

import html
import re


def sanitize_input(text):
    """Sanitize user input to prevent XSS"""
    if not isinstance(text, str):
        return text

    # HTML escape
    text = html.escape(text)

    # Remove potential script tags
    text = re.sub(r"<script.*?</script>", "", text, flags=re.IGNORECASE | re.DOTALL)

    return text


def test_xss_protection():
    """Test various XSS attack vectors"""

    print("=" * 60)
    print("XSS Protection Test Suite")
    print("=" * 60)

    test_cases = [
        # Basic script tags
        {
            "name": "Basic Script Tag",
            "input": "<script>alert('XSS')</script>",
            "expected_safe": True
        },
        # Script with attributes
        {
            "name": "Script with Attributes",
            "input": "<script src='malicious.js'></script>",
            "expected_safe": True
        },
        # HTML injection
        {
            "name": "HTML Injection",
            "input": "<img src=x onerror='alert(1)'>",
            "expected_safe": True
        },
        # Event handlers
        {
            "name": "Event Handler",
            "input": "<div onload='alert(1)'>Test</div>",
            "expected_safe": True
        },
        # JavaScript URL
        {
            "name": "JavaScript URL",
            "input": "<a href='javascript:alert(1)'>Click</a>",
            "expected_safe": True
        },
        # Normal text (should remain unchanged except HTML escaping)
        {
            "name": "Normal Text",
            "input": "This is a normal comment",
            "expected_safe": True
        },
        # Text with special characters
        {
            "name": "Special Characters",
            "input": "I love Breaking Bad & The Crown!",
            "expected_safe": True
        },
        # Mixed content
        {
            "name": "Mixed Content",
            "input": "Great show! <script>alert('xss')</script> Highly recommended!",
            "expected_safe": True
        },
        # Case variations
        {
            "name": "Case Variation",
            "input": "<ScRiPt>alert('xss')</sCrIpT>",
            "expected_safe": True
        },
        # Nested tags
        {
            "name": "Nested Tags",
            "input": "<div><script>alert('xss')</script></div>",
            "expected_safe": True
        }
    ]

    passed = 0
    failed = 0

    for i, test in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test['name']}")
        print(f"Input:  {test['input']}")

        sanitized = sanitize_input(test['input'])
        print(f"Output: {sanitized}")

        # Check if dangerous HTML tags are properly escaped
        # Safe if < and > are converted to &lt; and &gt;
        has_dangerous_tags = (
            "<script" in sanitized.lower() or
            "<img" in sanitized.lower() or
            "<div" in sanitized.lower() or
            "<a" in sanitized.lower()
        )

        # Also check if HTML entities are used (indicating proper escaping)
        has_html_escaping = "&lt;" in sanitized or "&gt;" in sanitized

        # If input had tags and they're escaped, it's safe
        # If input had tags and they're NOT escaped, it's dangerous
        input_has_tags = "<" in test['input'] and ">" in test['input']

        if input_has_tags:
            # If input had tags, we expect them to be escaped
            is_safe = has_html_escaping and not has_dangerous_tags
        else:
            # If input didn't have tags, just make sure no tags were added
            is_safe = not has_dangerous_tags

        if is_safe:
            print("✅ PASS - XSS content neutralized")
            passed += 1
        else:
            print("❌ FAIL - Potential XSS vulnerability detected!")
            failed += 1

    print("\n" + "=" * 60)
    print(f"Results: {passed} passed, {failed} failed out of {len(test_cases)} tests")
    print("=" * 60)

    if failed == 0:
        print("\n✅ All XSS protection tests PASSED!")
    else:
        print(f"\n❌ {failed} test(s) FAILED!")

    return failed == 0


if __name__ == "__main__":
    success = test_xss_protection()
    exit(0 if success else 1)
