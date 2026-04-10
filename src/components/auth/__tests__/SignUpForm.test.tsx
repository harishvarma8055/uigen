import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "../SignUpForm";

const mockSignUp = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    isLoading: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders email, password, and confirm password fields", () => {
  render(<SignUpForm />);

  expect(screen.getByLabelText("Email")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
  expect(screen.getByLabelText("Confirm Password")).toBeDefined();
  expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
});

test("shows password hint text", () => {
  render(<SignUpForm />);
  expect(screen.getByText("Must be at least 8 characters long")).toBeDefined();
});

test("shows error when passwords do not match", async () => {
  const user = userEvent.setup();

  render(<SignUpForm />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "differentpassword");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(screen.getByText("Passwords do not match")).toBeDefined();
  expect(mockSignUp).not.toHaveBeenCalled();
});

test("calls signUp with email and password when passwords match", async () => {
  mockSignUp.mockResolvedValue({ success: true });
  const user = userEvent.setup();

  render(<SignUpForm />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(mockSignUp).toHaveBeenCalledWith("test@example.com", "password123");
});

test("calls onSuccess when sign up succeeds", async () => {
  mockSignUp.mockResolvedValue({ success: true });
  const onSuccess = vi.fn();
  const user = userEvent.setup();

  render(<SignUpForm onSuccess={onSuccess} />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(onSuccess).toHaveBeenCalled();
});

test("shows error message when sign up fails", async () => {
  mockSignUp.mockResolvedValue({ success: false, error: "Email already exists" });
  const user = userEvent.setup();

  render(<SignUpForm />);

  await user.type(screen.getByLabelText("Email"), "existing@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(screen.getByText("Email already exists")).toBeDefined();
});

test("shows fallback error when sign up fails without message", async () => {
  mockSignUp.mockResolvedValue({ success: false });
  const user = userEvent.setup();

  render(<SignUpForm />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(screen.getByText("Failed to sign up")).toBeDefined();
});

test("does not call onSuccess when sign up fails", async () => {
  mockSignUp.mockResolvedValue({ success: false, error: "Error" });
  const onSuccess = vi.fn();
  const user = userEvent.setup();

  render(<SignUpForm onSuccess={onSuccess} />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(onSuccess).not.toHaveBeenCalled();
});
