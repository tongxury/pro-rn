import { TouchableOpacity, Text, View } from "react-native";

interface ButtonProps {
  className?: string;
  appName: string;
}

export const Button = ({ className, appName }: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={() => alert(`Hello from your ${appName} app!`)}
    >
     <Text>xxxx</Text>
    </TouchableOpacity>
  );
};
