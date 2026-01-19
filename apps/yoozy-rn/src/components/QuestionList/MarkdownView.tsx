import React, {ReactNode} from "react";
import {ScrollView, Text, TextStyle, View, ViewStyle} from "react-native";
import type {RendererInterface} from "react-native-marked";
import Markdown, {Renderer} from "react-native-marked";
import useTailwindVars from "@/hooks/useTailwindVars";

interface MarkdownViewProps {
    text: string;
}

class CustomMarkdownRenderer extends Renderer implements RendererInterface {
    private colors: any;
    private fontSizes: any;

    constructor(colors: any, fontSizes: any) {
        super();
        this.colors = colors;
        this.fontSizes = fontSizes;
    }

    // 标题设计 - 清晰的层次和视觉重点
    heading(text: string | React.ReactNode[], styles?: TextStyle, depth?: number): React.ReactNode {
        switch (depth) {
            case 1: // H1 - 主标题，最醒目
                return (
                    <View key={this.getKey()} className={'mt-8 mb-6'}>
                        <View className={'bg-primary/10 rounded-xl p-6 border-l-4'}
                              style={{borderLeftColor: this.colors.primary}}>
                            <Text style={{
                                fontSize: this.fontSizes.fontSizeXL || 24,
                                fontWeight: '800',
                                color: this.colors.primary,
                                textAlign: 'center',
                                letterSpacing: 0.5,
                            }}>
                                {text}
                            </Text>
                        </View>
                    </View>
                );

            case 2: // H2 - 二级标题，重要章节
                return (
                    <View key={this.getKey()} className={'mt-6 mb-4'}>
                        <View className={'bg-background rounded-lg p-4 border-l-4'}
                              style={{borderLeftColor: this.colors.primary}}>
                            <Text style={{
                                fontSize: this.fontSizes.fontSizeLG || 20,
                                fontWeight: '700',
                                color: this."#ffffff",
                                letterSpacing: 0.3,
                            }}>
                                {text}
                            </Text>
                        </View>
                    </View>
                );

            case 3: // H3 - 三级标题，小节
                return (
                    <View key={this.getKey()} className={'mt-5 mb-3'}>
                        <View className={'bg-background rounded-lg p-4 border-l-4'}
                              style={{borderLeftColor: this.colors.primary + '80'}}>
                            <Text style={{
                                fontSize: this.fontSizes.fontSizeMD + 2 || 18,
                                fontWeight: '600',
                                color: this.colors.foreground,
                                letterSpacing: 0.2,
                            }}>
                                {text}
                            </Text>
                        </View>
                    </View>
                );

            default:
                return (
                    <Text key={this.getKey()} style={{
                        fontSize: this.fontSizes.fontSizeMD || 16,
                        fontWeight: '500',
                        color: this."#ffffff",
                        marginVertical: 8,
                    }}>
                        {text}
                    </Text>
                );
        }
    }

    // 加粗文字 - 突出重点内容
    strong(children: string | React.ReactNode[], styles?: TextStyle): React.ReactNode {
        return (
            <Text key={this.getKey()}
                  style={{
                      fontWeight: '800',
                      color: this.colors.primary,
                      fontSize: this.fontSizes.fontSizeMD,
                      lineHeight: this.fontSizes.fontSizeMD * 1.5,
                  }}>
                {children}
            </Text>
        );
    }

    // 段落 - 舒适的阅读体验
    paragraph(children: ReactNode[], styles?: ViewStyle): ReactNode {
        return (
            <View key={this.getKey()} className={'my-4'}>
                <Text style={{
                    color: this.colors['muted-foreground'] || this."#ffffff",
                    fontSize: this.fontSizes.fontSizeMD,
                    lineHeight: this.fontSizes.fontSizeMD * 1.6, // 增加行高提升阅读性
                    textAlign: 'justify',
                    letterSpacing: 0.1,
                }}>
                    {children}
                </Text>
            </View>
        );
    }

