import { Tabs } from 'expo-router';
import { Chrome as Home, ShoppingBag, MessageSquare, Brain, User } from 'lucide-react-native';
import { View, Text, StyleSheet } from 'react-native';

function TabBarIcon({ icon: Icon, color }: { icon: any; color: string }) {
  return <Icon size={24} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4A7BF7',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon icon={Home} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget-game"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color }) => <TabBarIcon icon={ShoppingBag} color={color} />,
        }}
      />
      <Tabs.Screen
        name="situation-game"
        options={{
          title: 'Situations',
          tabBarIcon: ({ color }) => <TabBarIcon icon={MessageSquare} color={color} />,
        }}
      />
      <Tabs.Screen
        name="memory-game"
        options={{
          title: 'Memory',
          tabBarIcon: ({ color }) => <TabBarIcon icon={Brain} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon icon={User} color={color} />,
        }}
      />
    </Tabs>
  );
}