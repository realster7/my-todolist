import '@testing-library/jest-dom';
import { afterEach } from 'vitest';

// authStore가 zustand persist(localStorage)를 쓰므로, 테스트 파일 간 상태 누수를 막기 위해
// 매 테스트 후 정리한다(jsdom의 localStorage는 워커 내 여러 테스트 파일이 공유할 수 있음).
afterEach(() => {
  localStorage.clear();
});
