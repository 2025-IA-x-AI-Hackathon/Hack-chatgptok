# GitHub Secret Scanning Alerts - False Positives

This document explains the GitHub Secret Scanning alerts for this repository.

## Summary

All current secret scanning alerts are **false positives**. The detected "secrets" are binary data patterns in HDR image files that coincidentally match API key patterns, not actual credentials.

## Alerts

### 1. Stripe Legacy API Key
- **File**: `viewer/static/skybox/vignaioli_night_2k.hdr` (Line 1688)
- **Status**: False Positive
- **Reason**: HDR files contain binary image data. The detected pattern is part of the binary pixel data, not an actual Stripe API key.

### 2. Tencent WeChat API App ID
- **File**: `viewer/static/skybox/circus_arena_2k.hdr` (Line 1290)
- **Status**: False Positive
- **Reason**: HDR files contain binary image data. The detected pattern is part of the binary pixel data, not an actual WeChat API key.

## Why This Happens

HDR (High Dynamic Range) files store image data in binary format. When these binary files are scanned as text, random byte sequences can match patterns that look like API keys or secrets. This is a known issue with secret scanning tools when applied to binary files.

## Verification

You can verify these are image files and not secret keys:

```bash
# Check file type
file viewer/static/skybox/vignaioli_night_2k.hdr
# Output: Radiance RGBE image data

file viewer/static/skybox/circus_arena_2k.hdr
# Output: Radiance RGBE image data

# Check if files are actually HDR images
head -1 viewer/static/skybox/vignaioli_night_2k.hdr
# Output: #?RADIANCE (HDR format signature)
```

## Source

These HDR files are part of the PlayCanvas Model Viewer project and are publicly available skybox images for 3D scene backgrounds. They come from the official PlayCanvas repository:

- Repository: https://github.com/playcanvas/model-viewer
- License: MIT License
- Purpose: Environment lighting and skybox backgrounds for 3D viewer

## Resolution

To resolve these alerts in GitHub:

1. Go to **Security** tab → **Secret scanning alerts**
2. Click on each alert
3. Select **"Dismiss alert"** → **"False positive"**
4. Add comment: "Binary data in HDR image file, not an actual secret"

## Prevention

These false positives cannot be prevented while including HDR files in the repository. Options:

1. **Dismiss as false positive** (Recommended) - Maintains full functionality
2. **Use Git LFS** - Store large binary files separately
3. **Exclude from scanning** - Add to `.gitattributes`:
   ```
   *.hdr binary linguist-generated=true
   ```

We recommend option 1 (dismiss as false positive) as it's the simplest solution that maintains all functionality.

## Contact

If you have questions about these alerts, please open an issue in the repository.
