import { render, screen } from "@testing-library/react";
import LaunchList from "./LaunchList";

test("renders loading state", () => {
  render(<LaunchList onSelect={() => {}} />);
  expect(screen.getByText(/loading launches/i)).toBeInTheDocument();
});