"""
MySQL RDS database connection and helper functions
(SQLite는 내부 job tracking용, MySQL은 product/job_3dgs 업데이트용)
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
        # Extract connection info from DATABASE_URL if it's MySQL
        if settings.DATABASE_URL.startswith("mysql+pymysql://"):
            # Parse mysql+pymysql://user:pass@host:port/dbname
            import re
            match = re.match(
                r'mysql\+pymysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)',
                settings.DATABASE_URL
            )
            if match:
                user, password, host, port, database = match.groups()
                connection = pymysql.connect(
                    host=host,
                    port=int(port),
                    user=user,
                    password=password,
                    database=database,
                    charset='utf8mb4',
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=False
                )
                return connection
        
        # Fallback: Use environment variables directly
        connection = pymysql.connect(
            host=settings._db_host or 'localhost',
            port=int(settings._db_port or 3306),
            user=settings._db_user or 'root',
            password=settings._db_password or '',
            database=settings._db_name or 'marketplace',
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


def create_job_3dgs(
    product_id: str,
    s3_input_prefix: str,
    s3_output_prefix: str = None
) -> bool:
    """
    Create job_3dgs record with status='QUEUED'

    Args:
        product_id: Product UUID
        s3_input_prefix: S3 input path (NOT NULL)
        s3_output_prefix: S3 output path (optional)

    Returns:
        bool: Success status
    """
    try:
        with get_db_cursor() as cursor:
            now = datetime.now()
            
            cursor.execute("""
                INSERT INTO job_3dgs
                (product_id, status, s3_input_prefix, s3_output_prefix, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    status = VALUES(status),
                    s3_input_prefix = VALUES(s3_input_prefix),
                    s3_output_prefix = VALUES(s3_output_prefix),
                    updated_at = VALUES(updated_at)
            """, (
                product_id,
                'QUEUED',
                s3_input_prefix,
                s3_output_prefix,
                now,
                now
            ))

            logger.info(f"Created job_3dgs for {product_id}: status=QUEUED")
            return True

    except Exception as e:
        logger.error(f"Failed to create job_3dgs for {product_id}: {e}")
        return False


def update_job_3dgs_status(
    product_id: str,
    status: str,
    log: str = None,
    error_msg: str = None,
    s3_output_prefix: str = None
) -> bool:
    """
    Update job_3dgs status (RUNNING, DONE, FAILED)

    Args:
        product_id: Product UUID
        status: QUEUED, RUNNING, DONE, FAILED
        log: Processing log
        error_msg: Error message if failed
        s3_output_prefix: S3 output path (for DONE status)

    Returns:
        bool: Success status
    """
    try:
        with get_db_cursor() as cursor:
            now = datetime.now()
            
            # Build dynamic UPDATE query
            update_fields = [
                "status = %s",
                "updated_at = %s"
            ]
            params = [status, now]
            
            if log is not None:
                update_fields.append("log = %s")
                params.append(log)
            
            if error_msg is not None:
                update_fields.append("error_msg = %s")
                params.append(error_msg)
            
            if s3_output_prefix is not None:
                update_fields.append("s3_output_prefix = %s")
                params.append(s3_output_prefix)
            
            if status in ['DONE', 'FAILED']:
                update_fields.append("completed_at = %s")
                params.append(now)
            
            params.append(product_id)
            
            query = f"""
                UPDATE job_3dgs
                SET {', '.join(update_fields)}
                WHERE product_id = %s
            """
            
            cursor.execute(query, tuple(params))

            logger.info(f"Updated job_3dgs for {product_id}: status={status}")
            return True

    except Exception as e:
        logger.error(f"Failed to update job_3dgs for {product_id}: {e}")
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
