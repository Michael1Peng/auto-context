import * as assert from "assert";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

import { OutputWriter } from "../../services/OutputWriter";
import { OutputFormatter } from "../../services/OutputFormatter";
import { FileData, OutputConfig } from "../../types/interfaces";

suite("OutputWriter Test Suite", () => {
  let outputWriter: OutputWriter;
  let tempDir: string;
  let testFiles: FileData[];
  let outputConfigs: OutputConfig[];

  setup(() => {
    // 创建临时目录用于测试
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "auto-context-test-"));

    // 初始化OutputWriter
    const outputFormatter = new OutputFormatter();
    outputWriter = new OutputWriter(outputFormatter);

    // 准备测试数据
    testFiles = [
      {
        filePath: "test1.ts",
        content: 'console.log("test1");',
      },
      {
        filePath: "test2.js",
        content: 'console.log("test2");',
      },
    ];

    outputConfigs = [
      {
        path: path.join(tempDir, "output1.xml"),
        format: "<File>${fileName}: ${content}</File>",
        prependContent: '<?xml version="1.0"?>',
      },
      {
        path: path.join(tempDir, "output2.txt"),
        format: "${fileName}\n${content}\n---\n",
      },
    ];
  });

  teardown(() => {
    // 清理临时目录
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test("单工作区环境下的文件输出", () => {
    // 模拟单工作区环境
    const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
    Object.defineProperty(vscode.workspace, "workspaceFolders", {
      value: [{ uri: { fsPath: tempDir }, name: "test-workspace" }],
      configurable: true,
    });

    outputWriter.writeOutput(testFiles, outputConfigs);

    // 验证文件是否正确创建
    assert.ok(fs.existsSync(outputConfigs[0].path), "第一个输出文件应该存在");
    assert.ok(fs.existsSync(outputConfigs[1].path), "第二个输出文件应该存在");

    // 验证文件内容
    const content1 = fs.readFileSync(outputConfigs[0].path, "utf8");
    assert.ok(
      content1.includes('<?xml version="1.0"?>'),
      "应该包含prepend内容"
    );
    assert.ok(content1.includes("test1.ts"), "应该包含文件名");

    // 验证文件跟踪
    const trackedFiles = outputWriter.getTrackedFiles();
    assert.strictEqual(trackedFiles.length, 2, "应该跟踪2个输出文件");

    // 恢复原始值
    Object.defineProperty(vscode.workspace, "workspaceFolders", {
      value: originalWorkspaceFolders,
      configurable: true,
    });
  });

  test("多工作区环境下的文件输出", () => {
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

    // 使用相对路径的配置
    const multiWorkspaceConfigs: OutputConfig[] = [
      {
        path: "output/test.xml",
        format: "<File>${fileName}: ${content}</File>",
      },
    ];

    outputWriter.writeOutput(testFiles, multiWorkspaceConfigs);

    // 验证两个工作区都有输出文件
    const output1 = path.join(workspace1, "output/test.xml");
    const output2 = path.join(workspace2, "output/test.xml");

    assert.ok(fs.existsSync(output1), "第一个工作区应该有输出文件");
    assert.ok(fs.existsSync(output2), "第二个工作区应该有输出文件");

    // 验证文件内容相同
    const content1 = fs.readFileSync(output1, "utf8");
    const content2 = fs.readFileSync(output2, "utf8");
    assert.strictEqual(content1, content2, "两个工作区的输出内容应该相同");

    // 验证文件跟踪
    const trackedFiles = outputWriter.getTrackedFiles();
    assert.strictEqual(
      trackedFiles.length,
      2,
      "应该跟踪2个输出文件（每个工作区一个）"
    );

    // 恢复原始值
    Object.defineProperty(vscode.workspace, "workspaceFolders", {
      value: originalWorkspaceFolders,
      configurable: true,
    });
  });

  test("文件清理功能", () => {
    // 先创建一些输出文件
    outputWriter.writeOutput(testFiles, outputConfigs);

    // 验证文件存在
    assert.ok(fs.existsSync(outputConfigs[0].path), "清理前文件应该存在");
    assert.ok(fs.existsSync(outputConfigs[1].path), "清理前文件应该存在");

    // 验证文件被跟踪
    const trackedFilesBefore = outputWriter.getTrackedFiles();
    assert.ok(trackedFilesBefore.length > 0, "应该有被跟踪的文件");

    // 执行清理
    outputWriter.cleanupOutputFiles();

    // 验证文件被删除
    assert.ok(!fs.existsSync(outputConfigs[0].path), "清理后文件应该不存在");
    assert.ok(!fs.existsSync(outputConfigs[1].path), "清理后文件应该不存在");

    // 验证跟踪列表被清空
    const trackedFilesAfter = outputWriter.getTrackedFiles();
    assert.strictEqual(
      trackedFilesAfter.length,
      0,
      "清理后不应该有被跟踪的文件"
    );
  });

  test("错误处理 - 无权限目录", () => {
    // 创建一个无权限的目录路径（在实际测试中可能需要调整）
    const invalidConfig: OutputConfig[] = [
      {
        path: "/root/invalid/path/output.txt",
        format: "${fileName}: ${content}",
      },
    ];

    // 这个测试应该不会抛出异常，而是通过ErrorHandler处理
    assert.doesNotThrow(() => {
      outputWriter.writeOutput(testFiles, invalidConfig);
    }, "无权限目录不应该导致异常抛出");
  });

  test("空文件列表处理", () => {
    const emptyFiles: FileData[] = [];

    assert.doesNotThrow(() => {
      outputWriter.writeOutput(emptyFiles, outputConfigs);
    }, "空文件列表不应该导致异常");

    // 验证输出文件仍然被创建（只是内容为空或只有prepend内容）
    assert.ok(
      fs.existsSync(outputConfigs[0].path),
      "即使文件列表为空，输出文件也应该被创建"
    );
  });

  test("空配置列表处理", () => {
    const emptyConfigs: OutputConfig[] = [];

    assert.doesNotThrow(() => {
      outputWriter.writeOutput(testFiles, emptyConfigs);
    }, "空配置列表不应该导致异常");

    // 验证没有文件被跟踪
    const trackedFiles = outputWriter.getTrackedFiles();
    assert.strictEqual(trackedFiles.length, 0, "空配置列表不应该产生跟踪文件");
  });
});
