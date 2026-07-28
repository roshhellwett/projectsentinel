/**
 * Site-wide newsprint background.
 *
 * Three stacked, non-interactive layers rendered behind everything:
 *   1. the newsprint collage plate (local asset, mobile-lightweight variant)
 *   2. a paper wash that keeps body copy readable on top of it
 *   3. a soft vignette so page edges stay calm behind the masthead
 *
 * Assets live in `public/bg/` — nothing is fetched from a remote host.
 */
export function NewsBackground() {
  return (
    <div aria-hidden="true" className="nv-bg">
      <div className="nv-bg__plate" />
      <div className="nv-bg__wash" />
      <div className="nv-bg__vignette" />
    </div>
  );
}
