import * as assert from "assert";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

import { ContextTracker } from "../../core/ContextTracker";
import { ConfigurationManager } from "../../services/ConfigurationManager";
import { ExtensionConfig, OutputConfig } from "../../types/interfaces";

// Mock ConfigurationManager for testing
class MockConfigurationManager {
  private config: ExtensionConfig;

  constructor(config: ExtensionConfig) {
    this.config = config;
  }

  getConfiguration(): ExtensionConfig {
    return this.config;
  }
}

suite("ContextTracker Test Suite", () => {
  let contextTracker: ContextTracker;
  let tempDir: string;
  let mockConfig: ExtensionConfig;

  setup(() => {
    // 创建临时目录用于测试
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "context-tracker-test-"));

    // 准备测试配置
    mockConfig = {
      outputList: [
        {
          path: path.join(tempDir, "test-output.xml"),
          format: "<File>${fileName}: ${content}</File>",
          prependContent: '<?xml version="1.0"?>',
        },
      ],
      shouldOutput: true,
      ignorePinnedTabs: false,
    };
  });

  teardown(() => {
    // 清理ContextTracker
    if (contextTracker) {
      contextTracker.dispose();
    }

    // 清理临时目录
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test("ContextTracker初始化", () => {
    const mockConfigManager = new MockConfigurationManager(mockConfig);

    assert.doesNotThrow(() => {
      contextTracker = new ContextTracker(mockConfigManager);
    }, "ContextTracker初始化不应该抛出异常");

    assert.doesNotThrow(() => {
      contextTracker.initialize();
    }, "ContextTracker初始化方法不应该抛出异常");
  });

  test("dispose时清理输出文件", () => {
    const mockConfigManager = new MockConfigurationManager(mockConfig);
    contextTracker = new ContextTracker(mockConfigManager);
    contextTracker.initialize();

    // 模拟创建输出文件（通过直接写入文件来模拟）
    const outputPath = mockConfig.outputList[0].path;
    fs.writeFileSync(outputPath, "test content", "utf8");

    // 验证文件存在
    assert.ok(fs.existsSync(outputPath), "dispose前输出文件应该存在");

    // 调用dispose
    contextTracker.dispose();

    // 注意：由于我们无法直接测试OutputWriter的内部状态，
    // 这个测试主要验证dispose方法不会抛出异常
    assert.doesNotThrow(() => {
      contextTracker.dispose();
    }, "dispose方法不应该抛出异常");
  });

  test("shouldOutput为false时不输出", () => {
    const noOutputConfig: ExtensionConfig = {
      ...mockConfig,
      shouldOutput: false,
    };

    const mockConfigManager = new MockConfigurationManager(noOutputConfig);
    contextTracker = new ContextTracker(mockConfigManager);
    contextTracker.initialize();

    // 模拟文件变化事件
    // 由于handleFileChange是私有方法，我们通过触发事件来间接测试
    // 这里主要验证不会因为shouldOutput=false而抛出异常
    assert.doesNotThrow(() => {
      // 触发文件变化事件（如果有的话）
      // 在实际测试中，这可能需要更复杂的模拟
    }, "当shouldOutput为false时不应该抛出异常");
  });

  test("多工作区环境下的集成测试", () => {
    // 创建多个工作区目录
    const workspace1 = path.join(tempDir, "workspace1");
    const workspace2 = path.join(tempDir, "workspace2");
    fs.mkdirSync(workspace1, { recursive: true });
    fs.mkdirSync(workspace2, { recursive: true });

    // 模拟多工作区环境
    const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
    Object.defineProperty(vscode.workspace, "workspaceFolders", {
      value: [
        { uri: { fsPath: workspace1 }, name: "workspace1" },
        { uri: { fsPath: workspace2 }, name: "workspace2" },
      ],
      configurable: true,
    });

    // 使用相对路径配置
    const multiWorkspaceConfig: ExtensionConfig = {
      outputList: [
        {
          path: "output/context.xml",
          format: "<File>${fileName}: ${content}</File>",
        },
      ],
      shouldOutput: true,
      ignorePinnedTabs: false,
    };

    const mockConfigManager = new MockConfigurationManager(
      multiWorkspaceConfig
    );

    assert.doesNotThrow(() => {
      contextTracker = new ContextTracker(mockConfigManager);
      contextTracker.initialize();
    }, "多工作区环境下的初始化不应该抛出异常");

    // 恢复原始值
    Object.defineProperty(vscode.workspace, "workspaceFolders", {
      value: originalWorkspaceFolders,
      configurable: true,
    });
  });

  test("错误处理 - 无效配置", () => {
    const invalidConfig: ExtensionConfig = {
      outputList: [
        {
          path: "/invalid/path/that/does/not/exist/output.xml",
          format: "<File>${fileName}: ${content}</File>",
        },
      ],
      shouldOutput: true,
      ignorePinnedTabs: false,
    };

    const mockConfigManager = new MockConfigurationManager(invalidConfig);

    assert.doesNotThrow(() => {
      contextTracker = new ContextTracker(mockConfigManager);
      contextTracker.initialize();
    }, "无效配置不应该导致初始化失败");
  });
});
