import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CodeEditor } from "../CodeEditor";

const mockUseFileSystem = vi.fn();

vi.mock("@/lib/contexts/file-system-context", () => ({
  useFileSystem: () => mockUseFileSystem(),
}));

vi.mock("@monaco-editor/react", () => ({
  default: ({ language, value, onChange, theme, options }: any) => (
    <div
      data-testid="monaco-editor"
      data-language={language}
      data-value={value}
      data-theme={theme}
    >
      <button onClick={() => onChange("new content")}>Change Content</button>
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("shows empty state when no file is selected", () => {
  mockUseFileSystem.mockReturnValue({
    selectedFile: null,
    getFileContent: vi.fn(),
    updateFile: vi.fn(),
  });

  render(<CodeEditor />);

  expect(screen.getByText("Select a file to edit")).toBeDefined();
  expect(screen.getByText("Choose a file from the file tree")).toBeDefined();
});

test("renders Monaco editor when a file is selected", () => {
  mockUseFileSystem.mockReturnValue({
    selectedFile: "/App.jsx",
    getFileContent: vi.fn().mockReturnValue("const App = () => <div />;"),
    updateFile: vi.fn(),
  });

  render(<CodeEditor />);

  expect(screen.getByTestId("monaco-editor")).toBeDefined();
});

test("passes correct language for jsx files", () => {
  mockUseFileSystem.mockReturnValue({
    selectedFile: "/App.jsx",
    getFileContent: vi.fn().mockReturnValue(""),
    updateFile: vi.fn(),
  });

  render(<CodeEditor />);

  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("javascript");
});

test("passes correct language for tsx files", () => {
  mockUseFileSystem.mockReturnValue({
    selectedFile: "/App.tsx",
    getFileContent: vi.fn().mockReturnValue(""),
    updateFile: vi.fn(),
  });

  render(<CodeEditor />);

  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("typescript");
});

test("passes correct language for ts files", () => {
  mockUseFileSystem.mockReturnValue({
    selectedFile: "/utils.ts",
    getFileContent: vi.fn().mockReturnValue(""),
    updateFile: vi.fn(),
  });

  render(<CodeEditor />);

  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("typescript");
});

test("passes correct language for json files", () => {
  mockUseFileSystem.mockReturnValue({
    selectedFile: "/data.json",
    getFileContent: vi.fn().mockReturnValue(""),
    updateFile: vi.fn(),
  });

  render(<CodeEditor />);

  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("json");
});

test("passes correct language for css files", () => {
  mockUseFileSystem.mockReturnValue({
    selectedFile: "/styles.css",
    getFileContent: vi.fn().mockReturnValue(""),
    updateFile: vi.fn(),
  });

  render(<CodeEditor />);

  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("css");
});

test("uses plaintext for unknown extensions", () => {
  mockUseFileSystem.mockReturnValue({
    selectedFile: "/file.xyz",
    getFileContent: vi.fn().mockReturnValue(""),
    updateFile: vi.fn(),
  });

  render(<CodeEditor />);

  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("plaintext");
});

test("passes file content to the editor", () => {
  const content = "const App = () => <div>Hello</div>;";
  mockUseFileSystem.mockReturnValue({
    selectedFile: "/App.jsx",
    getFileContent: vi.fn().mockReturnValue(content),
    updateFile: vi.fn(),
  });

  render(<CodeEditor />);

  expect(screen.getByTestId("monaco-editor").getAttribute("data-value")).toBe(content);
});

test("uses empty string when file content is null", () => {
  mockUseFileSystem.mockReturnValue({
    selectedFile: "/App.jsx",
    getFileContent: vi.fn().mockReturnValue(null),
    updateFile: vi.fn(),
  });

  render(<CodeEditor />);

  expect(screen.getByTestId("monaco-editor").getAttribute("data-value")).toBe("");
});

test("calls updateFile when editor content changes", async () => {
  const updateFile = vi.fn();
  mockUseFileSystem.mockReturnValue({
    selectedFile: "/App.jsx",
    getFileContent: vi.fn().mockReturnValue("original"),
    updateFile,
  });

  const { getByText } = render(<CodeEditor />);
  getByText("Change Content").click();

  expect(updateFile).toHaveBeenCalledWith("/App.jsx", "new content");
});
