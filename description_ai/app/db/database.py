"""
MySQL database connection and helper functions
"""
import pymysql
import logging
from contextlib import contextmanager
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)


def get_mysql_connection():
    """
    Create MySQL database connection

    Returns:
        pymysql.Connection: MySQL connection object
    """
    try:
        connection = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False
        )
        return connection
    except Exception as e:
        logger.error(f"Failed to connect to MySQL: {e}")
        raise


@contextmanager
def get_db_cursor():
    """
    Context manager for database cursor

    Usage:
        with get_db_cursor() as cursor:
            cursor.execute("SELECT * FROM table")
            results = cursor.fetchall()
    """
    connection = None
    try:
        connection = get_mysql_connection()
        cursor = connection.cursor()
        yield cursor
        connection.commit()
    except Exception as e:
        if connection:
            connection.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        if connection:
            connection.close()


def update_fault_description(
    product_id: str,
    markdown: str,
    status: str = 'DONE',
    error_msg: str = None
) -> bool:
    """
    Update fault_description table

    Args:
        product_id: Product UUID
        markdown: Markdown summary
        status: QUEUED, RUNNING, DONE, FAILED
        error_msg: Error message if failed

    Returns:
        bool: Success status
    """
    try:
        with get_db_cursor() as cursor:
            # Check if record exists
            cursor.execute(
                "SELECT product_id FROM fault_description WHERE product_id = %s",
                (product_id,)
            )
            exists = cursor.fetchone()

            now = datetime.now()

            if exists:
                # Update existing record
                cursor.execute("""
                    UPDATE fault_description
                    SET markdown = %s,
                        status = %s,
                        error_msg = %s,
                        updated_at = %s,
                        completed_at = %s
                    WHERE product_id = %s
                """, (
                    markdown,
                    status,
                    error_msg,
                    now,
                    now if status in ['DONE', 'FAILED'] else None,
                    product_id
                ))
            else:
                # Insert new record
                cursor.execute("""
                    INSERT INTO fault_description
                    (product_id, markdown, status, error_msg, created_at, updated_at, completed_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    product_id,
                    markdown,
                    status,
                    error_msg,
                    now,
                    now,
                    now if status in ['DONE', 'FAILED'] else None
                ))

            logger.info(f"Updated fault_description for {product_id}: status={status}")
            return True

    except Exception as e:
        logger.error(f"Failed to update fault_description for {product_id}: {e}")
        return False


def increment_job_count_and_activate(product_id: str) -> bool:
    """
    Increment product.job_count and activate if job_count reaches 2
    (Both fault_desc and 3DGS jobs completed)

    Args:
        product_id: Product UUID

    Returns:
        bool: Success status
    """
    try:
        with get_db_cursor() as cursor:
            # Atomically increment job_count and update sell_status if needed
            cursor.execute("""
                UPDATE product
                SET job_count = job_count + 1,
                    sell_status = CASE
                        WHEN job_count + 1 >= 3 THEN 'ACTIVE'
                        ELSE sell_status
                    END,
                    updated_at = %s
                WHERE product_id = %s
            """, (datetime.now(), product_id))

            # Get updated values
            cursor.execute(
                "SELECT job_count, sell_status FROM product WHERE product_id = %s",
                (product_id,)
            )
            result = cursor.fetchone()

            if result:
                logger.info(
                    f"Updated product {product_id}: "
                    f"job_count={result['job_count']}, "
                    f"sell_status={result['sell_status']}"
                )
                return True
            else:
                logger.error(f"Product {product_id} not found")
                return False

    except Exception as e:
        logger.error(f"Failed to increment job_count for {product_id}: {e}")
        return False


def update_product_sell_status(product_id: str, sell_status: str) -> bool:
    """
    Update product.sell_status (FAILED 처리용)

    Args:
        product_id: Product UUID
        sell_status: 'FAILED' or other status

    Returns:
        bool: Success status
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
                UPDATE product
                SET sell_status = %s,
                    updated_at = %s
                WHERE product_id = %s
            """, (sell_status, datetime.now(), product_id))

            logger.info(f"Updated product {product_id}: sell_status={sell_status}")
            return True

    except Exception as e:
        logger.error(f"Failed to update sell_status for {product_id}: {e}")
        return False
