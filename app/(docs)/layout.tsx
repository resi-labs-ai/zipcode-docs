import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'

// The Nextra docs chrome lives ONLY around docs routes (this route group).
// The marketing landing at `/` renders under the root layout with no sidebar.
export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pageMap = await getPageMap()
  const navbar = (
    <Navbar
      logo={
        <span style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.05rem' }}>
          zip<span style={{ color: 'var(--zc-accent)' }}>code</span>
        </span>
      }
      projectLink="https://github.com/resi-labs-ai/zipcode-euler"
    />
  )
  return (
    <Layout
      navbar={navbar}
      pageMap={pageMap}
      darkMode={false}
      nextThemes={{ defaultTheme: 'light', forcedTheme: 'light' }}
      docsRepositoryBase="https://github.com/resi-labs-ai/zipcode-euler/tree/main/docs-site"
      editLink={null}
      feedback={{ content: null }}
      footer={<Footer>Zipcode — a venue-neutral credit rail.</Footer>}
    >
      <div className="zc-docs">{children}</div>
    </Layout>
  )
}
