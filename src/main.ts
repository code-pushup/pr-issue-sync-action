import * as core from '@actions/core';
import { addLabelsFromIssueToPR } from './implemetation/add-labels-from-issue-to-pr';
import {
  addPrToTheProject,
  movePRToInReviewStatus,
} from './implemetation/add-pr-to-the-project';
import { getLinkedIssues } from './implemetation/get-linked-issues';
import { moveIssueToInReviewStatus } from './implemetation/move-issue-to-in-review-status';

export async function run(): Promise<void> {
  try {
    core.info('Try to find linked issues');

    const linkedIssues = await getLinkedIssues();

    core.info(`Found ${linkedIssues.length} linked issues`);

    for (const issue of linkedIssues) {
      await core.group(`Sync issue #${issue.number} with PR`, async () => {
        core.info(`#${issue.number} ${issue.title}`);

        await addLabelsFromIssueToPR(issue.number);
        await moveIssueToInReviewStatus(issue.number);
      });
    }

    if (!linkedIssues.length) {
      core.info('No linked issues found');

      await core.group('Sync PR with project', async () => {
        const itemId = await addPrToTheProject();

        if (itemId) {
          await movePRToInReviewStatus(itemId);
        }
      });
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}
