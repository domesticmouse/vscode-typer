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

import * as fs from 'fs/promises';
import * as jsonc from 'jsonc-parser';
import * as vscode from 'vscode';
import { Animator } from './animator';

export function activate(context: vscode.ExtensionContext) {
  const updater = new Updater();
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'domesticmouse.vscode-typer.ResetMain',
      (textEditor: vscode.TextEditor) => {
        void updater.reset(textEditor);
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'domesticmouse.vscode-typer.Next',
      (textEditor: vscode.TextEditor) => {
        updater.next(textEditor);
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'domesticmouse.vscode-typer.Previous',
      (textEditor: vscode.TextEditor) => {
        updater.previous(textEditor);
      },
    ),
  );
}

class Updater {
  private step = 0;
  private steps: {
    file: string;
    content: string;
    charsPerChange?: number;
  }[] = [];
  private animator?: Animator = undefined;

  private statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
  );

  public async reset(editor: vscode.TextEditor) {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage('Must be in an open WorkSpace');
      return;
    }
    if (editor.document.uri.scheme !== 'file') {
      vscode.window.showErrorMessage('Open editor must be a file');
      return;
    }
    const rootFolder = vscode.workspace.workspaceFolders[0];
    const uris = await vscode.workspace.findFiles('typer/steps.json');
    if (uris.length === 0) {
      vscode.window.showErrorMessage('typer/steps.json not found');
      return;
    }
    try {
      const contents = await fs.readFile(uris[0].fsPath, 'utf-8');
      this.steps = jsonc.parse(contents) as {
        file: string;
        content: string;
        charsPerChange?: number;
      }[];
      vscode.window.showInformationMessage('typer/steps.json loaded');
      this.step = 0;
      const editFile = rootFolder.uri.with({
        path: `${rootFolder.uri.path}/${this.steps[this.step].file}`,
      });
      if (editor.document.uri.fsPath !== editFile.fsPath) {
        vscode.window.showErrorMessage(`Open editor must be ${editFile.fsPath}`);
        return;
      }
      await this.setContents(editor);
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to read typer/steps.json ${String(err)}`);
    }
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
        vscode.window.showErrorMessage(`Open editor must be ${editFile.fsPath}`);
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
        vscode.window.showErrorMessage(`Open editor must be ${editFile.fsPath}`);
        return;
      }
      this.animate(editor);
    }
  }

  private async setContents(editor: vscode.TextEditor) {
    if (this.animator) {
      this.animator.stop();
    }
    const uris = await vscode.workspace.findFiles(
      this.steps[this.step].content,
    );
    if (uris.length === 0) {
      vscode.window.showErrorMessage(
        `Content file ${this.steps[this.step].content} not found`,
      );
      return;
    }
    try {
      const contents = await fs.readFile(uris[0].fsPath, 'utf-8');
      const { document } = editor;
      const fullText = document.getText();
      const range = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length),
      );
      await editor.edit((editBuilder) => {
        editBuilder.delete(range);
        editBuilder.insert(document.positionAt(0), contents);
      });
      await document.save();
      this.showStep();
      editor.revealRange(
        range,
        vscode.TextEditorRevealType.InCenterIfOutsideViewport,
      );
    } catch (err) {
      vscode.window.showErrorMessage(
        `Failed to read ${this.steps[this.step].content} ${String(err)}`,
      );
    }
  }

  private animate(editor: vscode.TextEditor) {
    if (this.animator) {
      this.animator.stop();
    }
    this.animator = new Animator(
      editor,
      this.steps[this.step].content,
      this.steps[this.step].charsPerChange,
    );
    void this.animator.start();
    this.showStep();
  }

  private showStep() {
    this.statusBarItem.text = `Step #${this.step + 1} of ${this.steps.length}`;
    this.statusBarItem.show();
  }
}
