export interface LinearIssueReference {
  id: string;
  identifier: string;
  title: string;
  url?: string;
}

export async function createLinearIssue(args: {
  apiKey: string;
  teamId: string;
  title: string;
  description: string;
  assigneeId?: string;
}): Promise<LinearIssueReference> {
  const query = `
    mutation SolIssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier title url }
      }
    }
  `;

  const input: Record<string, unknown> = {
    teamId: args.teamId,
    title: args.title,
    description: args.description,
  };
  if (args.assigneeId) input.assigneeId = args.assigneeId;

  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      Authorization: args.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { input } }),
  });

  const payload = (await response.json()) as {
    data?: {
      issueCreate?: { success?: boolean; issue?: LinearIssueReference | null };
    };
    errors?: Array<{ message?: string }>;
  };

  const issue = payload.data?.issueCreate?.issue;
  if (!response.ok || payload.errors?.length || !payload.data?.issueCreate?.success || !issue) {
    throw new Error(payload.errors?.[0]?.message ?? 'Linear issue creation failed.');
  }
  return issue;
}

export async function postSlackMessage(args: {
  botToken: string;
  channelId: string;
  text: string;
  threadTs?: string;
}): Promise<string> {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.botToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      channel: args.channelId,
      text: args.text,
      thread_ts: args.threadTs,
      unfurl_links: false,
      unfurl_media: false,
    }),
  });

  const payload = (await response.json()) as {
    ok?: boolean;
    ts?: string;
    error?: string;
  };
  if (!response.ok || !payload.ok || !payload.ts) {
    throw new Error(payload.error ?? 'Slack message delivery failed.');
  }
  return payload.ts;
}
