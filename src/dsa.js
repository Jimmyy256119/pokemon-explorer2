// Stack (LIFO): top of the stack = last item. Duplicates move to the top. Max size keeps memory bounded.
export function pushStack(stack, item, max = 8) {
  const next = [...stack.filter(x => x.id !== item.id), item];
  return next.length > max ? next.slice(next.length - max) : next;
}
export const stackView = stack => [...stack].reverse();   // newest first, original stack untouched

// Merge sort: O(n log n), stable. Works on a copy so the stack order is never destroyed.
export function mergeSort(arr, cmp) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const a = mergeSort(arr.slice(0, mid), cmp), b = mergeSort(arr.slice(mid), cmp);
  const out = []; let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(cmp(a[i], b[j]) <= 0 ? a[i++] : b[j++]);
  return out.concat(a.slice(i), b.slice(j));
}
