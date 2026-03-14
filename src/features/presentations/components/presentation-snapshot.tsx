type PresentationSnapshotProps = {
  title: string;
  markdownContent: string;
  updatedAt: number;
  sharedAtLabel?: string;
};

const formatSnapshotTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const PresentationSnapshot = ({
  title,
  markdownContent,
  updatedAt,
  sharedAtLabel,
}: PresentationSnapshotProps) => {
  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <section className="mx-auto w-full max-w-4xl space-y-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-muted-foreground text-sm">Snapshot updated {formatSnapshotTimestamp(updatedAt)}</p>
          {sharedAtLabel ? <p className="text-muted-foreground text-xs">{sharedAtLabel}</p> : null}
        </header>
        <article className="border-border bg-card rounded-md border p-4">
          <pre className="text-foreground overflow-x-auto whitespace-pre-wrap text-sm">
            {markdownContent}
          </pre>
        </article>
      </section>
    </main>
  );
};

export default PresentationSnapshot;
