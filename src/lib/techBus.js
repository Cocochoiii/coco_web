/* Small singleton so the "What I build" chips can focus a node inside the
   Tech Stack graph without prop-drilling. TechStack registers its API here. */
let api = null;

export function setTechApi(a) { api = a; }
export function clearTechApi(a) { if (api === a) api = null; }
export function focusTech(name) { if (api && typeof api.focusTech === 'function') api.focusTech(name); }
