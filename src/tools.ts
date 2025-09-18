export const tools = [
  {
    name: "pretty-add-dependency",
    description: "Add an npm package to the project. Format: package@version",
    input_schema: {
      type: "object",
      properties: {
        package: {
          type: "string",
          description: "The package name and version to add",
        },
      },
      required: ["package"],
    },
  },
  {
    name: "pretty-search-files",
    description:
      "Search files using regex with optional include/exclude patterns and case sensitivity.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query pattern",
        },
        include_pattern: {
          type: "string",
          description: "File pattern to include (optional)",
        },
        exclude_pattern: {
          type: "string",
          description: "File pattern to exclude (optional)",
        },
        case_sensitive: {
          type: "boolean",
          description:
            "Whether search is case sensitive (optional, default: false)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "pretty-write",
    description:
      "Write or overwrite a file. Use only when line-replace isn't suitable. Prefer minimal edits and use '// ... keep existing code' for unchanged large sections.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to write",
        },
        content: {
          type: "string",
          description: "Content to write to the file",
        },
      },
      required: ["file_path", "content"],
    },
  },
  {
    name: "pretty-line-replace",
    description:
      "Replace content in a file. Can use text search or line numbers. Use this to edit existing code (preferred over full overwrite).",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to edit",
        },
        search: {
          type: "string",
          description:
            "Existing code text to match before replacement (use this for text-based replacement)",
        },
        replace: {
          type: "string",
          description: "New code to insert",
        },
        first_replaced_line: {
          type: "number",
          description:
            "Start line number for line-based replacement (1-indexed)",
        },
        last_replaced_line: {
          type: "number",
          description: "End line number for line-based replacement (1-indexed)",
        },
      },
      required: ["file_path", "replace"],
    },
  },
  {
    name: "pretty-view",
    description:
      "Read a file's content. Defaults to first 500 lines. Use 'lines' for large files or specific ranges.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to read",
        },
        lines: {
          type: "string",
          description: "Line range to read (e.g., '1-800,1001-1500')",
        },
      },
      required: ["file_path"],
    },
  },
  {
    name: "pretty-remove-dependency",
    description: "Uninstall an npm package.",
    input_schema: {
      type: "object",
      properties: {
        package: {
          type: "string",
          description: "The package name to remove",
        },
      },
      required: ["package"],
    },
  },
  {
    name: "pretty-rename",
    description:
      "Rename a file. Use instead of creating a new one and deleting the old.",
    input_schema: {
      type: "object",
      properties: {
        original_file_path: {
          type: "string",
          description: "Original file path",
        },
        new_file_path: {
          type: "string",
          description: "New file path",
        },
      },
      required: ["original_file_path", "new_file_path"],
    },
  },
  {
    name: "pretty-delete",
    description: "Delete a file by relative path.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to delete",
        },
      },
      required: ["file_path"],
    },
  },
  {
    name: "pretty-get-image",
    description:
      "Get related images from Unsplash API based on user prompt. Returns image URLs that can be used in the project.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for finding related images",
        },
        count: {
          type: "number",
          description: "Number of images to return (1-10)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "pretty-check-file",
    description:
      "Check if a file exists and return its content. Use this before writing files to avoid overwriting existing content.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to check",
        },
      },
      required: ["file_path"],
    },
  },
  {
    name: "pretty-run-command",
    description:
      "Execute a shell command (npm run build, npm run dev, etc.) to check for build errors or run development server. Use retry_until_success=true for persistent debugging.",
    input_schema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Command to execute (e.g., 'npm run build', 'npm run dev', 'npx tsc --noEmit')",
        },
        cwd: {
          type: "string",
          description: "Working directory (optional, defaults to project root)",
        },
        retry_until_success: {
          type: "boolean",
          description: "Enable persistent retry mode - LLM will fix errors and retry until command succeeds",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "pretty-list-directory",
    description:
      "List files and directories in a specific path to understand project structure and find missing files.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Directory path to list (e.g., 'src/components', 'src/pages')",
        },
        pattern: {
          type: "string",
          description: "File pattern to match (optional, e.g., '*.tsx', '*.ts')",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "pretty-check-build",
    description:
      "Check if the project builds successfully and report any errors. This is useful for debugging build issues. Use retry_until_success=true for persistent debugging.",
    input_schema: {
      type: "object",
      properties: {
        build_type: {
          type: "string",
          description: "Type of build check ('build', 'type-check', 'dev')",
          enum: ["build", "type-check", "dev"],
        },
        retry_until_success: {
          type: "boolean",
          description: "Enable persistent retry mode - LLM will fix errors and retry until build succeeds",
        },
      },
      required: ["build_type"],
    },
  },
];
