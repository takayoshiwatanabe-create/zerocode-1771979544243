import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { Header } from "@/components/Header";

describe("Header", () => {
  it("renders title text", () => {
    render(<Header title="テスト" />);
    expect(screen.getByText("テスト")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    render(<Header title="タイトル" subtitle="サブタイトル" />);
    expect(screen.getByText("タイトル")).toBeTruthy();
    expect(screen.getByText("サブタイトル")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    render(<Header title="タイトル" />);
    expect(screen.queryByText("サブタイトル")).toBeNull();
  });
});
