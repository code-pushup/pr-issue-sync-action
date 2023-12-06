import * as core from '@actions/core';
import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function addPrToTheProject(): Promise<void> {
  await getOctokit().rest.projects.createCard({
    column_id: parseInt(
      core.getInput('in-review-column-id', { required: true }),
      10,
    ),
    content_id: context.issue.number,
    content_type: 'PullRequest',
  });
}
