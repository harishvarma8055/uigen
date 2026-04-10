import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PreviewFrame } from "../PreviewFrame";

const mockUseFileSystem = vi.fn();

vi.mock("@/lib/contexts/file-system-context", () => ({
  useFileSystem: () => mockUseFileSystem(),
}));

vi.mock("@/lib/transform/jsx-transformer", () => ({
  createImportMap: vi.fn().mockReturnValue({
    importMap: {},
    styles: "",
    errors: [],
  }),
  createPreviewHTML: vi.fn().mockReturnValue("<html><body>Preview</body></html>"),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("shows first load state when file system is empty", () => {
  mockUseFileSystem.mockReturnValue({
    getAllFiles: vi.fn().mockReturnValue(new Map()),
    refreshTrigger: 0,
  });

  render(<PreviewFrame />);

  expect(screen.getByText("Welcome to UI Generator")).toBeDefined();
  expect(screen.getByText("Start building React components with AI assistance")).toBeDefined();
});

test("shows error state when files exist but no JSX entry point found", () => {
  const files = new Map([
    ["/styles.css", "body { margin: 0; }"],
  ]);

  mockUseFileSystem.mockReturnValue({
    getAllFiles: vi.fn().mockReturnValue(files),
    refreshTrigger: 1,
  });

  render(<PreviewFrame />);

  expect(screen.getByText("No Preview Available")).toBeDefined();
});

test("renders iframe when App.jsx exists", () => {
  const files = new Map([
    ["/App.jsx", "export default () => <div>Hello</div>"],
  ]);

  mockUseFileSystem.mockReturnValue({
    getAllFiles: vi.fn().mockReturnValue(files),
    refreshTrigger: 1,
  });

  const { container } = render(<PreviewFrame />);

  const iframe = container.querySelector("iframe");
  expect(iframe).toBeDefined();
});

test("renders iframe when App.tsx exists", () => {
  const files = new Map([
    ["/App.tsx", "export default () => <div>Hello</div>"],
  ]);

  mockUseFileSystem.mockReturnValue({
    getAllFiles: vi.fn().mockReturnValue(files),
    refreshTrigger: 1,
  });

  const { container } = render(<PreviewFrame />);

  const iframe = container.querySelector("iframe");
  expect(iframe).toBeDefined();
});

test("renders iframe when index.jsx exists", () => {
  const files = new Map([
    ["/index.jsx", "export default () => <div>Hello</div>"],
  ]);

  mockUseFileSystem.mockReturnValue({
    getAllFiles: vi.fn().mockReturnValue(files),
    refreshTrigger: 1,
  });

  const { container } = render(<PreviewFrame />);

  const iframe = container.querySelector("iframe");
  expect(iframe).toBeDefined();
});

test("shows no preview message with details when error occurs after first load", () => {
  const files = new Map([
    ["/styles.css", "body {}"],
  ]);

  mockUseFileSystem.mockReturnValue({
    getAllFiles: vi.fn().mockReturnValue(files),
    refreshTrigger: 1,
  });

  render(<PreviewFrame />);

  expect(screen.getByText("No Preview Available")).toBeDefined();
  expect(screen.getByText("Start by creating a React component using the AI assistant")).toBeDefined();
});

test("iframe has correct sandbox attributes and title", () => {
  const files = new Map([
    ["/App.jsx", "export default () => <div />"],
  ]);

  mockUseFileSystem.mockReturnValue({
    getAllFiles: vi.fn().mockReturnValue(files),
    refreshTrigger: 1,
  });

  const { container } = render(<PreviewFrame />);

  const iframe = container.querySelector("iframe") as HTMLIFrameElement;
  expect(iframe.getAttribute("title")).toBe("Preview");
  expect(iframe.getAttribute("sandbox")).toContain("allow-scripts");
  expect(iframe.getAttribute("sandbox")).toContain("allow-same-origin");
});
