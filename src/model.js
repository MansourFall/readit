// Shared by Node and the browser. No evaluation or executable diagram strings.
export function validateModel(m) {
  const errors = [];
  const fail = (p, message) => errors.push(`${p}: ${message}`);
  const obj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const str = v => typeof v === 'string' && v.trim().length > 0 && v.length <= 4000;
  const id = v => typeof v === 'string' && /^[a-zA-Z][\w-]{0,63}$/.test(v);
  const list = (v, p, max = 200) => {
    if (!Array.isArray(v) || v.length > max) { fail(p, `must be an array of at most ${max} items`); return []; }
    return v;
  };
  const text = (v, p) => { if (!str(v)) fail(p, 'must be nonempty text (max 4000 characters)'); };
  const ids = (xs, p) => {
    const set = new Set();
    xs.forEach((x, i) => {
      if (!obj(x) || !id(x.id)) fail(`${p}[${i}].id`, 'must be a safe identifier');
      else if (set.has(x.id)) fail(p, `duplicate id ${x.id}`);
      else set.add(x.id);
    }); return set;
  };
  if (!obj(m)) return { valid: false, errors: ['model must be an object'] };
  if (m.schemaVersion !== '1.0') fail('schemaVersion', 'must equal 1.0');
  if (!obj(m.project)) fail('project', 'must be an object');
  else { text(m.project.name, 'project.name'); text(m.project.description, 'project.description'); }
  if (!obj(m.analysis)) fail('analysis', 'must be an object');
  else {
    if (!['demo', 'agent', 'manual'].includes(m.analysis.mode)) fail('analysis.mode', 'must be demo, agent, or manual');
    text(m.analysis.scope, 'analysis.scope');
    if (!Number.isFinite(Date.parse(m.analysis.generatedAt))) fail('analysis.generatedAt', 'must be an ISO timestamp');
    list(m.analysis.limitations, 'analysis.limitations').forEach((x, i) => text(x, `analysis.limitations[${i}]`));
    if (m.analysis.commit !== undefined && !/^[a-f0-9]{40,64}$/.test(m.analysis.commit)) fail('analysis.commit', 'must be a Git commit hash');
  }
  const actors = list(m.actors, 'actors', 40), participants = list(m.participants, 'participants', 40);
  const evidence = list(m.evidence, 'evidence', 1000), cases = list(m.useCases, 'useCases', 100);
  const actorIds = ids(actors, 'actors'), participantIds = ids(participants, 'participants');
  const evidenceIds = ids(evidence, 'evidence'), caseIds = ids(cases, 'useCases');
  actors.forEach((x, i) => { if (obj(x)) text(x.name, `actors[${i}].name`); });
  participants.forEach((x, i) => {
    if (!obj(x)) return;
    text(x.name, `participants[${i}].name`);
    if (!['actor', 'component', 'database', 'external'].includes(x.kind)) fail(`participants[${i}].kind`, 'unknown participant kind');
  });
  evidence.forEach((x, i) => {
    if (!obj(x)) return;
    const p = `evidence[${i}]`;
    if (typeof x.path !== 'string' || !safeSourcePath(x.path)) fail(`${p}.path`, 'must be a safe relative source path');
    if (!Number.isInteger(x.startLine) || x.startLine < 1 || !Number.isInteger(x.endLine) || x.endLine < x.startLine || x.endLine - x.startLine > 200) fail(p, 'invalid line range (max 201 lines)');
    if (!/^[a-f0-9]{64}$/.test(x.sha256 || '')) fail(`${p}.sha256`, 'must be a SHA-256 file hash');
    if (x.snippet !== undefined && (typeof x.snippet !== 'string' || x.snippet.length > 30000)) fail(`${p}.snippet`, 'max 30000 characters');
    text(x.reason, `${p}.reason`);
  });
  const refs = (xs, set, p, nonempty = false) => {
    const arr = list(xs, p, 1000);
    if (nonempty && !arr.length) fail(p, 'must not be empty');
    arr.forEach(v => { if (!set.has(v)) fail(p, `unknown reference ${v}`); });
  };
  const claim = (x, p) => {
    if (!['observed', 'inferred'].includes(x.confidence)) fail(`${p}.confidence`, 'must be observed or inferred');
    refs(x.evidenceIds, evidenceIds, `${p}.evidenceIds`, x.confidence === 'observed');
    if (x.confidence === 'inferred') text(x.rationale, `${p}.rationale`);
  };
  cases.forEach((u, i) => {
    if (!obj(u)) return;
    const p = `useCases[${i}]`;
    text(u.name, `${p}.name`); text(u.goal, `${p}.goal`); claim(u, p);
    refs(u.actorIds, actorIds, `${p}.actorIds`, true);
    list(u.preconditions, `${p}.preconditions`).forEach(v => text(v, `${p}.preconditions`));
    list(u.postconditions, `${p}.postconditions`).forEach(v => text(v, `${p}.postconditions`));
    const scenarios = list(u.scenarios, `${p}.scenarios`, 20); ids(scenarios, `${p}.scenarios`);
    if (!scenarios.length) fail(`${p}.scenarios`, 'must contain at least one scenario');
    scenarios.forEach((s, j) => {
      if (!obj(s)) return;
      const q = `${p}.scenarios[${j}]`;
      text(s.name, `${q}.name`); text(s.outcome, `${q}.outcome`);
      const steps = list(s.steps, `${q}.steps`, 100); ids(steps, `${q}.steps`);
      if (!steps.length) fail(`${q}.steps`, 'must contain at least one step');
      steps.forEach((step, k) => {
        if (!obj(step)) return;
        const r = `${q}.steps[${k}]`;
        if (!participantIds.has(step.from) || !participantIds.has(step.to)) fail(r, 'unknown sequence participant');
        if (!['call', 'return', 'async'].includes(step.kind)) fail(`${r}.kind`, 'must be call, return, or async');
        text(step.label, `${r}.label`); text(step.description, `${r}.description`); claim(step, r);
      });
    });
  });
  list(m.relationships, 'relationships', 200).forEach((r, i) => {
    if (!obj(r)) { fail(`relationships[${i}]`, 'must be an object'); return; }
    if (!caseIds.has(r.from) || !caseIds.has(r.to) || r.from === r.to) fail(`relationships[${i}]`, 'must reference two different use cases');
    if (!['include', 'extend'].includes(r.kind)) fail(`relationships[${i}].kind`, 'must be include or extend');
    claim(r, `relationships[${i}]`);
  });
  return { valid: errors.length === 0, errors };
}

export function safeSourcePath(p) {
  if (typeof p !== 'string' || !p || p.includes('\\') || p.includes('\0') || p.startsWith('/') || /^[a-z]:/i.test(p)) return false;
  const parts = p.split('/');
  if (parts.some(x => !x || x === '.' || x === '..')) return false;
  return !parts.some(x => /^(\.env(?:\..*)?|\.git|node_modules|\.ssh|\.aws|\.npmrc|\.pypirc|credentials(?:\..*)?|secrets?(?:\..*)?|.*\.(?:pem|key|p12|pfx))$/i.test(x));
}
