import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, StyleSheet } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { apiFetch } from "@/lib/api";
import { theme } from "@/lib/theme";

interface Order { id: string; reference: string; status: string; createdAt: string }

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ orders: Order[] }>("/api/mobile/orders");
      setOrders(data.orders);
    } catch {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: theme.spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={orders}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.title}>Vos commandes</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Aucune commande.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/(app)/orders/${item.id}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.reference}</Text>
              <Text style={styles.cardMeta}>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</Text>
            </View>
            <Text style={styles.badge}>{item.status}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  title: { fontSize: 22, fontWeight: "700", color: theme.colors.text, marginBottom: theme.spacing.lg },
  empty: { color: theme.colors.textMuted, fontSize: 13 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 14, fontWeight: "600", color: theme.colors.text },
  cardMeta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  badge: { fontSize: 12, fontWeight: "600", color: theme.colors.textMuted },
});
