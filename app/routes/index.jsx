export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
        <li>
          <a target="_blank" href="https://render.com" rel="noreferrer">
            Render Homepage
          </a>
        </li>
      </ul>
      <div>
        <a
          href="https://render.com/docs/deploy-remix"
          rel="noreferrer"
          style={{ textDecoration: 'none' }}
        >
          👈 back to Render's Remix Quickstart documentation
        </a>
      </div>
    </div>
  );
}
