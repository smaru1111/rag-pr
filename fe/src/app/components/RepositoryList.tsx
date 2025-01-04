interface Repository {
  id: number;
  full_name: string;
  description: string | null;
}

interface RepositoryListProps {
  repos: Repository[];
}

export function RepositoryList({ repos }: RepositoryListProps) {
  return (
    <div className="grid gap-4">
      {repos.map((repo) => (
        <div
          key={repo.id}
          className="border p-4 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800 transition-colors"
        >
          <h2 className="text-lg font-semibold">{repo.full_name}</h2>
          <p className="text-gray-600 dark:text-gray-400">{repo.description}</p>
        </div>
      ))}
    </div>
  );
}