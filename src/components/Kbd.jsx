/* eslint-disable react/prop-types */

// A small key cap, e.g. <Kbd>R</Kbd>, shown on buttons that have a keyboard shortcut.
// Hidden on touch screens (no hover), where there is usually no keyboard.
export default function Kbd({ children, className = "" }) {
  return (
    <kbd
      className={`text-[10px] leading-none font-mono px-1.5 py-1 rounded border border-[#ffffff60] border-b-2 bg-[#ffffff14] text-[#F9F7E8] [@media(hover:none)]:hidden ${className}`}
    >
      {children}
    </kbd>
  );
}