    // 代码块 - 专业的代码展示
    code(text: string, language?: string, containerStyle?: ViewStyle, textStyle?: TextStyle): React.ReactNode {
        return (
            <View key={this.getKey()} className={'my-6'}>
                {/* 代码内容 */}
                <ScrollView
                    horizontal
                    className={`bg-muted rounded-lg`}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        minWidth: '100%',
                    }}
                >
                    <Text style={{
                        fontFamily: 'monospace',
                        color: this.colors.foreground || this."#ffffff",
                        fontSize: this.fontSizes.fontSizeSM,
                        lineHeight: this.fontSizes.fontSizeSM * 1.4,
                        ...textStyle,
                    }}>
                        {text.trim()}
                    </Text>
                </ScrollView>
            </View>
        );
    }

    // 斜体文字
    em(children: string | React.ReactNode[], styles?: TextStyle): React.ReactNode {
        return (
            <Text key={this.getKey()} style={{
                fontStyle: 'italic',
                color: this.colors.foreground || this."#ffffff",
                ...styles,
            }}>
                {children}
            </Text>
        );
    }

    // 删除线文字
    del(children: string | React.ReactNode[], styles?: TextStyle): React.ReactNode {
        return (
            <Text key={this.getKey()} style={{
                textDecorationLine: 'line-through',
                color: this.colors['muted-foreground'] || '#999',
                opacity: 0.7,
                ...styles,
            }}>
                {children}
            </Text>
        );
    }

    // 水平分割线
    hr(styles?: ViewStyle): React.ReactNode {
        return (
            <View key={this.getKey()} className={''}>
                {/*<View*/}
                {/*    className={'h-px rounded-full'}*/}
                {/*    style={{*/}
                {/*        width: '60%',*/}
                {/*        backgroundColor: this.colors['muted-foreground'] + '60' || '#666',*/}
                {/*        ...styles,*/}
                {/*    }}*/}
                {/*/>*/}
            </View>
        );
    }

    // 链接
    link(children: string | React.ReactNode[], href: string, styles?: TextStyle): React.ReactNode {
        return (
            <Text key={this.getKey()} style={{
                color: this.colors.primary,
                textDecorationLine: 'underline',
                fontWeight: '500',
                ...styles,
            }}>
                🔗 {children}
            </Text>
        );
    }

    // 普通文本
    text(text: string | React.ReactNode[], styles?: TextStyle): React.ReactNode {
        return (
            <Text key={this.getKey()} style={{
                color: this."#ffffff",
                ...styles,
            }}>
                {text}
            </Text>
        );
    }

    // 换行
    br(): React.ReactNode {
        return <Text key={this.getKey()}>{'\n'}</Text>;
    }

    // 转义文本
    escape(text: string, styles?: TextStyle): React.ReactNode {
        return (
            <Text key={this.getKey()} style={styles}>
                {text}
            </Text>
        );
    }

    // HTML 内容
    html(text: string | React.ReactNode[], styles?: TextStyle): React.ReactNode {
        return (
            <Text key={this.getKey()} style={{
                color: this.colors['muted-foreground'],
                fontSize: this.fontSizes.fontSizeSM,
                ...styles,
            }}>
                {text}
            </Text>
        );
    }
}

const MarkdownView: React.FC<MarkdownViewProps> = ({text}) => {
    const {colors, fontSizes} = useTailwindVars();

    const customRenderer = React.useMemo(() =>
            new CustomMarkdownRenderer(colors, fontSizes),
        [colors, fontSizes]
    );

    if (!text) return null;

    return (
        <Markdown
            value={text}
            renderer={customRenderer}
            flatListProps={{
                style: {
                    // backgroundColor: colors.background,
                    paddingTop: 0,
                },
                initialNumToRender: 8,
                showsVerticalScrollIndicator: false,
            }}
        />
    );
};

export default MarkdownView;
