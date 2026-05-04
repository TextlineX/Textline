from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


GLYPHS = " .,:;i1tftL0X#%@"
BG_COLOR = "#050505"
TEXT_COLOR = "#e0e0e0"
ACCENT_COLOR = "#ff2e2e"
CYAN_COLOR = "#00ffff"
MUTED_COLOR = "#6f6f6f"


@dataclass(frozen=True)
class VideoInfo:
    width: int
    height: int
    fps: float
    duration: float


def run_command(command: list[str]) -> str:
    result = subprocess.run(
        command,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout


def probe_video(path: Path) -> VideoInfo:
    payload = run_command(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height,r_frame_rate:format=duration",
            "-of",
            "json",
            str(path),
        ]
    )
    data = json.loads(payload)
    stream = data["streams"][0]
    numerator, denominator = stream["r_frame_rate"].split("/")
    fps = float(numerator) / float(denominator)
    duration = float(data["format"]["duration"])
    return VideoInfo(
        width=int(stream["width"]),
        height=int(stream["height"]),
        fps=fps,
        duration=duration,
    )


def resolve_font(font_path: str | None, font_size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates: list[str] = []
    if font_path:
        candidates.append(font_path)
    candidates.extend(
        [
            r"C:\Windows\Fonts\consola.ttf",
            r"C:\Windows\Fonts\consolab.ttf",
            r"C:\Windows\Fonts\cour.ttf",
        ]
    )

    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return ImageFont.truetype(candidate, font_size)

    return ImageFont.load_default()


def glyph_for_intensity(intensity: float) -> str:
    clamped = max(0.0, min(1.0, intensity ** 0.72))
    index = min(len(GLYPHS) - 1, int(round(clamped * (len(GLYPHS) - 1))))
    return GLYPHS[index]


def choose_fill(intensity: float, column: int, row: int) -> str:
    if intensity > 0.76:
        return ACCENT_COLOR
    if intensity > 0.46 and (column + row) % 5 == 0:
        return CYAN_COLOR
    if intensity > 0.22:
        return TEXT_COLOR
    return MUTED_COLOR


def make_ascii_video(
    input_path: Path,
    output_path: Path,
    cols: int,
    output_width: int,
    output_height: int,
    fps: int,
    font_size: int,
    char_aspect: float,
    font_path: str | None,
    max_seconds: float | None,
) -> None:
    info = probe_video(input_path)
    rows = max(1, int(round(cols * (output_height / output_width) * char_aspect)))
    font = resolve_font(font_path, font_size)

    cell_width = output_width / cols
    cell_height = output_height / rows

    ffmpeg_decode = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(input_path),
        "-vf",
        f"fps={fps},scale={cols}:{rows}:flags=bicubic",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "gray",
        "pipe:1",
    ]
    if max_seconds is not None and max_seconds > 0:
        ffmpeg_decode = [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-t",
            str(max_seconds),
            "-i",
            str(input_path),
            "-vf",
            f"fps={fps},scale={cols}:{rows}:flags=bicubic",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "gray",
            "pipe:1",
        ]

    ffmpeg_encode = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{output_width}x{output_height}",
        "-r",
        str(fps),
        "-i",
        "pipe:0",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(output_path),
    ]

    decode_proc = subprocess.Popen(
        ffmpeg_decode,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    encode_proc = subprocess.Popen(
        ffmpeg_encode,
        stdin=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    assert decode_proc.stdout is not None
    assert decode_proc.stderr is not None
    assert encode_proc.stdin is not None
    assert encode_proc.stderr is not None

    frame_size = cols * rows
    frame_index = 0
    glyph_metrics: dict[str, tuple[int, int]] = {}

    sample_draw = ImageDraw.Draw(Image.new("RGB", (1, 1), BG_COLOR))
    for glyph in set(GLYPHS):
        bbox = sample_draw.textbbox((0, 0), glyph, font=font)
        glyph_metrics[glyph] = (bbox[2] - bbox[0], bbox[3] - bbox[1])

    try:
        while True:
            frame_bytes = decode_proc.stdout.read(frame_size)
            if not frame_bytes or len(frame_bytes) < frame_size:
                break

            gray = Image.frombytes("L", (cols, rows), frame_bytes)
            pixels = gray.load()

            canvas = Image.new("RGB", (output_width, output_height), BG_COLOR)
            draw = ImageDraw.Draw(canvas)

            for row in range(rows):
                for column in range(cols):
                    intensity = pixels[column, row] / 255.0
                    glyph = glyph_for_intensity(intensity)
                    fill = choose_fill(intensity, column, row)

                    glyph_width, glyph_height = glyph_metrics[glyph]

                    center_x = (column + 0.5) * cell_width
                    center_y = (row + 0.5) * cell_height
                    x = center_x - glyph_width / 2
                    y = center_y - glyph_height / 2 - 1
                    draw.text((x, y), glyph, fill=fill, font=font)

            encode_proc.stdin.write(canvas.tobytes())
            frame_index += 1
            if frame_index % max(1, fps * 2) == 0:
                print(f"processed {frame_index} frames", file=sys.stderr)

    finally:
        if decode_proc.stdout:
            decode_proc.stdout.close()
        decode_rc = decode_proc.wait()
        if decode_rc not in (0, None):
            stderr_text = decode_proc.stderr.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"ffmpeg decode failed: {stderr_text}")

        encode_proc.stdin.close()
        encode_rc = encode_proc.wait()
        if encode_rc not in (0, None):
            stderr_text = encode_proc.stderr.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"ffmpeg encode failed: {stderr_text}")

    print(
        f"ascii video written: {output_path} "
        f"({frame_index} frames, {rows} rows, {cols} cols, source {info.width}x{info.height}@{info.fps:.2f}fps)"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert a video into an ASCII-style looping video.")
    parser.add_argument("input", type=Path, help="Input video path")
    parser.add_argument("output", type=Path, help="Output video path")
    parser.add_argument("--cols", type=int, default=132, help="ASCII columns")
    parser.add_argument("--width", type=int, default=1280, help="Output video width")
    parser.add_argument("--height", type=int, default=720, help="Output video height")
    parser.add_argument("--fps", type=int, default=12, help="Output frames per second")
    parser.add_argument("--font-size", type=int, default=12, help="Font size used to draw glyphs")
    parser.add_argument(
        "--char-aspect",
        type=float,
        default=0.56,
        help="Character aspect ratio correction for row calculation",
    )
    parser.add_argument("--font", type=str, default=None, help="Optional TTF font path")
    parser.add_argument("--seconds", type=float, default=None, help="Optional maximum seconds to process")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = args.input.resolve()
    output_path = args.output.resolve()

    if not input_path.exists():
        print(f"input not found: {input_path}", file=sys.stderr)
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)

    make_ascii_video(
        input_path=input_path,
        output_path=output_path,
        cols=args.cols,
        output_width=args.width,
        output_height=args.height,
        fps=args.fps,
        font_size=args.font_size,
        char_aspect=args.char_aspect,
        font_path=args.font,
        max_seconds=args.seconds,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
