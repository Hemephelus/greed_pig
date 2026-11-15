/* eslint-disable react/prop-types */
import { SHORTCUT_GROUPS } from "src/constants/shortcuts";

// Every shortcut, grouped by screen. Used by the help overlay and How To Play,
// so both always match src/constants/shortcuts.js.
export default function ShortcutList({ className = "" }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {SHORTCUT_GROUPS.map((group) => (
        <section key={group.title}>
          <h3 className="font-bold text-[#FFD700] mb-1">{group.title}</h3>
          <table className="w-full">
            <tbody>
              {toRows(group.shortcuts).map((row) => (
                <tr key={row.labels.join()} className="border-b border-[#ffffff20] last:border-0">
                  <td className="w-28 py-1 pr-4 whitespace-nowrap align-top">
                    {row.labels.map((label, i) => (
                      <span key={label}>
                        {i > 0 ? <span className="mx-1 text-[#ffffff80]">/</span> : null}
                        <kbd className="font-mono text-sm px-2 py-0.5 rounded border border-[#ffffff60] border-b-2 bg-[#ffffff14]">
                          {label}
                        </kbd>
                      </span>
                    ))}
                  </td>
                  <td className="py-1">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

// Joins entries that share a `row` into one line, e.g. 1 / 2 / 3.
// Long runs (the 1-7 target keys) are shown as a range: 1 - 7.
function toRows(shortcuts) {
  const rows = [];
  for (const s of shortcuts) {
    const last = rows[rows.length - 1];
    if (s.row && last?.row === s.row) {
      last.labels.push(s.label);
    } else {
      rows.push({ row: s.row, labels: [s.label], description: s.description });
    }
  }
  return rows.map((row) =>
    row.labels.length > 3
      ? { ...row, labels: [`${row.labels[0]}–${row.labels[row.labels.length - 1]}`] }
      : row
  );
}