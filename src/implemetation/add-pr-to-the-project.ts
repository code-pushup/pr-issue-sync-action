import * as core from '@actions/core';
import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function addPrToTheProject(): Promise<void> {
  const mutationResponse = await getOctokit().graphql<{
    addProjectV2ItemById: {
      item: {
        id: string;
      };
    };
  }>(
    `
    mutation ($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {contentId: $contentId, projectId: $projectId}) {
        item {
          id
        }
      }
    }
  `,
    {
      projectId: core.getInput('project-id'),
      contentId: await getPRId(),
    },
  );

  const itemId = mutationResponse.addProjectV2ItemById.item.id;

  await getOctokit().graphql(
    `
      mutation ($itemId: ID!, $projectId: ID!, $filedId: ID!, $optionId: String!) {
          updateProjectV2ItemFieldValue(input: {itemId: $itemId, fieldId: $filedId, value: {singleSelectOptionId: $optionId}, projectId: $projectId}) {
              clientMutationId
          }
      }
  `,
    {
      itemId,
      projectId: core.getInput('project-id'),
      filedId: core.getInput('status-field-id'),
      optionId: core.getInput('in-review-option-id'),
    },
  );
}

async function getPRId(): Promise<string> {
  const response = await getOctokit().graphql<{
    repository: {
      pullRequest: {
        id: string;
      };
    };
  }>(
    `
    query ($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
          id
        }
      }
    }
  `,
    {
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      name: process.env.GITHUB_REPOSITORY_NAME,
      number: context.issue.number,
    },
  );

  return response.repository.pullRequest.id;
}
