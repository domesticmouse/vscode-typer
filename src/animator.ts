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

import * as jsdiff from 'diff';
import * as vscode from 'vscode';

const charactersPerChange = 5;
const heartbeatInterval = 33;

export class Animator {
  private editor: vscode.TextEditor;
  private target: string;
  private running = false;

  constructor(editor: vscode.TextEditor, target: string) {
    this.editor = editor;
    this.target = target;
  }

  public start() {
    this.running = true;
    setTimeout(() => {
      this.heartbeat();
    }, heartbeatInterval);
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
    const diffs = jsdiff.diffChars(fullText, this.target);
    let cursor = 0;
    let changed = false;
    diffs.forEach((diff) => {
      if (changed) {
        return;
      }
      if (diff.added) {
        this.editor.edit((editBuilder) => {
          const change = diff.value.substring(0, charactersPerChange);
          editBuilder.insert(document.positionAt(cursor), change);
          changed = true;
        });
      } else if (diff.removed) {
        this.editor.edit((editBuilder) => {
          const delta =
            diff.value.length > charactersPerChange
              ? charactersPerChange
              : diff.value.length;
          const range = new vscode.Range(
            document.positionAt(cursor),
            document.positionAt(cursor + delta),
          );
          editBuilder.delete(range);
          changed = true;
        });
      } else {
        cursor += diff.value.length;
      }
    });
    if (!changed) {
      this.running = false;
    }
    setTimeout(() => {
      this.heartbeat();
    }, heartbeatInterval);
  }
}
