import * as vscode from "vscode";
import { ChatWebView } from "./chatWebview";
import { log } from "console";

/**
 * Data structure for AI model metadata
 */
interface AIModel {
  id: string;
  name: string;
  displayName: string;
  matchPatterns: string[];
}

/**
 * Collection of models we want to use
 */
const AI_MODELS: AIModel[] = [
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    displayName: 'GPT-4o',
    matchPatterns: ['gpt', 'openai', '4o'] 
  },
  { 
    id: 'gemini-2.0-flash-001', 
    name: 'Gemini Flash', 
    displayName: 'Gemini 2.0 Flash',
    matchPatterns: ['gemini', 'google', 'flash'] 
  }
];

/**
 * Helper to handle model errors and provide user-friendly messages
 */
function getModelErrorMessage(error: any): string {
  // Check for specific error patterns
  if (error?.message?.includes("Model is not supported")) {
    return `Model compatibility error: The model is not supported for this request. This typically happens when the model doesn't support the requested operation or the API version isn't compatible.`;
  } else if (error?.code === "model_not_supported") {
    return `Model compatibility error: The selected model is not supported. Please try a different model or check your configuration.`;
  } else if (error?.message?.includes("Request Failed: 400")) {
    return `Request error: The API returned a 400 error. This typically means the request format wasn't compatible with the model.`;
  }
  
  // General error fallback
  return `Error: ${error?.message || "Unknown error occurred"}`;
}

async function registerMultiModelChatParticipant(context: vscode.ExtensionContext) {
  let lastUserQuery: string | null = null;
  let lastModelResponse: string | null = null;

  // Create the chat participant with the ID from package.json
  vscode.chat.createChatParticipant(
    "vscode.multi-model-chat",
    async (request, chatContext, response, token) => {
      console.log("Received chat request for multi-model-chat:", request);

      // Build the user message with enhanced context and role assignment
      let userMessageText = request.prompt;
      if (lastUserQuery && lastModelResponse) {
        userMessageText = `### Role ###\n` +
          `You are an expert AI assistant. Your task is to provide detailed, beginner-friendly explanations.\n` +
          `### Conversation History ###\n` +
          `Previous Question: ${lastUserQuery}\n` +
          `Previous Response: ${lastModelResponse}\n` +
          `### Current Question ###\n` +
          `${request.prompt}`;
      } else {
        userMessageText = `### Role ###\n` +
          `You are an expert AI assistant. Your task is to provide detailed, beginner-friendly explanations.\n` +
          `### Current Question ###\n${request.prompt}`;
      }

      const userMessage = vscode.LanguageModelChatMessage.User(userMessageText);

      // Try to select each of our preferred models one by one
      const selectedModels: vscode.LanguageModelChat[] = [];
      
      for (const modelConfig of AI_MODELS) {
        try {
          const modelMatches = await vscode.lm.selectChatModels({ id: modelConfig.id });
          if (modelMatches && modelMatches.length > 0) {
            selectedModels.push(modelMatches[0]);
          }
        } catch (error) {
          console.log(`Could not select model ${modelConfig.id}: ${error}`);
        }
      }
      
      // If we couldn't find any of our specific models, get any available models
      if (selectedModels.length === 0) {
        const chatModels = await vscode.lm.selectChatModels();
        selectedModels.push(...(chatModels || []));
      }
      
      console.log("Available models:", selectedModels?.map(model => model.id) || []);
      
      if (!selectedModels || selectedModels.length === 0) {
        response.markdown("No language models available. Please check your configuration.");
        return;
      }

      // Initialize the webview to display the response
      const chatWebView = ChatWebView.getInstance();
      chatWebView.createOrShowWebview(context);
      
      // Set the user's message in the webview
      chatWebView.setUserMessage(request.prompt);
      
      // Tell VS Code chat what we're doing
      response.markdown(`Processing your request using specified AI models. Please check the results in the panel to the right.`);
      
      // Use all available models for comparison (up to the 3 we specified)
      const modelsToUse = selectedModels.slice(0, 3);
      console.log(`Using ${modelsToUse.length} models for comparison:`, modelsToUse.map(m => m.id));
      
      // Send the request to each available model in parallel
      const modelRequests = modelsToUse.map(async (model, index) => {
        // Find matching model in our AI_MODELS array for better display names
        const modelConfig = AI_MODELS.find(m => m.id === model.id);
        const modelName = modelConfig ? modelConfig.displayName : `Model ${index + 1}: ${model.id.split('/').pop() || model.id}`;
        
        console.log(`Using model: ${model.id} as ${modelName}`);
        
        // Start showing typing indicator for this model
        chatWebView.startModelResponse(modelName);
        
        let responseText = '';
        try {
          // Send the user's prompt to this model
          const chatRequest = await model.sendRequest(
            [userMessage],
            undefined,
            token
          );
          
          // Stream the response to the webview for this model
          for await (const token of chatRequest.text) {
            responseText += token;
            chatWebView.updateModelResponse(modelName, responseText);
          }

          // Update the last query and response
          lastUserQuery = request.prompt;
          lastModelResponse = responseText;
        } catch (error: any) {
          console.error(`Error processing request with ${modelName}:`, error);
          const errorMessage = getModelErrorMessage(error);
          chatWebView.updateModelResponse(modelName, errorMessage);
          
          // Try to provide more helpful debugging information in the console
          if (error.code) {
            console.error(`Error code: ${error.code}`);
          }
          if (error.param) {
            console.error(`Error param: ${error.param}`);
          }
          if (error.type) {
            console.error(`Error type: ${error.type}`);
          }
        }
      });
      
      try {
        // Wait for all model requests to complete
        await Promise.all(modelRequests);
      } catch (error) {
        console.error("Error in Promise.all for model requests:", error);
        response.markdown(`An error occurred while processing requests in parallel. Please try again.`);
      }
    }
  );
}

export async function activate(context: vscode.ExtensionContext) {
  console.log("Activating multi-model-chat extension");
  
  // Register the chat participant
  await registerMultiModelChatParticipant(context);
  
  // Register the search command
  const disposable = vscode.commands.registerCommand(
    "multi-model-chat-extension.searchBuAgent",
    async () => {
      vscode.window.showInformationMessage("Multi-model Search activated!");
      
      // Open the chat view with our participant
      await vscode.commands.executeCommand("vscode.chat.open", "vscode.multi-model-chat");
    }
  );
  
  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log("Deactivating multi-model-chat extension");
}
