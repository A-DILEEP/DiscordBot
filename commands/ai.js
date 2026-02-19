import { SlashCommandBuilder } from "discord.js";
import ollama from "ollama";

// Store conversation history (in production, use a database)
const conversationHistory = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName("ai")
    .setDescription("Chat with local AI! Have a conversation with the bot.")
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("What do you want to say to the AI?")
        .setRequired(true)
        .setMaxLength(500)
    )
    .addBooleanOption(option =>
      option
        .setName("reset")
        .setDescription("Reset the conversation history")
        .setRequired(false)
    ),

  async execute(interaction) {
    const userMessage = interaction.options.getString("message");
    const shouldReset = interaction.options.getBoolean("reset") || false;
    const userId = interaction.user.id;

    // Reset conversation if requested
    if (shouldReset) {
      conversationHistory.delete(userId);
      return await interaction.reply("🧹 **Conversation reset!** Your chat history has been cleared.");
    }

    // Get or initialize conversation history
    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, []);
    }

    const history = conversationHistory.get(userId);

    // Add user message to history
    history.push({ role: "user", content: userMessage });

    // Keep only last 5 messages to avoid context limits
    if (history.length > 5) {
      history.splice(0, history.length - 5);
    }

    try {
      await interaction.deferReply(); // Show "thinking" indicator

      // Create conversation context for Ollama
      let context = "You are a helpful, friendly Discord bot named Naruto Bot. You're fun, witty, and engaging. Keep responses conversational and not too long. You can be sarcastic but always helpful.\n\n";

      // Add conversation history
      history.forEach(msg => {
        if (msg.role === "user") {
          context += `User: ${msg.content}\n`;
        } else {
          context += `Assistant: ${msg.content}\n`;
        }
      });

      context += "Assistant: ";

      const response = await ollama.chat({
        model: 'llama2', // You can change this to any model you have installed
        messages: [{ role: 'user', content: context }],
        stream: false,
      });

      const aiResponse = response.message.content;

      // Add AI response to history
      history.push({ role: "assistant", content: aiResponse });

      // Format the response
      const reply = `🤖 **Local AI Response:**\n${aiResponse}\n\n💬 *Continue the conversation with another /ai command!*`;

      await interaction.editReply(reply);

    } catch (error) {
      console.error("Ollama Error:", error);

      let errorMessage = "❌ **Sorry, I couldn't connect to the local AI.**\n\n";

      if (error.message?.includes("connection")) {
        errorMessage += "Make sure Ollama is running with: `ollama serve`\n";
        errorMessage += "And you have a model installed: `ollama pull llama2`";
      } else if (error.message?.includes("model")) {
        errorMessage += "The AI model isn't available. Try: `ollama pull llama2`";
      } else {
        errorMessage += "There might be a temporary issue. Check if Ollama is running.";
      }

      await interaction.editReply(errorMessage);
    }
  },
};