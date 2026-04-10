import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthDialog } from "../AuthDialog";

vi.mock("../SignInForm", () => ({
  SignInForm: ({ onSuccess }: any) => (
    <div data-testid="sign-in-form">
      <button onClick={onSuccess}>Sign In Submit</button>
    </div>
  ),
}));

vi.mock("../SignUpForm", () => ({
  SignUpForm: ({ onSuccess }: any) => (
    <div data-testid="sign-up-form">
      <button onClick={onSuccess}>Sign Up Submit</button>
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("does not render dialog content when closed", () => {
  render(<AuthDialog open={false} onOpenChange={vi.fn()} />);
  expect(screen.queryByText("Welcome back")).toBeNull();
});

test("renders sign in form by default", () => {
  render(<AuthDialog open={true} onOpenChange={vi.fn()} />);

  expect(screen.getByText("Welcome back")).toBeDefined();
  expect(screen.getByText("Sign in to your account to continue")).toBeDefined();
  expect(screen.getByTestId("sign-in-form")).toBeDefined();
});

test("renders sign up form when defaultMode is signup", () => {
  render(<AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signup" />);

  expect(screen.getByText("Create an account")).toBeDefined();
  expect(screen.getByText("Sign up to start creating AI-powered React components")).toBeDefined();
  expect(screen.getByTestId("sign-up-form")).toBeDefined();
});

test("switches to sign up mode when link is clicked", async () => {
  const user = userEvent.setup();
  render(<AuthDialog open={true} onOpenChange={vi.fn()} />);

  await user.click(screen.getByRole("button", { name: "Sign up" }));

  expect(screen.getByTestId("sign-up-form")).toBeDefined();
  expect(screen.getByText("Create an account")).toBeDefined();
});

test("switches to sign in mode when link is clicked", async () => {
  const user = userEvent.setup();
  render(<AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signup" />);

  await user.click(screen.getByRole("button", { name: "Sign in" }));

  expect(screen.getByTestId("sign-in-form")).toBeDefined();
  expect(screen.getByText("Welcome back")).toBeDefined();
});

test("calls onOpenChange(false) when sign in succeeds", async () => {
  const onOpenChange = vi.fn();
  const user = userEvent.setup();

  render(<AuthDialog open={true} onOpenChange={onOpenChange} />);

  await user.click(screen.getByText("Sign In Submit"));

  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("calls onOpenChange(false) when sign up succeeds", async () => {
  const onOpenChange = vi.fn();
  const user = userEvent.setup();

  render(<AuthDialog open={true} onOpenChange={onOpenChange} defaultMode="signup" />);

  await user.click(screen.getByText("Sign Up Submit"));

  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("updates mode when defaultMode prop changes", () => {
  const { rerender } = render(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signin" />
  );

  expect(screen.getByTestId("sign-in-form")).toBeDefined();

  rerender(<AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signup" />);

  expect(screen.getByTestId("sign-up-form")).toBeDefined();
});
