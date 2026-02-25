import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { ProgressBar } from "@/components/ProgressBar";

describe("ProgressBar", () => {
  it("renders the progress label", () => {
    render(<ProgressBar current={3} />);
    expect(screen.getByText("進捗")).toBeTruthy();
  });

  it("displays current / max count", () => {
    render(<ProgressBar current={5} />);
    expect(screen.getByText("5 / 10")).toBeTruthy();
  });

  it("displays 0 / 10 when no stamps", () => {
    render(<ProgressBar current={0} />);
    expect(screen.getByText("0 / 10")).toBeTruthy();
  });

  it("displays 10 / 10 when complete", () => {
    render(<ProgressBar current={10} />);
    expect(screen.getByText("10 / 10")).toBeTruthy();
  });
});
