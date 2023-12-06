import * as core from '@actions/core';
import { getOctokit } from './octokit';

export async function moveIssueToInReview(issueNumber: number): Promise<void> {
  core.info(`Move issue #${issueNumber} to In Review`);

  await getOctokit().graphql(
    `
    mutation ($columnId: ID!, $cardId: ID!) {
      moveProjectCard(input: {cardId: $cardId, columnId: $columnId}) {
        clientMutationId
      }
    }
  `,
    {
      columnId: core.getInput('in-review-column-id', { required: true }),
      cardId: await getCardId(issueNumber),
    },
  );
}

async function getCardId(issueNumber: number): Promise<string> {
  const response = await getOctokit().graphql<GetCardIdPayload>(
    `
    query ($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        issue(number: $number) {
          projectCards(first: 10) {
            nodes {
              id
            }
          }
        }
      }
    }
  `,
    {
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      name: process.env.GITHUB_REPOSITORY_NAME,
      number: issueNumber,
    },
  );

  return response.repository.issue.projectCards.nodes[0].id;
}

interface GetCardIdPayload {
  repository: {
    issue: {
      projectCards: {
        nodes: {
          id: string;
        }[];
      };
    };
  };
}
