import * as vscode from "vscode";

/**
 * Service to improve user prompts using GPT-4o
 */
export class PromptService {
    private static instance: PromptService | undefined;
    private gpt4oModel: vscode.LanguageModelChat | undefined;

    private constructor() {}

    /**
     * Get singleton instance of PromptService
     */
    public static getInstance(): PromptService {
        if (!PromptService.instance) {
            PromptService.instance = new PromptService();
        }
        return PromptService.instance;
    }

    /**
     * Initialize the GPT-4o model
     */
    public async initializeModel(): Promise<boolean> {
        try {
            const models = await vscode.lm.selectChatModels({ id: 'gpt-4o' });
            if (models && models.length > 0) {
                this.gpt4oModel = models[0];
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to initialize GPT-4o model:', error);
            return false;
        }
    }

    /**
     * Improve the user's prompt using GPT-4o
     */
    public async improvePrompt(originalPrompt: string): Promise<string> {
        if (!this.gpt4oModel) {
            const initialized = await this.initializeModel();
            if (!initialized) {
                console.log('Could not initialize GPT-4o model, returning original prompt');
                return originalPrompt;
            }
        }

        try {
            const enhancementPrompt = `
### Role ###
You are an expert prompt engineer. Your task is to improve the given prompt by:
1. Making it more specific and detailed
2. Adding relevant context if needed
3. Structuring it in a clear way
4. Removing ambiguity
5. Ensuring it will produce high-quality results

### Audience ###
The improved prompt will be used with a large language model like GPT-4 to generate accurate and helpful responses.

### Current Prompt ###
${originalPrompt}

### Task ###
Please provide an improved version of this prompt that will help get better results.
- Keep the core intent of the original prompt
- Remove any typos or grammatical errors
- Add any missing context that would be helpful
- Structure the prompt clearly
- Make it optimized for AI performance

Return ONLY the improved prompt, with no explanations or additional text.`;

            const userMessage = vscode.LanguageModelChatMessage.User(enhancementPrompt);
            let improvedPrompt = '';

            // Send request to GPT-4o
            if (this.gpt4oModel) {
                const response = await this.gpt4oModel.sendRequest([userMessage]);
                for await (const chunk of response.text) {
                    improvedPrompt += chunk;
                }

                console.log('Original prompt:', originalPrompt);
                console.log('Improved prompt:', improvedPrompt);

                return improvedPrompt.trim();
            }

            return originalPrompt;
        } catch (error) {
            console.error('Error improving prompt:', error);
            return originalPrompt;
        }
    }
}