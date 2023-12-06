import * as core from '@actions/core';
import { addLabelsFromIssueToPR } from './implemetation/add-labels-from-issue-to-pr';
import { addPrToTheProject } from './implemetation/add-pr-to-the-project';
import { getLinkedIssues } from './implemetation/get-linked-issues';
import { moveIssueToInReview } from './implemetation/move-issue-to-in-review';

export async function run(): Promise<void> {
  try {
    const linkedIssues = await getLinkedIssues();

    for (const issue of linkedIssues) {
      await addLabelsFromIssueToPR(issue.number);
      await moveIssueToInReview(issue.number);
    }

    if (!linkedIssues.length) {
      await addPrToTheProject();
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}
