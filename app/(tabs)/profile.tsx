import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LogOut, Settings, Award, ChartBar as BarChart3 } from 'lucide-react-native';

export default function ProfileScreen() {
  const [username, setUsername] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        const name = await AsyncStorage.getItem('childName');
        const age = await AsyncStorage.getItem('childAge');
        
        if (username) setUsername(username);
        if (name) setChildName(name);
        if (age) setChildAge(age);

        // Load scores
        const budgetScores = JSON.parse(await AsyncStorage.getItem('budgetGameScores') || '[]');
        const situationScores = JSON.parse(await AsyncStorage.getItem('situationGameScores') || '[]');
        const memoryScores = JSON.parse(await AsyncStorage.getItem('memoryGameScores') || '[]');

        // Calculate total score
        const budgetTotal = budgetScores.reduce((sum: number, item: any) => sum + item.score, 0);
        const situationTotal = situationScores.reduce((sum: number, item: any) => sum + item.score, 0);
        const memoryTotal = memoryScores.reduce((sum: number, item: any) => sum + item.score, 0);
        
        setTotalScore(budgetTotal + situationTotal + memoryTotal);
        
        // Calculate badges based on games played and scores
        const badgeCount = calculateBadges(budgetScores, situationScores, memoryScores);
        setBadgeCount(badgeCount);
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfile();
  }, []);

  const calculateBadges = (budgetScores: any[], situationScores: any[], memoryScores: any[]) => {
    let count = 0;
    
    // Starter badges (one for each game played)
    if (budgetScores.length > 0) count++;
    if (situationScores.length > 0) count++;
    if (memoryScores.length > 0) count++;
    
    // Achievement badges (based on score thresholds)
    const budgetHighScore = budgetScores.length > 0 
      ? Math.max(...budgetScores.map((item: any) => item.score))
      : 0;
    
    const situationHighScore = situationScores.length > 0
      ? Math.max(...situationScores.map((item: any) => item.score))
      : 0;
    
    const memoryHighScore = memoryScores.length > 0
      ? Math.max(...memoryScores.map((item: any) => item.score))
      : 0;
    
    // Add badges for high scores in each game
    if (budgetHighScore >= 80) count++;
    if (situationHighScore >= 80) count++;
    if (memoryHighScore >= 80) count++;
    
    // Add badge for playing all games
    if (budgetScores.length > 0 && situationScores.length > 0 && memoryScores.length > 0) {
      count++;
    }
    
    return count;
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1270076/pexels-photo-1270076.jpeg' }}
          style={styles.profileImage}
        />
        <Text style={styles.childName}>{childName}</Text>
        <Text style={styles.childDetails}>Age: {childAge} • Username: {username}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalScore}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{badgeCount}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Award size={20} color="#4A7BF7" />
          <Text style={styles.sectionTitle}>Badges</Text>
        </View>

        <View style={styles.badgeGrid}>
          {Array(badgeCount).fill(0).map((_, index) => (
            <View key={index} style={styles.badgeItem}>
              <View style={[styles.badge, { backgroundColor: badgeColors[index % badgeColors.length] }]}>
                <Text style={styles.badgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.badgeName}>{badgeNames[index % badgeNames.length]}</Text>
            </View>
          ))}
          
          {/* Empty badge placeholders */}
          {Array(Math.max(0, 8 - badgeCount)).fill(0).map((_, index) => (
            <View key={`empty-${index}`} style={styles.badgeItem}>
              <View style={styles.emptyBadge}>
                <Text style={styles.emptyBadgeText}>?</Text>
              </View>
              <Text style={styles.emptyBadgeName}>Locked</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <BarChart3 size={20} color="#4A7BF7" />
          <Text style={styles.sectionTitle}>Progress</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Budget Game</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(100, totalScore/3)}%`, backgroundColor: '#4A7BF7' }]} />
            </View>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Situation Game</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(100, totalScore/4)}%`, backgroundColor: '#2ED573' }]} />
            </View>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Memory Game</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(100, totalScore/5)}%`, backgroundColor: '#FF9F43' }]} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const badgeColors = ['#4A7BF7', '#2ED573', '#FF9F43', '#A78BFA', '#F87171', '#60A5FA', '#34D399', '#FBBF24'];
const badgeNames = ['Beginner', 'Explorer', 'Achiever', 'Champion', 'Master', 'Expert', 'Genius', 'Legend'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  childName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 4,
  },
  childDetails: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginLeft: 8,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  badgeName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#1E293B',
    textAlign: 'center',
  },
  emptyBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#E2E8F0',
  },
  emptyBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#94A3B8',
  },
  emptyBadgeName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});