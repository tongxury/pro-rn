import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Image,
  Pressable,
} from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useMemo, useCallback } from "react";
import useDateFormatter from "@/hooks/useDateFormatter";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { listSessions } from "@/api/session";
import { router } from "expo-router";

const CARD_BASE =
  "mx-4 mb-4 rounded-3xl overflow-hidden bg-background bg-surface shadow-soft";

function SessionList() {
  const { formatToNow } = useDateFormatter();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["sessions"],
    queryFn: ({ pageParam }) => listSessions({ page: pageParam, size: 20 }),
    refetchOnWindowFocus: false,
    getNextPageParam: ({ data: pageData }) =>
      pageData?.data?.hasMore ? pageData.data.page + 1 : undefined,
  });

  const sessions = useMemo(
    () => data?.pages.flatMap((page) => page?.data?.data?.list ?? []) ?? [],
    [data]
  );

  const renderSkeleton = useCallback(
    () => (
      <View className={`${CARD_BASE} p-5`}>
        <View className="flex-row gap-5 mb-5">
          <SkeletonLoader
            width={112}
            height={140}
            style={{ borderRadius: 24 }}
          />
          <View className="flex-1 gap-3">
            <SkeletonLoader
              width="85%"
              height={20}
              style={{ borderRadius: 10 }}
            />
            <SkeletonLoader
              width="55%"
              height={16}
              style={{ borderRadius: 8 }}
            />
            <SkeletonLoader
              width="40%"
              height={16}
              style={{ borderRadius: 8 }}
            />
            <View className="flex-row gap-2 mt-3">
              <SkeletonLoader
                width={70}
                height={24}
                style={{ borderRadius: 12 }}
              />
              <SkeletonLoader
                width={70}
                height={24}
                style={{ borderRadius: 12 }}
              />
            </View>
          </View>
        </View>
        <View className="h-px bg-border/60 mb-4" />
        <View className="flex-row justify-between">
          <SkeletonLoader width={90} height={14} style={{ borderRadius: 7 }} />
          <SkeletonLoader width={60} height={14} style={{ borderRadius: 7 }} />
        </View>
      </View>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const { commodity, script, createdAt, status } = item;
      const fallbackTitle = commodity?.title || "-";
      const fallbackBrand = commodity?.brand || "-";
      const primaryImage = commodity?.images?.[0];

      const getStatusBadge = (status: string) => {
        if (status === "failed") {
          return (
            <View
              className={`px-3 py-1 rounded-full bg-error/10 border border-error/20`}
            >
              <Text className="text-xs text-error tracking-wide">处理失败</Text>
            </View>
          );
        }
        if (status === "scriptGenerated") {
          return null;
        }

        return (
          <View
            className={`px-3 py-1 rounded-full bg-warning/10 border border-warning/20`}
          >
            <Text className="text-xs text-warning tracking-wide">处理中</Text>
          </View>
        );
      };

      return (
        <Pressable
          onPress={() => router.navigate(`/session/${item._id}`)}
          className={`${CARD_BASE} active:scale-[0.995]`}
        >
          <View className="p-3">
            <View className="flex-row gap-5 mb-5">
              <View className="w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                {primaryImage ? (
                  <Image
                    source={{ uri: primaryImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center">
                    <Text className="text-3xl text-disabled">📦</Text>
                  </View>
                )}
              </View>

              <View className="flex-1">
                <Text
                  className="text-foreground text-lg font-semibold leading-6 mb-1"
                  numberOfLines={2}
                >
                  {fallbackTitle}
                </Text>
                <Text className="text-muted-foreground text-sm mb-3" numberOfLines={1}>
                  {fallbackBrand}
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  {getStatusBadge(item.status)}
                  {script?.style ? (
                    <View className="px-3 py-1 rounded-full bg-primary/10 border border-primary/5">
                      <Text
                        className="text-xs text-primary font-medium"
                        numberOfLines={1}
                      >
                        {script.style}
                      </Text>
                    </View>
                  ) : null}
                  {script?.sceneStyle ? (
                    <View className="px-3 py-1 rounded-full bg-primary/10 border border-primary/5">
                      <Text
                        className="text-xs text-primary font-medium"
                        numberOfLines={1}
                      >
                        {script.sceneStyle}
                      </Text>
                    </View>
                  ) : null}
                  {script?.segments?.length ? (
                    <View className="px-3 py-1 rounded-full bg-primary/10 border border-primary/5">
                      <Text className="text-xs text-primary font-medium">
                        {script.segments.length} 段
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-muted-foreground text-base">
                {createdAt ? formatToNow(createdAt * 1000) : "未知时间"}
              </Text>
              <TouchableOpacity
                onPress={() => router.navigate(`/session/${item._id}`)}
                className="px-4 py-1.5 rounded-full"
              >
                <Text className="text-base font-semibold text-primary">
                  查看详情
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      );
    },
    [formatToNow]
  );

  return (
    <View className="flex-1">
      {isLoading ? (
        <FlatList
          data={Array(5).fill(null)}
          renderItem={renderSkeleton}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingVertical: 24 }}
        />
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          onEndReached={() =>
            hasNextPage && !isFetchingNextPage && fetchNextPage()
          }
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={refetch}
          contentContainerStyle={{ paddingVertical: 24 }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-32 px-6">
              <View className="w-16 h-16 items-center justify-center rounded-full bg-primary/10 mb-5">
                <Text className="text-3xl">📋</Text>
              </View>
              <Text className="text-lg font-semibold text-foreground mb-1">
                暂无会话
              </Text>
              <Text className="text-sm text-muted-foreground mb-6 text-center">
                创建第一个会话开始使用
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                className="px-8 py-3 rounded-full bg-primary"
              >
                <Text className="text-plain font-semibold text-sm">重试</Text>
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-6">
                <SkeletonLoader width="60%" height={16} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

export default SessionList;
