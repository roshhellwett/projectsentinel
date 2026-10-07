import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" aria-label="India Verified — home" className="brand">
      <span className="brand__mark" aria-hidden="true">iv.</span>
      <span className="brand__name">India <em>Verified.</em></span>
    </Link>
  );
}
