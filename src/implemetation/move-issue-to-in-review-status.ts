import * as core from '@actions/core';
import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function moveIssueToInReviewStatus(
  issueNumber: number,
): Promise<void> {
  core.info(`Move issue #${issueNumber} to In Review`);

  await getOctokit().graphql(
    `
      mutation ($itemId: ID!, $projectId: ID!, $filedId: ID!, $optionId: String!) {
        updateProjectV2ItemFieldValue(input: {itemId: $itemId, fieldId: $filedId, value: {singleSelectOptionId: $optionId}, projectId: $projectId}) {
          clientMutationId
        }
      }
    `,
    {
      itemId: await getIssueId(issueNumber),
      projectId: core.getInput('project-id'),
      filedId: core.getInput('status-field-id'),
      optionId: core.getInput('in-review-status-value-id'),
    },
  );
}

async function getIssueId(issueNumber: number): Promise<string> {
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

  return response.repository.issue.id;
}
