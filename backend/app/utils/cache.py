"""
Redis caching utilities
"""
import json
import redis
from functools import wraps
from flask import current_app, request


class RedisCache:
    """Redis cache manager"""
    
    def __init__(self):
        self.redis_client = None
    
    def init_app(self, app):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(
                app.config['REDIS_URL'],
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test connection
            self.redis_client.ping()
            app.logger.info("Redis connection established")
        except Exception as e:
            app.logger.error(f"Redis connection failed: {e}")
            self.redis_client = None
    
    def get(self, key):
        """Get value from cache"""
        if not self.redis_client:
            return None
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            current_app.logger.error(f"Redis GET error: {e}")
            return None
    
    def set(self, key, value, timeout=None):
        """Set value in cache"""
        if not self.redis_client:
            return False
        try:
            timeout = timeout or current_app.config.get('CACHE_DEFAULT_TIMEOUT', 300)
            self.redis_client.setex(
                key,
                timeout,
                json.dumps(value)
            )
            return True
        except Exception as e:
            current_app.logger.error(f"Redis SET error: {e}")
            return False
    
    def delete(self, key):
        """Delete key from cache"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            current_app.logger.error(f"Redis DELETE error: {e}")
            return False
    
    def delete_pattern(self, pattern):
        """Delete all keys matching pattern"""
        if not self.redis_client:
            return False
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
            return True
        except Exception as e:
            current_app.logger.error(f"Redis DELETE PATTERN error: {e}")
            return False
    
    def clear_all(self):
        """Clear all cache"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.flushdb()
            return True
        except Exception as e:
            current_app.logger.error(f"Redis FLUSHDB error: {e}")
            return False


# Global cache instance
cache = RedisCache()


def cache_response(timeout=None, key_prefix='view'):
    """
    Decorator to cache API responses

    Usage:
        @cache_response(timeout=300, key_prefix='series')
        def get_series():
            return series_data
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            from flask import Response

            # Build cache key from request path and query parameters
            cache_key = f"{key_prefix}:{request.path}:{request.query_string.decode('utf-8')}"

            # Try to get from cache
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                current_app.logger.debug(f"Cache HIT: {cache_key}")
                # Return cached data as Flask response
                response_data, status_code = cached_data
                from flask import jsonify
                return jsonify(response_data), status_code

            # Execute function and cache result
            current_app.logger.debug(f"Cache MISS: {cache_key}")
            result = f(*args, **kwargs)

            # Handle Flask Response objects
            if isinstance(result, Response):
                # Extract data from Response
                if result.status_code == 200:
                    data = result.get_json()
                    cache.set(cache_key, (data, result.status_code), timeout)
                return result
            elif isinstance(result, tuple):
                # Handle (response, status_code) tuple
                response, status_code = result
                if isinstance(response, Response) and status_code == 200:
                    data = response.get_json()
                    cache.set(cache_key, (data, status_code), timeout)
                return result
            else:
                # Direct data return
                cache.set(cache_key, (result, 200), timeout)
                return result

        return decorated_function
    return decorator


def invalidate_cache(patterns):
    """
    Decorator to invalidate cache patterns after modification
    
    Usage:
        @invalidate_cache(['series:*', 'view:/api/series*'])
        def create_series():
            return new_series
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Execute function first
            result = f(*args, **kwargs)
            
            # Invalidate cache patterns
            for pattern in patterns:
                cache.delete_pattern(pattern)
                current_app.logger.debug(f"Cache invalidated: {pattern}")
            
            return result
        
        return decorated_function
    return decorator
