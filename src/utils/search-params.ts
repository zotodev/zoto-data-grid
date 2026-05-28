import { useNavigate, useSearch } from "@tanstack/react-router"

type SetSearch<T> = (partial: T | Partial<T> | ((prevSearch: T) => T | Partial<T>)) => void

export default function useSearchParams() {
  const params = useSearch({ strict: false })
  type Search = typeof params

  const navigate = useNavigate()

  const setParams: SetSearch<Search> = (partial) => {
    void navigate({
      to: ".",
      search: (prev) => {
        const partialSearch = typeof partial === "function" ? partial(prev) : partial
        return { ...prev, ...partialSearch }
      }
    })
  }

  return [params, setParams] as const
}
