import { useEffect, useState } from 'react';
import api from '../services/api';

export function useProductData() {
  const [state, setState] = useState({ products: [], loading: true, error: null });
  useEffect(() => {
    const controller = new AbortController();
    api.get('/products', { params: { per_page: 100 }, signal: controller.signal })
      .then(response => {
        if (!controller.signal.aborted) setState({ products: response.data.data.data, loading: false, error: null });
      })
      .catch(error => {
        if (!controller.signal.aborted) setState({ products: [], loading: false, error: error.message });
      });
    return () => controller.abort();
  }, []);
  return state;
}
