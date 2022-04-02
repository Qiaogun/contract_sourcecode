// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const request = require('request');
const fs = require('fs');
const path = require('path');
const YourApiKeyToken = vscode.workspace.getConfiguration().get('bscscangetcode.apikey');
var target_url = ''
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider());
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "bscscangetcode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('bscscangetcode.getsourcecode', async function () {
		// The code you place here will be executed every time your command is executed
		var display_text = '想要下载的合约地址';

		vscode.window.showInputBox({ // 这个对象中所有参数都是可选参数
			password: false, // 输入内容是否是密码
			ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
			placeHolder: '合约，来？', // 在输入框内的提示信息
			prompt: display_text, // 在输入框下方的提示信息	
			validateInput: checkConstact,
		}).then(Token => {
			target_url = `https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${Token}&apikey=${YourApiKeyToken}`
			getURLJSON(target_url);
		})
	});
	// Display a message box to the user
	//vscode.window.showInformationMessage('get source code');
	context.subscriptions.push(disposable);
}

function getURLJSON(target_url) {
	var options = {
		url: target_url,
		method: 'GET',
		json: true
	}
	request.get(options, function (err, res, body) {
		if (err) {
			console.log('Error: ' + err.message);
			return err;
		}
		const filename = body.result[0].ContractName;
		const SourceCode = body.result[0].SourceCode;
		const folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

		var path1 = path.join(folderPath, `${filename}.sol`);
		fs.writeFile(path.join(folderPath, `${filename}.sol`), SourceCode, (err) => {
			if (err) {
				return vscode.window.showErrorMessage(
					'Failed to create file!'
				);
			}
			vscode.window.showInformationMessage(`Created files ${folderPath}` + `\${filename}.sol`);
			vscode.workspace.openTextDocument(path1).then(doc => {
				vscode.window.showTextDocument(doc);
			});
		});
	})
}

function checkConstact(value) {
	if (YourApiKeyToken == '') {
		return '先去设置 API KEY 哦'
	}
	return value !== '' && web3.utils.isAddress(value) ?
		null : '您这地址不合法啊';
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}