/**
 * Predefined prompt templates for enhancement and improvement operations
 */

/**
 * Advanced enhancement prompt template with comprehensive prompt engineering guidelines
 */
export const ADVANCED_ENHANCEMENT_PROMPT = (originalPrompt: string): string => `
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
- Assign a clear role to the AI
- Identify the most effective prompt engineering techniques eg: chain-of-thought, few-shot learning, etc.
- Adding helpful context and specifications
- Structuring information clearly
- Making requirements explicit
- Optimizing for AI understanding

**Important**: Return ONLY the enhanced prompt without any explanations, prefixes, or additional commentary.`;

/**
 * Basic improvement prompt template for general prompt enhancement
 */
export const BASIC_IMPROVEMENT_PROMPT = (originalPrompt: string): string => `
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

/**
 * Template for creating custom enhancement prompts with specific requirements
 */
export const createCustomEnhancementPrompt = (
    originalPrompt: string,
    requirements: string[],
    role?: string
): string => `
### Role ###
${role || 'You are an expert prompt engineer specializing in creating high-quality AI prompts.'}

### Enhancement Requirements ###
${requirements.map((req, index) => `${index + 1}. ${req}`).join('\n')}

### Original Prompt ###
${originalPrompt}

### Task ###
Transform the above prompt based on the specified requirements. Ensure the enhanced prompt is:
- Clear and unambiguous
- Optimized for AI understanding
- Structured logically
- Complete with necessary context

Return ONLY the enhanced prompt without any explanations or additional commentary.`;

/**
 * Available prompt template types
 */
export enum PromptTemplateType {
    ADVANCED_ENHANCEMENT = 'advanced',
    BASIC_IMPROVEMENT = 'basic',
    CUSTOM = 'custom'
}

/**
 * Get a prompt template by type
 */
export const getPromptTemplate = (
    type: PromptTemplateType,
    originalPrompt: string,
    customOptions?: {
        requirements?: string[];
        role?: string;
    }
): string => {
    switch (type) {
        case PromptTemplateType.ADVANCED_ENHANCEMENT:
            return ADVANCED_ENHANCEMENT_PROMPT(originalPrompt);
        
        case PromptTemplateType.BASIC_IMPROVEMENT:
            return BASIC_IMPROVEMENT_PROMPT(originalPrompt);
        
        case PromptTemplateType.CUSTOM:
            return createCustomEnhancementPrompt(
                originalPrompt,
                customOptions?.requirements || [],
                customOptions?.role
            );
        
        default:
            return BASIC_IMPROVEMENT_PROMPT(originalPrompt);
    }
};
