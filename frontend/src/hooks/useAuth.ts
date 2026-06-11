/**
 * Auth context kısayol hook'u.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  return useContext(AuthContext);
};
