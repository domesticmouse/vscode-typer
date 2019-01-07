import * as fs from 'fs';
import * as jsonc from 'jsonc-parser';
import * as vscode from 'vscode';
import { Animator } from './animator';

export function activate(context: vscode.ExtensionContext) {
  const updater = new Updater();
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'extension.devFestResetMain',
      (textEditor: vscode.TextEditor, _: vscode.TextEditorEdit) => {
        updater.reset(textEditor);
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'extension.devFestNext',
      (textEditor: vscode.TextEditor, _: vscode.TextEditorEdit) => {
        updater.next(textEditor);
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'extension.devFestPrevious',
      (textEditor: vscode.TextEditor, _: vscode.TextEditorEdit) => {
        updater.previous(textEditor);
      },
    ),
  );
}

class Updater {
  private step = 0;
  private steps: Array<{ file: string; content: string }> = [];
  private animator?: Animator = undefined;

  private statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
  );

  public reset(editor: vscode.TextEditor) {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage('Must be in an open WorkSpace');
      return;
    }
    if (editor.document.uri.scheme !== 'file') {
      vscode.window.showErrorMessage('Open editor must be a file');
      return;
    }
    const rootFolder = vscode.workspace.workspaceFolders[0];
    vscode.workspace.findFiles('typer/steps.json').then((uri) => {
      fs.readFile(uri[0].fsPath, 'UTF-8', (err, contents) => {
        if (err) {
          vscode.window.showErrorMessage(
            'Failed to read typer/steps.json $err',
          );
          return;
        }
        this.steps = jsonc.parse(contents);
        vscode.window.showInformationMessage('typer/steps.json loaded');
        this.step = 0;
        const editFile = rootFolder.uri.with({
          path: `${rootFolder.uri.path}/${this.steps[this.step].file}`,
        });
        if (editor.document.uri.fsPath !== editFile.fsPath) {
          vscode.window.showErrorMessage(`Open editor must be ${editFile}`);
          return;
        }
        this.setContents(editor);
      });
    });
  }

  public next(editor: vscode.TextEditor) {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage('Must be in an open WorkSpace');
      return;
    }
    if (this.steps.length === 0) {
      vscode.window.showInformationMessage('Run DevFest: Reset command');
      return;
    }

    if (this.step < this.steps.length - 1) {
      this.step += 1;
      const rootFolder = vscode.workspace.workspaceFolders[0];
      const editFile = rootFolder.uri.with({
        path: `${rootFolder.uri.path}/${this.steps[this.step].file}`,
      });
      if (editor.document.uri.fsPath !== editFile.fsPath) {
        vscode.window.showErrorMessage(`Open editor must be ${editFile}`);
        return;
      }
      this.animate(editor);
    }
  }

  public previous(editor: vscode.TextEditor) {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage('Must be in an open WorkSpace');
      return;
    }
    if (this.steps.length === 0) {
      vscode.window.showInformationMessage('Run DevFest: Reset command');
      return;
    }

    if (this.step > 0) {
      this.step -= 1;
      const rootFolder = vscode.workspace.workspaceFolders[0];
      const editFile = rootFolder.uri.with({
        path: `${rootFolder.uri.path}/${this.steps[this.step].file}`,
      });
      if (editor.document.uri.fsPath !== editFile.fsPath) {
        vscode.window.showErrorMessage(`Open editor must be ${editFile}`);
        return;
      }
      this.animate(editor);
    }
  }

  private setContents(editor: vscode.TextEditor) {
    if (this.animator) {
      this.animator.stop();
    }
    vscode.workspace.findFiles(this.steps[this.step].content).then((uri) => {
      fs.readFile(uri[0].fsPath, 'UTF-8', (err, contents) => {
        if (err) {
          vscode.window.showErrorMessage(
            `Failed to read ${this.steps[this.step].content} ${err}`,
          );
          return;
        }
        const { document } = editor;
        const fullText = document.getText();
        const range = new vscode.Range(
          document.positionAt(0),
          document.positionAt(fullText.length),
        );
        editor
          .edit((editBuilder) => {
            editBuilder.delete(range);
            editBuilder.insert(document.positionAt(0), contents);
          })
          .then(() => {
            document.save().then(() => {
              this.statusBarItem.text = `Step #${this.step + 1}`;
              this.statusBarItem.show();
            });
          });
      });
    });

    this.statusBarItem.text = `Step #${this.step + 1}`;
    this.statusBarItem.show();
  }

  private animate(editor: vscode.TextEditor) {
    if (this.animator) {
      this.animator.stop();
    }
    this.animator = new Animator(editor, this.steps[this.step].content);
    this.animator.start();
    this.statusBarItem.text = `Step #${this.step + 1}`;
    this.statusBarItem.show();
  }
}
