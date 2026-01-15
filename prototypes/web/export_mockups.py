#!/usr/bin/env python3
"""
Export all Frame0 mockups as PNG and create comprehensive PDF
"""
import json
import base64
import subprocess
from pathlib import Path

# Define all screens in order
SCREENS = [
    # Onboarding (3 screens)
    {"id": "bFxVxGyEjNjl-O5NdYo3l", "name": "01_Onboarding_Language_Selection"},
    {"id": "QMZrjWF90WvjcuKPMEMaS", "name": "02_Onboarding_Welcome"},
    {"id": "R_qFnPd-1k2t4ujXlSBnT", "name": "03_Onboarding_First_Capture"},

    # Main App Flow (6 screens)
    {"id": "6rBdHqKyKL7m-02P2dfMx", "name": "04_Home_Today"},
    {"id": "xzmgqEBeerdWv7UXkgNw3", "name": "05_Quick_Capture"},
    {"id": "ywJmyJUo0VcDgtRNUWzNq", "name": "06_Review_Session"},
    {"id": "BSNhUZQ31WKPLmhQJHvHP", "name": "07_Review_Immediate_Feedback"},
    {"id": "NOVVYUHr0-arsyky5CV12", "name": "08_Done_For_Today"},
    {"id": "ntNw_Ip6wqV7FIup_PQm9", "name": "09_Ready_To_Use_Celebration"},

    # Reference Screens (4 screens)
    {"id": "0M6X85P5kILsY5gcWM4qX", "name": "10_Notebook_Browse_Words"},
    {"id": "pVJcuX67RRdzbrcloek5R", "name": "11_Progress"},
    {"id": "AFQ-WusaCY2O7domBKc5C", "name": "12_Word_Detail_View"},
    {"id": "lkvTr-rKTaAlsbm4JvLRe", "name": "13_Info_How_LLYLI_Works"},
]

OUTPUT_DIR = Path(__file__).parent
PNG_DIR = OUTPUT_DIR / "mockups"
PNG_DIR.mkdir(exist_ok=True)

def export_screen(screen_id, filename):
    """Export a single screen as PNG using Frame0 MCP"""
    # Note: This needs to be called via Claude Code MCP tools
    # This script serves as documentation of the export process
    print(f"Exporting {filename}...")
    return True

def create_pdf(png_files, output_pdf):
    """Create PDF from PNG files using ImageMagick"""
    try:
        cmd = ["magick", "convert"] + png_files + [output_pdf]
        subprocess.run(cmd, check=True)
        print(f"✅ Created PDF: {output_pdf}")
        return True
    except FileNotFoundError:
        # Try img2pdf as fallback
        try:
            import img2pdf
            with open(output_pdf, "wb") as f:
                f.write(img2pdf.convert(png_files))
            print(f"✅ Created PDF: {output_pdf}")
            return True
        except ImportError:
            print("❌ Neither ImageMagick nor img2pdf found. Install one:")
            print("   brew install imagemagick")
            print("   pip install img2pdf")
            return False

if __name__ == "__main__":
    print("LLYLI Mockup Export Script")
    print("=" * 50)
    print(f"Total screens: {len(SCREENS)}")
    print(f"Output directory: {PNG_DIR}")
    print()

    # List all screens to export
    print("Screens to export:")
    for i, screen in enumerate(SCREENS, 1):
        print(f"  {i:2d}. {screen['name']}")

    print()
    print("⚠️  This script documents the export process.")
    print("    Actual export must be done via Claude Code MCP tools.")
    print()
    print("Next steps:")
    print("  1. Use Frame0 MCP tools to export each screen")
    print("  2. Save PNGs to prototypes/web/mockups/")
    print("  3. Run: python3 create_pdf.py (to be created)")
