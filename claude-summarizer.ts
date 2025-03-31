#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ConversationSummary {
  timestamp: string;
  title: string;
  summary: string;
  keyPoints: string[];
  metadata: {
    totalMessages: number;
    lastMessageTime: string;
    topics: string[];
    context: string;
  };
}

function formatMessage(message: Message): string {
  const role = message.role === 'user' ? 'User' : 'Assistant';
  const timestamp = message.timestamp ? ` (${message.timestamp})` : '';
  return `## ${role}${timestamp}\n\n${message.content}\n\n`;
}

function formatConversation(messages: Message[]): string {
  const header = `# Claude Conversation Export\n\n*Exported on ${new Date().toLocaleString()}*\n\n`;
  return header + messages.map(formatMessage).join('---\n\n');
}

function extractTopics(messages: Message[]): string[] {
  // Simple topic extraction based on common words and patterns
  const topics = new Set<string>();
  const commonWords = new Set(['project', 'code', 'file', 'script', 'function', 'error', 'bug', 'feature', 'test']);
  
  messages.forEach(message => {
    const words = message.content.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (commonWords.has(word)) {
        topics.add(word);
      }
    });
  });
  
  return Array.from(topics);
}

function generateSummary(messages: Message[]): ConversationSummary {
  // Extract the first user message as title (or use a default)
  const title = messages.find(m => m.role === 'user')?.content.slice(0, 100) || 'Untitled Conversation';
  
  // Get the last few messages for context
  const lastMessages = messages.slice(-3);
  const context = lastMessages.map(m => `${m.role}: ${m.content.slice(0, 100)}...`).join('\n');
  
  // Generate key points focusing on the most recent and important messages
  const keyPoints = messages
    .filter(m => m.content.length > 50)
    .slice(-5) // Only take the last 5 substantial messages
    .map(m => `${m.role}: ${m.content.slice(0, 150)}...`);
  
  const topics = extractTopics(messages);
  
  const summary = `This is a conversation about ${topics.join(', ')}. The most recent context is:\n\n${context}`;

  return {
    timestamp: new Date().toISOString(),
    title,
    summary,
    keyPoints,
    metadata: {
      totalMessages: messages.length,
      lastMessageTime: messages[messages.length - 1]?.timestamp || new Date().toISOString(),
      topics,
      context
    }
  };
}

function formatSummary(summary: ConversationSummary): string {
  return `# ${summary.title}

*Last Updated: ${new Date(summary.metadata.lastMessageTime).toLocaleString()}*

## Context
${summary.summary}

## Recent Messages
${summary.keyPoints.map(point => `- ${point}`).join('\n')}

## Metadata
- Total Messages: ${summary.metadata.totalMessages}
- Topics: ${summary.metadata.topics.join(', ')}
- Conversation ID: ${summary.timestamp.replace(/[:.]/g, '-')}

---

*This is a summary of a Claude conversation. The full conversation is available in the conversations directory.*
`;
}

async function exportConversation(
  messages: Message[], 
  outputPath: string,
  saveToClaude: boolean = false
): Promise<void> {
  // Export full conversation
  const markdown = formatConversation(messages);
  await fs.writeFile(outputPath, markdown, 'utf-8');
  console.log(`Conversation exported to ${outputPath}`);

  // Generate and save summary if requested
  if (saveToClaude) {
    const summary = generateSummary(messages);
    const summaryContent = formatSummary(summary);
    
    // Save to Claude's project files
    const claudeDir = path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude', 'Projects');
    await fs.mkdir(claudeDir, { recursive: true });
    
    // Save with a more Claude-friendly name
    const summaryPath = path.join(claudeDir, `claude-context-${summary.timestamp.replace(/[:.]/g, '-')}.md`);
    await fs.writeFile(summaryPath, summaryContent, 'utf-8');
    console.log(`Summary saved to ${summaryPath}`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const saveToClaude = args.includes('--claude');

// Example usage
const sampleConversation: Message[] = [
  {
    role: 'user',
    content: 'Hello! Can you help me with my project?',
    timestamp: '2024-03-31 10:00:00'
  },
  {
    role: 'assistant',
    content: 'Of course! I\'d be happy to help. What kind of project are you working on?',
    timestamp: '2024-03-31 10:00:05'
  }
];

// Create conversations directory if it doesn't exist
const conversationsDir = path.join(process.cwd(), 'conversations');
await fs.mkdir(conversationsDir, { recursive: true });

// Generate a unique filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputPath = path.join(conversationsDir, `conversation-${timestamp}.md`);

// Export the conversation
await exportConversation(sampleConversation, outputPath, saveToClaude); 