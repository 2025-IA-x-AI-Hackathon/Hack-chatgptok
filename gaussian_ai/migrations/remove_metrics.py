"""
DB Migration: Remove evaluation metrics columns

- Removes: psnr, ssim, lpips, gaussian_count, filtered_count, removed_count, file_size_mb
- Reason: Not needed for MVP, saves 30-60s per job
"""
import sqlite3
from pathlib import Path

def migrate():
    db_path = Path(__file__).parent.parent / "data" / "jobs.db"

    if not db_path.exists():
        print(f"❌ Database not found: {db_path}")
        print("   Database will be created with new schema on first run.")
        return

    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    print("📊 Starting migration: remove evaluation metrics...")

    # SQLite doesn't support ALTER TABLE DROP COLUMN
    # So we need to recreate the table

    # 1. Create backup table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs_backup AS
        SELECT * FROM jobs
    """)
    print("✓ Backup created")

    # 2. Drop old table
    cursor.execute("DROP TABLE IF EXISTS jobs")
    print("✓ Old table dropped")

    # 3. Create new table (without metrics columns)
    cursor.execute("""
        CREATE TABLE jobs (
            job_id TEXT PRIMARY KEY,
            pub_key TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL,
            step TEXT,
            progress INTEGER DEFAULT 0,
            original_resolution INTEGER DEFAULT 0,
            image_count INTEGER DEFAULT 0,
            iterations INTEGER DEFAULT 10000,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            error_message TEXT,
            error_stage TEXT,
            retry_count INTEGER DEFAULT 0,
            colmap_registered_images INTEGER,
            colmap_points INTEGER,
            processing_time_seconds REAL
        )
    """)
    print("✓ New table created (metrics columns removed)")

    # 4. Copy data (excluding removed columns)
    cursor.execute("""
        INSERT INTO jobs
        SELECT
            job_id, pub_key, status, step, progress,
            original_resolution, image_count, iterations,
            created_at, started_at, completed_at,
            error_message, error_stage, retry_count,
            colmap_registered_images, colmap_points, processing_time_seconds
        FROM jobs_backup
    """)
    print("✓ Data migrated")

    # 5. Drop backup table
    cursor.execute("DROP TABLE jobs_backup")
    print("✓ Backup table dropped")

    # 6. Recreate indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_pub_key ON jobs(pub_key)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)")
    print("✓ Indexes recreated")

    conn.commit()
    conn.close()

    print("✅ Migration completed successfully!")
    print("   Removed columns:")
    print("   - psnr, ssim, lpips (evaluation metrics)")
    print("   - gaussian_count, filtered_count, removed_count, file_size_mb")
    print("")
    print("💡 Effect: Saves 30-60 seconds per job (no evaluation)")

if __name__ == "__main__":
    migrate()
