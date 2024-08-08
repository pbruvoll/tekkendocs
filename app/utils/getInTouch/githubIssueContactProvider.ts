import { type GetInTouchProvider } from './interfaces/GetInTouchProvider'

type GitHubIssueTypes = 'featureRequest' | 'bugReport' | 'choose' | 'new'
type MappableGithubTypes = Exclude<GitHubIssueTypes, 'choose' | 'new'>

type GitHubChannelConfig = {
  labels: Array<string>
  template: string
}

const gitHubIssueType: Record<MappableGithubTypes, GitHubChannelConfig> = {
  featureRequest: {
    labels: ['kind/feature-request'],
    template: 'feature_request.yml',
  },
  bugReport: {
    labels: ['kind/bug'],
    template: 'bug_report.yml',
  },
}

export class GitHubIssueContactProvider
  implements GetInTouchProvider<GitHubIssueTypes>
{
  private readonly githubRepoUrl: string =
    'https://github.com/pbruvoll/tekkendocs'
  private readonly githubIssueUrl: string = `${this.githubRepoUrl}/issues/new`

  public buildContactUrl(selectedIssueType: GitHubIssueTypes): string {
    if (selectedIssueType === 'choose' || selectedIssueType === 'new') {
      return `${this.githubIssueUrl}/${selectedIssueType}`
    }

    return (
      this.githubIssueUrl +
      this.optionToUrlParams(gitHubIssueType[selectedIssueType])
    )
  }

  private optionToUrlParams(selectedConfig: GitHubChannelConfig): string {
    const labels = selectedConfig.labels.join(',')
    return `?assignees=&labels=${labels}&projects=&template=${selectedConfig.template}`
  }
}
