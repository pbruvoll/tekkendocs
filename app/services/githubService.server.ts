export type GithubContributor = {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  contributions: number;
};

type GithubApiContributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
};

const repo = 'pbruvoll/tekkendocs';

/**
 * Fetches the list of contributors for the GitHub repo, sorted by number of
 * contributions (the order GitHub returns them in). Bot accounts are removed.
 * Caching is handled by the loader via Cache-Control headers.
 */
export const getRepoContributors = async (): Promise<GithubContributor[]> => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'tekkendocs',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const response = await fetch(
    `https://api.github.com/repos/${repo}/contributors?per_page=100`,
    { headers },
  );
  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }
  const contributors = (await response.json()) as GithubApiContributor[];
  return contributors
    .filter((c) => c.type !== 'Bot' && !c.login.includes('[bot]'))
    .map((c) => ({
      login: c.login,
      avatarUrl: c.avatar_url,
      htmlUrl: c.html_url,
      contributions: c.contributions,
    }));
};
