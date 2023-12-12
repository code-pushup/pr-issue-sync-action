import * as core from '@actions/core';
import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function addPrToTheProject(): Promise<string | undefined> {
  core.info('Add PR to the project');

  try {
    const contentId = await getPRId();

    if (!contentId) {
      core.warning(`No PR id found for #${context.issue.number}`);
      return;
    }

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
        contentId,
      },
    );

    return mutationResponse.addProjectV2ItemById.item.id;
  } catch (error) {
    if (error instanceof Error) {
      core.warning(`Error while adding PR to the project: ${error.message}`);
    }
  }
}

export async function movePRToInReviewStatus(itemId: string): Promise<void> {
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
      optionId: core.getInput('in-review-status-value-id'),
    },
  );
}

async function getPRId(): Promise<string | undefined> {
  core.info(`Get PR id for #${context.issue.number}`);

  try {
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
        owner: context.repo.owner,
        name: context.repo.repo,
        number: context.issue.number,
      },
    );

    core.info(`PR id: ${response.repository.pullRequest.id}`);

    return response.repository.pullRequest.id;
  } catch (error) {
    if (error instanceof Error) {
      core.warning(`Error while getting PR id: ${error.message}`);
    }
  }
}
