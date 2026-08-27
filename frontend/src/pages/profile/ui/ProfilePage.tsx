import { useNavigate } from 'react-router-dom';
import { Header } from '../../../shared/ui/Header';
import { EditProfileForm } from '../../../features/edit-profile/ui/EditProfileForm';
import { useAuthStore } from '../../../entities/user/model/authStore';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import './ProfilePage.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div>
      <Header userEmail={user.email} onLogout={handleLogout} />
      <div className="profile-page">
        <div className="profile-page__card">
          <h1 className="profile-page__title">{t('profile.title')}</h1>
          <EditProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
