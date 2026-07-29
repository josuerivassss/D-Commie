import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CHANGELOG_ENTRIES } from "../changelog";

function ChangelogImage(props) {
  return <img {...props} loading="lazy" />;
}

export default function Changelog() {
  return (
    <>
      <Header user={null} />
      <div className="changelog-page">
        <h1>Changelog</h1>
        <div className="changelog-body">
          {CHANGELOG_ENTRIES.map((entry) => (
            <ReactMarkdown
              key={entry.version}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={{ img: ChangelogImage }}
            >
              {entry.content}
            </ReactMarkdown>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}