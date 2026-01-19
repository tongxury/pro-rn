// CollapsibleSection.tsx
import React, { useState } from 'react';
import useTailwindVars from "@/hooks/useTailwindVars";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
 // Assuming this hook exists

interface CollapsibleSectionProps {
    title: string;
    level: number;
    content: string;
    markdownStyles: any; // The style object from the main component
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
                                                                   title,
                                                                   level,
                                                                   content,
                                                                   markdownStyles,
                                                               }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { colors } = useTailwindVars();

    const headingStyle = markdownStyles[`heading${level}`] || markdownStyles.heading1;
    const indicator = isCollapsed ? '▼' : '▲';

    return (
        <View style={{ marginBottom: 12 }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsCollapsed(!isCollapsed)}
                style={[styles.header, headingStyle]}
            >
                <Text style={headingStyle}>{title}</Text>
                <Text style={[styles.indicator, { color: colors.primary }]}>{indicator}</Text>
            </TouchableOpacity>

            {!isCollapsed && (
                <View style={styles.content}>
                    <Markdown style={markdownStyles}>
                        {content}
                    </Markdown>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    indicator: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    content: {
        paddingTop: 10,
        paddingLeft: 12, // Indent content slightly
        borderLeftWidth: 2,
        borderLeftColor: '#e0e0e0', // A neutral indent color
        marginLeft: 6,
    },
});

export default CollapsibleSection;
