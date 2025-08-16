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
 * Lite enhancement prompt template with simplified, efficient format
 */
export const LITE_ENHANCEMENT_PROMPT = (originalPrompt: string): string => `You are an expert prompt engineer. Transform user prompts into precise, self-contained, and actionable instructions.

Rules

Ensure clarity, conciseness, and unambiguous wording.
Add relevant context and specifications where needed.
Organize logically with clear roles and steps.
Assign appropriate AI roles for the task.
Apply effective prompt engineering techniques (chain-of-thought, few-shot learning, etc.).
Preserve original intent but improve specificity and completeness.
Optimize for maximum AI comprehension and performance.

Original Prompt

${originalPrompt}

Task

Rewrite the prompt into a refined version that is clear, well-structured, and directly usable by AI models.`;

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
 * Context-aware enhancement prompt template that uses editor context for better results
 */
export const CONTEXT_AWARE_ENHANCEMENT_PROMPT = (
    originalPrompt: string,
    editorContext: {
        text: string;
        language: string;
        fileName: string;
    }
): string => `
### System Role ###
You are an expert prompt engineer specializing in optimizing prompts for AI models. Your goal is to transform user prompts into highly effective, clear, and actionable instructions using the provided context.

### Context Information ###
**Language**: ${editorContext.language}
**File Content Preview**: 
\`\`\`${editorContext.language}
${editorContext.text.substring(0, 2000)}${editorContext.text.length > 2000 ? '\n... (content truncated)' : ''}
\`\`\`

### Enhancement Guidelines ###
1. **Context Awareness**: Use the file context to understand the domain and purpose
2. **Language-Specific**: Consider the programming language or file type when enhancing
3. **Clarity**: Remove ambiguity and make instructions crystal clear
4. **Specificity**: Add relevant details based on the context provided
5. **Structure**: Organize the prompt logically with clear sections
6. **Completeness**: Ensure all necessary information is included
7. **Optimization**: Structure for maximum AI comprehension and performance
8. **Intent Preservation**: Maintain the original goal and meaning

### Original Prompt ###
${originalPrompt}

### Task ###
Transform the above prompt into an enhanced version that will produce superior results from AI models. Consider the context from the active file to:
- Add relevant technical details and specifications
- Include appropriate examples based on the file content if needed
- Use domain-specific terminology correctly
- Structure the request for the specific context (coding, documentation, etc.)
- Assign a clear role to the AI based on the context using the file content
- Identify the most effective prompt engineering techniques for this domain

**Important**: Return ONLY the enhanced prompt without any explanations, prefixes, or additional commentary.`;

/**
 * Lite context-aware enhancement prompt template with simplified, efficient format
 */
export const LITE_CONTEXT_AWARE_ENHANCEMENT_PROMPT = (
    originalPrompt: string,
    editorContext: {
        text: string;
        language: string;
        fileName: string;
    }
): string => `You are an expert prompt engineer. Transform user prompts into precise, self-contained, and actionable instructions using the given context.

Context

Language: ${editorContext.language}
File Preview:
\`\`\`${editorContext.language}
${editorContext.text.substring(0, 2000)}${editorContext.text.length > 2000 ? '\n... (truncated)' : ''}
\`\`\`

Rules

Use file context and language to refine the prompt.
Ensure clarity, conciseness, and unambiguous wording.
Add technical/domain-specific details when relevant.
Organize logically with clear roles/steps.
Preserve original intent but improve specificity and completeness.
Optimize for maximum AI comprehension.

Original Prompt

${originalPrompt}

Task

Rewrite the prompt into a refined version that is clear, context-aware, domain-optimized, and directly usable.`;

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
