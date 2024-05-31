function formatarData(date) {
  return new Date(date).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "long"
  }).substring(0, 10);
}
function isodate(date) {
  return new Date(date).toISOString().substring(0, 10);
}
export {
  formatarData as f,
  isodate as i
};
