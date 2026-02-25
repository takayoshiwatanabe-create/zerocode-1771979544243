import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { StampCard } from "@/components/StampCard";
import { MAX_STAMPS } from "@/types/stamp";

const emptyStamps = Array.from({ length: MAX_STAMPS }, () => false);
const fullStamps = Array.from({ length: MAX_STAMPS }, () => true);

describe("StampCard", () => {
  it("renders the title", () => {
    render(<StampCard stamps={emptyStamps} currentCount={0} />);
    expect(screen.getByText("スタンプカード")).toBeTruthy();
  });

  it("displays the current count badge", () => {
    render(<StampCard stamps={emptyStamps} currentCount={3} />);
    expect(screen.getByText("3 / 10")).toBeTruthy();
  });

  it("renders 10 stamp slots", () => {
    render(<StampCard stamps={emptyStamps} currentCount={0} />);
    for (let i = 1; i <= MAX_STAMPS; i++) {
      expect(screen.getByText(String(i))).toBeTruthy();
    }
  });

  it("shows complete bar when all stamps are filled", () => {
    render(<StampCard stamps={fullStamps} currentCount={MAX_STAMPS} />);
    expect(screen.getByText(/コンプリート/)).toBeTruthy();
  });

  it("does not show complete bar when stamps are incomplete", () => {
    render(<StampCard stamps={emptyStamps} currentCount={0} />);
    expect(screen.queryByText(/コンプリート/)).toBeNull();
  });

  it("displays filled star emoji for filled stamps", () => {
    const partialStamps = [true, true, false, false, false, false, false, false, false, false];
    render(<StampCard stamps={partialStamps} currentCount={2} />);
    const stars = screen.getAllByText("⭐");
    expect(stars).toHaveLength(2);
  });
});
