import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import { Logo } from '../logo'
import { ThemeToggle } from '../theme-toggle'

// The Nextra docs chrome lives ONLY around docs routes (this route group).
// The marketing landing at `/` renders under the root layout with no sidebar.
export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pageMap = await getPageMap()
  // `darkMode={false}` disables Nextra's built-in sidebar theme switch — our
  // <ThemeToggle/> in the navbar is the single control. Dark theming itself is
  // driven by next-themes (nextThemes below), not that flag, and defaults to dark.
  const navbar = (
    <Navbar
      logo={<Logo twoTone style={{ height: 22, width: 'auto', display: 'block', color: 'var(--ink)' }} />}
      projectLink="https://github.com/resi-labs-ai/zipcode-docs"
    >
      <ThemeToggle />
    </Navbar>
  )
  return (
    <Layout
      navbar={navbar}
      pageMap={pageMap}
      darkMode={false}
      nextThemes={{ attribute: 'class', defaultTheme: 'dark', storageKey: 'theme' }}
      docsRepositoryBase="https://github.com/resi-labs-ai/zipcode-docs/tree/main"
      editLink={null}
      feedback={{ content: null }}
      footer={<Footer>Zipcode — a venue-neutral credit rail.</Footer>}
    >
      <div className="zc-docs">{children}</div>
    </Layout>
  )
}
