import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface Incident {
  id: string;
  created_at: string;
  type: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function IncidentsScreen() {
  const incidents: Incident[] = []; // We'll add Supabase integration later

  const renderIncident = ({ item }: { item: Incident }) => (
    <Card 
      style={styles.card} 
      onPress={() => router.push({
        pathname: '/incidents/[id]',
        params: { id: item.id }
      })}
    >
      <Card.Content>
        <Text variant="titleMedium">
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text variant="bodyMedium">Type: {item.type}</Text>
        <Text variant="bodyMedium">Status: {item.status}</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => router.push({
          pathname: '/incidents/[id]',
          params: { id: item.id }
        })}>
          View Details
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {incidents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text>No incidents reported</Text>
          </View>
        ) : (
          <FlatList
            data={incidents}
            renderItem={renderIncident}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
          />
        )}
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
});