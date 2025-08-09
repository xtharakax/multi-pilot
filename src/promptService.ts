import * as vscode from "vscode";

/**
 * Service to improve user prompts using GPT-4o
 */
export class PromptService {
    private static instance: PromptService | undefined;
    private gpt4oModel: vscode.LanguageModelChat | undefined;
    private defaultModel: vscode.LanguageModelChat | undefined;

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
     * Initialize the default latest LLM model
     */
    public async initializeDefaultModel(): Promise<boolean> {
        try {
            // Get the latest available model (VS Code will return the best available)
            const models = await vscode.lm.selectChatModels();
            if (models && models.length > 0) {
                // Use the first model as it's typically the latest/best available
                this.defaultModel = models[0];
                console.log(`Initialized default model: ${this.defaultModel.id}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to initialize default model:', error);
            return false;
        }
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
     * Enhance the user's prompt using the latest default LLM model
     */
    public async enhancePromptWithDefaultModel(originalPrompt: string): Promise<string> {
        if (!this.defaultModel) {
            const initialized = await this.initializeDefaultModel();
            if (!initialized) {
                console.log('Could not initialize default model, returning original prompt');
                return originalPrompt;
            }
        }

        try {
            const enhancementPrompt = `
### System Role ###
You are an expert prompt engineer specializing in optimizing prompts for AI models. Your goal is to transform user prompts into highly effective, clear, and actionable instructions.

### Enhancement Guidelines ###
1. **Clarity**: Remove ambiguity and make instructions crystal clear
2. **Specificity**: Add relevant details and context where needed
3. **Structure**: Organize the prompt logically with clear sections
4. **Completeness**: Ensure all necessary information is included
5. **Optimization**: Structure for maximum AI comprehension and performance
6. **Intent Preservation**: Maintain the original goal and meaning

### Original Prompt ###
${originalPrompt}

### Task ###
Transform the above prompt into an enhanced version that will produce superior results from AI models. Focus on:
- Correcting any grammatical errors or typos
- Assign a clear role to the AI
- Identify the most effective prompt engineering technique
- Adding helpful context and specifications
- Structuring information clearly
- Making requirements explicit
- Optimizing for AI understanding

**Important**: Return ONLY the enhanced prompt without any explanations, prefixes, or additional commentary.`;

            const userMessage = vscode.LanguageModelChatMessage.User(enhancementPrompt);
            let enhancedPrompt = '';

            // Send request to the default model
            if (this.defaultModel) {
                const response = await this.defaultModel.sendRequest([userMessage]);
                for await (const chunk of response.text) {
                    enhancedPrompt += chunk;
                }

                console.log('Original prompt:', originalPrompt);
                console.log('Enhanced prompt (using default model):', enhancedPrompt);
                console.log('Model used:', this.defaultModel.id);

                return enhancedPrompt.trim();
            }

            return originalPrompt;
        } catch (error) {
            console.error('Error enhancing prompt with default model:', error);
            return originalPrompt;
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
6. Optimizing it for AI performance
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