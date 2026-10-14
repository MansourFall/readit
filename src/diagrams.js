export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
const labelLines = (text, max = 30) => {
  const words = String(text).split(/\s+/), lines = [''];
  for (const word of words) {
    const last = lines.length - 1;
    if (lines[last] && (lines[last] + word).length >= max) lines.push(word);
    else lines[last] += (lines[last] ? ' ' : '') + word;
  }
  return lines.slice(0, 2).map((s, i) => i === 1 && lines.length > 2 ? s.slice(0, max - 1) + '…' : s);
};
const svgLabel = (text, x, y, max = 30) => `<text x="${x}" y="${y}" text-anchor="middle">${labelLines(text, max).map((t, i) => `<tspan x="${x}" dy="${i ? 17 : 0}">${escapeHtml(t)}</tspan>`).join('')}</text>`;

export function useCaseSvg(model, selectedId) {
  const h = Math.max(360, model.useCases.length * 100 + 100, model.actors.length * 110 + 90);
  const yCase = new Map(model.useCases.map((u, i) => [u.id, 105 + i * 100]));
  const yActor = new Map(model.actors.map((a, i) => [a.id, 105 + i * 110]));
  const actorMarkup = model.actors.map(a => {
    const y = yActor.get(a.id);
    return `<g class="uml-actor"><title>${escapeHtml(a.name)}</title><circle cx="90" cy="${y - 22}" r="10"/><path d="M90 ${y - 12}v32m-22-22h44m-22 22l-18 23m18-23l18 23"/>${svgLabel(a.name, 90, y + 62, 20)}</g>`;
  }).join('');
  const edges = model.useCases.flatMap(u => u.actorIds.map(a => `<path class="association" d="M125 ${yActor.get(a)} L365 ${yCase.get(u.id)}"/>`)).join('');
  const cases = model.useCases.map(u => `<g role="button" tabindex="0" aria-label="Explore ${escapeHtml(u.name)}" data-case="${escapeHtml(u.id)}" class="usecase ${u.id === selectedId ? 'selected' : ''}"><title>${escapeHtml(u.goal)}</title><ellipse cx="505" cy="${yCase.get(u.id)}" rx="140" ry="34"/>${svgLabel(u.name, 505, yCase.get(u.id) - 3)}</g>`).join('');
  const relationships = model.relationships.map((r, i) => {
    const start = yCase.get(r.from), end = yCase.get(r.to), bend = 700 + (i % 4) * 24;
    return `<g><title>${escapeHtml(r.kind)}: ${escapeHtml(r.from)} → ${escapeHtml(r.to)}</title><path class="dependency" marker-end="url(#uc-arrow)" d="M645 ${start} H${bend} V${end} H645"/>${svgLabel(`«${r.kind}»`, bend + 35, (start + end) / 2, 14)}</g>`;
  }).join('');
  return `<svg class="uml-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 ${h}" role="group" aria-label="UML use case diagram for ${escapeHtml(model.project.name)}"><defs><marker id="uc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="none" stroke="currentColor"/></marker></defs><rect class="boundary" x="225" y="24" width="635" height="${h - 40}" rx="12"/>${svgLabel(model.project.name, 540, 52)}${edges}${actorMarkup}${relationships}${cases}</svg>`;
}

export function sequenceSvg(model, scenario, activeStep = -1) {
  const used = new Set(scenario.steps.flatMap(s => [s.from, s.to]));
  const people = model.participants.filter(p => used.has(p.id));
  const width = Math.max(800, people.length * 200 + 100), height = scenario.steps.length * 90 + 170;
  const positions = new Map(people.map((p, i) => [p.id, 100 + i * ((width - 200) / Math.max(1, people.length - 1))]));
  const heads = people.map(p => {
    const x = positions.get(p.id);
    return `<g><title>${escapeHtml(p.name)} (${escapeHtml(p.kind)})</title><rect class="participant" x="${x - 82}" y="20" width="164" height="55" rx="8"/>${svgLabel(p.name, x, 44, 21)}<path class="lifeline" d="M${x} 75V${height - 20}"/></g>`;
  }).join('');
  const arrows = scenario.steps.map((s, i) => {
    const from = positions.get(s.from), to = positions.get(s.to), y = 130 + i * 90;
    const self = from === to;
    const d = self ? `M${from} ${y}h60v30h-60` : `M${from} ${y}H${to}`;
    return `<g class="message ${s.kind} ${i === activeStep ? 'active' : ''}" data-step="${i}" role="button" tabindex="0" aria-label="Step ${i + 1}: ${escapeHtml(s.label)}"><title>${escapeHtml(s.description)}</title><rect class="hitbox" x="0" y="${y - 47}" width="${width}" height="86"/><path d="${d}" marker-end="url(#${s.kind === 'call' ? 'seq-solid' : 'seq-open'})"/>${svgLabel(`${i + 1}. ${s.label}`, self ? from + 75 : (from + to) / 2, y - 25, self ? 22 : 35)}<circle class="packet" cx="${from}" cy="${y}" r="5"><animate attributeName="cx" from="${from}" to="${to}" dur="0.9s" repeatCount="indefinite"/></circle></g>`;
  }).join('');
  return `<svg class="uml-sequence" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="group" aria-label="UML sequence diagram for ${escapeHtml(scenario.name)}"><defs><marker id="seq-solid" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker><marker id="seq-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="currentColor"/></marker></defs>${heads}${arrows}</svg>`;
}

const umlText = s => String(s).replace(/[\r\n"\\]/g, ' ');
export function plantUmlUseCases(model) {
  const lines = ['@startuml', 'left to right direction'];
  const actorAliases = new Map(model.actors.map((a, i) => [a.id, `A${i}`]));
  const caseAliases = new Map(model.useCases.map((u, i) => [u.id, `U${i}`]));
  model.actors.forEach(a => lines.push(`actor "${umlText(a.name)}" as ${actorAliases.get(a.id)}`));
  lines.push(`rectangle "${umlText(model.project.name)}" {`);
  model.useCases.forEach(u => lines.push(`  usecase "${umlText(u.name)}" as ${caseAliases.get(u.id)}`));
  lines.push('}');
  model.useCases.forEach(u => u.actorIds.forEach(a => lines.push(`${actorAliases.get(a)} -- ${caseAliases.get(u.id)}`)));
  model.relationships.forEach(r => lines.push(`${caseAliases.get(r.from)} ..> ${caseAliases.get(r.to)} : <<${r.kind}>>`));
  return lines.concat('@enduml').join('\n');
}
export function plantUmlSequence(model, useCase, scenario) {
  const lines = ['@startuml', `title ${umlText(useCase.name)} / ${umlText(scenario.name)}`];
  const used = new Set(scenario.steps.flatMap(s => [s.from, s.to]));
  const aliases = new Map(model.participants.map((p, i) => [p.id, `P${i}`]));
  model.participants.filter(p => used.has(p.id)).forEach(p => lines.push(`${p.kind === 'actor' ? 'actor' : p.kind === 'database' ? 'database' : 'participant'} "${umlText(p.name)}" as ${aliases.get(p.id)}`));
  scenario.steps.forEach(s => lines.push(`${aliases.get(s.from)} ${s.kind === 'return' ? '-->' : s.kind === 'async' ? '->>' : '->'} ${aliases.get(s.to)} : ${umlText(s.label)}`));
  return lines.concat('@enduml').join('\n');
}
