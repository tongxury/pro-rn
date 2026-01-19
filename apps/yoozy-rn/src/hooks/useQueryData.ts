import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";

export function useQueryData<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
    const query = useQuery(options);
    const data = (query.data as any)?.data?.data;
    return { ...query, data };
}
