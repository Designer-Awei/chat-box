declare module "word-extractor" {
  interface ExtractedDocument {
    getBody(): string;
  }

  export default class WordExtractor {
    extract(filePath: string): Promise<ExtractedDocument>;
  }
}
