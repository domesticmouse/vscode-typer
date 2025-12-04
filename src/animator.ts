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
import * as vscode from 'vscode';
import { getNextEdit } from './animator-logic';

const charactersPerChange = 5;
const heartbeatInterval = 33;

export class Animator {
  private editor: vscode.TextEditor;
  private contentPath: string;
  private target = 'not loaded yet';
  private running = false;
  private charsPerChange = charactersPerChange;

  constructor(
    editor: vscode.TextEditor,
    contentPath: string,
    charsPerChange?: number,
  ) {
    this.editor = editor;
    this.contentPath = contentPath;
    if (charsPerChange) {
      this.charsPerChange = charsPerChange;
    }
  }

  public async start() {
    this.running = true;
    try {
      const uris = await vscode.workspace.findFiles(this.contentPath);
      if (uris.length === 0) {
        this.running = false;
        vscode.window.showErrorMessage(
          `Content file not found: ${this.contentPath}`,
        );
        return;
      }
      this.target = await fs.readFile(uris[0].fsPath, 'utf-8');
      setTimeout(() => {
        this.heartbeat();
      }, heartbeatInterval);
    } catch (err) {
      this.running = false;
      vscode.window.showErrorMessage(
        `Failed to read ${this.contentPath}: ${String(err)}`,
      );
    }
  }
  public stop() {
    this.running = false;
  }

  private heartbeat() {
    if (!this.running) {
      return;
    }
    const { document } = this.editor;
    const fullText = document.getText();
    const editOp = getNextEdit(fullText, this.target, this.charsPerChange);

    if (!editOp) {
      this.running = false;
      void document.save();
    } else {
      if (editOp.type === 'insert') {
        this.editor.edit((editBuilder) => {
          editBuilder.insert(document.positionAt(editOp.position), editOp.text);
          const range = new vscode.Range(
            document.positionAt(editOp.position),
            document.positionAt(editOp.position + editOp.text.length),
          );
          this.editor.revealRange(
            range,
            vscode.TextEditorRevealType.InCenterIfOutsideViewport,
          );
        });
      } else if (editOp.type === 'delete') {
        this.editor.edit((editBuilder) => {
          const range = new vscode.Range(
            document.positionAt(editOp.position),
            document.positionAt(editOp.position + editOp.length),
          );
          this.editor.revealRange(
            range,
            vscode.TextEditorRevealType.InCenterIfOutsideViewport,
          );
          editBuilder.delete(range);
        });
      }
    }

    if (editOp) {
      setTimeout(() => {
        this.heartbeat();
      }, heartbeatInterval);
    }
  }
}
