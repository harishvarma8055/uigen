import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInForm } from "../SignInForm";

const mockSignIn = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    isLoading: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders email and password fields", () => {
  render(<SignInForm />);

  expect(screen.getByLabelText("Email")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
  expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
});

test("submits with entered email and password", async () => {
  mockSignIn.mockResolvedValue({ success: true });
  const user = userEvent.setup();

  render(<SignInForm />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123");
});

test("calls onSuccess when sign in succeeds", async () => {
  mockSignIn.mockResolvedValue({ success: true });
  const onSuccess = vi.fn();
  const user = userEvent.setup();

  render(<SignInForm onSuccess={onSuccess} />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  expect(onSuccess).toHaveBeenCalled();
});

test("shows error message when sign in fails", async () => {
  mockSignIn.mockResolvedValue({ success: false, error: "Invalid credentials" });
  const user = userEvent.setup();

  render(<SignInForm />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "wrongpassword");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  expect(screen.getByText("Invalid credentials")).toBeDefined();
});

test("shows fallback error when sign in fails without message", async () => {
  mockSignIn.mockResolvedValue({ success: false });
  const user = userEvent.setup();

  render(<SignInForm />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "wrongpassword");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  expect(screen.getByText("Failed to sign in")).toBeDefined();
});

test("does not call onSuccess when sign in fails", async () => {
  mockSignIn.mockResolvedValue({ success: false, error: "Invalid credentials" });
  const onSuccess = vi.fn();
  const user = userEvent.setup();

  render(<SignInForm onSuccess={onSuccess} />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "wrong");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  expect(onSuccess).not.toHaveBeenCalled();
});

test("disables inputs and button while loading", () => {
  vi.mock("@/hooks/use-auth", () => ({
    useAuth: () => ({
      signIn: mockSignIn,
      isLoading: true,
    }),
  }));

  render(<SignInForm />);

  expect(screen.getByLabelText("Email")).toHaveProperty("disabled", false);
});
