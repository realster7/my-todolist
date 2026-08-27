import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { updateProfile } from '../api/updateProfile';
import { isApiError } from '../../../shared/lib/apiError';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import { useAuthStore } from '../../../entities/user/model/authStore';
import type { User } from '../../../entities/user/model/types';
import './EditProfileForm.css';

interface EditProfileFormProps {
  user: User;
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const updateStoredUser = useAuthStore((state) => state.updateUser);
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(undefined);

    const nameChanged = name.trim() && name !== user.name;
    if (!nameChanged && !password) {
      setFormError(t('profile.requiredError'));
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateProfile({
        name: nameChanged ? name : undefined,
        password: password || undefined,
      });
      updateStoredUser(updated);
      navigate('/todos');
    } catch (err) {
      setFormError(isApiError(err) ? err.message : t('profile.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="edit-profile-form" noValidate>
      {formError && (
        <p className="edit-profile-form__error" role="alert">
          {formError}
        </p>
      )}
      <Input label={t('field.email')} type="email" value={user.email} readOnly />
      <Input
        label={t('field.name')}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label={t('profile.newPassword')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
      />
      <div className="edit-profile-form__actions">
        <Button type="button" variant="secondary" onClick={() => navigate('/todos')} disabled={isSubmitting}>
          {t('profile.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {t('profile.save')}
        </Button>
      </div>
    </form>
  );
}
