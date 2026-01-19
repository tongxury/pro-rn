import {FlatList, View, Text} from 'react-native';
import MediaView from './MediaView';
import React from 'react';
import {Stack} from 'react-native-flex-layout';
import {Resource} from '@/types';
import ExpandableText from "@/components/ui/ExpandableText";


const MediaTextGroupView = ({resources}: { resources: Resource[] }) => {

    const title = resources?.filter(x => x.category === 'title')?.[0];
    const desc = resources?.filter(x => x.category === 'description')?.[0];
    const topic = resources?.filter(x => x.category === 'topic')?.[0];
    const script = resources?.filter(x => x.category === 'script')?.[0];

    return (
        <Stack spacing={8}>
            <FlatList
                horizontal
                data={resources?.filter(x => !x.category)}
                ItemSeparatorComponent={() => <View className={'w-[10px] h-[10px]'}/>}
                showsHorizontalScrollIndicator={false}
                renderItem={({item: x, index}) => {
                    return <MediaView item={x} index={index + 1}/>;
                }}
            />

            {title && <ExpandableText maxLength={40} content={title?.content}
                                      className={'text-sm text-white'}></ExpandableText>}
            {/*{desc &&*/}
            {/*    <ExpandableText content={desc?.content} className={'text-sm text-grey1 mt-[8px]'}>*/}
            {/*    </ExpandableText>*/}
            {/*}*/}
            {topic &&
                <ExpandableText content={topic?.content} className={'text-sm text-grey1'}>
                </ExpandableText>
            }
            {script &&
                <ExpandableText maxLength={100} content={script?.content} className={'text-sm text-grey1'}>
                </ExpandableText>
            }
        </Stack>
    );
};

export default MediaTextGroupView;

