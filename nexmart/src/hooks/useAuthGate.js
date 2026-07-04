import { useEffect, useContext } from 'react';
import { AppCtx } from '../context/AppContext';

export default function useAuthGate(routeHash) {
  const { user, setAuthModal, setAuthRedirect } = useContext(AppCtx);

  useEffect(() => {
    if (!user) {
      setAuthRedirect(routeHash || window.location.hash);
      setAuthModal('login');
    }
  }, [user]);

  return !!user;
}
