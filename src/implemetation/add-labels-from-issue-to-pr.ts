import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function addLabelsFromIssueToPR(
  issueNumber: number,
): Promise<void> {
  const labels = await getLabelsFromIssue(issueNumber);

  if (labels.length > 0) {
    await addLabelsToPR(labels);
  }
}

async function getLabelsFromIssue(issueNumber: number): Promise<string[]> {
  const labelsPayload = await getOctokit().graphql<LabelsNamesPayload>(
    `
      query ($owner: String!, $name: String!, $number: Int!) {
        repository(owner: $owner, name: $name) {
          issue(number: $number) {
            labels(first: 10) {
              nodes {
                name
              }
            }
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

  return labelsPayload.repository.issue.labels.nodes.map(node => node.name);
}

interface LabelsNamesPayload {
  repository: {
    issue: {
      labels: {
        nodes: {
          name: string;
        }[];
      };
    };
  };
}

async function addLabelsToPR(labels: string[]): Promise<void> {
  await getOctokit().rest.issues.addLabels({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    labels,
  });
}
