import { Button } from "@/components/shared/Button";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("Button Component", () => {
  it("renders with title correctly", () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText("Test Button")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Clickable Button" onPress={mockOnPress} />
    );

    fireEvent.press(getByText("Clickable Button"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled Button" onPress={mockOnPress} disabled={true} />
    );

    fireEvent.press(getByText("Disabled Button"));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("renders different variants correctly", () => {
    const { getByText } = render(<Button title="Primary" variant="primary" />);
    expect(getByText("Primary")).toBeTruthy();

    const { getByText: getSecondary } = render(
      <Button title="Secondary" variant="secondary" />
    );
    expect(getSecondary("Secondary")).toBeTruthy();
  });

  it("shows loading state when loading prop is true", () => {
    const { getByText, queryByText } = render(
      <Button title="Loading Button" loading={true} />
    );

    expect(getByText("Loading...")).toBeTruthy();
    expect(queryByText("Loading Button")).toBeNull();
  });
});
