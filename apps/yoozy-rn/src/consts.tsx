import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


export const aspectRatioConfig: Record<string, string> = {
    '21:9': '21:9',
    '16:9': '16:9',
    '4:3': '4:3',
    '1:1': '1:1',
    '3:4': '3:4',
    '9:16': '9:16'
}

export const workflowConfig: Record<string, any> = {
    'VideoReplication': {
        label: '视频复刻',
    },
    'VideoReplication2': {
        label: '视频复刻',
    },
    'VideoGeneration': {
        label: '创意视频生成',
    },
    'videoGeneration': {
        label: '创意视频生成',
    },
    status: {
        running: {
            name: '运行中',
            color: '#3B82F6', // blue-500
            bg: '#EFF6FF' // blue-50
        },
        completed: {
            name: '完成',
            color: '#10B981', // green-500
            bg: '#ECFDF5' // green-50
        },
        canceled: {
            name: '已取消',
            color: '#9CA3AF', // gray-400
            bg: '#F9FAFB' // gray-50
        }
    }
}

export const assetWorkflowJobConfig: Record<string, any> = {
    videoGenerationJob: {
        label: '视频生成',
        icon: (color: string) => <Entypo name="video" size={20} color={color} />,
        status: {
            waiting: {
                name: '视频生成等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '视频生成运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '视频生成确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '视频生成完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'videoGenerations'
    },
    keyFramesGenerationJob: {
        label: '关键帧生成',
        icon: (color: string) => <FontAwesome6 name="images" size={22} color={color} />, status: {
            waiting: {
                name: '关键帧生成等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '关键帧生成运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '关键帧生成确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '关键帧生成完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'keyFrames'
    },
    segmentScriptJob: {
        label: '片段脚本生成',
        icon: (color: string) => <MaterialCommunityIcons name="script-text" size={24} color={color} />, status: {
            waiting: {
                name: '片段脚本生成等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '片段脚本生成运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '片段脚本生成确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '片段脚本生成完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'segmentScript'
    },
    
    videoSegmentsGenerationJob: {
        label: '片段复刻',
        icon: (color: string) => <MaterialIcons name="subscriptions" size={24} color={color} />, status: {
            waiting: {
                name: '片段复刻等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '片段复刻运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '片段复刻确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '片段复刻完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'videoGenerations'
    },
    videoSegmentsRemixJob: {
        label: '片段混剪',
        icon: (color: string) => <Entypo name="video" size={24} color={color} />, status: {
            waiting: {
                name: '片段混剪等待中',
                color: 'text-gray-500',
                bg: 'bg-gray-50'
            },
            running: {
                name: '片段混剪运行中',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            confirming: {
                name: '片段混剪确认中',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
            },
            completed: {
                name: '片段混剪完成',
                color: 'text-green-500',
                bg: 'bg-green-50'
            },
        },
        dataKey: 'segmentsRemix'
    }
}
