import * as core from '@actions/core';
import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function moveIssueToInReviewStatus(
  issueNumber: number,
): Promise<void> {
  core.info(`Move issue #${issueNumber} to In Review`);

  try {
    const itemId = await getIssueId(issueNumber);

    if (!itemId) {
      core.warning(`No issue id found for #${issueNumber}`);
      return;
    }

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
  } catch (error) {
    if (error instanceof Error) {
      core.warning(`Error while moving issue to In Review: ${error.message}`);
    }
  }
}

async function getIssueId(issueNumber: number): Promise<string | undefined> {
  core.info(`Get issue id for #${issueNumber}`);

  try {
    const response = await getOctokit().graphql<{
      repository: {
        issue: {
          id: string;
        };
      };
    }>(
      `
        query ($owner: String!, $name: String!, $number: Int!) {
          repository(owner: $owner, name: $name) {
            issue(number: $number) {
              id
            }
          }
        }
      `,
      {
        owner: context.repo.owner,
        name: context.repo.repo,
        number: issueNumber,
      },
    );

    core.info(`Issue id: ${response.repository.issue.id}`);

    return response.repository.issue.id;
  } catch (error) {
    if (error instanceof Error) {
      core.warning(`Error while getting issue id: ${error.message}`);
    }
  }
}
