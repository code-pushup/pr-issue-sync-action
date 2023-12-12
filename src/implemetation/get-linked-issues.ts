import * as core from '@actions/core';
import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function getLinkedIssues(): Promise<LinkedIssue[]> {
  try {
    const response = await getOctokit().graphql<LinkedIssuesPayload>(
      `
        query ($owner: String!, $name: String!, $number: Int!) {
          repository(owner: $owner, name: $name) {
            pullRequest(number: $number) {
              id
              closingIssuesReferences(first: 10) {
                nodes {
                  number
                  title
                }
              }
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

    return response.repository.pullRequest.closingIssuesReferences.nodes;
  } catch (error) {
    if (error instanceof Error) {
      core.error(`Error while getting linked issues: ${error.message}`);
    }

    return [];
  }
}

interface LinkedIssuesPayload {
  repository: {
    pullRequest: {
      id: string;
      closingIssuesReferences: {
        nodes: LinkedIssue[];
      };
    };
  };
}

interface LinkedIssue {
  number: number;
  title: string;
}
