export function EasterLine() {
  return (
    <div className="flex items-center gap-3 border-b border-line py-6 font-mono text-[13px] text-muted">
      <span className="text-accent">$</span>
      <span>
        {"// You're inspecting. We like you. "}
        <b className="text-ink">careers@useffect.sh</b>
        {' · we read every email.'}
      </span>
    </div>
  )
}
