"""
Logging utilities
"""
import logging
from app.config import settings


def setup_logger(name: str) -> logging.Logger:
    """Setup logger with consistent formatting"""
    logger = logging.getLogger(name)
    logger.setLevel(settings.LOG_LEVEL)

    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(settings.LOG_FORMAT)
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
