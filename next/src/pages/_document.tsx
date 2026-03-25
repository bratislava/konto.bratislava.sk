import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'

interface ExtendedDocumentProps extends DocumentInitialProps {
  nonce?: string
}

// See docs for CSP: https://nextjs.org/docs/pages/guides/content-security-policy#reading-the-nonce
class MyDocument extends Document<ExtendedDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<ExtendedDocumentProps> {
    const initialProps = await Document.getInitialProps(ctx)
    const nonce = ctx.req?.headers?.['x-nonce'] as string | undefined

    return {
      ...initialProps,
      nonce,
    }
  }

  render() {
    const { nonce } = this.props

    return (
      <Html lang="sk">
        <Head nonce={nonce} />
        <body>
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </Html>
    )
  }
}

export default MyDocument
