import * as vscode from "vscode";
import { ChatWebView } from "./chatWebview";
import { StorageService } from "./storageService";

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
 * Collection of default models to use if no user selection exists
 */
const DEFAULT_AI_MODELS: AIModel[] = [
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
 * Get the current AI models based on user selection or defaults
 */
async function getAIModels(context: vscode.ExtensionContext): Promise<AIModel[]> {
  const storageService = StorageService.getInstance(context);
  const selectedModelIds = storageService.loadSelectedModels();
  
  if (!selectedModelIds || selectedModelIds.length === 0) {
    //console.log("No saved model selection found, using defaults");
    return DEFAULT_AI_MODELS;
  }
  
  // Convert selected model IDs into full AIModel objects
  const selectedModels: AIModel[] = [];
  
  for (const modelId of selectedModelIds) {
    // Check if this model exists in our defaults (for display name and patterns)
    const existingModel = DEFAULT_AI_MODELS.find(m => m.id === modelId);
    
    if (existingModel) {
      // Use the existing model configuration
      selectedModels.push(existingModel);
    } else {
      // Create a new model configuration
      const displayName = modelId.split('/').pop() || modelId;
      selectedModels.push({
        id: modelId,
        name: displayName,
        displayName: displayName,
        matchPatterns: [modelId.toLowerCase()]
      });
    }
  }
  
  //console.log("Using selected models:", selectedModels.map(m => m.id));
  return selectedModels;
}

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
      //console.log("Received chat request for multi-model-chat:", request);

      // Build the user message with enhanced context and role assignment
      let userMessageText = request.prompt;
      if (lastUserQuery || lastModelResponse) {
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

      // Get current AI models based on user selection - read from storage each time
      // to ensure we have the latest selection (in case JSON file was modified)
      const AI_MODELS = await getAIModels(context);
      
      // Clear selectedModels to ensure we don't use old models
      const selectedModels: vscode.LanguageModelChat[] = [];
      
      // Try each model in our list
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
      
      // If we still couldn't find any models, get any available
      if (selectedModels.length === 0) {
        //console.log("No selected models available, getting any available models");
        const chatModels = await vscode.lm.selectChatModels();
        selectedModels.push(...(chatModels || []));
      }
      
      //console.log("Current available models:", selectedModels?.map(model => model.id) || []);
      
      if (!selectedModels || selectedModels.length === 0) {
        response.markdown("No language models available. Please check your configuration.");
        return;
      }

      // Initialize the webview to display the response
      const chatWebView = ChatWebView.getInstance();
      chatWebView.createOrShowWebview(context);
      
      // Reset the webview model list before setting new models
      chatWebView.resetModels();

      // Use all available models for comparison (up to 6)
      const modelsToUse = selectedModels.slice(0, 6);
      
      // Initialize each model's response state
      modelsToUse.forEach((model, index) => {
        const modelConfig = AI_MODELS.find(m => m.id === model.id);
        const modelName = modelConfig ? modelConfig.displayName : `Model ${index + 1}: ${model.id.split('/').pop() || model.id}`;
        chatWebView.startModelResponse(modelName);
      });

      // Set the user's message in the webview
      chatWebView.setUserMessage(request.prompt);
      
      // Tell VS Code chat what we're doing
      response.markdown(`Processing your request using ${selectedModels.length} AI model(s). Please check the results in the panel to the right.`);
      
      // Send the request to each available model in parallel
      const modelRequests = modelsToUse.map(async (model, index) => {
        // Find matching model in our AI_MODELS array for better display names
        const modelConfig = AI_MODELS.find(m => m.id === model.id);
        const modelName = modelConfig ? modelConfig.displayName : `Model ${index + 1}: ${model.id.split('/').pop() || model.id}`;
        
        //console.log(`Using model: ${model.id} as ${modelName}`);
        
        // Start showing typing indicator for this model
        chatWebView.startModelResponse(modelName);

        console.log(`Sending request to model ${modelName}:`, userMessageText);
        
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

          // Check if responseText contains an error message
          if (responseText.toLowerCase().includes('error:')) {
            console.warn(`Error detected in responseText: ${responseText}`);
            // Do not update lastModelResponse if an error is detected to avoid that is going to be used in the next request
          } else {
            lastModelResponse = responseText;
          }
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

async function showModelSelectionDialog(context: vscode.ExtensionContext): Promise<string[] | undefined> {
  try {
    // Initialize storage service
    const storageService = StorageService.getInstance(context);
    
    // Fetch all available models
    const availableModels = await vscode.lm.selectChatModels();

    if (!availableModels || availableModels.length === 0) {
      vscode.window.showWarningMessage("No language models available. Please check your configuration.");
      return;
    }

    // Load previously selected models from storage
    const previouslySelectedModels = storageService.loadSelectedModels();
    //console.log("Previously selected models:", previouslySelectedModels);
    
    // Create a QuickPick UI for model selection
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = availableModels.map(model => ({ 
      label: model.id,
      picked: previouslySelectedModels.includes(model.id)
    }));
    quickPick.canSelectMany = true;
    quickPick.title = "Select AI Models";
    
    // Pre-select the previously selected models
    const preSelectedItems = quickPick.items.filter(item => 
      previouslySelectedModels.includes(item.label)
    );
    quickPick.selectedItems = preSelectedItems;
    
    // Save models whenever the selection changes
    quickPick.onDidChangeSelection(items => {
      const selectedModels = items.map(item => item.label);
      // Save immediately when selection changes
      storageService.saveSelectedModels(selectedModels);
      //console.log(`Selection changed, saved models: ${selectedModels.join(', ')}`);
    });

    return new Promise<string[] | undefined>((resolve) => {
      quickPick.onDidAccept(() => {
        const selectedModels = quickPick.selectedItems.map(item => item.label);
        quickPick.hide();
        resolve(selectedModels);
      });

      quickPick.onDidHide(() => {
        resolve(undefined);
      });

      quickPick.show();
    });
  } catch (error) {
    console.error("Error fetching models for selection dialog:", error);
    vscode.window.showErrorMessage("Failed to fetch models. Please try again.");
    return;
  }
}

export async function activate(context: vscode.ExtensionContext) {

  // Register the chat participant
  await registerMultiModelChatParticipant(context);

  // Register the search command
  const disposableSearch = vscode.commands.registerCommand(
    "multi-model-chat-extension.searchBuAgent",
    async () => {
      vscode.window.showInformationMessage("Multi-model Search activated!");

      // Open the chat view with our participant
      await vscode.commands.executeCommand("vscode.chat.open", "vscode.multi-model-chat");
    }
  );

  // Register the model selection command
  const disposableModelSelection = vscode.commands.registerCommand(
    "multi-model-chat-extension.selectModels",
    async () => {
      const selectedModels = await showModelSelectionDialog(context);
      if (selectedModels && selectedModels.length > 0) {
        vscode.window.showInformationMessage(`Selected Models: ${selectedModels.join(", ")}`);
      } else if (selectedModels) {
        vscode.window.showInformationMessage("No models selected.");
      }
    }
  );

  context.subscriptions.push(disposableSearch, disposableModelSelection);
}

export function deactivate() {
  console.log("Deactivating multi-model-chat extension");
}
