import { Link, Outlet } from "@remix-run/react";
import { ContentContainer } from "~/components/ContentContainer";

export default function MainLayout() {
  return (
    <>
      <header style={{ background: "var(--accent-4" }}>
        <ContentContainer>
          <div className="flex items-center">
            <Link to="/">
              <img
                src="/logo-128.png"
                height="32px"
                width="32px"
                className="object-contain"
                alt="home"
              />
            </Link>
            <Link to="/" className="text-2xl flex-grow text-center">
              TekkenDocs
            </Link>
          </div>
        </ContentContainer>
      </header>
      <Outlet />
    </>
  );
}
