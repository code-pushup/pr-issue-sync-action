import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function getLinkedIssues(): Promise<LinkedIssue[]> {
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
