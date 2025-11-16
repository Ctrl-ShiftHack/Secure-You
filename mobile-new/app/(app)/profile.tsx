import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Avatar.Icon size={80} icon="account" />
          <Text variant="headlineSmall" style={styles.name}>
            John Doe
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            john@example.com
          </Text>
        </View>

        <View style={styles.section}>
          <Button
            mode="outlined"
            icon="cog"
            onPress={() => {}}
            style={styles.button}
          >
            Settings
          </Button>
          <Button
            mode="outlined"
            icon="shield"
            onPress={() => {}}
            style={styles.button}
          >
            Privacy
          </Button>
          <Button
            mode="outlined"
            icon="help-circle"
            onPress={() => {}}
            style={styles.button}
          >
            Help
          </Button>
          <Button
            mode="contained"
            icon="logout"
            onPress={() => {}}
            style={[styles.button, styles.logoutButton]}
          >
            Logout
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  name: {
    marginTop: 10,
  },
  email: {
    opacity: 0.6,
  },
  section: {
    marginTop: 20,
  },
  button: {
    marginVertical: 5,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff0000',
  },
});