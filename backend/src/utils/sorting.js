export function sortClause(sortBy, sortDir, allowed, fallback) {
  const column = allowed[sortBy] || allowed[fallback];
  const direction = String(sortDir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `${column} ${direction}`;
}

export function like(value) {
  return `%${String(value || '').trim()}%`;
}
