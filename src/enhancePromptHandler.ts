import * as vscode from "vscode";
import { PromptService } from "./promptService";


export class EnhancePromptHandler {
  async handle(...args: any[]) {
    try {
      const editorContext = this.getEditorContext();
      const textToEnhance = await this.getTextToEnhance(editorContext);

      if (!textToEnhance || textToEnhance.trim().length === 0) {
        vscode.window.showWarningMessage("No text found to enhance. Please select text or copy text to clipboard first.");
        return;
      }

      this.logContext(textToEnhance, editorContext);

      const enhancedPrompt = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Enhancing prompt...",
        cancellable: false
      }, async () => {
        const promptService = PromptService.getInstance();
        return await promptService.enhancePromptWithBothTemplates(
          textToEnhance,
          editorContext || { text: '', language: 'plaintext', fileName: 'untitled' }
        );
      });

      await this.showEnhancedPrompt(enhancedPrompt);

    } catch (error) {
      console.error("Error enhancing prompt:", error);
      vscode.window.showErrorMessage(`Failed to enhance prompt: ${error}`);
    } finally {
      await vscode.env.clipboard.writeText('');
    }
  }

  private getEditorContext(): { text: string; language: string; fileName: string } | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) { return undefined; }
    const document = editor.document;
    let context = {
      text: document.getText(),
      language: document.languageId,
      fileName: document.fileName.split(/[\\\/]/).pop() || 'untitled'
    };
    const selection = editor.selection;
    if (!selection.isEmpty) {
      const selectedText = document.getText(selection);
      if (selectedText && selectedText.trim().length > 0) {
        context = { ...context, text: selectedText };
        console.log("Using selected text from editor:", selectedText.substring(0, 2000) + "...");
      }
    }
    return context;
  }

  private async getTextToEnhance(editorContext?: { text: string }): Promise<string> {
    try {
      const clipboardText = await vscode.env.clipboard.readText();
      if (clipboardText && clipboardText.trim().length > 0) {
        console.log("Using text from clipboard:", clipboardText.substring(0, 500) + "...");
        return clipboardText;
      }
    } catch (error) {
      console.log("Could not read clipboard:", error);
    }
    return '';
  }

  private logContext(textToEnhance: string, editorContext?: { language: string; fileName: string; text: string }) {
    console.log("Text to enhance:", textToEnhance);
    if (editorContext) {
      console.log("Editor context:", {
        language: editorContext.language,
        fileName: editorContext.fileName,
        textLength: editorContext.text.length
      });
    }
  }

  private async showEnhancedPrompt(enhancedPrompt: string) {
    const doc = await vscode.workspace.openTextDocument({
      content: enhancedPrompt,
      language: 'markdown'
    });
    await vscode.window.showTextDocument(doc);
  }
}
