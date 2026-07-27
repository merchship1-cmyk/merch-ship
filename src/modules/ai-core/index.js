import { env } from '../../config/env.js';

export const moduleDefinition = {
  id: 'AI_CORE',
  lane: 'ai',
  purpose: 'Provide prompt engines, assistants, and content generation scaffolds.'
};

export const buildPrompt = ({ role = 'MERCH SHIP Engineering Layer', objective, context = {}, constraints = [] }) => ({
  model: env.aiModel,
  messages: [
    { role: 'system', content: `${role}. Maintain MERCH SHIP architecture and prevent drift.` },
    { role: 'user', content: JSON.stringify({ objective, context, constraints }, null, 2) }
  ]
});
