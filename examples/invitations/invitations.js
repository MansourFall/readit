export async function inviteMember(actor, email, directory, mailer) {
  if (actor.role !== 'admin') return { status: 403, error: 'Forbidden' };
  if (!email.includes('@')) return { status: 400, error: 'Invalid email' };
  if (await directory.find(email)) return { status: 409, error: 'Already invited' };
  const invite = await directory.save({ email, state: 'pending' });
  try {
    await mailer.send(email, invite.id);
    return { status: 201, invite };
  } catch {
    await directory.remove(invite.id);
    return { status: 502, error: 'Delivery failed' };
  }
}
