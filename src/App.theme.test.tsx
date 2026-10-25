import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";

const systemPrefersDark = (dark: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: dark && query === "(prefers-color-scheme: dark)",
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
};

const look = () => document.documentElement.getAttribute("data-theme");

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  systemPrefersDark(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("switches between the light and dark looks without reloading", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(look()).toBe("light");
  await user.click(screen.getByRole("button", { name: "Switch to dark look" }));
  expect(look()).toBe("dark");
  await user.click(screen.getByRole("button", { name: "Switch to light look" }));
  expect(look()).toBe("light");
});

test("keeps the chosen look when the Day Planner is opened again", async () => {
  const user = userEvent.setup();
  const first = render(<App />);
  await user.click(screen.getByRole("button", { name: "Switch to dark look" }));
  first.unmount();
  document.documentElement.removeAttribute("data-theme");
  render(<App />);
  expect(look()).toBe("dark");
  expect(screen.getByRole("button", { name: "Switch to light look" })).toBeInTheDocument();
});

test("uses the dark look when the device is set to dark and nothing was chosen", () => {
  systemPrefersDark(true);
  render(<App />);
  expect(look()).toBe("dark");
});

test("uses the light look when the device is set to light and nothing was chosen", () => {
  render(<App />);
  expect(look()).toBe("light");
});

test("a chosen look wins over the device setting", () => {
  systemPrefersDark(true);
  localStorage.setItem("day-planner-theme", "light");
  render(<App />);
  expect(look()).toBe("light");
});
