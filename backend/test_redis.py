#!/usr/bin/env python3
from app import create_app
from app.utils.cache import cache

app = create_app('production')

with app.app_context():
    if cache.redis_client:
        print("✓ Redis connected")
        cache.set("test_key", {"message": "Hello from Redis"}, 60)
        result = cache.get("test_key")
        print(f"✓ Test data: {result}")
        cache.delete("test_key")
        print("✓ Cache operations working")
    else:
        print("✗ Redis not connected")
