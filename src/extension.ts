/*
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs';
import * as jsonc from 'jsonc-parser';
import * as vscode from 'vscode';
import { Animator } from './animator';

export function activate(context: vscode.ExtensionContext) {
  const updater = new Updater();
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'domesticmouse.vscode-typer.ResetMain',
      (textEditor: vscode.TextEditor, _: vscode.TextEditorEdit) => {
        updater.reset(textEditor);
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'domesticmouse.vscode-typer.Next',
      (textEditor: vscode.TextEditor, _: vscode.TextEditorEdit) => {
        updater.next(textEditor);
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'domesticmouse.vscode-typer.Previous',
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
            `Failed to read typer/steps.json ${err}`,
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
      vscode.window.showInformationMessage("Run 'VSCode Typer: Reset' command");
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
      vscode.window.showInformationMessage("Run 'VSCode Typer: Reset' command");
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
              this.showStep();
            });
          });
      });
    });

    this.showStep();
  }

  private animate(editor: vscode.TextEditor) {
    if (this.animator) {
      this.animator.stop();
    }
    this.animator = new Animator(editor, this.steps[this.step].content);
    this.animator.start();
    this.showStep();
  }

  private showStep() {
    this.statusBarItem.text = `Step #${this.step + 1} of ${this.steps.length}`;
    this.statusBarItem.show();
  }
}
