import { useColors } from "@/hooks/uesColors";
import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Text } from "react-native";

export default function SquareProgressBar() {
  const { primary } = useColors();
  const size = 104;
  const strokeWidth = 5;

  // 创建四个动画值，分别对应四个边框
  const topProgress = useRef(new Animated.Value(0)).current;
  const rightProgress = useRef(new Animated.Value(0)).current;
  const bottomProgress = useRef(new Animated.Value(0)).current;
  const leftProgress = useRef(new Animated.Value(0)).current;

  // 总进度（0-100）
  const [overallProgress, setOverallProgress] = React.useState(0);

  useEffect(() => {
    // 停止所有动画
    topProgress.stopAnimation();
    rightProgress.stopAnimation();
    bottomProgress.stopAnimation();
    leftProgress.stopAnimation();

    // 重置所有值
    topProgress.setValue(0);
    rightProgress.setValue(0);
    bottomProgress.setValue(0);
    leftProgress.setValue(0);

    // 创建四个动画
    const topAnim = Animated.timing(topProgress, {
      toValue: 1,
      duration: 15000, // 每个边框15秒
      useNativeDriver: false,
    });

    const rightAnim = Animated.timing(rightProgress, {
      toValue: 1,
      duration: 15000,
      delay: 0, // 延迟15秒开始
      useNativeDriver: false,
    });

    const bottomAnim = Animated.timing(bottomProgress, {
      toValue: 1,
      duration: 15000,
      delay: 0, // 延迟30秒开始
      useNativeDriver: false,
    });

    const leftAnim = Animated.timing(leftProgress, {
      toValue: 1,
      duration: 15000,
      delay: 0, // 延迟45秒开始
      useNativeDriver: false,
    });

    // 启动动画序列
    Animated.sequence([topAnim, rightAnim, bottomAnim, leftAnim]).start();

    // 更新总进度
    const interval = setInterval(() => {
      setOverallProgress((prev) => {
        const next = prev + 0.25; // 每250毫秒增加0.25%
        return next > 100 ? 100 : next;
      });
    }, 600); // 60000毫秒(60秒) / 100 = 每600毫秒增加1%

    // 清理函数
    return () => {
      topAnim.stop();
      rightAnim.stop();
      bottomAnim.stop();
      leftAnim.stop();
      clearInterval(interval);
    };
  }, []);

  // 计算每个边框的动画值
  const topWidth = topProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size],
  });

  const rightHeight = rightProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size],
  });

  const bottomWidth = bottomProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size],
  });

  const leftHeight = leftProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.progressContainer, { width: size, height: size }]}>
        {/* 顶部边框 */}
        <Animated.View
          style={[
            styles.border,
            styles.topBorder,
            {
              backgroundColor: primary,
              width: topWidth,
              height: strokeWidth,
            },
          ]}
        />

        {/* 右侧边框 */}
        <Animated.View
          style={[
            styles.border,
            styles.rightBorder,
            {
              backgroundColor: primary,
              width: strokeWidth,
              height: rightHeight,
            },
          ]}
        />

        {/* 底部边框 */}
        <Animated.View
          style={[
            styles.border,
            styles.bottomBorder,
            {
              backgroundColor: primary,
              width: bottomWidth,
              height: strokeWidth,
            },
          ]}
        />

        {/* 左侧边框 */}
        <Animated.View
          style={[
            styles.border,
            styles.leftBorder,
            {
              backgroundColor: primary,
              width: strokeWidth,
              height: leftHeight,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  progressContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  border: {
    position: "absolute",
    backgroundColor: "#3b82f6",
  },
  topBorder: {
    top: 0,
    left: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  rightBorder: {
    top: 0,
    right: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  bottomBorder: {
    bottom: 0,
    right: 0,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  leftBorder: {
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 20,
  },
  progressText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
});
