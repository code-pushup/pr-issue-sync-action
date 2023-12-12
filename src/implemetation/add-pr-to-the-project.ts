import * as core from '@actions/core';
import { context } from '@actions/github';
import { getOctokit } from './octokit';

export async function addPrToTheProject(): Promise<void> {
  const columnId = core.getInput('in-review-column-id');

  if (!columnId) {
    core.info('No column id provided, skipping');
    return;
  }

  await getOctokit().rest.projects.createCard({
    column_id: columnId as unknown as number,
    content_id: context.issue.number,
    content_type: 'PullRequest',
  });
}
