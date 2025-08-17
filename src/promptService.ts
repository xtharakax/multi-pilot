import * as vscode from "vscode";
import { 
    PRO_ENHANCEMENT_PROMPT, 
    BASIC_IMPROVEMENT_PROMPT,
    PRO_CONTEXT_AWARE_ENHANCEMENT_PROMPT,
    LITE_CONTEXT_AWARE_ENHANCEMENT_PROMPT,
    LITE_ENHANCEMENT_PROMPT
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
     * Enhance the user's prompt using the latest default LLM model with optional context
     */
    public async enhancePromptWithDefaultModel(
        originalPrompt: string, 
        editorContext?: {
            text: string;
            language: string;
            fileName: string;
        }
    ): Promise<string> {
        if (!this.defaultModel) {
            const initialized = await this.initializeDefaultModel();
            if (!initialized) {
                console.log('Could not initialize default model, returning original prompt');
                return originalPrompt;
            }
        }

        try {
            // Create both enhancement prompts for parallel processing
            let proPrompt = '';
            let litePrompt = '';
            
            if (editorContext && editorContext.text.trim().length > 0) {
                // Use context-aware enhancement when editor context is available
                proPrompt = PRO_CONTEXT_AWARE_ENHANCEMENT_PROMPT(originalPrompt, editorContext);
                litePrompt = LITE_CONTEXT_AWARE_ENHANCEMENT_PROMPT(originalPrompt, editorContext);
            } else {
                    // Fallback to standard enhancement without context
                proPrompt = PRO_ENHANCEMENT_PROMPT(originalPrompt);
                litePrompt = LITE_ENHANCEMENT_PROMPT(originalPrompt);
            }

            // Process both prompts in parallel using existing method
            const [liteResult, verboseResult] = await Promise.all([
                this.processEnhancement(litePrompt, 'LITE'),
                this.processEnhancement(proPrompt, 'ADVANCE')
            ]);

            // Create a default editorContext if none provided
            const contextForDisplay = editorContext || {
                text: '',
                language: 'text',
                fileName: 'No file selected'
            };

            // Use existing comparison document method
            return this.createComparisonDocument(originalPrompt, liteResult, verboseResult, contextForDisplay);
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

    /**
     * Enhance prompts using both LITE and PRO context-aware templates in parallel
     * Returns a formatted document with separate results
     */
    public async enhancePromptWithBothTemplates(
        originalPrompt: string,
        editorContext: {
            text: string;
            language: string;
            fileName: string;
        }
    ): Promise<string> {
        if (!this.defaultModel) {
            const initialized = await this.initializeDefaultModel();
            if (!initialized) {
                console.log('Could not initialize default model, returning original prompt');
                return this.createComparisonDocument(originalPrompt, originalPrompt, originalPrompt, editorContext);
            }
        }

        try {
            // Create both enhancement prompts
                const litePrompt = LITE_CONTEXT_AWARE_ENHANCEMENT_PROMPT(originalPrompt, editorContext);
            const proPrompt = PRO_CONTEXT_AWARE_ENHANCEMENT_PROMPT(originalPrompt, editorContext);

            // Process both templates in parallel
            const [liteResult, proResult] = await Promise.all([
                this.processEnhancement(litePrompt, 'LITE_CONTEXT_AWARE'),
                this.processEnhancement(proPrompt, 'CONTEXT_AWARE')
            ]);

            // Create formatted document with both results
            return this.createComparisonDocument(originalPrompt, liteResult, proResult, editorContext);

        } catch (error) {
            console.error('Error enhancing prompt with both templates:', error);
            return this.createComparisonDocument(originalPrompt, originalPrompt, originalPrompt, editorContext);
        }
    }

    /**
     * Process a single enhancement request
     */
    private async processEnhancement(enhancementPrompt: string, templateType: string): Promise<string> {
        try {
            const userMessage = vscode.LanguageModelChatMessage.User(enhancementPrompt);
            let enhancedPrompt = '';

            if (this.defaultModel) {
                const response = await this.defaultModel.sendRequest([userMessage]);
                for await (const chunk of response.text) {
                    enhancedPrompt += chunk;
                }

                console.log(`Enhanced prompt (${templateType}):`, enhancedPrompt);
                return enhancedPrompt.trim();
            }

            return 'Enhancement failed: No model available';
        } catch (error) {
            console.error(`Error processing ${templateType} enhancement:`, error);
            return `Enhancement failed: ${error}`;
        }
    }

    /**
     * Create a formatted comparison document
     */
    private createComparisonDocument(
        originalPrompt: string,
        liteResult: string,
        proResult: string,
        editorContext: {
            text: string;
            language: string;
            fileName: string;
        }
    ): string {
        return `# 🚀 Multi-Pilot Prompt Enhancement Comparison


## 📝 Original Prompt

\`\`\`
${originalPrompt}
\`\`\`


## ⚡ Lite Enhancement Result


\`\`\`
${liteResult}
\`\`\`


## 🔬 Pro Enhancement Result

\`\`\`
${proResult}
\`\`\`
`;
    }
}