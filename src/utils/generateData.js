export function generateId () {
    return (Math.random() * 1000000 + Date.now()).toString(16).replace('.', '-')
}