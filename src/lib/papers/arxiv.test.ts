import { describe, expect, it } from "vitest";
import { parseArxivFeed } from "./arxiv";

// Captured from a real (trimmed) arXiv API response, single entry, multiple authors.
const MULTI_AUTHOR_FEED = `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/" xmlns:arxiv="http://arxiv.org/schemas/atom" xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2201.00978v1</id>
    <title>PyramidTNT: Improved Transformer-in-Transformer Baselines with Pyramid Architecture</title>
    <updated>2022-01-04T04:56:57Z</updated>
    <link href="https://arxiv.org/abs/2201.00978v1" rel="alternate" type="text/html"/>
    <link href="https://arxiv.org/pdf/2201.00978v1" rel="related" type="application/pdf" title="pdf"/>
    <summary>Transformer networks have achieved great progress for computer vision tasks.</summary>
    <published>2022-01-04T04:56:57Z</published>
    <author><name>Kai Han</name></author>
    <author><name>Jianyuan Guo</name></author>
  </entry>
</feed>`;

const SINGLE_AUTHOR_FEED = `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/1706.03762v5</id>
    <title>Attention Is All You Need</title>
    <link href="https://arxiv.org/abs/1706.03762v5" rel="alternate" type="text/html"/>
    <summary>{\\em The Transformer}, a model architecture based solely on attention.</summary>
    <published>2017-06-12T00:00:00Z</published>
    <author><name>Ashish Vaswani</name></author>
  </entry>
</feed>`;

const EMPTY_FEED = `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns="http://www.w3.org/2005/Atom">
</feed>`;

describe("parseArxivFeed", () => {
  it("parses a multi-entry, multi-author feed into Paper objects", () => {
    const [paper] = parseArxivFeed(MULTI_AUTHOR_FEED);

    expect(paper.title).toBe(
      "PyramidTNT: Improved Transformer-in-Transformer Baselines with Pyramid Architecture",
    );
    expect(paper.authors).toEqual(["Kai Han", "Jianyuan Guo"]);
    expect(paper.arxivId).toBe("2201.00978");
    expect(paper.year).toBe(2022);
    expect(paper.source).toBe("arxiv");
    expect(paper.sourceUrl).toBe("https://arxiv.org/abs/2201.00978");
    expect(paper.pdfUrl).toBe("https://arxiv.org/pdf/2201.00978v1");
  });

  it("handles a single author (not wrapped in an array by the XML parser)", () => {
    const [paper] = parseArxivFeed(SINGLE_AUTHOR_FEED);
    expect(paper.authors).toEqual(["Ashish Vaswani"]);
  });

  it("strips LaTeX emphasis markup from the abstract", () => {
    const [paper] = parseArxivFeed(SINGLE_AUTHOR_FEED);
    expect(paper.abstract).toBe(
      "The Transformer, a model architecture based solely on attention.",
    );
  });

  it("returns an empty array for a feed with no entries", () => {
    expect(parseArxivFeed(EMPTY_FEED)).toEqual([]);
  });
});
