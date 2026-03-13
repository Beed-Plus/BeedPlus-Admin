import { useApiCall } from './useApiCall'
import { countriesApi } from '../utils/countriesApi'

export function useCountries() {
  const getCountries   = useApiCall(countriesApi.getCountries)
  const getCountryById = useApiCall(countriesApi.getCountryById)
  const createCountry  = useApiCall(countriesApi.createCountry)
  const updateCountry  = useApiCall(countriesApi.updateCountry)
  const deleteCountry  = useApiCall(countriesApi.deleteCountry)
  const suspendCountry = useApiCall(countriesApi.suspendCountry)
  const activateCountry = useApiCall(countriesApi.activateCountry)

  return {
    getCountries,
    getCountryById,
    createCountry,
    updateCountry,
    deleteCountry,
    suspendCountry,
    activateCountry,
  }
}
