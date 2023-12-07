import * as core from '@actions/core';
import { getOctokit as getGithub } from '@actions/github';

let octokit: ReturnType<typeof getGithub>;

export function getOctokit(): ReturnType<typeof getGithub> {
  if (octokit) {
    return octokit;
  }

  octokit = getGithub(core.getInput('github-token', { required: true }));

  return octokit;
}
