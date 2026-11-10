export default function cleanError(e) {
    const raw =
        typeof e?.data === "string" ? e.data : e?.message ?? "Something went wrong";
    return raw.replace(/^[\s\S]*Uncaught Error:\s*/, "").split("\n")[0];
}
