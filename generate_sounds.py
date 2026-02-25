#!/usr/bin/env python3
"""Generate stamp card sound effects"""
import numpy as np
from scipy.io import wavfile
import os

os.makedirs("assets/sounds", exist_ok=True)
SAMPLE_RATE = 44100

def generate_stamp_sound():
    duration = 0.35
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration))
    freq_perc = 80 * np.exp(-t * 15)
    perc = np.sin(2 * np.pi * freq_perc * t) * np.exp(-t * 18)
    chin = np.sin(2 * np.pi * 880 * t) * np.exp(-t * 25) * 0.4
    charm = np.sin(2 * np.pi * 1320 * t) * np.exp(-t * 30) * 0.2
    combined = perc + chin + charm
    combined = combined / np.max(np.abs(combined)) * 0.85
    wavfile.write("assets/sounds/stamp.wav", SAMPLE_RATE, (combined * 32767).astype(np.int16))
    print("stamp.wav")

def generate_complete_sound():
    duration = 1.2
    t_total = np.linspace(0, duration, int(SAMPLE_RATE * duration))
    sound = np.zeros(len(t_total))
    notes = [523, 659, 784, 1047]
    for i, freq in enumerate(notes):
        delay = int(i * 0.08 * SAMPLE_RATE)
        t_note = np.linspace(0, duration - i * 0.08, len(t_total) - delay)
        note = np.sin(2 * np.pi * freq * t_note) * np.exp(-t_note * 4) * 0.5
        note += np.sin(2 * np.pi * freq * 2 * t_note) * np.exp(-t_note * 6) * 0.15
        sound[delay:delay + len(note)] += note
    np.random.seed(42)
    for _ in range(6):
        pos = np.random.randint(0, int(SAMPLE_RATE * 0.6))
        freq = np.random.choice([2093, 2349, 2637])
        t_spark = np.linspace(0, 0.15, int(SAMPLE_RATE * 0.15))
        spark = np.sin(2 * np.pi * freq * t_spark) * np.exp(-t_spark * 20) * 0.1
        end = min(pos + len(spark), len(sound))
        sound[pos:end] += spark[:end-pos]
    sound = sound / np.max(np.abs(sound)) * 0.85
    wavfile.write("assets/sounds/complete.wav", SAMPLE_RATE, (sound * 32767).astype(np.int16))
    print("complete.wav")

def generate_undo_sound():
    duration = 0.25
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration))
    freq = 440 * np.exp(-t * 3)
    sound = np.sin(2 * np.pi * freq * t) * np.exp(-t * 12) * 0.6
    sound = sound / np.max(np.abs(sound)) * 0.7
    wavfile.write("assets/sounds/undo.wav", SAMPLE_RATE, (sound * 32767).astype(np.int16))
    print("undo.wav")

generate_stamp_sound()
generate_complete_sound()
generate_undo_sound()
print("All sounds generated!")
