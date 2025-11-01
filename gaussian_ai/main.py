"""
Entry point for the Gaussian Splatting API server
This is a wrapper to maintain backward compatibility with the old execution method

Usage:
    conda activate codyssey
    python3 main.py
"""
if __name__ == "__main__":
    import os
    import sys
    import uvicorn
    from app.config import settings

    # Check if conda environment is activated
    conda_env = os.environ.get('CONDA_DEFAULT_ENV')
    if conda_env != 'codyssey':
        print("⚠️  Warning: conda environment 'codyssey' is not activated!")
        print("Please run: conda activate codyssey")
        sys.exit(1)

    print(f"✓ Running in conda environment: {conda_env}")
    print(f"✓ Starting server on http://{settings.HOST}:{settings.PORT}")

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
