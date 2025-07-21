import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { ContextTracker } from '../../core/ContextTracker';
import { ExtensionConfig } from '../../types/interfaces';

suite('Extension Integration Test Suite', () => {
	vscode.window.showInformationMessage('Start integration tests.');

	test('核心流程集成测试: ContextTracker初始化和基础功能', () => {
		// 创建临时目录
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-context-test-'));
		const outputPath = path.join(tempDir, 'test-output.xml');

		try {
			// Mock配置管理器
			class MockConfigManager {
				getConfiguration(): ExtensionConfig {
					return {
						outputList: [{
							path: outputPath,
							format: '<File>${fileName}: ${content}</File>',
							prependContent: '<?xml version="1.0"?>'
						}],
						shouldOutput: true,
						ignorePinnedTabs: false,
					};
				}
			}

			// 测试ContextTracker初始化
			const mockConfigManager = new MockConfigManager();
			let contextTracker: ContextTracker | undefined;
			
			assert.doesNotThrow(() => {
				contextTracker = new ContextTracker(mockConfigManager);
			}, 'ContextTracker创建不应该抛出异常');

			assert.ok(contextTracker, 'ContextTracker应该成功创建');

			assert.doesNotThrow(() => {
				contextTracker!.initialize();
			}, 'ContextTracker初始化不应该抛出异常');

			// 测试清理功能
			assert.doesNotThrow(() => {
				contextTracker!.dispose();
			}, 'ContextTracker清理不应该抛出异常');

			console.log('✅ 集成测试通过: ContextTracker核心流程正常');

		} finally {
			// 清理临时目录
			if (fs.existsSync(tempDir)) {
				fs.rmSync(tempDir, { recursive: true, force: true });
			}
		}
	});

	test('扩展激活测试', async () => {
		// 验证扩展已加载
		const extension = vscode.extensions.getExtension('little-lion-39.auto-context');
		assert.ok(extension, '扩展应该已加载');

		// 验证扩展已激活
		if (!extension.isActive) {
			await extension.activate();
		}
		assert.ok(extension.isActive, '扩展应该已激活');

		console.log('✅ 扩展激活测试通过');
	});

	test('扩展命令注册测试', async () => {
		// 确保扩展已激活
		const extension = vscode.extensions.getExtension('little-lion-39.auto-context');
		if (extension && !extension.isActive) {
			await extension.activate();
		}

		// 获取所有注册的命令
		const commands = await vscode.commands.getCommands(true);
		
		// 验证插件命令已注册
		assert.ok(
			commands.includes('auto-context.removeTopCommentBlocks'),
			'auto-context.removeTopCommentBlocks命令应该已注册'
		);

		// 测试命令执行（可选）
		try {
			await vscode.commands.executeCommand('auto-context.removeTopCommentBlocks');
			console.log('✅ 命令执行成功');
		} catch (error) {
			assert.fail(`命令执行失败: ${error}`);
		}

		console.log('✅ 扩展命令注册测试通过');
	});
});
