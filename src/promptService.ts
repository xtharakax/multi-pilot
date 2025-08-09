import * as vscode from "vscode";
import { 
    ADVANCED_ENHANCEMENT_PROMPT, 
    BASIC_IMPROVEMENT_PROMPT, 
} from "./promptTemplates";

/**
 * Service to improve user prompts using available LLM models
 */
export class PromptService {
    private static instance: PromptService | undefined;
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
            const enhancementPrompt = ADVANCED_ENHANCEMENT_PROMPT(originalPrompt);

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
     * Improve the user's prompt using default model
     */
    public async improvePrompt(originalPrompt: string): Promise<string> {
        if (!this.defaultModel) {
            const initialized = await this.initializeDefaultModel();
            if (!initialized) {
                console.log('Could not initialize any model, returning original prompt');
                return originalPrompt;
            }
        }

        try {
            const enhancementPrompt = BASIC_IMPROVEMENT_PROMPT(originalPrompt);

            const userMessage = vscode.LanguageModelChatMessage.User(enhancementPrompt);
            let improvedPrompt = '';

            // Use the default model
            if (this.defaultModel) {
                const response = await this.defaultModel.sendRequest([userMessage]);
                for await (const chunk of response.text) {
                    improvedPrompt += chunk;
                }

                console.log('Original prompt:', originalPrompt);
                console.log('Improved prompt:', improvedPrompt);
                console.log('Model used:', this.defaultModel.id);

                return improvedPrompt.trim();
            }

            return originalPrompt;
        } catch (error) {
            console.error('Error improving prompt:', error);
            return originalPrompt;
        }
    }
}