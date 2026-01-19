import * as React from 'react';
import {useEffect, useRef, useState, useCallback} from 'react';
import {
    VirtualizedList,
    FlatListProps,
    ViewStyle,
    View,
    LayoutChangeEvent,
    ViewToken,
} from 'react-native';

export interface WaterFallListProps<ItemT> extends FlatListProps<ItemT> {
    getHeight: (n: ItemT, index: number) => number;
    listStyle?: ViewStyle | null;
    initialScrollY?: number;
    needItemLayout?: boolean;
}

interface Column<ItemT> {
    data: Array<ItemT>;
    index: number;
    totalHeight: number;
    heights: number[];
    dataIndexs: number[];
    offsets: number[];
}

function WaterFallList<ItemT>(props: WaterFallListProps<ItemT>) {
    const {
        data = [],
        numColumns = 1,
        getHeight,
        ListHeaderComponent,
        ListEmptyComponent,
        ListFooterComponent,
        listStyle,
        onEndReachedThreshold,
        onEndReached,
        contentContainerStyle,
        renderItem,
        needItemLayout = true,
        initialScrollY = 0,
        onViewableItemsChanged,
        onLayout,
        onScroll,
        onMomentumScrollBegin,
        onMomentumScrollEnd,
        onScrollBeginDrag,
        onScrollEndDrag,
        ...reset
    } = props;

    const scrollRef = useRef<VirtualizedList<ItemT> | null>(null);
    const [columns, setColumns] = useState<Column<ItemT>[]>([]);

    // 计算列数据 - 类似于 getDerivedStateFromProps
    useEffect(() => {
        const newColumns: Column<ItemT>[] = Array.from({
            length: numColumns,
        }).map((_, i) => ({
            index: i,
            totalHeight: 0,
            data: [],
            heights: [],
            dataIndexs: [],
            offsets: [],
        }));

        data.forEach((item, index) => {
            const _height = getHeight(item, index);
            const column = newColumns.reduce(
                (prev, cur) => (cur.totalHeight < prev.totalHeight ? cur : prev),
                newColumns[0],
            );

            column.data.push({
                ...item,
            });
            column.dataIndexs.push(index);
            column.offsets.push(column.totalHeight);
            column.heights.push(_height);
            column.totalHeight += _height;
        });

        setColumns(newColumns);
    }, [data, numColumns, getHeight]);

    const getItemCount = useCallback((data: ItemT[]) => (data && data.length) || 0, []);

    const getItem = useCallback((data: ItemT[], index: number) => data[index], []);

    const handleViewableItemsChanged = useCallback((
        info: {
            viewableItems: Array<ViewToken>;
            changed: Array<ViewToken>;
        },
        columnIndex: number,
    ) => {
        if (onViewableItemsChanged) {
            const {viewableItems, changed} = info;
            onViewableItemsChanged({
                viewableItems: viewableItems.map((viewToken) => ({
                    ...viewToken,
                    index: columns[columnIndex].dataIndexs[
                        viewToken.index as number
                        ],
                })),
                changed: changed.map((viewToken) => ({
                    ...viewToken,
                    index: columns[columnIndex].dataIndexs[
                        viewToken.index as number
                        ],
                })),
            });
        }
    }, [columns, onViewableItemsChanged]);

    const getItemLayout = useCallback((data: any, index: number, columnIndex: number) => {
        const columnData = columns[columnIndex];
        return {
            length: columnData.heights[index],
            offset: columnData.offsets[index],
            index,
        };
    }, [columns]);

    const handleLayout = useCallback((e: LayoutChangeEvent) => {
        if (initialScrollY && scrollRef.current) {
            scrollRef.current.scrollToOffset({
                offset: initialScrollY,
                animated: false,
            });
        }
        onLayout && onLayout(e);
    }, [initialScrollY, onLayout]);

    const renderWaterFall = useCallback(() => {
        // 空列表处理
        let emptyElement = null;
        if (ListEmptyComponent) {
            emptyElement = React.isValidElement(ListEmptyComponent)
                ? ListEmptyComponent
                : <ListEmptyComponent/>;
        }

        if (data === null || data.length === 0) {
            return emptyElement;
        }

        return (
            <View
                key="$container"
                style={[{flex: 1, flexDirection: 'row'}, listStyle]}>
                {columns.map((column, columnIndex) => (
                    <VirtualizedList
                        style={{flex: 1}}
                        {...reset}
                        renderItem={({item, index, ...params}) =>
                            renderItem({
                                item,
                                index: columns[columnIndex].dataIndexs[index],
                                ...params
                            })
                        }
                        getItem={getItem}
                        contentContainerStyle={{backgroundColor: 'green'}}
                        data={column.data}
                        key={`$column-${columnIndex}`}
                        listKey={`$column-${columnIndex}`}
                        getItemCount={getItemCount}
                        onScroll={() => {
                        }}
                        getItemLayout={needItemLayout ? (...p) => getItemLayout(p[0], p[1], columnIndex) : undefined}
                        onViewableItemsChanged={(e) =>
                            handleViewableItemsChanged(e, columnIndex)
                        }
                        initialScrollIndex={undefined}
                    />
                ))}
            </View>
        );
    }, [columns, data, getHeight, getItem, getItemCount, getItemLayout, handleViewableItemsChanged, listStyle, needItemLayout, renderItem, reset]);

    // 如果列表为空，则不显示底部组件
    const adjustedFooterComponent = (data == null || data.length === 0)
        ? undefined
        : ListFooterComponent;

    return (
        <VirtualizedList
            onLayout={handleLayout}
            ref={scrollRef}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={adjustedFooterComponent}
            showsVerticalScrollIndicator={false}
            data={[1]}
            renderItem={renderWaterFall}
            getItem={getItem}
            getItemCount={() => 1}
            extraData={columns}
            onScroll={onScroll}
            scrollEventThrottle={16}
            initialScrollIndex={undefined}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            onMomentumScrollBegin={onMomentumScrollBegin}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScrollBeginDrag={onScrollBeginDrag}
            contentContainerStyle={contentContainerStyle}
            onScrollEndDrag={onScrollEndDrag}
            keyExtractor={() => '1'}
        />
    );
}

export default WaterFallList;
