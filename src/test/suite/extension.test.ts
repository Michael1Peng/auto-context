import * as assert from 'assert';
import * as vscode from 'vscode';

import { ContextTracker } from '../../core/ContextTracker';
import { ConfigurationManager } from '../../services/ConfigurationManager';

suite('Extension Integration Test Suite', () => {
	vscode.window.showInformationMessage('Start integration tests.');

	test('核心流程集成测试: ContextTracker初始化和基础功能', async () => {
		// 验证workspace已打开
		assert.ok(vscode.workspace.workspaceFolders, 'workspace应该已打开');
		assert.ok(vscode.workspace.workspaceFolders!.length > 0, 'workspace文件夹应该存在');
		
		const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
		console.log(`✅ 使用workspace: ${workspaceRoot}`);

		// 使用真实的ConfigurationManager读取workspace配置
		const configManager = new ConfigurationManager();
		let contextTracker: ContextTracker | undefined;
		
		// 验证配置管理器正常工作，读取workspace配置
		const configuration = configManager.getConfiguration();
		assert.ok(configuration, '配置应该成功获取');
		assert.ok(configuration.outputList.length > 0, '输出列表应该包含配置项');
		assert.strictEqual(configuration.shouldOutput, true, 'shouldOutput应该为true（来自workspace配置）');
		assert.strictEqual(configuration.ignorePinnedTabs, false, 'ignorePinnedTabs应该为false（来自workspace配置）');
		
		// 验证输出路径包含workspace路径
		const outputConfig = configuration.outputList[0];
		assert.ok(outputConfig.path.includes(workspaceRoot), '输出路径应该基于workspace根目录');
		console.log(`✅ 输出路径: ${outputConfig.path}`);
		
		// 测试ContextTracker初始化
		assert.doesNotThrow(() => {
			contextTracker = new ContextTracker(configManager);
		}, 'ContextTracker创建不应该抛出异常');

		assert.ok(contextTracker, 'ContextTracker应该成功创建');

		assert.doesNotThrow(() => {
			contextTracker!.initialize();
		}, 'ContextTracker初始化不应该抛出异常');

		// 测试清理功能
		assert.doesNotThrow(() => {
			contextTracker!.dispose();
		}, 'ContextTracker清理不应该抛出异常');

		console.log('✅ 集成测试通过: ContextTracker核心流程正常（使用workspace配置）');
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

	test('扩展配置贡献测试', async () => {
		// 确保扩展已激活
		const extension = vscode.extensions.getExtension('little-lion-39.auto-context');
		if (extension && !extension.isActive) {
			await extension.activate();
		}

		// 验证扩展配置存在
		const config = vscode.workspace.getConfiguration('autoContext');
		assert.ok(config, '扩展配置应该存在');

		// 验证配置项存在
		const outputList = config.inspect('outputList');
		const shouldOutput = config.inspect('shouldOutput');
		const ignorePinnedTabs = config.inspect('ignorePinnedTabs');

		assert.ok(outputList, 'outputList配置项应该存在');
		assert.ok(shouldOutput, 'shouldOutput配置项应该存在');
		assert.ok(ignorePinnedTabs, 'ignorePinnedTabs配置项应该存在');

		// 验证默认值
		assert.ok(outputList.defaultValue, 'outputList应该有默认值');
		assert.strictEqual(shouldOutput.defaultValue, true, 'shouldOutput默认值应该为true');
		assert.strictEqual(ignorePinnedTabs.defaultValue, true, 'ignorePinnedTabs默认值应该为true');

		console.log('✅ 扩展配置贡献测试通过');
	});
});
