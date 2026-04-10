import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeaderActions } from "../HeaderActions";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions", () => ({
  signOut: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn().mockResolvedValue({ id: "new-project-id" }),
}));

vi.mock("@/components/auth/AuthDialog", () => ({
  AuthDialog: ({ open, defaultMode }: any) =>
    open ? <div data-testid="auth-dialog" data-mode={defaultMode} /> : null,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("shows Sign In and Sign Up buttons when no user", () => {
  render(<HeaderActions />);

  expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
  expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
});

test("opens auth dialog in signin mode when Sign In clicked", async () => {
  const user = userEvent.setup();
  render(<HeaderActions />);

  await user.click(screen.getByRole("button", { name: "Sign In" }));

  const dialog = screen.getByTestId("auth-dialog");
  expect(dialog.getAttribute("data-mode")).toBe("signin");
});

test("opens auth dialog in signup mode when Sign Up clicked", async () => {
  const user = userEvent.setup();
  render(<HeaderActions />);

  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  const dialog = screen.getByTestId("auth-dialog");
  expect(dialog.getAttribute("data-mode")).toBe("signup");
});

test("hides auth dialog initially", () => {
  render(<HeaderActions />);
  expect(screen.queryByTestId("auth-dialog")).toBeNull();
});

test("shows New Design button when user is logged in", async () => {
  render(
    <HeaderActions
      user={{ id: "user-1", email: "test@example.com" }}
      projectId="project-1"
    />
  );

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /New Design/ })).toBeDefined();
  });
});

test("shows sign out button when user is logged in", async () => {
  render(
    <HeaderActions
      user={{ id: "user-1", email: "test@example.com" }}
      projectId="project-1"
    />
  );

  await waitFor(() => {
    expect(screen.getByTitle("Sign out")).toBeDefined();
  });
});

test("calls signOut when sign out button is clicked", async () => {
  const { signOut } = await import("@/actions");
  const user = userEvent.setup();

  render(
    <HeaderActions
      user={{ id: "user-1", email: "test@example.com" }}
      projectId="project-1"
    />
  );

  await waitFor(() => screen.getByTitle("Sign out"));
  await user.click(screen.getByTitle("Sign out"));

  expect(signOut).toHaveBeenCalled();
});

test("creates a new project and navigates when New Design clicked", async () => {
  const { createProject } = await import("@/actions/create-project");
  const user = userEvent.setup();

  render(
    <HeaderActions
      user={{ id: "user-1", email: "test@example.com" }}
      projectId="project-1"
    />
  );

  await waitFor(() => screen.getByRole("button", { name: /New Design/ }));
  await user.click(screen.getByRole("button", { name: /New Design/ }));

  expect(createProject).toHaveBeenCalled();
  expect(mockPush).toHaveBeenCalledWith("/new-project-id");
});

test("shows projects in dropdown after loading", async () => {
  const { getProjects } = await import("@/actions/get-projects");
  (getProjects as any).mockResolvedValue([
    { id: "p1", name: "My Design", createdAt: new Date(), updatedAt: new Date() },
  ]);
  const user = userEvent.setup();

  render(
    <HeaderActions
      user={{ id: "user-1", email: "test@example.com" }}
      projectId="p1"
    />
  );

  await waitFor(() => screen.getByRole("combobox"));
  await user.click(screen.getByRole("combobox"));

  await waitFor(() => {
    expect(screen.getByText("My Design")).toBeDefined();
  });
});

test("navigates to project when selected from dropdown", async () => {
  const { getProjects } = await import("@/actions/get-projects");
  (getProjects as any).mockResolvedValue([
    { id: "p2", name: "Other Design", createdAt: new Date(), updatedAt: new Date() },
  ]);
  const user = userEvent.setup();

  render(
    <HeaderActions
      user={{ id: "user-1", email: "test@example.com" }}
      projectId="p1"
    />
  );

  await waitFor(() => screen.getByRole("combobox"));
  await user.click(screen.getByRole("combobox"));

  await waitFor(() => screen.getByText("Other Design"));
  await user.click(screen.getByText("Other Design"));

  expect(mockPush).toHaveBeenCalledWith("/p2");
});
