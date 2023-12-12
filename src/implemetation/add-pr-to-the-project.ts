import * as core from '@actions/core';
import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function addPrToTheProject(): Promise<void> {
  const columnId = core.getInput('in-review-column-id');

  if (!columnId) {
    core.info('No column id provided, skipping');
    return;
  }

  await getOctokit().graphql(
    `
    mutation ($columnId: ID!, $cardId: ID!) {
      addProjectCard(input: {projectColumnId: $columnId, contentId: $cardId}) {
        clientMutationId
      }
    }
  `,
    {
      columnId,
      contentId: context.issue.number,
    },
  );
}
