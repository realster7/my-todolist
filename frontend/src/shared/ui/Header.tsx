import './Header.css';

export interface HeaderProps {
  userEmail?: string;
  onLogout?: () => void;
}

export function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <header className="app-header">
      <span className="app-header__logo">TodoList</span>
      {userEmail && (
        <nav className="app-header__nav">
          <a href="/profile" className="app-header__link">
            내 정보
          </a>
          <button type="button" className="app-header__link app-header__link--button" onClick={onLogout}>
            로그아웃
          </button>
        </nav>
      )}
    </header>
  );
}
