import * as core from '@actions/core';
import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function addLabelsFromIssueToPR(
  issueNumber: number,
): Promise<void> {
  const labels = await getLabelsFromIssue(issueNumber);
  core.info(`Found ${labels.length} labels`);

  if (labels.length > 0) {
    core.info(`Add labels: ${labels.join(', ')}`);
    await addLabelsToPR(labels);
  }
}

async function getLabelsFromIssue(issueNumber: number): Promise<string[]> {
  try {
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
  } catch (error) {
    if (error instanceof Error) {
      core.error(`Error while getting labels from issue: ${error.message}`);
    }

    return [];
  }
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
  try {
    await getOctokit().rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      labels,
    });
  } catch (error) {
    if (error instanceof Error) {
      core.error(`Error while adding labels to PR: ${error.message}`);
    }
  }
}
