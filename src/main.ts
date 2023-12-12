import * as core from '@actions/core';
import { addLabelsFromIssueToPR } from './implemetation/add-labels-from-issue-to-pr';
import { addPrToTheProject } from './implemetation/add-pr-to-the-project';
import { getLinkedIssues } from './implemetation/get-linked-issues';
import { moveIssueToInReview } from './implemetation/move-issue-to-in-review';

export async function run(): Promise<void> {
  try {
    const linkedIssues = await core.group(
      'Find linked issues',
      getLinkedIssues,
    );

    core.info(`Found ${linkedIssues.length} linked issues`);

    for (const issue of linkedIssues) {
      await core.group(`Sync issue #${issue.number} with PR`, async () => {
        await core.group(`#${issue.number} ${issue.title}`, async () => {
          await addLabelsFromIssueToPR(issue.number);
          await moveIssueToInReview(issue.number);
        });
      });
    }

    if (!linkedIssues.length) {
      core.info('No linked issues found');
      core.info('Move PR to In Review');
      await addPrToTheProject();
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}
