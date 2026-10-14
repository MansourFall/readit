let model = JSON.parse(document.querySelector('#readit-data').textContent);
const $ = selector => document.querySelector(selector);
const e = escapeHtml;
let selected = model.useCases[0]?.id, scenarioId, stepIndex = 0, timer, view = 'story';
let visited = new Set(), reviews = {}, liveSource = false, sourceRequest = 0;
const stored = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* restricted standalone browser */ } }
};
const stateKey = () => `readit:${model.project.name}:${model.analysis.commit || model.analysis.generatedAt}`;
const currentCase = () => model.useCases.find(u => u.id === selected);
const currentScenario = () => currentCase()?.scenarios.find(s => s.id === scenarioId) || currentCase()?.scenarios[0];
const currentStep = () => currentScenario()?.steps[stepIndex];
function stop() { clearInterval(timer); timer = undefined; $('#play').textContent = 'Play flow'; }
function tell(message) { $('#status').textContent = message; }
function download(name, content, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function hydrateState() {
  visited = new Set(stored.get(`${stateKey()}:visited`, []).filter(x => model.useCases.some(u => u.id === x)));
  reviews = stored.get(`${stateKey()}:reviews`, {});
  if (!reviews || typeof reviews !== 'object' || Array.isArray(reviews)) reviews = {};
}
function badge(claim) { return `<span class="badge ${claim.confidence === 'inferred' ? 'inferred' : ''}">${claim.confidence === 'observed' ? 'Source-backed' : 'Inferred'}</span>`; }
function evidenceCards(refs) {
  return refs.map(id => {
    const ref = model.evidence.find(r => r.id === id);
    return `<details class="evidence-card" data-evidence="${e(id)}"><summary>${e(ref.path)}:${ref.startLine}–${ref.endLine}</summary><p>${e(ref.reason)}</p><span class="evidence-state">Recorded source snapshot · ${e(ref.sha256.slice(0, 10))}</span><pre><code>${e(ref.snippet || 'No snippet embedded. Serve with --root to read referenced lines.')}</code></pre></details>`;
  }).join('');
}
function bindEvidence() {
  document.querySelectorAll('[data-evidence]').forEach(details => {
    details.addEventListener('toggle', async () => {
      if (!details.open || !liveSource || details.dataset.loaded) return;
      details.dataset.loaded = 'true';
      const request = sourceRequest;
      try {
        const response = await fetch(`/api/source?id=${encodeURIComponent(details.dataset.evidence)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Cannot verify source');
        if (request !== sourceRequest) return;
        details.querySelector('code').textContent = result.snippet;
        details.querySelector('.evidence-state').textContent = result.stale ? 'STALE · Source changed since this analysis. Ask your agent to refresh.' : 'Verified against current local source';
      } catch (error) { details.querySelector('.evidence-state').textContent = `Verification unavailable: ${error.message}`; }
    });
  });
}
function renderNav() {
  const query = $('#search').value.toLowerCase(), actor = $('#actor-filter').value;
  const cases = model.useCases.filter(u => {
    const haystack = [u.name, u.goal, ...u.actorIds.map(id => model.actors.find(a => a.id === id).name), ...u.scenarios.map(s => s.name)].join(' ').toLowerCase();
    return haystack.includes(query) && (actor === 'all' || u.actorIds.includes(actor));
  });
  $('#case-count').textContent = `${cases.length} / ${model.useCases.length}`;
  $('#case-list').innerHTML = cases.map(u => `<button class="case-item" data-select="${e(u.id)}" aria-current="${selected === u.id}"><span class="case-index">${visited.has(u.id) ? '✓' : String(model.useCases.indexOf(u) + 1).padStart(2, '0')}</span><span><strong>${e(u.name)}</strong><small>${u.scenarios.length} ${u.scenarios.length === 1 ? 'scenario' : 'scenarios'} · ${u.confidence === 'observed' ? 'Source-backed' : 'Inferred'}</small></span></button>`).join('') || '<p class="empty">No matching use cases. Try another goal or actor.</p>';
  document.querySelectorAll('[data-select]').forEach(button => button.onclick = () => chooseCase(button.dataset.select));
  $('#progress-label').textContent = `${visited.size} / ${model.useCases.length}`;
  $('#progress-fill').style.width = `${model.useCases.length ? visited.size / model.useCases.length * 100 : 0}%`;
  $('#next-case').disabled = !model.useCases.length;
}
function chooseCase(id, updateUrl = true) {
  if (!model.useCases.some(u => u.id === id)) return;
  stop(); selected = id; scenarioId = currentCase().scenarios[0].id; stepIndex = 0;
  visited.add(id); stored.set(`${stateKey()}:visited`, [...visited]);
  setView('story'); renderNav(); renderCase();
  if (updateUrl) { try { history.replaceState(null, '', `#case=${encodeURIComponent(id)}`); } catch { /* file protocol */ } }
}
function renderCase() {
  const u = currentCase();
  $('#flow-area').hidden = !u;
  if (!u) { $('#case-detail').innerHTML = '<div class="context-card"><h2>No use cases yet.</h2><p>Ask your agent to investigate the source and generate a READIT model, then import it here.</p></div>'; return; }
  $('#case-detail').innerHTML = `<div class="case-heading scene-enter"><div><span class="eyebrow">USE CASE ${String(model.useCases.indexOf(u) + 1).padStart(2, '0')}</span><h2>${e(u.name)}</h2></div>${badge(u)}</div><p class="case-goal">${e(u.goal)}</p>${u.confidence === 'inferred' ? `<p class="case-goal">Inference: ${e(u.rationale)}</p>` : ''}<div class="tags">${u.actorIds.map(id => `<span class="tag">↗ ${e(model.actors.find(a => a.id === id).name)}</span>`).join('')}</div><div class="conditions"><div class="condition"><h4>BEFORE IT STARTS</h4><ul>${u.preconditions.map(s => `<li>${e(s)}</li>`).join('') || '<li>No preconditions recorded</li>'}</ul></div><div class="condition"><h4>WHEN IT SUCCEEDS</h4><ul>${u.postconditions.map(s => `<li>${e(s)}</li>`).join('') || '<li>No postconditions recorded</li>'}</ul></div></div><details class="context-card"><summary>Use case evidence (${u.evidenceIds.length} references)</summary>${evidenceCards(u.evidenceIds)}</details>`;
  $('#scenario').innerHTML = u.scenarios.map(s => `<option value="${e(s.id)}">${e(s.name)}</option>`).join('');
  $('#scenario').value = currentScenario().id;
  renderStep();
}
function renderStep() {
  const s = currentScenario(); if (!s) return;
  stepIndex = Math.max(0, Math.min(stepIndex, s.steps.length - 1));
  const step = currentStep(), reviewId = `${selected}/${s.id}/${step.id}`;
  $('#sequence').innerHTML = sequenceSvg(model, s, stepIndex);
  $('#step-counter').textContent = `${stepIndex + 1} OF ${s.steps.length} MESSAGES`;
  $('#previous').disabled = stepIndex === 0; $('#next').disabled = stepIndex === s.steps.length - 1;
  $('#step-detail').innerHTML = `<span class="eyebrow">THE CURRENT STEP</span><div class="step-number">${String(stepIndex + 1).padStart(2, '0')}</div>${badge(step)}<h3>${e(step.label)}</h3><p>${e(step.description)}</p>${step.confidence === 'inferred' ? `<p><strong>Why inferred:</strong> ${e(step.rationale)}</p>` : ''}<p><strong>${e(model.participants.find(p => p.id === step.from).name)}</strong> → <strong>${e(model.participants.find(p => p.id === step.to).name)}</strong></p>${evidenceCards(step.evidenceIds)}${!step.evidenceIds.length ? '<p>No source evidence recorded for this inferred step.</p>' : ''}<label class="review-label" for="review">Something missing or incorrect?</label><textarea id="review" maxlength="4000" placeholder="Leave a note for your coding agent…">${e(reviews[reviewId] || '')}</textarea><p class="review-help">Saved in this browser. Export the review below to send it to your agent.</p><p><strong>Scenario outcome:</strong> ${e(s.outcome)}</p>`;
  $('#review').oninput = event => { reviews[reviewId] = event.target.value; stored.set(`${stateKey()}:reviews`, reviews); };
  document.querySelectorAll('[data-step]').forEach(g => {
    const action = () => { stop(); stepIndex = Number(g.dataset.step); renderStep(); };
    g.onclick = action; g.onkeydown = event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); action(); } };
  });
  bindEvidence();
  const active = $('#sequence .message.active');
  if (active) {
    const container = $('#sequence'), rect = active.getBoundingClientRect(), base = container.getBoundingClientRect();
    if (rect.bottom > base.bottom || rect.top < base.top) container.scrollTop += rect.top - base.top - 60;
  }
}
function renderMap() {
  $('#map').innerHTML = useCaseSvg(model, selected);
  document.querySelectorAll('[data-case]').forEach(g => {
    const action = () => chooseCase(g.dataset.case);
    g.onclick = action; g.onkeydown = event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); action(); } };
  });
}
function renderContext() {
  const inferred = model.useCases.flatMap(u => u.scenarios.flatMap(s => s.steps)).filter(s => s.confidence === 'inferred');
  $('#analysis-context').innerHTML = `<div class="context-card"><h3>${model.analysis.mode === 'demo' ? 'Demonstration model' : 'Repository analysis'}</h3><p>${e(model.analysis.scope)}</p><p>Generated: ${e(model.analysis.generatedAt)}${model.analysis.commit ? `<br/>Repository commit: <code>${e(model.analysis.commit)}</code>` : '<br/>No repository commit recorded.'}</p><p>Source-backed means the author supplied source references. It does not mean the application was executed or independently proven correct. Inferred steps are hypotheses to review.</p></div><div class="context-card"><h3>Known limitations</h3><ul>${model.analysis.limitations.map(x => `<li>${e(x)}</li>`).join('') || '<li>No limitations recorded; ask the agent whether coverage is complete.</li>'}</ul></div><div class="context-card"><h3>${inferred.length} inferred messages to investigate</h3><ul>${inferred.map(s => `<li><strong>${e(s.label)}</strong>: ${e(s.rationale)}</li>`).join('') || '<li>No inferred messages in this model.</li>'}</ul></div><div class="context-card"><h3>How this explorer works</h3><p>READIT renders an explicit model, not a live runtime trace. The agent reads source code to identify user goals and ordered interactions. Scan hints alone never become verified behavior.</p><p>Standalone HTML contains embedded source snapshots. Local serving with a repository root can verify hashes and show changed evidence. Review notes remain in your browser until you export them.</p><p>Every scenario has its own sequence. Failure and alternate paths are separate named scenarios in this MVP. PlantUML exports provide editable UML source.</p></div>`;
}
function setView(nextView) {
  view = nextView;
  if (view !== 'story') stop();
  ['story', 'map', 'context'].forEach(v => {
    $(`#${v}-view`).hidden = v !== view;
    const tab = $(`#tab-${v}`); tab.setAttribute('aria-selected', String(v === view)); tab.tabIndex = v === view ? 0 : -1;
  });
  if (view === 'map') renderMap(); if (view === 'context') renderContext();
}
function loadModel(next) {
  const result = validateModel(next);
  if (!result.valid) throw new Error(result.errors.slice(0, 8).join('; '));
  stop(); model = next; sourceRequest++; liveSource = false;
  selected = next.useCases[0]?.id; scenarioId = undefined; stepIndex = 0;
  hydrateState(); $('#project-name').textContent = model.project.name; $('#project-desc').textContent = model.project.description;
  $('#actor-filter').innerHTML = '<option value="all">All actors</option>' + model.actors.map(a => `<option value="${e(a.id)}">${e(a.name)}</option>`).join('');
  $('#search').value = '';
  const steps = model.useCases.flatMap(u => u.scenarios.flatMap(s => s.steps));
  $('#metrics').innerHTML = [[model.useCases.length, 'USE CASES'], [model.actors.length, 'ACTORS'], [steps.length, 'FLOW MESSAGES'], [model.evidence.length, 'SOURCE REFERENCES']].map(([value, label]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join('');
  if (selected) chooseCase(selected, false); else { setView('story'); renderNav(); renderCase(); }
  renderContext();
}
$('#search').oninput = renderNav; $('#actor-filter').onchange = renderNav;
document.querySelectorAll('[data-view]').forEach(tab => {
  tab.onclick = () => setView(tab.dataset.view);
  tab.onkeydown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const tabs = [...document.querySelectorAll('[data-view]')];
    const i = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[i].click(); tabs[i].focus();
  };
});
$('#scenario').onchange = () => { stop(); scenarioId = $('#scenario').value; stepIndex = 0; renderStep(); };
$('#next').onclick = () => { stop(); stepIndex++; renderStep(); };
$('#previous').onclick = () => { stop(); stepIndex--; renderStep(); };
$('#reset').onclick = () => { stop(); stepIndex = 0; renderStep(); };
$('#play').onclick = () => {
  if (timer) { stop(); return; }
  if (stepIndex === currentScenario().steps.length - 1) { stepIndex = 0; renderStep(); }
  $('#play').textContent = 'Pause';
  timer = setInterval(() => { if (stepIndex >= currentScenario().steps.length - 1) { stop(); return; } stepIndex++; renderStep(); }, 1600);
};
$('#next-case').onclick = () => chooseCase(model.useCases.find(u => !visited.has(u.id))?.id || model.useCases[(model.useCases.findIndex(u => u.id === selected) + 1) % model.useCases.length]?.id);
$('#export-map').onclick = () => download('readit-use-cases.puml', plantUmlUseCases(model));
$('#export-sequence').onclick = () => download(`readit-${selected}-${currentScenario().id}.puml`, plantUmlSequence(model, currentCase(), currentScenario()));
$('#export-model').onclick = () => download('readit.json', JSON.stringify(model, null, 2), 'application/json');
$('#export-feedback').onclick = () => {
  const notes = Object.entries(reviews).filter(([, value]) => value.trim());
  const feedback = `# READIT review: ${model.project.name}\n\nRefresh the evidence-backed READIT model using these review notes. Investigate each claim in the repository before changing the model.\n\nAnalysis: ${model.analysis.generatedAt}\nCommit: ${model.analysis.commit || 'not recorded'}\n\n${notes.map(([key, text]) => `## ${key}\n${text}`).join('\n\n') || 'No review notes yet.'}`;
  download('readit-review.md', feedback);
};
$('#export-html').onclick = () => {
  const clone = document.documentElement.cloneNode(true);
  clone.querySelector('#readit-data').textContent = JSON.stringify(model).replace(/</g, '\\u003c');
  // The original module reads the model and rebuilds the UI on opening.
  clone.querySelector('#status').textContent = '';
  download('readit.html', '<!doctype html>\n' + clone.outerHTML, 'text/html');
};
$('#theme').onclick = () => { const value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = value; stored.set('readit:theme', value); };
document.documentElement.dataset.theme = stored.get('readit:theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
$('#import-button').onclick = () => $('#import-file').click();
$('#import-file').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  try { if (file.size > 5 * 1024 * 1024) throw new Error('Model exceeds 5 MiB'); loadModel(JSON.parse(await file.text())); tell(`Imported ${model.project.name}. Source snapshots are unverified until served with the matching repository.`); }
  catch (error) { tell(`Could not import model: ${error.message}`); }
  event.target.value = '';
};
window.addEventListener('hashchange', () => { const id = new URLSearchParams(location.hash.slice(1)).get('case'); if (id) chooseCase(id, false); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
loadModel(model);
const initialCase = new URLSearchParams(location.hash.slice(1)).get('case'); if (initialCase) chooseCase(initialCase, false);
if (location.protocol !== 'file:') {
  const initialRequest = sourceRequest;
  fetch('/api/info').then(r => r.ok ? r.json() : null).then(info => { if (initialRequest === sourceRequest) liveSource = Boolean(info?.sourceAvailable); }).catch(() => {});
}
