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
    mutation ($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {contentId: $contentId, projectId: $projectId,}) {
        clientMutationId
      }
    }
  `,
    {
      projectId: columnId,
      contentId: context.issue.number,
    },
  );
}
