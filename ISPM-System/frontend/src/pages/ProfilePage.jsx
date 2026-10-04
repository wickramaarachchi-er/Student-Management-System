import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_LABELS } from '../utils/roles.js';
import { changePasswordRequest } from '../services/auth.service.js';
import Icon from '../components/common/Icon.jsx';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const role = ROLE_LABELS[user?.role] || 'User';
  const initials = `${user?.firstName?.[0] || 'U'}${user?.lastName?.[0] || ''}`;

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setFeedback(null);
    const { currentPassword, newPassword, confirmPassword } = passwords;
    let error;
    if (newPassword.length < 8) error = 'New password must be at least 8 characters long.';
    else if (new TextEncoder().encode(newPassword).length > 72) error = 'New password must be no more than 72 UTF-8 bytes.';
    else if (newPassword !== confirmPassword) error = 'New passwords do not match.';
    else if (newPassword === currentPassword) error = 'Choose a new password different from your current password.';
    if (error) {
      setFeedback({ type: 'error', message: error });
      return;
    }
    setSaving(true);
    try {
      const { ok, data } = await changePasswordRequest(currentPassword, newPassword, confirmPassword);
      if (ok) {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswords(false);
        setFeedback({ type: 'success', message: data?.message || 'Your password has been changed successfully.' });
      } else {
        setFeedback({ type: 'error', message: data?.message || 'Unable to change your password. Please try again.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Unable to connect to the server. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="profile-page">
      <header className="profile-heading"><span className="profile-eyebrow">ACCOUNT SETTINGS</span><h1>My Profile</h1><p>View your account details and manage your password.</p></header>
      <div className="profile-grid">
        <section className="profile-card" aria-labelledby="account-title">
          <div className="profile-identity"><span className="profile-avatar" aria-hidden="true">{initials}</span><h2 id="account-title">{fullName}</h2><span className="profile-role">{role}</span></div>
          <dl className="profile-details">
            {[
              ['Email address', user?.email], ['Department', user?.department],
              ['Phone number', user?.phone], ['Account status', user?.isActive ? 'Active' : 'Inactive'],
              ['Member since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null],
            ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}
          </dl>
        </section>
        <section className="profile-card profile-security" aria-labelledby="password-title">
          <div className="profile-section-heading"><span className="profile-lock"><Icon name="lock" /></span><div><h2 id="password-title">Change password</h2><p>Keep your account secure with a strong password.</p></div></div>
          <form onSubmit={handleSubmit} aria-busy={saving}>
            {feedback && <div className={`profile-feedback ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.message}</div>}
            <fieldset disabled={saving}>
              {[
                ['currentPassword', 'Current password', 'current-password'],
                ['newPassword', 'New password', 'new-password'],
                ['confirmPassword', 'Confirm new password', 'new-password'],
              ].map(([name, label, autoComplete]) => <div className="profile-field" key={name}>
                <label htmlFor={name}>{label}</label>
                <input id={name} name={name} type={showPasswords ? 'text' : 'password'} autoComplete={autoComplete} required
                  minLength={name === 'currentPassword' ? 1 : 8} maxLength={name === 'currentPassword' ? 200 : 72}
                  value={passwords[name]} aria-describedby={name === 'newPassword' ? 'password-hint' : undefined}
                  onChange={(event) => { setPasswords((previous) => ({ ...previous, [name]: event.target.value })); setFeedback(null); }} />
                {name === 'newPassword' && <small id="password-hint">Use at least 8 characters. Maximum 72 UTF-8 bytes.</small>}
              </div>)}
              <label className="profile-show-password"><input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} />Show passwords</label>
              <div className="profile-form-footer"><button type="submit">{saving ? 'Updating password...' : 'Update password'}</button></div>
            </fieldset>
          </form>
        </section>
      </div>
    </section>
  );
}
